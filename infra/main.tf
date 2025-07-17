terraform {
  required_version = ">= 1.4.0"
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
  source = "./modules/network"
}

module "ecr" {
  source          = "./modules/ecr"
  repository_name = var.ecr_repository
}

module "ecs_cluster" {
  source       = "./modules/ecs-cluster"
  cluster_name = var.ecs_cluster_name
}

module "nextjs_service" {
  source          = "./services/nextjs-app"
  cluster_arn     = module.ecs_cluster.cluster_arn
  container_image = "${module.ecr.repository_url}:${var.image_tag}"

  subnets         = module.network.subnet_ids
  security_groups = [ module.network.default_sg_id ]

  desired_count     = var.desired_count

  execution_role_arn = var.ecs_execution_role_arn
  task_role_arn      = var.ecs_task_role_arn

  family_name       = "nextjs-app"
  aws_region = var.aws_region
}
