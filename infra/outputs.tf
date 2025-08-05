output "name_servers" {
  value = module.route53.name_servers
}

output "zone_id" {
  value = module.route53.zone_id
}

output "certificate_arn" {
  value = module.acm.certificate_arn
}

output "alb_sg_id" {
  description = "Security Group ID for the ALB (only 80/443)"
  value       = module.network.alb_sg_id
}

output "app_sg_id" {
  description = "Security Group ID for the ECS tasks"
  value       = module.network.app_sg_id
}
