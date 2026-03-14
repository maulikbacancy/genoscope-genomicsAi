import { createClient } from "@/lib/supabase/server";
import { QualityClient } from "./quality-client";

export default async function QualityPage() {
  const supabase = await createClient();
  const { data: metrics } = await supabase.from("quality_metrics").select("*, samples(barcode, sample_type)").order("created_at", { ascending: false }).limit(50);
  return <QualityClient metrics={metrics ?? []} />;
}
