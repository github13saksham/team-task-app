import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  CheckCircle, AlertCircle, List, Users, Folder, 
  BarChart3, Plus, ArrowRight, Activity, TrendingUp
} from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboard = ({ stats, user }: any) => {
  return (
    <div className="animate-fade-in">
      <header style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Executive Overview</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Welcome back, {user?.name}. Here is the system health report.</p>
          </div>
          <Link to="/projects" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
            <Plus size={18} />
            <span>New Project</span>
          </Link>
        </div>
      </header>

      {/* Global Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
        {[
          { label: 'System Tasks', value: stats.totalTasks, icon: <List color="#6366f1" />, bg: 'rgba(99, 102, 241, 0.1)' },
          { label: 'Total Projects', value: stats.projectCount || 0, icon: <Folder color="#10b981" />, bg: 'rgba(16, 185, 129, 0.1)' },
          { label: 'Active Members', value: stats.memberCount || 0, icon: <Users color="#f59e0b" />, bg: 'rgba(245, 158, 11, 0.1)' },
          { label: 'Completion Rate', value: `${Math.round((stats.completedTasks / (stats.totalTasks || 1)) * 100)}%`, icon: <TrendingUp color="#ef4444" />, bg: 'rgba(239, 68, 68, 0.1)' },
        ].map((item, i) => (
          <div key={i} className="card" style={{ padding: '1.5rem', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ background: item.bg, padding: '0.75rem', borderRadius: '12px' }}>{item.icon}</div>
              <Activity size={16} color="var(--text-muted)" style={{ opacity: 0.5 }} />
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{item.label}</p>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, margin: '0.25rem 0' }}>{item.value}</h2>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BarChart3 size={20} color="var(--primary)" />
              Project Performance
            </h3>
            <Link to="/projects" style={{ color: 'var(--primary)', fontSize: '0.9rem', fontWeight: 600, textDecoration: 'none' }}>View All</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {stats.projects?.slice(0, 5).map((p: any) => (
              <div key={p.id} style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ fontWeight: 600 }}>{p.name}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{p._count.tasks} tasks</span>
                </div>
                <div style={{ height: '8px', background: 'rgba(0,0,0,0.3)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.random() * 100}%`, background: 'var(--primary)' }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <Activity size={20} color="var(--warning)" />
            Recent Alerts
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <AlertCircle color="var(--danger)" size={20} />
              <div>
                <p style={{ fontSize: '0.9rem', fontWeight: 500 }}>3 Tasks Overdue</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Project: Todo App</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <CheckCircle color="var(--success)" size={20} />
              <div>
                <p style={{ fontSize: '0.9rem', fontWeight: 500 }}>New Project Created</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>By Admin - 2 hours ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MemberDashboard = ({ stats }: any) => {
  return (
    <div className="animate-fade-in">
      <header style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>My Workspace</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>You have {stats.pendingTasks} tasks waiting for your attention.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2.5rem' }}>
        <div>
          <h3 style={{ marginBottom: '1.5rem' }}>My Progress</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
            <div className="card" style={{ borderLeft: '4px solid var(--warning)' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Tasks to do</p>
              <h2 style={{ fontSize: '2.5rem', margin: '0.5rem 0' }}>{stats.pendingTasks}</h2>
              <Link to="/my-tasks" style={{ color: 'var(--warning)', fontSize: '0.85rem', textDecoration: 'none', fontWeight: 600 }}>View assignments →</Link>
            </div>
            <div className="card" style={{ borderLeft: '4px solid var(--success)' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Completed</p>
              <h2 style={{ fontSize: '2.5rem', margin: '0.5rem 0' }}>{stats.completedTasks}</h2>
              <p style={{ color: 'var(--success)', fontSize: '0.85rem', fontWeight: 600 }}>Great job!</p>
            </div>
          </div>

          <div className="card">
            <h3>Recent Project</h3>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1.5rem', padding: '1.5rem', background: 'rgba(99, 102, 241, 0.05)', borderRadius: '16px', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ background: 'var(--primary)', padding: '0.75rem', borderRadius: '12px' }}>
                  <Folder color="white" />
                </div>
                <div>
                  <h4 style={{ margin: 0 }}>View Projects</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Collaborate with your team</p>
                </div>
              </div>
              <Link to="/projects" className="btn-primary" style={{ padding: '0.5rem 1rem', textDecoration: 'none' }}>
                <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        </div>

        <div className="card" style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Team Stats</h3>
          <div style={{ textAlign: 'center', padding: '1rem' }}>
            <div style={{ width: '120px', height: '120px', borderRadius: '50%', border: '8px solid var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: '1.5rem', fontWeight: 800 }}>
              {Math.round((stats.completedTasks / (stats.totalTasks || 1)) * 100)}%
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>of your assigned tasks are completed</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/tasks/dashboard');
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading || !stats) return <div className="container">Loading dashboard...</div>;

  return (
    <div className="container">
      {user?.role === 'ADMIN' ? (
        <AdminDashboard stats={stats} user={user} />
      ) : (
        <MemberDashboard stats={stats} />
      )}
    </div>
  );
};

export default Dashboard;
