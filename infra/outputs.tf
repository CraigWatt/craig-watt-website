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

output "distribution_id" {
  value = module.website.distribution_id
}

output "api_id" {
  value = module.website.api_id
}

output "api_endpoint" {
  value = module.website.api_endpoint
}

output "site_bucket_name" {
  value = module.website.site_bucket_name
}
