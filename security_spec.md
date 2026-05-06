# Security Specification for Skolar Intel

## Data Invariants
1. A user can only read and write their own profile (`users/{userId}` where `userId == auth.uid`).
2. `meritId` is immutable after creation.
3. Applications must belong to the authenticated user (`userId == auth.uid`).
4. Documents must belong to the authenticated user (`userId == auth.uid`).
5. Chat messages must be private to the user.
6. Admin-only roles (if any) must be validated via a separate `admins` collection.

## The Dirty Dozen Payloads

1. **Identity Spoofing**: Attempt to create a user profile with a different UID.
2. **Privilege Escalation**: Attempt to set `isVerified: true` as a regular user.
3. **Ghost Field Injection**: Add `systemNotes: "Malicious"` to an application.
4. **ID Poisoning**: Use a 2KB string as a `documentId`.
5. **Update Gap**: Modify an application's `userId` to transfer it to another account.
6. **Relational Bypass**: Create an application for a user that doesn't exist.
7. **Terminal State Break**: Attempt to change an 'Accepted' application back to 'Draft'.
8. **PII Leak**: List all users (`/users`) without being an owner.
9. **Resource Exhaustion**: Upload 10,000 document metadata entries in a batch.
10. **Timestamp Fraud**: Set `createdAt` to a future date in the past.
11. **Negative Merit**: Set application `progress` to `-50`.
12. **Orphaned Writes**: Create a document entry without an associated user record.

## Test Runner (Draft Rules)
The rules must reject all of these.
