/**
 * Real implementation of the MQTT service for browsers using MQTT.js
 * This uses MQTT over WebSockets which is supported by AWS IoT Core
 */

import mqtt from 'mqtt';

type MQTTFiles = {
  rootCA: File | null;
  clientCert: File | null;
  privateKey: File | null;
};

/**
 * Converts a File object to a string
 */
const fileToString = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
};

// MQTT client instance that can be reused
let mqttClient: mqtt.MqttClient | null = null;

/**
 * Connects to AWS IoT Core using the provided certificates
 */
export const connectMQTT = async (files: MQTTFiles): Promise<mqtt.MqttClient> => {
  if (mqttClient) {
    // If already connected, return the existing client
    if (mqttClient.connected) {
      return mqttClient;
    }
    // Otherwise, disconnect the old client
    mqttClient.end();
  }

  if (!files.rootCA || !files.clientCert || !files.privateKey) {
    throw new Error('All certificate files are required');
  }

  try {
    // Convert the certificate files to strings
    const rootCA = await fileToString(files.rootCA);
    const clientCert = await fileToString(files.clientCert);
    const privateKey = await fileToString(files.privateKey);

    // AWS IoT endpoint - replace with your endpoint
    // Typically in the format: xxxxxxx-ats.iot.region.amazonaws.com
    const endpoint = 'your-iot-endpoint.amazonaws.com'; // Replace with your actual endpoint
    const clientId = `browser-mqtt-${Math.random().toString(16).substring(2, 10)}`;

    // MQTT over WebSockets URL
    const brokerUrl = `wss://${endpoint}/mqtt`;

    // Connect options for AWS IoT
    const connectOptions: mqtt.IClientOptions = {
      clientId,
      protocol: 'wss',
      clean: true,
      reconnectPeriod: 3000,
      // AWS IoT specific connection options
      ca: [rootCA],
      cert: clientCert,
      key: privateKey,
      rejectUnauthorized: true,
    };

    console.log(`[MQTT] Connecting to endpoint: ${endpoint} with client ID: ${clientId}`);

    // Create and connect the client
    mqttClient = mqtt.connect(brokerUrl, connectOptions);

    // Return a promise that resolves when connected or rejects on error
    return new Promise((resolve, reject) => {
      mqttClient!.on('connect', () => {
        console.log('[MQTT] Connected successfully');
        resolve(mqttClient!);
      });

      mqttClient!.on('error', (err) => {
        console.error('[MQTT] Connection error:', err);
        reject(err);
      });
    });
  } catch (error) {
    console.error('[MQTT] Setup error:', error);
    throw error;
  }
};

/**
 * Sends a message to the specified MQTT topic
 */
export const sendMQTTMessage = async (
  topic: string,
  message: string,
  files: MQTTFiles
): Promise<void> => {
  try {
    console.log(`[MQTT] Preparing to send message to topic: ${topic}`);
    console.log(`[MQTT] Files provided:`, {
      rootCA: files.rootCA?.name || 'None',
      clientCert: files.clientCert?.name || 'None',
      privateKey: files.privateKey?.name || 'None'
    });

    // Connect to MQTT (or get existing connection)
    const client = await connectMQTT(files);

    // Send the message
    return new Promise((resolve, reject) => {
      client.publish(topic, message, { qos: 1 }, (error) => {
        if (error) {
          console.error(`[MQTT] Failed to send message: ${error}`);
          reject(error);
        } else {
          console.log(`[MQTT] Message sent to ${topic}: ${message}`);
          resolve();
        }
      });
    });
  } catch (error) {
    console.error('[MQTT] Error in sendMQTTMessage:', error);
    throw error;
  }
};

/**
 * Disconnects the MQTT client
 */
export const disconnectMQTT = (): void => {
  if (mqttClient && mqttClient.connected) {
    mqttClient.end();
    mqttClient = null;
    console.log('[MQTT] Disconnected');
  }
};
