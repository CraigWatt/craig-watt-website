output "vpc_id" {
  value = data.aws_vpc.default.id
}

output "subnet_ids" {
  value = data.aws_subnets.public.ids
}

output "security_group_id" {
  value = data.aws_security_group.default.id
}
