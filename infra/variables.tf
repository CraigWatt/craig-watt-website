variable "aws_region" {
  description = "AWS region to deploy into"
  type        = string
  default     = "eu-west-2"
}

variable "ecr_repository" {
  description = "Name of the ECR repository"
  type        = string
  default     = "craig-watt-website"
}

variable "ecs_cluster_name" {
  description = "Name for the ECS cluster"
  type        = string
  default     = "craig-watt-cluster"
}

variable "image_tag" {
  description = "Docker image tag to deploy (must match build)"
  type        = string
}

variable "desired_count" {
  description = "Number of ECS tasks to run"
  type        = number
  default     = 1
}

variable "ecs_execution_role_arn" {
  description = "IAM role ARN for ECS task execution (e.g. ecsTaskExecutionRole)"
  type        = string
}

variable "ecs_task_role_arn" {
  description = "IAM role ARN for your ECS tasks (e.g. ecsTaskRole)"
  type        = string
}
