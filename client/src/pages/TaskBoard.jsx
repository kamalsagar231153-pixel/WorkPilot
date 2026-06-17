import { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { projectsApi } from '../services/projects';
import { tasksApi } from '../services/tasks';
import { getApiError } from '../api/axios';
import { useToast } from '../context/ToastContext';
import { Loading, ErrorState, Spinner } from '../components/States';
import { Modal, ConfirmDialog } from '../components/Modal';
import { Icon } from '../components/Icon';

const COLUMNS = [
  { key: 'todo', label: 'To do', color: 'var(--todo)' },
  { key: 'in-progress', label: 'In progress', color: 'var(--progress)' },
  { key: 'done', label: 'Done', color: 'var(--done)' },
];

export default function TaskBoard() {
  const { id: projectId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [editing, setEditing] = useState(null); // {status} for new, or task for edit
  const [deleting, setDeleting] = useState(null);
  const [dragOver, setDragOver] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [proj, taskList] = await Promise.all([
        projectsApi.get(projectId),
        tasksApi.list(projectId),
      ]);
      setProject(proj);
      setTasks(taskList);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    load();
  }, [load]);

  // ---- Drag & drop: move a task to another column (optimistic) ----
  const onDrop = async (status) => {
    setDragOver(null);
    const taskId = window.__draggingTaskId;
    if (!taskId) return;
    const task = tasks.find((t) => t._id === taskId);
    if (!task || task.status === status) return;

    const prev = tasks;
    setTasks((ts) => ts.map((t) => (t._id === taskId ? { ...t, status } : t)));
    try {
      await tasksApi.update(taskId, { status });
    } catch (err) {
      setTasks(prev); // rollback on failure
      toast.error(getApiError(err, 'Could not move task'));
    }
  };

  if (loading) return <Loading />;
  if (error)
    return (
      <div className="content" style={{ paddingTop: 40 }}>
        <ErrorState message={error} onRetry={load} />
      </div>
    );

  const grouped = COLUMNS.reduce((acc, c) => {
    acc[c.key] = tasks.filter((t) => t.status === c.key);
    return acc;
  }, {});

  return (
    <>
      <div className="topbar">
        <div>
          <div className="crumb">
            <Link to="/">Projects</Link>
            <Icon.ChevronLeft width={13} height={13} style={{ transform: 'rotate(180deg)' }} />
            {project?.name}
          </div>
          <h1>{project?.name}</h1>
          {project?.description && <p className="sub">{project.description}</p>}
        </div>
        <button className="btn btn-primary" onClick={() => setEditing({ status: 'todo' })}>
          <Icon.Plus width={16} height={16} /> Add task
        </button>
      </div>

      <div className="content">
        <div className="board">
          {COLUMNS.map((col) => (
            <div
              key={col.key}
              className={`column ${dragOver === col.key ? 'drag-over' : ''}`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(col.key);
              }}
              onDragLeave={() => setDragOver((d) => (d === col.key ? null : d))}
              onDrop={() => onDrop(col.key)}
            >
              <div className="column-head">
                <span className="column-title">
                  <span className="badge-dot" style={{ background: col.color }} />
                  {col.label}
                </span>
                <span className="column-count">{grouped[col.key].length}</span>
              </div>

              {grouped[col.key].map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onEdit={() => setEditing(task)}
                  onDelete={() => setDeleting(task)}
                />
              ))}

              <button className="col-add" onClick={() => setEditing({ status: col.key })}>
                + Add task
              </button>
            </div>
          ))}
        </div>
      </div>

      {editing && (
        <TaskModal
          projectId={projectId}
          task={editing._id ? editing : null}
          defaultStatus={editing.status || 'todo'}
          onClose={() => setEditing(null)}
          onSaved={(isNew) => {
            setEditing(null);
            toast.success(isNew ? 'Task added' : 'Task updated');
            load();
          }}
        />
      )}

      {deleting && (
        <ConfirmDialog
          title="Delete task?"
          message={`“${deleting.title}” will be permanently removed.`}
          onCancel={() => setDeleting(null)}
          onConfirm={async () => {
            try {
              await tasksApi.remove(deleting._id);
              toast.success('Task deleted');
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

function TaskCard({ task, onEdit, onDelete }) {
  return (
    <div
      className="task"
      draggable
      onDragStart={(e) => {
        window.__draggingTaskId = task._id;
        e.currentTarget.classList.add('dragging');
      }}
      onDragEnd={(e) => {
        window.__draggingTaskId = null;
        e.currentTarget.classList.remove('dragging');
      }}
    >
      <div className="task-title">{task.title}</div>
      {task.description && <div className="task-desc">{task.description}</div>}
      <div className="task-foot">
        <span style={{ fontSize: '0.72rem', color: 'var(--ink-faint)' }}>
          {new Date(task.createdAt).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
          })}
        </span>
        <span className="task-actions">
          <button title="Edit" onClick={onEdit}>
            <Icon.Edit width={15} height={15} />
          </button>
          <button className="del" title="Delete" onClick={onDelete}>
            <Icon.Trash width={15} height={15} />
          </button>
        </span>
      </div>
    </div>
  );
}

function TaskModal({ projectId, task, defaultStatus, onClose, onSaved }) {
  const isNew = !task;
  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || defaultStatus,
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async () => {
    if (!form.title.trim()) return setError('Task title is required.');
    setBusy(true);
    setError('');
    try {
      if (isNew) await tasksApi.create({ ...form, projectId });
      else await tasksApi.update(task._id, form);
      onSaved(isNew);
    } catch (err) {
      setError(getApiError(err));
      setBusy(false);
    }
  };

  return (
    <Modal
      title={isNew ? 'Add task' : 'Edit task'}
      subtitle={isNew ? 'Describe what needs to get done.' : 'Update this task.'}
      onClose={onClose}
    >
      <div className="modal-body">
        {error && (
          <div className="form-error">
            <Icon.Alert width={16} height={16} /> <span>{error}</span>
          </div>
        )}
        <div className="field">
          <label>Title</label>
          <input
            name="title"
            className="input"
            value={form.title}
            onChange={onChange}
            placeholder="Design the landing page"
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
            placeholder="Optional details…"
          />
        </div>
        <div className="field">
          <label>Status</label>
          <select name="status" className="select" value={form.status} onChange={onChange}>
            <option value="todo">To do</option>
            <option value="in-progress">In progress</option>
            <option value="done">Done</option>
          </select>
        </div>
      </div>
      <div className="modal-foot">
        <button className="btn btn-ghost" onClick={onClose} disabled={busy}>
          Cancel
        </button>
        <button className="btn btn-primary" onClick={submit} disabled={busy}>
          {busy ? <Spinner /> : isNew ? 'Add task' : 'Save changes'}
        </button>
      </div>
    </Modal>
  );
}
