terraform {
  required_version = ">= 1.4.0"
}

provider "aws" {
  region = var.aws_region
}

module "bootstrap" {
  source                   = "../modules/bootstrap"
  state_bucket_name        = var.tf_state_bucket
  lock_table_name          = var.tf_state_lock_table
  github_oidc_provider_url = var.github_oidc_provider_url
  github_repo              = var.github_repo
}

resource "aws_iam_role_policy_attachment" "s3" {
  role       = aws_iam_role.github_actions.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonS3FullAccess"
}

resource "aws_iam_role_policy_attachment" "dynamodb" {
  role       = aws_iam_role.github_actions.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess"
}
