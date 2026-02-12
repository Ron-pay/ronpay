# Implementation Plan: Chat Header Avatar Fix

## Overview

This implementation plan addresses the replacement of the placeholder avatar in the ChatHeader component with the actual RonPay AI logo. The work involves copying the logo file to the Next.js public directory and updating the Avatar component's src prop reference.

## Tasks

- [-] 1. Set up the Next.js public directory structure
  - Create the `Frontend/apps/web/public/images/` directory
  - Copy `public/images/ronpay-agent-avatar.png` to `Frontend/apps/web/public/images/ronpay-agent-avatar.png`
  - Verify the file exists at the destination path
  - _Requirements: 1.1, 1.3, 4.1, 4.2_

- [ ] 2. Update the ChatHeader component avatar reference
  - Modify `Frontend/apps/web/src/components/chat/ChatHeader.tsx`
  - Change the Avatar component's `src` prop from `"/ronpay-avatar.png"` to `"/images/ronpay-agent-avatar.png"`
  - Ensure all other Avatar props remain unchanged (alt, fallback, className)
  - _Requirements: 2.1, 2.3_

- [ ]\* 3. Write unit tests for ChatHeader component
  - [ ]\* 3.1 Test that Avatar receives correct src prop
    - **Example 1: Avatar Image Path**
    - **Validates: Requirements 2.1**
  - [ ]\* 3.2 Test that Avatar has correct size classes
    - **Example 2: Avatar Size Styling**
    - **Validates: Requirements 2.3**
  - [ ]\* 3.3 Test that status indicator is rendered
    - **Example 4: Status Indicator Presence**
    - **Validates: Requirements 3.2**
  - [ ]\* 3.4 Test fallback behavior on image load failure
    - **Example 3: Fallback Display on Image Load Failure**
    - **Validates: Requirements 2.4**

- [ ] 4. Manual verification checkpoint
  - Start the Next.js development server
  - Navigate to the chat interface
  - Verify the RonPay AI logo displays correctly in the header
  - Confirm the logo is circular and properly sized
  - Verify the green status indicator dot is visible
  - Test in multiple browsers (Chrome, Firefox, Safari)
  - Ensure all tests pass, ask the user if questions arise
  - _Requirements: 2.2, 3.1, 3.3, 3.4_

## Notes

- Tasks marked with `*` are optional and can be skipped for faster implementation
- Task 1 is a prerequisite for Task 2 (file must exist before updating the reference)
- Task 4 includes manual verification of visual requirements that cannot be automated
- The original logo file at `public/images/ronpay-agent-avatar.png` remains unchanged
- Each test task references specific requirements for traceability
