resource "google_sql_database_instance" "flock-data" {
  name             = "flock-data"
  database_version = "POSTGRES_9_6"
  region           = "europe-west1"

  settings {
    tier = "db-f1-micro"
    insights_config {
      query_insights_enabled = true
      query_plans_per_minute = 5
      query_string_length = 1024
      record_application_tags = false
      record_client_address = false
    }
    maintenance_window {
      day = 6
      hour = 22
    }
  }
}
