resource "tls_private_key" "example" {
  algorithm = "RSA"
}

resource "aws_key_pair" "deployer" {
  key_name   = "deployer-key-new1"
  public_key = tls_private_key.example.public_key_openssh
}

resource "local_file" "private_key" {
  sensitive_content = tls_private_key.example.private_key_pem
  filename          = "${path.module}/deployer-key.pem"
  file_permission   = "0600"
}

resource "aws_security_group" "allow_http_new11" {
  name        = "allow_http_new11"
  description = "Allow inbound traffic on port 3000 and SSH"

  ingress {
    description = "HTTP from VPC"
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

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

  tags = {
    Name = "allow_http1"
  }
}


resource "aws_instance" "app" {
  ami           = "ami-02d8bad0a1da4b6fd"  # Update this with the latest Amazon Linux 2 LTS AMI ID
  instance_type = "t2.micro"
  key_name      = aws_key_pair.deployer.key_name  # Assign the key pair to the instance
  security_groups = [aws_security_group.allow_http_new11.name]  # Add the security group

  tags = {
    Name = "my-app-instance-new"
  }
}

output "instance_public_ip" {
  value = aws_instance.app.public_ip
}

output "key_pair_private_key" {
  description = "Private key material for the key pair"
  value       = tls_private_key.example.private_key_pem
  sensitive   = true
}
