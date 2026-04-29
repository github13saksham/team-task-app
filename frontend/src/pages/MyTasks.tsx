import { useEffect, useState } from 'react';
import api from '../services/api';
import { CheckCircle, Layout, X, Calendar, Flag, User, Info } from 'lucide-react';
import { format } from 'date-fns';

const MyTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<any>(null);

  const fetchMyTasks = async () => {
    try {
      const response = await api.get('/tasks/my-tasks');
      setTasks(response.data);
    } catch (error) {
      console.error('Failed to fetch tasks', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyTasks();
  }, []);

  const handleUpdateStatus = async (taskId: string, status: string) => {
    try {
      await api.put(`/tasks/${taskId}`, { status });
      fetchMyTasks();
      if (selectedTask?.id === taskId) {
        setSelectedTask({ ...selectedTask, status });
      }
    } catch (error) {
      console.error('Failed to update status', error);
    }
  };

  if (loading) return <div className="container">Loading...</div>;

  return (
    <div className="container animate-fade-in">
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '3rem',
        padding: '1.5rem',
        background: 'rgba(30, 41, 59, 0.4)',
        borderRadius: '16px',
        border: '1px solid var(--border)'
      }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.25rem' }}>My Assignments</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Tasks assigned specifically to you across all projects.</p>
        </div>
      </header>

      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ 
          padding: '1.25rem 1.5rem', 
          background: 'rgba(255,255,255,0.03)',
          borderBottom: '1px solid var(--border)', 
          display: 'grid', 
          gridTemplateColumns: '1fr 180px 150px 140px', 
          fontWeight: 600, 
          color: 'var(--text-muted)', 
          fontSize: '0.8rem',
          letterSpacing: '0.05em'
        }}>
          <span>TASK TITLE</span>
          <span>PROJECT</span>
          <span>DUE DATE</span>
          <span>STATUS</span>
        </div>
        {tasks.map((task: any) => (
          <div key={task.id} style={{ 
            padding: '1.25rem 1.5rem', 
            borderBottom: '1px solid var(--border)', 
            display: 'grid', 
            gridTemplateColumns: '1fr 180px 150px 140px', 
            alignItems: 'center',
            cursor: 'pointer',
            transition: 'background 0.2s'
          }} onClick={() => setSelectedTask(task)} className="task-row">
            <div>
              <p style={{ fontWeight: 500, fontSize: '1rem', color: 'var(--primary)', textDecoration: 'underline' }}>{task.title}</p>
              <span style={{ 
                fontSize: '0.7rem', 
                fontWeight: 700,
                color: task.priority === 'HIGH' ? 'var(--danger)' : task.priority === 'MEDIUM' ? 'var(--warning)' : 'var(--success)',
                background: 'rgba(0,0,0,0.2)',
                padding: '0.1rem 0.4rem',
                borderRadius: '4px'
              }}>{task.priority}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              <Layout size={14} />
              <span>{task.project?.name}</span>
            </div>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              {task.dueDate ? format(new Date(task.dueDate), 'MMM d, yyyy') : 'No date'}
            </span>
            <div onClick={e => e.stopPropagation()}>
              <select 
                value={task.status} 
                onChange={(e) => handleUpdateStatus(task.id, e.target.value)}
                style={{ 
                  marginBottom: 0, 
                  padding: '0.5rem', 
                  fontSize: '0.8rem', 
                  borderRadius: '10px',
                  background: task.status === 'DONE' ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-dark)',
                  color: task.status === 'DONE' ? 'var(--success)' : 'white'
                }}
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
              </select>
            </div>
          </div>
        ))}
        {tasks.length === 0 && (
          <div style={{ padding: '5rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <CheckCircle size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
            <p>You have no assigned tasks at the moment.</p>
          </div>
        )}
      </div>

      {/* Task Details Modal */}
      {selectedTask && (
        <div className="modal-backdrop" onClick={() => setSelectedTask(null)}>
          <div className="card modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px', padding: 0 }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.5rem' }}>Task Details</h2>
              <button onClick={() => setSelectedTask(null)} style={{ background: 'transparent', color: 'var(--text-muted)' }}>
                <X size={24} />
              </button>
            </div>
            
            <div style={{ padding: '2rem' }}>
              <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Info size={18} color="var(--primary)" />
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em' }}>TITLE</span>
                </div>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>{selectedTask.title}</h1>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Layout size={18} color="var(--primary)" />
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em' }}>DESCRIPTION</span>
                </div>
                <p style={{ color: 'var(--text-main)', lineHeight: '1.6', fontSize: '1rem', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '12px' }}>
                  {selectedTask.description || 'No description provided for this task.'}
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <Flag size={18} color="var(--primary)" />
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em' }}>PRIORITY</span>
                  </div>
                  <span style={{ 
                    padding: '0.4rem 1rem', 
                    borderRadius: '20px', 
                    fontSize: '0.85rem', 
                    fontWeight: 700,
                    background: selectedTask.priority === 'HIGH' ? 'rgba(239, 68, 68, 0.1)' : selectedTask.priority === 'MEDIUM' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                    color: selectedTask.priority === 'HIGH' ? 'var(--danger)' : selectedTask.priority === 'MEDIUM' ? 'var(--warning)' : 'var(--success)',
                    border: `1px solid ${selectedTask.priority === 'HIGH' ? 'var(--danger)' : selectedTask.priority === 'MEDIUM' ? 'var(--warning)' : 'var(--success)'}`,
                  }}>
                    {selectedTask.priority}
                  </span>
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <Calendar size={18} color="var(--primary)" />
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em' }}>DUE DATE</span>
                  </div>
                  <p style={{ fontSize: '1rem', fontWeight: 500 }}>
                    {selectedTask.dueDate ? format(new Date(selectedTask.dueDate), 'MMMM d, yyyy') : 'No deadline set'}
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <CheckCircle size={18} color="var(--primary)" />
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em' }}>STATUS</span>
                  </div>
                  <select 
                    value={selectedTask.status} 
                    onChange={(e) => handleUpdateStatus(selectedTask.id, e.target.value)}
                    style={{ 
                      marginBottom: 0, 
                      padding: '0.6rem', 
                      fontSize: '0.9rem', 
                      borderRadius: '10px',
                      background: selectedTask.status === 'DONE' ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-dark)',
                      color: selectedTask.status === 'DONE' ? 'var(--success)' : 'white'
                    }}
                  >
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="DONE">Done</option>
                  </select>
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <User size={18} color="var(--primary)" />
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em' }}>PROJECT</span>
                  </div>
                  <p style={{ fontSize: '1rem', fontWeight: 500 }}>{selectedTask.project?.name}</p>
                </div>
              </div>
            </div>

            <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border)', textAlign: 'right' }}>
              <button className="btn-primary" onClick={() => setSelectedTask(null)}>Close View</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyTasks;
