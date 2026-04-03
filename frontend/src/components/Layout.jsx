import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Receipt, CheckSquare, Settings, LogOut } from 'lucide-react';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const company = user?.company;

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="flex items-center gap-2" style={{ marginBottom: '2rem' }}>
          <div style={{ width: 32, height: 32, backgroundColor: 'var(--primary-accent)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold' }}>
            {company?.name ? company.name.charAt(0) : 'E'}
          </div>
          <h2 className="text-xl text-bold">{company?.name || 'ExpenseApp'}</h2>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </NavLink>
          
          <NavLink to="/expenses" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Receipt size={20} />
            <span>My Expenses</span>
          </NavLink>

          {(user?.role === 'Manager' || user?.role === 'Admin') && (
            <NavLink to="/approvals" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <CheckSquare size={20} />
              <span>Approvals</span>
            </NavLink>
          )}

          {user?.role === 'Admin' && (
            <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Settings size={20} />
              <span>Settings</span>
            </NavLink>
          )}
        </nav>

        <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
          <button className="nav-item w-full" onClick={handleLogout} style={{ justifyContent: 'flex-start' }}>
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="topbar">
          <div className="text-muted text-sm flex items-center gap-2">
            <span>Base Currency: <strong style={{color: 'var(--text-primary)'}}>{company?.baseCurrency || 'USD'}</strong></span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-bold">{user?.name}</div>
              <div className="text-xs text-muted">{user?.role}</div>
            </div>
            <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-full)', backgroundColor: 'var(--bg-surface-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               {user?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>
        
        <div className="page-container animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
