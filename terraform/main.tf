# 1. Rede principal do projeto

resource "aws_vpc" "kubeshop" {
  cidr_block           = "10.40.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = {
    Name = "pm04-kubeshop-vpc"
  }
}

# 2. Sub-rede publica para a aplicacao

resource "aws_subnet" "app" {
  vpc_id                  = aws_vpc.kubeshop.id
  cidr_block              = "10.40.1.0/24"
  availability_zone       = "us-east-1a"
  map_public_ip_on_launch = true

  tags = {
    Name = "pm04-kubeshop-app"
  }
}

# 3. Sub-rede privada para o MongoDB

resource "aws_subnet" "database" {
  vpc_id                  = aws_vpc.kubeshop.id
  cidr_block              = "10.40.2.0/24"
  availability_zone       = "us-east-1a"
  map_public_ip_on_launch = false

  tags = {
    Name = "pm04-kubeshop-db"
  }
}

# 4. Gateway para acesso a internet

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.kubeshop.id

  tags = {
    Name = "pm04-kubeshop-igw"
  }
}

# 5. Tabela de rotas da aplicacao

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.kubeshop.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = {
    Name = "pm04-kubeshop-public-rt"
  }
}

# 6. Associar a sub-rede publica

resource "aws_route_table_association" "app" {
  subnet_id      = aws_subnet.app.id
  route_table_id = aws_route_table.public.id
}

# 7. Tabela de rotas privada

resource "aws_route_table" "private" {
  vpc_id = aws_vpc.kubeshop.id

  tags = {
    Name = "pm04-kubeshop-private-rt"
  }
}

# 8. Associar a sub-rede do banco

resource "aws_route_table_association" "database" {
  subnet_id      = aws_subnet.database.id
  route_table_id = aws_route_table.private.id
}
