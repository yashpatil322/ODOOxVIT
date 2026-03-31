import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
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
      <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>+12%</span> from last month
    </div>
  </motion.div>
);

const Dashboard = () => {
  const { user, company } = useAuth();
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });

  useEffect(() => {
    // Mock fetching stats
    const expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
    const userExpenses = user.role === 'Employee' ? expenses.filter(e => e.userId === user.id) : expenses;
    
    setStats({
      total: userExpenses.reduce((acc, curr) => acc + parseFloat(curr.amount), 0).toFixed(2),
      pending: userExpenses.filter(e => e.status === 'Pending').length,
      approved: userExpenses.filter(e => e.status === 'Approved').length,
      rejected: userExpenses.filter(e => e.status === 'Rejected').length
    });
  }, [user]);

  const currencySymbol = company?.baseCurrency === 'USD' ? '$' : company?.baseCurrency === 'EUR' ? '€' : company?.baseCurrency === 'INR' ? '₹' : company?.baseCurrency;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl text-bold">Welcome back, {user?.name}!</h1>
          <p className="text-muted">Here's what's happening with your expenses today.</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total Processed" 
          value={`${currencySymbol}${stats.total}`} 
          icon={<Wallet size={24} />} 
          color="var(--primary-accent)" 
          delay={0} 
        />
        <StatCard 
          title="Pending Approval" 
          value={stats.pending} 
          icon={<Clock size={24} />} 
          color="var(--warning)" 
          delay={0.1} 
        />
        <StatCard 
          title="Approved Claims" 
          value={stats.approved} 
          icon={<CheckCircle size={24} />} 
          color="var(--success)" 
          delay={0.2} 
        />
        <StatCard 
          title="Conversion Rate" 
          value="Live" 
          icon={<TrendingUp size={24} />} 
          color="#a855f7" 
          delay={0.3} 
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="card"
        >
          <h3 className="text-lg text-bold mb-4">Recent Activity</h3>
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between items-center border-b pb-4" style={{ borderColor: 'var(--border-color)' }}>
                <div className="flex items-center gap-4">
                  <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-full)', backgroundColor: 'var(--bg-surface-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Receipt size={18} color="var(--primary-accent)" />
                  </div>
                  <div>
                    <div className="text-sm text-medium">Team Lunch</div>
                    <div className="text-xs text-muted">Oct {10 - i}, 2023</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-bold">{currencySymbol}45.00</div>
                  <div className="badge badge-approved mt-1">Approved</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="card"
        >
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
            
            <div className="mt-4 p-4 rounded border-l-4" style={{ backgroundColor: 'rgba(88, 166, 255, 0.1)', borderColor: 'var(--primary-accent)' }}>
              <p className="text-xs">
                <strong>Smart OCR Active:</strong> Receipts uploaded via the Submit page will automatically extract vendor, date, and amount. Converts to {company?.baseCurrency || 'USD'} automatically using live rates.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};


export default Dashboard;
