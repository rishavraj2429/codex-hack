import { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import s from './Recommendations.module.css';

export default function Recommendations() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const result = await api.getRecommendations(500);
        setData(result);
      } catch (err) {
        console.error('Failed to load recommendations:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div className={s.loading}>Generating AI recommendations...</div>;

  const recs = data?.recommendations || [];

  return (
    <div className={s.page}>
      <h1 className={s.pageTitle}>AI Recommendations</h1>
      <p className={s.pageSubtitle}>
        Prioritized investment recommendations ranked by impact-per-investment score
      </p>

      <div className={s.content}>
        <div className={s.card}>
          <div className={s.cardTitle}>Priority Zones — Ranked by Cost Efficiency</div>
          <div className={s.recList}>
            {recs.map((rec) => (
              <div key={rec.zone_id} className={s.recItem}>
                <div className={`${s.recRank} ${
                  rec.priority_rank === 1 ? s.rank1 :
                  rec.priority_rank === 2 ? s.rank2 :
                  rec.priority_rank === 3 ? s.rank3 : s.rankOther
                }`}>
                  #{rec.priority_rank}
                </div>
                <div className={s.recBody}>
                  <div className={s.recZone}>
                    {rec.zone_name}
                    <span className={s.recZoneId}>{rec.zone_id}</span>
                  </div>
                  <p className={s.recRationale}>{rec.rationale}</p>
                  <div className={s.recMetrics}>
                    <span className={s.recMetric}>
                      Temp Reduction: <span className={s.recMetricValue}>{rec.temp_reduction_potential.toFixed(1)}°C</span>
                    </span>
                    <span className={s.recMetric}>
                      Carbon: <span className={s.recMetricValue}>{rec.carbon_benefit.toFixed(1)} t CO₂/yr</span>
                    </span>
                    <span className={s.recMetric}>
                      Impact Score: <span className={s.recMetricValue}>{rec.impact_score.toFixed(1)}</span>
                    </span>
                  </div>
                </div>
                <div className={s.recStats}>
                  <div className={s.recBudget}>{rec.recommended_budget_pct.toFixed(0)}%</div>
                  <div className={s.recBudgetLabel}>of budget</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
