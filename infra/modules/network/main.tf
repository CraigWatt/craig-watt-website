# Discover the default VPC & its subnets/SG
data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

data "aws_security_group" "default" {
  filter {
    name   = "group-name"
    values = ["default"]
  }
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

# ───────────────────────────────────────────────────────────────────────────────
# ALB Security Group: allow only HTTP/HTTPS from anywhere
# ───────────────────────────────────────────────────────────────────────────────
resource "aws_security_group" "alb" {
  name        = "${data.aws_vpc.default.id}-alb-sg"
  description = "Allow HTTP/HTTPS from 0.0.0.0/0"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  # Allow outbound so ALB can health-check your targets
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# ───────────────────────────────────────────────────────────────────────────────
# App Security Group: only ALB → container_port
# ───────────────────────────────────────────────────────────────────────────────
resource "aws_security_group" "app" {
  name        = "${data.aws_vpc.default.id}-app-sg"
  description = "Allow only ALB in"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    from_port       = var.container_port
    to_port         = var.container_port
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  # allow all outbound traffic (needed so Fargate can pull from ECR, etc)
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
