variable "region" {
  description = "The cloud region to deploy to"
  type        = string
}

variable "instance_size" {
  description = "The size of the compute instance"
  type        = string
}

variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "cloud-deploy-demo"
}