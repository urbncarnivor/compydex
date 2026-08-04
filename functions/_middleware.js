const COOKIE_NAME = "compydex_access";

function bytesToHex(bytes) {
  return Array.from(new Uint8Array(bytes))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function createAccessToken(passcode) {
  const encoder = new TextEncoder();

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(passcode),
    {
      name: "HMAC",
      hash: "SHA-256"
    },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode("compydex-prototype-access")
  );

  return bytesToHex(signature);
}

function getCookie(request, name) {
  const cookieHeader = request.headers.get("Cookie") || "";

  const cookie = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));

  return cookie
    ? decodeURIComponent(cookie.split("=").slice(1).join("="))
    : "";
}

export async function onRequest(context) {
  const url = new URL(context.request.url);

  if (url.pathname === "/login") {
    return context.next();
  }

  const passcode = context.env.COMPYDEX_PASSCODE;

  if (!passcode) {
    return new Response(
      "CompyDex passcode is not configured.",
      { status: 500 }
    );
  }

  const suppliedToken = getCookie(
    context.request,
    COOKIE_NAME
  );

  const expectedToken = await createAccessToken(passcode);

  if (suppliedToken !== expectedToken) {
    return Response.redirect(
      `${url.origin}/login`,
      302
    );
  }

  return context.next();
}
