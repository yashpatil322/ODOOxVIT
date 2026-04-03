import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchAPI } from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Image, Upload, Trash2, Edit3, X, Receipt } from 'lucide-react';

const ExpenseModal = ({ isOpen, onClose, onSubmit, companyCurrency }) => {
  const [formData, setFormData] = useState({ amount: '', currency: 'USD', category: 'Meals', description: '', date: '' });
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);

  const handleScan = () => {
    setIsScanning(true);
    setScanComplete(false);
    
    // Simulate OCR payload handling
    setTimeout(() => {
      setFormData({
        amount: '45.50',
        currency: 'USD',
        category: 'Meals',
        description: 'Auto-extracted: Starbucks',
        date: new Date().toISOString().split('T')[0]
      });
      setIsScanning(false);
      setScanComplete(true);
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="card" style={{ width: '100%', maxWidth: '500px' }}>
        <div className="flex justify-between items-center mb-6 border-b pb-4" style={{ borderColor: 'var(--border-color)' }}>
          <h2 className="text-xl text-bold">Submit New Claim</h2>
          <button onClick={onClose}><X size={24} color="var(--text-secondary)" /></button>
        </div>

        <div className="flex gap-4 mb-6">
          <div className="w-full">
            <label className="text-sm text-bold mb-2 block">Upload Receipt (OCR Analysis)</label>
            <div onClick={handleScan} style={{ border: '2px dashed var(--border-color)', borderRadius: 'var(--radius-md)', padding: '2rem', textAlign: 'center', cursor: 'pointer', backgroundColor: scanComplete ? 'var(--success-light)' : 'transparent', borderColor: scanComplete ? 'var(--success)' : 'var(--border-color)' }}>
              {isScanning ? (
                <div className="flex flex-col items-center">
                  <div style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid var(--primary-accent)', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }}></div>
                  <style>{"@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }"}</style>
                  <p className="mt-2 text-sm text-primary-accent">Extracting context...</p>
                </div>
              ) : scanComplete ? (
                <div className="flex flex-col items-center text-success">
                  <Image size={32} />
                  <p className="mt-2 text-sm text-bold">Parameters Auto-Mapped!</p>
                </div>
              ) : (
                <div className="flex flex-col items-center text-muted">
                  <Upload size={32} />
                  <p className="mt-2 text-sm">Drag file to process variables automatically</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }}>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-sm text-bold block mb-1">Amount</label>
              <input type="number" step="0.01" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} required />
            </div>
            <div>
              <label className="text-sm text-bold block mb-1">Currency Formatted</label>
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
            <label className="text-sm text-bold block mb-1">Date Exchanged</label>
            <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required />
          </div>

          <div className="mb-4">
            <label className="text-sm text-bold block mb-1">Cost Classification</label>
            <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} required>
              <option value="Meals">Meals</option>
              <option value="Travel">Travel</option>
              <option value="Office">Office Supplies</option>
              <option value="Accommodation">Accommodation</option>
            </select>
          </div>

          <div className="mb-6">
            <label className="text-sm text-bold block mb-1">Description context</label>
            <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={3} required />
          </div>

          <div className="flex justify-end gap-2">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary">Provision API Pipeline</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const Expenses = () => {
  const { user } = useAuth();
  const company = user?.company;
  const [expenses, setExpenses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const data = await fetchAPI('/expenses/');
      setExpenses(data);
    } catch(err) {
      console.error(err);
    }
  }

  const handleSubmit = async (formData) => {
    try {
      await fetchAPI('/expenses/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      setIsModalOpen(false);
      fetchExpenses(); // Re-fetch to see database response mapping base_amount directly
    } catch(err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl text-bold">My Expenses</h1>
          <p className="text-muted">Lifecycle logs of all hierarchical submissions natively recorded.</p>
        </div>
        <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={20} /> Submit Claim
        </button>
      </div>

      <div className="card w-full p-0">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Context</th>
                <th>Classification</th>
                <th>Original</th>
                <th>Converted ({company?.base_currency || 'USD'})</th>
                <th>Approval State</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center" style={{ padding: '3rem' }}>
                    <div className="flex flex-col items-center justify-center text-muted">
                      <Receipt size={48} style={{ opacity: 0.5, marginBottom: '1rem' }} />
                      <p>You have zero database submissions logged.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                expenses.map(e => (
                  <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={e.id}>
                    <td>{e.date}</td>
                    <td><span className="text-medium">{e.description}</span></td>
                    <td>{e.category}</td>
                    <td>{e.amount} {e.currency}</td>
                    <td className="text-bold">{e.base_amount}</td>
                    <td>
                      <span className={`badge badge-${e.status.toLowerCase()}`}>{e.status}</span>
                    </td>
                    <td>
                       <button className="text-primary-accent" disabled={e.status !== 'Pending'} style={{ opacity: e.status !== 'Pending' ? 0.3 : 1 }}>
                        <Edit3 size={16} />
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
        {isModalOpen && <ExpenseModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleSubmit} companyCurrency={company?.base_currency} />}
      </AnimatePresence>
    </div>
  );
};

export default Expenses;
