import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

// Always run per-request; never cache a lookup result.
export const dynamic = "force-dynamic";

// GET /api/visitor/active?rfid_uid=27:30:C9:06
export async function GET(request) {
  try {
    const rfid_uid = new URL(request.url).searchParams.get("rfid_uid")?.trim();

    if (!rfid_uid) {
      return NextResponse.json(
        { success: false, message: "rfid_uid query parameter is required" },
        { status: 400 },
      );
    }

    const { data: visitor, error } = await supabaseAdmin
      .from("visitors")
      .select("visitor_id, person_name, rfid_uid, total_visitor_members")
      .eq("rfid_uid", rfid_uid)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;

    if (!visitor) {
      return NextResponse.json(
        { success: false, message: "Visitor not found or inactive" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, visitor }, { status: 200 });
  } catch (err) {
    console.error("visitor/active error:", err);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
