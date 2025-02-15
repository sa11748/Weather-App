const API_KEY = "6b02721113f84433b5a71831251502";

const getWeatherData = (city) => {
    const URL = "https://api.weatherapi.com/v1/forecast.json";
    const FULL_URL = `${URL}?key=${API_KEY}&q=${city}&days=1&aqi=no&alerts=no`;

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
        alert("Please enter a city name!");
        return;
    }

    document.getElementById('loader').style.display = 'block';
    document.getElementById('weather-output').style.display = 'none';
    document.getElementById('error-message').style.display = 'none';

    getWeatherData(city)
        .then((res) => {
            console.log("API Response:", res);
            showWeatherData(res);
        })
        .catch((error) => {
            console.error("Error fetching data:", error);
            document.getElementById('error-message').innerText = error.message;
            document.getElementById('error-message').style.display = 'block';
        })
        .finally(() => {
            document.getElementById('loader').style.display = 'none';
        });
};

const showWeatherData = (weatherData) => {
    document.getElementById("city-name").innerText = weatherData.location.name;
    document.getElementById("weather-type").innerText = weatherData.current.condition.text;

    document.getElementById("temp").innerText = weatherData.current.temp_c.toFixed(2);
    document.getElementById("min-temp").innerText = weatherData.forecast.forecastday[0].day.mintemp_c.toFixed(2);
    document.getElementById("max-temp").innerText = weatherData.forecast.forecastday[0].day.maxtemp_c.toFixed(2);

    document.getElementById('weather-output').style.display = 'block';
};
