import React from 'react';
import { useCalendar } from '../hooks/useCalendar';
import Calendar from '../components/Calendar/Calendar';

const MonthView: React.FC = () => {
    const { currentMonth, events } = useCalendar();

    return (
        <div className="month-view">
            <h1 className="text-2xl font-bold mb-4">{currentMonth}</h1>
            <Calendar events={events} view="month" />
        </div>
    );
};

export default MonthView;