output "mailersend_secret_arn" {
  value = aws_secretsmanager_secret.mailersend.arn
}

output "recaptcha_secret_arn" {
  value = aws_secretsmanager_secret.recaptcha.arn
}

output "t212_secret_arn" {
  value = aws_secretsmanager_secret.t212.arn
}

output "fx_secret_arn" {
  value = aws_secretsmanager_secret.fx.arn
}
