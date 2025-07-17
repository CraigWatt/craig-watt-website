output "ecr_repository_url" {
  value = module.ecr.repository_url
}

output "ecs_cluster_name" {
  value = module.cluster.cluster_name
}

output "ecs_service_name" {
  value = aws_ecs_service.nextjs.name
}

output "task_definition_arn" {
  value = aws_ecs_task_definition.nextjs.arn
}
