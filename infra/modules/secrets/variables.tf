variable "domain" {
  type        = string
  description = "Your root domain (e.g. craigwatt.co.uk)"
}

variable "mailersend_api_key" {
  type        = string
  description = "Mailersend API key"
  sensitive   = true
}

variable "recaptcha_secret_key" {
  type        = string
  description = "RECAPTCHA secret key (server-side)"
  sensitive   = true
}

variable "t212_api_key" {
  type        = string
  description = "Trading212 API key"
  sensitive   = true
}

variable "fx_api_key" {
  type        = string
  description = "FX API key"
  sensitive   = true
}

variable "contact_email_to" {
  description = "The recipient address for contact form submissions"
  type        = string
}

variable "contact_email_from" {
  description = "The sender address for contact form submissions"
  type        = string
}
