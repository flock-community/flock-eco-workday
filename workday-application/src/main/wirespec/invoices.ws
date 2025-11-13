endpoint UploadToExactonline POST UploadInvoice /api/invoices/upload_invoice -> {
  200 -> Unit
}
endpoint GetInvoiceAll GET /api/invoices ? {pageable: Pageable} -> {
  200 -> Invoice[]
}

type UploadInvoice {
  id: String?
}
type Invoice {
  id: String?,
  description: String?,
  reference: String?,
  amount: Number?,
  `type`: InvoiceType?,
  status: InvoiceStatus?,
  documents: Document[]?
}
enum InvoiceType {
  EXPENSE
}
enum InvoiceStatus {
  NEW, PROCESSED
}
type Document {
  name: String?,
  file: String?
}
