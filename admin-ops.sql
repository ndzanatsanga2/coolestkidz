-- Admin & opérations
alter table products add column if not exists sort_order int default 0;

-- Optionnel: initialiser sort_order = id pour les existants
update products set sort_order = id where sort_order is null or sort_order = 0;
