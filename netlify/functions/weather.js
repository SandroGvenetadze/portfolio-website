export async function handler(event, context) {
  const API_KEY = process.env.OPENWEATHER_API_KEY;
  const { city, units } = event.queryStringParameters;

  if (!city) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "City parameter is required" }),
    };
  }

  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
      city
    )}&units=${units || "metric"}&appid=${API_KEY}`
  );

  const data = await response.json();

  return {
    statusCode: 200,
    body: JSON.stringify(data),
  };
}
