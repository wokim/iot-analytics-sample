# IoT Anaytics Sample

This project is demo to build a minimal system that collects and analyzes usage data of wearable masks with air-purifier from each end-user.

## High Level Design

* Microcontroller based air-purifier mask is connected to the mobile device via Bluetooth LE.
* The mobile device can publish and subscribe to messages using MQTT protocol with AWS IoT Core.
* Create a AWS IoT rule to flow any data matching the rule through AWS IoT Analytics data store.
  * Pipeline activities connect a channel to a data store and process messages.
  * Create a dataset to query the data using SQL expressions

## How To Run

```sh
# Provision IoT topic rules, channel, datastore, and dataset
$ cdk deploy

# Run demo device to publish messages to AWS IoT Core using MQTT protocol
$ cd device
$ npm run start
```

## Licenses

N/A