output "godlevski_db_id" {
  value = cloudflare_d1_database.godlevski_db.id
}

# machine-readable ids manifest, tracked in git — `pnpm infra:sync-ids`
# patches worker wrangler.jsonc files from it, so resource ids flow from
# terraform instead of being hand-pasted
resource "local_file" "cloudflare_ids" {
  filename = "${path.module}/../generated/cloudflare-ids.json"
  content = jsonencode({
    d1 = {
      "godlevski-db" = cloudflare_d1_database.godlevski_db.id
    }
  })
}
