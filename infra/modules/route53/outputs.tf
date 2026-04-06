output "zone_id" {
  value = local.effective_zone_id
}

output "name_servers" {
  value = var.zone_id != null ? [] : aws_route53_zone.primary[0].name_servers
}
