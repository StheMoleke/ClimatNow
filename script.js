document.getElementById('search-button').addEventListener('click', function () {
    const city = document.getElementById('city-input').value;
    const apiKey = 'a75916a5acf8876d16f8ec159e0919df'; // Replace with your actual API key

    if (city) {
        // Fetch current weather and hourly forecast
        fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`)
            .then(response => response.json())
            .then(data => {
                if (data.cod === '200') {
                    updateWeatherUI(data.city, data.list[0]);

                    // Hourly forecast for today
                    const today = new Date().toISOString().split('T')[0];
                    const todayForecasts = data.list.filter(forecast => forecast.dt_txt.includes(today));
                    updateHourlyForecast(todayForecasts);

                    // 7-day forecast
                    const dailyForecasts = data.list.filter(forecast => forecast.dt_txt.includes("12:00:00"));
                    updateDailyForecast(dailyForecasts);

                    // Fetch air quality and weather alerts
                    const { lat, lon } = data.city.coord;
                    fetchAirQuality(lat, lon, apiKey);
                    fetchWeatherAlerts(lat, lon, apiKey);
                } else {
                    alert('City not found, please try again.');
                }
            })
            .catch(error => {
                console.error('Error fetching the weather data:', error);
            });
    } else {
        alert('Please enter a city name.');
    }
});

document.getElementById('location-button').addEventListener('click', function () {
    const apiKey = 'a75916a5acf8876d16f8ec159e0919df'; // Replace with your actual API key
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`)
                .then(response => response.json())
                .then(data => {
                    updateWeatherUI(data);
                    fetchAirQuality(latitude, longitude, apiKey);
                })
                .catch(error => console.error('Error fetching location-based weather:', error));
        }, error => {
            console.error('Error getting location:', error);
            alert('Unable to retrieve location.');
        });
    } else {
        alert('Geolocation is not supported by this browser.');
    }
});

// Update Weather UI
function updateWeatherUI(city, currentWeather) {
    document.getElementById('city-name').textContent = `Weather in ${city.name}`;
    document.getElementById('temperature').textContent = `Temperature: ${currentWeather.main.temp} °C`;
    document.getElementById('description').textContent = `Description: ${currentWeather.weather[0].description}`;
    document.getElementById('humidity').textContent = `Humidity: ${currentWeather.main.humidity}%`;
    document.getElementById('wind-speed').textContent = `Wind Speed: ${currentWeather.wind.speed} m/s`;

    // Wind direction
    document.getElementById('wind-compass').style.transform = `rotate(${currentWeather.wind.deg}deg)`;

    // Weather icon
    const iconUrl = `http://openweathermap.org/img/wn/${currentWeather.weather[0].icon}@2x.png`;
    const weatherIcon = document.getElementById('weather-icon');
    weatherIcon.src = iconUrl;
    weatherIcon.style.display = 'block'; // Show the icon
}

// Update Hourly Forecast UI
function updateHourlyForecast(forecasts) {
    const hourlyContainer = document.getElementById('hourly-forecast');
    hourlyContainer.innerHTML = ''; // Clear previous data

    forecasts.forEach(forecast => {
        const forecastTime = new Date(forecast.dt_txt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const hourlyHTML = `
            <div class="hourly-item">
                <h4>${forecastTime}</h4>
                <img src="http://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png" alt="Weather Icon">
                <p>${forecast.main.temp} °C</p>
                <p>${forecast.weather[0].description}</p>
            </div>
        `;
        hourlyContainer.insertAdjacentHTML('beforeend', hourlyHTML);
    });
}

// Update 7-Day Forecast UI
function updateDailyForecast(dailyForecasts) {
    const forecastContainer = document.getElementById('forecast-container');
    forecastContainer.innerHTML = ''; // Clear previous data

    dailyForecasts.forEach(forecast => {
        const forecastDate = new Date(forecast.dt_txt).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
        const forecastHTML = `
            <div class="forecast-item">
                <h4>${forecastDate}</h4>
                <img src="http://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png" alt="Weather Icon">
                <p>${forecast.main.temp} °C</p>
                <p>${forecast.weather[0].description}</p>
            </div>
        `;
        forecastContainer.insertAdjacentHTML('beforeend', forecastHTML);
    });
}

// Fetch Air Quality Index (AQI)
function fetchAirQuality(lat, lon, apiKey) {
    fetch(`http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`)
        .then(response => response.json())
        .then(data => {
            const aqi = data.list[0].main.aqi;
            const aqiDescription = ['Good', 'Fair', 'Moderate', 'Poor', 'Very Poor'];
            document.getElementById('aqi').textContent = `Air Quality: ${aqiDescription[aqi - 1]}`;
        })
        .catch(error => console.error('Error fetching AQI:', error));
}

// Fetch Weather Alerts
function fetchWeatherAlerts(lat, lon, apiKey) {
    fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=current,minutely,hourly&appid=${apiKey}`)
        .then(response => response.json())
        .then(data => {
            const alertsContainer = document.getElementById('alerts');
            alertsContainer.innerHTML = ''; // Clear previous data

            if (data.alerts) {
                data.alerts.forEach(alert => {
                    const alertHTML = `
                        <div class="alert-item">
                            <h3>Alert: ${alert.event}</h3>
                            <p>${alert.description}</p>
                        </div>
                    `;
                    alertsContainer.insertAdjacentHTML('beforeend', alertHTML);
                });
            } else {
                alertsContainer.innerHTML = '<p>No active weather alerts</p>';
            }
        })
        .catch(error => console.error('Error fetching weather alerts:', error));
}

// Simulate a weather alert for testing
function simulateWeatherAlert() {
    const alertsContainer = document.getElementById('alerts');
    const simulatedAlert = `
        <div class="alert-item">
            <h3>Alert: Severe Thunderstorm Warning</h3>
            <p>A severe thunderstorm is expected in your area from 2 PM to 5 PM. Please take precautions.</p>
        </div>
    `;
    alertsContainer.insertAdjacentHTML('beforeend', simulatedAlert);
}

// Call the function after loading the page for testing purposes
simulateWeatherAlert();

