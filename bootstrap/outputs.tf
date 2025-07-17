output "gha_role_arn" {
  description = "The ARN of the GitHub-Actions OIDC IAM Role"
  value       = aws_iam_role.github_actions.arn
}

output "state_bucket" {
  value = aws_s3_bucket.state.bucket
}
output "lock_table" {
  value = aws_dynamodb_table.lock.name
}
