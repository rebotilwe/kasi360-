import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../api/AuthContext';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.logo}>Kasi360</h1>
        <p style={styles.sub}>Admin Dashboard</p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleLogin}>
          <input style={styles.input} type="email" placeholder="Admin email"
            value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input style={styles.input} type="password" placeholder="Password"
            value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button style={styles.btn} type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh', backgroundColor: '#1a1a2e',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 40,
    width: 380, boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  },
  logo: { fontSize: 32, fontWeight: 800, color: '#FF6B35', margin: '0 0 4px' },
  sub: { color: '#888', fontSize: 14, margin: '0 0 32px' },
  error: {
    backgroundColor: '#FEE2E2', color: '#EF4444', padding: 12,
    borderRadius: 8, fontSize: 14, marginBottom: 16,
  },
  input: {
    width: '100%', padding: 12, borderRadius: 8, border: '1px solid #ddd',
    fontSize: 15, marginBottom: 12, boxSizing: 'border-box', outline: 'none',
  },
  btn: {
    width: '100%', padding: 13, borderRadius: 8, border: 'none',
    backgroundColor: '#FF6B35', color: '#fff', fontSize: 16,
    fontWeight: 700, cursor: 'pointer',
  },
};

export default LoginPage;
