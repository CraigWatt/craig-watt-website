output "task_definition_arn" {
  description = "ARN of the ECS task definition"
  value       = aws_ecs_task_definition.this.arn
}

output "service_name" {
  description = "Name of the ECS service"
  value       = aws_ecs_service.this.name
}

output "service_arn" {
  description = "ARN of the ECS service"
  value       = aws_ecs_service.this.arn
}

output "log_group_name" {
  description = "CloudWatch log group created for this service"
  value       = aws_cloudwatch_log_group.this.name
}

output "service_url" {
  description = "Public URL of the Next.js service (ALB DNS name)"
  value       = aws_lb.this.dns_name
}

output "alb_dns_name" {
  value = aws_lb.this.dns_name
}

output "alb_zone_id" {
  value = aws_lb.this.zone_id
}
