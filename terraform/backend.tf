terraform {
  backend "s3" {
    key          = "pm04/dev/terraform.tfstate"
    region       = "us-east-1"
    encrypt      = true
    use_lockfile = true
  }
}
