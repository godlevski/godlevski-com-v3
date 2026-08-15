# zone wiring: DNS records + worker routes. Worker code itself deploys via
# wrangler; terraform owns which hostnames/paths reach which worker.
#
# token scopes needed (add to the api token), set to "All zones from an
# account" since the zone is terraform-created: Zone -> Zone: Edit,
# Zone -> DNS: Edit, Zone -> Workers Routes: Edit.

# --- DNS ---------------------------------------------------------------
# proxied placeholder records: traffic terminates at cloudflare's edge and
# the worker routes below take it from there (100:: is the standard dummy)

resource "cloudflare_dns_record" "apex" {
  zone_id = cloudflare_zone.godlevski_com.id
  name    = "godlevski.com"
  type    = "AAAA"
  content = "100::"
  proxied = true
  ttl     = 1
}

resource "cloudflare_dns_record" "art" {
  zone_id = cloudflare_zone.godlevski_com.id
  name    = "art"
  type    = "AAAA"
  content = "100::"
  proxied = true
  ttl     = 1
}

resource "cloudflare_dns_record" "files" {
  zone_id = cloudflare_zone.godlevski_com.id
  name    = "files"
  type    = "AAAA"
  content = "100::"
  proxied = true
  ttl     = 1
}

# --- worker routes -----------------------------------------------------
# most-specific pattern wins, so /api/* and /files/* carve out of the
# per-site catch-alls

# godlevski.com
resource "cloudflare_workers_route" "godlevski_api" {
  zone_id = cloudflare_zone.godlevski_com.id
  pattern = "godlevski.com/api/*"
  script  = "godlevski-api"
}

resource "cloudflare_workers_route" "godlevski_files" {
  zone_id = cloudflare_zone.godlevski_com.id
  pattern = "godlevski.com/files/*"
  script  = "godlevski-files"
}

resource "cloudflare_workers_route" "godlevski_web" {
  zone_id = cloudflare_zone.godlevski_com.id
  pattern = "godlevski.com/*"
  script  = "godlevski-r2"
}

# art.godlevski.com — gallery images are relative /files/* urls, so the
# files carve-out exists here too
resource "cloudflare_workers_route" "art_files" {
  zone_id = cloudflare_zone.godlevski_com.id
  pattern = "art.godlevski.com/files/*"
  script  = "godlevski-files"
}

resource "cloudflare_workers_route" "art_web" {
  zone_id = cloudflare_zone.godlevski_com.id
  pattern = "art.godlevski.com/*"
  script  = "art-godlevski-r2"
}

# files.godlevski.com — the shared files cap
resource "cloudflare_workers_route" "files_cap" {
  zone_id = cloudflare_zone.godlevski_com.id
  pattern = "files.godlevski.com/*"
  script  = "godlevski-files"
}
