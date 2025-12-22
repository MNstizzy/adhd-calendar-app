export type Task = {
    id: string;
    title: string;
    description?: string;
    dueDate: Date;
    completed: boolean;
};

export type CalendarEvent = {
    id: string;
    title: string;
    start: Date;
    end: Date;
    description?: string;
};

export type Preferences = {
    theme: 'light' | 'dark';
    notificationsEnabled: boolean;
};

export type FocusTimerState = {
    isActive: boolean;
    duration: number; // in seconds
    elapsed: number; // in seconds
};