import { useState, useEffect, useRef } from 'react';
import { getFromLocalStorage, saveToLocalStorage } from '../services/storage';
import { syncTasksToFirestore } from '../services/gameProgress';
import { getAuth } from 'firebase/auth';

const TASKS_KEY = 'adhd_tasks';
const EVENTS_KEY = 'adhd_events';

const useCalendar = () => {
    const [events, setEvents] = useState<Record<string, string[]>>(() => getFromLocalStorage(EVENTS_KEY) || {});
    const [tasks, setTasks] = useState<any[]>(() => getFromLocalStorage(TASKS_KEY) || []);
    const [loading, setLoading] = useState(false);
    const isRestoringRef = useRef(true); // Flag to prevent syncing during initial Firestore restoration

    // After a short delay, allow syncing (Dashboard will have restored tasks by then)
    useEffect(() => {
        const timer = setTimeout(() => {
            isRestoringRef.current = false;
            console.log('[useCalendar] Restoration period ended, syncing enabled');
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        // persist tasks when they change
        try {
            console.log('[useCalendar] Tasks changed, saving to localStorage:', tasks.length, 'tasks', tasks);
            saveToLocalStorage(TASKS_KEY, tasks);
            // Also sync to Firestore if user is logged in AND we're not in restoration phase
            const auth = getAuth();
            if (auth.currentUser && !isRestoringRef.current) {
                console.log('[useCalendar] Syncing', tasks.length, 'tasks to Firestore...');
                syncTasksToFirestore(tasks).catch(err => console.warn('[useCalendar] Failed to sync tasks:', err));
            } else if (!isRestoringRef.current) {
                console.log('[useCalendar] Not syncing - user not logged in');
            } else {
                console.log('[useCalendar] Skipping sync - still in restoration period');
            }
        } catch {}
    }, [tasks]);

    useEffect(() => {
        try {
            saveToLocalStorage(EVENTS_KEY, events);
        } catch {}
    }, [events]);

    const addEvent = (date: Date, title: string) => {
        const key = date.toDateString();
        setEvents((prev) => {
            const next = { ...prev };
            next[key] = [...(next[key] || []), title];
            return next;
        });
    };

    const removeEvent = (date: Date, index: number) => {
        const key = date.toDateString();
        setEvents((prev) => {
            const next = { ...prev };
            if (!next[key]) return prev;
            next[key] = next[key].filter((_, i) => i !== index);
            return next;
        });
    };

    const addTask = (task: any) => {
        console.log('[useCalendar.addTask] Adding task:', task);
        const taskWithTimestamp = { ...task, createdAt: Date.now() };
        setTasks((prev) => {
            console.log('[useCalendar.addTask] Updating tasks state from', prev.length, 'to', prev.length + 1);
            return [...prev, taskWithTimestamp];
        });
    };

    const removeTask = (taskId: number) => {
        setTasks((prev) => prev.filter(t => t.id !== taskId));
    };

    const updateTask = (updated: any) => {
        setTasks((prev) => prev.map(t => (t.id === updated.id ? { ...t, ...updated } : t)));
    };

    return { events, tasks, loading, addEvent, removeEvent, addTask, removeTask, updateTask };
};

export default useCalendar;
export { useCalendar };