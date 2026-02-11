# RonPay Backend API Documentation

## Base URL
`http://localhost:3001` (Local: Default if PORT env not set)
`https://ronpay-api.railway.app` (Production)

## Authentication
Currently, no authentication is required for MVP.

---

## 1. Payments & AI

### Parse Payment Intent
Analyze natural language command to extract payment details.

- **Endpoint:** `POST /payments/parse-intent`
- **Body:**
  ```json
  {
    "message": "Send 5 cUSD to 0x123...",
    "senderAddress": "0xYourWalletAddress"
  }
  ```
- **Response:**
  ```json
  {
    "intent": {
      "action": "send_payment",
      "recipient": "0x123...",
      "amount": 5,
      "currency": "cUSD"
    },
    "transaction": {
      "to": "0x...",
      "value": "...",
      "data": "...",
      "feeCurrency": "0x..."
    }
  }
  ```

### Execute Payment (Record Transaction)
Record a transaction after it has been signed and broadcasted by the frontend/wallet.

- **Endpoint:** `POST /payments/execute`
- **Body:**
  ```json
  {
    "fromAddress": "0xSender",
    "toAddress": "0xRecipient",
    "amount": 5,
    "currency": "cUSD",
    "txHash": "0xTransactionHash",
    "intent": "Original command",
    "metadata": { ... }
  }
  ```

---

## 2. VTPASS Integration (Bills & Airtime)

### List Services
Get available service categories or specific services.

- **Endpoint:** `GET /vtpass/services`
- **Query Params:** `identifier` (e.g., `airtime`, `data`, `tv-subscription`)
- **Response:** List of services (MTN, Airtel, DSTV, etc.)

### Verify Customer/Merchant
Validate a smartcard number or meter number before payment.

- **Endpoint:** `POST /vtpass/verify`
- **Body:**
  ```json
  {
    "serviceID": "dstv",
    "billersCode": "1234567890"
  }
  ```

### Purchase Product (Triggered via Treasury Flow)
The backend automatically purchases the product when a valid transaction to the Treasury address is detected with the correct metadata.

---

## 3. Scheduler (Recurring Payments)

### Schedule Payment
- **Endpoint:** `POST /scheduler/payment`
- **Body:**
  ```json
  {
    "recipient": "0x...",
    "amount": 10,
    "token": "cUSD",
    "frequency": "monthly",
    "walletAddress": "0xOwner"
  }
  ```

### List Schedules
- **Endpoint:** `GET /scheduler`

### Cancel Schedule
- **Endpoint:** `DELETE /scheduler/:key`
