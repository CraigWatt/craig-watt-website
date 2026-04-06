output "name_servers" {
  value = module.route53.name_servers
}

output "zone_id" {
  value = module.route53.zone_id
}

output "certificate_arn" {
  value = module.certificate.certificate_arn
}

output "distribution_domain_name" {
  value = module.website.distribution_domain_name
}

output "api_endpoint" {
  value = module.website.api_endpoint
}
