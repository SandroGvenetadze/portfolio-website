const API_BASE =
  location.hostname.endsWith("github.io") ||
  location.hostname === "localhost" ||
  location.hostname === "127.0.0.1"
    ? "https://brilliant-blancmange-ef53fb.netlify.app/api"
    : "/api";

const API = {
  byCity: (q, units) =>
    `${API_BASE}/weather?q=${encodeURIComponent(q)}&units=${units}`,
  byCoords: (lat, lon, units) =>
    `${API_BASE}/weather?lat=${lat}&lon=${lon}&units=${units}`,
};

const form = document.getElementById("searchForm");
const input = document.getElementById("cityInput");
const statusEl = document.getElementById("status");
const card = document.getElementById("card");
const city = document.getElementById("city");
const desc = document.getElementById("desc");
const temp = document.getElementById("temp");
const feels = document.getElementById("feels");
const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");
const pressure = document.getElementById("pressure");
const recentsWrap = document.getElementById("recents");
const cBtn = document.getElementById("cBtn");
const fBtn = document.getElementById("fBtn");
const locBtn = document.getElementById("locBtn");
const themeToggle = document.getElementById("themeToggle");
const toastContainer = document.getElementById("toastContainer");

const STATE = {
  units: localStorage.getItem("units") || "metric",
  lastQuery: localStorage.getItem("lastQuery") || "",
  recents: JSON.parse(localStorage.getItem("recentCities") || "[]"),
  theme: localStorage.getItem("theme") || "dark",
};

function fmtTemp(t) {
  return `${Math.round(t)}°${STATE.units === "metric" ? "C" : "F"}`;
}

function fmtWind(v) {
  return STATE.units === "metric"
    ? `${v.toFixed(1)} m/s`
    : `${v.toFixed(1)} mph`;
}

function setUnits(unit) {
  STATE.units = unit;
  localStorage.setItem("units", unit);
  cBtn.classList.toggle("active", unit === "metric");
  fBtn.classList.toggle("active", unit === "imperial");
  if (STATE.lastQuery) fetchWeather(STATE.lastQuery);
}

function setTheme(theme) {
  STATE.theme = theme;
  localStorage.setItem("theme", theme);
  document.body.classList.toggle("light", theme === "light");
  themeToggle.textContent = theme === "light" ? "🌙" : "☀️";
}

function setStatus(msg, tone = "muted") {
  statusEl.textContent = msg;
  statusEl.style.color =
    tone === "error"
      ? "var(--danger)"
      : tone === "muted"
      ? "var(--muted-dark)"
      : tone;
}

function saveRecent(cityName) {
  const list = STATE.recents.filter(
    (c) => c.toLowerCase() !== cityName.toLowerCase()
  );
  list.unshift(cityName);
  STATE.recents = list.slice(0, 8);
  localStorage.setItem("recentCities", JSON.stringify(STATE.recents));
  renderRecents();
}

function renderRecents() {
  recentsWrap.innerHTML = "";
  STATE.recents.forEach((c) => {
    const el = document.createElement("button");
    el.className = "chip";
    el.textContent = c;
    el.addEventListener("click", () => {
      input.value = c;
      fetchWeather(c);
    });
    recentsWrap.appendChild(el);
  });
}

function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  toastContainer.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function startLoading() {
  card.classList.remove("visible");
  card.classList.add("shimmer");
}

function stopLoading() {
  card.classList.remove("shimmer");
  card.classList.add("visible");
}

function renderWeather(data) {
  const { name, sys, weather, main, wind: w } = data;
  const iconCode = weather?.[0]?.icon || "01d";
  card.querySelector(
    ".icon-wrap"
  ).innerHTML = `<img src="https://openweathermap.org/img/wn/${iconCode}@2x.png" alt="${
    weather?.[0]?.description || "Weather icon"
  }" />`;
  city.textContent = `${name}, ${sys?.country || ""}`.trim();
  desc.textContent = weather?.[0]?.description || "—";
  temp.textContent = fmtTemp(main.temp);
  feels.textContent = `Feels like ${fmtTemp(main.feels_like)}`;
  humidity.textContent = `Humidity ${main.humidity}%`;
  wind.textContent = `Wind ${fmtWind(w.speed)}`;
  pressure.textContent = `Pressure ${main.pressure} hPa`;
  stopLoading();
}

async function fetchWeather(queryOrCoords) {
  try {
    setStatus("Loading…");
    startLoading();
    let url;
    if (typeof queryOrCoords === "string") {
      const q = queryOrCoords.trim();
      if (!q) return setStatus("Please type a city first.");
      url = API.byCity(q, STATE.units);
    } else {
      const { lat, lon } = queryOrCoords;
      url = API.byCoords(lat, lon, STATE.units);
    }
    const res = await fetch(url);
    if (!res.ok) {
      const problem = await res.json().catch(() => ({}));
      throw new Error(problem?.message || res.statusText || "Request failed");
    }
    const data = await res.json();
    renderWeather(data);
    const qName = data?.name;
    if (qName) {
      STATE.lastQuery = qName;
      localStorage.setItem("lastQuery", qName);
      saveRecent(qName);
      setStatus(`Updated • ${new Date().toLocaleTimeString()}`);
      showToast(`Weather updated for ${qName}`, "success");
    }
  } catch (err) {
    stopLoading();
    setStatus(`Error: ${err.message}`, "error");
    showToast(err.message, "error");
  }
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  fetchWeather(input.value);
});

cBtn.addEventListener("click", () => setUnits("metric"));
fBtn.addEventListener("click", () => setUnits("imperial"));

locBtn.addEventListener("click", () => {
  if (!("geolocation" in navigator))
    return showToast("Geolocation not supported.", "error");
  setStatus("Getting your location…");
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude: lat, longitude: lon } = pos.coords;
      fetchWeather({ lat, lon });
    },
    (err) => {
      setStatus(`Location error: ${err.message}`, "error");
      showToast(err.message, "error");
    },
    { enableHighAccuracy: true, timeout: 8000 }
  );
});

themeToggle.addEventListener("click", () => {
  setTheme(STATE.theme === "dark" ? "light" : "dark");
});

cBtn.classList.toggle("active", STATE.units === "metric");
fBtn.classList.toggle("active", STATE.units === "imperial");
renderRecents();
setTheme(STATE.theme);

if (STATE.lastQuery) {
  fetchWeather(STATE.lastQuery);
} else {
  fetchWeather("Tbilisi");
}
