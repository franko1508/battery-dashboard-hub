import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Battery, Settings } from 'lucide-react';

const generateData = (points: number) => {
  return Array.from({ length: points }, (_, i) => ({
    time: `${i}h`,
    soc: Math.floor(Math.random() * (100 - 60) + 60),
    soh: Math.floor(Math.random() * (100 - 80) + 80),
  }));
};

const Dashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [data] = useState(generateData(24));
  const [mqttConfig, setMqttConfig] = useState({
    broker: '',
    port: '',
    username: '',
    password: '',
  });

  const handleMqttSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('MQTT Config:', mqttConfig);
    // Here you would typically connect to MQTT broker
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Battery Management System</h1>
          <Button variant="secondary" onClick={logout}>
            Logout
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">State of Charge</CardTitle>
              <Battery className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data[data.length - 1].soc}%</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">State of Health</CardTitle>
              <Battery className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data[data.length - 1].soh}%</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">MQTT Status</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Disconnected</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Battery Metrics Over Time</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="soc" stroke="#60A5FA" name="SOC (%)" />
                  <Line type="monotone" dataKey="soh" stroke="#34D399" name="SOH (%)" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>MQTT Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleMqttSubmit} className="space-y-4">
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
        </div>
      </div>
    </div>
  );
};

export default Dashboard;