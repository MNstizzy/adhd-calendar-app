import React from 'react';

interface DayCellProps {
  date: Date;
  events?: string[];
  onClick?: (date: Date, e: React.MouseEvent<HTMLDivElement>) => void;
}

const DayCell: React.FC<DayCellProps> = ({ date, events = [], onClick = () => {} }) => {
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    onClick(date, e);
  };

  const handleKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      // cast to any to mimic click
      onClick(date, (e as unknown) as React.MouseEvent<HTMLDivElement>);
    }
  };

  return (
    <div 
      className="day-cell clickable" 
      onClick={handleClick} 
      role="button" 
      tabIndex={0} 
      onKeyDown={handleKey}
      style={events.length > 0 ? {
        background: 'linear-gradient(135deg, var(--primary)15 0%, var(--accent)15 100%)',
      } : {}}
    >
      <div className="date">{date.getDate()}</div>
      <div className="events">
        {events.map((event, index) => (
          <div key={index} className="event">
            {event}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DayCell;