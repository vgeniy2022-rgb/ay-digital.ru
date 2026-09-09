-- Runs only in the isolated database created by scripts/radar/database-test.mjs.
insert into auth.users values ('00000000-0000-4000-8000-000000000001'), ('00000000-0000-4000-8000-000000000002');
insert into public.radar_owners(owner_id) values('00000000-0000-4000-8000-000000000001');
set role service_role;
select public.radar_ingest_listing('{"source":"avito","source_listing_id":"qa-1","url":"https://www.avito.ru/qa-1","title":"QA TEST ONLY","category":"laptops","price_rub":100000,"observed_at":"2026-01-01T00:00:00Z"}');
select public.radar_ingest_listing('{"source":"avito","source_listing_id":"qa-1","url":"https://www.avito.ru/qa-1","title":"QA TEST ONLY","category":"laptops","price_rub":100000,"observed_at":"2026-01-01T00:00:00Z"}');
select public.radar_ingest_listing('{"source":"avito","source_listing_id":"qa-1","url":"https://www.avito.ru/qa-1","title":"QA TEST ONLY","category":"laptops","price_rub":90000,"observed_at":"2026-01-02T00:00:00Z"}');
select public.radar_ingest_listing('{"source":"avito","source_listing_id":"qa-1","url":"https://www.avito.ru/qa-1","title":"QA TEST ONLY","category":"laptops","price_rub":110000,"observed_at":"2026-01-01T12:00:00Z"}');
do $$begin
  if (select count(*) from public.radar_listings) <> 1 then raise exception 'dedup failed'; end if;
  if (select price_rub from public.radar_listings) <> 90000 then raise exception 'stale observation changed current price'; end if;
  if (select count(*) from public.radar_listing_price_history) <> 2 then raise exception 'price history failed'; end if;
  if (select first_seen_at from public.radar_listings) <> '2026-01-01T00:00:00Z' then raise exception 'first seen overwritten'; end if;
end $$;
reset role;

set role anon;
do $$declare n text; rejected boolean; begin
  foreach n in array array['radar_owners','radar_listings','radar_listing_price_history','radar_market_stats','radar_deals','radar_feedback','radar_runtime_status','radar_notifications'] loop
    rejected := false;
    begin execute format('select count(*) from public.%I',n); exception when insufficient_privilege then rejected := true; end;
    if not rejected then raise exception 'anonymous read allowed: %', n; end if;
  end loop;
  rejected := false;
  begin perform public.radar_ingest_listing('{}'); exception when insufficient_privilege then rejected := true; end;
  if not rejected then raise exception 'anonymous RPC allowed'; end if;
end $$;
reset role;

set role authenticated;
set request.jwt.claim.sub = '00000000-0000-4000-8000-000000000002';
do $$declare rejected boolean := false; begin
  if (select count(*) from public.radar_listings) <> 0 then raise exception 'non-owner read allowed'; end if;
  if (select count(*) from public.radar_owners) <> 0 then raise exception 'owner registry leaked'; end if;
  begin insert into public.radar_owners(owner_id) values('00000000-0000-4000-8000-000000000002'); exception when insufficient_privilege then rejected := true; end;
  if not rejected then raise exception 'self-enrollment allowed'; end if;
end $$;
set request.jwt.claim.sub = '00000000-0000-4000-8000-000000000001';
do $$begin
  if (select count(*) from public.radar_listings) <> 1 then raise exception 'owner cannot read'; end if;
end $$;
insert into public.radar_feedback(listing_id,owner_id,action,channel,operation_id)
select id,'00000000-0000-4000-8000-000000000001','SAVE','WEB','11111111-1111-4111-8111-111111111111' from public.radar_listings;
do $$declare rejected boolean := false; begin
  begin insert into public.radar_feedback(listing_id,owner_id,action,channel,operation_id)
    select id,'00000000-0000-4000-8000-000000000001','SAVE','WEB','11111111-1111-4111-8111-111111111111' from public.radar_listings;
  exception when unique_violation then rejected := true; end;
  if not rejected then raise exception 'duplicate feedback accepted'; end if;
  rejected := false;
  begin insert into public.radar_feedback(listing_id,owner_id,action,channel,operation_id)
    select id,'00000000-0000-4000-8000-000000000002','SAVE','WEB','22222222-2222-4222-8222-222222222222' from public.radar_listings;
  exception when insufficient_privilege then rejected := true; end;
  if not rejected then raise exception 'owner spoofing accepted'; end if;
  rejected := false;
  begin update public.radar_listings set price_rub=1; exception when insufficient_privilege then rejected := true; end;
  if not rejected then raise exception 'read-only owner modified source data'; end if;
end $$;
reset role;

set role service_role;
insert into public.radar_notifications(listing_id,classification,event) select id,'HOT','CLASSIFICATION_REACHED' from public.radar_listings;
insert into public.radar_notifications(listing_id,classification,event) select id,'ULTRA','CLASSIFICATION_REACHED' from public.radar_listings;
do $$declare rejected boolean := false; begin
  begin insert into public.radar_notifications(listing_id,classification,event) select id,'HOT','CLASSIFICATION_REACHED' from public.radar_listings;
  exception when unique_violation then rejected := true; end;
  if not rejected then raise exception 'duplicate alert accepted'; end if;
  if (select count(*) from public.radar_notifications) <> 2 then raise exception 'HOT to ULTRA not supported'; end if;
end $$;
reset role;
do $$begin
  if (select count(*) from pg_class where relname like 'radar_%' and relkind = 'r' and relrowsecurity and relforcerowsecurity) <> 8 then raise exception 'RLS not enabled on all tables'; end if;
end $$;
