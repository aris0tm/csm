terraform {
  required_version = ">= 1.0.0"
}

module "cloud_infrastructure" {
  source = "./aws"

  region        = var.region
  instance_size = var.instance_size
  project_name  = var.project_name
}