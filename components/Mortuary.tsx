import React, { useState, useMemo } from 'react';
import { MOCK_DECEASED_RECORDS } from '../constants';
import type { DeceasedRecord, DeceasedStatus } from '../types';

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

interface AdmitModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (record: Omit<DeceasedRecord, 'id'>) => void;
}

const AdmitModal: React.FC<AdmitModalProps> = ({ isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        gender: 'Male' as 'Male' | 'Female' | 'Other',
        dateOfDeath: new Date().toISOString().split('T')[0],
        timeOfDeath: new Date().toTimeString().substring(0, 5),
        storageBay: '',
    });

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.age || !formData.storageBay) {
            alert('Please fill all required fields.');
            return;
        }
        onSave({
            ...formData,
            patientId: null,
            age: parseInt(formData.age, 10),
            dateAdmitted: new Date().toISOString().split('T')[0],
            status: 'In Storage',
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-8 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                <h3 className="text-xl font-bold text-dark-text mb-4">Admit to Mortuary</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded-lg" />
                        <input type="number" name="age" placeholder="Age" value={formData.age} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded-lg" />
                    </div>
                    <select name="gender" value={formData.gender} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg">
                        <option>Male</option>
                        <option>Female</option>
                        <option>Other</option>
                    </select>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="date" name="dateOfDeath" value={formData.dateOfDeath} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded-lg" />
                        <input type="time" name="timeOfDeath" value={formData.timeOfDeath} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded-lg" />
                    </div>
                    <input type="text" name="storageBay" placeholder="Storage Bay (e.g., Bay-03)" value={formData.storageBay} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded-lg" />
                    <div className="mt-6 flex justify-end">
                        <button type="submit" className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark font-semibold">Admit Record</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const Mortuary: React.FC = () => {
    const [records, setRecords] = useState<DeceasedRecord[]>(MOCK_DECEASED_RECORDS);
    const [isAdmitModalOpen, setIsAdmitModalOpen] = useState(false);

    const summary = useMemo(() => {
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
        return {
            occupied: records.filter(r => r.status === 'In Storage').length,
            admissions24h: records.filter(r => r.dateAdmitted >= twentyFourHoursAgo).length,
            releases24h: records.filter(r => r.dateReleased && r.dateReleased >= twentyFourHoursAgo).length,
            availableBays: 20 - records.filter(r => r.status === 'In Storage').length, // Assuming 20 total bays
        };
    }, [records]);
    
    const handleAdmit = (record: Omit<DeceasedRecord, 'id'>) => {
        const newRecord: DeceasedRecord = {
            id: `MORT-${(records.length + 1).toString().padStart(3, '0')}`,
            ...record,
        };
        setRecords(prev => [newRecord, ...prev]);
    };

    const statusColors: Record<DeceasedStatus, string> = {
        'In Storage': 'bg-blue-100 text-blue-800',
        'Released': 'bg-gray-100 text-gray-800',
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-dark-text">Mortuary Management</h2>
                <button onClick={() => setIsAdmitModalOpen(true)} className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark font-semibold flex items-center">
                    Admit to Mortuary
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard title="Occupied Bays" value={summary.occupied.toString()} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10m16-10v10M4 7h16M4 17h16" /></svg>} />
                <StatCard title="Admissions (24h)" value={summary.admissions24h.toString()} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
                <StatCard title="Releases (24h)" value={summary.releases24h.toString()} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
                <StatCard title="Available Bays" value={summary.availableBays.toString()} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>} />
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
                 <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-light-bg">
                            <tr>
                                <th className="p-3 font-semibold text-light-text">Deceased ID</th>
                                <th className="p-3 font-semibold text-light-text">Name</th>
                                <th className="p-3 font-semibold text-light-text">Date of Death</th>
                                <th className="p-3 font-semibold text-light-text">Storage Bay</th>
                                <th className="p-3 font-semibold text-light-text">Status</th>
                                <th className="p-3 font-semibold text-light-text">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {records.map(r => (
                                <tr key={r.id} className="border-b hover:bg-gray-50">
                                    <td className="p-3 font-medium text-dark-text">{r.id}</td>
                                    <td className="p-3">{r.name}</td>
                                    <td className="p-3">{r.dateOfDeath}</td>
                                    <td className="p-3">{r.storageBay}</td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[r.status]}`}>{r.status}</span>
                                    </td>
                                    <td className="p-3">
                                        {r.status === 'In Storage' ? (
                                            <button className="text-sm font-medium text-accent hover:underline">Release Body</button>
                                        ) : (
                                            <span className="text-sm text-light-text">Released on {r.dateReleased}</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <AdmitModal 
                isOpen={isAdmitModalOpen}
                onClose={() => setIsAdmitModalOpen(false)}
                onSave={handleAdmit}
            />
        </div>
    );
};

export default Mortuary;