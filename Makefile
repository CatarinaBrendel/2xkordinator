.PHONY: dev deploy push clean

# Git remote/branch used by `make deploy` (can be overridden):
DEPLOY_REMOTE ?= origin
DEPLOY_BRANCH ?= main

# Makefile for local development of the Cloudflare Worker Discord bot.
#
# Targets:
#   make dev     Start local dev server (wrangler dev) and expose via cloudflared
#   make build   Run project's build script (if present)
#   make test    Run tests (if present)
#   make lint    Run linter (if present)
#   make deploy  Build then deploy via `npm run deploy` (wrangler deploy)
#   make clean   Remove common build artifacts
#
# Notes:
# - `cloudflared` should be installed for `make dev` to create a public tunnel.
# - `npm run dev` maps to `wrangler dev` in this project (see package.json).
# - Adjust ports/commands below if your dev server uses a different port.

dev:
	@command -v cloudflared >/dev/null 2>&1 || { echo "cloudflared is not installed"; exit 1; }
	@set -e; \
	npm run dev & \
	WRANGLER_PID=$$!; \
	trap 'kill $$WRANGLER_PID' EXIT INT TERM; \
	sleep 3; \
	cloudflared tunnel --url http://localhost:8787

push:
	git push $(DEPLOY_REMOTE) $(DEPLOY_BRANCH)

deploy: push

clean:
	rm -rf dist build .cache .parcel-cache coverage .nyc_output