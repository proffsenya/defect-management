import { useStats } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, CartesianGrid, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts";

const COLORS = ["#0ea5e9", "#22c55e", "#f59e0b", "#ef4444"]; // sky, emerald, amber, red

export function Analytics() {
  const { data } = useStats();

  const byPriority = data ? Object.entries(data.byPriority).map(([name, value]) => ({ name, value })) : [];
  const monthly = data?.monthlyCreated ?? [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Новые дефекты по месяцам</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#0ea5e9" name="Создано" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Распределение по приоритетам</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip />
              <Legend />
              <Pie data={byPriority} dataKey="value" nameKey="name" outerRadius={90} label>
                {byPriority.map((e, i) => (
                  <Cell key={e.name} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
