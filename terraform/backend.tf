terraform {
  backend "gcs" {
    project = "flock-community"
    bucket  = "workday-terraform-state"
    prefix  = "terraform/state"
  }
}
