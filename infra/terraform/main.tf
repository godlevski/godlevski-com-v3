terraform {
  required_version = ">= 1.5"

  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 5.0"
    }
  }

  # state stays local for now; move to an R2 backend (s3-compatible) or
  # Terraform Cloud when this grows beyond one machine
}

# auth: export CLOUDFLARE_API_TOKEN=... (needs R2:Edit, D1:Edit; Zone/DNS:Edit
# once routes/records move in here)
provider "cloudflare" {}
