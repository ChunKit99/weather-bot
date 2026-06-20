export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Telegram webhook handler
    if (url.pathname === "/webhook" && request.method === "POST") {
      return handleTelegramWebhook(request, env);
    }

    // Health check
    if (url.pathname === "/health") {
      return new Response("OK", { status: 200 });
    }

    return new Response("Not Found", { status: 404 });
  },

  async scheduled(event, env, ctx) {
    console.log("Running scheduled weather alert...");
    const message = await getWeatherMessage(env.LOCATION);
    await sendTelegramMessage(env.BOT_TOKEN, env.CHAT_ID, message);
  },
};

async function handleTelegramWebhook(request, env) {
  const update = await request.json();

  if (update.message?.text) {
    const text = update.message.text.toLowerCase();
    const chatId = update.message.chat.id;

    if (text === "/start") {
      await sendTelegramMessage(
        env.BOT_TOKEN,
        chatId,
        "🌤️ Weather Bot Active!\n\nCommands:\n/weather - Get current weather\n/forecast - 5-day forecast"
      );
    } else if (text === "/weather") {
      const weather = await getWeatherMessage(env.LOCATION);
      await sendTelegramMessage(env.BOT_TOKEN, chatId, weather);
    } else if (text === "/forecast") {
      const forecast = await getForecast(env.LOCATION);
      await sendTelegramMessage(env.BOT_TOKEN, chatId, forecast);
    }
  }

  return new Response("OK");
}

async function getWeatherMessage(location) {
  const weather = await fetchWeather(location);

  return `
📍 *${weather.location}*
🌡️ Temperature: ${weather.temp}°C
💨 Condition: ${weather.condition}
💧 Humidity: ${weather.humidity}%
💨 Wind: ${weather.wind} km/h
⏰ Updated: ${new Date().toLocaleString()}
  `.trim();
}

async function getForecast(location) {
  try {
    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${location}&count=1&language=en&format=json`
    );
    const geoData = await response.json();
    const { latitude, longitude } = geoData.results[0];

    const forecastResponse = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto&forecast_days=5`
    );
    const forecastData = await forecastResponse.json();
    const daily = forecastData.daily;

    let text = "📅 *5-Day Forecast*\n\n";
    for (let i = 0; i < 5; i++) {
      text += `${daily.time[i]}: ${daily.temperature_2m_max[i]}°C / ${daily.temperature_2m_min[i]}°C - ${getWeatherDescription(daily.weather_code[i])}\n`;
    }
    return text;
  } catch (error) {
    return "Error fetching forecast: " + error.message;
  }
}

async function fetchWeather(location) {
  try {
    // Get coordinates
    const geoResponse = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${location}&count=1&language=en&format=json`
    );
    const geoData = await geoResponse.json();

    if (!geoData.results || geoData.results.length === 0) {
      return {
        location: location,
        temp: "N/A",
        condition: "Location not found",
        humidity: "N/A",
        wind: "N/A",
      };
    }

    const { latitude, longitude, name, country } = geoData.results[0];

    // Get weather
    const weatherResponse = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`
    );
    const weatherData = await weatherResponse.json();
    const current = weatherData.current;

    return {
      location: `${name}, ${country}`,
      temp: current.temperature_2m,
      condition: getWeatherDescription(current.weather_code),
      humidity: current.relative_humidity_2m,
      wind: current.wind_speed_10m,
    };
  } catch (error) {
    console.error("Weather fetch error:", error);
    return {
      location: location,
      temp: "N/A",
      condition: "Error fetching data",
      humidity: "N/A",
      wind: "N/A",
    };
  }
}

function getWeatherDescription(code) {
  const descriptions = {
    0: "Clear sky ☀️",
    1: "Mainly clear 🌤️",
    2: "Partly cloudy ⛅",
    3: "Overcast ☁️",
    45: "Foggy 🌫️",
    48: "Foggy with rime 🌫️",
    51: "Light drizzle 🌧️",
    61: "Slight rain 🌧️",
    63: "Rain 🌧️",
    80: "Rain showers 🌧️",
    95: "Thunderstorm ⛈️",
  };
  return descriptions[code] || "Unknown ❓";
}

async function sendTelegramMessage(botToken, chatId, message) {
  const response = await fetch(
    `https://api.telegram.org/bot${botToken}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "Markdown",
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    console.error("Telegram error:", error);
  }
}