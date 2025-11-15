#!/bin/bash

echo "🔧 Fixing all async params for Next.js 16..."
echo ""

cd /Users/guillaume_deramchi/Documents/hack-station-f

# Fix companies/[id]/route.ts
if [ -f "src/app/api/companies/[id]/route.ts" ]; then
    echo "Fixing companies/[id]/route.ts..."
    sed -i '' 's/{ params }: { params: { id: string } }/{ params }: { params: Promise<{ id: string }> }/g' "src/app/api/companies/[id]/route.ts"
    sed -i '' 's/params\.id/id/g' "src/app/api/companies/[id]/route.ts"
    # Add await params at start of each function
    sed -i '' '/export async function GET/a\
  const { id } = await params;
' "src/app/api/companies/[id]/route.ts"
    echo "✓ Fixed companies/[id]/route.ts"
fi

# Fix calls/[id]/route.ts
if [ -f "src/app/api/calls/[id]/route.ts" ]; then
    echo "Fixing calls/[id]/route.ts..."
    sed -i '' 's/{ params }: { params: { id: string } }/{ params }: { params: Promise<{ id: string }> }/g' "src/app/api/calls/[id]/route.ts"
    echo "✓ Fixed calls/[id]/route.ts"
fi

# Fix prospects/[id]/route.ts
if [ -f "src/app/api/prospects/[id]/route.ts" ]; then
    echo "Fixing prospects/[id]/route.ts..."
    sed -i '' 's/{ params }: { params: { id: string } }/{ params }: { params: Promise<{ id: string }> }/g' "src/app/api/prospects/[id]/route.ts"
    echo "✓ Fixed prospects/[id]/route.ts"
fi

# Fix analytics/campaigns/[id]/route.ts
if [ -f "src/app/api/analytics/campaigns/[id]/route.ts" ]; then
    echo "Fixing analytics/campaigns/[id]/route.ts..."
    sed -i '' 's/{ params }: { params: { id: string } }/{ params }: { params: Promise<{ id: string }> }/g' "src/app/api/analytics/campaigns/[id]/route.ts"
    echo "✓ Fixed analytics/campaigns/[id]/route.ts"
fi

echo ""
echo "✅ All async params fixed!"
echo ""
echo "⚠️  Note: You may need to manually add 'const { id } = await params;' at the start of each function"
echo "Run 'git diff' to see all changes"
