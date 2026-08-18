output "gha_role_arn" {
  description = "The ARN of the GitHub-Actions OIDC IAM Role"
  value       = aws_iam_role.github_actions.arn
}

output "github_oidc_provider_arn" {
  description = "The ARN of the GitHub Actions OIDC provider"
  value       = aws_iam_openid_connect_provider.github.arn
}

output "state_bucket" {
  value = aws_s3_bucket.state.bucket
}
