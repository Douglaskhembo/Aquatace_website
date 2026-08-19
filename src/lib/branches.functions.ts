import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";

export interface Branch {
  id: string;
  name: string;
  area: string | null;
  address: string | null;
  county: string | null;
  latitude: number;
  longitude: number;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  opening_hours: string | null;
  offer_note: string | null;
  serves_areas: string[];
  products_available: string[];
  active: boolean;
  sort_order: number;
}

export const listBranches = createServerFn({ method: "GET" }).handler(async (): Promise<Branch[]> => {
  const supa = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await supa
    .from("branches")
    .select("id,name,area,address,county,latitude,longitude,phone,whatsapp,email,opening_hours,offer_note,serves_areas,products_available,active,sort_order")
    .eq("active", true)
    .order("sort_order");
  if (error) throw new Error(error.message);
  return (data ?? []) as Branch[];
});
