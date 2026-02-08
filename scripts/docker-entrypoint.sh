#!/bin/sh

set -e

export OAUTH_CLIENT_ID="$(cat /run/secrets/oauth_client_id)"
export OAUTH_CLIENT_SECRET="$(cat /run/secrets/oauth_client_secret)"
export OAUTH_DISCOVERY_URL="$(cat /run/secrets/oauth_discovery_url)"
export OAUTH_LOGOUT_REDIRECT_URL="$(cat /run/secrets/oauth_logout_redirect_url)"
export AUTH_SECRET="$(cat /run/secrets/auth_secret)"

exec "$@"
