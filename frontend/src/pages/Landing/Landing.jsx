import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import s from './Landing.module.css';

const HEAT_COLORS = [
  '#3B82F6', '#60A5FA', '#93C5FD', '#FCD34D',
  '#FBBF24', '#F59E0B', '#EF4444', '#DC2626',
  '#B91C1C', '#15803D', '#22C55E', '#86EFAC',
];

function HeroVisualization() {
  const cells = Array.from({ length: 32 }, (_, i) => {
    const color = HEAT_COLORS[Math.floor(Math.random() * HEAT_COLORS.length)];
    const opacity = 0.3 + Math.random() * 0.7;
    const delay = Math.random() * 3;
    return (
      <div
        key={i}
        className={s.heatCell}
        style={{
          background: color,
          opacity,
          animation: `pulse ${2 + Math.random() * 3}s ease-in-out ${delay}s infinite`,
        }}
      />
    );
  });

  return (
    <div className={s.heroVis}>
      <div className={s.heroVisCanvas}>
        <div className={s.heroVisOverlay}>{cells}</div>
        <div className={s.heroVisLabel}>
          ● Live Urban Heat Simulation — 20 Zones
        </div>
      </div>
    </div>
  );
}

export default function Landing() {
  return (
    <div className={s.landing}>
      {/* Navigation */}
      <nav className={s.nav}>
        <div className={s.navBrand}>
          <div className={s.navLogo}>G</div>
          <span className={s.navName}>GAIA</span>
          <span className={s.navTag}>v1.0</span>
        </div>
        <div className={s.navLinks}>
          <a href="#problem" className={s.navLink}>Problem</a>
          <a href="#how" className={s.navLink}>How It Works</a>
          <a href="#benefits" className={s.navLink}>Benefits</a>
          <Link to="/login" className={s.navCta}>Launch Platform</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className={s.hero}>
        <div className={s.heroBadge}>
          <span className={s.heroBadgeDot}></span>
          AI-Powered Urban Climate Intelligence
        </div>
        <h1 className={s.heroTitle}>
          Predict Climate Impact<br />
          <span className={s.heroTitleAccent}>Before Cities Invest.</span>
        </h1>
        <p className={s.heroSubtitle}>
          GAIA helps governments simulate urban climate interventions and make
          data-driven sustainability decisions. Reduce urban heat, increase green
          cover, and optimize climate budgets with AI.
        </p>
        <div className={s.heroCtas}>
          <Link to="/login" className={s.btnPrimary}>
            Launch Platform →
          </Link>
          <Link to="/login" className={s.btnSecondary}>
            View Demo
          </Link>
        </div>
        <HeroVisualization />
      </section>

      {/* Problem */}
      <section id="problem" className={`${s.section} ${s.sectionAlt}`}>
        <div className={s.sectionLabel}>The Problem</div>
        <h2 className={s.sectionTitle}>Cities Are Getting Hotter</h2>
        <p className={s.sectionDesc}>
          Rapid urbanization is creating dangerous heat islands. Municipalities
          spend crores on interventions without predicting their impact.
        </p>
        <div className={s.problemGrid}>
          <div className={s.problemCard}>
            <div className={s.problemIcon} style={{ background: '#FEF2F2', color: '#DC2626' }}>🌡️</div>
            <div className={s.problemCardTitle}>Urban Heat Islands</div>
            <p className={s.problemCardText}>
              Cities can be 3-8°C warmer than surrounding areas due to concrete,
              asphalt, and reduced vegetation.
            </p>
          </div>
          <div className={s.problemCard}>
            <div className={s.problemIcon} style={{ background: '#FFF7ED', color: '#EA580C' }}>📈</div>
            <div className={s.problemCardTitle}>Rising Temperatures</div>
            <p className={s.problemCardText}>
              Average urban temperatures have increased 1.5°C in the last decade,
              with peak summers reaching 48°C in Indian cities.
            </p>
          </div>
          <div className={s.problemCard}>
            <div className={s.problemIcon} style={{ background: '#FFFBEB', color: '#D97706' }}>💰</div>
            <div className={s.problemCardTitle}>Inefficient Spending</div>
            <p className={s.problemCardText}>
              Billions allocated to green initiatives without data-driven
              prioritization or measurable impact assessment.
            </p>
          </div>
          <div className={s.problemCard}>
            <div className={s.problemIcon} style={{ background: '#EFF6FF', color: '#2563EB' }}>🎯</div>
            <div className={s.problemCardTitle}>No Predictive Planning</div>
            <p className={s.problemCardText}>
              Planners lack simulation tools to test interventions before
              committing resources and budgets.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how" className={s.section}>
        <div className={s.sectionLabel}>How It Works</div>
        <h2 className={s.sectionTitle}>Three Steps to Smarter Climate Action</h2>
        <p className={s.sectionDesc}>
          GAIA transforms complex climate data into actionable decisions.
        </p>
        <div className={s.stepsRow}>
          <div className={s.step}>
            <div className={s.stepNumber}>1</div>
            <h3 className={s.stepTitle}>Analyze City Data</h3>
            <p className={s.stepDesc}>
              Upload or connect real-time urban data — temperature, green cover,
              building density, and population across zones.
            </p>
            <div className={s.stepConnector}></div>
          </div>
          <div className={s.step}>
            <div className={s.stepNumber}>2</div>
            <h3 className={s.stepTitle}>Simulate Interventions</h3>
            <p className={s.stepDesc}>
              Choose from tree plantation, green spaces, cool roofs, and more.
              Adjust parameters and run AI-powered simulations.
            </p>
            <div className={s.stepConnector}></div>
          </div>
          <div className={s.step}>
            <div className={s.stepNumber}>3</div>
            <h3 className={s.stepTitle}>Predict Impact</h3>
            <p className={s.stepDesc}>
              Get predicted temperature reduction, carbon sequestration, and
              cost-efficiency scores to guide investment decisions.
            </p>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section id="benefits" className={`${s.section} ${s.sectionAlt}`}>
        <div className={s.sectionLabel}>Key Benefits</div>
        <h2 className={s.sectionTitle}>Why Choose GAIA</h2>
        <div className={s.benefitsGrid}>
          <div className={s.benefitCard}>
            <div className={s.benefitIcon}>🤖</div>
            <div className={s.benefitTitle}>AI-Powered Forecasting</div>
            <p className={s.benefitText}>XGBoost models trained on urban climate data for accurate predictions.</p>
          </div>
          <div className={s.benefitCard}>
            <div className={s.benefitIcon}>🌡️</div>
            <div className={s.benefitTitle}>Urban Heat Reduction</div>
            <p className={s.benefitText}>Identify hotspots and simulate cooling interventions zone by zone.</p>
          </div>
          <div className={s.benefitCard}>
            <div className={s.benefitIcon}>🌳</div>
            <div className={s.benefitTitle}>Carbon Impact Analysis</div>
            <p className={s.benefitText}>Quantify CO₂ sequestration potential of every green intervention.</p>
          </div>
          <div className={s.benefitCard}>
            <div className={s.benefitIcon}>📊</div>
            <div className={s.benefitTitle}>Resource Optimization</div>
            <p className={s.benefitText}>Rank zones by impact-per-investment to maximize budget efficiency.</p>
          </div>
          <div className={s.benefitCard}>
            <div className={s.benefitIcon}>📋</div>
            <div className={s.benefitTitle}>Evidence-Based Planning</div>
            <p className={s.benefitText}>Generate government-ready reports with data-backed recommendations.</p>
          </div>
        </div>
      </section>

      {/* SDG */}
      <section className={s.section}>
        <div className={s.sectionLabel}>Global Alignment</div>
        <h2 className={s.sectionTitle}>UN Sustainable Development Goals</h2>
        <p className={s.sectionDesc}>
          GAIA directly contributes to two critical SDGs for urban sustainability.
        </p>
        <div className={s.sdgRow}>
          <div className={s.sdgCard}>
            <div className={`${s.sdgBadge} ${s.sdg11}`}>SDG 11</div>
            <div>
              <div className={s.sdgTitle}>Sustainable Cities & Communities</div>
              <p className={s.sdgText}>
                Supporting Target 11.6 (reduce environmental impact of cities) and
                Target 11.b (implement climate adaptation policies).
              </p>
            </div>
          </div>
          <div className={s.sdgCard}>
            <div className={`${s.sdgBadge} ${s.sdg13}`}>SDG 13</div>
            <div>
              <div className={s.sdgTitle}>Climate Action</div>
              <p className={s.sdgText}>
                Supporting Target 13.1 (strengthen resilience to climate hazards) and
                Target 13.2 (integrate climate measures into national planning).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={s.footer}>
        <div className={s.footerInner}>
          <div>
            <div className={s.footerBrand}>
              <div className={s.navLogo}>G</div>
              <span className={s.footerName}>GAIA</span>
            </div>
            <p className={s.footerCopy}>
              © 2025 GAIA Platform. Built for smarter cities.
            </p>
          </div>
          <div className={s.footerLinks}>
            <a href="#problem" className={s.footerLink}>About</a>
            <a href="#how" className={s.footerLink}>How It Works</a>
            <a href="#benefits" className={s.footerLink}>Features</a>
            <Link to="/login" className={s.footerLink}>Launch</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
