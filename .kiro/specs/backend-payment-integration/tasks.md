# Implementation Plan: Backend Payment Integration

## Overview

This implementation plan breaks down the backend API integration into discrete, incremental coding tasks. Each task builds on previous work, starting with foundational API infrastructure, then adding hooks, components, and finally integrating everything into the existing chat UI. The plan focuses on type-safe implementation with comprehensive error handling and testing.

## Tasks

- [x] 1. Set up API foundation and type definitions
  - [x] 1.1 Create API type definitions file (src/lib/api-types.ts)
    - Define TypeScript interfaces for all request types (ParseIntentRequest, ExecuteTransactionRequest)
    - Define TypeScript interfaces for all response types (PaymentIntent, MultiTokenBalance, TokenBalance, Transaction, TransactionHistory)
    - Define ApiError interface for error handling
    - _Requirements: 5.1, 5.4_

  - [x] 1.2 Create environment configuration module (src/config/env.ts)
    - Read NEXT_PUBLIC_BACKEND_URL from environment
    - Provide default fallback to http://localhost:3001
    - Add URL validation logic
    - Export typed configuration object
    - _Requirements: 9.1, 9.2, 9.4, 9.5_

  - [x] 1.3 Update .env.template with backend URL configuration
    - Add NEXT_PUBLIC_BACKEND_URL with documentation
    - Include example value and description
    - _Requirements: 9.3_

- [x] 2. Implement API client layer
  - [x] 2.1 Create RonPayApiClient class (src/lib/api.ts)
    - Implement constructor with baseUrl configuration
    - Implement parseIntent method (POST /payments/parse-intent)
    - Implement getBalance method (GET /payments/balance/:address)
    - Implement executeTransaction method (POST /payments/execute)
    - Implement getTransactionHistory method (GET /payments/history/:address)
    - Implement private handleResponse method for centralized error handling
    - Add response validation for all methods
    - Transform HTTP errors to ApiError with user-friendly messages
    - Export singleton apiClient instance
    - _Requirements: 5.2, 5.3, 5.4, 5.5, 5.6, 1.3, 1.4_

  - [ ]\* 2.2 Write property test for API client error transformation
    - **Property 1: API Client Error Transformation**
    - Generate random HTTP error responses (400, 404, 500, network errors)
    - Verify all errors are transformed to ApiError with user-friendly messages
    - Verify no raw HTTP errors reach the caller
    - Run 100+ iterations
    - **Validates: Requirements 1.3, 1.4, 3.5, 4.4, 5.4**

  - [ ]\* 2.3 Write property test for payment intent validation
    - **Property 2: Payment Intent Validation**
    - Generate payment intent responses with missing required fields
    - Verify validation errors are thrown for incomplete data
    - Verify complete data passes validation
    - Run 100+ iterations
    - **Validates: Requirements 1.5**

  - [ ]\* 2.4 Write unit tests for API client methods
    - Test each endpoint method with mock successful responses
    - Test environment variable handling and fallback
    - Test response validation logic
    - _Requirements: 5.2, 5.3, 5.5_

- [x] 3. Implement error boundary component
  - [x] 3.1 Create ApiErrorBoundary component (src/components/errors/ApiErrorBoundary.tsx)
    - Implement error boundary class component
    - Catch API-related errors
    - Display user-friendly error UI with error message
    - Provide retry button functionality
    - Log errors to console for debugging
    - Prevent app crash on API failures
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

  - [ ]\* 3.2 Write property test for error boundary isolation
    - **Property 6: Error Boundary Isolation**
    - Generate random API errors within wrapped components
    - Verify errors are caught and displayed without crashing app
    - Verify retry functionality works
    - Run 100+ iterations
    - **Validates: Requirements 10.1, 10.2, 10.5**

  - [ ]\* 3.3 Write unit tests for error boundary
    - Test error catching with various error types
    - Test error UI rendering
    - Test retry button functionality
    - Test error logging
    - _Requirements: 10.2, 10.3, 10.4_

- [ ] 4. Checkpoint - Verify API foundation
  - Ensure all tests pass, verify API client can connect to backend, ask the user if questions arise.

- [-] 5. Implement API hooks layer
  - [ ] 5.1 Create useBalance hook (src/hooks/useBalance.ts)
    - Implement hook with address parameter
    - Manage balances, isLoading, and error state
    - Call apiClient.getBalance on mount and address change
    - Implement refetch function
    - Handle loading and error states
    - Return balances array, isLoading, error, and refetch
    - _Requirements: 3.1, 3.2, 3.4, 6.2, 6.5, 6.6_

  - [ ]\* 5.2 Write property test for balance hook loading states
    - **Property 3: Hook Loading State Consistency**
    - Generate random addresses and trigger balance fetches
    - Verify isLoading is true during fetch and false after completion
    - Verify loading state consistency across success and error cases
    - Run 100+ iterations
    - **Validates: Requirements 6.5, 6.6**

  - [ ]\* 5.3 Write property test for balance hook refetch idempotency
    - **Property 4: Balance Hook Refetch Idempotency**
    - Generate random addresses and call refetch multiple times
    - Verify same balance data is returned (assuming no blockchain changes)
    - Run 100+ iterations
    - **Validates: Requirements 3.1, 3.2**

  - [ ] 5.4 Create usePaymentIntent hook (src/hooks/usePaymentIntent.ts)
    - Implement parseIntent function that takes message string
    - Get user address from useMiniPayWallet hook
    - Manage intent, isLoading, and error state
    - Call apiClient.parseIntent with message and address
    - Implement clearIntent function to reset state
    - Handle loading and error states
    - Return parseIntent, intent, isLoading, error, and clearIntent
    - _Requirements: 1.1, 1.2, 1.3, 6.1, 6.5, 6.6_

  - [ ] 5.5 Create useExecutePayment hook (src/hooks/useExecutePayment.ts)
    - Implement executePayment function that takes PaymentIntent
    - Get wallet signing functions from wagmi hooks
    - Manage transaction, isExecuting, and error state
    - Orchestrate flow: sign with MiniPay → send txHash to backend
    - Call apiClient.executeTransaction with transaction details
    - Handle loading and error states
    - Return executePayment, isExecuting, error, and transaction
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 6.4, 6.5, 6.6, 11.2_

  - [ ]\* 5.6 Write property test for transaction execution state progression
    - **Property 5: Transaction Execution State Progression**
    - Generate random valid payment intents
    - Execute payment flow with mocked wallet and backend
    - Verify state progresses through SIGNING → EXECUTING → SUCCESS/FAILED
    - Verify no states are skipped
    - Run 100+ iterations
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.4**

  - [ ] 5.7 Create useTransactionHistory hook (src/hooks/useTransactionHistory.ts)
    - Implement hook with address parameter
    - Manage transactions, isLoading, and error state
    - Call apiClient.getTransactionHistory on mount and address change
    - Implement refetch function
    - Handle loading and error states
    - Return transactions array, isLoading, error, and refetch
    - _Requirements: 4.1, 4.2, 4.3, 6.3, 6.5, 6.6_

  - [ ]\* 5.8 Write unit tests for all hooks
    - Test each hook with successful API responses
    - Test error handling in each hook
    - Test loading state transitions
    - Test refetch functionality where applicable
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

- [ ] 6. Checkpoint - Verify hooks layer
  - Ensure all tests pass, verify hooks correctly call API client, ask the user if questions arise.

- [ ] 7. Implement payment flow components
  - [ ] 7.1 Create PaymentConfirmationCard component (src/components/payment/PaymentConfirmationCard.tsx)
    - Accept intent, onConfirm, onCancel, and isLoading props
    - Display recipient address with truncation for readability
    - Display amount with correct currency symbol
    - Display memo if present in intent
    - Render confirm button that calls onConfirm
    - Render cancel button that calls onCancel
    - Disable buttons during loading
    - Style card to match existing UI patterns
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 1.2_

  - [ ]\* 7.2 Write property test for confirmation card data completeness
    - **Property 12: Confirmation Card Data Completeness**
    - Generate random payment intents with and without memos
    - Render PaymentConfirmationCard with each intent
    - Verify all required fields (recipient, amount, currency) are visible
    - Verify memo is displayed only when present
    - Run 100+ iterations
    - **Validates: Requirements 7.1, 7.2, 7.3**

  - [ ] 7.3 Create TransactionStatus component (src/components/payment/TransactionStatus.tsx)
    - Accept status, txHash, and error props
    - Display appropriate icon for each status (pending, success, failed)
    - Display appropriate color for each status
    - Render txHash as clickable link to block explorer when available
    - Display error message when status is failed
    - Style component to match existing UI patterns
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 2.3, 2.4_

  - [ ]\* 7.4 Write property test for transaction status visual consistency
    - **Property 11: Transaction Status Visual Consistency**
    - Generate random transaction statuses (pending, success, failed)
    - Render TransactionStatus with each status
    - Verify consistent visual indicators (icon and color) for each status
    - Run 100+ iterations
    - **Validates: Requirements 8.1, 8.2, 8.3, 8.5**

  - [ ] 7.5 Create TransactionHistoryList component (src/components/payment/TransactionHistoryList.tsx)
    - Accept address prop
    - Use useTransactionHistory hook to fetch data
    - Display loading skeleton while fetching
    - Display error message with retry button on failure
    - Display empty state message when no transactions
    - Render list of transactions with timestamp, amount, currency, recipient, status
    - Style list to match existing UI patterns
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [ ]\* 7.6 Write unit tests for payment components
    - Test PaymentConfirmationCard rendering with various intents
    - Test TransactionStatus with different status values
    - Test TransactionHistoryList with empty, loading, and populated states
    - Test button click handlers
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 8.1, 8.2, 8.3, 4.2_

- [ ] 8. Update balance components to use backend API
  - [ ] 8.1 Update TokenBalance component (src/components/balance/TokenBalance.tsx)
    - Replace individual RPC calls with useBalance hook
    - Pass address prop to useBalance
    - Display loading skeleton while isLoading is true
    - Display error message with retry button on error
    - Render all token balances from hook data
    - Format balances with proper decimals
    - Maintain existing styling and layout
    - _Requirements: 3.2, 3.4, 3.5, 3.6_

  - [ ]\* 8.2 Write property test for balance component RPC replacement
    - **Property 10: Balance Component RPC Replacement**
    - Monitor network calls during balance fetching
    - Generate random addresses and render TokenBalance
    - Verify zero direct RPC calls to blockchain nodes
    - Verify only backend API calls are made
    - Run 100+ iterations
    - **Validates: Requirements 3.6**

  - [ ] 8.3 Update user-balance component to use backend API
    - Replace individual RPC calls with useBalance hook
    - Pass address to useBalance
    - Display loading state while fetching
    - Display error message on failure
    - Render balance data from hook
    - Maintain existing styling
    - _Requirements: 3.3, 3.4, 3.5_

  - [ ]\* 8.4 Write unit tests for updated balance components
    - Test TokenBalance with loading, error, and success states
    - Test user-balance with loading, error, and success states
    - Verify proper formatting of balance data
    - _Requirements: 3.2, 3.3, 3.4_

- [ ] 9. Checkpoint - Verify components work independently
  - Ensure all tests pass, verify components render correctly with mock data, ask the user if questions arise.

- [ ] 10. Integrate payment flow into Chat UI
  - [ ] 10.1 Update Chat UI to handle payment commands
    - Identify where chat messages are processed
    - Add logic to detect payment-related messages
    - Call usePaymentIntent.parseIntent when user sends message
    - Display loading indicator while parsing
    - Display error message if parsing fails
    - Maintain existing chat message handling for non-payment messages
    - _Requirements: 1.1, 1.3, 12.1_

  - [ ] 10.2 Integrate PaymentConfirmationCard into chat conversation
    - Display PaymentConfirmationCard inline when intent is parsed
    - Position card within chat message flow
    - Wire up confirm button to useExecutePayment.executePayment
    - Wire up cancel button to clear intent
    - Show loading state during execution
    - Maintain chat history with payment interactions
    - _Requirements: 1.2, 7.6, 12.2, 12.4_

  - [ ] 10.3 Integrate TransactionStatus into chat conversation
    - Display TransactionStatus inline after payment execution
    - Show pending status during transaction submission
    - Show success status with txHash when complete
    - Show failed status with error message on failure
    - Position status within chat message flow
    - Maintain chat history with transaction outcomes
    - _Requirements: 2.3, 2.4, 2.5, 2.6, 12.3, 12.4_

  - [ ]\* 10.4 Write property test for chat UI message flow preservation
    - **Property 9: Chat UI Message Flow Preservation**
    - Generate random payment commands
    - Submit commands through Chat UI
    - Verify messages are processed and displayed inline
    - Verify chat history is maintained
    - Verify existing UI patterns are preserved
    - Run 100+ iterations
    - **Validates: Requirements 12.1, 12.2, 12.3, 12.4, 12.5**

  - [ ]\* 10.5 Write integration tests for complete payment flow
    - Test end-to-end flow: message → parse → confirm → sign → execute → status
    - Test error scenarios at each stage
    - Test cancellation flow
    - Mock backend and wallet responses
    - _Requirements: 1.1, 1.2, 2.1, 2.2, 2.3, 2.4, 12.1, 12.2, 12.3_

- [ ] 11. Wrap application with error boundary
  - [ ] 11.1 Add ApiErrorBoundary to app layout
    - Wrap main app content with ApiErrorBoundary
    - Ensure error boundary covers all API-dependent components
    - Test error boundary by triggering API failures
    - Verify app remains functional after errors
    - _Requirements: 10.1, 10.5_

- [ ] 12. Add transaction history feature (optional enhancement)
  - [ ] 12.1 Add transaction history view to UI
    - Determine placement for TransactionHistoryList component
    - Integrate component into appropriate page/section
    - Pass user address to component
    - Style to match existing UI
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [ ]\* 12.2 Write integration tests for transaction history
    - Test history fetching and display
    - Test empty state
    - Test error handling with retry
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 13. Final checkpoint and testing
  - [ ] 13.1 Run full test suite
    - Execute all unit tests
    - Execute all property-based tests
    - Execute all integration tests
    - Fix any failing tests
    - Verify test coverage meets requirements

  - [ ] 13.2 Manual testing of complete flows
    - Test payment flow with real backend (if available)
    - Test balance fetching with real backend
    - Test error scenarios (disconnect backend, invalid inputs)
    - Test wallet integration (connect, disconnect, sign)
    - Verify UI/UX matches existing patterns

  - [ ] 13.3 Code review and cleanup
    - Review all new code for type safety
    - Remove any console.logs or debug code
    - Ensure consistent code formatting
    - Verify all requirements are addressed
    - Update documentation if needed

## Notes

- Tasks marked with `*` are optional test tasks that can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property-based tests use fast-check library with 100+ iterations
- All API communication uses the type-safe API client layer
- No backend modifications are made - frontend-only changes
- Existing MiniPay wallet integration and chat UI patterns are preserved
- Error handling is comprehensive at all layers (API client, hooks, components)
- The implementation is incremental with checkpoints to validate progress
