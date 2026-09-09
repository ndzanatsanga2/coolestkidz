-- =============================================
-- CoolestKidz — Bucket Storage pour les images
-- =============================================
-- À exécuter dans Supabase → SQL Editor
-- =============================================

-- Créer le bucket public "products"
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'products',
  'products',
  true,
  5242880,  -- 5 Mo max
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;

-- Politique : tout le monde peut lire les images
create policy "Images publiques"
on storage.objects for select
using (bucket_id = 'products');

-- Politique : upload autorisé (MVP)
create policy "Upload images (MVP)"
on storage.objects for insert
with check (bucket_id = 'products');

-- Politique : suppression autorisée (MVP)
create policy "Suppression images (MVP)"
on storage.objects for delete
using (bucket_id = 'products');
