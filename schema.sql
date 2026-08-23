CREATE TABLE IF NOT EXISTS market_snapshots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  card_id TEXT NOT NULL,
  variant_key TEXT NOT NULL,
  snapshot_date TEXT NOT NULL,
  market_price REAL NOT NULL CHECK (market_price > 0),
  card_name TEXT NOT NULL DEFAULT '',
  set_name TEXT NOT NULL DEFAULT '',
  card_number TEXT NOT NULL DEFAULT '',
  finish_label TEXT NOT NULL DEFAULT '',
  source_updated_at TEXT,
  observed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (card_id, variant_key, snapshot_date)
);

CREATE INDEX IF NOT EXISTS idx_market_snapshots_lookup
ON market_snapshots (card_id, variant_key, snapshot_date DESC);
