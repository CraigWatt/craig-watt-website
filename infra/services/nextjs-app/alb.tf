# infra/services/nextjs-app/alb.tf

# ───────────────────────────────────────────────────────────────────────────────
# Application Load Balancer
# ───────────────────────────────────────────────────────────────────────────────
resource "aws_lb" "this" {
  name               = "${local.family}-alb"
  internal           = false
  load_balancer_type = "application"
  subnets            = var.subnets               # your public subnets
  security_groups    = var.security_groups       # must allow inbound 80
}

# ───────────────────────────────────────────────────────────────────────────────
# Target Group (for port 3000)
# ───────────────────────────────────────────────────────────────────────────────
locals {
  # only take the first 6 letters of “nextjs-app” → “nextjs”
  tg_prefix = substr(local.family, 0, 2)
}

resource "aws_lb_target_group" "this" {
  name_prefix = "${local.tg_prefix}-tg-"
  port        = var.container_port              # 3000
  protocol    = "HTTP"
  vpc_id      = var.vpc_id

  health_check {
    path                = "/"
    protocol            = "HTTP"
    healthy_threshold   = 2
    unhealthy_threshold = 2
    interval            = 30
    matcher             = "200-399"
  }
}

# ───────────────────────────────────────────────────────────────────────────────
# HTTP → forward to that TG
# ───────────────────────────────────────────────────────────────────────────────
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.this.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.this.arn
  }
}
