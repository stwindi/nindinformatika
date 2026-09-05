import { motion } from 'framer-motion';
import { Calendar, Clock, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import SubjectBadge from './SubjectBadge';
import ProgressBar from './ProgressBar';
import { getDaysUntilDeadline } from '../services/taskService';
import useTaskStore from '../stores/taskStore';
import useAuthStore from '../stores/authStore';
import toast from 'react-hot-toast';

const priorityConfig = {
  high:   { label: 'Prioritas Tinggi', color: 'text-red-600 bg-red-50',    dot: 'bg-red-500' },
  medium: { label: 'Sedang',           color: 'text-amber-600 bg-amber-50', dot: 'bg-amber-500' },
  low:    { label: 'Rendah',           color: 'text-green-600 bg-green-50', dot: 'bg-green-500' },
};

const statusConfig = {
  todo:          { label: 'Belum dimulai',     color: 'text-gray-500' },
  'in-progress': { label: 'Sedang dikerjakan', color: 'text-cyan-600' },
  done:          { label: 'Selesai ✓',         color: 'text-emerald-600' },
};

export default function TaskCard({ task }) {
  const { deleteTask } = useTaskStore();
  const { user } = useAuthStore();
  const daysLeft = getDaysUntilDeadline(task.deadline);
  const priority = priorityConfig[task.priority] || priorityConfig.medium;
  const status = statusConfig[task.status] || statusConfig.todo;

  const deadlineColor =
    daysLeft === null ? 'text-gray-400'
    : daysLeft <= 0   ? 'text-red-600 font-semibold'
    : daysLeft <= 1   ? 'text-red-500'
    : daysLeft <= 3   ? 'text-amber-600'
    : 'text-gray-500';

  const deadlineText =
    daysLeft === null ? 'Tidak ada deadline'
    : daysLeft < 0   ? `Terlambat ${Math.abs(daysLeft)} hari!`
    : daysLeft === 0 ? 'Deadline hari ini!'
    : daysLeft === 1 ? 'Deadline besok!'
    : `${daysLeft} hari lagi`;

  const handleDelete = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm(`Hapus tugas "${task.title}"?`)) {
      await deleteTask(task.id, user.uid);
      toast.success('Tugas dihapus');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Link to={`/tasks/${task.id}`} className="block">
        <div className={`bg-white rounded-2xl p-5 shadow-card border border-gray-100 hover:shadow-card-hover transition-all duration-200 ${
          task.status === 'done' ? 'opacity-70' : ''
        }`}>
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <h3 className={`font-semibold text-gray-900 text-sm leading-snug mb-1 ${
                task.status === 'done' ? 'line-through text-gray-400' : ''
              }`}>
                {task.title}
              </h3>
              <SubjectBadge subject={task.subject} size="xs" />
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${priority.color}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${priority.dot}`} />
                {priority.label}
              </span>
              <button
                onClick={handleDelete}
                className="p-1.5 rounded-lg hover:bg-red-50 hover:text-red-500 text-gray-400 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          <ProgressBar
            value={task.progress || 0}
            color={task.progress === 100 ? 'emerald' : daysLeft !== null && daysLeft <= 3 ? 'amber' : 'primary'}
            size="sm"
          />

          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-3">
              <span className={`flex items-center gap-1 text-xs ${deadlineColor}`}>
                <Calendar size={12} />
                {deadlineText}
              </span>
              {task.subtasks?.length > 0 && (
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <Clock size={12} />
                  {task.subtasks.filter(s => s.done).length}/{task.subtasks.length} subtask
                </span>
              )}
            </div>
            <span className={`text-xs font-medium ${status.color}`}>{status.label}</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
