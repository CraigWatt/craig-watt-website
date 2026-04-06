output "distribution_domain_name" {
  description = "CloudFront distribution DNS name"
  value       = aws_cloudfront_distribution.website.domain_name
}

output "distribution_hosted_zone_id" {
  description = "CloudFront hosted zone ID for Route 53 alias records"
  value       = aws_cloudfront_distribution.website.hosted_zone_id
}

output "api_endpoint" {
  description = "API Gateway base endpoint"
  value       = aws_apigatewayv2_api.website.api_endpoint
}

output "site_bucket_name" {
  description = "S3 bucket that stores the static site build"
  value       = aws_s3_bucket.site.bucket
}
