import React from 'react';
import { useParams } from 'react-router-dom';
import { useCalendar } from '../hooks/useCalendar';
import TaskCard from '../components/Task/TaskCard';

const DayView = () => {
    const { date } = useParams();
    const { getTasksForDate } = useCalendar();
    const tasks = getTasksForDate(date);

    return (
        <div className="day-view">
            <h1 className="text-2xl font-bold">Tasks for {date}</h1>
            <div className="tasks-list">
                {tasks.length > 0 ? (
                    tasks.map(task => (
                        <TaskCard key={task.id} task={task} />
                    ))
                ) : (
                    <p>No tasks for this day.</p>
                )}
            </div>
        </div>
    );
};

export default DayView;