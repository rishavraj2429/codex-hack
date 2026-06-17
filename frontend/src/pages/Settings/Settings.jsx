import { useState } from 'react';
import s from './Settings.module.css';

export default function Settings() {
  const user = JSON.parse(localStorage.getItem('gaia_user') || '{}');
  const [notifications, setNotifications] = useState({
    email: true,
    reports: true,
    alerts: false,
  });

  const toggleNotif = (key) => {
    setNotifications((n) => ({ ...n, [key]: !n[key] }));
  };

  return (
    <div className={s.page}>
      <h1 className={s.pageTitle}>Settings</h1>
      <p className={s.pageSubtitle}>Manage your profile, organization, and platform preferences</p>

      <div className={s.sections}>
        {/* Profile */}
        <div className={s.card}>
          <div className={s.cardTitle}>Profile</div>
          <div className={s.formGrid}>
            <div className={s.formGroup}>
              <label className={s.formLabel}>Full Name</label>
              <input className={s.formInput} defaultValue={user.name || ''} />
            </div>
            <div className={s.formGroup}>
              <label className={s.formLabel}>Role</label>
              <input className={s.formInput} defaultValue={(user.role || 'planner').replace('_', ' ')} disabled style={{ textTransform: 'capitalize' }} />
            </div>
            <div className={`${s.formGroup} ${s.formGroupFull}`}>
              <label className={s.formLabel}>Email</label>
              <input className={s.formInput} defaultValue={user.email || ''} disabled />
            </div>
          </div>
        </div>

        {/* Organization */}
        <div className={s.card}>
          <div className={s.cardTitle}>Organization</div>
          <div className={s.formGrid}>
            <div className={s.formGroup}>
              <label className={s.formLabel}>Organization Name</label>
              <input className={s.formInput} defaultValue={user.organization || 'Municipal Corporation'} />
            </div>
            <div className={s.formGroup}>
              <label className={s.formLabel}>Department</label>
              <input className={s.formInput} defaultValue="Urban Planning" />
            </div>
            <div className={s.formGroup}>
              <label className={s.formLabel}>City</label>
              <input className={s.formInput} defaultValue="Hyderabad" />
            </div>
            <div className={s.formGroup}>
              <label className={s.formLabel}>State</label>
              <input className={s.formInput} defaultValue="Telangana" />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className={s.card}>
          <div className={s.cardTitle}>Notification Preferences</div>
          <div className={s.toggleRow}>
            <div>
              <div className={s.toggleLabel}>Email Notifications</div>
              <div className={s.toggleDesc}>Receive simulation results and reports via email</div>
            </div>
            <div
              className={`${s.toggle} ${notifications.email ? s.toggleActive : ''}`}
              onClick={() => toggleNotif('email')}
            >
              <div className={s.toggleKnob} />
            </div>
          </div>
          <div className={s.toggleRow}>
            <div>
              <div className={s.toggleLabel}>Weekly Reports</div>
              <div className={s.toggleDesc}>Get automated weekly climate assessment summaries</div>
            </div>
            <div
              className={`${s.toggle} ${notifications.reports ? s.toggleActive : ''}`}
              onClick={() => toggleNotif('reports')}
            >
              <div className={s.toggleKnob} />
            </div>
          </div>
          <div className={s.toggleRow}>
            <div>
              <div className={s.toggleLabel}>Heat Alerts</div>
              <div className={s.toggleDesc}>Real-time alerts when zones exceed temperature thresholds</div>
            </div>
            <div
              className={`${s.toggle} ${notifications.alerts ? s.toggleActive : ''}`}
              onClick={() => toggleNotif('alerts')}
            >
              <div className={s.toggleKnob} />
            </div>
          </div>
        </div>

        {/* API Keys */}
        <div className={s.card}>
          <div className={s.cardTitle}>API Configuration</div>
          <div className={s.formGroup}>
            <label className={s.formLabel}>API Key</label>
            <div className={s.apiKey}>gaia_pk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx</div>
          </div>
        </div>
      </div>
    </div>
  );
}
