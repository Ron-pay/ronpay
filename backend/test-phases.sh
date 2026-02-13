#!/bin/bash

# RonPay Phase 1-3 Testing Script
# Tests multi-language NLP, Mento rates, and fee comparison

BASE_URL="http://localhost:3001"
PASS="\033[0;32m✓\033[0m"
FAIL="\033[0;31m✗\033[0m"

echo "================================================"
echo "  RonPay Phases 1-3 Integration Tests"
echo "================================================"
echo ""

# Test 1: Fee Corridors Endpoint
echo "Test 1: GET /fees/corridors"
CORRIDORS=$(curl -s "$BASE_URL/fees/corridors" | jq -r '.count')
if [ "$CORRIDORS" == "6" ]; then
  echo -e "$PASS Fee corridors endpoint works (6 corridors)"
else
  echo -e "$FAIL Fee corridors endpoint failed"
fi
echo ""

# Test 2: Fee Comparison - USD to NGN
echo "Test 2: Fee Comparison USD→NGN"
RESPONSE=$(curl -s "$BASE_URL/fees/compare?from=USD&to=NGN&amount=100")
RONPAY_FEE=$(echo $RESPONSE | jq -r '.providers.ronpay.fee')
WISE_FEE=$(echo $RESPONSE | jq -r '.providers.wise.fee')
SAVINGS=$(echo $RESPONSE | jq -r '.savings.vsWise')

echo "  RonPay fee: \$$RONPAY_FEE"
echo "  Wise fee: \$$WISE_FEE"
echo "  Savings: \$$SAVINGS"

if (( $(echo "$RONPAY_FEE < $WISE_FEE" | bc -l) )); then
  echo -e "$PASS RonPay is cheaper than Wise!"
else
  echo -e "$FAIL Comparison failed"
fi
echo ""

# Test 3: Fee Comparison - EUR to KES
echo "Test 3: Fee Comparison EUR→KES"
RESPONSE=$(curl -s "$BASE_URL/fees/compare?from=EUR&to=KES&amount=200")
SAVINGS_PERCENT=$(echo $RESPONSE | jq -r '.savings.savingsPercent')
echo "  Savings: $SAVINGS_PERCENT%"

if (( $(echo "$SAVINGS_PERCENT > 0" | bc -l) )); then
  echo -e "$PASS Fee comparison EUR→KES works"
else
  echo -e "$FAIL Fee comparison EUR→KES failed"
fi
echo ""

# Test 4: Multi-Language - English
echo "Test 4: Multi-Language Parsing - English"
RESPONSE=$(curl -s -X POST "$BASE_URL/payments/parse-intent" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Send 50 dollars to 0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    "senderAddress": "0x1234567890123456789012345678901234567890"
  }')

ACTION=$(echo $RESPONSE | jq -r '.intent.action')
AMOUNT=$(echo $RESPONSE | jq -r '.intent.amount')

if [ "$ACTION" == "send_payment" ] && [ "$AMOUNT" == "50" ]; then
  echo -e "$PASS English parsing works (amount: \$$AMOUNT)"
else
  echo -e "$FAIL English parsing failed"
fi
echo ""

# Test 5: Multi-Language - Spanish
echo "Test 5: Multi-Language Parsing - Spanish"
RESPONSE=$(curl -s -X POST "$BASE_URL/payments/parse-intent" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Enviar 100 dólares a 0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    "senderAddress": "0x1234567890123456789012345678901234567890",
    "language": "es"
  }')

ACTION=$(echo $RESPONSE | jq -r '.intent.action')
AMOUNT=$(echo $RESPONSE | jq -r '.intent.amount')

if [ "$ACTION" == "send_payment" ] && [ "$AMOUNT" == "100" ]; then
  echo -e "$PASS Spanish parsing works (amount: \$$AMOUNT)"
else
  echo -e "$FAIL Spanish parsing failed"
fi
echo ""

# Test 6: Multi-Language - Portuguese
echo "Test 6: Multi-Language Parsing - Portuguese"
RESPONSE=$(curl -s -X POST "$BASE_URL/payments/parse-intent" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Enviar R$ 200 para 0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    "senderAddress": "0x1234567890123456789012345678901234567890",
    "language": "pt"
  }')

ACTION=$(echo $RESPONSE | jq -r '.intent.action')
AMOUNT=$(echo $RESPONSE | jq -r '.intent.amount')

if [ "$ACTION" == "send_payment" ] && [ "$AMOUNT" == "200" ]; then
  echo -e "$PASS Portuguese parsing works (amount: R\$$AMOUNT)"
else
  echo -e "$FAIL Portuguese parsing failed"
fi
echo ""

# Test 7: Multi-Language - French  
echo "Test 7: Multi-Language Parsing - French"
RESPONSE=$(curl -s -X POST "$BASE_URL/payments/parse-intent" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Envoyer 150€ à 0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    "senderAddress": "0x1234567890123456789012345678901234567890",
    "language": "fr"
  }')

ACTION=$(echo $RESPONSE | jq -r '.intent.action')
AMOUNT=$(echo $RESPONSE | jq -r '.intent.amount')

if [ "$ACTION" == "send_payment" ] && [ "$AMOUNT" == "150" ]; then
  echo -e "$PASS French parsing works (amount: €$AMOUNT)"
else
  echo -e "$FAIL French parsing failed"
fi
echo ""

echo "================================================"
echo "  Testing Complete!"
echo "================================================"
