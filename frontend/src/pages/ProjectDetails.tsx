import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Plus, UserPlus, Trash2, Users, Calendar, X, 
  User as UserIcon, Layout, Shield
} from 'lucide-react';
import { format } from 'date-fns';

const AdminProjectView = ({ project, tasks, setTasks, isAdmin, fetchData, user }: any) => {
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'MEDIUM', dueDate: '', assigneeId: '' });
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });

  const showFeedback = (text: string, type: string) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Optimistic Create
    const tempId = 'temp-' + Date.now();
    const tempTask = {
      ...newTask,
      id: tempId,
      status: 'TODO',
      assignee: project.members.find((m: any) => m.id === newTask.assigneeId) || null,
      isPending: true
    };
    
    const originalTasks = [...tasks];
    setTasks([tempTask, ...tasks]);
    setShowTaskModal(false);

    try {
      const response = await api.post('/tasks', { ...newTask, projectId: project.id });
      // Replace temp task with real one
      setTasks((prev: any) => prev.map((t: any) => t.id === tempId ? response.data : t));
      setNewTask({ title: '', description: '', priority: 'MEDIUM', dueDate: '', assigneeId: '' });
      showFeedback('Task created successfully', 'success');
    } catch (error: any) {
      setTasks(originalTasks); // Rollback
      showFeedback(error.response?.data?.message || 'Failed to create task', 'error');
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post(`/projects/${project.id}/members`, { email: newMemberEmail });
      setShowMemberModal(false);
      setNewMemberEmail('');
      await fetchData();
      showFeedback(res.data.message, 'success');
    } catch (error: any) {
      showFeedback(error.response?.data?.message || 'Failed to add member', 'error');
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, status: string) => {
    const originalTasks = [...tasks];
    const updatedTasks = tasks.map((t: any) => t.id === taskId ? { ...t, status } : t);
    setTasks(updatedTasks);
    if (selectedTask?.id === taskId) setSelectedTask({ ...selectedTask, status });

    try {
      await api.put(`/tasks/${taskId}`, { status });
    } catch (error) {
      setTasks(originalTasks);
      showFeedback('Failed to update status', 'error');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    
    const originalTasks = [...tasks];
    setTasks(tasks.filter((t: any) => t.id !== taskId));
    if (selectedTask?.id === taskId) setSelectedTask(null);

    try {
      await api.delete(`/tasks/${taskId}`);
      showFeedback('Task deleted', 'success');
    } catch (error) {
      setTasks(originalTasks);
      showFeedback('Failed to delete task', 'error');
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!window.confirm('Remove this member from the project?')) return;
    try {
      await api.delete(`/projects/${project.id}/members/${memberId}`);
      fetchData();
      showFeedback('Member removed', 'success');
    } catch (error) {
      console.error('Failed to remove member', error);
    }
  };

  const projectCompletion = Math.round((tasks.filter((t: any) => t.status === 'DONE').length / (tasks.length || 1)) * 100);

  return (
    <div className="animate-fade-in">
      {message.text && (
        <div className={`toast toast-${message.type}`}>{message.text}</div>
      )}

      {/* Admin Header */}
      <header className="admin-project-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'var(--primary)', padding: '0.8rem', borderRadius: '14px' }}>
            <Shield size={24} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0 }}>{project.name} <span style={{ fontSize: '0.8rem', verticalAlign: 'middle', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', padding: '0.2rem 0.6rem', borderRadius: '4px', marginLeft: '0.5rem' }}>ADMIN PANEL</span></h1>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>{project.description}</p>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn-secondary" onClick={() => setShowMemberModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <UserPlus size={18} />
            <span>Invite Team</span>
          </button>
          <button className="btn-primary" onClick={() => setShowTaskModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={18} />
            <span>Create Task</span>
          </button>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '2rem' }}>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Project Roadmap</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{tasks.length} Total Tasks</span>
              <div style={{ width: '100px', height: '6px', background: 'var(--bg-dark)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${projectCompletion}%`, background: 'var(--primary)', transition: 'width 0.5s ease' }}></div>
              </div>
            </div>
          </div>
          
          <div className="task-list-admin">
            <div className="task-header-grid">
              <span>TASK NAME</span>
              <span>ASSIGNEE</span>
              <span>DUE DATE</span>
              <span>STATUS</span>
              <span>ACTIONS</span>
            </div>
            {tasks.map((task: any) => (
              <div key={task.id} className="task-row-admin" onClick={() => setSelectedTask(task)} style={{ opacity: task.isPending ? 0.6 : 1 }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontWeight: 600, color: 'var(--primary)', textDecoration: 'underline' }}>{task.title}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: task.priority === 'HIGH' ? 'var(--danger)' : task.priority === 'MEDIUM' ? 'var(--warning)' : 'var(--success)' }}></div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>{task.priority}</span>
                  </div>
                </div>
                <div onClick={e => e.stopPropagation()}>
                  <select 
                    value={task.assigneeId || ''} 
                    onChange={(e) => api.put(`/tasks/${task.id}`, { assigneeId: e.target.value || null }).then(() => fetchData())}
                    style={{ 
                      width: '100%', 
                      fontSize: '0.8rem', 
                      padding: '0.5rem 0.8rem', 
                      borderRadius: '10px', 
                      background: 'rgba(0,0,0,0.2)', 
                      border: '1px solid var(--border)', 
                      color: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="">Unassigned</option>
                    {project.members?.map((m: any) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-main)', fontSize: '0.85rem', fontWeight: 500 }}>
                  <Calendar size={14} color="var(--text-muted)" />
                  <span>{task.dueDate ? format(new Date(task.dueDate), 'MMM d') : '-'}</span>
                </div>
                <div onClick={e => e.stopPropagation()}>
                  <select 
                    value={task.status} 
                    onChange={(e) => handleUpdateTaskStatus(task.id, e.target.value)}
                    className={`status-select ${task.status}`}
                    style={{ width: '100%', margin: 0, padding: '0.5rem 0.8rem' }}
                  >
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">Progress</option>
                    <option value="DONE">Done</option>
                  </select>
                </div>
                <div onClick={e => e.stopPropagation()}>
                  {(() => {
                    const isDuplicate = tasks.filter((t: any) => t.title.toLowerCase() === task.title.toLowerCase()).length > 1;
                    const canDelete = task.status === 'DONE' || isDuplicate;
                    return (
                      <button 
                        onClick={() => canDelete && handleDeleteTask(task.id)} 
                        style={{ 
                          background: 'transparent', 
                          color: canDelete ? 'var(--danger)' : 'var(--text-muted)', 
                          padding: '0.4rem',
                          cursor: canDelete ? 'pointer' : 'not-allowed',
                          opacity: canDelete ? 1 : 0.4,
                          transition: 'all 0.2s'
                        }}
                        title={!canDelete ? "Complete task or have duplicate names to delete" : "Delete task"}
                      >
                        <Trash2 size={16} />
                      </button>
                    );
                  })()}
                </div>
              </div>
            ))}
            {tasks.length === 0 && (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <Layout size={40} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                <p>No tasks created yet for this project.</p>
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '1rem' }}>
              <Users size={18} color="var(--primary)" />
              Team Management
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {project.members?.map((member: any) => (
                <div key={member.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700 }}>
                      {member.name[0]}
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600 }}>{member.name}</p>
                      <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-muted)' }}>{member.id === project.ownerId ? 'Owner' : 'Member'}</p>
                    </div>
                  </div>
                  {isAdmin && member.id !== project.ownerId && (
                    <button onClick={() => handleRemoveMember(member.id)} style={{ background: 'transparent', color: 'var(--danger)', padding: '0.2rem' }}>
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%)' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Health Score</h3>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem' }}>
              <span style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1 }}>{projectCompletion}%</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>Complete</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '1rem' }}>Total performance tracked across all system contributors.</p>
          </div>
        </div>
      </div>

      {/* Task Creation Modal */}
      {showTaskModal && (
        <div className="modal-backdrop" onClick={() => setShowTaskModal(false)}>
          <div className="card modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Create New Task</h2>
            <form onSubmit={handleCreateTask}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem' }}>Task Title</label>
                <input type="text" value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} required placeholder="Enter task title" />
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem' }}>Assignee</label>
                <select value={newTask.assigneeId} onChange={(e) => setNewTask({ ...newTask, assigneeId: e.target.value })} style={{ width: '100%' }}>
                  <option value="">Unassigned</option>
                  {project.members?.map((m: any) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem' }}>Priority</label>
                  <select value={newTask.priority} onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })} style={{ width: '100%' }}>
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem' }}>Due Date</label>
                  <input type="date" value={newTask.dueDate} onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })} style={{ width: '100%' }} />
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="button" onClick={() => setShowTaskModal(false)} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--border)' }}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 1, position: 'relative' }}>
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Member Invite Modal */}
      {showMemberModal && (
        <div className="modal-backdrop" onClick={() => setShowMemberModal(false)}>
          <div className="card modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Invite Member</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>Enter the email address of the team member you want to add to this project.</p>
            <form onSubmit={handleAddMember}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem' }}>Email Address</label>
                <input type="email" value={newMemberEmail} onChange={(e) => setNewMemberEmail(e.target.value)} required placeholder="user@example.com" style={{ width: '100%' }} />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="button" onClick={() => setShowMemberModal(false)} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--border)' }}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                  Invite Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task View Modal */}
      {selectedTask && (
        <TaskViewModal task={selectedTask} onClose={() => setSelectedTask(null)} onStatusUpdate={handleUpdateTaskStatus} isAdmin={isAdmin} currentUserId={user.id} />
      )}
    </div>
  );
};

const MemberProjectView = ({ project, tasks, setTasks, user }: any) => {
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const myTasks = tasks.filter((t: any) => t.assigneeId === user.id);
  const otherTasks = tasks.filter((t: any) => t.assigneeId !== user.id);

  const handleUpdateTaskStatus = async (taskId: string, status: string) => {
    const originalTasks = [...tasks];
    const updatedTasks = tasks.map((t: any) => t.id === taskId ? { ...t, status } : t);
    setTasks(updatedTasks);
    if (selectedTask?.id === taskId) setSelectedTask({ ...selectedTask, status });

    try {
      await api.put(`/tasks/${taskId}`, { status });
    } catch (error) {
      setTasks(originalTasks);
    }
  };

  return (
    <div className="animate-fade-in">
      <header style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800 }}>{project.name}</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>{project.description}</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2.5rem' }}>
        <div>
          <div className="section-header" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Shield size={20} color="var(--success)" />
            <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Tasks Assigned to You</h2>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '3rem' }}>
            {myTasks.map((task: any) => (
              <div key={task.id} className="member-task-card" onClick={() => setSelectedTask(task)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 800, padding: '0.2rem 0.5rem', borderRadius: '6px', textTransform: 'uppercase', background: task.priority === 'HIGH' ? 'rgba(239, 68, 68, 0.1)' : task.priority === 'MEDIUM' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)', color: task.priority === 'HIGH' ? 'var(--danger)' : task.priority === 'MEDIUM' ? 'var(--warning)' : 'var(--success)' }}>{task.priority}</div>
                  <select 
                    value={task.status} 
                    onChange={(e) => { e.stopPropagation(); handleUpdateTaskStatus(task.id, e.target.value); }}
                    className={`status-select ${task.status}`}
                    onClick={e => e.stopPropagation()}
                  >
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">Progress</option>
                    <option value="DONE">Done</option>
                  </select>
                </div>
                <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{task.title}</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  <Layout size={14} />
                  <span>Due {task.dueDate ? format(new Date(task.dueDate), 'MMM d') : 'No date'}</span>
                </div>
              </div>
            ))}
            {myTasks.length === 0 && (
              <div className="card" style={{ textAlign: 'center', padding: '3rem', borderStyle: 'dashed', background: 'transparent' }}>
                <p style={{ color: 'var(--text-muted)' }}>You have no tasks assigned in this project yet.</p>
              </div>
            )}
          </div>

          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Other Project Tasks</h2>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {otherTasks.map((task: any) => (
              <div key={task.id} style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={() => setSelectedTask(task)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: task.status === 'DONE' ? 'var(--success)' : 'var(--warning)' }}></div>
                  <span style={{ fontWeight: 500 }}>{task.title}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{task.assignee?.name || 'Unassigned'}</span>
                  <span className={`status-pill ${task.status}`}>{task.status.replace('_', ' ')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="card" style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '1.5rem' }}>Project Members</h3>
            <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              {project.members?.map((m: any) => (
                <div key={m.id} title={m.name} style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 700, border: '2px solid var(--bg-card)' }}>
                  {m.name[0]}
                </div>
              ))}
            </div>
          </div>
          
          <div className="card" style={{ background: 'var(--bg-dark)' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Project Activity</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Stay updated with the latest changes in this workspace.</p>
          </div>
        </div>
      </div>

      {selectedTask && (
        <TaskViewModal task={selectedTask} onClose={() => setSelectedTask(null)} onStatusUpdate={handleUpdateTaskStatus} isAdmin={false} currentUserId={user.id} />
      )}
    </div>
  );
};

const TaskViewModal = ({ task, onClose, onStatusUpdate, isAdmin, currentUserId }: any) => (
  <div className="modal-backdrop" onClick={onClose}>
    <div className="card modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px', padding: 0 }}>
      <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.5rem' }}>Task Details</h2>
        <button onClick={onClose} style={{ background: 'transparent', color: 'var(--text-muted)' }}><X size={24} /></button>
      </div>
      <div style={{ padding: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '1.5rem' }}>{task.title}</h1>
        <div style={{ marginBottom: '2rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: '0.5rem' }}>DESCRIPTION</span>
          <p style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '12px', lineHeight: 1.6 }}>{task.description || 'No description provided.'}</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: '0.5rem' }}>PRIORITY</span>
            <div style={{ fontSize: '0.7rem', fontWeight: 800, padding: '0.2rem 0.5rem', borderRadius: '6px', textTransform: 'uppercase', background: task.priority === 'HIGH' ? 'rgba(239, 68, 68, 0.1)' : task.priority === 'MEDIUM' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)', color: task.priority === 'HIGH' ? 'var(--danger)' : task.priority === 'MEDIUM' ? 'var(--warning)' : 'var(--success)' }}>{task.priority}</div>
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: '0.5rem' }}>DUE DATE</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Calendar size={16} /> {task.dueDate ? format(new Date(task.dueDate), 'MMMM d, yyyy') : 'No deadline'}</span>
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: '0.5rem' }}>STATUS</span>
            <select 
              value={task.status} 
              onChange={(e) => onStatusUpdate(task.id, e.target.value)}
              disabled={!isAdmin && task.assigneeId !== currentUserId}
              className={`status-select ${task.status}`}
            >
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="DONE">Done</option>
            </select>
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: '0.5rem' }}>ASSIGNEE</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><UserIcon size={16} /> {task.assignee?.name || 'Unassigned'}</span>
          </div>
        </div>
      </div>
      <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border)', textAlign: 'right' }}>
        <button className="btn-primary" onClick={onClose}>Close</button>
      </div>
    </div>
  </div>
);

const ProjectDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState<any>(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const projRes = await api.get(`/projects/${id}`);
      setProject(projRes.data);
      const taskRes = await api.get(`/tasks?projectId=${id}`);
      setTasks(taskRes.data);
    } catch (error) {
      console.error('Failed to fetch project details', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  if (loading || !project) return <div className="container">Loading workspace...</div>;

  const isAdmin = user?.role === 'ADMIN' || project.ownerId === user?.id;

  return (
    <div className="container">
      {isAdmin ? (
        <AdminProjectView project={project} tasks={tasks} setTasks={setTasks} isAdmin={isAdmin} fetchData={fetchData} user={user} />
      ) : (
        <MemberProjectView project={project} tasks={tasks} setTasks={setTasks} user={user} />
      )}
    </div>
  );
};

export default ProjectDetails;
