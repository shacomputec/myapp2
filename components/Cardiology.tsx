import React, { useState, useMemo } from 'react';
import { MOCK_PATIENTS } from '../constants';
import type { CardiologyOrder, CardiologyOrderStatus, Patient } from '../types';

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

const ViewResultsModal: React.FC<{ order: CardiologyOrder, onClose: () => void }> = ({ order, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-8 relative dark:bg-slate-800">
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <h3 className="text-xl font-bold text-dark-text mb-2 dark:text-slate-200">Cardiology Results for {order.patientName}</h3>
            <p className="font-semibold text-light-text mb-4 dark:text-slate-400">{order.testName} (Order: {order.id})</p>
            <div className="space-y-4">
                {order.imageUrl && (
                    <div>
                        <h4 className="font-semibold text-dark-text mb-2 dark:text-slate-200">Imaging/Trace</h4>
                        <img src={order.imageUrl} alt={`Trace for ${order.testName}`} className="w-full h-auto rounded-lg bg-gray-900 object-contain" />
                    </div>
                )}
                <div>
                    <h4 className="font-semibold text-dark-text mb-2 dark:text-slate-200">Cardiologist's Report</h4>
                    <div className="bg-light-bg p-4 rounded-lg dark:bg-slate-700">
                        <pre className="whitespace-pre-wrap font-sans text-sm text-dark-text dark:text-slate-300">{order.results || 'No report available.'}</pre>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const UpdateStatusModal: React.FC<{ order: CardiologyOrder, onClose: () => void, onUpdate: (orderId: string, newStatus: CardiologyOrderStatus, results?: string) => void }> = ({ order, onClose, onUpdate }) => {
    const [status, setStatus] = useState<CardiologyOrderStatus>(order.status);
    const [results, setResults] = useState(order.results || '');
    
    const handleUpdate = () => {
        onUpdate(order.id, status, results);
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
                        <select value={status} onChange={e => setStatus(e.target.value as CardiologyOrderStatus)} className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200">
                            <option>Pending</option>
                            <option>In Progress</option>
                            <option>Completed</option>
                        </select>
                    </div>
                    {status === 'Completed' && (
                         <div>
                            <label className="block text-sm font-medium text-light-text mb-1 dark:text-slate-400">Enter Cardiologist's Report</label>
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

interface CardiologyProps {
  onSelectPatient: (patient: Patient) => void;
  cardiologyOrders: CardiologyOrder[];
  setCardiologyOrders: React.Dispatch<React.SetStateAction<CardiologyOrder[]>>;
}

const Cardiology: React.FC<CardiologyProps> = ({ onSelectPatient, cardiologyOrders, setCardiologyOrders }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<CardiologyOrder | null>(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isResultsModalOpen, setIsResultsModalOpen] = useState(false);

  const filteredOrders = useMemo(() => 
    cardiologyOrders.filter(order =>
        order.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.testName.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()),
  [cardiologyOrders, searchTerm]);

  const cardiologySummary = useMemo(() => {
    const pending = cardiologyOrders.filter(o => o.status === 'Pending').length;
    const completed = cardiologyOrders.filter(o => o.status === 'Completed').length;
    const urgent = cardiologyOrders.filter(o => o.isUrgent && o.status !== 'Completed').length;
    return { pending, completed, urgent };
  }, [cardiologyOrders]);
  
  const handleUpdateOrder = (orderId: string, newStatus: CardiologyOrderStatus, results?: string) => {
    setCardiologyOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus, results: results || o.results } : o));
  };
  
  const statusColors: { [key in CardiologyOrderStatus]: string } = {
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
      <h2 className="text-3xl font-bold text-dark-text dark:text-slate-200">Cardiology Management</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Pending Tests" value={cardiologySummary.pending.toString()} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
        <StatCard title="Completed Today" value={cardiologySummary.completed.toString()} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
        <StatCard title="Urgent Requests" value={cardiologySummary.urgent.toString()} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>} />
      </div>

      <div className="bg-white p-6 rounded-xl shadow-md dark:bg-slate-800 dark:border dark:border-slate-700">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by test or patient name..."
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
                <th className="p-3 font-semibold text-light-text dark:text-slate-300">Test</th>
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
      {selectedOrder && isResultsModalOpen && <ViewResultsModal order={selectedOrder} onClose={() => { setIsResultsModalOpen(false); setSelectedOrder(null); }} />}
      {selectedOrder && isStatusModalOpen && <UpdateStatusModal order={selectedOrder} onClose={() => { setIsStatusModalOpen(false); setSelectedOrder(null); }} onUpdate={handleUpdateOrder} />}
    </div>
  );
};

export default Cardiology;
