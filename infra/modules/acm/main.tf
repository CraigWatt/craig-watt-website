resource "aws_acm_certificate" "this" {
  provider          = aws.us_east_1
  domain_name       = "www.craigwatt.co.uk"
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_route53_record" "validation" {
  name    = tolist(aws_acm_certificate.this.domain_validation_options)[0].resource_record_name
  type    = tolist(aws_acm_certificate.this.domain_validation_options)[0].resource_record_type
  zone_id = var.zone_id
  records = [tolist(aws_acm_certificate.this.domain_validation_options)[0].resource_record_value]
  ttl     = 60
}

resource "aws_acm_certificate_validation" "this" {
  provider                = aws.us_east_1
  certificate_arn         = aws_acm_certificate.this.arn
  validation_record_fqdns = [aws_route53_record.validation.fqdn]
}
