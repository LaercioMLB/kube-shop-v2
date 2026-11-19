
# Perfis de acesso das maquinas ao AWS Systems Manager

resource "aws_iam_role" "ssm" {
  for_each = toset(["app", "database"])

  name = "pm04-kubeshop-${each.key}-ssm-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"

    Statement = [
      {
        Effect = "Allow"

        Principal = {
          Service = "ec2.amazonaws.com"
        }

        Action = "sts:AssumeRole"
      }
    ]
  })

  tags = {
    Name = "pm04-kubeshop-${each.key}-ssm"
  }
}

# Permissao oficial para o Systems Manager

resource "aws_iam_role_policy_attachment" "ssm_core" {
  for_each = aws_iam_role.ssm

  role       = each.value.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

# Perfis que serao associados as instancias EC2

resource "aws_iam_instance_profile" "ssm" {
  for_each = aws_iam_role.ssm

  name = each.value.name
  role = each.value.name

  depends_on = [
    aws_iam_role_policy_attachment.ssm_core
  ]
}
