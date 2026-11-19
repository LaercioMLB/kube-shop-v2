variable "aws_region" {
  description = "Regiao AWS do projeto"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Ambiente de implantacao"
  type        = string
  default     = "dev"

  validation {
    condition     = contains(["dev", "homolog", "prod"], var.environment)
    error_message = "O ambiente deve ser dev, homolog ou prod."
  }
}

variable "app_instance_type" {
  description = "Tipo da VM da aplicacao"
  type        = string
  default     = "t3.small"
}

variable "db_instance_type" {
  description = "Tipo da VM do banco MongoDB"
  type        = string
  default     = "t3.small"
}

variable "mongo_volume_size" {
  description = "Tamanho do disco de dados do MongoDB em GiB"
  type        = number
  default     = 20

  validation {
    condition     = var.mongo_volume_size >= 10
    error_message = "O disco deve ter pelo menos 10 GiB."
  }
}

