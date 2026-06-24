export interface WeatherData {
  cityName: string
  temp: string
  humidity: number
  rain: string
  weatherCode: number
}

/**
 * Resolves a city name into GPS coordinates (latitude & longitude)
 * using the keyless Open-Meteo Geocoding API.
 * 
 * @param city - The name of the city to search for
 * @returns An object containing latitude, longitude, and formatted name
 */
export async function getCityCoordinates(city: string): Promise<{ latitude: number; longitude: number; name: string }> {
  const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
  const response = await fetch(geoUrl)
  if (!response.ok) {
    throw new Error('Failed to connect to geocoding service')
  }

  const data = await response.json()
  if (!data.results || data.results.length === 0) {
    throw new Error(`City "${city}" not found`)
  }

  const { latitude, longitude, name } = data.results[0]
  return { latitude, longitude, name }
}

/**
 * Fetches real-time weather conditions for a set of coordinates
 * using the Open-Meteo Weather Forecast API.
 * 
 * @param latitude - The GPS latitude
 * @param longitude - The GPS longitude
 * @param cityName - The display name of the city
 * @returns An object containing current temperature, humidity, rain, and weather status code
 */
export async function getWeatherData(latitude: number, longitude: number, cityName: string): Promise<WeatherData> {
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,rain,weather_code`
  const response = await fetch(weatherUrl, { cache: 'no-store' })
  if (!response.ok) {
    throw new Error('Failed to fetch weather telemetry')
  }

  const data = await response.json()
  const current = data.current

  if (!current) {
    throw new Error('Invalid response structure from weather service')
  }

  const tempC = Math.round(current.temperature_2m)

  return {
    cityName,
    temp: `${tempC}°C`,
    humidity: Math.round(current.relative_humidity_2m),
    rain: `${parseFloat(String(current.rain ?? 0)).toFixed(1)} mm`,
    weatherCode: current.weather_code,
  }
}
