output "name_servers" {
  value = module.route53.name_servers
}

output "zone_id" {
  value = module.route53.zone_id
}

output "certificate_arn" {
  value = module.acm.certificate_arn
}
