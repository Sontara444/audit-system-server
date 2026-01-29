# ReconAudit System - Backend

## Architecture
This project follows a **layered architecture** to ensure separation of concerns and maintainability.

### Tech Stack
*   **Runtime**: Node.js
*   **Framework**: Express.js
*   **Database**: MongoDB (Mongoose ODM)
*   **Authentication**: JWT (JSON Web Tokens)
*   **File Handling**: Multer (Uploads), csv-parser (Processing)

### Logic Flow
1.  **Upload**: User uploads a CSV. It is saved to `uploads/` and a `UploadJob` record is created in MongoDB.
2.  **Processing**: The CSV is streamed and parsed. Each row is saved as a raw `Record` linked to the job.
3.  **Reconciliation**: When triggered, the system fetches all records for the job and compares them against the `SystemRecord` collection (System of Record).
    *   **Exact Match**: Transaction ID matches AND Amount matches exactly.
    *   **Partial Match**: Transaction ID matches but Amount differs within a 2% tolerance.
    *   **Unmatched**: Transaction ID does not exist in the system or Amount difference is too large.
4.  **Audit**: Key actions (Upload, Recon, Flagging) are logged to `AuditLog`.

## Assumptions
*   **CSV Format**: The system expects CSV headers typically like `TransactionID`, `Amount`, `Date`. The processor attempts to utilize case-insensitive matching for these common fields.
*   **Currency**: It is assumed that the uploaded file and the system records share the same currency. No conversion is performed.
*   **Unique IDs**: Transaction IDs are assumed to be unique identifiers for a single financial event.

## Trade-offs
*   **Local File Storage**: We store files on the local disk (`uploads/`) for simplicity. In a distributed/production environment, this should be replaced with cloud storage (e.g., AWS S3) to allow stateless scaling.
*   **Synchronous-style Triggers**: Reconciliation is triggered via HTTP. For extremely large datasets, this process should be offloaded to a background worker queue (like BullMQ or RabbitMQ) to prevent API timeouts, though we currently use basic async handling.
*   **Soft Delete/Cleanup**: Currently, uploaded files are not automatically deleted after processing to allow for debugging. A cron job would be needed for cleanup in production.

## Limitations
*   **Dynamic Mapping**: There is no UI for users to map CSV columns to system fields dynamically; it relies on standardizing headers.
*   **Performance**: Extremely large files (1GB+) might hit Node.js memory limits during the `insertMany` batching phase if batch sizes are not tuned or if the garbage collector falls behind.
*   **Matching Rules**: The matching logic is hardcoded. A rule engine would be required for more complex, user-defined matching criteria.
