#!/usr/bin/env bash

# Run the frontend against the local backend.
# Uses env vars so the React app knows which server to call.

set -euo pipefail

export VITE_API_BASE_URL="http://127.0.0.1:8000"
export REACT_APP_API_BASE_URL="$VITE_API_BASE_URL"

npm run dev

