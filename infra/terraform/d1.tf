# sqlite-at-the-edge for the godlevski-api worker (DB binding)
resource "cloudflare_d1_database" "godlevski_db" {
  account_id = var.cloudflare_account_id
  name       = "godlevski-db"

  # provider v5 sends `read_replication: null` on update if unset and the API
  # 400s on it — must stay explicit
  read_replication = {
    mode = "disabled"
  }
}
