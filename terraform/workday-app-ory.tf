resource "google_cloud_run_service" "workday-app-ory" {
  project  = "flock-community"
  name     = "workday-app-ory"
  location = "europe-west1"
  template {
    spec {
      containers {
        image = "gcr.io/flock-eco/flock-eco-workday@sha256:a0c8a6ae26701d6ca592d54c9d6e966054c8f88a8101d77cfbbf7aa609482bf1"
        env {
          name  = "MJ_APIKEY_PUBLIC"
          value = "708f0f8c5081c3ed2138b0c829be50b7"
        }
        env {
          name = "MJ_APIKEY_PRIVATE"
          value_from {
            secret_key_ref {
              key  = "1"
              name = "MJ_APIKEY_PRIVATE"
            }
          }
        }
        env {
          name  = "EXACTONLINE_CLIENT_ID"
          value = "13f9ec55-0850-4dc1-914a-72eeee74cf41"
        }
        env {
          name = "EXACTONLINE_CLIENT_SECRET"
          value_from {
            secret_key_ref {
              key  = "latest"
              name = "EXACTONLINE_CLIENT_SECRET"
            }
          }
        }
        env {
          name  = "EXACTONLINE_REDIRECT_URI"
          value = "https://test.workday.flock.community/api/exactonline/redirect"
        }
        env {
          name  = "EXACTONLINE_REQUEST_URI"
          value = "https://start.exactonline.nl"
        }
        env {
          name  = "GCP_SQL_DATABASE_NAME"
          value = "data"
        }
        env {
          name  = "GCP_SQL_INSTANCE_CONNECTION_NAME"
          value = "flock-community:europe-west1:flock-data"
        }
        env {
          name  = "GOOGLE_CLIENT_ID"
          value = "1005171984962-f6e00380sec28kh203502rg7pl4mu46g.apps.googleusercontent.com"
        }
        env {
          name = "GOOGLE_CLIENT_SECRET"
          value_from {
            secret_key_ref {
              key  = "latest"
              name = "GOOGLE_CLIENT_SECRET"
            }
          }
        }
        env {
          name  = "GOOGLE_SHEET_TEMPLATE_ID"
          value = "16dSJHdp-LphqhpodNPrpDCOJLSJmDEe-NNGiZR0lbqM"
        }
        env {
          name  = "SPRING_DATASOURCE_HIKARI_MAXIMUM-POOL-SIZE"
          value = "1"
        }
        env {
          name = "SPRING_DATASOURCE_PASSWORD"
          value_from {
            secret_key_ref {
              key  = "latest"
              name = "DATABASE_FLOCK_DATA_PASSWORD"
            }
          }
        }
        env {
          name  = "SPRING_DATASOURCE_USERNAME"
          value = "postgres"
        }
        env {
          name  = "SPRING_PROFILES_ACTIVE"
          value = "gcp"
        }
        env {
          name  = "WORKDAY_BUCKET_DOCUMENTS"
          value = "flock-workday-hour-sheets"
        }
        env {
          name  = "WORKDAY_LOGIN"
          value = "KRATOS"
        }
        env {
          name  = "WORKDAY_CALENDAR_TOKEN"
          value = "b6043754-2d47-11ee-be56-0242ac120002"
        }
      }
    }
  }
  traffic {
    percent         = 100
    latest_revision = true
  }
}
