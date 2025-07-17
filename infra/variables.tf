variable "tf_state_bucket"        { type = string }
variable "tf_state_lock_table"    { type = string }
variable "github_oidc_provider_url" { type = string }
variable "github_repo"            { type = string }

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


variable "tf_state_bucket" {
  description = "S3 bucket for Terraform state"
  type        = string
  default     = "craig-watt-tfstate"
}

variable "tf_state_lock_table" {
  description = "DynamoDB table for Terraform state locking"
  type        = string
  default     = "craig-watt-lock-table"
}

variable "github_oidc_provider_url" {
  description = "GitHub Actions OIDC provider URL"
  type        = string
  default     = "https://token.actions.githubusercontent.com"
}

variable "github_repo" {
  description = "GitHub repo in Owner/Name format (for the trust policy)"
  type        = string
  default     = "CraigWatt/craig-watt-website"
}
