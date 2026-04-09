terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.5"
    }
  }
}

locals {
  bucket_name = "${replace(var.domain, ".", "-")}-site"
  site_files  = fileset(var.site_build_dir, "**")
  mime_types = {
    css   = "text/css; charset=utf-8"
    html  = "text/html; charset=utf-8"
    ico   = "image/x-icon"
    jpg   = "image/jpeg"
    jpeg  = "image/jpeg"
    js    = "application/javascript; charset=utf-8"
    json  = "application/json; charset=utf-8"
    map   = "application/json; charset=utf-8"
    png   = "image/png"
    svg   = "image/svg+xml"
    txt   = "text/plain; charset=utf-8"
    webp  = "image/webp"
    xml   = "application/xml; charset=utf-8"
  }
}

data "aws_caller_identity" "current" {}

data "archive_file" "contact_lambda" {
  type        = "zip"
  source_dir  = var.contact_lambda_dir
  output_path = "${path.root}/.terraform/contact-api.zip"
}

data "archive_file" "trading212_lambda" {
  type        = "zip"
  source_dir  = var.trading212_lambda_dir
  output_path = "${path.root}/.terraform/trading212-api.zip"
}

resource "aws_ses_domain_identity" "contact" {
  domain = var.domain
}

resource "aws_route53_record" "ses_verification" {
  zone_id = var.zone_id
  name    = "_amazonses.${var.domain}"
  type    = "TXT"
  ttl     = 300
  records = [aws_ses_domain_identity.contact.verification_token]
}

resource "aws_ses_domain_identity_verification" "contact" {
  domain     = aws_ses_domain_identity.contact.id
  depends_on = [aws_route53_record.ses_verification]
}

resource "aws_ses_domain_dkim" "contact" {
  domain = aws_ses_domain_identity.contact.domain
}

resource "aws_route53_record" "ses_dkim" {
  count   = 3
  zone_id = var.zone_id
  name    = "${aws_ses_domain_dkim.contact.dkim_tokens[count.index]}._domainkey.${var.domain}"
  type    = "CNAME"
  ttl     = 300
  records = ["${aws_ses_domain_dkim.contact.dkim_tokens[count.index]}.dkim.amazonses.com"]
}

resource "aws_s3_bucket" "site" {
  bucket = local.bucket_name
}

resource "aws_s3_bucket_public_access_block" "site" {
  bucket                  = aws_s3_bucket.site.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_ownership_controls" "site" {
  bucket = aws_s3_bucket.site.id

  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_cloudfront_origin_access_control" "site" {
  name                              = "${replace(var.domain, ".", "-")}-oac"
  description                       = "Restrict S3 access to CloudFront"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_cache_policy" "static" {
  name        = "${replace(var.domain, ".", "-")}-static-cache"
  comment     = "Cache policy for static website assets"
  default_ttl = 3600
  max_ttl     = 31536000
  min_ttl     = 0

  parameters_in_cache_key_and_forwarded_to_origin {
    cookies_config {
      cookie_behavior = "none"
    }

    headers_config {
      header_behavior = "none"
    }

    query_strings_config {
      query_string_behavior = "none"
    }
  }
}

resource "aws_cloudfront_cache_policy" "api" {
  name        = "${replace(var.domain, ".", "-")}-api-cache"
  comment     = "Disable edge caching for API responses"
  default_ttl = 0
  max_ttl     = 0
  min_ttl     = 0

  parameters_in_cache_key_and_forwarded_to_origin {
    cookies_config {
      cookie_behavior = "none"
    }

    headers_config {
      header_behavior = "none"
    }

    query_strings_config {
      query_string_behavior = "none"
    }
  }
}

resource "aws_cloudfront_origin_request_policy" "api" {
  name    = "${replace(var.domain, ".", "-")}-api-origin-request"
  comment = "Forward API request details to the origin"

  cookies_config {
    cookie_behavior = "none"
  }

  headers_config {
    header_behavior = "none"
  }

  query_strings_config {
    query_string_behavior = "all"
  }
}

resource "aws_iam_role" "lambda" {
  name = "${replace(var.domain, ".", "-")}-website-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_basic" {
  role       = aws_iam_role.lambda.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy" "lambda_ses_send" {
  name = "${replace(var.domain, ".", "-")}-website-lambda-ses-send"
  role = aws_iam_role.lambda.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowSesSendFromVerifiedIdentities"
        Effect = "Allow"
        Action = [
          "ses:SendEmail"
        ]
        Resource = [
          "arn:aws:ses:${var.aws_region}:${data.aws_caller_identity.current.account_id}:identity/${var.contact_email_from}",
          "arn:aws:ses:${var.aws_region}:${data.aws_caller_identity.current.account_id}:identity/${var.domain}"
        ]
      }
    ]
  })
}

resource "aws_lambda_function" "contact" {
  function_name    = "${replace(var.domain, ".", "-")}-contact"
  role             = aws_iam_role.lambda.arn
  runtime          = "nodejs20.x"
  handler          = "index.handler"
  filename         = data.archive_file.contact_lambda.output_path
  source_code_hash = data.archive_file.contact_lambda.output_base64sha256
  timeout          = 15
  memory_size      = 256

  environment {
    variables = {
      CONTACT_EMAIL_FROM   = var.contact_email_from
      CONTACT_EMAIL_TO     = var.contact_email_to
      RECAPTCHA_SECRET_KEY = var.recaptcha_secret_key
    }
  }
}

resource "aws_lambda_function" "trading212" {
  function_name    = "${replace(var.domain, ".", "-")}-trading212"
  role             = aws_iam_role.lambda.arn
  runtime          = "nodejs20.x"
  handler          = "index.handler"
  filename         = data.archive_file.trading212_lambda.output_path
  source_code_hash = data.archive_file.trading212_lambda.output_base64sha256
  timeout          = 29
  memory_size      = 256

  environment {
    variables = {
      T212_API_KEY    = var.t212_api_key
      T212_API_SECRET = var.t212_api_secret
      T212_USD_GBP    = var.t212_usd_gbp
    }
  }
}

resource "aws_apigatewayv2_api" "website" {
  name          = "${replace(var.domain, ".", "-")}-http-api"
  protocol_type = "HTTP"
}

resource "aws_apigatewayv2_stage" "website" {
  api_id      = aws_apigatewayv2_api.website.id
  name        = "live"
  auto_deploy = true
}

resource "aws_apigatewayv2_integration" "contact" {
  api_id                 = aws_apigatewayv2_api.website.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.contact.invoke_arn
  integration_method     = "POST"
  payload_format_version = "2.0"
  timeout_milliseconds   = 15000
}

resource "aws_apigatewayv2_integration" "trading212" {
  api_id                 = aws_apigatewayv2_api.website.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.trading212.invoke_arn
  integration_method     = "POST"
  payload_format_version = "2.0"
  timeout_milliseconds   = 29000
}

resource "aws_apigatewayv2_route" "contact" {
  api_id    = aws_apigatewayv2_api.website.id
  route_key = "POST /api/contact"
  target    = "integrations/${aws_apigatewayv2_integration.contact.id}"
}

resource "aws_apigatewayv2_route" "trading212" {
  api_id    = aws_apigatewayv2_api.website.id
  route_key = "GET /api/trading212"
  target    = "integrations/${aws_apigatewayv2_integration.trading212.id}"
}

resource "aws_lambda_permission" "contact" {
  statement_id  = "AllowApiGatewayContactInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.contact.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.website.execution_arn}/*/*"
}

resource "aws_lambda_permission" "trading212" {
  statement_id  = "AllowApiGatewayTrading212Invoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.trading212.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.website.execution_arn}/*/*"
}

resource "aws_cloudfront_function" "rewrite_index" {
  name    = "${replace(var.domain, ".", "-")}-rewrite-index"
  runtime = "cloudfront-js-1.0"
  comment = "Rewrite extensionless paths to static index documents"
  publish = true
  code    = <<-JS
    function handler(event) {
      var request = event.request;
      var uri = request.uri;

      if (uri.indexOf('/api/') === 0) {
        return request;
      }

      if (uri === '/') {
        request.uri = '/index.html';
        return request;
      }

      if (uri.endsWith('/')) {
        request.uri = uri + 'index.html';
        return request;
      }

      if (uri.indexOf('.') === -1) {
        request.uri = uri + '/index.html';
      }

      return request;
    }
  JS
}

resource "aws_cloudfront_distribution" "website" {
  enabled             = true
  is_ipv6_enabled     = true
  comment             = "Public website for ${var.domain}"
  default_root_object = "index.html"
  aliases             = [var.domain, "www.${var.domain}"]
  price_class         = "PriceClass_100"

  origin {
    domain_name              = aws_s3_bucket.site.bucket_regional_domain_name
    origin_access_control_id = aws_cloudfront_origin_access_control.site.id
    origin_id                = "site-origin"

    s3_origin_config {
      origin_access_identity = ""
    }
  }

  origin {
    domain_name = replace(aws_apigatewayv2_api.website.api_endpoint, "https://", "")
    origin_id   = "api-origin"
    origin_path = "/${aws_apigatewayv2_stage.website.name}"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  default_cache_behavior {
    target_origin_id       = "site-origin"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD", "OPTIONS"]
    compress               = true
    cache_policy_id        = aws_cloudfront_cache_policy.static.id

    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.rewrite_index.arn
    }
  }

  ordered_cache_behavior {
    path_pattern           = "/api/*"
    target_origin_id       = "api-origin"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD", "OPTIONS", "PUT", "PATCH", "POST", "DELETE"]
    cached_methods         = ["GET", "HEAD", "OPTIONS"]
    compress               = true
    cache_policy_id        = aws_cloudfront_cache_policy.api.id
    origin_request_policy_id = aws_cloudfront_origin_request_policy.api.id
  }

  custom_error_response {
    error_code            = 403
    response_code         = 404
    response_page_path    = "/404.html"
    error_caching_min_ttl = 0
  }

  custom_error_response {
    error_code            = 404
    response_code         = 404
    response_page_path    = "/404.html"
    error_caching_min_ttl = 0
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = var.certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }
}

resource "aws_s3_bucket_policy" "site" {
  bucket = aws_s3_bucket.site.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowCloudFrontServicePrincipalReadOnly"
        Effect = "Allow"
        Principal = {
          Service = "cloudfront.amazonaws.com"
        }
        Action   = "s3:GetObject"
        Resource = "${aws_s3_bucket.site.arn}/*"
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = aws_cloudfront_distribution.website.arn
          }
        }
      }
    ]
  })
}

resource "aws_s3_object" "site" {
  for_each = local.site_files

  bucket       = aws_s3_bucket.site.id
  key          = each.value
  source       = "${var.site_build_dir}/${each.value}"
  etag         = filemd5("${var.site_build_dir}/${each.value}")
  content_type = lookup(local.mime_types, lower(element(reverse(split(".", each.value)), 0)), null)
  cache_control = startswith(each.value, "_next/") ? "public, max-age=31536000, immutable" : (endswith(each.value, ".html") ? "public, max-age=0, must-revalidate" : "public, max-age=86400")

  depends_on = [
    aws_s3_bucket_ownership_controls.site,
    aws_s3_bucket_public_access_block.site,
  ]
}
