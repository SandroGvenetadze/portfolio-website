const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET,OPTIONS",
};

export async function handler(event) {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: CORS_HEADERS, body: "" };
  }

  const API_KEY = process.env.OPENWEATHER_API_KEY;
  if (!API_KEY) {
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: "Missing OPENWEATHER_API_KEY" }),
    };
  }

  const url = new URL(event.rawUrl);
  const q = url.searchParams.get("q");
  const lat = url.searchParams.get("lat");
  const lon = url.searchParams.get("lon");
  const units = url.searchParams.get("units") || "metric";

  if (!q && !(lat && lon)) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: "Missing query" }),
    };
  }

  try {
    const api = q
      ? `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
          q
        )}&appid=${API_KEY}&units=${units}`
      : `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${units}`;

    const resp = await fetch(api);
    const body = await resp.text();
    return { statusCode: resp.status, headers: CORS_HEADERS, body };
  } catch (e) {
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: "Request failed" }),
    };
  }
}
