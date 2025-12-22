import React, { useState, useMemo, useEffect } from 'react';

const TaskCard: React.FC<{ task: any; timeUntilXp?: number; xpAmount?: number; onComplete?: () => void; onUpdate?: (t:any) => void; onRemove?: () => void }> = ({ task, timeUntilXp = 0, xpAmount = 20, onComplete = () => {}, onUpdate = () => {}, onRemove = () => {} }) => {
    const [editing, setEditing] = useState(false);
    const [title, setTitle] = useState(task.title || '');
    const [description, setDescription] = useState(task.description || '');
    const [dueDate, setDueDate] = useState(task.dueDate || '');
    const [displayTime, setDisplayTime] = useState(timeUntilXp);

    const save = () => {
        onUpdate({ ...task, title, description, dueDate });
        setEditing(false);
    };

    const [showPicker, setShowPicker] = useState(false);
    const [showTime, setShowTime] = useState(false);
    const [hour, setHour] = useState<number>(() => dueDate ? new Date(dueDate).getHours() : 9);
    const [minute, setMinute] = useState<number>(() => dueDate ? new Date(dueDate).getMinutes() : 0);

    // Update timer every second
    useEffect(() => {
        if (displayTime <= 0) return;
        const interval = setInterval(() => {
            setDisplayTime((t) => Math.max(0, t - 1000));
        }, 1000);
        return () => clearInterval(interval);
    }, [displayTime]);

    const applyTime = () => {
        const base = dueDate ? new Date(dueDate) : new Date();
        const combined = new Date(base.getFullYear(), base.getMonth(), base.getDate(), hour, minute);
        setDueDate(combined.toISOString());
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

        return (
            <div className="panel day-popup" style={{width:280}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                    <button className="btn ghost" onClick={() => setDisplayDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))}>◀</button>
                    <div>{displayDate.toLocaleString(undefined,{month:'long', year:'numeric'})}</div>
                    <button className="btn ghost" onClick={() => setDisplayDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))}>▶</button>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:6}}>
                    {['S','M','T','W','T','F','S'].map(d => (
                        <div key={d} style={{textAlign:'center',fontSize:12,color:'var(--muted)'}}>{d}</div>
                    ))}
                </div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:6,marginTop:6}}>
                    {weeks.flat().map((d,i) => (
                        <button key={i} className="btn ghost" style={{padding:8, minWidth:0, opacity: d.getMonth() === month ? 1 : 0.35}} onClick={() => onPick(new Date(d.getFullYear(), d.getMonth(), d.getDate()))}>{d.getDate()}</button>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="task-card">
            {!editing ? (
                <>
                    <div className="task-content">
                        <h3 style={{margin:0}}>{task.title}</h3>
                        {task.description && <div className="subtle" style={{marginTop:6}}>{task.description}</div>}
                        {task.dueDate && <div className="subtle" style={{marginTop:6}}>Due: {task.dueDate.includes('T') ? new Date(task.dueDate).toLocaleString() : new Date(task.dueDate + 'T00:00:00').toLocaleString()}</div>}
                        {displayTime > 0 && (
                            <div className="subtle" style={{marginTop:6,color:'var(--accent)'}}>
                                +{xpAmount} XP in {Math.ceil(displayTime / 1000)}s
                            </div>
                        )}
                    </div>
                    <div className="task-actions">
                        <button className="btn ghost" onClick={() => setEditing(true)}>Edit</button>
                        <button className="btn ghost" onClick={onComplete} disabled={displayTime > 0}>Done</button>
                        <button className="btn ghost" onClick={onRemove}>Delete</button>
                    </div>
                </>
            ) : (
                <div className="task-edit">
                    <div style={{display:'flex',flexDirection:'column',gap:8,width: '100%'}}>
                        <input className="input" value={title} onChange={e => setTitle(e.target.value)} />
                        <input className="input" value={description} onChange={e => setDescription(e.target.value)} />
                        <div style={{display:'flex',gap:8,alignItems:'center'}}>
                            <button type="button" className="btn ghost" onClick={() => setShowPicker(s => !s)}>{dueDate ? new Date(dueDate).toLocaleDateString() : 'Set due date'}</button>
                            <button type="button" className="btn ghost" onClick={() => setShowTime(t => !t)} style={{marginLeft:6}}>{dueDate ? new Date(dueDate).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : 'Set time'}</button>
                            <div style={{flex:1}} />
                        </div>
                        {showPicker && (
                            <div style={{marginTop:8}}>
                                <MiniCalendar onPick={(d) => { setDueDate(new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString()); setShowPicker(false); }} initial={dueDate ? new Date(dueDate) : undefined} />
                            </div>
                        )}
                        {showTime && (
                            <div style={{marginTop:8}}>
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
                                        <button className="btn" onClick={() => { applyTime(); setShowTime(false); }}>Apply</button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="task-actions" style={{marginTop:12}}>
                        <button className="btn" onClick={save}>Save</button>
                        <button className="btn ghost" onClick={() => setEditing(false)}>Cancel</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TaskCard;