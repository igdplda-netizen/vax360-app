#!/bin/bash
set -e

npm install --legacy-peer-deps --no-audit --no-fund

if [ -f backend/package.json ]; then
  cd backend && npm install --no-audit --no-fund
fi
