import React, { useState, useEffect } from 'react';
import { MOCK_PATIENTS } from '../constants';

interface GhanaCardVerificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    ghanaCardId: string;
    onVerifySuccess: (verifiedData: { name: string, dob: string }) => void;
    patientName?: string;
}

const GhanaCardVerificationModal: React.FC<GhanaCardVerificationModalProps> = ({ isOpen, onClose, ghanaCardId, onVerifySuccess, patientName }) => {
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [verifiedData, setVerifiedData] = useState<{ name: string, dob: string, photo: string } | null>(null);

    useEffect(() => {
        if (!isOpen) {
            // Reset state when modal is closed
            setStatus('idle');
            setVerifiedData(null);
        }
    }, [isOpen]);

    const handleVerify = () => {
        setStatus('loading');
        // Simulate API call to Ghana Card service
        setTimeout(() => {
            const patient = MOCK_PATIENTS.find(p => p.ghanaCardId === ghanaCardId);
            if (patient) {
                // Mock success
                setVerifiedData({
                    name: patient.name.toUpperCase(),
                    dob: '1989-03-15', // Mock DOB, in a real scenario this comes from the API
                    photo: patient.avatarUrl,
                });
                setStatus('success');
            } else {
                // Mock failure
                setStatus('error');
            }
        }, 1500);
    };

    const handleConfirm = () => {
        if(verifiedData) {
            onVerifySuccess({ name: verifiedData.name, dob: verifiedData.dob });
        }
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-8 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <h3 className="text-xl font-bold text-dark-text mb-4">Ghana Card Verification</h3>
                
                <div className="bg-light-bg p-4 rounded-lg mb-4">
                    <p className="text-sm text-light-text">Verifying ID for:</p>
                    <p className="font-mono text-lg text-primary">{ghanaCardId}</p>
                </div>

                {status === 'idle' && (
                    <button onClick={handleVerify} className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors">
                        Simulate Verification
                    </button>
                )}
                
                {status === 'loading' && (
                     <div className="text-center py-4">
                        <svg className="animate-spin mx-auto h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        <p className="mt-2 text-light-text">Contacting National Identification Authority...</p>
                    </div>
                )}
                
                {status === 'error' && (
                    <div className="text-center py-4 text-accent">
                        <p>Verification Failed. The ID could not be found or the service is unavailable.</p>
                        <button onClick={handleVerify} className="mt-4 bg-primary text-white py-2 px-4 rounded-lg text-sm">Retry</button>
                    </div>
                )}

                {status === 'success' && verifiedData && (
                    <div>
                        <div className="text-center text-green-700 font-semibold mb-4 p-2 bg-green-100 rounded-md">
                            Verification Successful
                        </div>
                        <div className="flex items-center space-x-4 border p-4 rounded-lg">
                            <img src={verifiedData.photo} alt="Ghana Card Photo" className="w-24 h-24 rounded-md object-cover" />
                            <div>
                                <p className="text-sm text-light-text">Name</p>
                                <p className="font-bold text-dark-text">{verifiedData.name}</p>
                                <p className="text-sm text-light-text mt-2">Date of Birth</p>
                                <p className="font-bold text-dark-text">{verifiedData.dob}</p>
                            </div>
                        </div>
                         <div className="mt-6">
                             <button onClick={handleConfirm} className="w-full bg-success text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors">
                                { patientName ? `Confirm and Mark as Verified` : `Auto-fill Form with Verified Data` }
                            </button>
                         </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GhanaCardVerificationModal;