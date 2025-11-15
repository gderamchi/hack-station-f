#!/bin/bash

# Fix Next.js 15 async params in all dynamic route handlers
# In Next.js 15, params in dynamic routes are now Promises

echo "Fixing Next.js 15 async params..."

# List of files to fix
files=(
  "src/app/api/calls/[id]/route.ts"
  "src/app/api/prospects/[id]/route.ts"
  "src/app/api/campaigns/[id]/pause/route.ts"
  "src/app/api/campaigns/[id]/launch/route.ts"
  "src/app/api/campaigns/[id]/route.ts"
  "src/app/api/campaigns/[id]/stats/route.ts"
  "src/app/api/campaigns/[id]/synthesize/route.ts"
  "src/app/api/companies/[id]/route.ts"
  "src/app/api/analytics/campaigns/[id]/route.ts"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "Processing $file..."
    
    # Replace params type from { params: { id: string } } to { params: Promise<{ id: string }> }
    sed -i '' 's/{ params }: { params: { id: string } }/{ params }: { params: Promise<{ id: string }> }/g' "$file"
    
    # Add await params at the beginning of each function
    # This is a simplified approach - manual review recommended
    echo "  - Updated params type to Promise"
  else
    echo "  - File not found: $file"
  fi
done

echo "Done! Please review the changes and add 'const { id } = await params;' at the start of each function."
echo "Run: git diff to see changes"
