import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../utils/api';
import s from './Auth.module.css';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'planner' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api.register(form.name, form.email, form.password, form.role);
      localStorage.setItem('gaia_token', data.access_token);
      localStorage.setItem('gaia_user', JSON.stringify(data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={s.authPage}>
      <div className={s.authCard}>
        <div className={s.authBrand}>
          <div className={s.authLogo}>G</div>
          <span className={s.authName}>GAIA</span>
        </div>
        <h1 className={s.authTitle}>Create account</h1>
        <p className={s.authSubtitle}>Join the climate intelligence platform</p>

        {error && <div className={s.authError}>{error}</div>}

        <form className={s.authForm} onSubmit={handleSubmit}>
          <div className={s.formGroup}>
            <label className={s.formLabel}>Full Name</label>
            <input className={s.formInput} type="text" value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="Dr. Jane Smith" required />
          </div>
          <div className={s.formGroup}>
            <label className={s.formLabel}>Email</label>
            <input className={s.formInput} type="email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="you@organization.gov.in" required />
          </div>
          <div className={s.formGroup}>
            <label className={s.formLabel}>Password</label>
            <input className={s.formInput} type="password" value={form.password} onChange={(e) => update('password', e.target.value)} placeholder="Minimum 6 characters" required minLength={6} />
          </div>
          <div className={s.formGroup}>
            <label className={s.formLabel}>Role</label>
            <select className={s.formSelect} value={form.role} onChange={(e) => update('role', e.target.value)}>
              <option value="planner">Urban Planner</option>
              <option value="government_officer">Government Officer</option>
              <option value="administrator">Administrator</option>
            </select>
          </div>
          <button className={s.authSubmit} type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className={s.authFooter}>
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
