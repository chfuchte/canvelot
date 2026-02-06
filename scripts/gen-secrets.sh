#!/bin/sh

set -e

echo "Bootstrapping secrets directory..."

mkdir -p secrets

if [ ! -s secrets/auth_secret.txt ]; then
    echo "Generating auth secret..."
    openssl rand -base64 32 > secrets/auth_secret.txt
else 
    echo "Auth secret already exists, skipping generation."
fi

if [ ! -s secrets/oauth_client_id.txt ]; then
    touch secrets/oauth_client_id.txt
    echo "Please fill in the OAuth client ID in secrets/oauth_client_id.txt"
else
    echo "OAuth client ID already exists, skipping creation."
fi

if [ ! -s secrets/oauth_client_secret.txt ]; then
    touch secrets/oauth_client_secret.txt
    echo "Please fill in the OAuth client secret in secrets/oauth_client_secret.txt"
else
    echo "OAuth client secret already exists, skipping creation."
fi

if [ ! -s secrets/oauth_discovery_url.txt ]; then
    touch secrets/oauth_discovery_url.txt
    echo "Please fill in the OAuth discovery URL in secrets/oauth_discovery_url.txt"
else
    echo "OAuth discovery URL already exists, skipping creation."
fi

if [ ! -s secrets/oauth_logout_redirect_url.txt ]; then
    touch secrets/oauth_logout_redirect_url.txt
    echo "Please fill in the OAuth redirect URI in secrets/oauth_logout_redirect_url.txt"
else
    echo "OAuth redirect URI already exists, skipping creation."
fi

echo "Secrets generation complete."
