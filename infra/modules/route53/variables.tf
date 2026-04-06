variable "domain" {
  description = "Primary domain name"
  type        = string
}

variable "zone_id" {
  description = "Existing hosted zone ID. Leave null to create the zone in this module."
  type        = string
  default     = null
}

variable "target_domain_name" {
  description = "DNS name of the alias target, such as a CloudFront distribution"
  type        = string
  default     = null
}

variable "target_zone_id" {
  description = "Hosted zone ID of the alias target"
  type        = string
  default     = null
}
