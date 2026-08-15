source .env          # loads CLOUDFLARE_API_TOKEN
terraform init       # first time only (downloads the cloudflare provider)
terraform plan       # dry run — review what it wants to create
terraform apply      # creates the R2 bucket + D1 database
