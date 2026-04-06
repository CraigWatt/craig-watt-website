resource "aws_route53_zone" "primary" {
  count = var.zone_id == null ? 1 : 0
  name  = var.domain
}

locals {
  effective_zone_id = var.zone_id != null ? var.zone_id : aws_route53_zone.primary[0].zone_id
}

resource "aws_route53_record" "www" {
  count   = var.target_domain_name != null && var.target_zone_id != null ? 1 : 0
  zone_id = local.effective_zone_id
  name    = "www"
  type    = "A"

  alias {
    name                   = var.target_domain_name
    zone_id                = var.target_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "apex" {
  count   = var.target_domain_name != null && var.target_zone_id != null ? 1 : 0
  zone_id = local.effective_zone_id
  name    = var.domain
  type    = "A"

  alias {
    name                   = var.target_domain_name
    zone_id                = var.target_zone_id
    evaluate_target_health = false
  }
}
