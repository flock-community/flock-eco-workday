import dayjs from "dayjs";
import InternalizingClient from "../utils/InternalizingClient.ts";
import NonInternalizingClient from "../utils/NonInternalizingClient.ts";

const internalize = (it) => ({
  ...it,
  date: dayjs(it.date),
});

const path = "/api/invoices";
const uploadInvoicePath = `${path}/upload_invoice`;

const resourceClient = InternalizingClient(path, internalize);
const uploadInvoiceClient = NonInternalizingClient(uploadInvoicePath);

const uploadInvoice = (id) => uploadInvoiceClient.post({ id });

export const InvoiceClient = {
  uploadInvoice,
  ...resourceClient,
};
