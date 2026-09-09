-- =============================================
-- CoolestKidz — Table products pour Supabase
-- =============================================
-- 1. Va dans ton projet Supabase → SQL Editor
-- 2. Colle ce code et clique sur "Run"
-- =============================================

create table if not exists products (
  id bigint generated always as identity primary key,
  name text not null,
  category text not null default 'Homme',
  price integer not null default 0,
  description text default '',
  image text default '',
  featured boolean default false,
  created_at timestamptz default now()
);

-- Autoriser la lecture publique (site vitrine)
alter table products enable row level security;

create policy "Lecture publique"
  on products for select
  using (true);

-- Autoriser insert / update / delete pour l’instant (MVP)
-- Pour plus de sécurité plus tard, on pourra restreindre avec Auth
create policy "Écriture ouverte (MVP)"
  on products for insert
  with check (true);

create policy "Modification ouverte (MVP)"
  on products for update
  using (true);

create policy "Suppression ouverte (MVP)"
  on products for delete
  using (true);

-- Exemples de produits de départ (optionnel)
insert into products (name, category, price, description, featured) values
  ('T-shirt Signature Rouge', 'Homme', 15000, 'T-shirt premium en coton, logo CoolestKidz brodé. Coupe moderne.', true),
  ('Hoodie Royal', 'Homme', 35000, 'Sweat à capuche épais, finitions soignées, style streetwear premium.', true),
  ('Robe Élégance', 'Femme', 28000, 'Robe fluide et élégante, parfaite pour toutes les occasions.', false),
  ('Ensemble Kids Cool', 'Enfants', 18000, 'Ensemble confortable et stylé pour les petits. Qualité premium.', true),
  ('Casquette Crown', 'Accessoires', 8000, 'Casquette ajustable avec logo couronne brodé.', false);
