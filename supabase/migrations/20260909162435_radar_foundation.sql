-- PHASE 1. Additive migration: touches only radar_* objects. Money = integer RUB.
begin;

create table public.radar_owners (
  owner_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.radar_listings (
  id uuid primary key default gen_random_uuid(),
  source text not null check (source in ('avito', 'farpost')),
  source_listing_id text not null check (source_listing_id ~ '^[A-Za-z0-9_-]{1,128}$'),
  url text not null check (length(url) <= 2048 and url ~ '^https://(www\.|m\.)?(avito|farpost)\.ru/[^?#]*$'),
  title text not null check (length(title) between 1 and 300),
  description text not null default '' check (length(description) <= 8000),
  category text not null check (length(category) <= 80), subcategory text,
  brand text, model text, family text, normalized_product_key text,
  normalized_attributes jsonb not null default '{}' check (jsonb_typeof(normalized_attributes) = 'object' and octet_length(normalized_attributes::text) <= 8192),
  normalization_method text not null default 'UNRESOLVED', normalization_version text not null default 'foundation-1',
  price_rub bigint not null check (price_rub between 0 and 1000000000), currency text not null default 'RUB' check (currency = 'RUB'),
  condition text not null default 'UNKNOWN', location text not null default '', region text not null default '',
  seller_kind text not null default 'UNKNOWN' check (seller_kind in ('PRIVATE', 'BUSINESS', 'UNKNOWN')),
  published_at timestamptz, first_seen_at timestamptz not null default now(), last_seen_at timestamptz not null default now(),
  listing_status text not null default 'UNKNOWN' check (listing_status in ('ACTIVE', 'MISSING', 'REMOVED', 'SOLD_UNKNOWN', 'UNKNOWN')),
  image_urls jsonb not null default '[]' check (jsonb_typeof(image_urls) = 'array' and jsonb_array_length(image_urls) <= 12),
  -- Only source-adapter allowlisted public diagnostics. No wholesale upstream payloads.
  raw_data jsonb not null default '{}' check (jsonb_typeof(raw_data) = 'object' and octet_length(raw_data::text) <= 8192),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (source, source_listing_id), check (last_seen_at >= first_seen_at),
  check ((source = 'avito' and url ~ '^https://(www\.|m\.)?avito\.ru/') or (source = 'farpost' and url ~ '^https://(www\.)?farpost\.ru/'))
);
create index radar_listings_feed_idx on public.radar_listings (first_seen_at desc, id desc);
create index radar_listings_market_idx on public.radar_listings (normalized_product_key, region, last_seen_at desc) where listing_status = 'ACTIVE';
create index radar_listings_retention_idx on public.radar_listings (last_seen_at);
create index radar_listings_category_idx on public.radar_listings (category, region, price_rub) where listing_status = 'ACTIVE';

create table public.radar_listing_price_history (
  id uuid primary key default gen_random_uuid(), listing_id uuid not null references public.radar_listings(id) on delete cascade,
  price_rub bigint not null check (price_rub between 0 and 1000000000), observed_at timestamptz not null,
  unique (listing_id, observed_at)
);

-- Append-only market snapshots; latest per product/matching/region is a query, not a destructive overwrite.
create table public.radar_market_stats (
  id uuid primary key default gen_random_uuid(), normalized_product_key text not null,
  region text, matching_level text not null check (matching_level in ('EXACT', 'CLOSE', 'FAMILY', 'CATEGORY')),
  sample_size integer not null check (sample_size > 0), confidence text not null check (confidence in ('LOW', 'MEDIUM', 'HIGH')),
  median_price_rub bigint not null, p25_price_rub bigint not null, p10_price_rub bigint not null,
  min_price_rub bigint not null check (min_price_rub >= 0), max_price_rub bigint not null check (max_price_rub <= 1000000000),
  recent_median_rub bigint, local_median_rub bigint, national_median_rub bigint,
  calculation_version text not null, calculated_at timestamptz not null default now(),
  unique nulls not distinct (normalized_product_key, matching_level, region, calculation_version, calculated_at),
  check (min_price_rub <= p10_price_rub and p10_price_rub <= p25_price_rub and p25_price_rub <= median_price_rub and median_price_rub <= max_price_rub)
);
create index radar_market_history_idx on public.radar_market_stats (normalized_product_key, matching_level, region, calculated_at desc);

create table public.radar_deals (
  id uuid primary key default gen_random_uuid(), listing_id uuid not null references public.radar_listings(id) on delete cascade,
  market_snapshot_id uuid references public.radar_market_stats(id) on delete set null,
  classification text not null default 'NOT_ANALYZED' check (classification in ('NOT_ANALYZED', 'NORMAL', 'DEAL', 'HOT', 'ULTRA', 'SUSPICIOUS')),
  market_median_rub bigint, market_p25_rub bigint, market_p10_rub bigint, price_deviation_percent numeric(9,3),
  estimated_resale_min_rub bigint, estimated_resale_max_rub bigint, estimated_profit_rub bigint,
  market_score integer check (market_score between 0 and 100), profit_score integer check (profit_score between 0 and 100),
  liquidity_score integer check (liquidity_score between 0 and 100), personal_score integer check (personal_score between 0 and 100),
  risk_score integer check (risk_score between 0 and 100), final_score integer check (final_score between 0 and 100),
  risk_reasons jsonb not null default '[]' check (jsonb_typeof(risk_reasons) = 'array'),
  analysis_version text not null, analyzed_at timestamptz, created_at timestamptz not null default now(),
  unique (listing_id, analysis_version),
  check (estimated_resale_min_rub <= estimated_resale_max_rub),
  check ((classification = 'NOT_ANALYZED' and analyzed_at is null and final_score is null and risk_score is null)
    or (classification <> 'NOT_ANALYZED' and analyzed_at is not null and final_score is not null and risk_score is not null))
);
create index radar_deals_feed_idx on public.radar_deals (classification, analyzed_at desc);
create index radar_deals_snapshot_idx on public.radar_deals (market_snapshot_id);

create table public.radar_feedback (
  id uuid primary key default gen_random_uuid(), listing_id uuid not null references public.radar_listings(id) on delete cascade,
  owner_id uuid not null references public.radar_owners(owner_id) on delete cascade,
  action text not null check (action in ('SAVE', 'NOT_INTERESTED', 'SUSPICIOUS', 'PURCHASED')),
  channel text not null check (channel in ('WEB', 'TELEGRAM')), operation_id uuid not null,
  created_at timestamptz not null default now(), unique (owner_id, operation_id)
);
create index radar_feedback_listing_idx on public.radar_feedback (listing_id, created_at desc);

create table public.radar_runtime_status (
  id uuid primary key default gen_random_uuid(), source text not null check (source in ('avito', 'farpost')),
  status text not null check (status in ('NOT_CONFIGURED', 'NOT_ACTIVE', 'ONLINE', 'ERROR', 'BLOCKED')),
  last_success_at timestamptz, last_failure_at timestamptz, next_scan_at timestamptz,
  processed integer not null default 0 check (processed >= 0), new_listings integer not null default 0 check (new_listings >= 0),
  duration_ms integer check (duration_ms >= 0), worker_version text not null, error_code text check (error_code ~ '^[A-Z_]{1,80}$'),
  created_at timestamptz not null default now()
);
create index radar_runtime_source_idx on public.radar_runtime_status (source, created_at desc);

create table public.radar_notifications (
  id uuid primary key default gen_random_uuid(), listing_id uuid not null references public.radar_listings(id) on delete cascade,
  classification text not null check (classification in ('HOT', 'ULTRA')),
  event text not null check (event = 'CLASSIFICATION_REACHED'),
  status text not null default 'PENDING' check (status in ('PENDING', 'SENDING', 'SENT', 'FAILED', 'UNKNOWN_DELIVERY', 'CANCELLED')),
  attempt_count integer not null default 0 check (attempt_count >= 0), next_attempt_at timestamptz, locked_until timestamptz,
  telegram_message_id bigint, last_error_code text check (last_error_code ~ '^[A-Z_]{1,80}$'),
  created_at timestamptz not null default now(), sent_at timestamptz,
  unique (listing_id, classification, event)
);
create index radar_notifications_pending_idx on public.radar_notifications (next_attempt_at, created_at) where status in ('PENDING', 'FAILED');

-- A verified Supabase user is NOT automatically an owner. Enrollment is server/admin-only.
alter table public.radar_owners enable row level security;
alter table public.radar_owners force row level security;
revoke all on public.radar_owners from public, anon, authenticated;
grant select on public.radar_owners to authenticated;
grant select, insert, delete on public.radar_owners to service_role;
create policy radar_owner_self on public.radar_owners for select to authenticated using (owner_id = (select auth.uid()));

do $$
declare name text;
begin
  foreach name in array array['radar_listings', 'radar_listing_price_history', 'radar_market_stats', 'radar_deals', 'radar_feedback', 'radar_runtime_status', 'radar_notifications'] loop
    execute format('alter table public.%I enable row level security', name);
    execute format('alter table public.%I force row level security', name);
    execute format('revoke all on public.%I from public, anon, authenticated', name);
    execute format('grant select on public.%I to authenticated', name);
    execute format('grant select, insert, update, delete on public.%I to service_role', name);
    execute format('create policy radar_owner_read on public.%I for select to authenticated using (exists (select 1 from public.radar_owners where owner_id = (select auth.uid())))', name);
  end loop;
end $$;
grant insert on public.radar_feedback to authenticated;
create policy radar_owner_feedback on public.radar_feedback for insert to authenticated
  with check (owner_id = (select auth.uid()) and exists (select 1 from public.radar_owners where owner_id = (select auth.uid())));

-- Single transaction: lock an existing identity before comparing price. Out-of-order observations cannot roll back the current price.
create function public.radar_ingest_listing(item jsonb) returns uuid
language plpgsql security invoker set search_path = '' as $$
declare existing public.radar_listings%rowtype; listing_id uuid; observed timestamptz; amount bigint;
begin
  if octet_length(item::text) > 16384 then raise exception 'RADAR_PAYLOAD_LIMIT'; end if;
  observed := (item->>'observed_at')::timestamptz; amount := (item->>'price_rub')::bigint;
  if observed is null or observed > now() + interval '5 minutes' then raise exception 'RADAR_INVALID_TIMESTAMP'; end if;
  insert into public.radar_listings(source, source_listing_id, url, title, description, category, price_rub, region, location, first_seen_at, last_seen_at, published_at, condition, listing_status)
    values (item->>'source', item->>'source_listing_id', item->>'url', item->>'title', coalesce(item->>'description', ''), item->>'category', amount,
      coalesce(item->>'region', ''), coalesce(item->>'location', ''), observed, observed, (item->>'published_at')::timestamptz,
      coalesce(item->>'condition', 'UNKNOWN'), coalesce(item->>'listing_status', 'UNKNOWN'))
    on conflict (source, source_listing_id) do nothing returning id into listing_id;
  if listing_id is not null then
    insert into public.radar_listing_price_history(listing_id, price_rub, observed_at) values (listing_id, amount, observed);
    return listing_id;
  end if;
  select * into strict existing from public.radar_listings where source = item->>'source' and source_listing_id = item->>'source_listing_id' for update;
  if observed > existing.last_seen_at then
    if amount <> existing.price_rub then
      insert into public.radar_listing_price_history(listing_id, price_rub, observed_at) values(existing.id, amount, observed) on conflict do nothing;
    end if;
    update public.radar_listings set price_rub = amount, last_seen_at = observed, updated_at = now(),
      title = item->>'title', description = coalesce(item->>'description', ''),
      listing_status = coalesce(item->>'listing_status', 'UNKNOWN') where id = existing.id;
  end if;
  return existing.id;
end $$;
revoke all on function public.radar_ingest_listing(jsonb) from public, anon, authenticated;
grant execute on function public.radar_ingest_listing(jsonb) to service_role;

comment on table public.radar_market_stats is 'Append-only comparable used-market snapshots. MSRP is not a market baseline.';
comment on column public.radar_listings.listing_status is 'MISSING/REMOVED do not imply a sale.';
comment on table public.radar_notifications is 'Outbox foundation only. Telegram has no exactly-once send API; uncertain delivery requires reconciliation, not blind retries.';
commit;
