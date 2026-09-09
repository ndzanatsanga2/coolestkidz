-- Lier les articles aux sous-marques
alter table products
  add column if not exists sub_brand_id bigint references sub_brands(id) on delete set null;

create index if not exists products_sub_brand_id_idx on products(sub_brand_id);
