# Development Tracker

This file is the running record for completed development and planned next steps.
Update this file on every new implementation so nothing gets lost.

## 2026-04-13

### Completed
- Upgraded invoice defaults with official Minrosh legal identity:
  - Company: `MINROSH IMMIGRATION AND EDUCATION CONSULTANT PTY LTD`
  - ABN `78 682 019 754`, ACN `682 019 754`
  - Address `26 Geranium Drive, Springfield Lakes QLD 4300`
  - Contact `0478100542`, `info@minroshmigration.com.au`
- Updated invoice terms defaults to professional-fee, 14-day due, and refund policy wording.
- Updated payment defaults to CBA details:
  - BSB `064-087`, masked account `****5779`
- Refreshed PDF invoice layout with:
  - Branded header bar
  - Structured invoice details, bill-to, service summary, totals, payment instructions, and terms
- Added new invoice creation fields in admin UI:
  - `Client contact (phone/email)`
  - `Client address`
- Wired API and invoice service to persist:
  - `customerContact`
  - `customerAddress`
- PDF bill-to section now prefers `customerContact` and prints stored `customerAddress`.

### Planned next
- Add GST/discount explicit controls in UI with automatic total preview before create.
- Add richer PDF table rendering for long line items (pagination/wrap).
- Add customer contact details to portal invoice page for consistency with PDF output.
- Add automated invoice reminder templates aligned with new legal/brand wording.
- Add OCR ingestion for receipt/vendor documents into expenses (target: Tesseract-backed extraction with review queue).
- Add predictive cashflow analytics widget using historical due vs paid deltas.
- Add Peppol e-invoicing connector spike (compliance feasibility + provider selection).
- Add MYOB/Xero sync path for reconciliation (status pull + payment push).
- Extend role-based access for invoice actions (create/edit/send/pay/audit export scopes).
- Add bulk generation/send workflow for monthly cycles.
- Add client portal invoice comments/revision request flow.
- Add Pay Now options roadmap (card/direct debit/PayID integration options and risk review).

### Completed (Update 2)
- Added inline edit controls for existing invoices from the admin invoices table:
  - Edit button per row
  - Editable fields: name, email, contact, address, due date, terms
  - Save writes via existing `action: "update"` API path

### Completed (Update 3)
- Added customer-provided company logo into invoice PDFs:
  - Copied logo to `public/images/minrosh-logo.png`
  - PDF renderer now embeds logo (with safe fallback if image read fails)
  - Template issuer supports `logoPath` and defaults to `/images/minrosh-logo.png`
- Added discount support in invoice calculations and UI:
  - Invoice create supports `discount`
  - Totals now compute `subtotal + tax - discount`
  - Preview panel shows subtotal, GST, discount, and total payable
- Added editable multi-line service items in invoice creation:
  - Add/remove service lines per customer
  - Each line captures description, quantity, and unit price
  - Line items are persisted and used by PDF service summary
- Made payment details clearer for customers:
  - Bank details seed now includes visible account number `10335779`
  - PDF payment section prints full account number when configured

### Planned next (Update 3)
- Add bank details editor in admin invoice settings with validation and preview.
- Add support for line-level GST override (not always fixed at 10%).
- Add invoice email send action with payment details + PDF attachment in one click.

### Completed (Update 4)
- Added Invoice Template Manager in admin invoice form:
  - Select existing template
  - Apply template to current invoice (terms + service lines)
  - Save current terms + line items as new reusable template
- Added API support for template save/update:
  - `POST /api/admin/invoices` with `action: "upsertTemplate"`
- Improved template usage in invoice creation:
  - If no line items provided, create invoice from template line defaults
  - Template line defaults are normalized/sanitized server-side

### Planned next (Update 4)
- Add template edit/delete actions and version history in the template manager.
- Add per-template issuer presets (logo/address/contact variants).
- Add drag-and-drop ordering for service lines in template builder.

### Completed (Update 5)
- Improved PDF compliance and readability:
  - Added prominent `TAX INVOICE` label in header.
  - Highlighted due date in urgency color.
  - Softened service row separators to remove heavy mid-page black-line effect.
  - Added logo fallback message when image path is invalid.
  - Added JPG and PNG logo embedding support.
- Improved template autonomy from admin panel:
  - Auto-applies default template when creating new invoice.
  - Template issuer supports logo + typography settings via admin save.
- Improved service line guidance:
  - Service line placeholder now prompts date-specific descriptions for audit clarity.

### Planned next (Update 5)
- Add optional late-fee clause field and render in PDF terms.

### Completed (Update 6)
- Added template duplicate and delete actions in admin template manager.
- Added backend support for template duplicate/delete:
  - `action: "duplicateTemplate"`
  - `action: "deleteTemplate"`
- Added live template preview panel in admin (logo + issuer + terms + sample lines).

### Planned next (Update 6)
- Add soft-delete/archive mode for templates with restore option.
- Add template usage analytics (last used / invoice count).
- Add per-template validation warnings (missing logo, weak terms, empty lines).

### Completed (Update 7)
- Added discount description support:
  - Create + edit invoice forms now include discount description.
  - API/service persist `discountDescription`.
  - PDF totals block prints discount note when provided.
- Strengthened logo embedding reliability in PDF:
  - Renderer now tries PNG first, then JPG fallback (handles misnamed extensions safely).
- Updated invoice workspace layout to split editor + right-side live preview panel.
- Switched admin theme palette to light mode for the entire admin area.

### Planned next (Update 7)
- Add admin-level visual theme toggle (light/dark) per user preference.
- Add logo upload helper in admin (avoid manual `/public` path entry).

### Completed (Update 8)
- Simplified confusing invoice admin form by removing duplicate amount/service inputs.
- Kept one right-side live invoice preview panel and removed the extra internal template-preview block.
- Added advanced-template settings toggle to reduce visual clutter in daily use.
- Kept discount description in create/edit and reflected in preview/PDF.

### Planned next (Update 8)
- Add compact “basic vs advanced” mode switch for invoice editor.
- Add dedicated logo upload button to set issuer logo without typing a path.

### Completed (Update 9)
- Expanded live invoice preview to include payment instructions block:
  - Bank name, account name, BSB, account number, and payment reference format.
- Added invoice email send workflow:
  - New `Email PDF` action in invoice table.
  - New backend action `emailInvoice` to send the invoice PDF attachment via configured SMTP.
  - Optional "send after create" toggle + recipient input in new invoice form.
- Added customer-linking support in invoice creation:
  - `Customer ID` selector in invoice editor to link invoice with an existing customer profile.
- Added automatic customer profile linking/creation from website contact + consultation submissions:
  - Match strategy: email first, then name + phone suffix.
  - If not matched, create a new customer profile and attach the new lead to it.

### Planned next (Update 9)
- Add customer search autocomplete (name/email/mobile) for faster invoice linking on large customer lists.
- Add customer-ID auto-fill to invoice edit mode (not just create mode).
- Add branded email templates for invoice delivery (HTML + payment instructions + support contact).
- Add fallback retry queue for invoice email failures (SMTP outage resilience).

### Completed (Update 10)
- Improved admin user verification reliability and troubleshooting UX:
  - `POST /api/admin/users` now returns `verificationUrl` to super admin clients.
  - `POST /api/admin/users/[id]/resend` now returns `verificationUrl` to super admin clients.
  - Users admin page now shows a manual verification link + copy action when email send fails.
  - Admin verification mail error now returns a detailed send failure suffix (`send_failed:<message>`) for faster diagnosis.
- Verified SMTP connectivity from this environment using `npm run test:smtp` (connection/auth success).

### Planned next (Update 10)
- Add optional SMTP test button directly in admin Users page for one-click diagnostics.
- Add audit event enrichment for verification-email failure reason + destination domain.

### Completed (Update 11)
- Added invoice payment QR support for Australian NPP/PayID flow:
  - Added `qrcode` dependency.
  - Added `lib/admin/invoice-payment-qr.js` to generate `au-npp://pay?...` payloads with amount + invoice reference.
  - Embedded scan-to-pay QR in PDF payment instructions section.
  - Payment reference reused consistently in both text and QR payload.
- Added optional env support for invoice QR recipient identity:
  - `.env.example` now documents `INVOICE_PAYID` (falls back to `SMTP_FROM` if unset).

### Planned next (Update 11)
- Add invoice preview panel QR visualization so admins can confirm scannability before sending.
- Add optional toggle to hide QR per invoice/customer preference.

### Completed (Update 12)
- Removed key duplicate configuration and default definitions:
  - Added shared admin verification URL helper: `lib/admin/admin-user-verify-url.js`.
  - Refactored both create-user and resend-verification API routes to use the shared verification URL builder.
  - Added shared invoice defaults module: `lib/admin/invoice-defaults.js`.
  - Refactored invoice service, invoice PDF builder, and invoice panel UI to consume shared issuer/bank/terms defaults from one source.
  - Removed duplicated `GOOGLE_SHEETS_STATUS_SPREADSHEET_ID` comment entry from `.env.example`.

### Planned next (Update 12)
- Add a tiny unit test coverage pass for shared defaults/helpers to prevent reintroduction of duplicate constants.

### Completed (Update 13)
- Mirrored live preview hierarchy more closely into invoice PDF output:
  - Header now uses split hierarchy (brand block left, tax invoice metadata right).
  - Added stronger amount-due / due-date summary ribbon.
  - Updated service table labels to accounting style (`Unit Price`, `Amount AUD`) with cleaner row separators.
  - Reworked payment + totals area into a two-column block similar to preview.
  - Preserved scan-to-pay QR and aligned it within payment instructions for visual consistency.

### Completed (Update 14)
- Added admin navigation compact mode and grouped sidebar sections:
  - Default compact list of key tabs with one-click toggle to show all tabs.
  - Kept sidebar fixed while content pane scrolls independently.
- Added invoice PDF inline-view support:
  - `View` opens PDF in-browser.
  - `Download` uses explicit `?download=1`.
- Added live invoice preview QR block:
  - Shows scan-to-pay QR in preview payment section.
  - Displays PayID for operator verification.
- Synced preview QR with server-configured PayID:
  - `GET /api/admin/invoices` now returns resolved `invoicePayId`.
  - Preview QR payload uses `invoicePayId` so preview matches PDF generation logic.
- Fixed critical regressions:
  - Verification URL builder now safely handles malformed/bare `NEXT_PUBLIC_SITE_URL` values and local hosts.
  - Fixed invoice PDF runtime bug in QR amount binding that broke view/download/email PDF flows.

### Planned next (Update 14)
- Add a small admin warning banner when `NEXT_PUBLIC_SITE_URL` is invalid or non-URL.
- Add one-click “Send test verification email” utility in Users page.

### Completed (Update 15)
- Tightened invoice PDF layout correctness for downloaded files:
  - Added text-fit and wrapping helpers to reduce clipping for company, address, service, and bank account-name fields.
  - Updated amount-due logic to use outstanding balance (`total - paid`) for summary and QR payload.
  - Increased payment QR size and quiet-zone border to improve banking app scan reliability.
  - Moved discount note out of totals panel into footer notes area for cleaner financial block.

### Completed (Update 16)
- Fixed invoice PDF readability/alignment issues reported from downloaded file:
  - Reduced header business-name width to prevent overlap with right-side `TAX INVOICE`.
  - Added controlled wrapping/truncation for issuer address, line descriptions, and bank account name.
  - Reflowed payment detail line positions after wrapped account-name block.
- Improved QR compatibility and scan behavior:
  - Added configurable QR payload mode via `INVOICE_QR_MODE`.
  - Default mode now `plain_text` for broad scanner compatibility (avoids unsupported custom URI errors).
  - Optional `npp_uri` mode retained for deep-link scenarios with compatible banking app scanners.
  - Added `invoiceQrMode` to invoices admin settings response so live preview matches server QR mode.
- Updated `.env.example` with `INVOICE_QR_MODE` guidance.

### Completed (Update 17)
- Added admin UI control to change invoice QR mode without editing `.env`:
  - Live preview payment block now includes `QR mode` selector (Compatibility vs NPP deep-link).
  - Selection persists through existing invoice bank/settings save path.
  - PDF QR generator now respects saved `qrMode` from invoice payment settings.
  - Backward-compatible env fallback remains available when no saved mode exists.

## Process rule
- Every new development cycle must append:
  1. Date
  2. Completed items
  3. Planned next items
