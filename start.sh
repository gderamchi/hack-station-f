#!/bin/bash

echo "🚀 Starting Mirai..."
echo ""

cd "$(dirname "$0")"

# Use the correct Node.js directly with Next.js
/opt/homebrew/bin/node ./node_modules/.bin/next dev
