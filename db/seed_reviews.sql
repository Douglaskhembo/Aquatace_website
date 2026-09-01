-- Fabricated placeholder reviews so the public reviews section isn't empty
-- before real customer feedback comes in. Safe to re-run (fixed ids + ON
-- CONFLICT DO NOTHING). Apply once against the VPS's Postgres, after
-- db/schema.sql:
--   psql "$DATABASE_URL" -f db/seed_reviews.sql
--
-- These rows are marked is_seed = true. The reviews section always shows real
-- reviews first and only pads with these to fill the first page — once 5 real
-- reviews exist, these stop appearing anywhere in the UI.

INSERT INTO reviews (id, customer_name, rating, comment, is_seed, created_at) VALUES
  ('11111111-1111-4111-8111-111111111101', 'Grace Wanjiru', 5, 'Ordered a 20L refill and it was at my door in under 30 minutes. Water tastes clean and the delivery guy was very polite.', TRUE, now() - interval '2 days'),
  ('11111111-1111-4111-8111-111111111102', 'Brian Otieno', 5, 'Been buying our 13kg gas refills from Aquatace for months now. Always genuine, always fast. Never had a short-fill issue.', TRUE, now() - interval '5 days'),
  ('11111111-1111-4111-8111-111111111103', 'Faith Njeri', 4, 'Good service overall, delivery took a bit longer than expected but the rider called ahead and kept me updated.', TRUE, now() - interval '9 days'),
  ('11111111-1111-4111-8111-111111111104', 'Kevin Mwangi', 5, 'Ordered custom branded water bottles for our church event and they turned out great. Everyone asked where we got them.', TRUE, now() - interval '13 days'),
  ('11111111-1111-4111-8111-111111111105', 'Mercy Achieng', 5, 'Membley branch is super reliable. I just WhatsApp them and my order is confirmed within minutes.', TRUE, now() - interval '18 days'),
  ('11111111-1111-4111-8111-111111111106', 'Peter Kariuki', 4, 'Solid prices compared to other gas suppliers around Ruiru. Will keep ordering.', TRUE, now() - interval '24 days'),
  ('11111111-1111-4111-8111-111111111107', 'Ann Wambui', 5, 'Loved the branded water bottles for my wedding — the team even helped with the label design over WhatsApp.', TRUE, now() - interval '31 days'),
  ('11111111-1111-4111-8111-111111111108', 'Samuel Kiptoo', 3, 'Delivery was fine but I wish there were more electronics options in stock at the Kihunguro branch.', TRUE, now() - interval '40 days')
ON CONFLICT (id) DO NOTHING;
