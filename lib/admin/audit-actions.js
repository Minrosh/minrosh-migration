export const AUDIT_ACTIONS = {
  // Admin authentication and account lifecycle
  ADMIN_INTEGRATIONS_TEST_RUN: "admin_integrations_test_run",
  ADMIN_LOGIN_FAILED: "admin_login_failed",
  ADMIN_LOGOUT: "admin_logout",
  ADMIN_PASSWORD_CHANGE: "admin_password_change",
  ADMIN_USER_CREATE: "admin_user_create",
  ADMIN_USER_DELETE: "admin_user_delete",
  ADMIN_USER_EMAIL_VERIFIED: "admin_user_email_verified",
  ADMIN_USER_RESEND_VERIFY: "admin_user_resend_verify",
  ADMIN_USER_UPDATE: "admin_user_update",

  // Broadcast
  BROADCAST_PROSPECTIVE: "broadcast_prospective",

  // CRM
  CRM_AUTOMATIONS_UPDATE: "crm_automations_update",
  CRM_INBOX_MESSAGE_CREATE: "crm_inbox_message_create",
  CRM_INTERACTION_CREATE: "crm_interaction_create",
  CRM_LEAD_CONVERT: "crm_lead_convert",
  CRM_LEAD_CREATE: "crm_lead_create",
  CRM_OPPORTUNITY_STAGE_UPDATE: "crm_opportunity_stage_update",
  CRM_QUOTE_CREATE: "crm_quote_create",
  CRM_TASK_COMPLETE: "crm_task_complete",
  CRM_TASK_CREATE: "crm_task_create",

  // Customers
  CUSTOMER_CREATE: "customer_create",
  CUSTOMER_DELETE: "customer_delete",
  CUSTOMER_DOCUMENTS_ZIP: "customer_documents_zip",
  CUSTOMER_MAGIC_REGENERATE: "customer_magic_regenerate",
  CUSTOMER_MERGE: "customer_merge",
  CUSTOMER_UPDATE: "customer_update",

  // Invoices
  INVOICE_ATTACH_TIME_EXPENSES: "invoice_attach_time_expenses",
  INVOICE_BANK_DETAILS: "invoice_bank_details",
  INVOICE_CREATE: "invoice_create",
  INVOICE_EMAIL_SENT: "invoice_email_sent",
  INVOICE_EXPENSE_CREATE: "invoice_expense_create",
  INVOICE_GRN_CREATE: "invoice_grn_create",
  INVOICE_PAYMENT: "invoice_payment",
  INVOICE_PO_CREATE: "invoice_po_create",
  INVOICE_RECURRING_RUN: "invoice_recurring_run",
  INVOICE_RECURRING_UPSERT: "invoice_recurring_upsert",
  INVOICE_REMINDER_RUN: "invoice_reminder_run",
  INVOICE_REMINDER_UPSERT: "invoice_reminder_upsert",
  INVOICE_STATUS: "invoice_status",
  INVOICE_SYNC_QUEUE: "invoice_sync_queue",
  INVOICE_SYNC_RUN: "invoice_sync_run",
  INVOICE_TEMPLATE_DELETE: "invoice_template_delete",
  INVOICE_TEMPLATE_DUPLICATE: "invoice_template_duplicate",
  INVOICE_TEMPLATE_UPSERT: "invoice_template_upsert",
  INVOICE_TIME_ENTRY_CREATE: "invoice_time_entry_create",
  INVOICE_UPDATE: "invoice_update",
  INVOICE_VALIDATION_RUN: "invoice_validation_run",

  // Intelligence
  INTEL_DRAFT_APPROVED: "intel_draft_approved",
  INTEL_DRAFT_PENDING: "intel_draft_pending",
  INTEL_DRAFT_REJECTED: "intel_draft_rejected",
  INTEL_PUBLISH_ROLLBACK: "intel_publish_rollback",
  INTEL_SCAN_MANUAL: "intel_scan_manual",
  INTEL_SOCIAL_POSTER_PREVIEW_GENERATE: "intel_social_poster_preview_generate",

  // News and stories
  NEWS_CREATE: "news_create",
  NEWS_DELETE: "news_delete",
  NEWS_UPDATE: "news_update",
  SUCCESS_STORY_CREATE: "success_story_create",
  SUCCESS_STORY_DELETE: "success_story_delete",
  SUCCESS_STORY_UPDATE: "success_story_update",

  // Website CMS
  WEBSITE_PAGE_DRAFT_SAVE: "website_page_draft_save",
  WEBSITE_PAGE_PUBLISH: "website_page_publish",
  WEBSITE_PAGE_ROLLBACK: "website_page_rollback",
  WEBSITE_PAGE_UNPUBLISH: "website_page_unpublish",
  WEBSITE_COMPLIANCE_UPDATE: "website_compliance_update",
  WEBSITE_NAVIGATION_UPDATE: "website_navigation_update",
  WEBSITE_FOOTER_UPDATE: "website_footer_update",
  WEBSITE_MEDIA_UPLOAD: "website_media_upload",
};
