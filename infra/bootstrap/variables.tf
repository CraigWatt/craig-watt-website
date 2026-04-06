###### modules/bootstrap/variables.tf ######

variable "state_bucket_name" {
  description = "Name of the S3 bucket for Terraform state"
  type        = string
}

variable "lock_table_name" {
  description = "Name of the DynamoDB table for Terraform state locking"
  type        = string
}

variable "github_oidc_provider_url" {
  description = "URL of the GitHub Actions OIDC provider"
  type        = string
}

variable "github_repo" {
  description = "GitHub repo in Owner/Name format (used in trust policy)"
  type        = string
}

variable "aws_region" {
    type = string
}
