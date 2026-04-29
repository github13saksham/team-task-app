import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Plus, Users, Folder, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const Projects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<any>([]);
  const [showModal, setShowModal] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '' });
  const [isCreating, setIsCreating] = useState(false);

  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects');
      setProjects(response.data);
    } catch (error) {
      console.error('Failed to fetch projects', error);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    // Optimistic Create
    const tempId = 'temp-' + Date.now();
    const tempProject = {
      ...newProject,
      id: tempId,
      _count: { members: 1, tasks: 0 },
      isPending: true
    };
    
    const originalProjects = [...projects];
    setProjects([tempProject, ...projects]);
    setShowModal(false);

    try {
      const response = await api.post('/projects', newProject);
      // Replace temp with real data
      setProjects((prev: any) => prev.map((p: any) => p.id === tempId ? response.data : p));
      setNewProject({ name: '', description: '' });
    } catch (error) {
      setProjects(originalProjects); // Rollback
      console.error('Failed to create project', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (projectId: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete project "${name}"?`)) return;

    // Optimistic Delete
    const originalProjects = [...projects];
    setProjects(projects.filter((p: any) => p.id !== projectId));

    try {
      await api.delete(`/projects/${projectId}`);
    } catch (error) {
      setProjects(originalProjects); // Rollback
      console.error('Failed to delete project', error);
    }
  };

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
          <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>My Projects</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Manage your team projects and track progress.</p>
        </div>
        {user?.role === 'ADMIN' && (
          <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => setShowModal(true)}>
            <Plus size={18} />
            <span>Create Project</span>
          </button>
        )}
      </header>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
        gap: '2rem' 
      }}>
        {projects.map((project: any) => (
          <Link to={project.isPending ? '#' : `/projects/${project.id}`} key={project.id} style={{ textDecoration: 'none', color: 'inherit', opacity: project.isPending ? 0.6 : 1 }}>
            <div className="card" style={{ 
              aspectRatio: '1 / 1', 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'space-between',
              cursor: project.isPending ? 'default' : 'pointer',
              padding: '1.75rem'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '0.75rem', borderRadius: '12px' }}>
                    <Folder size={24} color="var(--primary)" />
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>{project.name}</h3>
                </div>
                <p style={{ 
                  color: 'var(--text-muted)', 
                  fontSize: '0.95rem', 
                  lineHeight: '1.5', 
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {project.description || 'No description provided for this workspace.'}
                </p>
              </div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                fontSize: '0.85rem', 
                color: 'var(--text-muted)', 
                borderTop: '1px solid var(--border)', 
                paddingTop: '1.25rem' 
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Users size={16} />
                  <span>{project._count?.members || 0} Members</span>
                </div>
                <div style={{ background: 'var(--bg-card)', padding: '0.25rem 0.75rem', borderRadius: '20px', border: '1px solid var(--border)' }}>
                  {project._count?.tasks || 0} Tasks
                </div>
                {user?.role === 'ADMIN' && !project.isPending && (
                  <div onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDelete(project.id, project.name);
                  }} style={{ color: 'var(--danger)', cursor: 'pointer', padding: '0.25rem' }}>
                    <Trash2 size={16} />
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {projects.length === 0 && (
        <div style={{ textAlign: 'center', padding: '5rem 2rem', color: 'var(--text-muted)' }}>
          <Folder size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
          <h3>No projects yet</h3>
          <p>Create your first project to start managing tasks.</p>
        </div>
      )}

      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="card modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <h2 style={{ marginBottom: '0.5rem' }}>Create New Project</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>Define a new workspace for your team.</p>
            
            <form onSubmit={handleCreate}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>Project Name</label>
              <input 
                type="text" 
                value={newProject.name} 
                onChange={(e) => setNewProject({ ...newProject, name: e.target.value })} 
                placeholder="e.g. Website Redesign"
                required 
              />
              
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>Description</label>
              <textarea 
                value={newProject.description} 
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })} 
                style={{ height: '120px', resize: 'none' }}
                placeholder="Briefly describe the project goals..."
              />
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--border)' }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }} disabled={isCreating}>
                  {isCreating ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
