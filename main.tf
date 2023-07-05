# main.tf
provider "aws" {
  region = "us-west-2"  # Change this to your preferred AWS region
}

resource "aws_instance" "app" {
  ami           = "ami-0c94855ba95c574c8"  # Update this with the latest Amazon Linux 2 LTS AMI ID
  instance_type = "t2.micro"

  tags = {
    Name = "my-app-instance"
  }
}

output "instance_public_ip" {
  value = aws_instance.app.public_ip
}
