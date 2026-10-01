-- Galerie / variantes d'un article (plusieurs photos + prix)
alter table products
  add column if not exists gallery jsonb default '[]'::jsonb;
