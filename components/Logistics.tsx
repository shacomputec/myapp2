import React, { useState, useMemo } from 'react';
import { MOCK_TRANSPORT_REQUESTS, MOCK_VEHICLES, MOCK_PATIENTS, MOCK_SUPPLY_REQUISITIONS, MOCK_INVENTORY_ITEMS } from '../constants';
import type { TransportRequest, TransportRequestStatus, Vehicle, Patient, SupplyRequisition, RequisitionStatus, Department, RequisitionItem } from '../types';

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

const ScheduleTransportModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (request: TransportRequest) => void;
}> = ({ isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState<Partial<TransportRequest>>({
        urgency: 'Routine',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePatientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const patientId = e.target.value;
        const patient = MOCK_PATIENTS.find(p => p.id === patientId);
        setFormData(prev => ({ ...prev, patientId, patientName: patient?.name }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.patientId || !formData.origin || !formData.destination) {
            alert('Please fill all required fields.');
            return;
        }

        const newRequest: TransportRequest = {
            id: `TR-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
            requestTime: new Date().toISOString(),
            status: 'Pending',
            ...formData
        } as TransportRequest;

        onSave(newRequest);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-8 relative">
                <button type="button" onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <h3 className="text-xl font-bold text-dark-text mb-4">Schedule New Transport</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-light-text mb-1">Patient</label>
                        <select name="patientId" value={formData.patientId} onChange={handlePatientChange} required className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                            <option value="">Select a patient</option>
                            {MOCK_PATIENTS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-light-text mb-1">Origin</label>
                            <input type="text" name="origin" value={formData.origin || ''} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded-lg" placeholder="e.g., General Ward" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-light-text mb-1">Destination</label>
                            <input type="text" name="destination" value={formData.destination || ''} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded-lg" placeholder="e.g., Radiology" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-light-text mb-1">Urgency</label>
                        <select name="urgency" value={formData.urgency} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded-lg">
                            <option>Routine</option>
                            <option>Urgent</option>
                            <option>Emergency</option>
                        </select>
                    </div>
                    <div className="mt-6 flex justify-end">
                        <button type="submit" className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark font-semibold">Schedule</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const CreateRequisitionModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (requisition: SupplyRequisition) => void;
}> = ({ isOpen, onClose, onSave }) => {
    const [department, setDepartment] = useState<Department>('General Ward');
    const [urgency, setUrgency] = useState<'Routine' | 'Urgent'>('Routine');
    const [items, setItems] = useState<Partial<RequisitionItem>[]>([{ itemId: '', quantity: 1 }]);

    const handleItemChange = (index: number, field: keyof RequisitionItem, value: string | number) => {
        const newItems = [...items];
        if (field === 'itemId') {
            const inventoryItem = MOCK_INVENTORY_ITEMS.find(i => i.id === value);
            newItems[index] = { ...newItems[index], itemId: String(value), itemName: inventoryItem?.name };
        } else {
            newItems[index] = { ...newItems[index], [field]: value };
        }
        setItems(newItems);
    };

    const addItem = () => setItems([...items, { itemId: '', quantity: 1 }]);
    const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalItems = items.filter(item => item.itemId && item.quantity && item.quantity > 0) as RequisitionItem[];
        if (finalItems.length === 0) {
            alert('Please add at least one valid item to the requisition.');
            return;
        }

        const newRequisition: SupplyRequisition = {
            id: `REQ-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
            requestingDepartment: department,
            requestDate: new Date().toISOString(),
            items: finalItems,
            status: 'Pending',
            urgency,
        };
        onSave(newRequisition);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-2xl w-full max-w-3xl p-8 relative max-h-[90vh] flex flex-col">
                <button type="button" onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <h3 className="text-2xl font-bold text-dark-text mb-4">Create Supply Requisition</h3>
                
                <div className="flex-grow overflow-y-auto pr-2 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-light-text mb-1">Requesting Department</label>
                            <select value={department} onChange={e => setDepartment(e.target.value as Department)} required className="w-full p-2 border border-gray-300 rounded-lg">
                                {['General Ward', 'Maternity', 'ICU', 'Pediatrics', 'Surgery', 'Laboratory', 'Pharmacy'].map(dept => <option key={dept} value={dept}>{dept}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-light-text mb-1">Urgency</label>
                            <select value={urgency} onChange={e => setUrgency(e.target.value as 'Routine' | 'Urgent')} required className="w-full p-2 border border-gray-300 rounded-lg">
                                <option value="Routine">Routine</option>
                                <option value="Urgent">Urgent</option>
                            </select>
                        </div>
                    </div>
                    
                    <div className="border-t pt-4">
                        <h4 className="font-semibold text-dark-text mb-2">Requested Items</h4>
                        {items.map((item, index) => (
                             <div key={index} className="grid grid-cols-12 gap-2 mb-2 items-center">
                                <select value={item.itemId || ''} onChange={e => handleItemChange(index, 'itemId', e.target.value)} className="col-span-8 p-2 border rounded-lg">
                                    <option value="">Select an inventory item...</option>
                                    {MOCK_INVENTORY_ITEMS.map(invItem => <option key={invItem.id} value={invItem.id}>{invItem.name}</option>)}
                                </select>
                                <input type="number" placeholder="Qty" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', Number(e.target.value))} className="col-span-3 p-2 border rounded-lg" min="1" required/>
                                <button type="button" onClick={() => removeItem(index)} className="col-span-1 text-red-500 hover:text-red-700 disabled:opacity-50" disabled={items.length === 1}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                            </div>
                        ))}
                        <button type="button" onClick={addItem} className="text-sm font-semibold text-primary hover:underline mt-2">+ Add Another Item</button>
                    </div>
                </div>

                <div className="border-t pt-4 mt-4 flex justify-end">
                    <button type="submit" className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark font-semibold">Submit Requisition</button>
                </div>
            </form>
        </div>
    );
};


const Logistics: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'Transport' | 'Requisition'>('Transport');
    const [transportRequests, setTransportRequests] = useState<TransportRequest[]>(MOCK_TRANSPORT_REQUESTS);
    const [supplyRequisitions, setSupplyRequisitions] = useState<SupplyRequisition[]>(MOCK_SUPPLY_REQUISITIONS);
    const [vehicles] = useState<Vehicle[]>(MOCK_VEHICLES);
    const [isTransportModalOpen, setIsTransportModalOpen] = useState(false);
    const [isRequisitionModalOpen, setIsRequisitionModalOpen] = useState(false);

    const summary = useMemo(() => ({
        pendingTransport: transportRequests.filter(r => r.status === 'Pending').length,
        pendingRequisitions: supplyRequisitions.filter(r => r.status === 'Pending').length,
        availableVehicles: vehicles.filter(v => v.status === 'Available').length,
    }), [transportRequests, supplyRequisitions, vehicles]);
    
    const handleSaveTransport = (request: TransportRequest) => setTransportRequests(prev => [request, ...prev]);
    const updateTransportStatus = (id: string, status: TransportRequestStatus) => setTransportRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    
    const handleSaveRequisition = (requisition: SupplyRequisition) => {
        setSupplyRequisitions(prev => [requisition, ...prev]);
    };
    const updateRequisitionStatus = (id: string, status: RequisitionStatus) => setSupplyRequisitions(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    
    const transportStatusColors: Record<TransportRequestStatus, string> = { Pending: 'bg-yellow-100 text-yellow-800', 'In Progress': 'bg-blue-100 text-blue-800', Completed: 'bg-green-100 text-green-800', Cancelled: 'bg-red-100 text-red-800' };
    const requisitionStatusColors: Record<RequisitionStatus, string> = { Pending: 'bg-yellow-100 text-yellow-800', 'In Progress': 'bg-blue-100 text-blue-800', Completed: 'bg-green-100 text-green-800', Rejected: 'bg-red-100 text-red-800' };

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold text-dark-text">Logistics & Supply Chain</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Pending Transport" value={summary.pendingTransport.toString()} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
                <StatCard title="Pending Requisitions" value={summary.pendingRequisitions.toString()} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>} />
                <StatCard title="Available Vehicles" value={summary.availableVehicles.toString()} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /><circle cx="17" cy="17" r="2" /><circle cx="7" cy="17" r="2" /></svg>} />
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="border-b mb-4 flex justify-between items-center">
                    <nav className="flex space-x-4">
                        {(['Transport', 'Requisition'] as const).map(tab => (
                            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-3 py-2 font-medium text-sm rounded-t-lg ${activeTab === tab ? 'border-b-2 border-primary text-primary' : 'text-light-text hover:text-dark-text'}`}>
                                {tab === 'Transport' ? 'Patient Transport' : 'Supply Requisition'}
                            </button>
                        ))}
                    </nav>
                    {activeTab === 'Transport' && <button onClick={() => setIsTransportModalOpen(true)} className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark font-semibold text-sm">Schedule Transport</button>}
                    {activeTab === 'Requisition' && <button onClick={() => setIsRequisitionModalOpen(true)} className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark font-semibold text-sm">Create Requisition</button>}
                </div>
                
                {activeTab === 'Transport' && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-light-bg">
                                <tr>
                                    <th className="p-3 font-semibold text-light-text">Patient</th>
                                    <th className="p-3 font-semibold text-light-text">From &rarr; To</th>
                                    <th className="p-3 font-semibold text-light-text">Urgency</th>
                                    <th className="p-3 font-semibold text-light-text">Status</th>
                                    <th className="p-3 font-semibold text-light-text">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transportRequests.map(req => (
                                    <tr key={req.id} className="border-b hover:bg-gray-50">
                                        <td className="p-3 font-medium text-dark-text">{req.patientName}</td>
                                        <td className="p-3">{req.origin} &rarr; {req.destination}</td>
                                        <td className="p-3">{req.urgency}</td>
                                        <td className="p-3"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${transportStatusColors[req.status]}`}>{req.status}</span></td>
                                        <td className="p-3 text-sm space-x-2">
                                            {req.status === 'Pending' && <button onClick={() => updateTransportStatus(req.id, 'In Progress')} className="font-medium text-primary hover:underline">Start</button>}
                                            {req.status === 'In Progress' && <button onClick={() => updateTransportStatus(req.id, 'Completed')} className="font-medium text-success hover:underline">Complete</button>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                 {activeTab === 'Requisition' && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-light-bg">
                                <tr>
                                    <th className="p-3 font-semibold text-light-text">Req. ID</th>
                                    <th className="p-3 font-semibold text-light-text">Department</th>
                                    <th className="p-3 font-semibold text-light-text">Items</th>
                                    <th className="p-3 font-semibold text-light-text">Urgency</th>
                                    <th className="p-3 font-semibold text-light-text">Status</th>
                                    <th className="p-3 font-semibold text-light-text">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {supplyRequisitions.map(req => (
                                    <tr key={req.id} className="border-b hover:bg-gray-50">
                                        <td className="p-3 font-medium text-primary">{req.id}</td>
                                        <td className="p-3 font-medium text-dark-text">{req.requestingDepartment}</td>
                                        <td className="p-3 text-sm text-light-text">{req.items.length} items</td>
                                        <td className="p-3">{req.urgency}</td>
                                        <td className="p-3"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${requisitionStatusColors[req.status]}`}>{req.status}</span></td>
                                        <td className="p-3 text-sm space-x-2">
                                            {req.status === 'Pending' && <button onClick={() => updateRequisitionStatus(req.id, 'In Progress')} className="font-medium text-primary hover:underline">Start Fulfillment</button>}
                                            {req.status === 'In Progress' && <button onClick={() => updateRequisitionStatus(req.id, 'Completed')} className="font-medium text-success hover:underline">Mark Completed</button>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            <ScheduleTransportModal isOpen={isTransportModalOpen} onClose={() => setIsTransportModalOpen(false)} onSave={handleSaveTransport} />
            <CreateRequisitionModal isOpen={isRequisitionModalOpen} onClose={() => setIsRequisitionModalOpen(false)} onSave={handleSaveRequisition} />
        </div>
    );
};

export default Logistics;