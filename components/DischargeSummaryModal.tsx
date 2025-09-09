
import React from 'react';

interface DischargeSummaryModalProps {
    isOpen: boolean;
    onClose: () => void;
    summary: string;
    isLoading: boolean;
    onSave: (summary: string) => void;
    patientName: string;
}

const DischargeSummaryModal: React.FC<DischargeSummaryModalProps> = ({ isOpen, onClose, summary, isLoading, onSave, patientName }) => {
    if (!isOpen) return null;

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write('<html><head><title>Discharge Summary</title>');
            printWindow.document.write('<style>body { font-family: sans-serif; } h1, h2, strong { color: #333; } pre { white-space: pre-wrap; word-wrap: break-word; background-color: #f4f4f4; padding: 1em; border-radius: 5px; }</style>');
            printWindow.document.write('</head><body>');
            printWindow.document.write(`<h1>Discharge Summary for ${patientName}</h1>`);
            const summaryHtml = summary.replace(/\n/g, '<br />').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            printWindow.document.write(`<div>${summaryHtml}</div>`);
            printWindow.document.write('</body></html>');
            printWindow.document.close();
            printWindow.print();
        }
    };

    const handleCopyToClipboard = () => {
        navigator.clipboard.writeText(summary);
        alert('Summary copied to clipboard!');
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl p-8 relative max-h-[90vh] flex flex-col dark:bg-slate-800">
                <button type="button" onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <h3 className="text-2xl font-bold text-dark-text mb-4 dark:text-slate-200">AI-Generated Discharge Summary for {patientName}</h3>
                
                <div className="flex-grow overflow-y-auto pr-2 bg-light-bg p-4 rounded-lg border dark:bg-slate-700 dark:border-slate-600">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-full">
                            <p className="text-light-text dark:text-slate-400">Generating discharge summary...</p>
                        </div>
                    ) : (
                        <div className="text-sm text-dark-text dark:text-slate-300 space-y-2" dangerouslySetInnerHTML={{ __html: summary.replace(/\n/g, '<br />').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                    )}
                </div>

                <div className="border-t pt-4 mt-4 flex justify-end space-x-3 dark:border-slate-700">
                    <button onClick={handleCopyToClipboard} disabled={isLoading || !summary} className="bg-light-bg text-dark-text px-4 py-2 rounded-lg hover:bg-gray-200 font-semibold disabled:opacity-50 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500">Copy</button>
                    <button onClick={handlePrint} disabled={isLoading || !summary} className="bg-light-bg text-dark-text px-4 py-2 rounded-lg hover:bg-gray-200 font-semibold disabled:opacity-50 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500">Print</button>
                    <button onClick={() => onSave(summary)} disabled={isLoading || !summary} className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark font-semibold disabled:bg-gray-400">Save to Record</button>
                </div>
            </div>
        </div>
    );
};

export default DischargeSummaryModal;
