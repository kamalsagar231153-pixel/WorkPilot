import { Icon } from './Icon';

export const Spinner = ({ lg }) => <span className={`spinner ${lg ? 'lg' : ''}`} />;

export const Loading = () => (
  <div className="spinner-center">
    <Spinner lg />
  </div>
);

export const ErrorState = ({ message, onRetry }) => (
  <div className="state error">
    <span className="icon">
      <Icon.Alert width={26} height={26} />
    </span>
    <h3>Couldn’t load this</h3>
    <p>{message || 'Something went wrong while talking to the server.'}</p>
    {onRetry && (
      <button className="btn btn-ghost" onClick={onRetry}>
        Try again
      </button>
    )}
  </div>
);

export const EmptyState = ({ title, hint, action }) => (
  <div className="state">
    <span className="icon">
      <Icon.Inbox width={26} height={26} />
    </span>
    <h3>{title}</h3>
    {hint && <p>{hint}</p>}
    {action}
  </div>
);
