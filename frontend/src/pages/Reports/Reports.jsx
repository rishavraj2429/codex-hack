import { useState } from 'react';
import { api } from '../../utils/api';
import s from './Reports.module.css';

export default function Reports() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateReport = async () => {
    setLoading(true);
    try {
      const data = await api.getReport();
      setReport(data);
    } catch (err) {
      console.error('Failed to generate report:', err);
    } finally {
      setLoading(false);
    }
  };

  const printReport = () => {
    window.print();
  };

  return (
    <div className={s.page}>
      <h1 className={s.pageTitle}>Reports</h1>
      <p className={s.pageSubtitle}>Generate government-ready climate assessment reports</p>

      <div className={s.actions}>
        <button className={s.genBtn} onClick={generateReport} disabled={loading}>
          {loading ? 'Generating...' : '📄 Generate Report'}
        </button>
        {report && (
          <button className={s.genBtn} onClick={printReport} style={{ background: 'var(--color-primary)' }}>
            🖨️ Print / Save PDF
          </button>
        )}
      </div>

      {!report && !loading && (
        <div className={s.placeholder}>
          <div className={s.placeholderIcon}>📋</div>
          <div className={s.placeholderTitle}>No Report Generated Yet</div>
          <p>Click "Generate Report" to create a comprehensive climate assessment report.</p>
        </div>
      )}

      {loading && <div className={s.loading}>Generating report...</div>}

      {report && (
        <div className={s.report} id="report-content">
          <div className={s.reportTitle}>{report.title}</div>
          <div className={s.reportSubtitle}>
            Generated on {new Date(report.generated_at).toLocaleDateString('en-IN', {
              year: 'numeric', month: 'long', day: 'numeric',
            })}
          </div>

          {/* Executive Summary */}
          <div className={s.reportSection}>
            <div className={s.reportSectionTitle}>Executive Summary</div>
            <div className={s.statGrid}>
              <div className={s.statItem}>
                <div className={s.statLabel}>Total Zones</div>
                <div className={s.statValue}>{report.executive_summary.total_zones}</div>
              </div>
              <div className={s.statItem}>
                <div className={s.statLabel}>Avg Temperature</div>
                <div className={s.statValue}>{report.executive_summary.avg_temperature}°C</div>
              </div>
              <div className={s.statItem}>
                <div className={s.statLabel}>High Risk Zones</div>
                <div className={s.statValue}>{report.executive_summary.high_risk_zones}</div>
              </div>
              <div className={s.statItem}>
                <div className={s.statLabel}>Temp Range</div>
                <div className={s.statValue}>{report.executive_summary.min_temperature}–{report.executive_summary.max_temperature}°C</div>
              </div>
              <div className={s.statItem}>
                <div className={s.statLabel}>Avg Green Cover</div>
                <div className={s.statValue}>{report.executive_summary.avg_green_cover}%</div>
              </div>
              <div className={s.statItem}>
                <div className={s.statLabel}>Avg Heat Risk</div>
                <div className={s.statValue}>{report.executive_summary.avg_heat_risk}</div>
              </div>
            </div>
          </div>

          {/* Simulation Results */}
          <div className={s.reportSection}>
            <div className={s.reportSectionTitle}>Simulation Results</div>
            <p style={{ fontSize: '0.875rem', color: '#64748B', marginBottom: '1rem' }}>
              Simulation with {report.simulation_results.intervention_applied.tree_increase_pct}% tree increase,
              {' '}{report.simulation_results.intervention_applied.green_space_pct}% green space expansion,
              {' '}{report.simulation_results.intervention_applied.roof_greening_pct}% roof greening,
              and {report.simulation_results.intervention_applied.cool_roof_pct}% cool roof adoption.
            </p>
            <div className={s.statGrid}>
              <div className={s.statItem}>
                <div className={s.statLabel}>Avg Temp Reduction</div>
                <div className={s.statValue} style={{ color: '#15803D' }}>
                  {report.simulation_results.avg_temp_reduction.toFixed(1)}°C
                </div>
              </div>
              <div className={s.statItem}>
                <div className={s.statLabel}>Total CO₂ Sequestration</div>
                <div className={s.statValue} style={{ color: '#2563EB' }}>
                  {report.simulation_results.total_carbon_sequestration} t/yr
                </div>
              </div>
            </div>
          </div>

          {/* Priority Zones */}
          <div className={s.reportSection}>
            <div className={s.reportSectionTitle}>Priority Investment Zones</div>
            <table className={s.prioTable}>
              <thead>
                <tr>
                  <th>Zone</th>
                  <th>Name</th>
                  <th>Temp Reduction</th>
                  <th>CO₂ Sequestered</th>
                  <th>Cost Efficiency</th>
                </tr>
              </thead>
              <tbody>
                {report.recommendations.top_priority_zones.map((z) => (
                  <tr key={z.zone_id}>
                    <td style={{ fontWeight: 600 }}>{z.zone_id}</td>
                    <td>{z.zone_name}</td>
                    <td style={{ color: '#15803D', fontWeight: 600 }}>{z.temp_reduction.toFixed(1)}°C</td>
                    <td>{z.carbon_sequestration.toFixed(1)} t/yr</td>
                    <td>{z.cost_efficiency.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* SDG Impact */}
          <div className={s.reportSection}>
            <div className={s.reportSectionTitle}>SDG Impact Assessment</div>
            <div className={s.sdgItem}>
              <div className={s.sdgItemTitle}>SDG 11 — Sustainable Cities and Communities</div>
              <p className={s.sdgItemText}>{report.sdg_impact.sdg_11}</p>
            </div>
            <div className={s.sdgItem}>
              <div className={s.sdgItemTitle}>SDG 13 — Climate Action</div>
              <p className={s.sdgItemText}>{report.sdg_impact.sdg_13}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
