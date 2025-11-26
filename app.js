
        // Weather API configuration
        const API_KEY = '0327ade9486eb6bef9f616ec16701351';
        const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

        // Wait for the page to load
        document.addEventListener('DOMContentLoaded', function () {
            // Check if we need to show theme selection
            const today = new Date().toDateString();
            const lastVisitDate = localStorage.getItem('lastVisitDate');
            const userTheme = localStorage.getItem('userTheme');

            // Show theme selection if:
            // 1. First time visiting OR
            // 2. Browser was closed and reopened (sessionStorage cleared) OR
            // 3. It's a new day
            const shouldShowThemeSelection = !lastVisitDate ||
                !sessionStorage.getItem('hasSeenThemeToday') ||
                lastVisitDate !== today;

            if (shouldShowThemeSelection) {
                // Show theme selection after loading
                setTimeout(function () {
                    document.getElementById('loading-screen').style.display = 'none';
                    document.getElementById('theme-screen').style.display = 'flex';

                    // Check system preference for dark mode
                    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                        selectTheme(darkTheme, true);
                    } else {
                        selectTheme(lightTheme, false);
                    }
                }, 2500);
            } else {
                // Apply saved theme and go directly to home screen
                applyTheme(userTheme);
                updateThemeDisplay(userTheme);
                setTimeout(function () {
                    document.getElementById('loading-screen').style.display = 'none';
                    document.getElementById('home-screen').style.display = 'flex';
                }, 1500);
            }

            // Theme selection functionality
            const lightTheme = document.getElementById('light-theme');
            const darkTheme = document.getElementById('dark-theme');
            const skipBtn = document.getElementById('skip-btn');
            const confirmBtn = document.getElementById('confirm-btn');
            const appInfoChangeThemeBtn = document.getElementById('app-info-change-theme-btn');
            const infoBtn = document.getElementById('info-btn');
            const appInfoBackBtn = document.getElementById('app-info-back-btn');
            const weatherSearchBtn = document.getElementById('weather-search-btn');
            const weatherBackBtn = document.getElementById('weather-back-btn');
            const searchBtn = document.getElementById('search-btn');
            const cityInput = document.getElementById('city-input');
            const errorMessage = document.getElementById('error-message');
            let selectedTheme = null;

            // Function to select a theme
            function selectTheme(themeElement, isDark) {
                // Remove selected class from both
                lightTheme.classList.remove('selected');
                darkTheme.classList.remove('selected');

                // Add selected class to chosen theme
                themeElement.classList.add('selected');

                // Change indicator to filled circle
                const indicators = document.querySelectorAll('.theme-indicator i');
                indicators.forEach(indicator => {
                    indicator.className = 'far fa-circle';
                });

                themeElement.querySelector('.theme-indicator i').className = 'fas fa-check';

                // Apply theme immediately to selection page
                if (isDark) {
                    document.body.classList.add('dark-theme');
                    selectedTheme = 'dark';
                } else {
                    document.body.classList.remove('dark-theme');
                    selectedTheme = 'light';
                }
            }

            // Function to apply a theme
            function applyTheme(theme) {
                if (theme === 'dark') {
                    document.body.classList.add('dark-theme');
                } else {
                    document.body.classList.remove('dark-theme');
                }
            }

            // Function to update theme display on home page
            function updateThemeDisplay(theme) {
                const appInfoDisplay = document.getElementById('app-info-theme-display');
                if (theme === 'dark') {
                    appInfoDisplay.textContent = 'Dark Mode';
                } else {
                    appInfoDisplay.textContent = 'Light Mode';
                }
            }

            // Function to update time display
            function updateTime() {
                const now = new Date();
                const timeString = now.toLocaleTimeString();
                const dateString = now.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });

                document.getElementById('current-time').textContent = timeString;
                document.getElementById('current-date').textContent = dateString;
            }

            // Function to reset weather data
            function resetWeatherData() {
                document.getElementById('temperature-value').textContent = '--°C';
                document.getElementById('feels-like').textContent = '--°C';
                document.getElementById('humidity').textContent = '--%';
                document.getElementById('wind-speed').textContent = '-- km/h';
                document.getElementById('weather-condition').textContent = '--';
                document.getElementById('location-name').textContent = '--';
                document.getElementById('pressure').textContent = '-- hPa';
                document.getElementById('visibility').textContent = '-- km';
                document.getElementById('timezone').textContent = '--';

                // Reset search input
                document.getElementById('city-input').value = '';

                // Hide error message
                errorMessage.style.display = 'none';
            }

            // Function to get weather data from OpenWeatherMap API
            async function getWeatherData(city) {
                try {
                    const response = await fetch(`${BASE_URL}?q=${city}&appid=${API_KEY}&units=metric`);

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.message || 'City not found');
                    }

                    const data = await response.json();
                    return data;
                } catch (error) {
                    console.error('API Error:', error);
                    throw error;
                }
            }

            // Function to convert UNIX timestamp to local time
            function convertUnixToTime(unixTimestamp, timezoneOffset) {
                const date = new Date((unixTimestamp + timezoneOffset) * 1000);
                return date.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                });
            }

            // Function to display weather data
            function displayWeatherData(data) {
                // Hide error message
                errorMessage.style.display = 'none';

                // Display temperature data
                document.getElementById('temperature-value').textContent = `${Math.round(data.main.temp)}°C`;
                document.getElementById('feels-like').textContent = `${Math.round(data.main.feels_like)}°C`;
                document.getElementById('humidity').textContent = `${data.main.humidity}%`;
                document.getElementById('wind-speed').textContent = `${Math.round(data.wind.speed * 3.6)} km/h`; // Convert m/s to km/h
                document.getElementById('weather-condition').textContent = data.weather[0].main;
                document.getElementById('location-name').textContent = `${data.name}, ${data.sys.country}`;
                document.getElementById('pressure').textContent = `${data.main.pressure} hPa`;
                document.getElementById('visibility').textContent = `${(data.visibility / 1000).toFixed(1)} km`;

                // Display timezone
                const timezone = data.timezone / 3600; // Convert seconds to hours
                document.getElementById('timezone').textContent = `UTC${timezone >= 0 ? '+' : ''}${timezone}`;
            }

            // Event listeners for theme selection
            lightTheme.addEventListener('click', function () {
                selectTheme(lightTheme, false);
            });

            darkTheme.addEventListener('click', function () {
                selectTheme(darkTheme, true);
            });

            // Skip button functionality
            skipBtn.addEventListener('click', function () {
                // Use light mode as default
                const today = new Date().toDateString();
                localStorage.setItem('userTheme', 'light');
                localStorage.setItem('lastVisitDate', today);
                sessionStorage.setItem('hasSeenThemeToday', 'true');

                document.getElementById('theme-screen').style.display = 'none';
                document.getElementById('home-screen').style.display = 'flex';
                updateThemeDisplay('light');
            });

            // Confirm button functionality
            confirmBtn.addEventListener('click', function () {
                if (selectedTheme) {
                    const today = new Date().toDateString();
                    localStorage.setItem('userTheme', selectedTheme);
                    localStorage.setItem('lastVisitDate', today);
                    sessionStorage.setItem('hasSeenThemeToday', 'true');

                    document.getElementById('theme-screen').style.display = 'none';
                    document.getElementById('home-screen').style.display = 'flex';
                    updateThemeDisplay(selectedTheme);
                }
            });

            // App Info change theme button functionality
            appInfoChangeThemeBtn.addEventListener('click', function () {
                // Clear the flags to show theme selection again
                localStorage.removeItem('lastVisitDate');
                sessionStorage.removeItem('hasSeenThemeToday');

                // Go back to theme selection
                document.getElementById('app-info-screen').style.display = 'none';
                document.getElementById('theme-screen').style.display = 'flex';

                // Pre-select the current theme
                const currentTheme = localStorage.getItem('userTheme') || 'light';
                if (currentTheme === 'dark') {
                    selectTheme(darkTheme, true);
                } else {
                    selectTheme(lightTheme, false);
                }
            });

            // Info button functionality
            infoBtn.addEventListener('click', function () {
                document.getElementById('home-screen').style.display = 'none';
                document.getElementById('app-info-screen').style.display = 'flex';
            });

            // App Info back button functionality
            appInfoBackBtn.addEventListener('click', function () {
                document.getElementById('app-info-screen').style.display = 'none';
                document.getElementById('home-screen').style.display = 'flex';
            });

            // Weather search button functionality
            weatherSearchBtn.addEventListener('click', function () {
                document.getElementById('home-screen').style.display = 'none';
                document.getElementById('weather-screen').style.display = 'flex';

                // Start updating time
                updateTime();
                setInterval(updateTime, 1000);
            });

            // Weather back button functionality
            weatherBackBtn.addEventListener('click', function () {
                // Reset search data before going back
                resetWeatherData();

                document.getElementById('weather-screen').style.display = 'none';
                document.getElementById('home-screen').style.display = 'flex';
            });

            // Search button functionality
            searchBtn.addEventListener('click', function () {
                const city = cityInput.value.trim();
                if (city) {
                    // Show loading state
                    searchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Searching...';
                    searchBtn.disabled = true;

                    getWeatherData(city).then(data => {
                        displayWeatherData(data);

                        // Reset button
                        searchBtn.innerHTML = '<i class="fas fa-search"></i> Search';
                        searchBtn.disabled = false;
                    }).catch(error => {
                        // Show error message
                        errorMessage.textContent = error.message || 'City not found. Please check the spelling and try again.';
                        errorMessage.style.display = 'block';

                        // Reset button
                        searchBtn.innerHTML = '<i class="fas fa-search"></i> Search';
                        searchBtn.disabled = false;
                    });
                }
            });

            // Enter key for search
            cityInput.addEventListener('keypress', function (e) {
                if (e.key === 'Enter') {
                    searchBtn.click();
                }
            });

            // Store that the user has seen the theme today when they leave the page
            window.addEventListener('beforeunload', function () {
                if (document.getElementById('home-screen').style.display === 'flex' ||
                    document.getElementById('weather-screen').style.display === 'flex' ||
                    document.getElementById('app-info-screen').style.display === 'flex') {
                    sessionStorage.setItem('hasSeenThemeToday', 'true');
                }
            });
        });
    
