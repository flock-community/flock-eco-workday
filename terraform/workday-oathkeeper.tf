resource "google_secret_manager_secret" "oathkeeper-config" {
  labels    = {}
  project   = "1005171984962"
  secret_id = "OATHKEEPER_CONFIG"

  replication {
    automatic = true
  }

  timeouts {}
}

resource "google_secret_manager_secret_version" "oathkeeper-config-version" {
  secret      = google_secret_manager_secret.oathkeeper-config.id
  secret_data = file("oathkeeper/config.yaml")
}

resource "google_secret_manager_secret" "oathkeeper-rules" {
  labels    = {}
  project   = "1005171984962"
  secret_id = "OATHKEEPER_RULES"

  replication {
    automatic = true
  }

  timeouts {}
}

resource "google_secret_manager_secret_version" "oathkeeper-rules-version" {
  secret      = google_secret_manager_secret.oathkeeper-rules.id
  secret_data = file("oathkeeper/rules.yaml")
}

resource "google_cloud_run_service" "workday-oathkeeper" {
  project  = "flock-community"
  name     = "workday-oathkeeper"
  location = "europe-west1"
  template {
    spec {
      containers {
        args = [
          "serve",
          "proxy",
          "--config",
          "/home/ory/config/config.yaml",
        ]
        image = "oryd/oathkeeper:v0.40.3"
        ports {
          container_port = 4455
        }
        volume_mounts {
          mount_path = "/home/ory/config"
          name       = "secret-config"
        }
        volume_mounts {
          mount_path = "/home/ory/config/rules"
          name       = "secret-rules"
        }
        volume_mounts {
          mount_path = "/home/ory/config/jwks"
          name       = "secret-jwks"
        }

      }
      volumes {
        name = "secret-config"
        secret {
          default_mode = 0
          secret_name  = "OATHKEEPER_CONFIG"
          items {
            key  = "latest"
            mode = 0
            path = "config.yaml"
          }
        }
      }
      volumes {
        name = "secret-rules"
        secret {
          default_mode = 0
          secret_name  = "OATHKEEPER_RULES"
          items {
            key  = "latest"
            mode = 0
            path = "rules.yaml"
          }
        }
      }
      volumes {
        name = "secret-jwks"
        secret {
          default_mode = 0
          secret_name  = "OATHKEEPER_JWKS"
          items {
            key  = "latest"
            mode = 0
            path = "jwks.json"
          }
        }
      }
    }
  }
  traffic {
    percent         = 100
    latest_revision = true
  }
}
