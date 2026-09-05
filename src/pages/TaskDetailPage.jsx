import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, Circle, Clock, Calendar } from 'lucide-react';
import useTaskStore from '../stores/taskStore';
import useAuthStore from '../stores/authStore';
import SubjectBadge from '../components/SubjectBadge';
import ProgressBar from '../components/ProgressBar';
import { getDaysUntilDeadline } from '../services/taskService';
import toast from 'react-hot-toast';

export default function TaskDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { tasks, toggleSubtask, updateTask } = useTaskStore();
  const { user } = useAuthStore();
  const [task, setTask] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const found = tasks.find(t => t.id === id);
    if (found) setTask(found);
  }, [id, tasks]);

  if (!task) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-5xl mb-4">🔍</div>
        <p className="text-gray-500">Tugas tidak ditemukan</p>
        <button
          onClick={() => navigate('/tasks')}
          className="mt-4 px-6 py-2 gradient-primary text-white rounded-2xl text-sm font-semibold"
        >
          Kembali ke Daftar Tugas
        </button>
      </div>
    </div>
  );

  const daysLeft = getDaysUntilDeadline(task.deadline);
  const deadlineDate = task.deadline?.toDate
    ? task.deadline.toDate()
    : task.deadline
    ? new Date(task.deadline)
    : null;

  const handleToggleSubtask = async (subtaskId) => {
    setSaving(true);
    const updatedSubtasks = task.subtasks.map(s =>
      s.id === subtaskId ? { ...s, done: !s.done } : s
    );
    await toggleSubtask(task.id, updatedSubtasks, user.uid);
    setSaving(false);
  };

  const handleMarkDone = async () => {
    setSaving(true);
    if (task.subtasks && task.subtasks.length > 0) {
      const allDone = task.subtasks.map(s => ({ ...s, done: true }));
      await toggleSubtask(task.id, allDone, user.uid);
    } else {
      await updateTask(task.id, { status: 'done', progress: 100 }, user.uid);
    }
    toast.success('Tugas selesai! 🎉 Great job!');
    setSaving(false);
  };

  const totalMinutes = task.subtasks?.reduce((acc, s) => acc + (s.estimatedMinutes || 0), 0) || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 pt-8 pb-5">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => navigate('/tasks')}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600 mb-5 transition-colors"
          >
            <ArrowLeft size={16} /> Kembali ke daftar tugas
          </button>

          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <SubjectBadge subject={task.subject} />
              <h1
                className="text-xl font-extrabold text-gray-900 mt-2 mb-1"
                style={{ fontFamily: 'Plus Jakarta Sans' }}
              >
                {task.title}
              </h1>
              {task.description && (
                <p className="text-sm text-gray-500">{task.description}</p>
              )}
            </div>
            {task.status !== 'done' && (
              <button
                onClick={handleMarkDone}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white text-sm font-semibold rounded-2xl hover:bg-emerald-600 transition-colors disabled:opacity-60 flex-shrink-0"
              >
                <CheckCircle size={16} /> Selesai!
              </button>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 mt-4 flex-wrap">
            {deadlineDate && (
              <span className={`flex items-center gap-1.5 text-sm font-medium ${
                daysLeft !== null && daysLeft <= 1 ? 'text-red-600'
                : daysLeft !== null && daysLeft <= 3 ? 'text-amber-600'
                : 'text-gray-600'
              }`}>
                <Calendar size={14} />
                {deadlineDate.toLocaleDateString('id-ID', {
                  day: 'numeric', month: 'long', year: 'numeric'
                })}
                {daysLeft !== null && (
                  <span className="ml-1 text-xs opacity-70">
                    ({daysLeft > 0 ? `${daysLeft} hari lagi` : daysLeft === 0 ? 'Hari ini!' : 'Terlambat!'})
                  </span>
                )}
              </span>
            )}
            {totalMinutes > 0 && (
              <span className="flex items-center gap-1.5 text-sm text-gray-500">
                <Clock size={14} />
                ~{totalMinutes >= 60
                  ? `${Math.floor(totalMinutes / 60)} jam ${totalMinutes % 60 > 0 ? `${totalMinutes % 60} mnt` : ''}`
                  : `${totalMinutes} menit`}
              </span>
            )}
          </div>

          {/* Progress */}
          <div className="mt-5">
            <ProgressBar
              value={task.progress || 0}
              color={task.progress === 100 ? 'emerald' : daysLeft !== null && daysLeft <= 3 ? 'amber' : 'primary'}
              size="lg"
              showLabel
            />
          </div>
        </div>
      </div>

      {/* Subtasks */}
      <div className="max-w-2xl mx-auto px-6 py-6">
        <h2 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wide">
          Langkah-langkah ({task.subtasks?.filter(s => s.done).length}/{task.subtasks?.length || 0} selesai)
        </h2>

        {(!task.subtasks || task.subtasks.length === 0) && (
          <div className="text-center py-10">
            <div className="text-4xl mb-3">📝</div>
            <p className="text-gray-500 text-sm">
              Tidak ada subtask. Tandai tugas ini sebagai selesai dengan tombol di atas.
            </p>
          </div>
        )}

        <div className="space-y-2">
          {task.subtasks?.map((subtask, i) => (
            <motion.div
              key={subtask.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => !saving && handleToggleSubtask(subtask.id)}
              className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all duration-200 ${
                subtask.done
                  ? 'bg-emerald-50 border border-emerald-200'
                  : 'bg-white border border-gray-100 hover:border-primary-200 hover:bg-primary-50/30 shadow-card'
              }`}
            >
              <div className={`flex-shrink-0 transition-colors duration-200 ${
                subtask.done ? 'text-emerald-500' : 'text-gray-300 hover:text-primary-400'
              }`}>
                {subtask.done ? <CheckCircle size={22} /> : <Circle size={22} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${
                  subtask.done ? 'line-through text-gray-400' : 'text-gray-800'
                }`}>
                  {subtask.title}
                </p>
              </div>
              {subtask.estimatedMinutes && (
                <span className="text-xs text-gray-400 flex-shrink-0 flex items-center gap-1">
                  <Clock size={11} /> {subtask.estimatedMinutes}m
                </span>
              )}
            </motion.div>
          ))}
        </div>

        {task.status === 'done' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-6 p-6 bg-emerald-50 rounded-3xl text-center border border-emerald-200"
          >
            <div className="text-4xl mb-2">🎉</div>
            <h3 className="font-bold text-emerald-700 text-lg">Tugas Selesai!</h3>
            <p className="text-emerald-600 text-sm mt-1">
              Hebat! Kamu berhasil menyelesaikan semua langkah. Keep it up!
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
