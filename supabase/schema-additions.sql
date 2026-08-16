-- 모여봄: 와이어프레임/기능명세서 반영을 위한 추가 스키마
-- Supabase 대시보드 > SQL Editor 에서 실행하세요.
-- 기존 zones / congestion / performances / booths / zone_events 테이블은 이미 존재한다고 가정합니다.

-- 1. zones 테이블: 위치 설명, 운영 시간/상태, 노출 여부
alter table zones add column if not exists location_desc text;
alter table zones add column if not exists operating_hours text;
alter table zones add column if not exists operating_status text; -- 예: '운영 중' / '운영 종료' / '점검 중'
alter table zones add column if not exists active boolean default true;

-- 2. booths 테이블: F&B 메뉴 가격
alter table booths add column if not exists price numeric check (price >= 0);

-- 3. congestion 테이블: 관리자 수동 상태 오버라이드
alter table congestion add column if not exists manual_status text; -- 'relaxed' | 'normal' | 'crowded' | 'blocked'
alter table congestion add column if not exists entry_blocked boolean default false;
alter table congestion add column if not exists manual_reason text;
alter table congestion add column if not exists manual_by text;
alter table congestion add column if not exists manual_at timestamptz;

-- 4. 상태 변경 이력 (명세 2.2.2 - 변경자/시각/사유/이전상태/이후상태, 수정·삭제 불가)
create table if not exists status_change_log (
  id bigint generated always as identity primary key,
  facility_id bigint not null references zones (id),
  facility_name text not null,
  previous_status text,
  new_status text not null,
  reason text not null,
  changed_by text,
  changed_at timestamptz not null default now()
);

alter table status_change_log enable row level security;

-- 관리자(인증된 사용자)만 읽기/쓰기 가능하도록 기본 정책 예시
-- (Postgres는 CREATE POLICY IF NOT EXISTS를 지원하지 않아 DROP 후 재생성)
drop policy if exists "authenticated read status_change_log" on status_change_log;
create policy "authenticated read status_change_log"
  on status_change_log for select
  to authenticated
  using (true);

drop policy if exists "authenticated insert status_change_log" on status_change_log;
create policy "authenticated insert status_change_log"
  on status_change_log for insert
  to authenticated
  with check (true);

-- 이력은 수정·삭제하지 않음 (update/delete 정책을 만들지 않음으로써 차단)

-- 5. zones.type 값 안내 (컬럼이 text라면 별도 마이그레이션 불필요)
--    'stage' | 'food' | 'event' | 'restroom'

-- 6. 관리자 계정
--    Supabase Authentication > Users 에서 이메일/비밀번호 계정을 직접 생성하세요.
--    (기존 AdminPage.jsx의 하드코딩 공용 비밀번호 로그인은 Supabase Auth 기반으로 교체되었습니다.)
