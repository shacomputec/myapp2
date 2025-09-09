

import React, { useState, useMemo, useEffect } from 'react';
import { MOCK_PATIENTS } from '../constants';
import type { NHISClaim, NHISClaimStatus, Patient, NHISClaimItem } from '../types';
import { getNhisClaimValidation, getNhisRejectionAnalysis } from '../services/geminiService';
import { useAuth } from '../services/auth';

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; }> = ({ title, value, icon }) => (
  <div className="bg-white p-6 rounded-xl shadow-md flex items-center justify-between">
    <div>
      <p className="text-sm font-medium text-light-text">{title}</p>
      <p className="text-3xl font-bold text-dark-text">{value}</p>
    </div>
    <div className="text-primary">
      {icon}
    </div>
  </div>
);

interface ClaimDetailModalProps {
    claim: NHISClaim;
    isOpen: boolean;
    onClose: () => void;
}
const ClaimDetailModal: React.FC<ClaimDetailModalProps> = ({ claim, isOpen, onClose }) => {
    const { hasPermission } = useAuth();
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysis, setAnalysis] = useState('');

    useEffect(() => {
        if (isOpen) {
            setIsAnalyzing(false);
            setAnalysis('');
        }
    }, [isOpen, claim]);

    if (!isOpen) return null;

     const handleAnalyzeRejection = async () => {
        if (!claim.rejectionReason) return;
        setIsAnalyzing(true);
        setAnalysis('');
        try {
            const result = await getNhisRejectionAnalysis(claim.rejectionReason, claim.items);
            setAnalysis(result);
        } catch (error) {
            setAnalysis("Sorry, an error occurred while analyzing the rejection reason.");
            console.error(error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-8 relative max-h-[90vh] flex flex-col">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <h3 className="text-xl font-bold text-dark-text mb-2">Claim Details: {claim.id}</h3>
                <p className="text-sm text-light-text mb-4">Patient: {claim.patientName} | NHIS ID: {claim.nhisId}</p>
                
                 {(claim.status === 'Rejected' || claim.status === 'Queried') && (
                    <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-400 text-red-800 rounded-r-lg">
                        <p className="font-bold">Reason for {claim.status} Status</p>
                        <p className="text-sm italic">{claim.rejectionReason}</p>
                    </div>
                )}
                
                <div className="flex-grow overflow-y-auto border-t pt-4">
                    <h4 className="font-semibold text-dark-text mb-2">Claimed Items</h4>
                    <table className="w-full text-left">
                        <thead className="bg-light-bg">
                            <tr>
                                <th className="p-2 font-semibold text-light-text text-sm">Description</th>
                                <th className="p-2 font-semibold text-light-text text-sm">Code</th>
                                <th className="p-2 font-semibold text-light-text text-sm text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {claim.items.map(item => (
                                <tr key={item.id} className="border-b">
                                    <td className="p-2">{item.description}</td>
                                    <td className="p-2">{item.code}</td>
                                    <td className="p-2 text-right">GH₵{item.amount.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="font-bold">
                                <td colSpan={2} className="p-2 text-right">Total</td>
                                <td className="p-2 text-right">GH₵{claim.totalAmount.toFixed(2)}</td>
                            </tr>
                        </tfoot>
                    </table>

                    {hasPermission('admin:ai_assistant') && (claim.status === 'Rejected' || claim.status === 'Queried') && (
                        <div className="mt-4 pt-4 border-t">
                            <button
                                onClick={handleAnalyzeRejection}
                                disabled={isAnalyzing}
                                className="bg-secondary text-primary-dark px-4 py-2 rounded-lg hover:bg-yellow-400 transition-colors font-semibold text-sm flex items-center disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                {isAnalyzing ? 'Analyzing Rejection...' : 'Analyze Rejection with AI'}
                            </button>

                            {(isAnalyzing || analysis) && (
                                <div className="mt-4">
                                    <h4 className="text-md font-semibold text-dark-text mb-2">AI-Powered Suggestions</h4>
                                    {isAnalyzing ? (
                                        <p className="text-light-text italic">Analyzing claim details and rejection reason...</p>
                                    ) : (
                                        <div className="prose prose-sm max-w-none text-gray-800 bg-light-bg p-4 rounded-lg" dangerouslySetInnerHTML={{ __html: analysis.replace(/\n/g, '<br />') }} />
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
                 <div className="mt-6 flex justify-end">
                    {(claim.status === 'Rejected' || claim.status === 'Queried') && (
                        <button className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark font-semibold">
                            Correct and Resubmit
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

const NewClaimModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (newClaim: NHISClaim) => void;
}> = ({ isOpen, onClose, onSave }) => {
    const { hasPermission } = useAuth();
    const [patientId, setPatientId] = useState('');
    const [items, setItems] = useState<{ id: string; description: string; code: string; amount: number }[]>([
        { id: `item-${Date.now()}`, description: '', code: '', amount: 0 }
    ]);
    const [validationResult, setValidationResult] = useState('');
    const [isValidating, setIsValidating] = useState(false);

    const patientsWithNhis = useMemo(() => MOCK_PATIENTS.filter(p => p.nhisId && p.nhisId !== 'N/A'), []);
    
    const totalAmount = useMemo(() => {
        return items.reduce((sum, item) => sum + Number(item.amount), 0);
    }, [items]);

    useEffect(() => {
        if (isOpen) {
            setPatientId('');
            setItems([{ id: `item-${Date.now()}`, description: '', code: '', amount: 0 }]);
            setValidationResult('');
            setIsValidating(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleItemChange = (id: string, field: string, value: string | number) => {
        setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
    };

    const addItem = () => {
        setItems([...items, { id: `item-${Date.now()}`, description: '', code: '', amount: 0 }]);
    };
    
    const removeItem = (id: string) => {
        setItems(items.filter(item => item.id !== id));
    };

    const handleValidate = async () => {
        const patient = patientsWithNhis.find(p => p.id === patientId);
        const validItems = items.filter(i => i.description && i.code && i.amount > 0);
        if (!patient || validItems.length === 0) {
            setValidationResult("Please select a patient and add at least one valid item before validating.");
            return;
        }

        setIsValidating(true);
        setValidationResult('');
        try {
            const result = await getNhisClaimValidation(patient.name, validItems as NHISClaimItem[]);
            setValidationResult(result);
        } catch (e) {
            setValidationResult("An error occurred during validation.");
        } finally {
            setIsValidating(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const patient = patientsWithNhis.find(p => p.id === patientId);
        const finalItems = items.filter(i => i.description && i.code && i.amount > 0);

        if (!patient || finalItems.length === 0) {
            alert('Please select a patient and ensure all items have a description, code, and valid amount.');
            return;
        }

        const newClaim: NHISClaim = {
            id: `NHIS-CLM-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
            patientId: patient.id,
            patientName: patient.name,
            nhisId: patient.nhisId!,
            submissionDate: new Date().toISOString().split('T')[0],
            totalAmount,
            status: 'Submitted',
            items: finalItems.map((item, index) => ({
                id: `CI-${Date.now()}-${index}`,
                description: item.description,
                code: item.code,
                amount: Number(item.amount),
            })),
        };
        onSave(newClaim);
        onClose();
    };


    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-2xl w-full max-w-3xl p-8 relative max-h-[90vh] flex flex-col">
                <button type="button" onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <h3 className="text-2xl font-bold text-dark-text mb-4">Submit New NHIS Claim</h3>

                <div className="flex-grow overflow-y-auto pr-2 space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-light-text mb-1">Patient</label>
                        <select value={patientId} onChange={e => setPatientId(e.target.value)} required className="w-full p-2 border border-gray-300 rounded-lg">
                            <option value="">Select a patient with an NHIS ID</option>
                            {patientsWithNhis.map(p => <option key={p.id} value={p.id}>{p.name} ({p.nhisId})</option>)}
                        </select>
                    </div>
                     <div className="border-t pt-4">
                        <h4 className="font-semibold text-dark-text mb-2">Claim Items</h4>
                        {items.map((item) => (
                             <div key={item.id} className="grid grid-cols-12 gap-2 mb-2 items-center">
                                <input type="text" placeholder="Description" value={item.description} onChange={e => handleItemChange(item.id, 'description', e.target.value)} className="col-span-6 p-2 border rounded-lg" required/>
                                <input type="text" placeholder="NHIS Code" value={item.code} onChange={e => handleItemChange(item.id, 'code', e.target.value)} className="col-span-2 p-2 border rounded-lg" required/>
                                <input type="number" step="0.01" placeholder="Amount" value={item.amount} onChange={e => handleItemChange(item.id, 'amount', Number(e.target.value))} className="col-span-3 p-2 border rounded-lg" min="0" required/>
                                <button type="button" onClick={() => removeItem(item.id)} className="col-span-1 text-red-500 hover:text-red-700 disabled:opacity-50" disabled={items.length === 1}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                            </div>
                        ))}
                        <button type="button" onClick={addItem} className="text-sm font-semibold text-primary hover:underline mt-2">+ Add Item</button>
                    </div>

                    {hasPermission('admin:ai_assistant') && (
                        <div className="border-t pt-4">
                            <button type="button" onClick={handleValidate} disabled={isValidating} className="bg-secondary text-primary-dark px-4 py-2 rounded-lg hover:bg-yellow-400 font-semibold text-sm flex items-center disabled:bg-gray-300">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                {isValidating ? 'Validating...' : 'Validate Claim with AI'}
                            </button>
                            {validationResult && (
                                <div className={`mt-2 p-3 rounded-md text-sm ${validationResult.startsWith('VALIDATION PASSED') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                                    <pre className="whitespace-pre-wrap font-sans">{validationResult}</pre>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                 <div className="border-t pt-4 mt-4 flex justify-between items-center">
                    <div>
                        <span className="text-lg font-medium text-light-text">Total:</span>
                        <span className="text-2xl font-bold text-dark-text ml-2">GH₵{totalAmount.toFixed(2)}</span>
                    </div>
                    <button type="submit" className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark font-semibold">Submit Claim</button>
                </div>
            </form>
        </div>
    );
};


interface NHISClaimsProps {
    claims: NHISClaim[];
    setClaims: React.Dispatch<React.SetStateAction<NHISClaim[]>>;
}


const NHISClaims: React.FC<NHISClaimsProps> = ({ claims, setClaims }) => {
    const [selectedClaim, setSelectedClaim] = useState<NHISClaim | null>(null);
    const [isNewClaimModalOpen, setIsNewClaimModalOpen] = useState(false);

    const summary = useMemo(() => {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const recentClaims = claims.filter(c => new Date(c.submissionDate) >= thirtyDaysAgo);

        return {
            submitted30d: recentClaims.reduce((sum, c) => sum + c.totalAmount, 0),
            approved30d: recentClaims.filter(c => c.status === 'Approved').reduce((sum, c) => sum + c.totalAmount, 0),
            pending: claims.filter(c => c.status === 'Submitted').length,
            rejected: claims.filter(c => c.status === 'Rejected' || c.status === 'Queried').length,
        };
    }, [claims]);

    const handleSaveClaim = (newClaim: NHISClaim) => {
        setClaims(prev => [newClaim, ...prev]);
    };

    const statusColors: Record<NHISClaimStatus, string> = {
        Submitted: 'bg-blue-100 text-blue-800',
        Approved: 'bg-green-100 text-green-800',
        Rejected: 'bg-red-100 text-red-800',
        Queried: 'bg-yellow-100 text-yellow-800',
    };

    return (
        <div className="space-y-8">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="text-3xl font-bold text-dark-text">NHIS Claims Management</h2>
                <button onClick={() => setIsNewClaimModalOpen(true)} className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark font-semibold text-sm flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Submit New Claim
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard title="Amount Submitted (30d)" value={`GH₵${summary.submitted30d.toLocaleString()}`} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>} />
                <StatCard title="Amount Approved (30d)" value={`GH₵${summary.approved30d.toLocaleString()}`} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
                <StatCard title="Pending Claims" value={summary.pending.toString()} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
                <StatCard title="Rejected / Queried" value={summary.rejected.toString()} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>} />
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="text-xl font-semibold text-dark-text mb-4">All Claims</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-light-bg">
                            <tr>
                                <th className="p-3 font-semibold text-light-text">Claim ID</th>
                                <th className="p-3 font-semibold text-light-text">Patient</th>
                                <th className="p-3 font-semibold text-light-text">Submission Date</th>
                                <th className="p-3 font-semibold text-light-text text-right">Amount</th>
                                <th className="p-3 font-semibold text-light-text text-center">Status</th>
                                <th className="p-3 font-semibold text-light-text text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {claims.map(claim => (
                                <tr key={claim.id} className="border-b hover:bg-gray-50">
                                    <td className="p-3 font-medium text-primary">{claim.id}</td>
                                    <td className="p-3">{claim.patientName}</td>
                                    <td className="p-3">{claim.submissionDate}</td>
                                    <td className="p-3 text-right">GH₵{claim.totalAmount.toFixed(2)}</td>
                                    <td className="p-3 text-center">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[claim.status]}`}>{claim.status}</span>
                                    </td>
                                    <td className="p-3 text-center">
                                        <button onClick={() => setSelectedClaim(claim)} className="text-primary hover:underline text-sm font-medium">View Details</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedClaim && (
                <ClaimDetailModal 
                    isOpen={!!selectedClaim}
                    onClose={() => setSelectedClaim(null)}
                    claim={selectedClaim}
                />
            )}
            <NewClaimModal isOpen={isNewClaimModalOpen} onClose={() => setIsNewClaimModalOpen(false)} onSave={handleSaveClaim} />
        </div>
    );
};

export default NHISClaims;