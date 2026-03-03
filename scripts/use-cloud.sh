#!/usr/bin/env bash

# Run the frontend against the deployed cloud backend.
# Uses env vars so the React app knows which server to call.

set -euo pipefail

export VITE_API_BASE_URL="https://wamp-limjiannn.pythonanywhere.com"
export REACT_APP_API_BASE_URL="$VITE_API_BASE_URL"

npm run dev

