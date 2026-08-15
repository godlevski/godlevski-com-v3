# the godlevski.com zone itself — terraform-owned. After apply, set the
# nameservers printed by `terraform output godlevski_com_nameservers` at the
# domain registrar; cloudflare activates the zone once delegation lands.
resource "cloudflare_zone" "godlevski_com" {
  account = {
    id = var.cloudflare_account_id
  }
  name = "godlevski.com"
  type = "full"
}

output "godlevski_com_zone_id" {
  value = cloudflare_zone.godlevski_com.id
}

output "godlevski_com_nameservers" {
  value = cloudflare_zone.godlevski_com.name_servers
}
