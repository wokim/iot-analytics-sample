import { mqtt, auth, http, io, iot } from 'aws-iot-device-sdk-v2';
import { random } from 'lodash';

const messages: [{
    temperature: number,
    power: string, // On or Off
    aqi: number,
    humidity: number,
    fan_level: number, // 0 - 10
    filter_hours_used: number,
    filter_life_remaining: number,
    motor_speed: number,
    purify_volume: number,
    use_time: number
}] = require('./messages.json');

(async () => {
    try {
        io.enable_logging(io.LogLevel.ERROR);
        const client_bootstrap = new io.ClientBootstrap();
        const config_builder = iot.AwsIotMqttConnectionConfigBuilder.new_mtls_builder_from_path('air-purifier-mask.cert.pem', 'air-purifier-mask.private.key');
        config_builder.with_certificate_authority_from_path(undefined, 'root-CA.crt');
        config_builder.with_clean_session(false);
        config_builder.with_client_id('sdk-nodejs-bdb5b5cc-7267-4b64-a614-a9254ac30aa7');
        config_builder.with_endpoint('a2ht32h2xi2i8d-ats.iot.ap-northeast-1.amazonaws.com');

        const client = new mqtt.MqttClient(client_bootstrap);
        const connection = client.new_connection(config_builder.build());

        console.log('Connecting...');
        await connection.connect();
        console.log('Connected!');

        // publish messages
        for (let index = 0; index < 1000; index++) {
            setTimeout(async () => {
                let temperature = random(0, 20) + 15;
                // 3% chance of throwing an anomalous temperature reading
                if (random(0, 100) > 97) {
                    temperature *= 3;
                }
                const msg = {
                    deviceid: `P0${random(1, 5)}`,
                    current_ts: Math.floor(+new Date() / 1000),
                    temperature,
                    aqi: random(1, 100),
                    humidity: random(0, 40) + 50,
                    fan_level: random(1, 10),
                    purify_volume: random(0, 1000) + 2000
                };
                const topic = `air-purifier-mask/test`;
                console.log(`Publishing messages into ${topic}...${index}`);
                console.log(msg);
                await connection.publish(topic, JSON.stringify(msg), mqtt.QoS.AtLeastOnce);
                console.log(`Published! ${index}`);
            }, 500 * index);
        }

        // console.log('Disconnecting...');
        // await connection.disconnect();
        // console.log('Disconnected!');
    } catch (e) {
        console.log(e);
    }
})();
