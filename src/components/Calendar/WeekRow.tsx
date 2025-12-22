import React from 'react';
import DayCell from './DayCell';

interface WeekRowProps {
  days: Date[];
  onDayClick?: (date: Date, e: React.MouseEvent<HTMLDivElement>) => void;
}

const WeekRow: React.FC<WeekRowProps> = ({ days, onDayClick = () => {} }) => {
  return (
    <>
      {days.map((day, index) => (
        <DayCell key={index} date={day} onClick={onDayClick} />
      ))}
    </>
  );
};

export default WeekRow;