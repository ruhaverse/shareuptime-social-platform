#!/bin/bash

# ShareUpTime Smoke Tests
# This script performs basic health checks on all services

set -e

echo "🚀 Starting ShareUpTime Smoke Tests..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test configuration
API_GATEWAY_URL="http://localhost:3000"
AUTH_SERVICE_URL="http://localhost:3001"
USER_SERVICE_URL="http://localhost:3002"
POST_SERVICE_URL="http://localhost:3003"
FEED_SERVICE_URL="http://localhost:3004"
MEDIA_SERVICE_URL="http://localhost:3005"
NOTIFICATION_SERVICE_URL="http://localhost:3006"

# Database URLs
POSTGRES_URL="localhost:5432"
MONGODB_URL="localhost:27017"
NEO4J_URL="localhost:7474"
REDIS_URL="localhost:6379"
MINIO_URL="http://localhost:9000"
ELASTICSEARCH_URL="http://localhost:9200"

# Function to test HTTP endpoint
test_http_endpoint() {
    local name=$1
    local url=$2
    local expected_status=${3:-200}
    
    echo -n "Testing $name... "
    
    if response=$(curl -s -o /dev/null -w "%{http_code}" "$url/health" 2>/dev/null); then
        if [ "$response" = "$expected_status" ]; then
            echo -e "${GREEN}✓ OK${NC} ($response)"
            return 0
        else
            echo -e "${RED}✗ FAIL${NC} (HTTP $response)"
            return 1
        fi
    else
        echo -e "${RED}✗ FAIL${NC} (Connection failed)"
        return 1
    fi
}

# Function to test TCP connection
test_tcp_connection() {
    local name=$1
    local host=$2
    local port=$3
    
    echo -n "Testing $name connection... "
    
    if timeout 5 bash -c "</dev/tcp/$host/$port" 2>/dev/null; then
        echo -e "${GREEN}✓ OK${NC}"
        return 0
    else
        echo -e "${RED}✗ FAIL${NC}"
        return 1
    fi
}

# Function to test database
test_database() {
    local name=$1
    local url=$2
    
    echo -n "Testing $name... "
    
    case $name in
        "Elasticsearch")
            if response=$(curl -s "$url" 2>/dev/null | grep -q "elasticsearch"); then
                echo -e "${GREEN}✓ OK${NC}"
                return 0
            else
                echo -e "${RED}✗ FAIL${NC}"
                return 1
            fi
            ;;
        "MinIO")
            if response=$(curl -s "$url/minio/health/ready" 2>/dev/null); then
                echo -e "${GREEN}✓ OK${NC}"
                return 0
            else
                echo -e "${RED}✗ FAIL${NC}"
                return 1
            fi
            ;;
        *)
            echo -e "${YELLOW}? SKIP${NC} (No test implemented)"
            return 0
            ;;
    esac
}

# Test results
failed_tests=0
total_tests=0

echo ""
echo "📊 Testing Microservices..."
echo "================================"

# Test microservices
services=(
    "API Gateway:$API_GATEWAY_URL"
    "Auth Service:$AUTH_SERVICE_URL"
    "User Service:$USER_SERVICE_URL"
    "Post Service:$POST_SERVICE_URL"
    "Feed Service:$FEED_SERVICE_URL"
    "Media Service:$MEDIA_SERVICE_URL"
    "Notification Service:$NOTIFICATION_SERVICE_URL"
)

for service in "${services[@]}"; do
    IFS=':' read -r name url <<< "$service"
    total_tests=$((total_tests + 1))
    if ! test_http_endpoint "$name" "$url"; then
        failed_tests=$((failed_tests + 1))
    fi
done

echo ""
echo "🗄️  Testing Databases..."
echo "========================"

# Test database connections
databases=(
    "PostgreSQL:localhost:5432"
    "MongoDB:localhost:27017"
    "Neo4j HTTP:localhost:7474"
    "Redis:localhost:6379"
)

for db in "${databases[@]}"; do
    IFS=':' read -r name host port <<< "$db"
    total_tests=$((total_tests + 1))
    if ! test_tcp_connection "$name" "$host" "$port"; then
        failed_tests=$((failed_tests + 1))
    fi
done

# Test HTTP-based services
http_services=(
    "Elasticsearch:$ELASTICSEARCH_URL"
    "MinIO:$MINIO_URL"
)

for service in "${http_services[@]}"; do
    IFS=':' read -r name url <<< "$service"
    total_tests=$((total_tests + 1))
    if ! test_database "$name" "$url"; then
        failed_tests=$((failed_tests + 1))
    fi
done

echo ""
echo "🔗 Testing API Integration..."
echo "============================="

# Test API Gateway routing
echo -n "Testing API Gateway routing... "
total_tests=$((total_tests + 1))

if response=$(curl -s "$API_GATEWAY_URL/health" 2>/dev/null | grep -q "healthy"); then
    echo -e "${GREEN}✓ OK${NC}"
else
    echo -e "${RED}✗ FAIL${NC}"
    failed_tests=$((failed_tests + 1))
fi

# Test authentication flow (basic)
echo -n "Testing auth endpoints... "
total_tests=$((total_tests + 1))

if curl -s -X POST "$API_GATEWAY_URL/auth/register" \
   -H "Content-Type: application/json" \
   -d '{"email":"test@example.com","password":"testpass123","username":"testuser","firstName":"Test","lastName":"User"}' \
   2>/dev/null | grep -q "error\|user\|User"; then
    echo -e "${GREEN}✓ OK${NC}"
else
    echo -e "${RED}✗ FAIL${NC}"
    failed_tests=$((failed_tests + 1))
fi

echo ""
echo "📈 Testing Monitoring..."
echo "======================="

# Test Prometheus
echo -n "Testing Prometheus... "
total_tests=$((total_tests + 1))
if ! test_tcp_connection "Prometheus" "localhost" "9090"; then
    failed_tests=$((failed_tests + 1))
fi

# Test Grafana
echo -n "Testing Grafana... "
total_tests=$((total_tests + 1))
if ! test_tcp_connection "Grafana" "localhost" "3007"; then
    failed_tests=$((failed_tests + 1))
fi

echo ""
echo "📋 Test Summary"
echo "==============="

passed_tests=$((total_tests - failed_tests))
success_rate=$((passed_tests * 100 / total_tests))

echo "Total tests: $total_tests"
echo -e "Passed: ${GREEN}$passed_tests${NC}"
echo -e "Failed: ${RED}$failed_tests${NC}"
echo "Success rate: $success_rate%"

if [ $failed_tests -eq 0 ]; then
    echo ""
    echo -e "${GREEN}🎉 All tests passed! ShareUpTime is ready to go!${NC}"
    exit 0
else
    echo ""
    echo -e "${RED}❌ Some tests failed. Please check the services above.${NC}"
    echo ""
    echo "💡 Troubleshooting tips:"
    echo "  - Make sure all services are running: docker-compose ps"
    echo "  - Check service logs: docker-compose logs [service-name]"
    echo "  - Restart services: docker-compose restart"
    echo "  - Initialize databases: npm run init:db"
    exit 1
fi
