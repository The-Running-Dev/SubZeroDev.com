# deploy

OpenTofu root that adopts the SubZeroDev.com stack (Portainer stack 12) through `modules/app` of SubZeroDev.Infra: a Cloudflare tunnel with the `www` hostname, the Portainer Git stack (`docker-compose.yml` + `compose.tunnel.yaml`) and the GitHub `production` environment. The apex `subzerodev.com` stays on the VPS A record until NPM is retired.

State: R2 bucket `subzerodev-tofu-state`, key `apps/subzerodev-web.tfstate`, encrypted. Run everything through `deploy/tofu.ps1`; it reads credentials from your User environment variables and never prints them.

## First adoption

1. Merge the PR that adds this root to `main` (Portainer pulls the compose files from `main`).
2. Get the digest of the image `main` published: `ghcr.io/the-running-dev/subzerodev-com@sha256:...`.
3. `./deploy/tofu.ps1 plan -var "initial_image=ghcr.io/the-running-dev/subzerodev-com@sha256:<digest>"`. Expect: the stack replaced (about a minute of downtime, no volumes involved), the `www` record repointed to the tunnel, a tunnel, the GitHub environment, `INFRA_DISPATCH_TOKEN`, `APP_SUBZERODEV_WEB` and `DEPLOY_ENABLED`.
4. Apply with the same `-var`. Check `https://www.subzerodev.com/__health.json`, then a second `plan` shows no changes.

## Deploys

A push to `main` builds the image and the `deploy` job in `.github/workflows/ci.yml` starts the Infra deploy workflow with the digest. That workflow pins the digest in the stack and polls `https://www.subzerodev.com/__health.json` until `revision` equals the commit. `DEPLOY_ENABLED` (set by this root) switches the job on.
