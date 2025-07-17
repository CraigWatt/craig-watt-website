// infra/outputs.tf
output "gha_role_arn" {
  description = "The GitHub-OIDC IAM Role ARN for GitHub Actions"
  value       = module.bootstrap.gha_role_arn
}
