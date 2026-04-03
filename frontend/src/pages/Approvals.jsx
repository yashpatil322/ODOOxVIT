import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchAPI } from '../utils/api';
import { motion } from 'framer-motion';
import { Check, X, ShieldAlert } from 'lucide-react';

const Approvals = () => {
  const { user } = useAuth();
  const company = user?.company;
  const [pendingSteps, setPendingSteps] = useState([]);
  const [isProcessing, setIsProcessing] = useState(null);

  useEffect(() => {
    fetchApprovals();
  }, []);

  const fetchApprovals = async () => {
    try {
      if (user.role === 'Admin' || user.role === 'Manager') {
        const data = await fetchAPI('/approvals/');
        setPendingSteps(data);
      }
    } catch (err) {
      console.error(err);
    }
  }

  const handleAction = async (stepId, action) => {
    setIsProcessing(stepId);
    try {
       // Make explicit backend hit to nested action URL structure
       await fetchAPI(`/approvals/${stepId}/${action.toLowerCase()}/`, {
         method: 'POST',
       });
       fetchApprovals(); // Reload constraints directly from the backend
    } catch(err) {
       console.error("Workflow err", err);
    } finally {
       setIsProcessing(null);
    }
  };

  if (user?.role === 'Employee') {
    return (
      <div className="flex flex-col items-center justify-center p-10 text-center text-muted" style={{ height: '60vh' }}>
        <ShieldAlert size={64} style={{ marginBottom: '1rem', color: 'var(--danger)' }} />
        <h2 className="text-2xl text-bold text-primary mb-2">Access Hard-Restricted</h2>
        <p>Your authentication mapping token specifies 'Employee'. Manager or Admin privileges required to view queue.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl text-bold">Workflow Queue</h1>
          <p className="text-muted">You are natively mapped to intercept these specific claim entities.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 mb-8">
        <div className="card w-full p-0">
          <div className="p-5 border-b" style={{ borderColor: 'var(--border-color)' }}>
              <h2 className="text-lg text-bold flex items-center gap-2">
                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, borderRadius: 'var(--radius-md)', backgroundColor: 'var(--primary-accent)', color: '#fff', fontSize: '0.75rem' }}>{pendingSteps.length}</span>
                Pending Required Sign-Offs
              </h2>
          </div>
          
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Trace Expense ID</th>
                  <th>Review Date</th>
                  <th>Order Node</th>
                  <th>Status Status</th>
                  <th>Action Vector</th>
                </tr>
              </thead>
              <tbody>
                {pendingSteps.length === 0 ? (
                  <tr><td colSpan="5" className="text-center p-8 text-muted">No pending intercepts required structurally.</td></tr>
                ) : (
                  pendingSteps.map((step) => (
                    <motion.tr initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} key={step.id} style={{ opacity: isProcessing === step.id ? 0.5 : 1 }}>
                      <td>
                        <span className="text-medium text-primary-accent">EXP-{step.expense}</span>
                      </td>
                      <td>
                        <div className="text-medium">{new Date(step.created_at).toLocaleDateString()}</div>
                      </td>
                      <td><span className="text-xs text-muted font-bold">NODE STEP: {step.step_order}</span></td>
                      <td><span className="badge badge-pending">PENDING</span></td>
                      <td>
                        <div className="flex gap-2">
                          <button className="btn-success flex items-center justify-center p-2" onClick={() => handleAction(step.id, 'Approve')} disabled={isProcessing === step.id}>
                            <Check size={16} /> <span className="text-xs ml-1">Approve</span>
                          </button>
                          <button className="btn-danger flex items-center justify-center p-2" onClick={() => handleAction(step.id, 'Reject')} disabled={isProcessing === step.id}>
                            <X size={16} /> <span className="text-xs ml-1">Reject</span>
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
      </div>
    </div>
  );
};

export default Approvals;
