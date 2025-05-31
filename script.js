const API_KEY = "6b02721113f84433b5a71831251502";
let isCelsius = true;
let currentWeatherData = null;

const getWeatherData = (city) => {
    const URL = "https://api.weatherapi.com/v1/forecast.json";
    const FULL_URL = `${URL}?key=${API_KEY}&q=${city}&days=3&aqi=no&alerts=no`;

    return fetch(FULL_URL)
        .then((res) => res.json())
        .then((data) => {
            if (data.error) {
                throw new Error(data.error.message);
            }
            return data;
        });
};

const getWeatherByCoords = (lat, lon) => {
    const URL = "https://api.weatherapi.com/v1/forecast.json";
    const FULL_URL = `${URL}?key=${API_KEY}&q=${lat},${lon}&days=3&aqi=no&alerts=no`;

    return fetch(FULL_URL)
        .then((res) => res.json())
        .then((data) => {
            if (data.error) {
                throw new Error(data.error.message);
            }
            return data;
        });
};

const searchCity = () => {
    const city = document.getElementById('city-input').value.trim();
    if (!city) {
        document.getElementById('error-message').innerText = "Please enter a city name!";
        document.getElementById('error-message').style.display = 'block';
        return;
    }

    document.getElementById('loader').style.display = 'block';
    document.getElementById('weather-output').style.display = 'none';
    document.getElementById('error-message').style.display = 'none';

    getWeatherData(city)
        .then((res) => {
            currentWeatherData = res;
            localStorage.setItem('lastCity', city);
            showWeatherData(res);
        })
        .catch((error) => {
            console.error("Error fetching data:", error);
            document.getElementById('error-message').innerText = error.message || "Failed to fetch weather data.";
            document.getElementById('error-message').style.display = 'block';
        })
        .finally(() => {
            document.getElementById('loader').style.display = 'none';
        });
};

const showWeatherData = (weatherData) => {
    const temp = isCelsius ? weatherData.current.temp_c : weatherData.current.temp_f;
    const minTemp = isCelsius ? weatherData.forecast.forecastday[0].day.mintemp_c : weatherData.forecast.forecastday[0].day.mintemp_f;
    const maxTemp = isCelsius ? weatherData.forecast.forecastday[0].day.maxtemp_c : weatherData.forecast.forecastday[0].day.maxtemp_f;

    document.getElementById("city-name").innerText = weatherData.location.name;
    document.getElementById("weather-type").innerText = weatherData.current.condition.text;
    document.getElementById("weather-icon").src = `https:${weatherData.current.condition.icon}`;
    document.getElementById("weather-icon").style.display = 'block';
    document.getElementById("temp").innerText = temp.toFixed(1);
    document.getElementById("min-temp").innerText = minTemp.toFixed(1);
    document.getElementById("max-temp").innerText = maxTemp.toFixed(1);
    document.getElementById("unit").innerText = isCelsius ? '°C' : '°F';
    document.getElementById("unit-min").innerText = isCelsius ? '°C' : '°F';
    document.getElementById("unit-max").innerText = isCelsius ? '°C' : '°F';

    updateBackground(weatherData.current.condition.text);
    showForecast(weatherData.forecast.forecastday);
    showTempChart(weatherData.forecast.forecastday[0].hour);

    document.getElementById('weather-output').style.display = 'block';
};

const showForecast = (forecastData) => {
    const forecastDiv = document.getElementById('forecast');
    forecastDiv.innerHTML = '';
    forecastData.forEach(day => {
        const date = new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        const temp = isCelsius ? day.day.avgtemp_c : day.day.avgtemp_f;
        const card = document.createElement('div');
        card.className = 'forecast-card';
        card.innerHTML = `
            <p>${date}</p>
            <img src="https:${day.day.condition.icon}" alt="Weather Icon">
            <p>${temp.toFixed(1)}°${isCelsius ? 'C' : 'F'}</p>
            <p>${day.day.condition.text}</p>
        `;
        forecastDiv.appendChild(card);
    });
};

const showTempChart = (hourlyData) => {
    const ctx = document.getElementById('temp-chart').getContext('2d');
    const labels = hourlyData.slice(0, 12).map(hour => new Date(hour.time).getHours() + ':00');
    const temps = hourlyData.slice(0, 12).map(hour => isCelsius ? hour.temp_c : hour.temp_f);
    const humidity = hourlyData.slice(0, 12).map(hour => hour.humidity);


    if (window.tempChart instanceof Chart) { // Added: Prevent chart overlap
        window.tempChart.destroy();
    }

    window.tempChart = new Chart(ctx,
    {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Hourly Temperature',
                data: temps,
                borderColor: '#3498db',
                backgroundColor: 'rgba(52, 152, 219, 0.2)',
                fill: true,
                tension: 0.4,
                yAxisID: 'y'
        },
        {
            label: 'Humidity (%)', // Added: Humidity dataset
                    data: humidity,
                    borderColor: '#2ecc71',
                    backgroundColor: 'rgba(46, 204, 113, 0.2)',
                    fill: true,
                    tension: 0.4,
                    yAxisID: 'y1'
        }]
    },
        options: {
            responsive: true,
            interaction : {
                mode: 'index',
                intersect: false
            },
            plugins: {
                tooltip: {
                    enabled: true,
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            label += context.parsed.y + (context.dataset.yAxisID === 'y' ? (isCelsius ? '°C' : '°F') : '%');
                            return label;
                        }
                    }
                },
                legend: {
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: isCelsius ? 'Temperature (°C)' : 'Temperature (°F)'
                },
                grid: {
                        color: document.body.classList.contains('dark-mode') ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)' // Added: Dynamic grid color
                    }
                },
                y1: { // Added: Second Y-axis for humidity
                    position: 'right',
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Humidity (%)'
                    },
                    grid: {
                        drawOnChartArea: false
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Time'
                    }
                }
            }
        }
    });
};

const updateBackground = (condition) => {
const body = document.body;
const conditionLower = condition.toLowerCase();
let backgroundUrl = '/assets/main light bg.png';

if (conditionLower.includes('sunny') || conditionLower.includes('clear')) {
backgroundUrl = '/assets/sunny.jpg';
} 
else if (conditionLower.includes('cloud') || conditionLower.includes('overcast')) {
backgroundUrl = '/assets/cloud.jpg';
} 
else if (conditionLower.includes('rain') || conditionLower.includes('shower') ||
conditionLower.includes('drizzle')) {
        backgroundUrl = '/assets/rain.jpg';
} else if (conditionLower.includes('snow') || conditionLower.includes('sleet')) { // Added: Snow condition
        backgroundUrl = '/assets/snow.png';
    } else if (conditionLower.includes('thunder') || conditionLower.includes('storm')) { // Added: Thunderstorm condition
        backgroundUrl = '/assets/thunder.webp';
    }

    body.style.backgroundImage = `url('${backgroundUrl}')`;
};



document.getElementById('unit-toggle').addEventListener('click', () => {
isCelsius = !isCelsius;
document.getElementById('unit-toggle').innerText = `Switch to °${isCelsius ? 'F' : 'C'}`;
if (currentWeatherData) {
showWeatherData(currentWeatherData);
}
});

document.getElementById('theme-toggle').addEventListener('click', () => {
    console.log('Theme toggle clicked');
document.body.classList.toggle('dark-mode');
document.getElementById('theme-toggle').innerText = document.body.classList.contains('dark-mode') ? 'Toggle Light Mode' : 'Toggle Dark Mode';
    if (window.tempChart) { // Added: Update chart grid colors for dark mode
        window.tempChart.options.scales.y.grid.color = document.body.classList.contains('dark-mode') ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)';
        window.tempChart.update();
    }
});

document.getElementById('geo-btn').addEventListener('click', () => {
if (navigator.geolocation) {
document.getElementById('loader').style.display = 'block';
document.getElementById('weather-output').style.display = 'none';
document.getElementById('error-message').style.display = 'none';
navigator.geolocation.getCurrentPosition(
(position) => {
const { latitude, longitude } = position.coords;
getWeatherByCoords(latitude, longitude)
.then((res) => {
currentWeatherData = res;
localStorage.setItem('lastCity', `${latitude},${longitude}`);
showWeatherData(res);
})
.catch((error) => {
console.error("Error fetching geolocation data:", error);


document.getElementById('error-message').innerText = "Failed to fetch weather for your location.";
document.getElementById('error-message').style.display = 'block';
})
.finally(() => {
document.getElementById('loader').style.display = 'none';
});
},
() => {
document.getElementById('error-message').innerText = 'Geolocation not supported or permission denied';
document.getElementById('error-message').style.display = 'block';
document.getElementById('loader').style.display = 'none';
}
);
} else {
document.getElementById('error-message').innerText = 'Geolocation not supported by your browser';
document.getElementById('error-message').style.display = 'block';
}
});

document.getElementById('city-input').addEventListener('keypress', (e) => {
if (e.key === 'Enter') {
searchCity();
}
});

document.addEventListener('DOMContentLoaded', () => {
const lastCity = localStorage.getItem('lastCity');
if (lastCity && !lastCity.includes(',')) {
document.getElementById('city-input').value = lastCity;
}
});
