# react builds — served by the godlevski-r2 worker
resource "cloudflare_r2_bucket" "godlevski_web" {
  account_id = var.cloudflare_account_id
  name       = "godlevski-web"
}

resource "cloudflare_r2_bucket" "art_godlevski_web" {
  account_id = var.cloudflare_account_id
  name       = "art-godlevski-web"
}
