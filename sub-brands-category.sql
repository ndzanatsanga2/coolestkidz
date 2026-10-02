-- Cible Homme / Femme / Mixte pour les sous-marques
alter table sub_brands
  add column if not exists category text default 'Unisexe';

-- Valeurs attendues: Homme | Femme | Unisexe
