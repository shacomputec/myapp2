import React, { useState, useMemo } from 'react';
import { MOCK_PATIENTS, MOCK_BLOOD_UNITS, MOCK_BLOOD_DONORS } from '../constants';
import type { BloodUnit, BloodUnitStatus, BloodDonor, Patient } from '../types';

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

const allBloodTypes = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

interface AddUnitModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (unit: Omit<BloodUnit, 'id' | 'expiryDate' | 'status'>) => void;
}

const AddUnitModal: React.FC<AddUnitModalProps> = ({ isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        donorId: MOCK_BLOOD_DONORS[0].id,
        bloodType: 'O+',
        donationDate: new Date().toISOString().split('T')[0],
    });

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const donor = MOCK_BLOOD_DONORS.find(d => d.id === formData.donorId);
        if (!donor) return;
        onSave({ ...formData, donorName: donor.name });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-8 relative dark:bg-slate-800">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-white"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                <h3 className="text-xl font-bold text-dark-text mb-4 dark:text-slate-200">Add New Blood Unit</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-light-text mb-1 dark:text-slate-400">Donor</label>
                        <select name="donorId" value={formData.donorId} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200">
                            {MOCK_BLOOD_DONORS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-light-text mb-1 dark:text-slate-400">Blood Type</label>
                            <select name="bloodType" value={formData.bloodType} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200">
                                {allBloodTypes.map(bt => <option key={bt} value={bt}>{bt}</option>)}
                            </select>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-light-text mb-1 dark:text-slate-400">Donation Date</label>
                            <input type="date" name="donationDate" value={formData.donationDate} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" />
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end">
                        <button type="submit" className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark font-semibold">Save Unit</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const BloodBank: React.FC<{ onSelectPatient: (patient: Patient) => void }> = ({ onSelectPatient }) => {
    const [units, setUnits] = useState<BloodUnit[]>(MOCK_BLOOD_UNITS);
    const [donors] = useState<BloodDonor[]>(MOCK_BLOOD_DONORS);
    const [activeTab, setActiveTab] = useState<'Inventory' | 'Donors'>('Inventory');
    const [isAdmitModalOpen, setIsAdmitModalOpen] = useState(false);

    const summary = useMemo(() => {
        const now = new Date();
        const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        return {
            totalUnits: units.length,
            available: units.filter(u => u.status === 'Available').length,
            expiringSoon: units.filter(u => u.status === 'Available' && new Date(u.expiryDate) <= sevenDaysFromNow && new Date(u.expiryDate) >= now).length,
            reserved: units.filter(u => u.status === 'Reserved').length,
        };
    }, [units]);

    const handleSaveUnit = (newUnitData: Omit<BloodUnit, 'id' | 'expiryDate' | 'status'>) => {
        const donationDate = new Date(newUnitData.donationDate);
        const expiryDate = new Date(donationDate.setDate(donationDate.getDate() + 42)).toISOString().split('T')[0];
        const newUnit: BloodUnit = {
            id: `UNIT-${(units.length + 10).toString().padStart(3, '0')}`,
            ...newUnitData,
            expiryDate,
            status: 'Available',
        };
        setUnits(prev => [newUnit, ...prev]);
    };
    
    const updateUnitStatus = (id: string, status: BloodUnitStatus, patient?: Patient) => {
        setUnits(prev => prev.map(u => u.id === id ? { ...u, status, assignedPatientId: patient?.id, assignedPatientName: patient?.name } : u));
    };

    const statusColors: Record<BloodUnitStatus, string> = {
        Available: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
        Reserved: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
        Transfused: 'bg-gray-100 text-gray-800 dark:bg-slate-600 dark:text-slate-300',
        Expired: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
    };
    
    const getExpiryColor = (expiryDate: string) => {
        const now = new Date();
        const expiry = new Date(expiryDate);
        const diffDays = (expiry.getTime() - now.getTime()) / (1000 * 3600 * 24);

        if (diffDays < 0) return 'text-red-500 font-bold';
        if (diffDays <= 7) return 'text-yellow-500 font-semibold';
        return 'text-dark-text dark:text-slate-300';
    };

    const renderContent = () => {
        if (activeTab === 'Inventory') {
            return (
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-light-bg dark:bg-slate-700">
                            <tr>
                                <th className="p-3 font-semibold text-light-text dark:text-slate-300">Unit ID</th>
                                <th className="p-3 font-semibold text-light-text dark:text-slate-300">Blood Type</th>
                                <th className="p-3 font-semibold text-light-text dark:text-slate-300">Donation Date</th>
                                <th className="p-3 font-semibold text-light-text dark:text-slate-300">Expiry Date</th>
                                <th className="p-3 font-semibold text-light-text dark:text-slate-300">Status</th>
                                <th className="p-3 font-semibold text-light-text dark:text-slate-300">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="dark:text-slate-400">
                            {units.map(u => (
                                <tr key={u.id} className="border-b dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50">
                                    <td className="p-3 font-medium text-dark-text dark:text-slate-200">{u.id}</td>
                                    <td className="p-3 font-bold text-accent text-lg">{u.bloodType}</td>
                                    <td className="p-3">{u.donationDate}</td>
                                    <td className={`p-3 ${getExpiryColor(u.expiryDate)}`}>{u.expiryDate}</td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[u.status]}`}>{u.status}</span>
                                    </td>
                                    <td className="p-3 text-sm space-x-2">
                                        {u.status === 'Available' && <button onClick={() => updateUnitStatus(u.id, 'Reserved', MOCK_PATIENTS[0])} className="font-medium text-primary hover:underline">Assign</button>}
                                        {u.status === 'Reserved' && <button onClick={() => updateUnitStatus(u.id, 'Transfused')} className="font-medium text-success hover:underline">Transfused</button>}
                                        {u.assignedPatientName && <button onClick={() => onSelectPatient(MOCK_PATIENTS.find(p=>p.id === u.assignedPatientId)!)} className="text-xs text-light-text hover:underline">(for {u.assignedPatientName})</button>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
        }
        if (activeTab === 'Donors') {
            return (
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-light-bg dark:bg-slate-700">
                            <tr>
                                <th className="p-3 font-semibold text-light-text dark:text-slate-300">Donor Name</th>
                                <th className="p-3 font-semibold text-light-text dark:text-slate-300">Blood Type</th>
                                <th className="p-3 font-semibold text-light-text dark:text-slate-300">Contact</th>
                                <th className="p-3 font-semibold text-light-text dark:text-slate-300">Last Donated</th>
                                <th className="p-3 font-semibold text-light-text dark:text-slate-300">Total Donations</th>
                            </tr>
                        </thead>
                        <tbody className="dark:text-slate-400">
                            {donors.map(d => (
                                <tr key={d.id} className="border-b dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50">
                                    <td className="p-3 font-medium text-dark-text dark:text-slate-200">{d.name}</td>
                                    <td className="p-3 font-bold text-accent text-lg">{d.bloodType}</td>
                                    <td className="p-3">{d.phone}</td>
                                    <td className="p-3">{d.lastDonationDate}</td>
                                    <td className="p-3">{d.totalDonations}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
        }
    };

    return (
        <div className="space-y-8">
             <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-dark-text dark:text-slate-200">Blood Bank</h2>
                <button onClick={() => setIsAdmitModalOpen(true)} className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark font-semibold flex items-center">
                    Add Blood Unit
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard title="Total Units" value={summary.totalUnits.toString()} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12.572l-7.5 7.428-7.5-7.428m0 0a4.5 4.5 0 117.5 4.428 4.5 4.5 0 117.5-4.428z" /></svg>} />
                <StatCard title="Available Units" value={summary.available.toString()} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>} />
                <StatCard title="Expiring Soon" value={summary.expiringSoon.toString()} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
                <StatCard title="Units Reserved" value={summary.reserved.toString()} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>} />
            </div>
             <div className="bg-white p-6 rounded-xl shadow-md dark:bg-slate-800 dark:border dark:border-slate-700">
                <div className="border-b mb-4 dark:border-slate-700">
                    <nav className="flex space-x-4">
                        {(['Inventory', 'Donors'] as const).map(tab => (
                            <button 
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-3 py-2 font-medium text-sm rounded-t-lg ${activeTab === tab ? 'border-b-2 border-primary text-primary' : 'text-light-text hover:text-dark-text dark:text-slate-400 dark:hover:text-slate-200'}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </nav>
                </div>
                {renderContent()}
            </div>
            <AddUnitModal 
                isOpen={isAdmitModalOpen}
                onClose={() => setIsAdmitModalOpen(false)}
                onSave={handleSaveUnit}
            />
        </div>
    );
};

export default BloodBank;
