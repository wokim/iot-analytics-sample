# IoT Device Demo

This demo publishes `messages.json` content to `air-purifier-mask/1` topic once per second.

## Installation

```sh
# Install the required libraries using apt
sudo apt-get install cmake
sudo apt-get install libssl-dev

# For macOS
brew install cmake
brew install openssl

# Install the AWS Common Runtime and the AWS IoT Device SDK
npm install
```

## Sample Payload

```json
{
    "temperature": 20.9,
    "power": "On", // On or Off
    "aqi": 8,
    "humidity": 50,
    "fan_level": 2,
    "filter_hours_used": 43,
    "filter_life_remaining": 98,
    "motor_speed": 1262,
    "purify_volume": 5182,
    "use_time": 156000
}
```

## Run

```sh
npm run start
```
