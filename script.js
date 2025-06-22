document.getElementById("search-btn").addEventListener("click", getWeather);

async function getWeather() {
  const cityInput = document.getElementById("city-input").value.trim();
  if (!cityInput) {
    alert("Proszę wpisać nazwę miasta!");
    return;
  }

  const weatherContainer = document.getElementById("weather");
  weatherContainer.innerHTML =
    '<div class="loading">Wyszukiwanie pogody...</div>';

  try {
    const coords = await getCityCoordinates(cityInput);

    const weatherData = await fetchWeather(coords.latitude, coords.longitude);

    displayWeather(weatherData);
  } catch (error) {
    console.error("Błąd:", error);
    weatherContainer.innerHTML =
      '<div class="error">Nie znaleziono miasta lub błąd połączenia.</div>';
  }
}

async function getCityCoordinates(cityName) {
  const response = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      cityName
    )}&count=1`
  );
  const data = await response.json();

  if (!data.results || data.results.length === 0) {
    throw new Error("Nie znaleziono miasta");
  }

  return {
    latitude: data.results[0].latitude,
    longitude: data.results[0].longitude,
  };
}

async function fetchWeather(latitude, longitude) {
  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weathercode,temperature_2m_max&timezone=auto&forecast_days=4`
  );
  return await response.json();
}

function displayWeather(weatherData) {
  const weatherContainer = document.getElementById("weather");

  if (!weatherData.daily) {
    weatherContainer.innerHTML =
      '<div class="error">Brak danych pogodowych.</div>';
    return;
  }

  weatherContainer.innerHTML = "";

  weatherData.daily.time.forEach((date, index) => {
    const dayElement = document.createElement("div");
    dayElement.className = "day";

    const dayName = new Date(date).toLocaleDateString("pl-PL", {
      weekday: "long",
    });
    const temp = Math.round(weatherData.daily.temperature_2m_max[index]);
    const weatherCode = weatherData.daily.weathercode[index];
    const weatherInfo = getWeatherInfo(weatherCode);

    dayElement.innerHTML = `
            <h3>${dayName}</h3>
            <div class="weather-icon">${weatherInfo.icon}</div>
            <p>${temp}°C</p>
            <p>${weatherInfo.description}</p>
        `;

    weatherContainer.appendChild(dayElement);
  });
}

function getWeatherInfo(weatherCode) {
  const weatherMap = {
    0: { icon: "☀️", description: "Słonecznie" },
    1: { icon: "🌤️", description: "Lekkie zachmurzenie" },
    2: { icon: "⛅", description: "Częściowe zachmurzenie" },
    3: { icon: "☁️", description: "Pochmurno" },
    45: { icon: "🌫️", description: "Mgła" },
    51: { icon: "🌧️", description: "Mżawka" },
    61: { icon: "🌧️", description: "Lekki deszcz" },
    80: { icon: "🌦️", description: "Przelotne opady" },
    95: { icon: "⛈️", description: "Burza" },
  };

  return weatherMap[weatherCode] || { icon: "❓", description: "Inne" };
}
