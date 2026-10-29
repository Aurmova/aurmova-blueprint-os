# Staging D1 export API review

Cloudflare's documented D1 SQL export endpoint uses POST /accounts/{account_id}/d1/database/{database_id}/export with output_format=polling. An in-progress response returns at_bookmark, which must be supplied as current_bookmark in subsequent polls. A completed response returns result.signed_url, which expires after one hour.

The export may temporarily interrupt D1 queries. It is not a read-only query in the operational sense, even though it does not alter application data.

For AURMOVA, only the existing booking-staging and private-staging D1 database IDs are in scope. No production database, deployment, migration, or restoration is authorized.

Cloudflare's public documentation confirms D1 Read is a token permission but does not establish that this exact export endpoint accepts the user's token. That must be checked without disclosing credentials.

Before execution, review encrypted artifact handling, export completion polling, integrity checks, secure storage, and recovery rehearsal. No export or backup has been executed by this document.

Sources:
- https://developers.cloudflare.com/api/resources/d1/subresources/database/methods/export/
- https://developers.cloudflare.com/fundamentals/api/reference/permissions/
