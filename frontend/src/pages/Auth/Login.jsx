import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../utils/api';
import s from './Auth.module.css';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api.login(email, password);
      localStorage.setItem('gaia_token', data.access_token);
      localStorage.setItem('gaia_user', JSON.stringify(data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    if (role === 'admin') {
      setEmail('admin@gaia.gov.in');
      setPassword('admin123');
    } else {
      setEmail('planner@gaia.gov.in');
      setPassword('planner123');
    }
  };

  return (
    <div className={s.authPage}>
      <div className={s.authCard}>
        <div className={s.authBrand}>
          <div className={s.authLogo}>G</div>
          <span className={s.authName}>GAIA</span>
        </div>
        <h1 className={s.authTitle}>Sign in</h1>
        <p className={s.authSubtitle}>Access the climate intelligence platform</p>

        {error && <div className={s.authError}>{error}</div>}

        <form className={s.authForm} onSubmit={handleSubmit}>
          <div className={s.formGroup}>
            <label className={s.formLabel}>Email</label>
            <input
              className={s.formInput}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@organization.gov.in"
              required
            />
          </div>
          <div className={s.formGroup}>
            <label className={s.formLabel}>Password</label>
            <input
              className={s.formInput}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
          <button className={s.authSubmit} type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className={s.authFooter}>
          Don't have an account? <Link to="/register">Register</Link>
        </div>

        <div className={s.authDemo}>
          <div className={s.authDemoTitle}>Demo Credentials</div>
          <div>
            <button onClick={() => fillDemo('admin')} style={{ color: '#15803D', cursor: 'pointer', background: 'none', border: 'none', fontSize: '0.75rem', textDecoration: 'underline' }}>
              Admin: admin@gaia.gov.in / admin123
            </button>
          </div>
          <div>
            <button onClick={() => fillDemo('planner')} style={{ color: '#15803D', cursor: 'pointer', background: 'none', border: 'none', fontSize: '0.75rem', textDecoration: 'underline' }}>
              Planner: planner@gaia.gov.in / planner123
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
