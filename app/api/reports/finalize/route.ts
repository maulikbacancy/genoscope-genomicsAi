import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const { report_id } = await req.json();
  const supabase = await createServiceClient();
  const { data: { user } } = await supabase.auth.getUser();
  await supabase.from("reports").update({ status: "final", approved_by: user?.id }).eq("id", report_id);
  return NextResponse.json({ success: true });
}
