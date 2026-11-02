-- ============================================================
-- Waffle Castle — PostgreSQL Database Schema
-- Database: waffle_db
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Function to handle updated_at timestamps
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ─── 1. Products ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.products (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  category    TEXT NOT NULL,
  image_url   TEXT NOT NULL DEFAULT '/images/waffle-main.png',
  label       TEXT NOT NULL DEFAULT '',
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS set_products_updated_at ON public.products;
CREATE TRIGGER set_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();

-- ─── 2. Blog Posts ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         TEXT UNIQUE NOT NULL,
  title        TEXT NOT NULL,
  category     TEXT NOT NULL DEFAULT 'General',
  date         TEXT NOT NULL,
  read_time    TEXT NOT NULL DEFAULT '5 min read',
  author       TEXT NOT NULL,
  author_role  TEXT NOT NULL DEFAULT '',
  image_url    TEXT NOT NULL DEFAULT '/images/waffle-main.png',
  excerpt      TEXT NOT NULL DEFAULT '',
  content      TEXT NOT NULL DEFAULT '',
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS set_blog_posts_updated_at ON public.blog_posts;
CREATE TRIGGER set_blog_posts_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();

-- ─── 3. Stores (Castle Locator) ──────────────────────────────
CREATE TABLE IF NOT EXISTS public.stores (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  city            TEXT NOT NULL,
  address         TEXT NOT NULL,
  link            TEXT NOT NULL DEFAULT '',
  directions_link TEXT NOT NULL DEFAULT '',
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS set_stores_updated_at ON public.stores;
CREATE TRIGGER set_stores_updated_at
  BEFORE UPDATE ON public.stores
  FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();

-- ─── 4. Past Events ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.past_events (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title          TEXT NOT NULL,
  spotlight_text TEXT NOT NULL DEFAULT '',
  description    TEXT NOT NULL DEFAULT '',
  image_url      TEXT NOT NULL DEFAULT '/images/waffle-main.png',
  tags           TEXT[] NOT NULL DEFAULT '{}',
  is_active      BOOLEAN NOT NULL DEFAULT true,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS set_past_events_updated_at ON public.past_events;
CREATE TRIGGER set_past_events_updated_at
  BEFORE UPDATE ON public.past_events
  FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();

-- ─── 5. Contact Leads ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.contact_leads (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  phone      TEXT NOT NULL DEFAULT '',
  message    TEXT NOT NULL DEFAULT '',
  status     TEXT NOT NULL DEFAULT 'New',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── 6. Franchise Leads ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.franchise_leads (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name     TEXT NOT NULL,
  last_name      TEXT NOT NULL,
  email          TEXT NOT NULL,
  contact_no     TEXT NOT NULL,
  city           TEXT NOT NULL,
  state          TEXT NOT NULL,
  plan_to_start  TEXT NOT NULL DEFAULT '',
  status         TEXT NOT NULL DEFAULT 'New',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── 7. Event Bookings ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.event_bookings (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  phone       TEXT NOT NULL,
  email       TEXT NOT NULL,
  event_type  TEXT NOT NULL DEFAULT 'Table Reservation',
  message     TEXT NOT NULL DEFAULT '',
  status      TEXT NOT NULL DEFAULT 'Pending',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── 8. Admin Users ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.admin_users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name          TEXT NOT NULL DEFAULT 'Admin',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
