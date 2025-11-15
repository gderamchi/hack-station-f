#!/bin/bash

echo "Testing Setup API with correct model..."
echo ""

# Test the setup endpoint
curl -X POST http://localhost:3000/api/setup/complete \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{
    "companyName": "Test Company",
    "industry": "Technology",
    "description": "We provide AI-powered sales automation",
    "targetMarket": "B2B SaaS companies",
    "testName": "Guillaume Deramchi",
    "testPhone": "+33766830375",
    "testCompany": "Test Corp",
    "testRole": "CEO",
    "callNow": false
  }' | jq .

echo ""
echo "Test complete!"
