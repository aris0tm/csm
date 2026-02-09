#!/bin/bash
set -e

# Generated Deployment Script for aws in us-west-2

echo "Initializing Terraform..."
terraform init

echo "Deploying infrastructure to aws..."
echo "Region: us-west-2"
echo "Instance Size: t2.micro"

# Export variables for Terraform
export TF_VAR_region="us-west-2"
export TF_VAR_instance_size="t2.micro"

# Apply configuration
terraform apply -auto-approve

echo "Deployment Complete!"