import { Pool, types } from "pg";

// NUMERIC/DECIMAL columns (price_kes, subtotal_kes, latitude/longitude are
// DOUBLE PRECISION and unaffected) come back as strings by default to avoid
// precision loss — the app treats these as plain numbers everywhere, so parse
// them as floats here once instead of at every call site.
types.setTypeParser(1700, (val) => parseFloat(val));

let _pool: Pool | undefined;

export function getDb(): Pool {
  if (!_pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("Missing DATABASE_URL environment variable.");
    }
    _pool = new Pool({ connectionString });
  }
  return _pool;
}
