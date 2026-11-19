
# Security Group da aplicacao

resource "aws_security_group" "app" {
  name_prefix = "pm04-kubeshop-app-"
  description = "Firewall da aplicacao KubeShop"
  vpc_id      = aws_vpc.kubeshop.id

  tags = {
    Name = "pm04-kubeshop-app-sg"
  }
}

# Permitir acesso publico a loja pela porta 8080

resource "aws_vpc_security_group_ingress_rule" "app_http" {
  security_group_id = aws_security_group.app.id

  cidr_ipv4   = "0.0.0.0/0"
  from_port   = 8080
  to_port     = 8080
  ip_protocol = "tcp"

  description = "Acesso HTTP a loja"
}

# Permitir saida da VM de aplicacao

resource "aws_vpc_security_group_egress_rule" "app_out" {
  security_group_id = aws_security_group.app.id

  cidr_ipv4   = "0.0.0.0/0"
  ip_protocol = "-1"

  description = "Saida da aplicacao"
}

# Security Group do MongoDB

resource "aws_security_group" "database" {
  name_prefix = "pm04-kubeshop-db-"
  description = "Firewall do MongoDB"
  vpc_id      = aws_vpc.kubeshop.id

  tags = {
    Name = "pm04-kubeshop-db-sg"
  }
}

# Somente a VM da aplicacao acessa o MongoDB

resource "aws_vpc_security_group_ingress_rule" "mongo" {
  security_group_id = aws_security_group.database.id

  referenced_security_group_id = aws_security_group.app.id

  from_port   = 27017
  to_port     = 27017
  ip_protocol = "tcp"

  description = "MongoDB acessivel apenas pela aplicacao"
}

# Permitir administracao SSH somente pela VM da aplicacao

resource "aws_vpc_security_group_ingress_rule" "db_ssh" {
  security_group_id = aws_security_group.database.id

  referenced_security_group_id = aws_security_group.app.id

  from_port   = 22
  to_port     = 22
  ip_protocol = "tcp"

  description = "SSH privado para configuracao Ansible"
}

# Saida da VM do banco pela rede permitida

resource "aws_vpc_security_group_egress_rule" "db_out" {
  security_group_id = aws_security_group.database.id

  cidr_ipv4   = "0.0.0.0/0"
  ip_protocol = "-1"

  description = "Saida do banco conforme rotas privadas"
}
