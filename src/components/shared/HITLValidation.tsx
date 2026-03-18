import { useState } from 'react';
import { Check, X, AlertCircle, ChevronRight, Clock, MessageSquare } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export interface ValidationTask {
  id: string;
  title: string;
  description: string;
  type: 'confirm' | 'anomaly' | 'override';
  source: string;
  timestamp: Date;
  status: 'pending' | 'approved' | 'rejected';
  data?: Record<string, unknown>;
}

interface ValidationPromptProps {
  task: ValidationTask;
  onApprove: (id: string, comment?: string) => void;
  onReject: (id: string, comment?: string) => void;
  onViewDetails?: (id: string) => void;
}

export function ValidationPrompt({ task, onApprove, onReject, onViewDetails }: ValidationPromptProps) {
  const { t } = useLanguage();
  const [comment, setComment] = useState('');
  const [showComment, setShowComment] = useState(false);

  const typeConfig = {
    confirm: { label: 'Confirm Data', color: 'text-blue-600', bg: 'bg-blue-50' },
    anomaly: { label: 'Anomaly Check', color: 'text-amber-600', bg: 'bg-amber-50' },
    override: { label: 'Override Request', color: 'text-red-600', bg: 'bg-red-50' },
  };

  const config = typeConfig[task.type];

  return (
    <div className="bg-white border border-surface-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${config.bg}`}>
          <AlertCircle className={`w-5 h-5 ${config.color}`} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-medium px-2 py-0.5 rounded ${config.bg} ${config.color}`}>
              {config.label}
            </span>
            <span className="text-xs text-surface-500 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatTimeAgo(task.timestamp)}
            </span>
          </div>

          <h4 className="font-medium text-surface-900 text-sm">{task.title}</h4>
          <p className="text-sm text-surface-600 mt-1">{task.description}</p>
          <p className="text-xs text-surface-500 mt-2">Source: {task.source}</p>

          <div className="mt-3">
            <button
              type="button"
              onClick={() => setShowComment(!showComment)}
              className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              {showComment ? 'Hide Comment' : 'Add Comment'}
            </button>
            {showComment && (
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add comments or explanations (optional)..."
                className="mt-2 w-full text-sm border border-surface-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none bg-surface-50 text-surface-900 placeholder:text-surface-400"
                rows={3}
              />
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-surface-100">
        {onViewDetails && (
          <button
            onClick={() => onViewDetails(task.id)}
            className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700"
          >
            {t('common.seeDetails')}
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={() => onReject(task.id, comment || undefined)}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            aria-label="Reject"
          >
            <X className="w-4 h-4" />
            No
          </button>
          <button
            onClick={() => onApprove(task.id, comment || undefined)}
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-500 text-white hover:bg-green-600 rounded-lg transition-colors"
            aria-label="Approve"
          >
            <Check className="w-4 h-4" />
            Yes
          </button>
        </div>
      </div>
    </div>
  );
}

interface TaskListWidgetProps {
  tasks: ValidationTask[];
  onApprove: (id: string, comment?: string) => void;
  onReject: (id: string, comment?: string) => void;
  onViewDetails?: (id: string) => void;
  maxVisible?: number;
}

export function TaskListWidget({ tasks, onApprove, onReject, onViewDetails, maxVisible = 3 }: TaskListWidgetProps) {
  const [expanded, setExpanded] = useState(false);
  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const visibleTasks = expanded ? pendingTasks : pendingTasks.slice(0, maxVisible);

  if (pendingTasks.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-card p-6">
        <h3 className="font-semibold text-surface-900 mb-4">Validation Tasks</h3>
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Check className="w-6 h-6 text-green-600" />
          </div>
          <p className="text-surface-600">No pending validations</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-card p-4 lg:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-surface-900">Validation Tasks</h3>
        <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
          {pendingTasks.length} pending
        </span>
      </div>

      <div className="space-y-3">
        {visibleTasks.map(task => (
          <ValidationPrompt
            key={task.id}
            task={task}
            onApprove={onApprove}
            onReject={onReject}
            onViewDetails={onViewDetails}
          />
        ))}
      </div>

      {pendingTasks.length > maxVisible && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full mt-4 py-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          {expanded ? 'Show Less' : `Show ${pendingTasks.length - maxVisible} More`}
        </button>
      )}
    </div>
  );
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);

  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function ConfirmationDialog({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel = 'Yes',
  cancelLabel = 'No',
  type = 'confirm',
}: {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  type?: 'confirm' | 'warning' | 'danger';
}) {
  if (!isOpen) return null;

  const buttonStyles = {
    confirm: 'bg-primary-500 hover:bg-primary-600',
    warning: 'bg-amber-500 hover:bg-amber-600',
    danger: 'bg-red-500 hover:bg-red-600',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-900/50 backdrop-blur-sm">
      <div
        className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
      >
        <h2 id="dialog-title" className="text-lg font-semibold text-surface-900 mb-2">
          {title}
        </h2>
        <p className="text-surface-600 mb-6">{message}</p>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm text-surface-600 hover:bg-surface-100 rounded-lg transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-sm text-white rounded-lg transition-colors ${buttonStyles[type]}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
