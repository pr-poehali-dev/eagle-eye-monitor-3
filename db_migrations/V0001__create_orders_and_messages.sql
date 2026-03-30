
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  age INTEGER,
  weight NUMERIC(5,1),
  height NUMERIC(5,1),
  gender TEXT,
  activity_level TEXT,
  goal TEXT,
  health_notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending_payment',
  payment_confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id),
  sender TEXT NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_messages_order_id ON messages(order_id);
CREATE INDEX idx_orders_status ON orders(status);
