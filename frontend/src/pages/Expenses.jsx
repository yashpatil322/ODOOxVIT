import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Image, Upload, Trash2, Edit3, X, Receipt } from 'lucide-react';

const ExpenseModal = ({ isOpen, onClose, onSubmit, companyCurrency }) => {
  const [formData, setFormData] = useState({ amount: '', currency: 'USD', category: 'Meals', description: '', date: '' });
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);

  const handleScan = () => {
    setIsScanning(true);
    setScanComplete(false);
    
    // Simulate OCR delay
    setTimeout(() => {
      setFormData({
        amount: '45.50',
        currency: 'USD',
        category: 'Meals',
        description: 'Team Lunch at Starbucks',
        date: new Date().toISOString().split('T')[0]
      });
      setIsScanning(false);
      setScanComplete(true);
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, backdropFilter: 'blur(4px)' }}>
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="card" 
        style={{ width: '100%', maxWidth: '500px', backgroundColor: 'var(--bg-surface-elevated)' }}
      >
        <div className="flex justify-between items-center mb-6 border-b pb-4" style={{ borderColor: 'var(--border-color)' }}>
          <h2 className="text-xl text-bold">Submit Expense</h2>
          <button onClick={onClose}><X size={24} color="var(--text-secondary)" /></button>
        </div>

        <div className="flex gap-4 mb-6">
          <div className="w-full">
            <label className="text-sm text-muted mb-2 block">Upload Receipt (OCR Auto-fill)</label>
            <div 
              onClick={handleScan}
              style={{ border: '2px dashed var(--border-color)', borderRadius: 'var(--radius-md)', padding: '2rem', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', backgroundColor: scanComplete ? 'rgba(35, 134, 54, 0.1)' : 'transparent', borderColor: scanComplete ? 'var(--success)' : 'var(--border-color)' }}
              onMouseOver={e => !scanComplete && (e.currentTarget.style.borderColor = 'var(--primary-accent)')}
              onMouseOut={e => !scanComplete && (e.currentTarget.style.borderColor = 'var(--border-color)')}
            >
              {isScanning ? (
                <div className="flex flex-col items-center">
                  <div style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid var(--primary-accent)', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }}></div>
                  <style>{"@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }"}</style>
                  <p className="mt-2 text-sm text-primary-accent">Scanning receipt...</p>
                </div>
              ) : scanComplete ? (
                <div className="flex flex-col items-center text-success">
                  <Image size={32} />
                  <p className="mt-2 text-sm">Receipt Scanned Successfully!</p>
                </div>
              ) : (
                <div className="flex flex-col items-center text-muted">
                  <Upload size={32} />
                  <p className="mt-2 text-sm">Click to upload or drag & drop</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }}>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-sm text-muted block mb-1">Amount</label>
              <input type="number" step="0.01" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} required />
            </div>
            <div>
              <label className="text-sm text-muted block mb-1">Currency</label>
              <select value={formData.currency} onChange={e => setFormData({...formData, currency: e.target.value})} required>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="INR">INR</option>
                <option value="JPY">JPY</option>
              </select>
            </div>
          </div>
          
          <div className="mb-4">
            <label className="text-sm text-muted block mb-1">Date</label>
            <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required />
          </div>

          <div className="mb-4">
            <label className="text-sm text-muted block mb-1">Category</label>
            <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} required>
              <option value="Meals">Meals</option>
              <option value="Travel">Travel</option>
              <option value="Office">Office Supplies</option>
              <option value="Accommodation">Accommodation</option>
            </select>
          </div>

          <div className="mb-6">
            <label className="text-sm text-muted block mb-1">Description</label>
            <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={3} required />
          </div>

          <div className="flex justify-end gap-2">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary">Submit for Approval</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const Expenses = () => {
  const { user, company } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const list = JSON.parse(localStorage.getItem('expenses') || '[]');
    setExpenses(list.filter(e => e.userId === user.id).sort((a,b) => new Date(b.date) - new Date(a.date)));
  }, [user]);

  const handleSubmit = (formData) => {
    const allExpenses = JSON.parse(localStorage.getItem('expenses') || '[]');
    
    // Convert to base currency via Mock API
    const baseCurrency = company?.baseCurrency || 'USD';
    let finalAmount = parseFloat(formData.amount);
    
    // Very simple mock conversion
    if (formData.currency !== baseCurrency) {
      if (formData.currency === 'EUR' && baseCurrency === 'USD') finalAmount = finalAmount * 1.1;
      if (formData.currency === 'INR' && baseCurrency === 'USD') finalAmount = finalAmount * 0.012;
    }

    const newExpense = {
      id: Date.now().toString(),
      userId: user.id,
      userName: user.name,
      ...formData,
      baseAmount: finalAmount.toFixed(2),
      baseCurrency,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };
    
    const updated = [newExpense, ...allExpenses];
    localStorage.setItem('expenses', JSON.stringify(updated));
    setExpenses(updated.filter(e => e.userId === user.id));
    setIsModalOpen(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl text-bold">My Expenses</h1>
          <p className="text-muted">Track and manage your submitted claims.</p>
        </div>
        <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={20} />
          New Expense
        </button>
      </div>

      <div className="card w-full">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th>Original Amount</th>
                <th>Amount ({company?.baseCurrency || 'USD'})</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center" style={{ padding: '3rem' }}>
                    <div className="flex flex-col items-center justify-center text-muted">
                      <Receipt size={48} style={{ opacity: 0.5, marginBottom: '1rem' }} />
                      <p>No expenses found. Submit your first expense!</p>
                    </div>
                  </td>
                </tr>
              ) : (
                expenses.map(e => (
                  <motion.tr 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    key={e.id}
                  >
                    <td>{e.date}</td>
                    <td><span className="text-medium">{e.description}</span></td>
                    <td>{e.category}</td>
                    <td>{e.amount} {e.currency}</td>
                    <td className="text-bold">{e.baseAmount}</td>
                    <td>
                      <span className={`badge badge-${e.status.toLowerCase()}`}>{e.status}</span>
                    </td>
                    <td>
                      <button className="text-primary-accent p-1" disabled={e.status !== 'Pending'} style={{ opacity: e.status !== 'Pending' ? 0.5 : 1 }}>
                        <Edit3 size={16} />
                      </button>
                      <button className="text-danger p-1 ml-2" disabled={e.status !== 'Pending'} style={{ opacity: e.status !== 'Pending' ? 0.5 : 1 }}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <ExpenseModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            onSubmit={handleSubmit}
            companyCurrency={company?.baseCurrency} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};


export default Expenses;
