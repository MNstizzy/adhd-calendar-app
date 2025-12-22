import React from 'react';
import { useCalendar } from '../hooks/useCalendar';
import WeekRow from '../components/Calendar/WeekRow';
import TaskCard from '../components/Task/TaskCard';

const WeekView: React.FC = () => {
    const { events, tasks } = useCalendar();

    return (
        <div className="week-view">
            <h1 className="text-2xl font-bold">Weekly Overview</h1>
            <div className="week-rows">
                {events.map((event, index) => (
                    <WeekRow key={index} event={event} />
                ))}
            </div>
            <div className="tasks">
                {tasks.map((task, index) => (
                    <TaskCard key={index} task={task} />
                ))}
            </div>
        </div>
    );
};

export default WeekView;