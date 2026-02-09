
export function generateTerraformCode(provider: string, region: string, instanceSize: string) {
  const files: Record<string, string> = {};

  // Root variables
  files['variables.tf'] = `
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
`;

  // Root main.tf
  files['main.tf'] = `
terraform {
  required_version = ">= 1.0.0"
}

module "cloud_infrastructure" {
  source = "./${provider}"

  region        = var.region
  instance_size = var.instance_size
  project_name  = var.project_name
}
`;

  // Root outputs
  files['outputs.tf'] = `
output "instance_ip" {
  value = module.cloud_infrastructure.instance_ip
}
`;

  // Provider specific code
  if (provider === 'aws') {
    files['aws/variables.tf'] = `
variable "region" { type = string }
variable "instance_size" { type = string }
variable "project_name" { type = string }
`;
    files['aws/main.tf'] = `
provider "aws" {
  region = var.region
}

# VPC
resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"
  tags = { Name = "\${var.project_name}-vpc" }
}

resource "aws_subnet" "main" {
  vpc_id     = aws_vpc.main.id
  cidr_block = "10.0.1.0/24"
  tags = { Name = "\${var.project_name}-subnet" }
}

resource "aws_internet_gateway" "gw" {
  vpc_id = aws_vpc.main.id
}

resource "aws_route_table" "rt" {
  vpc_id = aws_vpc.main.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.gw.id
  }
}

# Security Group
resource "aws_security_group" "allow_ssh" {
  name        = "allow_ssh"
  description = "Allow SSH inbound traffic"
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "SSH from anywhere"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# AMI (Amazon Linux 2 - simplified lookup)
data "aws_ami" "amazon_linux" {
  most_recent = true
  owners      = ["amazon"]
  filter {
    name   = "name"
    values = ["amzn2-ami-hvm-*-x86_64-gp2"]
  }
}

# EC2 Instance
resource "aws_instance" "app_server" {
  ami           = data.aws_ami.amazon_linux.id
  instance_type = var.instance_size
  subnet_id     = aws_subnet.main.id
  vpc_security_group_ids = [aws_security_group.allow_ssh.id]

  tags = {
    Name = "\${var.project_name}-server"
  }
}

output "instance_ip" {
  value = aws_instance.app_server.public_ip
}
`;
  } else if (provider === 'azure') {
    files['azure/variables.tf'] = `
variable "region" { type = string }
variable "instance_size" { type = string }
variable "project_name" { type = string }
`;
    files['azure/main.tf'] = `
provider "azurerm" {
  features {}
}

resource "azurerm_resource_group" "rg" {
  name     = "\${var.project_name}-rg"
  location = var.region
}

# VNet
resource "azurerm_virtual_network" "vnet" {
  name                = "\${var.project_name}-vnet"
  address_space       = ["10.0.0.0/16"]
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
}

resource "azurerm_subnet" "subnet" {
  name                 = "internal"
  resource_group_name  = azurerm_resource_group.rg.name
  virtual_network_name = azurerm_virtual_network.vnet.name
  address_prefixes     = ["10.0.1.0/24"]
}

# Public IP
resource "azurerm_public_ip" "pip" {
  name                = "\${var.project_name}-pip"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  allocation_method   = "Dynamic"
}

# Network Interface
resource "azurerm_network_interface" "nic" {
  name                = "\${var.project_name}-nic"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name

  ip_configuration {
    name                          = "internal"
    subnet_id                     = azurerm_subnet.subnet.id
    private_ip_address_allocation = "Dynamic"
    public_ip_address_id          = azurerm_public_ip.pip.id
  }
}

# NSG
resource "azurerm_network_security_group" "nsg" {
  name                = "ssh_nsg"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name

  security_rule {
    name                       = "SSH"
    priority                   = 1001
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "22"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }
}

# Virtual Machine
resource "azurerm_linux_virtual_machine" "vm" {
  name                = "\${var.project_name}-vm"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  size                = var.instance_size
  admin_username      = "adminuser"
  network_interface_ids = [
    azurerm_network_interface.nic.id,
  ]

  admin_ssh_key {
    username   = "adminuser"
    public_key = file("~/.ssh/id_rsa.pub") # Assumes key exists
  }

  os_disk {
    caching              = "ReadWrite"
    storage_account_type = "Standard_LRS"
  }

  source_image_reference {
    publisher = "Canonical"
    offer     = "UbuntuServer"
    sku       = "18.04-LTS"
    version   = "latest"
  }
}

output "instance_ip" {
  value = azurerm_linux_virtual_machine.vm.public_ip_address
}
`;
  } else if (provider === 'gcp') {
    files['gcp/variables.tf'] = `
variable "region" { type = string }
variable "instance_size" { type = string }
variable "project_name" { type = string }
`;
    files['gcp/main.tf'] = `
provider "google" {
  region = var.region
}

# VPC
resource "google_compute_network" "vpc_network" {
  name = "\${var.project_name}-vpc"
}

# Firewall
resource "google_compute_firewall" "ssh-rule" {
  name    = "\${var.project_name}-allow-ssh"
  network = google_compute_network.vpc_network.name

  allow {
    protocol = "tcp"
    ports    = ["22"]
  }

  source_ranges = ["0.0.0.0/0"]
}

# VM Instance
resource "google_compute_instance" "vm_instance" {
  name         = "\${var.project_name}-vm"
  machine_type = var.instance_size
  zone         = "\${var.region}-a" # Simplified zone selection

  boot_disk {
    initialize_params {
      image = "debian-cloud/debian-11"
    }
  }

  network_interface {
    network = google_compute_network.vpc_network.name
    access_config {
      # Ephemeral IP
    }
  }
}

output "instance_ip" {
  value = google_compute_instance.vm_instance.network_interface.0.access_config.0.nat_ip
}
`;
  }

  // Deploy Script
  files['deploy.sh'] = `#!/bin/bash
set -e

# Generated Deployment Script for ${provider} in ${region}

echo "Initializing Terraform..."
terraform init

echo "Deploying infrastructure to ${provider}..."
echo "Region: ${region}"
echo "Instance Size: ${instanceSize}"

# Export variables for Terraform
export TF_VAR_region="${region}"
export TF_VAR_instance_size="${instanceSize}"

# Apply configuration
terraform apply -auto-approve

echo "Deployment Complete!"
`;

  return files;
}
