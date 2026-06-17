import { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, Legend,
} from 'recharts';
import { api } from '../../utils/api';
import s from './SimulationLab.module.css';

export default function SimulationLab() {
  const [params, setParams] = useState({
    tree_increase_pct: 15,
    green_space_pct: 10,
    roof_greening_pct: 5,
    cool_roof_pct: 10,
    budget_lakhs: 500,
  });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const update = (key, value) => setParams((p) => ({ ...p, [key]: value }));

  const runSimulation = async () => {
    setLoading(true);
    try {
      const data = await api.simulate(params);
      setResults(data);
    } catch (err) {
      console.error('Simulation failed:', err);
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data
  const beforeAfterData = results?.zones?.slice(0, 12).map(z => ({
    name: z.zone_id,
    before: z.current_temp,
    after: z.predicted_temp,
    reduction: z.temp_reduction,
  })) || [];

  return (
    <div className={s.page}>
      <h1 className={s.pageTitle}>Simulation Lab</h1>
      <p className={s.pageSubtitle}>
        Configure climate interventions and run AI-powered predictions to estimate impact
      </p>

      <div className={s.simLayout}>
        {/* Controls */}
        <div className={s.controlsPanel}>
          <div className={s.controlsTitle}>🧪 Intervention Parameters</div>

          <div className={s.sliderGroup}>
            <div className={s.sliderHeader}>
              <span className={s.sliderLabel}>Tree Plantation Increase</span>
              <span className={s.sliderValue}>{params.tree_increase_pct}%</span>
            </div>
            <input
              type="range"
              className={s.slider}
              min={0} max={50} step={1}
              value={params.tree_increase_pct}
              onChange={(e) => update('tree_increase_pct', Number(e.target.value))}
            />
          </div>

          <div className={s.sliderGroup}>
            <div className={s.sliderHeader}>
              <span className={s.sliderLabel}>Green Space Expansion</span>
              <span className={s.sliderValue}>{params.green_space_pct}%</span>
            </div>
            <input
              type="range"
              className={s.slider}
              min={0} max={40} step={1}
              value={params.green_space_pct}
              onChange={(e) => update('green_space_pct', Number(e.target.value))}
            />
          </div>

          <div className={s.sliderGroup}>
            <div className={s.sliderHeader}>
              <span className={s.sliderLabel}>Roof Greening</span>
              <span className={s.sliderValue}>{params.roof_greening_pct}%</span>
            </div>
            <input
              type="range"
              className={s.slider}
              min={0} max={30} step={1}
              value={params.roof_greening_pct}
              onChange={(e) => update('roof_greening_pct', Number(e.target.value))}
            />
          </div>

          <div className={s.sliderGroup}>
            <div className={s.sliderHeader}>
              <span className={s.sliderLabel}>Cool Roof Adoption</span>
              <span className={s.sliderValue}>{params.cool_roof_pct}%</span>
            </div>
            <input
              type="range"
              className={s.slider}
              min={0} max={50} step={1}
              value={params.cool_roof_pct}
              onChange={(e) => update('cool_roof_pct', Number(e.target.value))}
            />
          </div>

          <div className={s.sliderGroup}>
            <div className={s.sliderHeader}>
              <span className={s.sliderLabel}>Budget Allocation</span>
            </div>
            <input
              type="number"
              className={s.budgetInput}
              value={params.budget_lakhs}
              onChange={(e) => update('budget_lakhs', Number(e.target.value))}
              placeholder="Budget in Lakhs"
            />
          </div>

          <button className={s.runBtn} onClick={runSimulation} disabled={loading}>
            {loading ? '⏳ Running Simulation...' : '▶ Run Simulation'}
          </button>
        </div>

        {/* Results */}
        <div className={s.resultsArea}>
          {!results ? (
            <div className={s.placeholder}>
              <div className={s.placeholderIcon}>🧪</div>
              <div className={s.placeholderTitle}>Configure & Run Simulation</div>
              <p className={s.placeholderText}>
                Adjust the intervention parameters on the left and click "Run Simulation"
                to see AI-predicted climate impact across all city zones.
              </p>
            </div>
          ) : (
            <>
              {/* Impact Summary */}
              <div className={s.impactGrid}>
                <div className={`${s.impactCard} ${s.impactGreen}`}>
                  <div className={s.impactValue}>
                    {results.total_temp_reduction_avg.toFixed(1)}
                    <span className={s.impactUnit}> °C</span>
                  </div>
                  <div className={s.impactLabel}>Avg Temperature Reduction</div>
                </div>
                <div className={`${s.impactCard} ${s.impactBlue}`}>
                  <div className={s.impactValue}>
                    {results.total_carbon_sequestration.toFixed(1)}
                    <span className={s.impactUnit}> t CO₂/yr</span>
                  </div>
                  <div className={s.impactLabel}>Carbon Sequestration</div>
                </div>
                <div className={`${s.impactCard} ${s.impactOrange}`}>
                  <div className={s.impactValue}>
                    {results.overall_sustainability_score.toFixed(0)}
                    <span className={s.impactUnit}> / 100</span>
                  </div>
                  <div className={s.impactLabel}>Sustainability Score</div>
                </div>
              </div>

              {/* Before vs After Chart */}
              <div className={s.chartCard}>
                <div className={s.chartTitle}>Before vs After Temperature Comparison</div>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={beforeAfterData} barGap={2}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748B' }} />
                    <YAxis tick={{ fontSize: 12, fill: '#64748B' }} domain={['auto', 'auto']} unit="°C" />
                    <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 13 }} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="before" fill="#EF4444" name="Current Temp" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="after" fill="#15803D" name="Predicted Temp" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Zone Results Table */}
              <div className={s.chartCard}>
                <div className={s.chartTitle}>Zone-Level Simulation Results</div>
                <table className={s.table}>
                  <thead>
                    <tr>
                      <th>Zone</th>
                      <th>Name</th>
                      <th>Current</th>
                      <th>Predicted</th>
                      <th>Reduction</th>
                      <th>CO₂ Seq.</th>
                      <th>Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.zones
                      .sort((a, b) => b.temp_reduction - a.temp_reduction)
                      .map((z) => (
                        <tr key={z.zone_id}>
                          <td style={{ fontWeight: 600 }}>{z.zone_id}</td>
                          <td>{z.zone_name}</td>
                          <td>{z.current_temp}°C</td>
                          <td>{z.predicted_temp}°C</td>
                          <td className={s.tempDown}>-{z.temp_reduction}°C</td>
                          <td>{z.carbon_sequestration} t</td>
                          <td>{z.sustainability_score.toFixed(0)}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
