# Design Document: Backend Payment Integration

## Overview

This design document outlines the frontend architecture for integrating the RonPay NestJS backend API into the Next.js frontend application. The integration will create a type-safe API client layer, reusable React hooks, and UI components for natural language payment processing, multi-token balance queries, and transaction history display. The design maintains the existing MiniPay wallet integration and chat UI patterns while adding robust API communication capabilities.

**Key Design Principles:**

- Type-safe API communication with full TypeScript support
- Component-based architecture with clear separation of concerns
- Reusable hooks following React best practices
- Graceful error handling and loading states
- No modifications to the backend (frontend-only changes)

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js)                    │
│                                                              │
│  ┌────────────────┐      ┌──────────────────┐              │
│  │   Chat UI      │──────│  Payment Flow    │              │
│  │  Components    │      │   Components     │              │
│  └────────┬───────┘      └────────┬─────────┘              │
│           │                       │                         │
│           │         ┌─────────────▼──────────┐              │
│           │         │   API Hooks Layer      │              │
│           │         │  - usePaymentIntent    │              │
│           │         │  - useBalance          │              │
│           │         │  - useTransactionHistory│             │
│           │         │  - useExecutePayment   │              │
│           │         └─────────────┬──────────┘              │
│           │                       │                         │
│           │         ┌─────────────▼──────────┐              │
│           └────────▶│   API Client Layer     │              │
│                     │   (src/lib/api.ts)     │              │
│                     └─────────────┬──────────┘              │
│                                   │                         │
└───────────────────────────────────┼─────────────────────────┘
                                    │ HTTP/REST
                                    ▼
                     ┌──────────────────────────┐
                     │   Backend (NestJS)       │
                     │  - /payments/parse-intent│
                     │  - /payments/balance/:id │
                     │  - /payments/execute     │
                     │  - /payments/history/:id │
                     └──────────────────────────┘
```

### Directory Structure

```
Frontend/apps/web/src/
├── lib/
│   ├── api.ts                    # API client with typed methods
│   └── api-types.ts              # TypeScript interfaces for API
├── hooks/
│   ├── usePaymentIntent.ts       # Hook for parsing payment intents
│   ├── useBalance.ts             # Hook for fetching balances
│   ├── useTransactionHistory.ts  # Hook for transaction history
│   └── useExecutePayment.ts      # Hook for executing payments
├── components/
│   ├── payment/
│   │   ├── PaymentConfirmationCard.tsx
│   │   ├── TransactionStatus.tsx
│   │   └── TransactionHistoryList.tsx
│   ├── balance/
│   │   └── TokenBalance.tsx      # Updated to use API
│   └── errors/
│       └── ApiErrorBoundary.tsx
└── config/
    └── env.ts                    # Environment configuration
```

## Components and Interfaces

### 1. API Client Layer (src/lib/api-types.ts)

**TypeScript Interfaces:**

```typescript
// Request Types
export interface ParseIntentRequest {
  message: string;
  userAddress: string;
}

export interface ExecuteTransactionRequest {
  txHash: string;
  from: string;
  to: string;
  amount: string;
  currency: string;
  memo?: string;
}

// Response Types
export interface PaymentIntent {
  recipient: string;
  amount: string;
  currency: "cUSD" | "CELO" | "cKES" | "cEUR" | "cREAL";
  memo?: string;
  confidence: number;
}

export interface TokenBalance {
  symbol: string;
  balance: string;
  decimals: number;
  contractAddress: string;
}

export interface MultiTokenBalance {
  address: string;
  balances: TokenBalance[];
  timestamp: number;
}

export interface Transaction {
  txHash: string;
  from: string;
  to: string;
  amount: string;
  currency: string;
  memo?: string;
  timestamp: number;
  status: "pending" | "success" | "failed";
}

export interface TransactionHistory {
  address: string;
  transactions: Transaction[];
  total: number;
}

// Error Types
export interface ApiError {
  message: string;
  code?: string;
  statusCode?: number;
}
```

### 2. API Client Layer (src/lib/api.ts)

**Core API Client:**

```typescript
class RonPayApiClient {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl =
      baseUrl || process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
  }

  async parseIntent(request: ParseIntentRequest): Promise<PaymentIntent> {
    // POST /payments/parse-intent
    // Validates response structure
    // Throws ApiError on failure
  }

  async getBalance(address: string): Promise<MultiTokenBalance> {
    // GET /payments/balance/:address
    // Validates response structure
    // Throws ApiError on failure
  }

  async executeTransaction(
    request: ExecuteTransactionRequest,
  ): Promise<{ success: boolean; txHash: string }> {
    // POST /payments/execute
    // Validates response structure
    // Throws ApiError on failure
  }

  async getTransactionHistory(address: string): Promise<TransactionHistory> {
    // GET /payments/history/:address
    // Validates response structure
    // Throws ApiError on failure
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    // Centralized error handling
    // Transforms HTTP errors to ApiError
    // Validates JSON structure
  }
}

export const apiClient = new RonPayApiClient();
```

### 3. API Hooks Layer

**usePaymentIntent Hook:**

```typescript
interface UsePaymentIntentResult {
  parseIntent: (message: string) => Promise<PaymentIntent | null>;
  intent: PaymentIntent | null;
  isLoading: boolean;
  error: ApiError | null;
  clearIntent: () => void;
}

export function usePaymentIntent(): UsePaymentIntentResult {
  // Manages payment intent parsing state
  // Handles loading and error states
  // Uses apiClient.parseIntent
  // Requires wallet address from useMiniPayWallet
}
```

**useBalance Hook:**

```typescript
interface UseBalanceResult {
  balances: TokenBalance[];
  isLoading: boolean;
  error: ApiError | null;
  refetch: () => Promise<void>;
}

export function useBalance(address?: string): UseBalanceResult {
  // Fetches multi-token balances
  // Auto-refetches on address change
  // Handles loading and error states
  // Uses apiClient.getBalance
}
```

**useTransactionHistory Hook:**

```typescript
interface UseTransactionHistoryResult {
  transactions: Transaction[];
  isLoading: boolean;
  error: ApiError | null;
  refetch: () => Promise<void>;
}

export function useTransactionHistory(
  address?: string,
): UseTransactionHistoryResult {
  // Fetches transaction history
  // Auto-refetches on address change
  // Handles loading and error states
  // Uses apiClient.getTransactionHistory
}
```

**useExecutePayment Hook:**

```typescript
interface UseExecutePaymentResult {
  executePayment: (intent: PaymentIntent) => Promise<Transaction | null>;
  isExecuting: boolean;
  error: ApiError | null;
  transaction: Transaction | null;
}

export function useExecutePayment(): UseExecutePaymentResult {
  // Orchestrates payment execution flow:
  // 1. Signs transaction with MiniPay wallet
  // 2. Sends txHash to backend /execute endpoint
  // 3. Returns transaction result
  // Handles loading and error states
  // Uses wagmi hooks for signing
  // Uses apiClient.executeTransaction
}
```

### 4. Payment Components

**PaymentConfirmationCard Component:**

```typescript
interface PaymentConfirmationCardProps {
  intent: PaymentIntent;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function PaymentConfirmationCard({
  intent,
  onConfirm,
  onCancel,
  isLoading,
}: PaymentConfirmationCardProps) {
  // Displays payment details in a card format
  // Shows recipient, amount, currency, memo
  // Provides confirm and cancel buttons
  // Disables buttons during loading
  // Formats addresses for readability (truncate middle)
}
```

**TransactionStatus Component:**

```typescript
interface TransactionStatusProps {
  status: "pending" | "success" | "failed";
  txHash?: string;
  error?: string;
}

export function TransactionStatus({
  status,
  txHash,
  error,
}: TransactionStatusProps) {
  // Displays transaction status with visual indicators
  // Shows appropriate icon and color for each status
  // Renders txHash as clickable link to block explorer
  // Shows error message if status is 'failed'
}
```

**TransactionHistoryList Component:**

```typescript
interface TransactionHistoryListProps {
  address: string;
}

export function TransactionHistoryList({
  address,
}: TransactionHistoryListProps) {
  // Uses useTransactionHistory hook
  // Displays list of transactions
  // Shows loading skeleton while fetching
  // Shows error message on failure
  // Shows empty state when no transactions
  // Each transaction shows: timestamp, amount, currency, recipient, status
}
```

### 5. Updated Balance Components

**TokenBalance Component (Updated):**

```typescript
interface TokenBalanceProps {
  address: string;
}

export function TokenBalance({ address }: TokenBalanceProps) {
  // Uses useBalance hook instead of individual RPC calls
  // Displays all token balances in a grid/list
  // Shows loading skeleton while fetching
  // Shows error message on failure
  // Formats balances with proper decimals
}
```

### 6. Error Handling Components

**ApiErrorBoundary Component:**

```typescript
interface ApiErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
}

export class ApiErrorBoundary extends React.Component<ApiErrorBoundaryProps> {
  // Catches errors from API operations
  // Displays user-friendly error UI
  // Provides retry functionality
  // Logs errors for debugging
  // Prevents app crash on API failures
}
```

## Data Models

### Payment Flow State Machine

```
┌─────────────┐
│    IDLE     │
└──────┬──────┘
       │ User sends message
       ▼
┌─────────────┐
│  PARSING    │ (Loading: parsing intent)
└──────┬──────┘
       │ Backend returns intent
       ▼
┌─────────────┐
│ CONFIRMING  │ (Show PaymentConfirmationCard)
└──────┬──────┘
       │ User confirms
       ▼
┌─────────────┐
│  SIGNING    │ (Loading: wallet signing)
└──────┬──────┘
       │ Wallet returns txHash
       ▼
┌─────────────┐
│ EXECUTING   │ (Loading: recording transaction)
└──────┬──────┘
       │ Backend confirms
       ▼
┌─────────────┐
│  SUCCESS    │ (Show TransactionStatus: success)
└─────────────┘

       │ Error at any stage
       ▼
┌─────────────┐
│   FAILED    │ (Show TransactionStatus: failed)
└─────────────┘
```

### Balance Data Flow

```
Component Request
       │
       ▼
useBalance Hook
       │
       ▼
API Client (GET /balance/:address)
       │
       ▼
Backend Response (MultiTokenBalance)
       │
       ▼
Hook State Update
       │
       ▼
Component Re-render with Balances
```

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

### Property 1: API Client Error Transformation

_For any_ HTTP error response from the backend, the API client should transform it into a user-friendly ApiError with a descriptive message, preventing raw HTTP errors from reaching the UI layer.

**Validates: Requirements 1.3, 1.4, 3.5, 4.4, 5.4**

### Property 2: Payment Intent Validation

_For any_ backend response to /parse-intent, if the response is missing required fields (recipient, amount, currency), the API client should reject the response and throw a validation error rather than returning incomplete data.

**Validates: Requirements 1.5**

### Property 3: Hook Loading State Consistency

_For any_ API hook (usePaymentIntent, useBalance, useTransactionHistory, useExecutePayment), when an API call is in progress, the isLoading flag should be true, and when the call completes (success or error), the isLoading flag should be false.

**Validates: Requirements 6.5, 6.6**

### Property 4: Balance Hook Refetch Idempotency

_For any_ address, calling the refetch method on useBalance multiple times in succession should result in the same balance data (assuming no blockchain state changes), demonstrating idempotent behavior.

**Validates: Requirements 3.1, 3.2**

### Property 5: Transaction Execution State Progression

_For any_ valid payment intent, the execution flow should progress through states (SIGNING → EXECUTING → SUCCESS/FAILED) without skipping states, and each state transition should be reflected in the component state.

**Validates: Requirements 2.1, 2.2, 2.3, 2.4**

### Property 6: Error Boundary Isolation

_For any_ API error thrown within a component tree wrapped by ApiErrorBoundary, the error should be caught and displayed in the error UI without crashing the entire application.

**Validates: Requirements 10.1, 10.2, 10.5**

### Property 7: Environment Configuration Fallback

_For any_ missing or invalid NEXT_PUBLIC_BACKEND_URL environment variable, the API client should fall back to the default value (http://localhost:3001) and log a warning.

**Validates: Requirements 9.2, 9.5**

### Property 8: Wallet Integration Preservation

_For any_ payment execution, the system should use the existing wagmi hooks and useMiniPayWallet patterns without modifying the wallet connection state or flow.

**Validates: Requirements 11.1, 11.2, 11.3, 11.5**

### Property 9: Chat UI Message Flow Preservation

_For any_ payment command entered in the Chat UI, the message should be processed and displayed inline within the chat conversation, maintaining the existing chat history and UI patterns.

**Validates: Requirements 12.1, 12.2, 12.3, 12.4, 12.5**

### Property 10: Balance Component RPC Replacement

_For any_ address, the TokenBalance and user-balance components should fetch balance data exclusively from the backend API endpoint, with zero direct RPC calls to blockchain nodes.

**Validates: Requirements 3.6**

### Property 11: Transaction Status Visual Consistency

_For any_ transaction status (pending, success, failed), the TransactionStatus component should display a consistent visual indicator (icon and color) that matches the status value.

**Validates: Requirements 8.1, 8.2, 8.3, 8.5**

### Property 12: Confirmation Card Data Completeness

_For any_ payment intent displayed in the PaymentConfirmationCard, all required fields (recipient, amount, currency) should be visible, and optional fields (memo) should be displayed only when present.

**Validates: Requirements 7.1, 7.2, 7.3**

## Error Handling

### Error Categories

1. **Network Errors**
   - Backend unreachable
   - Timeout errors
   - DNS resolution failures
   - User-friendly message: "Unable to connect to payment service. Please check your connection and try again."

2. **Validation Errors**
   - Invalid payment intent format
   - Missing required fields
   - Invalid address format
   - User-friendly message: "Invalid payment details. Please check your input and try again."

3. **Wallet Errors**
   - User rejected transaction
   - Insufficient balance
   - Wallet not connected
   - User-friendly message: "Transaction cancelled" or "Insufficient balance for this payment"

4. **Backend Errors**
   - 400 Bad Request: "Invalid request. Please check your input."
   - 404 Not Found: "Resource not found."
   - 500 Internal Server Error: "Service temporarily unavailable. Please try again later."

### Error Handling Strategy

**API Client Level:**

- Catch all HTTP errors
- Transform to ApiError with user-friendly messages
- Log original error for debugging
- Include error codes for programmatic handling

**Hook Level:**

- Store errors in hook state
- Provide error objects to components
- Clear errors on retry
- Maintain error history for debugging

**Component Level:**

- Display error messages inline
- Provide retry buttons
- Show fallback UI for critical errors
- Use ApiErrorBoundary for catastrophic failures

**Example Error Flow:**

```
Backend 500 Error
       │
       ▼
API Client catches error
       │
       ▼
Transform to ApiError { message: "Service temporarily unavailable", statusCode: 500 }
       │
       ▼
Hook stores error in state
       │
       ▼
Component displays error message + retry button
```

## Testing Strategy

### Unit Testing

**API Client Tests:**

- Test each endpoint method with mock responses
- Test error transformation logic
- Test response validation
- Test environment variable handling
- Test default URL fallback

**Hook Tests:**

- Test loading state transitions
- Test error state handling
- Test successful data fetching
- Test refetch functionality
- Test cleanup on unmount

**Component Tests:**

- Test PaymentConfirmationCard rendering with various intents
- Test TransactionStatus with different status values
- Test TransactionHistoryList with empty, loading, and populated states
- Test error boundary catching and displaying errors

### Property-Based Testing

Each correctness property should be implemented as a property-based test with minimum 100 iterations:

**Property 1 Test:**

- Generate random HTTP error responses
- Verify all are transformed to ApiError
- Tag: **Feature: backend-payment-integration, Property 1: API Client Error Transformation**

**Property 2 Test:**

- Generate payment intent responses with missing fields
- Verify validation errors are thrown
- Tag: **Feature: backend-payment-integration, Property 2: Payment Intent Validation**

**Property 3 Test:**

- Generate random API calls through hooks
- Verify isLoading is true during calls and false after
- Tag: **Feature: backend-payment-integration, Property 3: Hook Loading State Consistency**

**Property 5 Test:**

- Generate random valid payment intents
- Execute payment flow
- Verify state progression follows SIGNING → EXECUTING → SUCCESS/FAILED
- Tag: **Feature: backend-payment-integration, Property 5: Transaction Execution State Progression**

**Property 7 Test:**

- Generate random invalid/missing environment variables
- Verify fallback to default URL
- Tag: **Feature: backend-payment-integration, Property 7: Environment Configuration Fallback**

**Property 10 Test:**

- Monitor network calls during balance fetching
- Verify zero direct RPC calls to blockchain nodes
- Tag: **Feature: backend-payment-integration, Property 10: Balance Component RPC Replacement**

### Integration Testing

- Test complete payment flow from chat input to transaction confirmation
- Test balance fetching and display in TokenBalance component
- Test transaction history fetching and display
- Test error scenarios with mock backend failures
- Test wallet integration with mock wallet responses

### Testing Tools

- **Unit Tests:** Jest + React Testing Library
- **Property Tests:** fast-check (JavaScript property-based testing library)
- **Integration Tests:** Playwright or Cypress for E2E flows
- **API Mocking:** MSW (Mock Service Worker) for backend mocking

## Implementation Notes

### Phase 1: Foundation

1. Create API types and client
2. Set up environment configuration
3. Create error boundary component

### Phase 2: Hooks Layer

1. Implement useBalance hook
2. Implement usePaymentIntent hook
3. Implement useExecutePayment hook
4. Implement useTransactionHistory hook

### Phase 3: Components

1. Update TokenBalance component to use useBalance
2. Create PaymentConfirmationCard component
3. Create TransactionStatus component
4. Create TransactionHistoryList component

### Phase 4: Integration

1. Integrate payment flow into Chat UI
2. Wire up confirmation and execution flow
3. Add error handling throughout
4. Test complete flows

### Dependencies

- Existing: wagmi, RainbowKit, Next.js 14
- New: None (use built-in fetch API)
- Testing: fast-check for property-based testing

### Performance Considerations

- Debounce balance refetching to avoid excessive API calls
- Cache transaction history with reasonable TTL
- Use React.memo for expensive components
- Implement optimistic UI updates where appropriate

### Security Considerations

- Validate all backend responses before using data
- Never expose sensitive data in error messages
- Use HTTPS for all API calls in production
- Sanitize user input before sending to backend
- Validate addresses before transaction signing
