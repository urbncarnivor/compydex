const COOKIE_NAME = "compydex_access";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

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

function renderLoginPage(errorMessage = "") {
  const errorMarkup = errorMessage
    ? `<p class="error">${errorMessage}</p>`
    : "";

  return new Response(
    `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta
    name="viewport"
    content="width=device-width, initial-scale=1"
  >
  <title>CompyDex Access</title>

  <style>
    * {
      box-sizing: border-box;
    }

    body {
      min-height: 100vh;
      margin: 0;
      display: grid;
      place-items: center;
      padding: 20px;
      color: white;
      font-family:
        Arial,
        Helvetica,
        sans-serif;
      background:
        radial-gradient(
          circle at top,
          #231942,
          #0f172a 55%
        );
    }

    .login-card {
      width: min(100%, 390px);
      padding: 30px;
      background: rgba(31, 41, 55, 0.96);
      border: 1px solid rgba(139, 92, 246, 0.4);
      border-radius: 20px;
      box-shadow: 0 22px 60px rgba(0, 0, 0, 0.4);
    }

    h1 {
      margin: 0;
      text-align: center;
      font-size: 38px;
      color: #a78bfa;
    }

    .tagline {
      margin: 8px 0 26px;
      text-align: center;
      color: #c4b5fd;
      letter-spacing: 0.08em;
    }

    label {
      display: block;
      margin-bottom: 8px;
      font-weight: 700;
    }

    input {
      width: 100%;
      min-height: 52px;
      padding: 12px 14px;
      color: white;
      font-size: 18px;
      background: #111827;
      border: 1px solid #475569;
      border-radius: 12px;
      outline: none;
    }

    input:focus {
      border-color: #8b5cf6;
      box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.2);
    }

    button {
      width: 100%;
      min-height: 52px;
      margin-top: 14px;
      color: white;
      font-size: 16px;
      font-weight: 800;
      cursor: pointer;
      background:
        linear-gradient(
          135deg,
          #7c3aed,
          #8b5cf6
        );
      border: 0;
      border-radius: 12px;
    }

    .error {
      margin: 14px 0 0;
      padding: 10px 12px;
      color: #fecaca;
      text-align: center;
      background: rgba(220, 38, 38, 0.15);
      border: 1px solid rgba(248, 113, 113, 0.35);
      border-radius: 10px;
    }

    .prototype-note {
      margin: 20px 0 0;
      color: #94a3b8;
      text-align: center;
      font-size: 13px;
    }
  </style>
</head>

<body>
  <main class="login-card">
    <h1>CompyDex</h1>

    <p class="tagline">
      PRIVATE PROTOTYPE
    </p>

    <form method="POST" action="/login">
      <label for="passcode">
        Enter passcode
      </label>

      <input
        id="passcode"
        name="passcode"
        type="password"
        autocomplete="current-password"
        autofocus
        required
      >

      <button type="submit">
        Unlock CompyDex
      </button>

      ${errorMarkup}
    </form>

    <p class="prototype-note">
      Access is limited to approved testers.
    </p>
  </main>
</body>
</html>`,
    {
      status: errorMessage ? 401 : 200,
      headers: {
        "Content-Type": "text/html; charset=UTF-8",
        "Cache-Control": "no-store"
      }
    }
  );
}

export async function onRequestGet() {
  return renderLoginPage();
}

export async function onRequestPost(context) {
  const configuredPasscode =
    context.env.COMPYDEX_PASSCODE;

  if (!configuredPasscode) {
    return new Response(
      "CompyDex passcode is not configured.",
      { status: 500 }
    );
  }

  const formData =
    await context.request.formData();

  const suppliedPasscode =
    String(formData.get("passcode") || "");

  if (suppliedPasscode !== configuredPasscode) {
    return renderLoginPage(
      "Incorrect passcode. Please try again."
    );
  }

  const accessToken =
    await createAccessToken(configuredPasscode);

  return new Response(null, {
    status: 302,
    headers: {
      Location: "/",
      "Set-Cookie":
        `${COOKIE_NAME}=${accessToken}; ` +
        `Path=/; ` +
        `Max-Age=${COOKIE_MAX_AGE}; ` +
        `HttpOnly; ` +
        `Secure; ` +
        `SameSite=Lax`
    }
  });
}
