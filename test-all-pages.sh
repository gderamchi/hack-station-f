#!/bin/bash
echo "🧪 Testing All Mirai Pages..."
echo "=============================="
echo ""

PASS=0
FAIL=0

test_page() {
    local name="$1"
    local url="$2"
    local expected="$3"
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    
    if [ "$response" = "$expected" ]; then
        echo "✅ $name: $response"
        PASS=$((PASS + 1))
    else
        echo "❌ $name: $response (expected $expected)"
        FAIL=$((FAIL + 1))
    fi
}

echo "Public Pages:"
test_page "Homepage" "http://localhost:3000" "200"
test_page "Login" "http://localhost:3000/login" "200"
test_page "Register" "http://localhost:3000/register" "200"

echo ""
echo "Protected Pages (should redirect to login):"
test_page "Dashboard" "http://localhost:3000/dashboard" "307"
test_page "Onboarding" "http://localhost:3000/dashboard/onboarding" "307"
test_page "Campaigns" "http://localhost:3000/dashboard/campaigns" "307"
test_page "Scripts" "http://localhost:3000/dashboard/scripts" "307"
test_page "Voices" "http://localhost:3000/dashboard/voices" "307"
test_page "Analytics" "http://localhost:3000/dashboard/analytics" "307"

echo ""
echo "API Endpoints:"
test_page "Auth Session" "http://localhost:3000/api/auth/session" "200"
test_page "Auth Providers" "http://localhost:3000/api/auth/providers" "200"
test_page "Auth CSRF" "http://localhost:3000/api/auth/csrf" "200"

echo ""
echo "=============================="
echo "Results: $PASS passed, $FAIL failed"
echo "=============================="

if [ $FAIL -eq 0 ]; then
    echo "✅ ALL TESTS PASSED!"
    exit 0
else
    echo "❌ Some tests failed"
    exit 1
fi
