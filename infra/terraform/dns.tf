# --- boilerplate, uncomment when pointing the domains at the workers ---
# worker code itself deploys via wrangler; terraform only owns zone wiring
#
# variable "cloudflare_zone_id" {
#   description = "zone id for godlevski.com"
#   type        = string
# }
#
# # each site -> its static worker
# resource "cloudflare_workers_route" "godlevski_web" {
#   zone_id = var.cloudflare_zone_id
#   pattern = "godlevski.com/*"
#   script  = "godlevski-r2"
# }
#
# resource "cloudflare_workers_route" "art_godlevski_web" {
#   zone_id = var.cloudflare_zone_id
#   pattern = "art.godlevski.com/*"
#   script  = "art-godlevski-r2"
# }
#
# # /api/* -> api worker (more specific pattern wins over the /* route)
# resource "cloudflare_workers_route" "godlevski_api" {
#   zone_id = var.cloudflare_zone_id
#   pattern = "godlevski.com/api/*"
#   script  = "godlevski-api"
# }
#
# resource "cloudflare_workers_route" "art_godlevski_api" {
#   zone_id = var.cloudflare_zone_id
#   pattern = "art.godlevski.com/api/*"
#   script  = "godlevski-api"
# }
