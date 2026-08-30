import { createServerFn } from "@tanstack/react-start";
import { getDb } from "./db.server";

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

export const listBranches = createServerFn({ method: "GET" }).handler(
  async (): Promise<Branch[]> => {
    const db = getDb();
    const { rows } = await db.query<Branch>(
      `SELECT id, name, area, address, county, latitude, longitude, phone, whatsapp, email,
            opening_hours, offer_note, serves_areas, products_available, active, sort_order
     FROM branches
     WHERE active = true
     ORDER BY sort_order`,
    );
    return rows;
  },
);
