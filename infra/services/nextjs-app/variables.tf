variable "cluster_arn" {
  description = "ARN of the ECS cluster"
  type        = string
}

variable "container_image" {
  description = "Full ECR image URI with tag"
  type        = string
}

variable "subnets" {
  description = "List of subnet IDs for Fargate"
  type        = list(string)
}

variable "security_groups" {
  description = "List of security group IDs"
  type        = list(string)
}

variable "desired_count" {
  description = "Number of tasks to run"
  type        = number
  default     = 1
}

variable "execution_role_arn" {
  description = "ECS task execution IAM role ARN"
  type        = string
}

variable "task_role_arn" {
  description = "IAM role ARN for the running task"
  type        = string
}

variable "aws_region" {
  description = "AWS region"
  type        = string
}

variable "cpu" {
  description = "CPU units for the Fargate task"
  type        = string
  default     = "256"
}

variable "memory" {
  description = "Memory (MiB) for the Fargate task"
  type        = string
  default     = "512"
}

variable "container_port" {
  description = "Port your app listens on inside the container"
  type        = number
  default     = 3000
}

variable "log_group_name" {
  description = "CloudWatch Logs group for ECS"
  type        = string
  default     = "/ecs/nextjs-app"
}

variable "family_name" {
  description = "ECS task family name (must be alphanumeric, `-` or `_` only)"
  type        = string
}
