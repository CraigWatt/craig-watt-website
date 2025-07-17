###### modules/bootstrap/main.tf ######

locals {
  repo_short  = replace(var.github_repo, "/", "-")
  provider_id = replace(var.github_oidc_provider_url, "https://", "")
}

data "aws_iam_openid_connect_provider" "github" {
  url = var.github_oidc_provider_url
}

resource "aws_s3_bucket" "state" {
  bucket = var.state_bucket_name
  acl    = "private"

  versioning {
    enabled = true
  }

  server_side_encryption_configuration {
    rule {
      apply_server_side_encryption_by_default {
        sse_algorithm = "AES256"
      }
    }
  }
}

resource "aws_s3_bucket_public_access_block" "state" {
  bucket = aws_s3_bucket.state.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_dynamodb_table" "lock" {
  name         = var.lock_table_name
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "LockID"

  attribute {
    name = "LockID"
    type = "S"
  }
}

resource "aws_iam_role" "github_actions" {
  name = "${local.repo_short}-gha-role"

  assume_role_policy = jsonencode({
    Version   = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Action    = "sts:AssumeRoleWithWebIdentity"
      Principal = { Federated = data.aws_iam_openid_connect_provider.github.arn }
      Condition = {
        StringEquals = {
          "${local.provider_id}:aud" = "sts.amazonaws.com"
        }
        StringLike = {
            "${local.provider_id}:sub" = [
            # any tag push on v*
            "repo:${var.github_repo}:ref:refs/tags/v*",
            # and any “production” environment-tagged push
            "repo:${var.github_repo}:environment:production:ref:refs/tags/v*"
            ]
        }
      }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "ecr" {
  role       = aws_iam_role.github_actions.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryFullAccess"
}
resource "aws_iam_role_policy_attachment" "ecs" {
  role       = aws_iam_role.github_actions.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonECS_FullAccess"
}
resource "aws_iam_role_policy_attachment" "s3" {
  role       = aws_iam_role.github_actions.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonS3FullAccess"
}
resource "aws_iam_role_policy_attachment" "dynamodb" {
  role       = aws_iam_role.github_actions.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess"
}


// allow listing/getting the GitHub OIDC provider
resource "aws_iam_role_policy_attachment" "iam_readonly" {
    role       = aws_iam_role.github_actions.name
    policy_arn = "arn:aws:iam::aws:policy/IAMReadOnlyAccess"
}

// allow CloudWatch Logs reads (eg: ListTagsForResource)
resource "aws_iam_role_policy_attachment" "cw_logs_readonly" {
    role       = aws_iam_role.github_actions.name
    policy_arn = "arn:aws:iam::aws:policy/CloudWatchLogsReadOnlyAccess"
}
