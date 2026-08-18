terraform {
  backend "s3" {
    bucket       = "craig-watt-tfstate"
    key          = "bootstrap/terraform.tfstate"
    region       = "eu-west-2"
    use_lockfile = true
    encrypt      = true
  }
}
