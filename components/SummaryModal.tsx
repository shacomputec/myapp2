import React from 'react';

interface SummaryModalProps {
    isOpen: boolean;
    onClose: () => void;
    content: string;
    patientName: string;
    title?: string;
    isLoading?: boolean;
}

const SummaryModal: React.FC<SummaryModalProps> = ({ isOpen, onClose, content, patientName, title, isLoading }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-6 relative dark:bg-slate-800">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <h3 className="text-xl font-bold text-dark-text mb-4 dark:text-slate-200">{title || `AI Clinical Summary for ${patientName}`}</h3>
                <div className="prose prose-sm max-w-none text-gray-800 bg-light-bg p-4 rounded-lg max-h-[60vh] overflow-y-auto dark:bg-slate-700 dark:text-slate-300">
                    {isLoading ? (
                         <div className="flex justify-center items-center h-full min-h-[100px]">
                           <p className="text-light-text dark:text-slate-400">Generating...</p>
                        </div>
                    ) : (
                        <div dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br />').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default SummaryModal;
