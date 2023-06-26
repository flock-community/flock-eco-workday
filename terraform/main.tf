provider "google" {
  project = "flock-community"
}

data "google_project" "project" {}

data "google_iam_policy" "noauth" {
  binding {
    role = "roles/run.invoker"
    members = [
      "allUsers",
    ]
  }
}

resource "google_cloud_run_service" "workday-oathkeeper" {
  name     = "workday-oathkeeper"
  location = "europe-west1"
  template {
    spec {
      containers {
        image = "gcr.io/flock-eco/flock-eco-workday-oathkeeper@sha256:7487a84ce5bd4ef54694412957f2ffe024ef4ca46bece52fccf8f00b482a0ee9"
        ports {
          container_port = 4455
        }
      }
    }
  }
  traffic {
    percent         = 100
    latest_revision = true
  }
}

resource "google_cloud_run_service_iam_policy" "noauth" {
  location    = google_cloud_run_service.workday-oathkeeper.location
  project     = google_cloud_run_service.workday-oathkeeper.project
  service     = google_cloud_run_service.workday-oathkeeper.name
  policy_data = data.google_iam_policy.noauth.policy_data
}

resource "google_cloud_run_domain_mapping" "default" {
  name     = "ory.workday.flock.community"
  location = google_cloud_run_service.workday-oathkeeper.location
  metadata {
    namespace = data.google_project.project.project_id
  }
  spec {
    route_name = google_cloud_run_service.workday-oathkeeper.name
  }
}
