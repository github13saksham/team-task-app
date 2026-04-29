import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Layout, LogOut, User as UserIcon, CheckSquare, Folder } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="glass-nav">
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none', color: 'inherit' }}>
          <div style={{ background: 'var(--primary)', padding: '0.4rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Layout size={20} color="white" />
          </div>
          <span style={{ fontWeight: 800, fontSize: '1.4rem', letterSpacing: '-0.02em', background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>TeamTask</span>
        </Link>

        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginLeft: '1.5rem' }}>
            <Link 
              to="/projects" 
              style={{ 
                textDecoration: 'none', 
                color: isActive('/projects') ? 'var(--primary)' : 'var(--text-muted)',
                fontSize: '0.95rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'color 0.2s'
              }}
            >
              <Folder size={18} />
              Projects
            </Link>
            <Link 
              to="/my-tasks" 
              style={{ 
                textDecoration: 'none', 
                color: isActive('/my-tasks') ? 'var(--primary)' : 'var(--text-muted)',
                fontSize: '0.95rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'color 0.2s'
              }}
            >
              <CheckSquare size={18} />
              My Tasks
            </Link>
          </div>
        )}
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        {user ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(255,255,255,0.03)', padding: '0.5rem 1rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <UserIcon size={16} color="var(--primary)" />
              <span style={{ fontSize: '0.9rem', color: '#f8fafc', fontWeight: 600 }}>{user.name}</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--primary)', background: 'rgba(99, 102, 241, 0.1)', padding: '0.1rem 0.5rem', borderRadius: '4px', fontWeight: 700 }}>{user.role}</span>
            </div>
            <button onClick={handleLogout} style={{ background: 'transparent', color: '#ef4444', padding: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.95rem', fontWeight: 600 }}>
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <Link to="/login" style={{ textDecoration: 'none', color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: 600, transition: 'color 0.2s' }} onMouseEnter={(e: any) => e.target.style.color = 'white'} onMouseLeave={(e: any) => e.target.style.color = 'var(--text-muted)'}>Login</Link>
            <Link to="/signup" className="btn-primary" style={{ textDecoration: 'none', fontSize: '0.95rem', padding: '0.6rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Signup</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
