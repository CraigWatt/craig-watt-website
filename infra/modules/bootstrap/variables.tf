variable "state_bucket_name" {
  type        = string
  description = "Name of the S3 bucket for Terraform state"
}

variable "lock_table_name" {
  type        = string
  description = "Name of the DynamoDB table for Terraform state locking"
}

variable "github_oidc_provider_url" {
  type        = string
  description = "URL of the GitHub Actions OIDC provider"
}

variable "github_repo" {
  type        = string
  description = "GitHub repo in form Owner/Name"
}

# derive a short modulename for IAM role naming
locals {
  github_repo_short = replace(var.github_repo, "/", "-")
}
