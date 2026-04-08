variable "domain" {
  description = "Primary website domain"
  type        = string
}

variable "certificate_arn" {
  description = "ACM certificate ARN for CloudFront"
  type        = string
}

variable "site_build_dir" {
  description = "Directory containing the exported static website"
  type        = string
}

variable "contact_lambda_dir" {
  description = "Directory containing the bundled contact Lambda artifact"
  type        = string
}

variable "zone_id" {
  description = "Route53 hosted zone ID for the primary domain"
  type        = string
}

variable "trading212_lambda_dir" {
  description = "Directory containing the bundled Trading212 Lambda artifact"
  type        = string
}

variable "recaptcha_secret_key" {
  description = "reCAPTCHA secret key"
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

variable "t212_usd_gbp" {
  description = "Optional Trading212 USD to GBP conversion override"
  type        = string
  default     = ""
}

variable "contact_email_to" {
  description = "Contact form recipient email"
  type        = string
}

variable "contact_email_from" {
  description = "Contact form sender email"
  type        = string
}
