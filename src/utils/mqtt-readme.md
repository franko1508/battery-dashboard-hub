
# MQTT Connection Setup for AWS IoT

This document provides instructions on how to set up a real MQTT connection with AWS IoT using the certificate files.

## Prerequisites

1. AWS IoT account with proper permissions
2. Certificate files:
   - `root-CA.crt` - Certificate Authority file
   - `SeniorDesign.cert.pem` - Client certificate
   - `SeniorDesign.private.key` - Private key

## Implementation Notes

The current implementation in `mqttService.ts` is a simplified version that simulates the MQTT connection. In a real-world scenario, you would need to:

1. Use the AWS IoT Device SDK for JavaScript
2. Implement proper certificate handling in the browser
3. Configure AWS IoT to allow connections from your application

## Sample Implementation

To implement a real MQTT connection in a Node.js environment, you would use code similar to what was provided:

```javascript
import { mqtt } from 'aws-iot-device-sdk-v2';
import { io, iot } from 'aws-crt';

const mqttConnection = iot.AwsIotMqttConnectionConfigBuilder
  .new_mtls_builder_from_path(certificatePath, privateKeyPath)
  .with_certificate_authority_from_path(undefined, rootCAPath)
  .with_clean_session(true)
  .with_client_id("your-client-id")
  .with_endpoint(iotEndpoint)
  .build();

const client = new mqtt.MqttClient();
const connection = client.new_connection(mqttConnection);

// Connect
await connection.connect();

// Publish
await connection.publish(
  "sdk/test/java",
  JSON.stringify({ value: isEnabled ? "1" : "0" }),
  mqtt.QoS.AtLeastOnce
);
```

## Browser Implementation

For browser implementations, you'll need to:

1. Use a WebSocket connection to AWS IoT (AWS IoT supports MQTT over WebSockets)
2. Implement proper authentication using Cognito or API Gateway
3. Ensure your certificates are securely handled (they should not be exposed in the browser)

A common approach is to create a serverless function (like AWS Lambda) that handles the MQTT connection securely, and then call that function from your frontend application.

## Resources

- [AWS IoT Device SDK for JavaScript v2](https://github.com/aws/aws-iot-device-sdk-js-v2)
- [AWS IoT MQTT over WebSocket](https://docs.aws.amazon.com/iot/latest/developerguide/mqtt-ws.html)
- [AWS IoT Core Documentation](https://docs.aws.amazon.com/iot/latest/developerguide/what-is-aws-iot.html)
