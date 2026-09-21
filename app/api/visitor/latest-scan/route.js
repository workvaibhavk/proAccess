import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// GET /api/visitor/latest-scan
// Returns the most recent ALLOWED card tap (already written to scan_logs by
// your existing verify route). Python polls this to learn which RFID UID
// was just tapped, then calls /api/visitor/active?rfid_uid=<uid>.
export async function GET() {
  try {
    const { data: scan, error } = await supabaseAdmin
      .from("scan_logs")
      .select("log_id, rfid_uid, scanned_at, result")
      .eq("result", "allowed")
      .order("scanned_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;

    return NextResponse.json({ success: true, scan: scan ?? null }, { status: 200 });
  } catch (err) {
    console.error("visitor/latest-scan error:", err);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
