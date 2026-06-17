import { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { api } from '../../utils/api';
import s from './Overview.module.css';

const PIE_COLORS = ['#15803D', '#F59E0B', '#EF4444', '#3B82F6'];

export default function Overview() {
  const [kpis, setKpis] = useState(null);
  const [trends, setTrends] = useState([]);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [kpiData, trendData, zoneData] = await Promise.all([
          api.getKPIs(),
          api.getTrends(),
          api.getHeatmap(),
        ]);
        setKpis(kpiData);
        setTrends(trendData);
        setZones(zoneData);
      } catch (err) {
        console.error('Failed to load overview data:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return <div className={s.loading}>Loading dashboard data...</div>;
  }

  // Green cover distribution for pie chart
  const greenDist = [
    { name: '< 10%', value: zones.filter(z => z.green_cover_pct < 10).length },
    { name: '10-20%', value: zones.filter(z => z.green_cover_pct >= 10 && z.green_cover_pct < 20).length },
    { name: '20-30%', value: zones.filter(z => z.green_cover_pct >= 20 && z.green_cover_pct < 30).length },
    { name: '> 30%', value: zones.filter(z => z.green_cover_pct >= 30).length },
  ].filter(d => d.value > 0);

  // Top heat zones for bar chart
  const topHeatZones = [...zones]
    .sort((a, b) => b.surface_temperature - a.surface_temperature)
    .slice(0, 10)
    .map(z => ({
      name: z.zone_id,
      temp: z.surface_temperature,
      risk: z.heat_risk_score,
    }));

  // Zone table sorted by risk
  const sortedZones = [...zones].sort((a, b) => b.heat_risk_score - a.heat_risk_score);

  return (
    <div className={s.page}>
      <div className={s.pageHeader}>
        <h1 className={s.pageTitle}>City Climate Overview</h1>
        <p className={s.pageSubtitle}>
          Real-time urban heat intelligence across {kpis?.total_zones || 20} monitored zones
        </p>
      </div>

      {/* KPI Cards */}
      <div className={s.kpiGrid}>
        <div className={s.kpiCard}>
          <div className={s.kpiLabel}>Heat Vulnerability Index</div>
          <div className={s.kpiValue}>
            {kpis?.heat_vulnerability_index?.toFixed(1)}
            <span className={s.kpiUnit}>/ 100</span>
          </div>
          <div className={s.kpiMeta}>
            <span className={`${s.kpiTrend} ${s.kpiTrendUp}`}>↑ Critical</span>
            <span>· {kpis?.high_risk_zones} high-risk zones</span>
          </div>
        </div>

        <div className={s.kpiCard}>
          <div className={s.kpiLabel}>Average Green Cover</div>
          <div className={s.kpiValue}>
            {kpis?.avg_green_cover_pct?.toFixed(1)}
            <span className={s.kpiUnit}>%</span>
          </div>
          <div className={s.kpiMeta}>
            <span className={`${s.kpiTrend} ${s.kpiTrendDown}`}>Target: 33%</span>
          </div>
        </div>

        <div className={s.kpiCard}>
          <div className={s.kpiLabel}>Carbon Reduction Potential</div>
          <div className={s.kpiValue}>
            {kpis?.carbon_reduction_potential?.toFixed(0)}
            <span className={s.kpiUnit}>t CO₂/yr</span>
          </div>
          <div className={s.kpiMeta}>
            <span>If zones reach 45% green cover</span>
          </div>
        </div>

        <div className={s.kpiCard}>
          <div className={s.kpiLabel}>Predicted Temp Reduction</div>
          <div className={s.kpiValue}>
            {kpis?.predicted_temp_reduction?.toFixed(1)}
            <span className={s.kpiUnit}>°C</span>
          </div>
          <div className={s.kpiMeta}>
            <span className={`${s.kpiTrend} ${s.kpiTrendDown}`}>↓ Achievable</span>
            <span>· with 30% green target</span>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className={s.chartsGrid}>
        <div className={s.chartCard}>
          <div className={s.chartTitle}>
            Temperature Trends
            <span className={s.chartSubtitle}>Monthly average across all zones</span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={trends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748B' }} />
              <YAxis tick={{ fontSize: 12, fill: '#64748B' }} domain={['auto', 'auto']} unit="°C" />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 13 }}
              />
              <Line
                type="monotone"
                dataKey="temperature"
                stroke="#EF4444"
                strokeWidth={2}
                dot={{ fill: '#EF4444', r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className={s.chartCard}>
          <div className={s.chartTitle}>Green Cover Distribution</div>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={greenDist}
                innerRadius={60}
                outerRadius={90}
                paddingAngle={4}
                dataKey="value"
              >
                {greenDist.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 13 }} />
              <Legend
                wrapperStyle={{ fontSize: 12 }}
                formatter={(value) => <span style={{ color: '#334155' }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Heat Distribution Bar */}
      <div className={s.chartCard} style={{ marginBottom: 'var(--space-6)' }}>
        <div className={s.chartTitle}>
          Heat Distribution by Zone
          <span className={s.chartSubtitle}>Top 10 hottest zones</span>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={topHeatZones}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748B' }} />
            <YAxis tick={{ fontSize: 12, fill: '#64748B' }} unit="°C" />
            <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 13 }} />
            <Bar dataKey="temp" radius={[4, 4, 0, 0]}>
              {topHeatZones.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.temp > 42 ? '#EF4444' : entry.temp > 39 ? '#F59E0B' : '#3B82F6'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Zone Table */}
      <div className={s.tableCard}>
        <div className={s.chartTitle}>Zone Risk Assessment</div>
        <table className={s.table}>
          <thead>
            <tr>
              <th>Zone</th>
              <th>Name</th>
              <th>Temperature</th>
              <th>Green Cover</th>
              <th>Population Density</th>
              <th>Risk Level</th>
            </tr>
          </thead>
          <tbody>
            {sortedZones.slice(0, 10).map((z) => (
              <tr key={z.zone_id}>
                <td style={{ fontWeight: 600 }}>{z.zone_id}</td>
                <td>{z.zone_name}</td>
                <td>{z.surface_temperature}°C</td>
                <td>{z.green_cover_pct}%</td>
                <td>{z.population_density?.toLocaleString()}/km²</td>
                <td>
                  <span className={`${s.riskBadge} ${
                    z.heat_risk_score > 65 ? s.riskHigh :
                    z.heat_risk_score > 45 ? s.riskMedium : s.riskLow
                  }`}>
                    {z.heat_risk_score > 65 ? 'High' : z.heat_risk_score > 45 ? 'Medium' : 'Low'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
