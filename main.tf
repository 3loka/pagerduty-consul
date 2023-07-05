resource "aws_security_group" "allow_http" {
  name        = "allow_http"
  description = "Allow inbound traffic on port 3000"

  ingress {
    description = "HTTP from anywhere"
    from_port   = 3000
    to_port     = 3000
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

resource "aws_instance" "app" {
  ami           = "ami-02d8bad0a1da4b6fd"  # Update this with the latest Amazon Linux 2 LTS AMI ID
  instance_type = "t2.micro"
  security_groups = [aws_security_group.allow_http.name]  # Add the security group

  tags = {
    Name = "my-app-instance"
  }
}

output "instance_public_ip" {
  value = aws_instance.app.public_ip
}
