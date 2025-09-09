
import React, { useState, useMemo } from 'react';
import { MOCK_PATIENTS } from '../constants';
import type { RadiologyOrder, RadiologyOrderStatus, Patient } from '../types';
import { getRadiologyAnalysis } from '../services/geminiService';

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; }> = ({ title, value, icon }) => (
  <div className="bg-white p-6 rounded-xl shadow-md flex items-center justify-between dark:bg-slate-800 dark:border dark:border-slate-700">
    <div>
      <p className="text-sm font-medium text-light-text dark:text-slate-400">{title}</p>
      <p className="text-3xl font-bold text-dark-text dark:text-slate-200">{value}</p>
    </div>
    <div className="text-primary">
      {icon}
    </div>
  </div>
);

const ViewResultsModal: React.FC<{ 
    order: RadiologyOrder, 
    onClose: () => void,
    onUpdateOrder: (order: RadiologyOrder) => void 
}> = ({ order, onClose, onUpdateOrder }) => {
    const [isLoadingAi, setIsLoadingAi] = useState(false);
    const [aiError, setAiError] = useState('');

    const imageUrlToBase64 = async (url: string): Promise<string> => {
        // Use a CORS proxy for development to fetch images from picsum.photos
        // In a production environment, the image server (e.g., S3) should be configured
        // with appropriate CORS headers (Access-Control-Allow-Origin).
        const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
        const response = await fetch(proxyUrl);
        if (!response.ok) {
            throw new Error(`HTTP error fetching image via proxy! status: ${response.status}`);
        }
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (reader.result) {
                    // result is a data URL (e.g., "data:image/jpeg;base64,..."). We need to strip the prefix.
                    resolve((reader.result as string).split(',')[1]);
                } else {
                    reject(new Error("FileReader failed to read blob."));
                }
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    };

    const handleGetAiAnalysis = async () => {
        if (!order.imageUrl) {
            setAiError('Image not available for analysis.');
            return;
        }
        setIsLoadingAi(true);
        setAiError('');

        try {
            const base64Image = await imageUrlToBase64(order.imageUrl);
            const prompt = `Act as a radiologist's assistant. Analyze this radiology image (${order.testName}) and provide a structured report. Cover these sections:
1.  **Findings:** Describe any notable observations, measurements, or anomalies.
2.  **Impressions:** List potential interpretations or differential diagnoses based on the findings.
3.  **Recommendations:** Suggest any follow-up actions or further tests.
Format the entire response in clean Markdown. If the image is not a medical scan or is of poor quality, state that clearly.`;
            
            const result = await getRadiologyAnalysis(base64Image, prompt);
            
            onUpdateOrder({ ...order, aiAnalysis: result });

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
            setAiError(errorMessage);
            console.error(error);
        } finally {
            setIsLoadingAi(false);
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl p-8 relative max-h-[90vh] flex flex-col dark:bg-slate-800">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <h3 className="text-xl font-bold text-dark-text mb-2 dark:text-slate-200">Radiology Results for {order.patientName}</h3>
                <p className="font-semibold text-light-text mb-4 dark:text-slate-400">{order.testName} (Order: {order.id})</p>
                
                <div className="flex-grow overflow-y-auto pr-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column: Image and Radiologist Report */}
                    <div className="space-y-4">
                        {order.imageUrl && (
                            <div>
                                <h4 className="font-semibold text-dark-text mb-2 dark:text-slate-200">Imaging</h4>
                                <img src={order.imageUrl} alt={`Scan for ${order.testName}`} className="w-full h-auto rounded-lg bg-gray-200" crossOrigin="anonymous"/>
                            </div>
                        )}
                        <div>
                            <h4 className="font-semibold text-dark-text mb-2 dark:text-slate-200">Radiologist's Report</h4>
                            <div className="bg-light-bg p-4 rounded-lg min-h-[100px] dark:bg-slate-700">
                                <pre className="whitespace-pre-wrap font-sans text-sm text-dark-text dark:text-slate-300">{order.results || 'No report available.'}</pre>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: AI Analysis */}
                    <div className="space-y-4 flex flex-col">
                        <h4 className="font-semibold text-dark-text dark:text-slate-200">AI Analysis</h4>
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 flex-grow dark:bg-slate-800/50 dark:border-blue-500/30 flex flex-col justify-center">
                            {order.aiAnalysis ? (
                                <div className="prose prose-sm max-w-none text-gray-800 dark:text-slate-300 dark:prose-headings:text-slate-200 dark:prose-strong:text-slate-200" dangerouslySetInnerHTML={{ __html: order.aiAnalysis.replace(/\n/g, '<br />').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                            ) : isLoadingAi ? (
                                <div className="text-center">
                                    <svg className="animate-spin mx-auto h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    <p className="mt-2 text-sm text-light-text dark:text-slate-400">Analyzing image with Gemini...</p>
                                </div>
                            ) : aiError ? (
                                <div className="text-center">
                                    <p className="text-sm text-red-600 dark:text-red-400">{aiError}</p>
                                    <button onClick={handleGetAiAnalysis} className="mt-2 bg-secondary text-primary-dark px-3 py-1 rounded-lg hover:bg-yellow-400 text-sm font-semibold">Retry</button>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <button onClick={handleGetAiAnalysis} className="bg-secondary text-primary-dark px-4 py-2 rounded-lg hover:bg-yellow-400 text-sm font-semibold flex items-center mx-auto">
                                        Get AI Analysis
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const UpdateStatusModal: React.FC<{ order: RadiologyOrder, onClose: () => void, onUpdate: (updatedOrder: RadiologyOrder) => void }> = ({ order, onClose, onUpdate }) => {
    const [status, setStatus] = useState<RadiologyOrderStatus>(order.status);
    const [results, setResults] = useState(order.results || '');
    
    const handleUpdate = () => {
        onUpdate({ ...order, status, results });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-8 relative dark:bg-slate-800">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <h3 className="text-xl font-bold text-dark-text mb-4 dark:text-slate-200">Update Status for {order.id}</h3>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-light-text mb-1 dark:text-slate-400">Status</label>
                        <select value={status} onChange={e => setStatus(e.target.value as RadiologyOrderStatus)} className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200">
                            <option>Pending</option>
                            <option>In Progress</option>
                            <option>Completed</option>
                        </select>
                    </div>
                    {status === 'Completed' && (
                         <div>
                            <label className="block text-sm font-medium text-light-text mb-1 dark:text-slate-400">Enter Radiologist's Report</label>
                            <textarea value={results} onChange={e => setResults(e.target.value)} rows={5} className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" placeholder="Enter report here..."></textarea>
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

interface RadiologyProps {
  onSelectPatient: (patient: Patient) => void;
  radiologyOrders: RadiologyOrder[];
  setRadiologyOrders: React.Dispatch<React.SetStateAction<RadiologyOrder[]>>;
}

const Radiology: React.FC<RadiologyProps> = ({ onSelectPatient, radiologyOrders, setRadiologyOrders }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<RadiologyOrder | null>(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isResultsModalOpen, setIsResultsModalOpen] = useState(false);

  const filteredOrders = useMemo(() => 
    radiologyOrders.filter(order =>
        order.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.testName.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()),
  [radiologyOrders, searchTerm]);

  const radiologySummary = useMemo(() => {
    const pending = radiologyOrders.filter(o => o.status === 'Pending').length;
    const completedToday = radiologyOrders.filter(o => o.status === 'Completed' && o.orderDate === new Date().toISOString().split('T')[0]).length;
    const urgent = radiologyOrders.filter(o => o.isUrgent && o.status !== 'Completed').length;
    return { pending, completedToday, urgent };
  }, [radiologyOrders]);
  
  const handleUpdateOrder = (updatedOrder: RadiologyOrder) => {
    setRadiologyOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
    if (selectedOrder && selectedOrder.id === updatedOrder.id) {
        setSelectedOrder(updatedOrder);
    }
  };
  
  const statusColors: { [key in RadiologyOrderStatus]: string } = {
    Completed: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    'In Progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
    Pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
  };

  const handleSelectPatientById = (patientId: string) => {
    const patient = MOCK_PATIENTS.find(p => p.id === patientId);
    if (patient) {
      onSelectPatient(patient);
    }
  };

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-dark-text dark:text-slate-200">Radiology Management</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Pending Scans" value={radiologySummary.pending.toString()} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
        <StatCard title="Completed Today" value={radiologySummary.completedToday.toString()} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
        <StatCard title="Urgent Requests" value={radiologySummary.urgent.toString()} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>} />
      </div>

      <div className="bg-white p-6 rounded-xl shadow-md dark:bg-slate-800 dark:border dark:border-slate-700">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by imaging test or patient name..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-light-bg dark:bg-slate-700">
              <tr>
                <th className="p-3 font-semibold text-light-text dark:text-slate-300">Order ID</th>
                <th className="p-3 font-semibold text-light-text dark:text-slate-300">Patient</th>
                <th className="p-3 font-semibold text-light-text dark:text-slate-300">Imaging Test</th>
                <th className="p-3 font-semibold text-light-text dark:text-slate-300">Order Date</th>
                <th className="p-3 font-semibold text-light-text dark:text-slate-300">Status</th>
                <th className="p-3 font-semibold text-light-text dark:text-slate-300 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="dark:text-slate-400">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="border-b dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50">
                  <td className="p-3 font-medium text-primary flex items-center">
                    {order.isUrgent && <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-accent" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.492-1.696-1.742-3.03l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>}
                    {order.id}
                  </td>
                  <td className="p-3">
                    <button onClick={() => handleSelectPatientById(order.patientId)} className="font-medium text-dark-text hover:underline dark:text-slate-200">{order.patientName}</button>
                  </td>
                  <td className="p-3">{order.testName}</td>
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
      {selectedOrder && isResultsModalOpen && <ViewResultsModal order={selectedOrder} onClose={() => { setIsResultsModalOpen(false); setSelectedOrder(null); }} onUpdateOrder={handleUpdateOrder} />}
      {selectedOrder && isStatusModalOpen && <UpdateStatusModal order={selectedOrder} onClose={() => { setIsStatusModalOpen(false); setSelectedOrder(null); }} onUpdate={handleUpdateOrder} />}
    </div>
  );
};

export default Radiology;
