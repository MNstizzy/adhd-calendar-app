import React, { createContext, useContext, useState, ReactNode } from 'react';

interface CalendarEvent {
    id: string;
    title: string;
    date: string;
    time?: string;
    description?: string;
}

interface CalendarContextType {
    events: CalendarEvent[];
    addEvent: (event: CalendarEvent) => void;
    removeEvent: (id: string) => void;
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

export const CalendarProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [events, setEvents] = useState<CalendarEvent[]>([]);

    const addEvent = (event: CalendarEvent) => {
        setEvents((prevEvents) => [...prevEvents, event]);
    };

    const removeEvent = (id: string) => {
        setEvents((prevEvents) => prevEvents.filter(event => event.id !== id));
    };

    return (
        <CalendarContext.Provider value={{ events, addEvent, removeEvent }}>
            {children}
        </CalendarContext.Provider>
    );
};

export const useCalendar = () => {
    const context = useContext(CalendarContext);
    if (context === undefined) {
        throw new Error('useCalendar must be used within a CalendarProvider');
    }
    return context;
};