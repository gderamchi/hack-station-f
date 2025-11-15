#!/bin/bash

echo "🧪 Testing Mirai System..."
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

PASSED=0
FAILED=0

# Test function
test_endpoint() {
    local name=$1
    local url=$2
    local expected=$3
    
    echo -n "Testing $name... "
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    
    if [ "$response" = "$expected" ]; then
        echo -e "${GREEN}✓ PASS${NC} (HTTP $response)"
        ((PASSED++))
    else
        echo -e "${RED}✗ FAIL${NC} (Expected $expected, got $response)"
        ((FAILED++))
    fi
}

# Test 1: Server is running
echo "1. Server Health Checks"
echo "----------------------"
test_endpoint "Homepage" "http://localhost:3000" "200"
test_endpoint "Login page" "http://localhost:3000/login" "200"
test_endpoint "Register page" "http://localhost:3000/register" "200"
test_endpoint "API Auth Session" "http://localhost:3000/api/auth/session" "200"
test_endpoint "API Auth Providers" "http://localhost:3000/api/auth/providers" "200"
echo ""

# Test 2: Database connection
echo "2. Database Connection"
echo "---------------------"
if [ -f ".env.local" ] && grep -q "DATABASE_URL" ".env.local"; then
    echo -e "${GREEN}✓ PASS${NC} - DATABASE_URL configured"
    ((PASSED++))
else
    echo -e "${RED}✗ FAIL${NC} - DATABASE_URL not found"
    ((FAILED++))
fi
echo ""

# Test 3: Environment variables
echo "3. Environment Variables"
echo "-----------------------"
check_env() {
    local var=$1
    if grep -q "$var=" ".env.local" 2>/dev/null; then
        echo -e "${GREEN}✓${NC} $var"
        ((PASSED++))
    else
        echo -e "${RED}✗${NC} $var"
        ((FAILED++))
    fi
}

check_env "NEXTAUTH_SECRET"
check_env "TWILIO_ACCOUNT_SID"
check_env "TWILIO_AUTH_TOKEN"
check_env "TWILIO_PHONE_NUMBER"
check_env "ELEVENLABS_API_KEY"
check_env "MISTRAL_API_KEY"
check_env "BLACKBOX_API_KEY"
echo ""

# Test 4: Dependencies
echo "4. Dependencies"
echo "--------------"
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓ PASS${NC} - node_modules exists"
    ((PASSED++))
else
    echo -e "${RED}✗ FAIL${NC} - node_modules missing"
    ((FAILED++))
fi

if [ -d "node_modules/@prisma/client" ]; then
    echo -e "${GREEN}✓ PASS${NC} - Prisma client generated"
    ((PASSED++))
else
    echo -e "${RED}✗ FAIL${NC} - Prisma client not generated"
    ((FAILED++))
fi

if [ -d "node_modules/twilio" ]; then
    echo -e "${GREEN}✓ PASS${NC} - Twilio SDK installed"
    ((PASSED++))
else
    echo -e "${RED}✗ FAIL${NC} - Twilio SDK missing"
    ((FAILED++))
fi
echo ""

# Test 5: File structure
echo "5. File Structure"
echo "----------------"
check_file() {
    local file=$1
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $file"
        ((PASSED++))
    else
        echo -e "${RED}✗${NC} $file"
        ((FAILED++))
    fi
}

check_file "src/app/page.tsx"
check_file "src/app/(auth)/login/page.tsx"
check_file "src/app/(auth)/register/page.tsx"
check_file "src/app/(dashboard)/page.tsx"
check_file "src/lib/auth/auth-config.ts"
check_file "src/lib/ai/openai-client.ts"
check_file "prisma/schema.prisma"
echo ""

# Summary
echo "================================"
echo "Test Summary"
echo "================================"
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ ALL TESTS PASSED!${NC}"
    echo ""
    echo "🎉 System is ready for demo!"
    echo ""
    echo "Next steps:"
    echo "1. Open http://localhost:3000"
    echo "2. Register an account"
    echo "3. Complete onboarding"
    echo "4. Create a campaign"
    echo "5. Start calling!"
    exit 0
else
    echo -e "${YELLOW}⚠ Some tests failed${NC}"
    echo ""
    echo "Please fix the issues above before proceeding."
    exit 1
fi
