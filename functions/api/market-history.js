const MAX_HISTORY_POINTS = 90;
const MAX_TEXT_LENGTH = 160;

function json(data, init = {}) {
  const headers = new Headers(init.headers || {});
  headers.set("Content-Type", "application/json; charset=utf-8");
  headers.set("Cache-Control", "no-store");

  return new Response(JSON.stringify(data), {
    ...init,
    headers,
  });
}

function cleanText(value, maximumLength = MAX_TEXT_LENGTH) {
  return String(value || "").trim().slice(0, maximumLength);
}

function todayUtc() {
  return new Date().toISOString().slice(0, 10);
}

function getDatabase(context) {
  return context.env.MARKET_DB || null;
}

async function readHistory(database, cardId, variantKey) {
  const result = await database
    .prepare(
      `SELECT snapshot_date AS date, market_price AS value
       FROM market_snapshots
       WHERE card_id = ?1 AND variant_key = ?2
       ORDER BY snapshot_date DESC
       LIMIT ?3`
    )
    .bind(cardId, variantKey, MAX_HISTORY_POINTS)
    .all();

  return (result.results || [])
    .map((point) => ({
      date: point.date,
      value: Number(point.value),
    }))
    .filter(
      (point) => point.date && Number.isFinite(point.value) && point.value > 0
    )
    .reverse();
}

export async function onRequestGet(context) {
  const database = getDatabase(context);
  if (!database) {
    return json(
      { error: "MARKET_DB is not connected" },
      { status: 503 }
    );
  }

  const url = new URL(context.request.url);
  const cardId = cleanText(url.searchParams.get("cardId"));
  const variantKey = cleanText(url.searchParams.get("variantKey"), 80);

  if (!cardId || !variantKey) {
    return json(
      { error: "cardId and variantKey are required" },
      { status: 400 }
    );
  }

  return json({
    cardId,
    variantKey,
    points: await readHistory(database, cardId, variantKey),
  });
}

export async function onRequestPost(context) {
  const database = getDatabase(context);
  if (!database) {
    return json(
      { error: "MARKET_DB is not connected" },
      { status: 503 }
    );
  }

  let body;
  try {
    body = await context.request.json();
  } catch {
    return json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const cardId = cleanText(body.cardId);
  const variantKey = cleanText(body.variantKey, 80);
  const marketPrice = Number(body.marketPrice);

  if (
    !cardId ||
    !variantKey ||
    !Number.isFinite(marketPrice) ||
    marketPrice <= 0 ||
    marketPrice > 1000000
  ) {
    return json(
      { error: "Valid cardId, variantKey, and marketPrice are required" },
      { status: 400 }
    );
  }

  await database
    .prepare(
      `INSERT INTO market_snapshots (
         card_id,
         variant_key,
         snapshot_date,
         market_price,
         card_name,
         set_name,
         card_number,
         finish_label,
         source_updated_at,
         observed_at
       ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, CURRENT_TIMESTAMP)
       ON CONFLICT(card_id, variant_key, snapshot_date)
       DO UPDATE SET
         market_price = excluded.market_price,
         card_name = excluded.card_name,
         set_name = excluded.set_name,
         card_number = excluded.card_number,
         finish_label = excluded.finish_label,
         source_updated_at = excluded.source_updated_at,
         observed_at = CURRENT_TIMESTAMP`
    )
    .bind(
      cardId,
      variantKey,
      todayUtc(),
      marketPrice,
      cleanText(body.cardName),
      cleanText(body.setName),
      cleanText(body.cardNumber, 40),
      cleanText(body.finishLabel, 80),
      cleanText(body.sourceUpdatedAt, 40) || null
    )
    .run();

  return json({
    cardId,
    variantKey,
    recorded: true,
    points: await readHistory(database, cardId, variantKey),
  });
}
