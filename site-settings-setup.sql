-- CoolestKidz — images vitrine (cartes Homme / Femme)
create table if not exists site_settings (
  key text primary key,
  value text default '',
  updated_at timestamptz default now()
);

alter table site_settings enable row level security;

drop policy if exists "Lecture settings" on site_settings;
drop policy if exists "Upsert settings" on site_settings;
drop policy if exists "Update settings" on site_settings;
drop policy if exists "Delete settings" on site_settings;

create policy "Lecture settings"
  on site_settings for select using (true);

create policy "Upsert settings"
  on site_settings for insert with check (true);

create policy "Update settings"
  on site_settings for update using (true);

create policy "Delete settings"
  on site_settings for delete using (true);

-- Valeurs par défaut (vides = fallback fichiers locaux)
insert into site_settings (key, value) values
  ('cat_homme_image', ''),
  ('cat_femme_image', '')
on conflict (key) do nothing;
