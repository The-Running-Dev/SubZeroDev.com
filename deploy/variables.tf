variable "state_passphrase" {
  description = "Encrypts the state and plans stored in R2."
  type        = string
  sensitive   = true
}

variable "portainer_url" {
  type    = string
  default = "https://containers.subzerodev.com"
}

variable "portainer_api_key" {
  type      = string
  sensitive = true
}

variable "cf_access_client_id" {
  description = "Cloudflare Access service token in front of Portainer."
  type        = string
  sensitive   = true
}

variable "cf_access_client_secret" {
  type      = string
  sensitive = true
}

variable "dispatch_token" {
  description = "Token with Actions write on the Infra repository only; the deploy job uses it to start the Infra deploy workflow."
  type        = string
  sensitive   = true
}

variable "initial_image" {
  description = "Image applied when the stack is created, pinned by digest (ghcr.io/the-running-dev/subzerodev-com@sha256:...). Pass it with -var; deploys own the image afterwards."
  type        = string
}
