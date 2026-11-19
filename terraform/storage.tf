
# Disco exclusivo para os dados do MongoDB

resource "aws_ebs_volume" "mongo_data" {
  availability_zone = aws_subnet.database.availability_zone

  size      = var.mongo_volume_size
  type      = "gp3"
  encrypted = true

  tags = {
    Name = "pm04-kubeshop-mongo-data"
  }
}

# Conectar o disco a VM do banco

resource "aws_volume_attachment" "mongo_data" {
  device_name = "/dev/sdf"
  volume_id   = aws_ebs_volume.mongo_data.id
  instance_id = aws_instance.database.id
}
