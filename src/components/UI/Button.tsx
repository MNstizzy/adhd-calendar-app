import React from 'react';

interface ButtonProps {
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
    children: React.ReactNode;
    className?: string;
    variant?: 'default' | 'ghost';
}

const Button: React.FC<ButtonProps> = ({ onClick = () => {}, children, className = '', variant = 'default' }) => {
    const classes = `btn ${variant === 'ghost' ? 'ghost' : ''} ${className}`.trim();
    return (
        <button onClick={onClick} className={classes}>
            {children}
        </button>
    );
};

export default Button;