terraform {
  backend "gcs" {
    bucket = "workday-terraform-state"
    prefix = "terraform/state"
  }
}
