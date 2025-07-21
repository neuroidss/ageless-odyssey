import React from 'react';

interface AgingSchemeViewProps {
    onClose: () => void;
}

const AgingSchemeView: React.FC<AgingSchemeViewProps> = ({ onClose }) => {
    return (
        <div 
            className="fixed inset-0 bg-black/80 z-[200] flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div 
                className="bg-slate-900 border border-slate-700 rounded-lg p-4 w-full max-w-6xl h-[90vh] flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <h2 className="text-2xl font-bold text-slate-100">Systemic Scheme of Human Aging</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white text-3xl leading-none">&times;</button>
                </div>
                <div className="flex-grow overflow-auto rounded">
                    <img 
                        src="https://transhuman.ru/wp-content/uploads/2016/06/human-aging-system-diagram-66.jpg" 
                        alt="Systemic Scheme of Human Aging"
                        className="min-w-full min-h-full object-contain"
                    />
                </div>
                <p className="text-xs text-slate-500 mt-2 text-center flex-shrink-0">
                    This diagram represents a high-level overview of the interconnected processes of aging. Use it as a conceptual map for your research. Source: sciencevsaging.org
                </p>
            </div>
        </div>
    );
};

export default AgingSchemeView;