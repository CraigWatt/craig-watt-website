# pull in network (VPC/subnets/SG)
module "network" {
  source     = "../modules/network"
  aws_region = var.aws_region
}

# create your ECR repo for this app
module "ecr" {
  source          = "../modules/ecr"
  repository_name = var.service_name
}

# spin up (or reference) your ECS cluster
module "cluster" {
  source       = "../modules/ecs-cluster"
  cluster_name = var.cluster_name
}

# Fargate Task Definition
resource "aws_ecs_task_definition" "nextjs" {
  family                   = var.task_family
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.cpu
  memory                   = var.memory

  execution_role_arn = var.execution_role_arn
  task_role_arn      = var.task_role_arn

  container_definitions = jsonencode([
    {
      name      = var.container_name
      image     = "${module.ecr.repository_url}:${var.image_tag}"
      essential = true

      portMappings = [
        {
          containerPort = var.container_port
          hostPort      = var.container_port
          protocol      = "tcp"
        }
      ]

      environment = [
        { name = "NODE_ENV", value = "production" }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = "/ecs/${var.service_name}"
          awslogs-region        = var.aws_region
          awslogs-stream-prefix = var.service_name
        }
      }
    }
  ])
}

# ECS Service
resource "aws_ecs_service" "nextjs" {
  name            = var.service_name
  cluster         = module.cluster.cluster_id
  task_definition = aws_ecs_task_definition.nextjs.arn
  desired_count   = var.desired_count
  launch_type     = "FARGATE"

  network_configuration {
    subnets         = module.network.subnet_ids
    security_groups = [module.network.security_group_id]
    assign_public_ip = true
  }

  depends_on = [module.cluster]
}
