create type public.ptown_role as enum ('owner', 'booking_manager', 'viewer');

create table public.staff_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  role public.ptown_role not null default 'viewer',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.operations_records (
  id uuid primary key default gen_random_uuid(),
  collection text not null check (collection in ('artist_updates','bookings','outreach_drafts','economics','offers','deal_rooms','show_days','settlements','post_show_reviews','incidents','due_items','audit_log')),
  record_key text not null,
  payload jsonb not null default '{}'::jsonb,
  version bigint not null default 1,
  created_by uuid not null references auth.users(id),
  updated_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(collection, record_key)
);

create table public.operations_audit (
  id bigint generated always as identity primary key,
  record_id uuid references public.operations_records(id) on delete set null,
  action text not null,
  before_value jsonb,
  after_value jsonb,
  actor_id uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

alter table public.staff_profiles enable row level security;
alter table public.operations_records enable row level security;
alter table public.operations_audit enable row level security;

create function public.current_ptown_role() returns public.ptown_role language sql stable security definer set search_path=public as $$
  select role from public.staff_profiles where user_id=auth.uid() and active=true
$$;

create policy "staff read own profile" on public.staff_profiles for select using (user_id=auth.uid() or public.current_ptown_role()='owner');
create policy "owners manage staff" on public.staff_profiles for all using (public.current_ptown_role()='owner') with check (public.current_ptown_role()='owner');
create policy "active staff read operations" on public.operations_records for select using (public.current_ptown_role() is not null);
create policy "managers write operations" on public.operations_records for insert with check (public.current_ptown_role() in ('owner','booking_manager') and created_by=auth.uid() and updated_by=auth.uid());
create policy "managers update operations" on public.operations_records for update using (public.current_ptown_role() in ('owner','booking_manager')) with check (public.current_ptown_role() in ('owner','booking_manager') and updated_by=auth.uid());
create policy "owners delete operations" on public.operations_records for delete using (public.current_ptown_role()='owner');
create policy "active staff read audit" on public.operations_audit for select using (public.current_ptown_role() is not null);

revoke insert, update, delete on public.operations_audit from authenticated;

create function public.write_operations_record(p_collection text,p_record_key text,p_payload jsonb,p_expected_version bigint default 0)
returns public.operations_records language plpgsql security definer set search_path=public as $$
declare current_record public.operations_records; result public.operations_records;
begin
  if public.current_ptown_role() not in ('owner','booking_manager') then raise exception 'not authorized'; end if;
  select * into current_record from public.operations_records where collection=p_collection and record_key=p_record_key for update;
  if found and current_record.version<>p_expected_version then raise exception 'version conflict'; end if;
  insert into public.operations_records(collection,record_key,payload,version,created_by,updated_by)
  values(p_collection,p_record_key,p_payload,1,auth.uid(),auth.uid())
  on conflict(collection,record_key) do update set payload=excluded.payload,version=operations_records.version+1,updated_by=auth.uid(),updated_at=now()
  returning * into result;
  insert into public.operations_audit(record_id,action,before_value,after_value,actor_id) values(result.id,case when current_record.id is null then 'create' else 'update' end,current_record.payload,result.payload,auth.uid());
  return result;
end $$;

revoke all on function public.write_operations_record(text,text,jsonb,bigint) from public;
grant execute on function public.write_operations_record(text,text,jsonb,bigint) to authenticated;
