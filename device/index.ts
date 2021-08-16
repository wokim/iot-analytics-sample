import { mqtt, auth, http, io, iot } from 'aws-iot-device-sdk-v2';
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
        messages.forEach((msg, index) => {
            setTimeout(async () => {
                const topic = 'air-purifier-mask/1';
                console.log(`Publishing messages into ${topic}...${index}`);
                await connection.publish(topic, JSON.stringify(msg), mqtt.QoS.AtLeastOnce);
                console.log(`Published! ${index}`);
                if (index + 1 === messages.length) console.log(`Published all messages`);
            }, 1000 * index);
        });

        // console.log('Disconnecting...');
        // await connection.disconnect();
        // console.log('Disconnected!');
    } catch (e) {
        console.log(e);
    }
})();
