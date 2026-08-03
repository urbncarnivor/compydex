export async function onRequestGet(context) {
  const requestUrl = new URL(context.request.url);
  const query = requestUrl.searchParams.get("q")?.trim();

  if (!query) {
    return Response.json(
      { error: "Missing q parameter" },
      { status: 400 }
    );
  }

 const upstreamUrl =
  "https://api.pokemontcg.io/v2/cards" +
  `?q=${encodeURIComponent(query)}` +
  "&pageSize=250" +
  "&orderBy=-set.releaseDate"; 

  let response;
  let lastError;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      response = await fetch(upstreamUrl, {
        headers: {
          Accept: "application/json",
        },
      });

      if (response.ok || response.status < 500) {
        break;
      }
    } catch (error) {
      lastError = error;
    }

    if (attempt < 3) {
      await new Promise((resolve) =>
        setTimeout(resolve, attempt * 750)
      );
    }
  }

  if (!response) {
    return Response.json(
      {
        error:
          lastError?.message ||
          "Pokémon API temporarily unavailable",
      },
      { status: 502 }
    );
  }

  const body = await response.text();

  return new Response(body, {
    status: response.status,
    headers: {
      "Content-Type":
        response.headers.get("Content-Type") ||
        "application/json",
      "Cache-Control":
        response.ok
          ? "public, max-age=300"
          : "no-store",
    },
  });
}
