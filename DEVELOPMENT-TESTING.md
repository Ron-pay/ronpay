# RonPay Development Testing Guide

This guide shows how to test the RonPay backend with both Claude AI-powered intent parsing and direct intent input (to save tokens during development).

## Quick Start

### 1. Start the Backend Server
```bash
cd backend
pnpm dev
# Server will be available at http://localhost:3001
```

## Testing the API

### Option 1: AI-Powered Intent Parsing (With Claude)

**Endpoint**: `POST /payments/parse-intent`

Uses Claude AI to parse natural language into payment intents. Ideal for production use.

**Request**:
```bash
curl -X POST http://localhost:3001/payments/parse-intent \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Send 100 USDC to 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    "senderAddress": "0x1234567890123456789012345678901234567890",
    "aiProvider": "claude",
    "language": "en"
  }'
```

**Response**:
```json
{
  "intent": {
    "action": "send_payment",
    "recipient": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    "amount": 100,
    "currency": "USDm",
    "confidence": 0.95
  },
  "transaction": {
    "to": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
    "value": "0",
    "data": "0xa9059cbb...",
    "feeCurrency": "0x765DE816845861e75A25fCA122bb6898B8B1282a"
  },
  "parsedCommand": {
    "recipient": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    "originalRecipient": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    "amount": 100,
    "currency": "USDm"
  }
}
```

**Query Parameters**:
- `message` (required): Natural language payment instruction
- `senderAddress` (required): Ethereum address of the sender
- `aiProvider` (optional): `"claude"` or `"gemini"` (defaults to configured provider)
- `language` (optional): `"en"`, `"es"`, `"pt"`, `"fr"` (defaults to auto-detect)

---

### Option 2: Direct Intent Parsing (Without Claude) ⚡

**Endpoint**: `POST /payments/parse-intent-direct`

Bypasses AI entirely - pass the parsed intent directly. **Perfect for development and testing** to save Claude tokens.

#### Example 1: Crypto Transfer

**Request**:
```bash
curl -X POST http://localhost:3001/payments/parse-intent-direct \
  -H "Content-Type: application/json" \
  -d '{
    "intent": {
      "action": "send_payment",
      "recipient": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      "amount": 50,
      "currency": "USDm",
      "confidence": 0.95
    },
    "senderAddress": "0x1234567890123456789012345678901234567890"
  }'
```

**Response**:
```json
{
  "intent": {
    "action": "send_payment",
    "recipient": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    "amount": 50,
    "currency": "USDm",
    "confidence": 0.95
  },
  "transaction": {
    "to": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
    "value": "0",
    "data": "0xa9059cbb...",
    "feeCurrency": "0x765DE816845861e75A25fCA122bb6898B8B1282a"
  },
  "parsedCommand": {
    "recipient": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    "originalRecipient": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    "amount": 50,
    "currency": "USDm"
  }
}
```

#### Example 2: Airtime Purchase

**Request**:
```bash
curl -X POST http://localhost:3001/payments/parse-intent-direct \
  -H "Content-Type: application/json" \
  -d '{
    "intent": {
      "action": "buy_airtime",
      "recipient": "08012345678",
      "amount": 1000,
      "currency": "NGNm",
      "biller": "MTN",
      "confidence": 0.95
    },
    "senderAddress": "0x1234567890123456789012345678901234567890"
  }'
```

**Response**:
```json
{
  "intent": {
    "action": "buy_airtime",
    "recipient": "08012345678",
    "amount": 1000,
    "currency": "NGNm",
    "biller": "MTN",
    "confidence": 0.95
  },
  "transaction": {
    "to": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
    "value": "0",
    "data": "0xa9059cbb...",
    "feeCurrency": "0x765DE816845861e75A25fCA122bb6898B8B1282a"
  },
  "meta": {
    "serviceType": "buy_airtime",
    "provider": "MTN",
    "recipient": "08012345678",
    "originalAmountNgn": 1000,
    "exchangeRate": 1520
  },
  "parsedCommand": {
    "recipient": "RonPay Treasury",
    "amount": 0.66,
    "currency": "cUSD",
    "memo": "Payment for MTN"
  }
}
```

**Request Body**:
- `intent` (required): Complete PaymentIntent object
  - `action` (required): `"send_payment"` | `"check_balance"` | `"buy_airtime"` | `"buy_data"` | `"pay_bill"`
  - `recipient` (required): Wallet address, phone number, or smartcard number
  - `amount` (optional): Numeric value
  - `currency` (optional): `"USDm"` | `"KESm"` | `"BRLm"` | `"EURm"` | `"NGNm"` | `"CELO"`
  - `biller` (optional): Provider name for VTPASS (e.g., `"MTN"`, `"Airtel"`, `"DSTV"`)
  - `package` (optional): Plan/bundle name
  - `memo` (optional): Description
  - `confidence` (optional): 0.0 to 1.0 (confidence score)
- `senderAddress` (required): Ethereum address of the sender

---

## Supported Payment Actions

### 1. **send_payment** - Crypto Transfer
Send tokens to another wallet.

```json
{
  "action": "send_payment",
  "recipient": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  "amount": 100,
  "currency": "USDm"
}
```

### 2. **buy_airtime** - Mobile Airtime
Purchase mobile airtime via VTPASS.

```json
{
  "action": "buy_airtime",
  "recipient": "08012345678",
  "amount": 1000,
  "currency": "NGNm",
  "biller": "MTN"
}
```

### 3. **buy_data** - Mobile Data
Purchase mobile data bundle via VTPASS.

```json
{
  "action": "buy_data",
  "recipient": "08012345678",
  "amount": 3000,
  "currency": "NGNm",
  "biller": "Airtel",
  "package": "5GB"
}
```

### 4. **pay_bill** - Bill Payment
Pay utility or service bills via VTPASS.

```json
{
  "action": "pay_bill",
  "recipient": "1234567890",
  "amount": 5000,
  "currency": "NGNm",
  "biller": "DSTV",
  "package": "Premium"
}
```

### 5. **check_balance** - Balance Check
Check wallet balance.

```json
{
  "action": "check_balance"
}
```

---

## Supported Tokens

| Symbol | Address | Type | Supported |
|--------|---------|------|-----------|
| **USDm** | 0x765DE... | Mento Stablecoin | ✅ |
| **EURm** | 0xD8763... | Mento Stablecoin | ✅ |
| **BRLm** | 0xe8537... | Mento Stablecoin | ✅ |
| **KESm** | 0x456a3... | Mento Stablecoin | ✅ |
| **NGNm** | 0xC6a53... | Mento Stablecoin | ✅ |
| **cUSDC** | 0xceb09... | Native USDC | ✅ |
| **cUSDT** | 0xb020D... | Native USDT | ✅ |
| **CELO** | native | Native Celo Token | ✅ |

---

## Cost Comparison

| Endpoint | Claude API Calls | Cost per Request | Best For |
|----------|-----------------|-----------------|----------|
| **parse-intent** | 1 | ~$0.001 - $0.01 | Production, NLP features |
| **parse-intent-direct** | 0 | ~$0.0001 | Development, Testing, Demos |

### Example Savings
- **100 test requests with Claude**: ~$0.10 - $1.00
- **100 test requests with direct**: ~$0.01
- **Monthly savings** (500 dev tests): ~$4-50 / month

---

## Development Best Practices

### ✅ During Development
- Use `/payments/parse-intent-direct` to test payment flows without consuming Claude tokens
- Use predefined test intents from the examples above
- Test all payment action types (send_payment, buy_airtime, etc.)

### ✅ Before Production
- Test with `/payments/parse-intent` to verify Claude AI parsing accuracy
- Test with natural language variations
- Ensure confidence scores are above 0.7
- Validate error handling for invalid intents

### ✅ Monitoring
- Monitor Claude API usage in Anthropic Console: https://platform.claude.com/account/usage
- Track API response times and error rates
- Set up rate limiting and spend limits in Console settings

---

## Additional Resources

- **Claude API Docs**: https://platform.claude.com/docs
- **Available Models**: 
  - `claude-opus-4-6` (Most intelligent, slower)
  - `claude-sonnet-4-5` (Balanced)
  - `claude-haiku-4-5` (Fastest, cheapest)
- **RonPay Backend Docs**: See [backend/README.md](backend/README.md)
- **Celo Network**: https://celo.org

---

## Troubleshooting

### Invalid Recipient Error
```
"Unable to resolve recipient: alice. Please use a valid Celo address or registered phone number."
```
**Solution**: Use a valid Ethereum address or registered phone number for the recipient.

### Confidence Too Low
```
"Unable to understand payment request with sufficient confidence."
```
**Solution**: 
- Use clearer, more specific language
- Ensure all required fields are present
- Check spelling of recipient addresses

### Claude API Errors
```
"ANTHROPIC_API_KEY not configured in environment"
```
**Solution**:
1. Set your API key: `export ANTHROPIC_API_KEY=sk-ant-...`
2. Or add to `.env` file in backend directory
3. Restart the server
4. Get your key from: https://platform.claude.com/account/keys

---

## Quick Reference

```bash
# Test crypto transfer with AI
curl -X POST http://localhost:3001/payments/parse-intent \
  -H "Content-Type: application/json" \
  -d '{"message":"Send 50 USDm to 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266","senderAddress":"0x1234567890123456789012345678901234567890","aiProvider":"claude"}'

# Test crypto transfer without AI (saves tokens)
curl -X POST http://localhost:3001/payments/parse-intent-direct \
  -H "Content-Type: application/json" \
  -d '{"intent":{"action":"send_payment","recipient":"0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266","amount":50,"currency":"USDm"},"senderAddress":"0x1234567890123456789012345678901234567890"}'

# Test airtime purchase without AI
curl -X POST http://localhost:3001/payments/parse-intent-direct \
  -H "Content-Type: application/json" \
  -d '{"intent":{"action":"buy_airtime","recipient":"08012345678","amount":1000,"currency":"NGNm","biller":"MTN"},"senderAddress":"0x1234567890123456789012345678901234567890"}'
```
