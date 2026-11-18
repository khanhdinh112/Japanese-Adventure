-- Japanese Adventure — lược đồ Supabase
-- Chạy toàn bộ file này trong Supabase Dashboard → SQL Editor (chạy lại nhiều lần vẫn an toàn).
--
-- Mô hình: một tài khoản phụ huynh (auth.users) quản lý nhiều hồ sơ bé (public.children).
-- Tiến trình của mỗi bé lưu trong cột `state` (jsonb). Row Level Security đảm bảo
-- phụ huynh chỉ đọc/ghi được hồ sơ của chính mình.

create table if not exists public.children (
  id          uuid primary key default gen_random_uuid(),
  parent_id   uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name        text not null default '' check (char_length(name) <= 40),
  look        jsonb,                         -- diện mạo nhân vật, để hiện ở màn chọn hồ sơ
  xp          integer not null default 0,
  stars       integer not null default 0,
  state       jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists children_parent_idx on public.children (parent_id);

alter table public.children enable row level security;

drop policy if exists "parents manage their own children" on public.children;
create policy "parents manage their own children"
  on public.children
  for all
  to authenticated
  using (parent_id = auth.uid())
  with check (parent_id = auth.uid());

-- Tự cập nhật updated_at
create or replace function public.touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists children_touch on public.children;
create trigger children_touch before update on public.children
  for each row execute function public.touch_updated_at();

-- Tối đa 6 hồ sơ bé cho mỗi tài khoản
create or replace function public.limit_children() returns trigger
language plpgsql as $$
begin
  if (select count(*) from public.children where parent_id = new.parent_id) >= 6 then
    raise exception 'Mỗi tài khoản chỉ có tối đa 6 hồ sơ bé' using errcode = 'check_violation';
  end if;
  return new;
end $$;

drop trigger if exists children_limit on public.children;
create trigger children_limit before insert on public.children
  for each row execute function public.limit_children();
