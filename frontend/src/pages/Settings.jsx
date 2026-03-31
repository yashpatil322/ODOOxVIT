import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Users, Save, DollarSign } from 'lucide-react';

const Settings = () => {
  const { user, company } = useAuth();
  
  if (user?.role !== 'Admin') {
    return <div className="p-10 text-center">Admin access required.</div>;
  }

  const [rules, setRules] = useState({
    percentageRequired: 60,
    specificApprover: 'CFO',
    hybridMode: true
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl text-bold">Admin Settings</h1>
          <p className="text-muted">Configure company-wide policies and workflows.</p>
        </div>
        <button className="btn-primary">
          <Save size={18} /> Save Changes
        </button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="card w-full mb-6">
          <div className="flex items-center gap-2 mb-6 border-b pb-4" style={{ borderColor: 'var(--border-color)' }}>
            <div style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(88, 166, 255, 0.1)', color: 'var(--primary-accent)' }}><DollarSign size={20} /></div>
            <h2 className="text-lg text-bold">General Setup</h2>
          </div>
          
          <div className="mb-4">
            <label className="text-sm text-muted block mb-1">Company Name</label>
            <input type="text" defaultValue={company?.name} disabled style={{ backgroundColor: 'var(--bg-color)', opacity: 0.7 }} />
          </div>
          
          <div className="mb-4">
            <label className="text-sm text-muted block mb-1">Base Currency</label>
            <input type="text" defaultValue={company?.baseCurrency || 'USD'} disabled style={{ backgroundColor: 'var(--bg-color)', opacity: 0.7 }} />
            <p className="text-xs text-muted mt-1">Sourced automatically based on country selection.</p>
          </div>
        </div>

        <div className="card w-full mb-6">
          <div className="flex items-center gap-2 mb-6 border-b pb-4" style={{ borderColor: 'var(--border-color)' }}>
            <div style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(210, 153, 34, 0.1)', color: 'var(--warning)' }}><Shield size={20} /></div>
            <h2 className="text-lg text-bold">Smart Approval Logic</h2>
          </div>
          
          <div className="flex flex-col gap-4 text-sm mt-4">
            <div className="flex justify-between items-center p-3 rounded" style={{ backgroundColor: 'var(--bg-surface-elevated)' }}>
              <div>
                <strong className="block mb-1">Percentage Rule</strong>
                <span className="text-xs text-muted">Requires X% of group to approve</span>
              </div>
              <div className="flex items-center gap-2">
                <input type="number" defaultValue={rules.percentageRequired} style={{ width: '60px', padding: '0.25rem' }} /> %
              </div>
            </div>

            <div className="flex justify-between items-center p-3 rounded" style={{ backgroundColor: 'var(--bg-surface-elevated)' }}>
              <div>
                <strong className="block mb-1">Specific Approver Rule (VIP)</strong>
                <span className="text-xs text-muted">Auto-approves if VIP signs</span>
              </div>
              <div className="flex items-center gap-2">
                <select defaultValue={rules.specificApprover} style={{ width: '120px', padding: '0.25rem' }}>
                  <option value="CEO">CEO</option>
                  <option value="CFO">CFO</option>
                  <option value="Director">Director</option>
                </select>
              </div>
            </div>

            <div className="flex justify-between items-center p-3 rounded" style={{ backgroundColor: 'var(--bg-surface-elevated)', borderLeft: '3px solid var(--primary-accent)' }}>
              <div>
                <strong className="block mb-1">Hybrid Logic Enabled</strong>
                <span className="text-xs text-muted">Requires Percentage OR VIP signature</span>
              </div>
              <input type="checkbox" defaultChecked={rules.hybridMode} style={{ width: 'auto' }} />
            </div>
          </div>
        </div>

        <div className="card w-full col-span-2">
          <div className="flex justify-between items-center mb-6 border-b pb-4" style={{ borderColor: 'var(--border-color)' }}>
            <div className="flex items-center gap-2">
              <div style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(35, 134, 54, 0.1)', color: 'var(--success)' }}><Users size={20} /></div>
              <h2 className="text-lg text-bold">User Roles & Hierarchy</h2>
            </div>
            <button className="btn-success text-sm py-1 px-3">+ Invite User</button>
          </div>
          
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Reports To</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td><span className="badge" style={{ backgroundColor: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8' }}>Admin</span></td>
                  <td className="text-muted">N/A</td>
                  <td><button className="text-primary-accent text-sm">Edit</button></td>
                </tr>
                <tr>
                  <td>Jane Manager</td>
                  <td>manager@company.com</td>
                  <td><span className="badge badge-pending">Manager</span></td>
                  <td>{user.name} (Admin)</td>
                  <td><button className="text-primary-accent text-sm">Edit</button></td>
                </tr>
                <tr>
                  <td>Bob Employee</td>
                  <td>employee@company.com</td>
                  <td><span className="badge badge-approved">Employee</span></td>
                  <td>Jane Manager</td>
                  <td><button className="text-primary-accent text-sm">Edit</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
