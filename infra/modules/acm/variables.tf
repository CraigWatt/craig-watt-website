variable "zone_id" {
  description = "Hosted zone ID of the Route53 zone"
  type        = string
}

variable "domain" {
  description = "The domain name for which to issue the certificate"
  type        = string
}
