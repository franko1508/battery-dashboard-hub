export interface BatteryData {
  time: string;
  soc: number | null;
  soh: number | null;
  socPredicted: number | null;
  sohPredicted: number | null;
}

export interface BMSSettings {
  maxVoltage: string;
  minVoltage: string;
  maxTemperature: string;
  maxChargeCurrent: string;
  maxDischargeCurrent: string;
}

export interface MQTTConfig {
  broker: string;
  port: string;
  username: string;
  password: string;
}