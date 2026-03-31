import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Check, X, ShieldAlert } from 'lucide-react';

const Approvals = () => {
  const { user, company } = useAuth();
  const [pendingExpenses, setPendingExpenses] = useState([]);
  const [processed, setProcessed] = useState([]);
  const [isProcessing, setIsProcessing] = useState(null);

  useEffect(() => {
    const list = JSON.parse(localStorage.getItem('expenses') || '[]');
    // Managers/Admins see all pending expenses that aren't their own
    setPendingExpenses(list.filter(e => e.status === 'Pending' && e.userId !== user?.id));
    setProcessed(list.filter(e => e.status !== 'Pending' && e.userId !== user?.id).slice(0, 10)); // recent 10
  }, [user]);

  const handleAction = (id, action) => {
    setIsProcessing(id);
    
    setTimeout(() => {
      const allExpenses = JSON.parse(localStorage.getItem('expenses') || '[]');
      const updated = allExpenses.map(e => e.id === id ? { ...e, status: action, approvedBy: user.name, actionDate: new Date().toISOString() } : e);
      
      localStorage.setItem('expenses', JSON.stringify(updated));
      setPendingExpenses(updated.filter(e => e.status === 'Pending' && e.userId !== user?.id));
      setProcessed(updated.filter(e => e.status !== 'Pending' && e.userId !== user?.id).slice(0, 10));
      setIsProcessing(null);
    }, 600); // Simulate API call network delay
  };

  if (user?.role === 'Employee') {
    return (
      <div className="flex flex-col items-center justify-center p-10 text-center text-muted" style={{ height: '60vh' }}>
        <ShieldAlert size={64} style={{ marginBottom: '1rem', color: 'var(--danger)' }} />
        <h2 className="text-2xl text-bold text-primary mb-2">Access Restricted</h2>
        <p>You need Manager or Admin privileges to view this page.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl text-bold">Approval Workflow</h1>
          <p className="text-muted">Review and process team expense claims in {company?.baseCurrency || 'USD'}.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 mb-8">
        <div className="card w-full">
          <h2 className="text-lg text-bold mb-4 flex items-center gap-2">
            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, borderRadius: '50%', backgroundColor: 'var(--warning)', color: '#fff', fontSize: '0.75rem' }}>{pendingExpenses.length}</span>
            Pending Review
          </h2>
          
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Employee Name</th>
                  <th>Date & Category</th>
                  <th>Description</th>
                  <th>Original Amount</th>
                  <th>Base Amount</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingExpenses.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center p-8 text-muted">
                      No pending approvals at this time.
                    </td>
                  </tr>
                ) : (
                  pendingExpenses.map((exp) => (
                    <motion.tr 
                      initial={{ opacity: 0, x: -10 }} 
                      animate={{ opacity: 1, x: 0 }} 
                      exit={{ opacity: 0, scale: 0.95 }}
                      key={exp.id}
                      style={{ opacity: isProcessing === exp.id ? 0.5 : 1 }}
                    >
                      <td>
                        <div className="flex items-center gap-2">
                          <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-full)', backgroundColor: 'var(--bg-surface-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>
                             {exp.userName?.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-medium">{exp.userName}</span>
                        </div>
                      </td>
                      <td>
                        <div className="text-medium">{exp.date}</div>
                        <div className="text-xs text-muted">{exp.category}</div>
                      </td>
                      <td><span className="text-sm">{exp.description}</span></td>
                      <td>{exp.amount} {exp.currency}</td>
                      <td className="text-bold">{exp.baseAmount} {company?.baseCurrency || 'USD'}</td>
                      <td>
                        <div className="flex gap-2">
                          <button 
                            className="btn-success flex items-center justify-center p-2" 
                            style={{ width: '36px', height: '36px' }}
                            onClick={() => handleAction(exp.id, 'Approved')}
                            disabled={isProcessing === exp.id}
                          >
                            <Check size={16} />
                          </button>
                          <button 
                            className="btn-danger flex items-center justify-center p-2" 
                            style={{ width: '36px', height: '36px' }}
                            onClick={() => handleAction(exp.id, 'Rejected')}
                            disabled={isProcessing === exp.id}
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {processed.length > 0 && (
          <div className="card w-full mt-4 opacity-70">
            <h2 className="text-lg text-bold mb-4">Recently Processed</h2>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Employee Name</th>
                    <th>Date & Category</th>
                    <th>Base Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {processed.map((exp) => (
                    <tr key={exp.id}>
                      <td>{exp.userName}</td>
                      <td>
                        <div className="text-medium">{exp.date}</div>
                        <div className="text-xs text-muted">{exp.category}</div>
                      </td>
                      <td className="text-bold">{exp.baseAmount} {company?.baseCurrency || 'USD'}</td>
                      <td><span className={`badge badge-${exp.status.toLowerCase()}`}>{exp.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Approvals;
