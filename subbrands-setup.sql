-- Table sous-marques CoolestKidz
create table if not exists sub_brands (
  id bigint generated always as identity primary key,
  name text not null,
  description text default '',
  logo text default '',
  website text default '',
  featured boolean default false,
  created_at timestamptz default now()
);

alter table sub_brands enable row level security;

create policy "Lecture publique sous-marques"
  on sub_brands for select using (true);

create policy "Insert sous-marques"
  on sub_brands for insert with check (true);

create policy "Update sous-marques"
  on sub_brands for update using (true);

create policy "Delete sous-marques"
  on sub_brands for delete using (true);
