###### modules/bootstrap/variables.tf ######

variable "state_bucket_name" {
  description = "Name of the S3 bucket for Terraform state"
  type        = string
  default     = "craig-watt-tfstate"
}

variable "github_oidc_provider_url" {
  description = "URL of the GitHub Actions OIDC provider"
  type        = string
  default     = "https://token.actions.githubusercontent.com"
}

variable "github_repo" {
  description = "GitHub repo in Owner/Name format (used in trust policy)"
  type        = string
  default     = "CraigWatt/craig-watt-website"
}

variable "aws_region" {
  type    = string
  default = "eu-west-2"
}

variable "domain" {
  description = "Primary website domain used to derive resource names"
  type        = string
  default     = "craigwatt.co.uk"
}
