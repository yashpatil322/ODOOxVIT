import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Building, Mail, Lock, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [country, setCountry] = useState('united states');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (isLogin) {
      const res = login(email, password);
      if (res !== true) {
        setError(res.err);
      } else {
        navigate('/');
      }
    } else {
      const res = await signup(email, password, companyName, country);
      if (res.err) {
        setError(res.err);
      } else {
        navigate('/');
      }
    }
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle at top left, #1f2937, #0d1117)' }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-panel" 
        style={{ width: '100%', maxWidth: '450px', padding: '2.5rem', margin: '1rem' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '60px', height: '60px', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--primary-accent)', color: 'white', marginBottom: '1rem', boxShadow: 'var(--shadow-glow)' }}>
            <Briefcase size={32} />
          </div>
          <h1 className="text-2xl text-bold">ReimbursePro</h1>
          <p className="text-muted mt-2">Manage expenses effortlessly</p>
        </div>

        {error && <div style={{ backgroundColor: 'var(--danger-light)', color: 'white', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {!isLogin && (
            <>
              <div style={{ position: 'relative' }}>
                <Building size={20} style={{ position: 'absolute', left: '1rem', top: '0.875rem', color: 'var(--text-secondary)' }} />
                <input type="text" placeholder="Company Name" style={{ paddingLeft: '3rem' }} value={companyName} onChange={e => setCompanyName(e.target.value)} required />
              </div>
              <div style={{ position: 'relative' }}>
                <Globe size={20} style={{ position: 'absolute', left: '1rem', top: '0.875rem', color: 'var(--text-secondary)' }} />
                <select style={{ paddingLeft: '3rem', appearance: 'none' }} value={country} onChange={e => setCountry(e.target.value)} required>
                  <option value="united states">United States</option>
                  <option value="united kingdom">United Kingdom</option>
                  <option value="india">India</option>
                  <option value="germany">Germany</option>
                  <option value="japan">Japan</option>
                </select>
              </div>
            </>
          )}

          <div style={{ position: 'relative' }}>
            <Mail size={20} style={{ position: 'absolute', left: '1rem', top: '0.875rem', color: 'var(--text-secondary)' }} />
            <input type="email" placeholder="Email Address (e.g., admin@company.com)" style={{ paddingLeft: '3rem' }} value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          
          <div style={{ position: 'relative' }}>
            <Lock size={20} style={{ position: 'absolute', left: '1rem', top: '0.875rem', color: 'var(--text-secondary)' }} />
            <input type="password" placeholder="Password" style={{ paddingLeft: '3rem' }} value={password} onChange={e => setPassword(e.target.value)} required />
          </div>

          <button type="submit" className="btn-primary w-full" disabled={loading} style={{ marginTop: '1rem', padding: '1rem' }}>
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem' }}>
          <span className="text-muted">
            {isLogin ? "Don't have a company yet? " : "Already registered? "}
          </span>
          <button type="button" onClick={() => setIsLogin(!isLogin)} style={{ color: 'var(--primary-accent)', fontWeight: 'bold' }}>
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </div>
        
        <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          <p>Demo accounts: admin@..., manager@..., employee@...</p>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;
