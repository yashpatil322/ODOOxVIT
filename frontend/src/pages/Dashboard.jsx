import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchAPI } from '../utils/api';
import { motion } from 'framer-motion';
import { Wallet, TrendingUp, Clock, CheckCircle, Receipt } from 'lucide-react';

const StatCard = ({ title, value, icon, color, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    className="card flex flex-col justify-between"
    style={{ borderLeft: `4px solid ${color}`, minHeight: '140px' }}
  >
    <div className="flex justify-between items-start">
      <div>
        <h3 className="text-muted text-sm text-medium uppercase tracking-wider">{title}</h3>
        <p className="text-2xl text-bold mt-2">{value}</p>
      </div>
      <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: `${color}15`, color: color }}>
        {icon}
      </div>
    </div>
    <div className="text-xs text-muted mt-4">
      <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>Live Data</span>
    </div>
  </motion.div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const company = user?.company;
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [recentExpenses, setRecentExpenses] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const expenses = await fetchAPI('/expenses/');
        
        let pending = 0;
        let approved = 0;
        let rejected = 0;
        let totalVal = 0;

        expenses.forEach(e => {
          if (e.status === 'Pending') pending++;
          if (e.status === 'Approved') approved++;
          if (e.status === 'Rejected') rejected++;
          if (e.base_amount) totalVal += parseFloat(e.base_amount);
        });

        setStats({
          total: totalVal.toFixed(2),
          pending,
          approved,
          rejected
        });

        // Get 3 most recent
        setRecentExpenses(expenses.slice(0, 3));
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      }
    };
    fetchData();
  }, []);

  const currencySymbol = company?.base_currency === 'USD' ? '$' : company?.base_currency === 'EUR' ? '€' : company?.base_currency === 'INR' ? '₹' : company?.base_currency || 'USD';

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl text-bold">Welcome back, {user?.username}!</h1>
          <p className="text-muted">Here's what's happening with your expenses today.</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Processed" value={`${currencySymbol}${stats.total}`} icon={<Wallet size={24} />} color="var(--primary-accent)" delay={0} />
        <StatCard title="Pending Approval" value={stats.pending} icon={<Clock size={24} />} color="var(--warning)" delay={0.1} />
        <StatCard title="Approved Claims" value={stats.approved} icon={<CheckCircle size={24} />} color="var(--success)" delay={0.2} />
        <StatCard title="Conversion Rate" value="Live API" icon={<TrendingUp size={24} />} color="#6366f1" delay={0.3} />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.4 }} className="card">
          <h3 className="text-lg text-bold mb-4">Recent Activity</h3>
          <div className="flex flex-col gap-4">
            {recentExpenses.length === 0 ? <div className="text-muted text-sm py-4">No recent activity</div> : recentExpenses.map((exp) => (
              <div key={exp.id} className="flex justify-between items-center border-b pb-4" style={{ borderColor: 'var(--border-color)' }}>
                <div className="flex items-center gap-4">
                  <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-full)', backgroundColor: 'var(--bg-surface-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Receipt size={18} color="var(--primary-accent)" />
                  </div>
                  <div>
                    <div className="text-sm text-medium">{exp.description}</div>
                    <div className="text-xs text-muted">{new Date(exp.date).toLocaleDateString()}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-bold">{currencySymbol}{exp.base_amount}</div>
                  <div className={`badge badge-${exp.status.toLowerCase()} mt-1`}>{exp.status}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.5 }} className="card">
          <h3 className="text-lg text-bold mb-4">Quick Limits & Policies</h3>
          <div className="flex flex-col gap-4 text-sm mt-4">
            <div className="flex justify-between items-center p-3 rounded" style={{ backgroundColor: 'var(--bg-surface-elevated)' }}>
              <span>Daily Meal Allowance</span>
              <span className="text-bold">{currencySymbol}50.00</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded" style={{ backgroundColor: 'var(--bg-surface-elevated)' }}>
              <span>Travel & Transport</span>
              <span className="text-bold">{currencySymbol}200.00 / month</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded" style={{ backgroundColor: 'var(--bg-surface-elevated)' }}>
              <span>Tech Equipment</span>
              <span className="text-bold">{currencySymbol}500.00 / yr</span>
            </div>
            
            <div className="mt-4 p-4 rounded border-l-4" style={{ backgroundColor: 'var(--primary-accent)', opacity: 0.9, color: 'white' }}>
              <p className="text-sm text-bold">Smart Policies Enforced</p>
              <p className="text-xs mt-1" style={{opacity: 0.9}}>
                All receipts convert against Live API. Ensure to specify the exactly designated foreign currency during submissions.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
