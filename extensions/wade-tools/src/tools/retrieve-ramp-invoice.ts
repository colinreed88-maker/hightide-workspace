import { getSupabase } from "../db.js";
import { textResult, type ToolResult } from "../types.js";

export const definition = {
  name: "retrieve_ramp_invoice",
  description:
    "Retrieve a Ramp invoice/bill PDF. Searches by vendor name or exact bill ID. Returns a signed download URL for the invoice.",
  parameters: {
    type: "object",
    properties: {
      vendor_search: {
        type: "string",
        description: "Vendor name to search for (case-insensitive substring match).",
      },
      bill_id: {
        type: "string",
        description: "Exact Ramp bill UUID if known.",
      },
      date_from: {
        type: "string",
        description: "Start date filter (YYYY-MM-DD).",
      },
      date_to: {
        type: "string",
        description: "End date filter (YYYY-MM-DD).",
      },
      limit: {
        type: "number",
        description: "Max invoices to return (default 5).",
      },
    },
    required: [],
  },
};

export async function execute(_id: string, params: Record<string, unknown>): Promise<ToolResult> {
  const supabase = getSupabase();
  const vendorSearch = params.vendor_search as string | undefined;
  const billId = params.bill_id as string | undefined;
  const dateFrom = params.date_from as string | undefined;
  const dateTo = params.date_to as string | undefined;
  const limit = (params.limit as number) ?? 5;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let q = (supabase.from("ramp_bills") as any)
    .select("id, vendor_name, amount, issued_at, status, invoice_number")
    .order("issued_at", { ascending: false })
    .limit(limit);

  if (billId) q = q.eq("id", billId);
  if (vendorSearch) q = q.ilike("vendor_name", `%${vendorSearch}%`);
  if (dateFrom) q = q.gte("issued_at", dateFrom);
  if (dateTo) q = q.lte("issued_at", dateTo);

  const { data: bills, error } = await q;
  if (error) return textResult({ error: error.message });
  if (!bills?.length) return textResult({ results: [], message: "No matching Ramp bills found." });

  const results = await Promise.all(
    (bills as Array<{ id: string; vendor_name: string; amount: number; issued_at: string; status: string; invoice_number: string | null }>).map(async (bill) => {
      const storagePath = `${bill.id}.bin`;
      const { data } = await supabase.storage
        .from("ramp-invoices")
        .createSignedUrl(storagePath, 3600);

      return {
        bill_id: bill.id,
        vendor: bill.vendor_name,
        amount: bill.amount,
        issued_at: bill.issued_at,
        status: bill.status,
        invoice_number: bill.invoice_number,
        download_url: data?.signedUrl ?? null,
        note: data?.signedUrl ? undefined : "Invoice PDF not cached. May need to fetch from Ramp.",
      };
    }),
  );

  return textResult({ results, count: results.length });
}
