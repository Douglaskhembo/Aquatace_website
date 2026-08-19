#!/bin/bash
SUPABASE_URL="https://waghmlviayakkmcqnnbw.supabase.co"
SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhZ2htbHZpYXlha2ttY3FubmJ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzExNTQ2MCwiZXhwIjoyMTAyNjkxNDYwfQ.QW2MCcJ-2gEKDUoQixZODE26YwQBRMSEESaIeq_ZXWA"
BASE="$SUPABASE_URL/storage/v1/object/public/media"

update() {
  local slug="$1" file="$2"
  local url="$BASE/gas/$file"
  local path="gas/$file"
  local code
  code=$(curl -s -o /dev/null -w "%{http_code}" -X PATCH \
    "${SUPABASE_URL}/rest/v1/products?slug=eq.${slug}" \
    -H "Authorization: Bearer ${SERVICE_KEY}" \
    -H "apikey: ${SERVICE_KEY}" \
    -H "Content-Type: application/json" \
    -H "Prefer: return=minimal" \
    -d "{\"image_url\":\"${url}\",\"image_path\":\"${path}\"}")
  echo "$code → $slug"
}

update "afrigas-6kg-refill"    "afrigas-6kg.webp"
update "afrigas-13kg-refill"   "afrigas-13kg.png"
update "afrigas-45kg-refill"   "afrigas-45kg.webp"
update "hashi-6kg-refill"      "hashi-6kg.jpg"
update "hashi-13kg-refill"     "hashi-13kg.webp"
update "k-gas-6kg-refill"      "k-gas-6kg.jpg"
update "k-gas-13kg-refill"     "k-gas-13kg.jpeg"
update "mengas-6kg-refill"     "mengas-6kg.png"
update "mengas-50kg-refill"    "mengas-50kg-.png"
update "mogas-13kg-refill"     "mogas-45kg.jpeg"
update "mogas-45kg-refill"     "mogas-45kg.jpeg"
update "mpishi-6kg-refill"     "mpishi-6kg.jpg"
update "mpishi-13kg-refill"    "mpishi-13kg.png"
update "pro-gas-6kg-refill"    "progas-6kg.jpg"
update "pro-gas-13kg-refill"   "progas-13kg.jpg"
update "rubis-6kg-refill"      "rubis-6kg.jpg"
update "rubis-13kg-refill"     "rubis-13kg.jpeg"
update "sea-gas-6kg-refill"    "seagas-6kg.webp"
update "sea-gas-13kg-refill"   "seagas-13kg.jpeg"
update "taifa-gas-6kg-refill"  "taifa-6kg.png"
