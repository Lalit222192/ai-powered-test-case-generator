const slug = (s) => s.toLowerCase().replace(/\s+/g, '-');

export const StatusBadge = ({ status }) => <span className={`badge status-${slug(status)}`}>{status}</span>;
export const PriorityBadge = ({ priority }) => <span className={`badge priority-${slug(priority)}`}>{priority}</span>;

export function SourceBadge({ meta }) {
  if (!meta) return null;
  return meta.source === 'ai' ? (
    <span className="badge source-ai">AI-generated{meta.model ? ` (${meta.model})` : ''}</span>
  ) : (
    <span className="badge source-demo">DEMO result - not AI-generated</span>
  );
}
