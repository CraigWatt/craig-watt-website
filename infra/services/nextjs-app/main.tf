# at top of file
locals {
  family = var.family_name
}

# Create the Log Group (unchanged)
resource "aws_cloudwatch_log_group" "this" {
  name              = var.log_group_name
  retention_in_days = 14
}

# Task Definition
resource "aws_ecs_task_definition" "this" {
  family                   = local.family
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]

  cpu                = var.cpu
  memory             = var.memory
  execution_role_arn = var.execution_role_arn
  task_role_arn      = var.task_role_arn

  container_definitions = jsonencode([
    {
      name      = local.family
      image     = var.container_image
      essential = true

      portMappings = [
        {
          containerPort = var.container_port
          protocol      = "tcp"
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.this.name
          awslogs-region        = var.aws_region
          awslogs-stream-prefix = local.family
        }
      }

      # keep NODE_ENV
      environment = [
        { name = "NODE_ENV", value = "production" }
      ]

      secrets = [
        {
          name      = "MAILERSEND_API_KEY"
          valueFrom = var.secrets_mailersend_arn
        },
        {
          name      = "RECAPTCHA_SECRET_KEY"
          valueFrom = var.secrets_recaptcha_arn
        },
        {
          name      = "T212_API_KEY"
          valueFrom = var.secrets_t212_arn
        },
        {
          name      = "T212_API_SECRET"
          valueFrom = var.secrets_t212_api_secret_arn
        },
        {
          name      = "CONTACT_EMAIL_TO"
          valueFrom = var.secrets_contact_to_arn
        },
        {
          name      = "CONTACT_EMAIL_FROM"
          valueFrom = var.secrets_contact_from_arn
        },
      ]
    }
  ])
}

# ECS Service
resource "aws_ecs_service" "this" {
  name                   = local.family
  cluster                = var.cluster_arn
  task_definition        = aws_ecs_task_definition.this.arn
  desired_count          = var.desired_count
  launch_type            = "FARGATE"
  enable_execute_command = true

  network_configuration {
    subnets          = var.subnets
    security_groups  = [var.app_sg_id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.this.arn
    container_name   = local.family
    container_port   = var.container_port
  }

  depends_on = [
    aws_ecs_task_definition.this,
    aws_lb_listener.http,
  ]
}
