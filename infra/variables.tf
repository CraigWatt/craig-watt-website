variable "aws_region" {
  description = "AWS region to deploy into"
  type        = string
  default     = "eu-west-2"
}

variable "environment" {
  description = "Name of this deployment (eg. dev/stage/prod)"
  type        = string
  default     = "prod"
}

variable "tf_state_bucket" {
  description = "S3 bucket for Terraform state"
  type        = string
}

variable "tf_state_lock_table" {
  description = "DynamoDB table name for state locking"
  type        = string
}

variable "vpc_id" {
  description = "(optional) VPC to deploy into. Leave empty to pick the default."
  type        = string
  default     = ""
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
