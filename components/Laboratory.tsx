

import React, { useState, useMemo } from 'react';
import { MOCK_PATIENTS, SERVICE_PRICES } from '../constants';
import type { LabOrder, LabTestStatus, Patient, BillableItem } from '../types';
import { getLabResultInterpretation } from '../services/geminiService';
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

const ViewResultsModal: React.FC<{ 
    order: LabOrder, 
    onClose: () => void,
    onUpdateOrder: (updatedOrder: LabOrder) => void
}> = ({ order, onClose, onUpdateOrder }) => {
    const { hasPermission } = useAuth();
    const [isLoadingAi, setIsLoadingAi] = useState(false);
    const [aiError, setAiError] = useState('');

    const handleGetAiInterpretation = async () => {
        if (!order.results) {
            setAiError("Results must be available to generate an interpretation.");
            return;
        }
        setIsLoadingAi(true);
        setAiError('');

        try {
            const result = await getLabResultInterpretation(order.testName, order.results, order.isCritical, order.icd10Code);
            onUpdateOrder({ ...order, aiInterpretation: result });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            setAiError(errorMessage);
            console.error(error);
        } finally {
            setIsLoadingAi(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-8 relative max-h-[90vh] flex flex-col dark:bg-slate-800">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <h3 className="text-xl font-bold text-dark-text mb-2 dark:text-slate-200">Lab Results for {order.patientName}</h3>
                <p className="font-semibold text-light-text mb-4 dark:text-slate-400">{order.testName} (Order: {order.id})</p>
                <div className="flex-grow overflow-y-auto pr-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h4 className="font-semibold text-dark-text mb-2 dark:text-slate-200">Official Results</h4>
                        <div className="bg-light-bg p-4 rounded-lg min-h-[150px] dark:bg-slate-700">
                            <pre className="whitespace-pre-wrap font-sans text-sm text-dark-text dark:text-slate-300">{order.results || 'No results available.'}</pre>
                        </div>
                    </div>
                     <div className="flex flex-col">
                        <h4 className="font-semibold text-dark-text mb-2 dark:text-slate-200">AI Interpretation</h4>
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 flex-grow flex flex-col justify-center dark:bg-blue-900/20 dark:border-blue-500/30">
                             {order.aiInterpretation ? (
                                <div className="prose prose-sm max-w-none text-gray-800 dark:text-slate-300 dark:prose-headings:text-slate-200 dark:prose-strong:text-slate-200" dangerouslySetInnerHTML={{ __html: order.aiInterpretation.replace(/\n/g, '<br />').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                            ) : isLoadingAi ? (
                                <p className="text-sm text-light-text italic dark:text-slate-400">Generating interpretation...</p>
                            ) : aiError ? (
                                 <div className="text-center">
                                    <p className="text-sm text-red-600 dark:text-red-400">{aiError}</p>
                                    <button onClick={handleGetAiInterpretation} className="mt-2 bg-secondary text-primary-dark px-3 py-1 rounded-lg hover:bg-yellow-400 text-sm font-semibold">Retry</button>
                                </div>
                            ) : (
                                order.status === 'Completed' && hasPermission('admin:ai_assistant') && (
                                    <div className="text-center">
                                        <button onClick={handleGetAiInterpretation} className="bg-secondary text-primary-dark px-4 py-2 rounded-lg hover:bg-yellow-400 text-sm font-semibold flex items-center mx-auto">
                                            Get AI Interpretation
                                        </button>
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const UpdateStatusModal: React.FC<{ order: LabOrder, onClose: () => void, onUpdate: (order: LabOrder, newStatus: LabTestStatus, results?: string) => void }> = ({ order, onClose, onUpdate }) => {
    const [status, setStatus] = useState<LabTestStatus>(order.status);
    const [results, setResults] = useState(order.results || '');
    
    const handleUpdate = () => {
        onUpdate(order, status, results);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-8 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <h3 className="text-xl font-bold text-dark-text mb-4">Update Status for {order.id}</h3>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-light-text mb-1">Status</label>
                        <select value={status} onChange={e => setStatus(e.target.value as LabTestStatus)} className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                            <option>Pending</option>
                            <option>In Progress</option>
                            <option>Completed</option>
                        </select>
                    </div>
                    {status === 'Completed' && (
                         <div>
                            <label className="block text-sm font-medium text-light-text mb-1">Enter Results</label>
                            <textarea value={results} onChange={e => setResults(e.target.value)} rows={5} className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Enter lab results here..."></textarea>
                        </div>
                    )}
                </div>

                <div className="mt-6 flex justify-end">
                    <button onClick={handleUpdate} className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors font-semibold">
                        Update
                    </button>
                </div>
            </div>
        </div>
    )
}

interface LaboratoryProps {
  onSelectPatient: (patient: Patient) => void;
  labOrders: LabOrder[];
  setLabOrders: React.Dispatch<React.SetStateAction<LabOrder[]>>;
  onAddBillableItem: (itemData: Omit<BillableItem, 'id' | 'patientName' | 'status' | 'date'>) => void;
}

const Laboratory: React.FC<LaboratoryProps> = ({ onSelectPatient, labOrders, setLabOrders, onAddBillableItem }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<LabOrder | null>(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isResultsModalOpen, setIsResultsModalOpen] = useState(false);

  const filteredOrders = useMemo(() => 
    labOrders.filter(order =>
        order.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.testName.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()),
  [labOrders, searchTerm]);

  const labSummary = useMemo(() => {
    const pending = labOrders.filter(o => o.status === 'Pending').length;
    const completedToday = labOrders.filter(o => o.status === 'Completed' && o.orderDate === new Date().toISOString().split('T')[0]).length;
    const critical = labOrders.filter(o => o.isCritical && o.status !== 'Completed').length;
    return { pending, completedToday, critical };
  }, [labOrders]);
  
  const handleUpdateStatus = (order: LabOrder, newStatus: LabTestStatus, results?: string) => {
    const previouslyCompleted = order.status === 'Completed';
    const updatedOrder = { ...order, status: newStatus, results: results || order.results };
    setLabOrders(prev => prev.map(o => o.id === order.id ? updatedOrder : o));

    if (newStatus === 'Completed' && !previouslyCompleted) {
        const price = (SERVICE_PRICES.lab as any)[order.testName] || 25; // Default price
        onAddBillableItem({
            patientId: order.patientId,
            description: `Lab Test: ${order.testName}`,
            amount: price,
        });
    }
  };
  
  const handleUpdateOrderWithAI = (updatedOrder: LabOrder) => {
      setLabOrders(prev => prev.map(o => (o.id === updatedOrder.id ? updatedOrder : o)));
      if (selectedOrder && selectedOrder.id === updatedOrder.id) {
        setSelectedOrder(updatedOrder);
      }
  };
  
  const statusColors: { [key in LabTestStatus]: string } = {
    Completed: 'bg-green-100 text-green-800',
    'In Progress': 'bg-blue-100 text-blue-800',
    Pending: 'bg-yellow-100 text-yellow-800',
  };

  const handleSelectPatientById = (patientId: string) => {
    const patient = MOCK_PATIENTS.find(p => p.id === patientId);
    if (patient) {
      onSelectPatient(patient);
    }
  };

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-dark-text">Laboratory Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Pending Samples" value={labSummary.pending.toString()} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
        <StatCard title="Completed Today" value={labSummary.completedToday.toString()} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
        <StatCard title="Critical Results Pending" value={labSummary.critical.toString()} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>} />
      </div>

      <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by test or patient name..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-light-bg">
              <tr>
                <th className="p-3 font-semibold text-light-text">Order ID</th>
                <th className="p-3 font-semibold text-light-text">Patient</th>
                <th className="p-3 font-semibold text-light-text">Test</th>
                <th className="p-3 font-semibold text-light-text">ICD-10</th>
                <th className="p-3 font-semibold text-light-text">Order Date</th>
                <th className="p-3 font-semibold text-light-text">Status</th>
                <th className="p-3 font-semibold text-light-text text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-medium text-primary flex items-center">
                    {order.isCritical && <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-accent" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.492-1.696-1.742-3.03l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>}
                    {order.id}
                  </td>
                  <td className="p-3">
                    <button onClick={() => handleSelectPatientById(order.patientId)} className="font-medium text-dark-text hover:underline">{order.patientName}</button>
                  </td>
                  <td className="p-3">{order.testName}</td>
                  <td className="p-3 font-mono text-xs">{order.icd10Code || 'N/A'}</td>
                  <td className="p-3">{order.orderDate}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[order.status]}`}>{order.status}</span>
                  </td>
                  <td className="p-3 text-center space-x-2">
                    {order.status === 'Completed' ? (
                       <button onClick={() => { setSelectedOrder(order); setIsResultsModalOpen(true); }} className="text-primary hover:underline text-sm font-medium">View Results</button>
                    ) : (
                       <button onClick={() => { setSelectedOrder(order); setIsStatusModalOpen(true); }} className="text-primary hover:underline text-sm font-medium">Update Status</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {selectedOrder && isResultsModalOpen && <ViewResultsModal order={selectedOrder} onClose={() => { setIsResultsModalOpen(false); setSelectedOrder(null); }} onUpdateOrder={handleUpdateOrderWithAI} />}
      {selectedOrder && isStatusModalOpen && <UpdateStatusModal order={selectedOrder} onClose={() => { setIsStatusModalOpen(false); setSelectedOrder(null); }} onUpdate={handleUpdateStatus} />}
    </div>
  );
};

export default Laboratory;
