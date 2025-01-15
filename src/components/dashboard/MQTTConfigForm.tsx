import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MQTTConfig } from "@/types/battery";

export const MQTTConfigForm = () => {
  const [mqttConfig, setMqttConfig] = useState<MQTTConfig>({
    broker: '',
    port: '',
    username: '',
    password: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('MQTT Config:', mqttConfig);
  };

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>MQTT Configuration</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm">Broker Address</label>
            <Input
              value={mqttConfig.broker}
              onChange={(e) => setMqttConfig({ ...mqttConfig, broker: e.target.value })}
              placeholder="mqtt.example.com"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm">Port</label>
            <Input
              value={mqttConfig.port}
              onChange={(e) => setMqttConfig({ ...mqttConfig, port: e.target.value })}
              placeholder="1883"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm">Username</label>
            <Input
              value={mqttConfig.username}
              onChange={(e) => setMqttConfig({ ...mqttConfig, username: e.target.value })}
              placeholder="Username"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm">Password</label>
            <Input
              type="password"
              value={mqttConfig.password}
              onChange={(e) => setMqttConfig({ ...mqttConfig, password: e.target.value })}
              placeholder="••••••••"
            />
          </div>
          <Button type="submit" className="w-full">
            Connect
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};