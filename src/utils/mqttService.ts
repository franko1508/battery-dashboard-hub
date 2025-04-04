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
      console.log('[MQTT] Using existing connection');
      return mqttClient;
    }
    // Otherwise, disconnect the old client
    console.log('[MQTT] Disconnecting previous client');
    mqttClient.end(true); // Force disconnect
    mqttClient = null;
  }

  if (!files.rootCA || !files.clientCert || !files.privateKey) {
    throw new Error('All certificate files are required');
  }

  try {
    // Convert the certificate files to strings
    const rootCA = await fileToString(files.rootCA);
    const clientCert = await fileToString(files.clientCert);
    const privateKey = await fileToString(files.privateKey);

    // AWS IoT endpoint - the specific endpoint for your AWS IoT Core
    const endpoint = 'aatjr0tj00iej-ats.iot.us-east-1.amazonaws.com';
    const clientId = `browser-mqtt-${Math.random().toString(16).substring(2, 10)}`;

    // MQTT over WebSockets URL
    const brokerUrl = `wss://${endpoint}/mqtt`;

    // Connect options for AWS IoT
    const connectOptions: mqtt.IClientOptions = {
      clientId,
      protocol: 'wss',
      clean: true,
      reconnectPeriod: 3000,
      connectTimeout: 10000, // 10 seconds timeout
      // AWS IoT specific connection options
      ca: [rootCA],
      cert: clientCert,
      key: privateKey,
      rejectUnauthorized: true,
    };

    console.log(`[MQTT] Connecting to endpoint: ${endpoint} with client ID: ${clientId}`);

    // Create and connect the client
    mqttClient = mqtt.connect(brokerUrl, connectOptions);

    // Set up error handlers
    mqttClient.on('error', (err) => {
      console.error('[MQTT] Connection error:', err);
    });

    mqttClient.on('offline', () => {
      console.log('[MQTT] Client went offline');
    });

    mqttClient.on('reconnect', () => {
      console.log('[MQTT] Client trying to reconnect');
    });

    // Return a promise that resolves when connected or rejects on error
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Connection timeout after 15 seconds'));
      }, 15000);

      mqttClient!.on('connect', () => {
        console.log('[MQTT] Connected successfully');
        clearTimeout(timeout);
        resolve(mqttClient!);
      });

      mqttClient!.on('error', (err) => {
        console.error('[MQTT] Connection error during setup:', err);
        clearTimeout(timeout);
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

    // Send the message with a timeout
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Message publish timeout after 10 seconds'));
      }, 10000);

      client.publish(topic, message, { qos: 1 }, (error) => {
        clearTimeout(timeout);
        
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
  if (mqttClient) {
    mqttClient.end(true); // Force disconnect
    mqttClient = null;
    console.log('[MQTT] Disconnected');
  }
};
