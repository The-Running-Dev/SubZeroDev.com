# Adopts the existing SubZeroDev.com stack (Portainer stack 12) into OpenTofu through modules/app of
# SubZeroDev.Infra: a Cloudflare tunnel and the `www` DNS record, the Portainer Git stack and the GitHub
# `production` environment. The apex stays on the VPS A record until NPM is retired.
# Run through deploy/tofu.ps1; see deploy/README.md.
terraform {
  required_version = ">= 1.10"

  required_providers {
    cloudflare = { source = "cloudflare/cloudflare", version = "5.28.1" }
    portainer  = { source = "portainer/portainer", version = "2.2.0" }
    github     = { source = "integrations/github", version = "6.13.0" }
    random     = { source = "hashicorp/random", version = "3.9.1" }
    http       = { source = "hashicorp/http", version = "3.6.3" }
  }

  # Bucket, key and endpoint come from backend.hcl (Git-ignored); R2 keys from AWS_ACCESS_KEY_ID and
  # AWS_SECRET_ACCESS_KEY, which tofu.ps1 maps from the R2_* variables.
  backend "s3" {
    region                      = "auto"
    use_lockfile                = true
    use_path_style              = true
    skip_credentials_validation = true
    skip_region_validation      = true
    skip_requesting_account_id  = true
    skip_metadata_api_check     = true
    skip_s3_checksum            = true
  }

  encryption {
    key_provider "pbkdf2" "main" {
      passphrase = var.state_passphrase
    }
    method "aes_gcm" "main" {
      keys = key_provider.pbkdf2.main
    }
    state {
      method   = method.aes_gcm.main
      enforced = true
    }
    plan {
      method   = method.aes_gcm.main
      enforced = true
    }
  }
}

provider "cloudflare" {} # CLOUDFLARE_API_TOKEN

provider "github" {
  owner = "The-Running-Dev" # GITHUB_TOKEN
}

provider "portainer" {
  endpoint = var.portainer_url
  api_key  = var.portainer_api_key
  custom_headers = {
    "CF-Access-Client-Id"     = var.cf_access_client_id
    "CF-Access-Client-Secret" = var.cf_access_client_secret
  }
}

module "app" {
  source = "git::https://github.com/The-Running-Dev/SubZeroDev.Infra.git//modules/app?ref=v2.1.0"

  name          = "subzerodev-web" # The existing Portainer stack name; it is the compose project
  repository    = "The-Running-Dev/SubZeroDev.com"
  compose_files = ["docker-compose.yml", "compose.tunnel.yaml"]

  # The apex and www both serve the site. The apex was reached through Nginx Proxy Manager on the host.
  routes = {
    "@" = "http://subzerodev-com:80" # subzerodev.com
    www = "http://subzerodev-com:80" # www.subzerodev.com
  }

  public_route = "www" # the deploy health check keeps polling www

  image = {
    variable = "SUBZERODEV_COM_IMAGE"
    initial  = var.initial_image # applied once at import; deploys own the image afterwards
  }

  # The stack holds no environment values of its own.
  health_path   = "/__health.json"
  portainer_url = var.portainer_url
  portainer_credentials = {
    api_key              = var.portainer_api_key
    access_client_id     = var.cf_access_client_id
    access_client_secret = var.cf_access_client_secret
  }
  dispatch_token  = var.dispatch_token # stored as INFRA_DISPATCH_TOKEN; starts the Infra deploy workflow
  git_credentials = null               # the repository is public
  registry_ids    = [1]                # the shared ghcr.io registry
}

# Adopt what already exists, so nothing is recreated. The provider forces a replacement of the stack
# (additional_files): the stack is deleted and created again; the site is down for about a minute.
import {
  to = module.app.portainer_stack.this
  id = "3-12-standalone-repository" # <endpoint>-<stack>-<type>-<method>
}

# www already exists as a proxied CNAME to the apex; it is repointed to the tunnel.
import {
  to = module.app.cloudflare_dns_record.route["www"]
  id = "e958380ca90211dfa0fc68c5c2df277f/58375682d37507aacb684765d12a1e5d"
}

# The apex is an unproxied A record to the VPS. It becomes a proxied CNAME to the tunnel (Cloudflare flattens it,
# so the Proton MX and TXT records on the apex are unaffected); the provider replaces the record.
import {
  to = module.app.cloudflare_dns_record.route["@"]
  id = "e958380ca90211dfa0fc68c5c2df277f/c9aa289f81532eb726d446c9e12602dc"
}

output "public_url" {
  value = "https://www.subzerodev.com"
}
