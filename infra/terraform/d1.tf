# sqlite-at-the-edge for the godlevski-api worker (DB binding)
resource "cloudflare_d1_database" "godlevski_db" {
  account_id = var.cloudflare_account_id
  name       = "godlevski-db"
}
