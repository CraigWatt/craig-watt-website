resource "aws_secretsmanager_secret" "mailersend" {
  name = "${var.domain}-mailersend-api-key"
  recovery_window_in_days = 0
}

resource "aws_secretsmanager_secret_version" "mailersend" {
  secret_id     = aws_secretsmanager_secret.mailersend.id
  secret_string = var.mailersend_api_key
}

resource "aws_secretsmanager_secret" "recaptcha" {
  name = "${var.domain}-recaptcha-secret"
  recovery_window_in_days = 0
}

resource "aws_secretsmanager_secret_version" "recaptcha" {
  secret_id     = aws_secretsmanager_secret.recaptcha.id
  secret_string = var.recaptcha_secret_key
}

resource "aws_secretsmanager_secret" "t212" {
  name = "${var.domain}-t212-api-key"
  recovery_window_in_days = 0
}

resource "aws_secretsmanager_secret_version" "t212" {
  secret_id     = aws_secretsmanager_secret.t212.id
  secret_string = var.t212_api_key
}

resource "aws_secretsmanager_secret" "t212_secret" {
  name                    = "${var.domain}-t212-api-secret"
  recovery_window_in_days = 0
}

resource "aws_secretsmanager_secret_version" "t212_secret" {
  secret_id     = aws_secretsmanager_secret.t212_secret.id
  secret_string = var.t212_api_secret
}

resource "aws_secretsmanager_secret" "fx" {
  name = "${var.domain}-fx-api-key"
  recovery_window_in_days = 0
}

resource "aws_secretsmanager_secret" "contact_to" {
  name = "${var.domain}-contact-email-to"
}
resource "aws_secretsmanager_secret_version" "contact_to" {
  secret_id     = aws_secretsmanager_secret.contact_to.id
  secret_string = var.contact_email_to
}

resource "aws_secretsmanager_secret" "contact_from" {
  name = "${var.domain}-contact-email-from"
}
resource "aws_secretsmanager_secret_version" "contact_from" {
  secret_id     = aws_secretsmanager_secret.contact_from.id
  secret_string = var.contact_email_from
}
