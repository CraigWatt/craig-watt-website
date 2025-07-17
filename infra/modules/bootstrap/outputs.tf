output "state_bucket_arn" {
  value = aws_s3_bucket.state.arn
}

output "lock_table_name" {
  value = aws_dynamodb_table.lock.name
}

output "github_actions_role_arn" {
  value = aws_iam_role.github_actions.arn
}

output "state_bucket" {
  description = "Name of the S3 bucket for Terraform state"
  value       = aws_s3_bucket.state.bucket
}

output "lock_table" {
  description = "Name of the DynamoDB table for Terraform state locking"
  value       = aws_dynamodb_table.lock.name
}

output "gha_role_arn" {
  description = "GitHub Actions OIDC assume-role ARN"
  value       = aws_iam_role.github_actions.arn
}
