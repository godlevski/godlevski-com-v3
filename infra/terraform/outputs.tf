# paste into workers/godlevski-api/wrangler.jsonc -> d1_databases[0].database_id
output "godlevski_db_id" {
  value = cloudflare_d1_database.godlevski_db.id
}
