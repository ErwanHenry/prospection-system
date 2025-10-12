#!/bin/bash

##############################################################################
# SCRIPT DE TEST DE SÉCURITÉ - REACT ADMIN BACKOFFICES
# Usage: ./security-test.sh [business-plan|prospection-system|all]
##############################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

##############################################################################
# HELPER FUNCTIONS
##############################################################################

print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

print_test() {
    echo -e "${YELLOW}[TEST]${NC} $1"
}

print_pass() {
    echo -e "${GREEN}✓ PASS:${NC} $1"
    ((PASSED_TESTS++))
    ((TOTAL_TESTS++))
}

print_fail() {
    echo -e "${RED}✗ FAIL:${NC} $1"
    ((FAILED_TESTS++))
    ((TOTAL_TESTS++))
}

print_info() {
    echo -e "${BLUE}ℹ INFO:${NC} $1"
}

test_http_status() {
    local url="$1"
    local expected_status="$2"
    local description="$3"
    local auth="$4"

    print_test "$description"

    if [ -n "$auth" ]; then
        actual_status=$(curl -s -o /dev/null -w "%{http_code}" -u "$auth" "$url")
    else
        actual_status=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    fi

    if [ "$actual_status" -eq "$expected_status" ]; then
        print_pass "$description (Status: $actual_status)"
    else
        print_fail "$description (Expected: $expected_status, Got: $actual_status)"
    fi
}

test_cors() {
    local url="$1"
    local origin="$2"
    local should_allow="$3"
    local description="$4"

    print_test "$description"

    response=$(curl -s -H "Origin: $origin" \
        -H "Access-Control-Request-Method: GET" \
        -X OPTIONS \
        -i "$url" 2>&1)

    if echo "$response" | grep -q "Access-Control-Allow-Origin"; then
        if [ "$should_allow" = "yes" ]; then
            print_pass "$description (CORS allowed as expected)"
        else
            print_fail "$description (CORS should be blocked but was allowed)"
        fi
    else
        if [ "$should_allow" = "no" ]; then
            print_pass "$description (CORS blocked as expected)"
        else
            print_fail "$description (CORS should be allowed but was blocked)"
        fi
    fi
}

test_headers() {
    local url="$1"
    local header="$2"
    local description="$3"

    print_test "$description"

    if curl -s -I "$url" | grep -qi "$header"; then
        print_pass "$description (Header present)"
    else
        print_fail "$description (Header missing)"
    fi
}

##############################################################################
# BUSINESS PLAN TESTS
##############################################################################

test_business_plan() {
    local API_URL="https://business-plan-ahefysddy-erwan-henrys-projects.vercel.app"
    local ADMIN_URL="https://admin-gacebemru-erwan-henrys-projects.vercel.app"

    print_header "BUSINESS PLAN SECURITY TESTS"

    # Authentication Tests
    print_info "Testing Authentication..."
    test_http_status "$API_URL/api/scenarios" 401 "API should reject unauthenticated requests" ""
    test_http_status "$API_URL/health" 200 "Health endpoint should be public" ""

    # If credentials provided, test with auth
    if [ -n "$BP_USER" ] && [ -n "$BP_PASS" ]; then
        test_http_status "$API_URL/api/scenarios" 200 "API should accept authenticated requests" "$BP_USER:$BP_PASS"
    else
        print_info "Skipping authenticated tests (set BP_USER and BP_PASS env vars)"
    fi

    # CORS Tests
    print_info "Testing CORS Configuration..."
    test_cors "$API_URL/api/scenarios" "$ADMIN_URL" "yes" "CORS should allow admin origin"
    test_cors "$API_URL/api/scenarios" "https://malicious-site.com" "no" "CORS should block unknown origins"

    # Security Headers Tests
    print_info "Testing Security Headers..."
    test_headers "$API_URL" "X-Frame-Options" "X-Frame-Options header"
    test_headers "$API_URL" "X-Content-Type-Options" "X-Content-Type-Options header"
    test_headers "$API_URL" "Strict-Transport-Security" "HSTS header"

    # Input Validation Tests
    print_info "Testing Input Validation..."
    if [ -n "$BP_USER" ] && [ -n "$BP_PASS" ]; then
        # Test SQL injection attempt
        injection_status=$(curl -s -o /dev/null -w "%{http_code}" -u "$BP_USER:$BP_PASS" \
            -X POST "$API_URL/api/scenarios" \
            -H "Content-Type: application/json" \
            -d '{"name":"test","type":"' OR 1=1--"}')

        if [ "$injection_status" -eq 400 ] || [ "$injection_status" -eq 422 ]; then
            print_pass "API rejects SQL injection attempts (Status: $injection_status)"
            ((PASSED_TESTS++))
            ((TOTAL_TESTS++))
        else
            print_fail "API may be vulnerable to SQL injection (Status: $injection_status)"
            ((FAILED_TESTS++))
            ((TOTAL_TESTS++))
        fi
    fi
}

##############################################################################
# PROSPECTION SYSTEM TESTS
##############################################################################

test_prospection_system() {
    local API_URL="https://prospection-system-17iezdksp-erwan-henrys-projects.vercel.app"
    local ADMIN_URL="https://admin-al1xif0qv-erwan-henrys-projects.vercel.app"

    print_header "PROSPECTION SYSTEM SECURITY TESTS"

    # Authentication Tests
    print_info "Testing Authentication..."
    test_http_status "$API_URL/api/campaigns" 401 "API should reject unauthenticated requests" ""
    test_http_status "$API_URL/health" 200 "Health endpoint should be public" ""

    # If credentials provided, test with auth
    if [ -n "$PS_USER" ] && [ -n "$PS_PASS" ]; then
        test_http_status "$API_URL/api/campaigns" 200 "API should accept authenticated requests" "$PS_USER:$PS_PASS"
        test_http_status "$API_URL/api/prospects" 200 "Prospects API should accept authenticated requests" "$PS_USER:$PS_PASS"
    else
        print_info "Skipping authenticated tests (set PS_USER and PS_PASS env vars)"
    fi

    # CORS Tests
    print_info "Testing CORS Configuration..."
    test_cors "$API_URL/api/campaigns" "$ADMIN_URL" "yes" "CORS should allow admin origin"
    test_cors "$API_URL/api/campaigns" "https://attacker.com" "no" "CORS should block unknown origins"

    # Security Headers Tests
    print_info "Testing Security Headers..."
    test_headers "$API_URL" "X-Frame-Options" "X-Frame-Options header"
    test_headers "$API_URL" "X-Content-Type-Options" "X-Content-Type-Options header"
    test_headers "$API_URL" "Strict-Transport-Security" "HSTS header"

    # Rate Limiting Tests
    print_info "Testing Rate Limiting..."
    rate_limit_test "$API_URL/api/prospects"

    # Input Validation Tests
    print_info "Testing Input Validation..."
    if [ -n "$PS_USER" ] && [ -n "$PS_PASS" ]; then
        # Test XSS attempt
        xss_status=$(curl -s -o /dev/null -w "%{http_code}" -u "$PS_USER:$PS_PASS" \
            -X POST "$API_URL/api/prospects" \
            -H "Content-Type: application/json" \
            -d '{"fullName":"<script>alert(1)</script>","company":"Test"}')

        if [ "$xss_status" -eq 400 ] || [ "$xss_status" -eq 422 ]; then
            print_pass "API rejects XSS attempts (Status: $xss_status)"
            ((PASSED_TESTS++))
            ((TOTAL_TESTS++))
        else
            print_fail "API may be vulnerable to XSS (Status: $xss_status)"
            ((FAILED_TESTS++))
            ((TOTAL_TESTS++))
        fi
    fi
}

rate_limit_test() {
    local url="$1"
    local count=0

    print_test "Rate limiting protection"

    # Send 10 rapid requests
    for i in {1..10}; do
        status=$(curl -s -o /dev/null -w "%{http_code}" "$url")
        if [ "$status" -eq 429 ]; then
            count=$((count + 1))
        fi
    done

    if [ $count -gt 0 ]; then
        print_pass "Rate limiting active (blocked $count/10 requests)"
    else
        print_fail "Rate limiting not detected (0/10 blocked)"
    fi
}

##############################################################################
# DEPENDENCY VULNERABILITY TESTS
##############################################################################

test_dependencies() {
    print_header "DEPENDENCY VULNERABILITY SCAN"

    # business-plan
    if [ -d "/Users/erwanhenry/business-plan" ]; then
        print_info "Scanning business-plan dependencies..."
        cd /Users/erwanhenry/business-plan
        npm audit --json > /tmp/bp-audit.json 2>/dev/null || true

        vulnerabilities=$(jq '.metadata.vulnerabilities.total' /tmp/bp-audit.json 2>/dev/null || echo "0")

        if [ "$vulnerabilities" -eq 0 ]; then
            print_pass "business-plan: No vulnerabilities found"
            ((PASSED_TESTS++))
        else
            print_fail "business-plan: $vulnerabilities vulnerabilities found"
            ((FAILED_TESTS++))
        fi
        ((TOTAL_TESTS++))
    fi

    # prospection-system
    if [ -d "/Users/erwanhenry/prospection-system" ]; then
        print_info "Scanning prospection-system dependencies..."
        cd /Users/erwanhenry/prospection-system
        npm audit --json > /tmp/ps-audit.json 2>/dev/null || true

        vulnerabilities=$(jq '.metadata.vulnerabilities.total' /tmp/ps-audit.json 2>/dev/null || echo "0")

        if [ "$vulnerabilities" -eq 0 ]; then
            print_pass "prospection-system: No vulnerabilities found"
            ((PASSED_TESTS++))
        else
            print_fail "prospection-system: $vulnerabilities vulnerabilities found"
            ((FAILED_TESTS++))
        fi
        ((TOTAL_TESTS++))
    fi
}

##############################################################################
# SECRET SCANNING
##############################################################################

test_secrets() {
    print_header "SECRET SCANNING"

    # Check for exposed secrets in code
    print_info "Scanning for exposed secrets..."

    patterns=(
        "api_key"
        "API_KEY"
        "secret"
        "SECRET"
        "password"
        "PASSWORD"
        "token"
        "TOKEN"
        "private_key"
        "PRIVATE_KEY"
    )

    found_secrets=0

    for pattern in "${patterns[@]}"; do
        if grep -r --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" \
            -E "(const|let|var)\s+\w*${pattern}\w*\s*=\s*['\"]" \
            /Users/erwanhenry/business-plan /Users/erwanhenry/prospection-system 2>/dev/null | \
            grep -v "process.env" | grep -v "import.meta.env" | head -1; then
            found_secrets=$((found_secrets + 1))
        fi
    done

    if [ $found_secrets -eq 0 ]; then
        print_pass "No hardcoded secrets found in code"
        ((PASSED_TESTS++))
    else
        print_fail "$found_secrets potential hardcoded secrets found"
        ((FAILED_TESTS++))
    fi
    ((TOTAL_TESTS++))

    # Check .env files in git history
    print_info "Checking for .env in git history..."

    for project in "/Users/erwanhenry/business-plan" "/Users/erwanhenry/prospection-system"; do
        if [ -d "$project/.git" ]; then
            cd "$project"
            if git log --all --full-history -- ".env" 2>/dev/null | grep -q "commit"; then
                print_fail "$(basename $project): .env file found in git history"
                ((FAILED_TESTS++))
            else
                print_pass "$(basename $project): No .env in git history"
                ((PASSED_TESTS++))
            fi
            ((TOTAL_TESTS++))
        fi
    done
}

##############################################################################
# REPORT GENERATION
##############################################################################

generate_report() {
    print_header "SECURITY TEST SUMMARY"

    echo -e "Total Tests: ${BLUE}$TOTAL_TESTS${NC}"
    echo -e "Passed: ${GREEN}$PASSED_TESTS${NC}"
    echo -e "Failed: ${RED}$FAILED_TESTS${NC}"

    local pass_rate=$((PASSED_TESTS * 100 / TOTAL_TESTS))
    echo -e "\nPass Rate: ${BLUE}${pass_rate}%${NC}"

    if [ $pass_rate -ge 80 ]; then
        echo -e "\n${GREEN}✓ SECURITY STATUS: GOOD${NC}"
        echo -e "Your applications have a strong security posture."
    elif [ $pass_rate -ge 60 ]; then
        echo -e "\n${YELLOW}⚠ SECURITY STATUS: MODERATE${NC}"
        echo -e "Some security improvements needed."
    else
        echo -e "\n${RED}✗ SECURITY STATUS: CRITICAL${NC}"
        echo -e "Immediate action required to secure your applications."
    fi

    # Recommendations
    if [ $FAILED_TESTS -gt 0 ]; then
        echo -e "\n${YELLOW}RECOMMENDATIONS:${NC}"

        if [ $pass_rate -lt 60 ]; then
            echo "1. Implement Basic Auth immediately (see SECURITY_QUICK_FIX_GUIDE.md)"
            echo "2. Configure CORS with whitelist"
            echo "3. Update vulnerable dependencies"
        fi

        echo "4. Review SECURITY_AUDIT_REPORT.md for detailed vulnerabilities"
        echo "5. Follow the prioritized action plan"
    fi

    # Save report
    report_file="/tmp/security-test-report-$(date +%Y%m%d-%H%M%S).txt"
    {
        echo "SECURITY TEST REPORT"
        echo "===================="
        echo "Date: $(date)"
        echo ""
        echo "Total Tests: $TOTAL_TESTS"
        echo "Passed: $PASSED_TESTS"
        echo "Failed: $FAILED_TESTS"
        echo "Pass Rate: ${pass_rate}%"
    } > "$report_file"

    echo -e "\n${BLUE}Report saved to: $report_file${NC}"
}

##############################################################################
# MAIN
##############################################################################

main() {
    echo -e "${BLUE}"
    echo "╔════════════════════════════════════════╗"
    echo "║   REACT ADMIN SECURITY TEST SUITE      ║"
    echo "╔════════════════════════════════════════╗"
    echo -e "${NC}"

    local target="${1:-all}"

    case "$target" in
        business-plan)
            test_business_plan
            ;;
        prospection-system)
            test_prospection_system
            ;;
        all)
            test_business_plan
            test_prospection_system
            test_dependencies
            test_secrets
            ;;
        *)
            echo "Usage: $0 [business-plan|prospection-system|all]"
            exit 1
            ;;
    esac

    generate_report

    # Exit with error if any tests failed
    if [ $FAILED_TESTS -gt 0 ]; then
        exit 1
    fi
}

# Run main
main "$@"
