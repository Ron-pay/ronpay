# Requirements Document

## Introduction

This document specifies the requirements for integrating the RonPay NestJS backend API into the Next.js frontend application. The integration will replace mock AI responses with real backend calls, enable natural language payment processing, provide multi-token balance queries, and implement transaction history tracking. The system will maintain the existing MiniPay wallet integration and chat UI while adding robust API communication layers.

## Glossary

- **Frontend**: The Next.js application that provides the user interface for RonPay
- **Backend**: The NestJS API server that processes payment intents, manages balances, and tracks transactions
- **MiniPay_Wallet**: The client-side wallet integration using wagmi and RainbowKit for transaction signing
- **Payment_Intent**: A parsed representation of a natural language payment request containing recipient, amount, currency, and memo
- **API_Client**: The typed service layer that handles communication between Frontend and Backend
- **Transaction_Hash**: A unique identifier (txHash) for a blockchain transaction
- **Multi_Token_Balance**: A collection of token balances including cUSD, CELO, cKES, cEUR, and cREAL for a given address
- **Chat_UI**: The conversational interface where users input payment commands
- **Confirmation_Card**: A UI component displaying parsed payment details for user verification before execution

## Requirements

### Requirement 1: Natural Language Payment Intent Parsing

**User Story:** As a user, I want to type payment commands in natural language, so that I can send payments without knowing technical blockchain details.

#### Acceptance Criteria

1. WHEN a user submits a message in the Chat_UI, THE Frontend SHALL send the message to the Backend /parse-intent endpoint
2. WHEN the Backend returns a Payment_Intent, THE Frontend SHALL display a Confirmation_Card showing recipient address, amount, currency, and memo
3. WHEN the Payment_Intent parsing fails, THE Frontend SHALL display an error message explaining what went wrong
4. WHEN the Backend is unreachable, THE Frontend SHALL display a user-friendly connectivity error message
5. THE Frontend SHALL validate that the Backend response contains all required Payment_Intent fields before displaying the Confirmation_Card

### Requirement 2: Payment Execution and Transaction Recording

**User Story:** As a user, I want to confirm and execute parsed payment intents, so that I can complete transactions securely using my MiniPay wallet.

#### Acceptance Criteria

1. WHEN a user confirms a Payment_Intent on the Confirmation_Card, THE Frontend SHALL request MiniPay_Wallet to sign the transaction
2. WHEN MiniPay_Wallet successfully signs a transaction, THE Frontend SHALL send the Transaction_Hash to the Backend /execute endpoint
3. WHEN the transaction is submitted, THE Frontend SHALL display a pending status indicator
4. WHEN the Backend confirms transaction recording, THE Frontend SHALL display a success status with the Transaction_Hash
5. IF the transaction signing fails, THEN THE Frontend SHALL display an error message and allow the user to retry or cancel
6. IF the Backend /execute endpoint fails, THEN THE Frontend SHALL display an error message indicating the transaction was signed but not recorded

### Requirement 3: Multi-Token Balance Retrieval

**User Story:** As a user, I want to see all my token balances in one request, so that I can quickly understand my available funds across multiple currencies.

#### Acceptance Criteria

1. WHEN the Frontend needs balance information for an address, THE Frontend SHALL call the Backend /balance/:address endpoint
2. WHEN the Backend returns Multi_Token_Balance data, THE Frontend SHALL update the TokenBalance component with all token amounts
3. WHEN the Backend returns Multi_Token_Balance data, THE Frontend SHALL update the user-balance component with all token amounts
4. THE Frontend SHALL display loading states while balance data is being fetched
5. IF the Backend balance endpoint fails, THEN THE Frontend SHALL display an error message and provide a retry option
6. THE Frontend SHALL replace individual RPC calls with the single Backend API call for balance queries

### Requirement 4: Transaction History Display

**User Story:** As a user, I want to view my past transactions, so that I can track my payment history and verify completed transfers.

#### Acceptance Criteria

1. WHEN a user requests transaction history, THE Frontend SHALL call the Backend /history/:address endpoint
2. WHEN the Backend returns transaction history, THE Frontend SHALL display each transaction with timestamp, amount, currency, recipient, and status
3. THE Frontend SHALL display loading states while transaction history is being fetched
4. IF the Backend history endpoint fails, THEN THE Frontend SHALL display an error message and provide a retry option
5. WHEN the transaction history is empty, THE Frontend SHALL display a message indicating no transactions found

### Requirement 5: Type-Safe API Client Layer

**User Story:** As a developer, I want a type-safe API client service, so that I can catch integration errors at compile time and maintain code quality.

#### Acceptance Criteria

1. THE API_Client SHALL define TypeScript interfaces for all Backend request and response types
2. THE API_Client SHALL provide methods for each Backend endpoint: parseIntent, getBalance, executeTransaction, and getHistory
3. THE API_Client SHALL use the NEXT_PUBLIC_BACKEND_URL environment variable for the Backend base URL
4. THE API_Client SHALL handle HTTP errors and transform them into user-friendly error messages
5. THE API_Client SHALL validate response data structure before returning to calling code
6. THE API_Client SHALL provide consistent error handling across all endpoint methods

### Requirement 6: Reusable API Hooks

**User Story:** As a developer, I want reusable React hooks for API operations, so that I can maintain consistent patterns and reduce code duplication across components.

#### Acceptance Criteria

1. THE Frontend SHALL provide a usePaymentIntent hook that handles payment intent parsing with loading and error states
2. THE Frontend SHALL provide a useBalance hook that fetches Multi_Token_Balance with loading and error states
3. THE Frontend SHALL provide a useTransactionHistory hook that fetches transaction history with loading and error states
4. THE Frontend SHALL provide a useExecutePayment hook that handles transaction execution with loading and error states
5. WHEN any hook encounters an error, THE hook SHALL return the error in a consistent format
6. WHEN any hook is loading, THE hook SHALL return a loading boolean flag

### Requirement 7: Payment Confirmation Component

**User Story:** As a user, I want to review payment details before confirming, so that I can verify the transaction is correct before signing.

#### Acceptance Criteria

1. THE Confirmation_Card SHALL display the recipient address in a readable format
2. THE Confirmation_Card SHALL display the payment amount with the correct currency symbol
3. THE Confirmation_Card SHALL display the memo if provided in the Payment_Intent
4. THE Confirmation_Card SHALL provide a confirm button to proceed with transaction signing
5. THE Confirmation_Card SHALL provide a cancel button to abort the payment
6. WHEN the user clicks confirm, THE Confirmation_Card SHALL trigger the MiniPay_Wallet signing flow

### Requirement 8: Transaction Status Component

**User Story:** As a user, I want to see real-time transaction status updates, so that I know when my payment is pending, successful, or failed.

#### Acceptance Criteria

1. THE Frontend SHALL display a "pending" status when a transaction is submitted to the blockchain
2. THE Frontend SHALL display a "success" status when the Backend confirms transaction recording
3. THE Frontend SHALL display a "failed" status when transaction signing or execution fails
4. THE Frontend SHALL display the Transaction_Hash as a clickable link to a block explorer when available
5. THE Frontend SHALL provide visual indicators (icons, colors) for each status state

### Requirement 9: Environment Configuration

**User Story:** As a developer, I want configurable environment variables, so that I can easily switch between development, staging, and production backends.

#### Acceptance Criteria

1. THE Frontend SHALL read the Backend URL from the NEXT_PUBLIC_BACKEND_URL environment variable
2. THE Frontend SHALL default to http://localhost:3001 when NEXT_PUBLIC_BACKEND_URL is not set
3. THE Frontend SHALL include NEXT_PUBLIC_BACKEND_URL in the .env.template file with documentation
4. THE Frontend SHALL validate that the Backend URL is properly formatted before making requests
5. IF the Backend URL is invalid or missing, THEN THE Frontend SHALL log a warning and use the default value

### Requirement 10: Error Boundary for API Failures

**User Story:** As a user, I want graceful error handling when API calls fail, so that the application remains usable even when the backend is unavailable.

#### Acceptance Criteria

1. THE Frontend SHALL implement an error boundary component that catches API-related errors
2. WHEN an API error occurs, THE error boundary SHALL display a user-friendly error message
3. WHEN an API error occurs, THE error boundary SHALL provide a retry action
4. WHEN an API error occurs, THE error boundary SHALL log the error details for debugging
5. THE error boundary SHALL prevent the entire application from crashing due to API failures

### Requirement 11: Integration with Existing MiniPay Wallet

**User Story:** As a user, I want seamless integration with my MiniPay wallet, so that I can sign transactions without changing my existing workflow.

#### Acceptance Criteria

1. THE Frontend SHALL use existing wagmi hooks for wallet connection and transaction signing
2. WHEN a payment is confirmed, THE Frontend SHALL call the MiniPay_Wallet signing method with the parsed transaction data
3. THE Frontend SHALL maintain compatibility with the existing useMiniPayWallet hook
4. THE Frontend SHALL handle wallet connection errors and prompt users to connect if disconnected
5. THE Frontend SHALL preserve the current wallet connection state across API operations

### Requirement 12: Chat UI Integration

**User Story:** As a user, I want the payment flow to integrate naturally with the chat interface, so that I can interact with payments conversationally.

#### Acceptance Criteria

1. THE Chat_UI SHALL accept natural language payment commands as regular chat messages
2. THE Chat_UI SHALL display the Confirmation_Card inline within the chat conversation
3. THE Chat_UI SHALL display transaction status updates inline within the chat conversation
4. THE Chat_UI SHALL maintain chat history including payment commands and their outcomes
5. THE Chat_UI SHALL preserve the existing chat UI/UX patterns and styling
