# RonPay Backend Testing Guide

This document outlines the architecture and testing strategies for the RonPay backend, specifically focusing on the payment flows and external integrations.

## Architecture Overview

The backend is built with NestJS and uses a modular architecture.

```mermaid
graph TD
    Client[Frontend / MiniPay] -->|HTTP POST| Control[PaymentsController]
    Control -->|Logic| Service[PaymentsService]
    
    subgraph "Core Services"
        Service -->|Parse NLP| AI[AiService]
        Service -->|DB Operations| TxService[TransactionsService]
        Service -->|Blockchain| Celo[CeloService]
        Service -->|Swap Rates| Mento[MentoService]
    end
    
    subgraph "External Integrations"
        AI -.->|API Call| Anthropic[Anthropic/Google API]
        Celo -.->|RPC| Blockchain[Celo Network]
        Service -->|Bill Payment| VTPass[VtpassService]
        VTPass -.->|API Call| VTPassAPI[VTPass API]
    end
    
    TxService -->|Persist| DB[(PostgreSQL)]
```

## Payment Flows

### 1. Parse Payment Intent (Natural Language)

This flow converts a user's natural language request (e.g., "Send 5 cUSD to Bob") into a structured transaction object that can be signed by the wallet.

**Testing Focus:**
- **Unit Tests**: Mock `AiService` to return specific intents. Verify `PaymentsService` correctly constructs the transaction object.
- **Scenarios**:
  - Valid transfer request.
  - Invalid recipient (mock `IdentityService`).
  - Unsupported action.

```mermaid
sequenceDiagram
    participant User
    participant API as PaymentsController
    participant Service as PaymentsService
    participant AI as AiService
    participant Identity as IdentityService

    User->>API: POST /payments/parse-intent
    API->>Service: parsePaymentIntent(message)
    Service->>AI: analyze(message)
    AI-->>Service: { action: "send_payment", amount: 5, recipient: "Bob" }
    
    Service->>Identity: resolve("Bob")
    Identity-->>Service: "0x123..."
    
    Service->>Service: Build Transaction Object
    Service-->>API: { transaction: {...}, intent: {...} }
    API-->>User: 200 OK (Unsigned Tx)
```

### 2. Execute Payment

After the user signs the transaction on the frontend/wallet, this endpoint records it.

**Testing Focus:**
- **transactions execution**: Verify `TransactionsService.create` is called with "pending".
- **VTPASS Trigger**: Verify that if the transaction is to the *RonPay Treasury* and has VTPASS metadata, the `VtpassService.purchaseProduct` is triggered AFTER confirmation.
- **Failures**: Mock `CeloService.waitForTransaction` to fail or return a revert status.

```mermaid
sequenceDiagram
    participant User
    participant API as PaymentsController
    participant Service as PaymentsService
    participant Tx as TransactionsService
    participant Chain as CeloService
    participant VTPass as VtpassService

    User->>API: POST /payments/execute (txHash)
    API->>Service: recordTransaction(txHash)
    Service->>Tx: create({ status: 'pending' })
    Service-->>API: 200 OK (Monitoring started)
    API-->>User: 200 OK
    
    Note over Service, Chain: Background Process
    Service->>Chain: waitForTransaction(txHash)
    Chain-->>Service: Receipt (Success)
    Service->>Tx: updateStatus('success')
    
    alt Is VTPASS Payment?
        Service->>VTPass: purchaseProduct Details)
        VTPass-->>Service: Success
        Service->>Tx: updateStatus('success_delivered')
    end
```

## Testing Strategy

### Unit Testing (Jest)
Run unit tests to verify individual services logic in isolation.
```bash
pnpm test
```
*Tip: Mock external services like `CeloService` and `AiService` to avoid real API calls and gas costs.*

### Integration Testing
Test the interaction between Controller, Service, and Database.
```bash
pnpm test:e2e
```
*Requires a running database instance (e.g., Docker).*

### Key Test Cases to Implement

1.  **`payments.service.spec.ts`**:
    - **`should parse simple transfer intent`**: Mock AI response -> Expect valid transaction object.
    - **`should reject invalid address`**: Mock AI response with bad address -> Expect BadRequestException.
    - **`should trigger vtpass on treasury payment`**:
        - spyOn sent `vtpassService.purchaseProduct`.
        - call `recordTransaction` with treasury address.
        - mock `waitForTransaction` to resolve immediately with success.
        - Expect spy to be called.

2.  **`vtpass.service.spec.ts`**:
    - **`should call VTPass API with correct params`**: Mock `axios` or HTTP request -> Expect correct payload.
