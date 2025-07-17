terraform {
  required_version = ">= 1.4.0"
  backend "s3" {
    bucket = var.tf_state_bucket
    key    = "${var.environment}/terraform.tfstate"
    region = var.aws_region
    dynamodb_table = var.tf_state_lock_table
  }
}

provider "aws" {
  region = var.aws_region
}

# 1) Network: discover or create VPC & subnets
module "network" {
  source = "./modules/network"
  vpc_id = var.vpc_id          # or let the module data-source pick the default
}

# 2) Container registry
module "ecr" {
  source      = "./modules/ecr"
  repository  = var.ecr_repository
}

# 3) ECS cluster
module "ecs_cluster" {
  source      = "./modules/ecs-cluster"
  cluster_name = var.ecs_cluster_name
}

# 4) Service: register task definition + Fargate service
module "nextjs_service" {
  source            = "./services/nextjs-app"
  cluster_arn       = module.ecs_cluster.cluster_arn
  container_image   = "${module.ecr.repository_url}:${var.image_tag}"
  subnets           = module.network.subnet_ids
  security_groups   = module.network.default_sg_id
  desired_count     = var.desired_count
}
