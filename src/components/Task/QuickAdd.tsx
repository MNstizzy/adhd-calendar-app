import React, { useState, useMemo } from 'react';

const QuickAdd: React.FC<{ onAdd: (task: string, due?: string) => void }> = ({ onAdd }) => {
    const [task, setTask] = useState('');
    const [due, setDue] = useState<string>('');
    const [showPicker, setShowPicker] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (task.trim()) {
            onAdd(task, due || undefined);
            setTask('');
            setDue('');
            setShowPicker(false);
        }
    };

    const MiniCalendar: React.FC<{ onPick: (d: Date) => void; initial?: Date }> = ({ onPick, initial }) => {
        const today = initial || new Date();
        const [displayDate, setDisplayDate] = useState<Date>(new Date(today.getFullYear(), today.getMonth(), 1));

        const year = displayDate.getFullYear();
        const month = displayDate.getMonth();

        const weeks = useMemo(() => {
            const weeks: Date[][] = [];
            const first = new Date(year, month, 1);
            let current = new Date(first);
            current.setDate(current.getDate() - current.getDay());
            while (weeks.length < 6) {
                const week: Date[] = [];
                for (let i = 0; i < 7; i++) {
                    week.push(new Date(current));
                    current.setDate(current.getDate() + 1);
                }
                weeks.push(week);
            }
            return weeks;
        }, [year, month]);

        const prev = () => setDisplayDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
        const next = () => setDisplayDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));

        return (
            <div style={{width:280}} className="panel day-popup">
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                    <button className="btn ghost" onClick={prev}>◀</button>
                    <div>{displayDate.toLocaleString(undefined,{month:'long', year:'numeric'})}</div>
                    <button className="btn ghost" onClick={next}>▶</button>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:6}}>
                    {['S','M','T','W','T','F','S'].map(d => (
                        <div key={d} style={{textAlign:'center',fontSize:12,color:'var(--muted)'}}>{d}</div>
                    ))}
                </div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:6,marginTop:6}}>
                    {weeks.flat().map((d,i) => {
                        const isCurrentMonth = d.getMonth() === month;
                        return (
                            <button
                                key={i}
                                onClick={() => onPick(new Date(d.getFullYear(), d.getMonth(), d.getDate()))}
                                className="btn ghost"
                                style={{padding:8,opacity:isCurrentMonth?1:0.35, minWidth:0}}
                            >
                                {d.getDate()}
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    };

    const pickDate = (d: Date) => {
        // store full ISO to be safe
        setDue(new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString());
        setShowPicker(false);
    };

    const displayDue = due ? new Date(due).toLocaleDateString() : '';
    const [showTime, setShowTime] = useState(false);
    const [hour, setHour] = useState<number>(() => due ? new Date(due).getHours() : 9);
    const [minute, setMinute] = useState<number>(() => due ? new Date(due).getMinutes() : 0);
    const timeLabel = due ? new Date(due).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

    const applyTime = () => {
        const base = due ? new Date(due) : new Date();
        const combined = new Date(base.getFullYear(), base.getMonth(), base.getDate(), hour, minute);
        setDue(combined.toISOString());
        setShowTime(false);
    };
    return (
        <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:8,position:'relative'}}>
            <input
                type="text"
                value={task}
                onChange={(e) => setTask(e.target.value)}
                placeholder="Add a new task..."
                className="input"
            />

            <div style={{display:'flex',gap:8,alignItems:'center'}}>
                <button type="button" className="btn ghost" onClick={() => setShowPicker(s => !s)}>{displayDue || 'Set due date'}</button>
                <div style={{flex:1}} />
            </div>

            {showPicker && (
                <div style={{position:'absolute',left:0,top:'100%',marginTop:8,zIndex:400}}>
                    <MiniCalendar onPick={pickDate} initial={due ? new Date(due) : undefined} />
                </div>
            )}

            <div style={{display:'flex',gap:8,alignItems:'center'}}>
                <button type="button" className="btn ghost" onClick={() => setShowTime(t => !t)}>{timeLabel || 'Set time'}</button>
                <div style={{flex:1}} />
            </div>

            {showTime && (
                <div style={{position:'absolute',left:0,top:'100%',marginTop:8,zIndex:400}}>
                    <div className="panel day-popup" style={{padding:12}}>
                        <div style={{display:'flex',gap:8,alignItems:'center'}}>
                            <select value={hour} onChange={(e) => setHour(Number(e.target.value))}>
                                {Array.from({length:24}).map((_,i)=> <option key={i} value={i}>{String(i).padStart(2,'0')}</option>)}
                            </select>
                            :
                            <select value={minute} onChange={(e) => setMinute(Number(e.target.value))}>
                                {Array.from({length:12}).map((_,i)=> <option key={i} value={i*5}>{String(i*5).padStart(2,'0')}</option>)}
                            </select>
                            <div style={{flex:1}} />
                            <button className="btn" onClick={applyTime}>Apply</button>
                        </div>
                    </div>
                </div>
            )}

            <div style={{display:'flex',gap:8}}>
                <button type="submit" className="btn">Add Task</button>
                <button type="button" className="btn ghost" onClick={() => { setTask(''); setDue(''); setShowPicker(false); }}>Clear</button>
            </div>
        </form>
    );
};

export default QuickAdd;