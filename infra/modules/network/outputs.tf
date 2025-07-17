output "vpc_id" {
  value = data.aws_vpc.default.id
}

output "subnet_ids" {
  description = "List of subnet IDs for this VPC"
  value       = data.aws_subnets.default.ids
}

output "default_sg_id" {
  description = "The default security-group ID for this VPC"
  value       = data.aws_security_group.default.id
}

output "security_group_id" {
  value = data.aws_security_group.default.id
}
