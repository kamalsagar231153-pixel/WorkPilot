import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectsApi } from '../services/projects';
import { getApiError } from '../api/axios';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { Loading, ErrorState, EmptyState } from '../components/States';
import { Modal, ConfirmDialog } from '../components/Modal';
import { Icon } from '../components/Icon';
import { Spinner } from '../components/States';

export default function Dashboard() {
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [editing, setEditing] = useState(null); // null | {} (new) | project (edit)
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setProjects(await projectsApi.list());
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <>
      <div className="topbar">
        <div>
          <div className="crumb">Workspace</div>
          <h1>Projects</h1>
          <p className="sub">
            {user ? `Welcome back, ${user.name.split(' ')[0]}. ` : ''}
            Pick a project to open its board, or start a new one.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setEditing({})}>
          <Icon.Plus width={16} height={16} /> New project
        </button>
      </div>

      <div className="content">
        {loading ? (
          <Loading />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : projects.length === 0 ? (
          <EmptyState
            title="No projects yet"
            hint="Create your first project to start organizing tasks on a Kanban board."
            action={
              <button className="btn btn-primary" onClick={() => setEditing({})}>
                <Icon.Plus width={16} height={16} /> Create a project
              </button>
            }
          />
        ) : (
          <div className="proj-grid">
            {projects.map((p) => (
              <div
                key={p._id}
                className="proj-card rise"
                onClick={() => navigate(`/projects/${p._id}`)}
              >
                <h3>{p.name}</h3>
                <p className="desc">{p.description || 'No description provided.'}</p>
                <div className="foot">
                  <span className="flex gap" style={{ alignItems: 'center' }}>
                    <button
                      className="btn btn-icon btn-subtle btn-sm"
                      title="Edit"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditing(p);
                      }}
                    >
                      <Icon.Edit width={14} height={14} />
                    </button>
                    <button
                      className="btn btn-icon btn-subtle btn-sm"
                      title="Delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleting(p);
                      }}
                    >
                      <Icon.Trash width={14} height={14} />
                    </button>
                  </span>
                  <span className="open">
                    Open board <Icon.Arrow width={14} height={14} />
                  </span>
                </div>
              </div>
            ))}

            <div className="proj-card proj-add" onClick={() => setEditing({})}>
              <span className="plus">
                <Icon.Plus width={20} height={20} />
              </span>
              New project
            </div>
          </div>
        )}
      </div>

      {editing && (
        <ProjectModal
          project={editing._id ? editing : null}
          onClose={() => setEditing(null)}
          onSaved={(saved, isNew) => {
            setEditing(null);
            toast.success(isNew ? 'Project created' : 'Project updated');
            load();
          }}
        />
      )}

      {deleting && (
        <ConfirmDialog
          title="Delete project?"
          message={`“${deleting.name}” and all of its tasks will be permanently removed.`}
          onCancel={() => setDeleting(null)}
          onConfirm={async () => {
            try {
              await projectsApi.remove(deleting._id);
              toast.success('Project deleted');
              setDeleting(null);
              load();
            } catch (err) {
              toast.error(getApiError(err));
              setDeleting(null);
            }
          }}
        />
      )}
    </>
  );
}

function ProjectModal({ project, onClose, onSaved }) {
  const isNew = !project;
  const [form, setForm] = useState({
    name: project?.name || '',
    description: project?.description || '',
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async () => {
    if (!form.name.trim()) return setError('Project name is required.');
    setBusy(true);
    setError('');
    try {
      if (isNew) await projectsApi.create(form);
      else await projectsApi.update(project._id, form);
      onSaved(form, isNew);
    } catch (err) {
      setError(getApiError(err));
      setBusy(false);
    }
  };

  return (
    <Modal
      title={isNew ? 'New project' : 'Edit project'}
      subtitle={isNew ? 'Give your project a name to get started.' : 'Update the project details.'}
      onClose={onClose}
    >
      <div className="modal-body">
        {error && (
          <div className="form-error">
            <Icon.Alert width={16} height={16} /> <span>{error}</span>
          </div>
        )}
        <div className="field">
          <label>Name</label>
          <input
            name="name"
            className="input"
            value={form.name}
            onChange={onChange}
            placeholder="Website Redesign"
            autoFocus
          />
        </div>
        <div className="field">
          <label>Description</label>
          <textarea
            name="description"
            className="textarea"
            value={form.description}
            onChange={onChange}
            placeholder="What is this project about?"
          />
        </div>
      </div>
      <div className="modal-foot">
        <button className="btn btn-ghost" onClick={onClose} disabled={busy}>
          Cancel
        </button>
        <button className="btn btn-primary" onClick={submit} disabled={busy}>
          {busy ? <Spinner /> : isNew ? 'Create project' : 'Save changes'}
        </button>
      </div>
    </Modal>
  );
}
