# react builds — served by the godlevski-r2 worker
resource "cloudflare_r2_bucket" "godlevski_web" {
  account_id = var.cloudflare_account_id
  name       = "godlevski-web"
}

resource "cloudflare_r2_bucket" "art_godlevski_web" {
  account_id = var.cloudflare_account_id
  name       = "art-godlevski-web"
}

# public files for both sites, served by the godlevski-files worker
# (slides originals, shapefiles, assorted; synced via infra/sync-files.sh)
resource "cloudflare_r2_bucket" "godlevski_files" {
  account_id = var.cloudflare_account_id
  name       = "godlevski-files"
}
