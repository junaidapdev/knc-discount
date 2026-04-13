-- ============================================================
-- KNC Discount — Full Supabase Schema
-- Run this file in the Supabase SQL Editor (or via psql).
-- ============================================================

-- ============================================================
-- 1. SUPPLIERS
-- Master list of suppliers with their BDA rebate rules.
-- rebate_rules is a flexible JSONB column so each supplier
-- can have a unique rebate structure.
-- ============================================================
CREATE TABLE suppliers (
    id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    name          text        NOT NULL UNIQUE,
    bda_category  text        NOT NULL,
    rebate_rules  jsonb       NOT NULL,
    target_amount numeric,
    created_at    timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- 2. PURCHASE ORDERS
-- Every purchase logged by the Accounts team.
-- ============================================================
CREATE TABLE purchase_orders (
    id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id     uuid        NOT NULL REFERENCES suppliers(id),
    order_date      date        NOT NULL,
    purchase_amount numeric     NOT NULL,
    bda_category    text        NOT NULL,
    notes           text,
    created_by      uuid        REFERENCES auth.users(id),
    created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_purchase_orders_supplier_id ON purchase_orders(supplier_id);
CREATE INDEX idx_purchase_orders_order_date  ON purchase_orders(order_date);

-- ============================================================
-- 3. CREDIT NOTES
-- Tracks expected vs received rebate credit notes per period.
-- discrepancy_flag is auto-set by a trigger when amounts differ.
-- ============================================================
CREATE TABLE credit_notes (
    id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id      uuid        NOT NULL REFERENCES suppliers(id),
    period_start     date        NOT NULL,
    period_end       date        NOT NULL,
    expected_amount  numeric     NOT NULL,
    received_amount  numeric     NOT NULL DEFAULT 0,
    status           text        NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending', 'received', 'disputed')),
    discrepancy_flag boolean     NOT NULL DEFAULT false,
    verified_by      uuid        REFERENCES auth.users(id),
    verified_at      timestamptz,
    created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_credit_notes_supplier_id ON credit_notes(supplier_id);
CREATE INDEX idx_credit_notes_status      ON credit_notes(status);

-- ============================================================
-- 4. POINT LEDGER
-- Loyalty / incentive points earned from suppliers.
-- ============================================================
CREATE TABLE point_ledger (
    id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id      uuid        REFERENCES suppliers(id),
    item_description text        NOT NULL,
    points_earned    integer     NOT NULL,
    redeemed         boolean     NOT NULL DEFAULT false,
    redeemed_for     text,
    created_at       timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- 5. USER PROFILES
-- Extends Supabase auth.users with app-specific role info.
-- ============================================================
CREATE TABLE user_profiles (
    id         uuid        PRIMARY KEY REFERENCES auth.users(id),
    full_name  text        NOT NULL,
    role       text        NOT NULL
               CHECK (role IN ('accounts', 'purchase_manager')),
    created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- 6. AUTO-SET discrepancy_flag ON credit_notes
-- Fires on INSERT or UPDATE: flags rows where the received
-- amount does not match the expected amount.
-- ============================================================
CREATE OR REPLACE FUNCTION set_discrepancy_flag()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.discrepancy_flag := (NEW.received_amount IS DISTINCT FROM NEW.expected_amount);
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_credit_notes_discrepancy
    BEFORE INSERT OR UPDATE ON credit_notes
    FOR EACH ROW
    EXECUTE FUNCTION set_discrepancy_flag();

-- ============================================================
-- 7. calculate_period_bda()
-- Given a supplier and date range, returns:
--   total_purchases  — sum of purchase_amount in the window
--   rebate_percentage — looked up from suppliers.rebate_rules
--                       using the purchase_order's bda_category
--   expected_rebate  — total_purchases * rebate_percentage / 100
--   target_met       — whether total_purchases >= target_amount
-- ============================================================
CREATE OR REPLACE FUNCTION calculate_period_bda(
    p_supplier_id  uuid,
    p_period_start date,
    p_period_end   date
)
RETURNS TABLE (
    total_purchases   numeric,
    expected_rebate   numeric,
    rebate_percentage numeric,
    target_met        boolean
)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    v_total           numeric;
    v_rules           jsonb;
    v_target          numeric;
    v_category        text;
    v_rebate_key      text;
    v_pct             numeric;
BEGIN
    -- Sum purchases in the date range
    SELECT COALESCE(SUM(po.purchase_amount), 0)
      INTO v_total
      FROM purchase_orders po
     WHERE po.supplier_id = p_supplier_id
       AND po.order_date BETWEEN p_period_start AND p_period_end;

    -- Fetch supplier rules and target
    SELECT s.rebate_rules, s.target_amount, s.bda_category
      INTO v_rules, v_target, v_category
      FROM suppliers s
     WHERE s.id = p_supplier_id;

    -- Derive the rebate key from the supplier's bda_category
    -- e.g. 'monthly' → 'monthly_rebate', 'quarterly' → 'quarterly_rebate'
    v_rebate_key := v_category || '_rebate';
    v_pct := COALESCE((v_rules ->> v_rebate_key)::numeric, 0);

    RETURN QUERY
    SELECT
        v_total,
        ROUND(v_total * v_pct / 100, 2),
        v_pct,
        (v_target IS NOT NULL AND v_total >= v_target);
END;
$$;

-- ============================================================
-- 8. ROW-LEVEL SECURITY
-- accounts  → full CRUD on operational tables, read on suppliers
-- purchase_manager → read-only everywhere
-- ============================================================

-- Helper: returns the current user's role from user_profiles.
CREATE OR REPLACE FUNCTION current_user_role()
RETURNS text
LANGUAGE sql
STABLE
AS $$
    SELECT role FROM user_profiles WHERE id = auth.uid();
$$;

-- ---------- suppliers ----------
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "suppliers_select"
    ON suppliers FOR SELECT
    USING (current_user_role() IN ('accounts', 'purchase_manager'));

-- ---------- purchase_orders ----------
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "purchase_orders_select"
    ON purchase_orders FOR SELECT
    USING (current_user_role() IN ('accounts', 'purchase_manager'));

CREATE POLICY "purchase_orders_insert"
    ON purchase_orders FOR INSERT
    WITH CHECK (current_user_role() = 'accounts');

CREATE POLICY "purchase_orders_update"
    ON purchase_orders FOR UPDATE
    USING  (current_user_role() = 'accounts')
    WITH CHECK (current_user_role() = 'accounts');

CREATE POLICY "purchase_orders_delete"
    ON purchase_orders FOR DELETE
    USING (current_user_role() = 'accounts');

-- ---------- credit_notes ----------
ALTER TABLE credit_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "credit_notes_select"
    ON credit_notes FOR SELECT
    USING (current_user_role() IN ('accounts', 'purchase_manager'));

CREATE POLICY "credit_notes_insert"
    ON credit_notes FOR INSERT
    WITH CHECK (current_user_role() = 'accounts');

CREATE POLICY "credit_notes_update"
    ON credit_notes FOR UPDATE
    USING  (current_user_role() = 'accounts')
    WITH CHECK (current_user_role() = 'accounts');

CREATE POLICY "credit_notes_delete"
    ON credit_notes FOR DELETE
    USING (current_user_role() = 'accounts');

-- ---------- point_ledger ----------
ALTER TABLE point_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY "point_ledger_select"
    ON point_ledger FOR SELECT
    USING (current_user_role() IN ('accounts', 'purchase_manager'));

CREATE POLICY "point_ledger_insert"
    ON point_ledger FOR INSERT
    WITH CHECK (current_user_role() = 'accounts');

CREATE POLICY "point_ledger_update"
    ON point_ledger FOR UPDATE
    USING  (current_user_role() = 'accounts')
    WITH CHECK (current_user_role() = 'accounts');

CREATE POLICY "point_ledger_delete"
    ON point_ledger FOR DELETE
    USING (current_user_role() = 'accounts');

-- ---------- user_profiles ----------
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_profiles_select_own"
    ON user_profiles FOR SELECT
    USING (id = auth.uid());

-- ============================================================
-- 9. SEED DATA — example suppliers
-- ============================================================
INSERT INTO suppliers (name, bda_category, rebate_rules, target_amount) VALUES
(
    'Tea Shop',
    'quarterly',
    '{"quarterly_rebate": 2, "rent_percent": 1.5}'::jsonb,
    NULL
),
(
    'Gandour',
    'monthly',
    '{"monthly_rebate": 1, "quarterly_rebate": 1.5}'::jsonb,
    NULL
),
(
    'Galaxy',
    'monthly',
    '{"monthly_target": 115000, "yearly_target": 150000, "monthly_rebate": 3, "yearly_combined": 3.25}'::jsonb,
    115000
);
