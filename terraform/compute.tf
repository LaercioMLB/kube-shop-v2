# Buscar a imagem oficial do Ubuntu 24.04 LTS

data "aws_ssm_parameter" "ubuntu_ami" {
  name = "/aws/service/canonical/ubuntu/server/noble/stable/current/amd64/hvm/ebs-gp3/ami-id"
}

# VM 1 - Aplicacao KubeShop

resource "aws_instance" "app" {
  ami                  = data.aws_ssm_parameter.ubuntu_ami.value
  instance_type        = var.app_instance_type
  iam_instance_profile = aws_iam_instance_profile.ssm["app"].name

  subnet_id                   = aws_subnet.app.id
  vpc_security_group_ids      = [aws_security_group.app.id]
  associate_public_ip_address = true

  metadata_options {
    http_tokens = "required"
  }

  root_block_device {
    volume_size           = 12
    volume_type           = "gp3"
    encrypted             = true
    delete_on_termination = true
  }

  tags = {
    Name = "pm04-kubeshop-app-${var.environment}"
    Role = "application"
  }

  lifecycle {
    ignore_changes = [ami]
  }
}

# VM 2 - Banco MongoDB

resource "aws_instance" "database" {
  ami                  = data.aws_ssm_parameter.ubuntu_ami.value
  instance_type        = var.db_instance_type
  iam_instance_profile = aws_iam_instance_profile.ssm["database"].name

  subnet_id                   = aws_subnet.database.id
  vpc_security_group_ids      = [aws_security_group.database.id]
  associate_public_ip_address = false

  metadata_options {
    http_tokens = "required"
  }

  root_block_device {
    volume_size           = 12
    volume_type           = "gp3"
    encrypted             = true
    delete_on_termination = true
  }

  tags = {
    Name = "pm04-kubeshop-db-${var.environment}"
    Role = "database"
  }

  lifecycle {
    ignore_changes = [ami]
  }
}
