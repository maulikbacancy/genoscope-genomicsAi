import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const { variant_id, classification, review_notes } = await req.json();
  const supabase = await createServiceClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { error } = await supabase.from("variants").update({
    classification,
    review_status: "reviewed",
    reviewed_by: user?.id,
    review_notes,
  }).eq("id", variant_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
