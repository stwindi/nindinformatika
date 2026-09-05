import {
  collection, addDoc, updateDoc, deleteDoc, doc, getDocs,
  query, where, orderBy, serverTimestamp, Timestamp
} from 'firebase/firestore';
import { db } from './firebase';

const TASKS = 'tasks';

export async function createTask(userId, taskData) {
  const deadlineDate = taskData.deadline instanceof Date
    ? Timestamp.fromDate(taskData.deadline)
    : taskData.deadline;

  const docRef = await addDoc(collection(db, TASKS), {
    userId,
    title: taskData.title,
    subject: taskData.subject || 'Umum',
    deadline: deadlineDate,
    priority: taskData.priority || 'medium',
    description: taskData.description || '',
    status: 'todo',
    subtasks: (taskData.subtasks || []).map((s, i) => ({
      id: `sub_${i}_${Date.now()}`,
      title: s.title,
      estimatedMinutes: s.estimatedMinutes || 30,
      done: false,
    })),
    progress: 0,
    remindersSent: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getUserTasks(userId) {
  const q = query(
    collection(db, TASKS),
    where('userId', '==', userId),
    orderBy('deadline', 'asc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function updateTask(taskId, updates) {
  await updateDoc(doc(db, TASKS, taskId), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

export async function toggleSubtask(taskId, subtasks) {
  const done = subtasks.filter(s => s.done).length;
  const progress = subtasks.length > 0 ? Math.round((done / subtasks.length) * 100) : 0;
  const status = progress === 100 ? 'done' : progress > 0 ? 'in-progress' : 'todo';
  await updateDoc(doc(db, TASKS, taskId), {
    subtasks,
    progress,
    status,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteTask(taskId) {
  await deleteDoc(doc(db, TASKS, taskId));
}

export function getDaysUntilDeadline(deadline) {
  if (!deadline) return null;
  const deadlineDate = deadline.toDate ? deadline.toDate() : new Date(deadline);
  const now = new Date();
  const diff = deadlineDate - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}
