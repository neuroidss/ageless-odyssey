import React, { useState, useEffect } from 'react';
import { ToastMessage } from '../types';
import { TrophyIcon, TrendingUpIcon, AscensionIcon, OracleIcon, QuestIcon, CurrencyDollarIcon, BanknotesIcon } from './icons';

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
        oracle: <OracleIcon className="h-8 w-8 text-cyan-400" />,
        quest: <QuestIcon className="h-8 w-8 text-green-400" />,
        purchase: <CurrencyDollarIcon className="h-8 w-8 text-teal-400" />,
        investment: <BanknotesIcon className="h-8 w-8 text-blue-400" />,
        success: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>,
        error: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" /></svg>,
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
