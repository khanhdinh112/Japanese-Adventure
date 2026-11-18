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

-- =====================================================================
-- Quyền quản trị (admin): xem danh sách tài khoản và xoá tài khoản.
-- =====================================================================
-- Không dùng khoá service_role. Quyền admin nằm ở bảng `admins`, chỉ có thể sửa bằng SQL Editor
-- (ví dụ: insert into public.admins (user_id) select id from auth.users where email = 'ban@example.com';).
-- Các hàm bên dưới chạy với quyền chủ hàm (security definer) nhưng tự kiểm tra is_admin() trước khi làm gì.

create table if not exists public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;
-- Cố ý không tạo policy nào: trình duyệt không đọc/ghi trực tiếp được bảng này.
revoke all on public.admins from anon, authenticated;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

create or replace function public.admin_list_accounts()
returns table (id uuid, email text, created_at timestamptz, last_sign_in_at timestamptz, children_count bigint, is_admin boolean)
language plpgsql stable security definer set search_path = public, auth as $$
begin
  if not public.is_admin() then
    raise exception 'Chỉ quản trị viên mới được xem danh sách tài khoản' using errcode = '42501';
  end if;
  return query
    select u.id, u.email::text, u.created_at, u.last_sign_in_at,
           (select count(*) from public.children c where c.parent_id = u.id),
           exists (select 1 from public.admins a where a.user_id = u.id)
    from auth.users u
    order by u.created_at desc;
end $$;

create or replace function public.admin_delete_account(target uuid)
returns void
language plpgsql security definer set search_path = public, auth as $$
begin
  if not public.is_admin() then
    raise exception 'Chỉ quản trị viên mới được xoá tài khoản' using errcode = '42501';
  end if;
  if target = auth.uid() then
    raise exception 'Không thể tự xoá tài khoản của chính mình' using errcode = 'check_violation';
  end if;
  if exists (select 1 from public.admins where user_id = target) then
    raise exception 'Tài khoản này là quản trị viên. Hãy gỡ quyền admin trong SQL Editor trước khi xoá' using errcode = 'check_violation';
  end if;
  -- Hồ sơ bé (public.children) tự xoá theo nhờ "on delete cascade".
  delete from auth.users where id = target;
  if not found then
    raise exception 'Không tìm thấy tài khoản' using errcode = 'no_data_found';
  end if;
end $$;

revoke all on function public.is_admin() from public, anon;
revoke all on function public.admin_list_accounts() from public, anon;
revoke all on function public.admin_delete_account(uuid) from public, anon;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.admin_list_accounts() to authenticated;
grant execute on function public.admin_delete_account(uuid) to authenticated;
