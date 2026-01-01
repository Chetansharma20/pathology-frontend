
import React, { useState } from 'react';
import { Stethoscope, ShieldCheck, Lock } from 'lucide-react';
import Input from '../../components/ui/Input';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ user: '', pass: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Updated styling constants to match the design system
  const styles = {
    background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-primary) 100%)',
    overlay1: 'radial-gradient(circle at 30% 40%, rgba(99,102,241,0.1), transparent 50%)',
    overlay2: 'radial-gradient(circle at 70% 60%, rgba(168,85,247,0.1), transparent 50%)',
    card: {
      backgroundColor: 'var(--bg-modal)',
      backdropFilter: 'blur(16px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: 'var(--shadow-xl)'
    },
    iconBg: 'linear-gradient(135deg, var(--accent-indigo), var(--accent-purple))',
    button: {
      backgroundColor: 'var(--accent-indigo)',
      color: 'var(--text-inverse)'
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(credentials.user, credentials.pass);
      if (result.success) {
        // Navigation is handled by the useEffect/logic in the parent or AuthContext return, 
        // but strictly speaking, we might want to navigate here if AuthContext doesn't auto-redirect.
        // Based on previous code, simple navigation happens after login:
        navigate(result.user.role === 'Admin' ? '/dashboard' : '/patients');
      } else {
        setError(result.message || 'Login failed');
      }
    } catch (err) {
      setError('An unexpected error occurred.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 relative overflow-hidden" style={{ background: styles.background }}>
      <div className="absolute inset-0 opacity-50" style={{ background: styles.overlay1 }}></div>
      <div className="absolute inset-0 opacity-30" style={{ background: styles.overlay2 }}></div>

      <div className="relative p-10 rounded-2xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-1000" style={styles.card}>
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-xl" style={{ background: styles.iconBg, color: 'var(--text-inverse)' }}>
            <Stethoscope size={40} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Welcome Back
          </h1>
          <p className="text-base mt-3 font-medium" style={{ color: 'var(--text-secondary)' }}>
            Sign in to DIGITOS Pathology Lab
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm font-medium border border-red-100">
              {error}
            </div>
          )}

          <Input
            label="Username"
            icon={ShieldCheck}
            placeholder="admin or staff"
            value={credentials.user}
            onChange={e => setCredentials({ ...credentials, user: e.target.value })}
          />
          <Input
            label="Password"
            type="password"
            icon={Lock}
            placeholder="••••••••"
            value={credentials.pass}
            onChange={e => setCredentials({ ...credentials, pass: e.target.value })}
          />
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-6 rounded-lg font-semibold text-base transition-colors shadow-sm ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            style={styles.button}
          >
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <div className="text-xs font-medium uppercase tracking-wide px-4 py-2 rounded-lg inline-block" style={{ color: 'var(--text-muted)', backgroundColor: 'var(--bg-input)' }}>
            admin/admin • staff/staff
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
