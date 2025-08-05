terraform {
  required_version = ">= 1.4.0"
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
    dynamodb_table = "craig-watt-lock-table"
    encrypt        = true
  }
}

provider "aws" {
  region = var.aws_region
}

module "network" {
  source         = "./modules/network"
  container_port = var.container_port
}

module "ecr" {
  source          = "./modules/ecr"
  repository_name = var.ecr_repository
}

module "ecs_cluster" {
  source       = "./modules/ecs-cluster"
  cluster_name = var.ecs_cluster_name
}

module "acm" {
  source  = "./modules/acm"
  domain  = var.domain
  zone_id = module.route53.zone_id
}

module "route53" {
  source       = "./modules/route53"
  domain       = var.domain
  alb_dns_name = module.nextjs_service.alb_dns_name
  alb_zone_id  = module.nextjs_service.alb_zone_id
}

module "secrets" {
  source = "./modules/secrets"
  domain               = var.domain
  mailersend_api_key   = var.mailersend_api_key
  recaptcha_secret_key = var.recaptcha_secret_key
  t212_api_key         = var.t212_api_key
  fx_api_key           = var.fx_api_key
}

module "nextjs_service" {
  source = "./services/nextjs-app"

  # core infra inputs
  family_name        = var.family_name
  cluster_arn        = module.ecs_cluster.cluster_arn
  vpc_id             = module.network.vpc_id
  subnets            = module.network.subnet_ids
  alb_sg_id          = module.network.alb_sg_id
  app_sg_id          = module.network.app_sg_id
  certificate_arn    = module.acm.certificate_arn
  execution_role_arn = var.ecs_execution_role_arn
  task_role_arn      = var.ecs_task_role_arn
  aws_region         = var.aws_region
  container_image    = "${module.ecr.repository_url}:${var.image_tag}"
  container_port     = var.container_port
  desired_count      = var.desired_count

  # secrets ARNs (use the outputs defined in modules/secrets/outputs.tf)
  secrets_mailersend_arn = module.secrets.mailersend_secret_arn
  secrets_recaptcha_arn  = module.secrets.recaptcha_secret_arn
  secrets_t212_arn       = module.secrets.t212_secret_arn
  secrets_fx_arn         = module.secrets.fx_secret_arn
}
