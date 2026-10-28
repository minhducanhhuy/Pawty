import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatShortDay } from '../../shared/lib/format';
import { Card } from '../../shared/ui/feedback';
import type { KpiSeriesPoint } from '../api/adminTypes';

interface DashboardChartsProps {
  series: KpiSeriesPoint[];
}

export function DashboardCharts({ series }: DashboardChartsProps) {
  const chartData = series.map((point) => ({
    ...point,
    dayLabel: point.date ? formatShortDay(point.date) : '',
  }));

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      <Card className="space-y-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">Tăng trưởng hoạt động 14 ngày</h2>
          <p className="text-xs text-slate-500">DAU, lượt Match và Boss mới đăng ký theo ngày</p>
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="dayLabel" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="dau" name="DAU" stroke="#FF6F61" strokeWidth={2.5} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="matches" name="Lượt Match" stroke="#48C4B0" strokeWidth={2.5} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="newPets" name="Boss mới" stroke="#F59E0B" strokeWidth={2} dot={{ r: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="space-y-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">Kèo hẹn dắt dạo 14 ngày</h2>
          <p className="text-xs text-slate-500">So sánh số kèo tạo mới và kèo hoàn thành (Check-in đôi)</p>
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="dayLabel" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="appointmentsCreated" name="Kèo hẹn tạo" fill="#FF6F61" radius={[6, 6, 0, 0]} />
              <Bar dataKey="appointmentsCompleted" name="Kèo hoàn thành" fill="#48C4B0" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
