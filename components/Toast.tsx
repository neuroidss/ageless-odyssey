import React, { useState, useEffect } from 'react';
import { ToastMessage } from '../types';
import { TrophyIcon, TrendingUpIcon, AscensionIcon } from './icons';

export const Toast: React.FC<{ toast: ToastMessage, onDismiss: (id: number) => void }> = ({ toast, onDismiss }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        setVisible(true);
        const timer = setTimeout(() => {
            setVisible(false);
            // Allow time for fade-out animation before removing from DOM
            setTimeout(() => onDismiss(toast.id), 300);
        }, 5000);
        
        return () => clearTimeout(timer);
    }, [toast, onDismiss]);

    const icons = {
        achievement: <TrophyIcon className="h-8 w-8 text-yellow-400" />,
        levelup: <TrendingUpIcon className="h-8 w-8 text-green-400" />,
        ascension: <AscensionIcon className="h-8 w-8 text-purple-400" />,
    };

    return (
        <div 
            className={`w-full max-w-sm bg-slate-800 border border-slate-600 rounded-xl shadow-2xl p-4 flex items-center gap-4 transition-all duration-300 ${visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}
            role="alert"
            aria-live="assertive"
        >
            {toast.icon && icons[toast.icon]}
            <div>
                <p className="font-bold text-slate-100">{toast.title}</p>
                <p className="text-sm text-slate-300">{toast.message}</p>
            </div>
        </div>
    );
};

export const ToastContainer: React.FC<{ toasts: ToastMessage[], onDismiss: (id: number) => void }> = ({ toasts, onDismiss }) => {
    return (
        <div className="fixed top-4 right-4 z-50 space-y-3">
            {toasts.map(toast => (
                <Toast key={toast.id} toast={toast} onDismiss={onDismiss} />
            ))}
        </div>
    );
};