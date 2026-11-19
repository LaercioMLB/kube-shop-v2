# Endereco IP publico do NAT Gateway

resource "aws_eip" "nat" {
  domain = "vpc"

  tags = {
    Name = "pm04-kubeshop-nat-ip"
  }
}

# NAT Gateway na sub-rede publica

resource "aws_nat_gateway" "database" {
  allocation_id = aws_eip.nat.id
  subnet_id     = aws_subnet.app.id

  depends_on = [
    aws_internet_gateway.main
  ]

  tags = {
    Name = "pm04-kubeshop-nat"
  }
}

# Saida da sub-rede privada pelo NAT Gateway

resource "aws_route" "database_internet" {
  route_table_id         = aws_route_table.private.id
  destination_cidr_block = "0.0.0.0/0"
  nat_gateway_id         = aws_nat_gateway.database.id
}
