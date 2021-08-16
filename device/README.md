# IoT Device Demo

## Installation

```sh
# Install the required libraries using apt
sudo apt-get install cmake
sudo apt-get install libssl-dev

# For macOS
brew install cmake

# Install the AWS Common Runtime and the AWS IoT Device SDK
npm install aws-crt
npm install aws-iot-device-sdk-v2
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
    "use_time": 156000,
    "filter_rfid_product_id": "0:0:31:31",
    "filter_rfid_tag": "80:6c:50:1a:33:49:4",
    "filter_type": "Regular"
}
```