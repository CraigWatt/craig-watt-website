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

variable "vpc_id" {
  description = "The VPC ID where the ALB and TG will live"
  type        = string
}

variable "certificate_arn" {
  description = "ARN of the ACM certificate for TLS"
  type        = string
}

variable "alb_sg_id" {
  description = "Security Group ID for the ALB"
  type        = string
}

variable "app_sg_id" {
  description = "Security Group ID for the ECS tasks"
  type        = string
}

# the six secrets ARNs
variable "secrets_mailersend_arn" {
  description = "ARN for the Mailersend API key secret"
  type        = string
}
variable "secrets_recaptcha_arn" {
  description = "ARN for the reCAPTCHA secret key"
  type        = string
}
variable "secrets_t212_arn" {
  description = "ARN for the T212 API key secret"
  type        = string
}
variable "secrets_t212_api_secret_arn" {
  description = "ARN for the Trading212 API secret"
  type        = string
}

variable "secrets_fx_arn" {
  description = "ARN for the FX API key secret"
  type        = string
}
variable "secrets_contact_to_arn" {
  description = "ARN for the Contact email TO address secret"
  type        = string
}
variable "secrets_contact_from_arn" {
  description = "ARN for the Contact email FROM address secret"
  type        = string
}
