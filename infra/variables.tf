variable "domain" {
  description = "Primary domain name for the public website"
  type        = string
}

variable "aws_region" {
  description = "AWS region for Lambda, S3 and API Gateway resources"
  type        = string
  default     = "eu-west-2"
}

variable "site_build_dir" {
  description = "Path to the static website build output"
  type        = string
  default     = "../services/website/out"
}

variable "contact_lambda_dir" {
  description = "Path to the bundled contact Lambda artifact directory"
  type        = string
  default     = "../dist/services/contact-api"
}

variable "zone_id" {
  description = "Route53 hosted zone ID for the primary domain"
  type        = string
}

variable "trading212_lambda_dir" {
  description = "Path to the bundled Trading212 Lambda artifact directory"
  type        = string
  default     = "../dist/services/trading212-api"
}

variable "recaptcha_secret_key" {
  description = "reCAPTCHA secret key used for server-side verification"
  type        = string
  sensitive   = true
}

variable "t212_api_key" {
  description = "Trading212 API key"
  type        = string
  sensitive   = true
}

variable "t212_api_secret" {
  description = "Trading212 API secret"
  type        = string
  sensitive   = true
}

variable "contact_email_to" {
  description = "Contact form destination email address"
  type        = string
}

variable "contact_email_from" {
  description = "Contact form sender email address"
  type        = string
}
