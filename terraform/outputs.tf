output "vpc_id" {
  description = "ID da VPC do KubeShop"
  value       = aws_vpc.kubeshop.id
}

output "app_subnet_id" {
  description = "ID da sub-rede da aplicacao"
  value       = aws_subnet.app.id
}

output "database_subnet_id" {
  description = "ID da sub-rede do MongoDB"
  value       = aws_subnet.database.id
}


output "app_public_ip" {
  description = "IP publico da VM da aplicacao"
  value       = aws_instance.app.public_ip
}

output "app_private_ip" {
  description = "IP privado da VM da aplicacao"
  value       = aws_instance.app.private_ip
}

output "db_private_ip" {
  description = "IP privado da VM do MongoDB"
  value       = aws_instance.database.private_ip
}

output "app_instance_id" {
  description = "ID da VM da aplicacao"
  value       = aws_instance.app.id
}

output "db_instance_id" {
  description = "ID da VM do banco"
  value       = aws_instance.database.id
}

output "mongo_volume_id" {
  description = "ID do disco de dados"
  value       = aws_ebs_volume.mongo_data.id
}
