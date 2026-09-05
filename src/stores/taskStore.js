import { create } from 'zustand';
import { getUserTasks, createTask, updateTask, toggleSubtask, deleteTask } from '../services/taskService';

const useTaskStore = create((set, get) => ({
  tasks: [],
  loading: false,
  error: null,

  fetchTasks: async (userId) => {
    set({ loading: true, error: null });
    try {
      const tasks = await getUserTasks(userId);
      set({ tasks, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  addTask: async (userId, taskData) => {
    const id = await createTask(userId, taskData);
    await get().fetchTasks(userId);
    return id;
  },

  updateTask: async (taskId, updates, userId) => {
    await updateTask(taskId, updates);
    await get().fetchTasks(userId);
  },

  toggleSubtask: async (taskId, subtasks, userId) => {
    await toggleSubtask(taskId, subtasks);
    await get().fetchTasks(userId);
  },

  deleteTask: async (taskId, userId) => {
    await deleteTask(taskId);
    set(s => ({ tasks: s.tasks.filter(t => t.id !== taskId) }));
  },

  getUpcomingTasks: () => {
    return get().tasks
      .filter(t => t.status !== 'done')
      .sort((a, b) => {
        const da = a.deadline?.toDate ? a.deadline.toDate() : new Date(a.deadline || 9999999999999);
        const db2 = b.deadline?.toDate ? b.deadline.toDate() : new Date(b.deadline || 9999999999999);
        return da - db2;
      })
      .slice(0, 5);
  },
}));

export default useTaskStore;
