-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_athletes ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendances ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE court_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

-- Helper function: check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- ============================================
-- PROFILES POLICIES
-- ============================================
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (is_admin());
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can update any profile" ON profiles FOR UPDATE USING (is_admin());
CREATE POLICY "Admins can insert profiles" ON profiles FOR INSERT WITH CHECK (is_admin() OR auth.uid() = id);

-- ============================================
-- GROUPS POLICIES
-- ============================================
CREATE POLICY "Authenticated users can view groups" ON groups FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can manage groups" ON groups FOR ALL USING (is_admin());

-- ============================================
-- GROUP ATHLETES POLICIES
-- ============================================
CREATE POLICY "Users can view own group membership" ON group_athletes FOR SELECT USING (athlete_id = auth.uid());
CREATE POLICY "Admins can manage group athletes" ON group_athletes FOR ALL USING (is_admin());

-- ============================================
-- MEDICAL CERTIFICATES POLICIES
-- ============================================
CREATE POLICY "Users can view own certificates" ON medical_certificates FOR SELECT USING (athlete_id = auth.uid());
CREATE POLICY "Users can upload own certificates" ON medical_certificates FOR INSERT WITH CHECK (athlete_id = auth.uid());
CREATE POLICY "Admins can manage all certificates" ON medical_certificates FOR ALL USING (is_admin());

-- ============================================
-- TRAINING SESSIONS POLICIES
-- ============================================
CREATE POLICY "Authenticated can view sessions" ON training_sessions FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can manage sessions" ON training_sessions FOR ALL USING (is_admin());

-- ============================================
-- ATTENDANCES POLICIES
-- ============================================
CREATE POLICY "Users can view own attendance" ON attendances FOR SELECT USING (athlete_id = auth.uid());
CREATE POLICY "Admins can manage attendance" ON attendances FOR ALL USING (is_admin());

-- ============================================
-- PAYMENTS POLICIES
-- ============================================
CREATE POLICY "Users can view own payments" ON payments FOR SELECT USING (athlete_id = auth.uid());
CREATE POLICY "Admins can manage payments" ON payments FOR ALL USING (is_admin());

-- ============================================
-- PAYMENT TRANSACTIONS POLICIES
-- ============================================
CREATE POLICY "Users can view own transactions" ON payment_transactions FOR SELECT USING (
  EXISTS (SELECT 1 FROM payments WHERE payments.id = payment_transactions.payment_id AND payments.athlete_id = auth.uid())
);
CREATE POLICY "Admins can manage transactions" ON payment_transactions FOR ALL USING (is_admin());

-- ============================================
-- COURT BOOKINGS POLICIES
-- ============================================
CREATE POLICY "Authenticated can view bookings" ON court_bookings FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Non-moroso users can create bookings" ON court_bookings FOR INSERT WITH CHECK (
  auth.uid() = booked_by AND NOT (SELECT is_moroso FROM profiles WHERE id = auth.uid())
);
CREATE POLICY "Users can cancel own bookings" ON court_bookings FOR UPDATE USING (booked_by = auth.uid());
CREATE POLICY "Admins can manage bookings" ON court_bookings FOR ALL USING (is_admin());

-- ============================================
-- PRODUCTS POLICIES (public read)
-- ============================================
CREATE POLICY "Anyone can view active products" ON products FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Admins can manage products" ON products FOR ALL USING (is_admin());

-- ============================================
-- ORDERS POLICIES
-- ============================================
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (athlete_id = auth.uid());
CREATE POLICY "Non-moroso users can create orders" ON orders FOR INSERT WITH CHECK (
  auth.uid() = athlete_id AND NOT (SELECT is_moroso FROM profiles WHERE id = auth.uid())
);
CREATE POLICY "Admins can manage orders" ON orders FOR ALL USING (is_admin());

-- ============================================
-- ORDER ITEMS POLICIES
-- ============================================
CREATE POLICY "Users can view own order items" ON order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.athlete_id = auth.uid())
);
CREATE POLICY "Users can insert own order items" ON order_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.athlete_id = auth.uid())
);
CREATE POLICY "Admins can manage order items" ON order_items FOR ALL USING (is_admin());

-- ============================================
-- PROMOTIONS POLICIES
-- ============================================
CREATE POLICY "Authenticated can view active promotions" ON promotions FOR SELECT USING (
  auth.uid() IS NOT NULL AND is_active = TRUE AND (valid_until IS NULL OR valid_until >= CURRENT_DATE)
);
CREATE POLICY "Admins can manage promotions" ON promotions FOR ALL USING (is_admin());

-- ============================================
-- ADMIN LOGS POLICIES
-- ============================================
CREATE POLICY "Admins can view logs" ON admin_logs FOR SELECT USING (is_admin());
CREATE POLICY "Admins can insert logs" ON admin_logs FOR INSERT WITH CHECK (is_admin());
