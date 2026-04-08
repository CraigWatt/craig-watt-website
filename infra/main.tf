terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }

  backend "s3" {
    bucket         = "craig-watt-tfstate"
    key            = "prod/terraform.tfstate"
    region         = "eu-west-2"
    use_lockfile   = true
    encrypt        = true
  }
}

provider "aws" {
  region = var.aws_region
}

provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
}

module "route53" {
  source = "./modules/route53"
  domain = var.domain
}

module "certificate" {
  source = "./modules/acm"

  providers = {
    aws = aws.us_east_1
  }

  domain  = var.domain
  zone_id = module.route53.zone_id
}

module "website" {
  source = "./services/website"

  domain                = var.domain
  certificate_arn       = module.certificate.certificate_arn
  site_build_dir        = var.site_build_dir
  contact_lambda_dir    = var.contact_lambda_dir
  zone_id               = module.route53.zone_id
  trading212_lambda_dir = var.trading212_lambda_dir
  recaptcha_secret_key  = var.recaptcha_secret_key
  t212_api_key          = var.t212_api_key
  t212_api_secret       = var.t212_api_secret
  contact_email_to      = var.contact_email_to
  contact_email_from    = var.contact_email_from
}

module "dns_records" {
  source = "./modules/route53"

  domain             = var.domain
  zone_id            = module.route53.zone_id
  create_records     = true
  target_domain_name = module.website.distribution_domain_name
  target_zone_id     = module.website.distribution_hosted_zone_id
}
