import React, { useState, useMemo } from 'react';
import { MOCK_PATIENTS, MOCK_NEWBORNS, MOCK_STAFF_MEMBERS } from '../constants';
import type { Patient, Newborn } from '../types';

interface MaternityProps {
  onSelectPatient: (patient: Patient) => void;
}

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

interface RecordDeliveryModalProps {
    patient: Patient;
    isOpen: boolean;
    onClose: () => void;
    onSave: (patient: Patient, newborn: Omit<Newborn, 'id' | 'motherId' | 'motherName'>) => void;
}

const RecordDeliveryModal: React.FC<RecordDeliveryModalProps> = ({ patient, isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        timeOfBirth: new Date().toISOString().substring(0, 16),
        deliveryType: 'Vaginal',
        gender: 'Female',
        weightKg: '',
        apgarScore: '',
        notes: ''
    });

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const { timeOfBirth, gender, weightKg, apgarScore } = formData;
        if (!timeOfBirth || !gender || !weightKg || !apgarScore) {
            alert('Please fill all required newborn fields.');
            return;
        }
        onSave(patient, {
            timeOfBirth,
            gender: gender as 'Male' | 'Female',
            weightKg: parseFloat(weightKg),
            apgarScore: parseInt(apgarScore, 10),
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-8 relative">
                 <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                <h3 className="text-xl font-bold text-dark-text mb-4">Record Delivery for {patient.name}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <h4 className="text-md font-semibold text-dark-text pt-2 border-t">Newborn Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="datetime-local" name="timeOfBirth" value={formData.timeOfBirth} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded-lg" />
                        <select name="gender" value={formData.gender} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded-lg">
                            <option>Female</option>
                            <option>Male</option>
                        </select>
                         <input type="number" step="0.1" name="weightKg" value={formData.weightKg} onChange={handleChange} required placeholder="Weight (kg)" className="w-full p-2 border border-gray-300 rounded-lg" />
                         <input type="number" name="apgarScore" value={formData.apgarScore} onChange={handleChange} required placeholder="APGAR Score" className="w-full p-2 border border-gray-300 rounded-lg" />
                    </div>
                     <div className="mt-6 flex justify-end">
                        <button type="submit" className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark font-semibold">Save Delivery Record</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const Maternity: React.FC<MaternityProps> = ({ onSelectPatient }) => {
    const [maternityPatients] = useState<Patient[]>(MOCK_PATIENTS.filter(p => p.gender === 'Female' && p.gestationalAge));
    const [newborns, setNewborns] = useState<Newborn[]>(MOCK_NEWBORNS);
    const [activeTab, setActiveTab] = useState<'Mothers' | 'Newborns'>('Mothers');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPatientForDelivery, setSelectedPatientForDelivery] = useState<Patient | null>(null);

    const summary = useMemo(() => {
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        return {
            admissions: maternityPatients.length,
            newborns24h: newborns.filter(n => n.timeOfBirth > twentyFourHoursAgo).length,
            availableBeds: 5, // Mock value
            highRisk: maternityPatients.filter(p => p.riskLevel === 'High').length,
        };
    }, [maternityPatients, newborns]);

    const handleSaveDelivery = (mother: Patient, newbornDetails: Omit<Newborn, 'id' | 'motherId' | 'motherName'>) => {
        const newNewborn: Newborn = {
            id: `NB-${(newborns.length + 1).toString().padStart(3, '0')}`,
            motherId: mother.id,
            motherName: mother.name,
            ...newbornDetails,
        };
        setNewborns(prev => [newNewborn, ...prev]);
    };

    const handleOpenModal = (patient: Patient) => {
        setSelectedPatientForDelivery(patient);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setSelectedPatientForDelivery(null);
        setIsModalOpen(false);
    };


    const renderContent = () => {
        if (activeTab === 'Mothers') {
            return (
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-light-bg">
                            <tr>
                                <th className="p-3 font-semibold text-light-text">Patient Name</th>
                                <th className="p-3 font-semibold text-light-text">Gestational Age</th>
                                <th className="p-3 font-semibold text-light-text">Due Date</th>
                                <th className="p-3 font-semibold text-light-text">Risk Level</th>
                                <th className="p-3 font-semibold text-light-text">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {maternityPatients.map(p => (
                                <tr key={p.id} className="border-b hover:bg-gray-50">
                                    <td className="p-3 font-medium text-dark-text">{p.name}</td>
                                    <td className="p-3">{p.gestationalAge} weeks</td>
                                    <td className="p-3">{p.expectedDueDate}</td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${p.riskLevel === 'High' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                            {p.riskLevel}
                                        </span>
                                    </td>
                                    <td className="p-3 space-x-2">
                                        <button onClick={() => onSelectPatient(p)} className="text-primary hover:underline text-sm font-medium">View Chart</button>
                                        <button onClick={() => handleOpenModal(p)} className="bg-primary text-white px-3 py-1 rounded-lg hover:bg-primary-dark transition-colors text-sm">Record Delivery</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
        }

        if (activeTab === 'Newborns') {
            return (
                 <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-light-bg">
                            <tr>
                                <th className="p-3 font-semibold text-light-text">Newborn ID</th>
                                <th className="p-3 font-semibold text-light-text">Mother's Name</th>
                                <th className="p-3 font-semibold text-light-text">Time of Birth</th>
                                <th className="p-3 font-semibold text-light-text">Gender</th>
                                <th className="p-3 font-semibold text-light-text">Weight</th>
                                <th className="p-3 font-semibold text-light-text">APGAR</th>
                            </tr>
                        </thead>
                        <tbody>
                            {newborns.map(nb => (
                                <tr key={nb.id} className="border-b hover:bg-gray-50">
                                    <td className="p-3 font-medium text-dark-text">{nb.id}</td>
                                    <td className="p-3">
                                        <button onClick={() => onSelectPatient(MOCK_PATIENTS.find(p => p.id === nb.motherId)!)} className="text-primary hover:underline font-medium">{nb.motherName}</button>
                                    </td>
                                    <td className="p-3">{new Date(nb.timeOfBirth).toLocaleString()}</td>
                                    <td className="p-3">{nb.gender}</td>
                                    <td className="p-3">{nb.weightKg} kg</td>
                                    <td className="p-3">{nb.apgarScore}</td>
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
      <h2 className="text-3xl font-bold text-dark-text">Maternity Ward</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Current Admissions" value={summary.admissions.toString()} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857" /></svg>} />
        <StatCard title="Newborns (24h)" value={summary.newborns24h.toString()} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>} />
        <StatCard title="Available Beds" value={summary.availableBeds.toString()} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>} />
        <StatCard title="High-Risk Pregnancies" value={summary.highRisk.toString()} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>} />
      </div>

       <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="border-b mb-4">
                <nav className="flex space-x-4">
                    {(['Mothers', 'Newborns'] as const).map(tab => (
                        <button 
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-3 py-2 font-medium text-sm rounded-t-lg ${activeTab === tab ? 'border-b-2 border-primary text-primary' : 'text-light-text hover:text-dark-text'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </nav>
            </div>
            {renderContent()}
        </div>
        {isModalOpen && selectedPatientForDelivery && (
            <RecordDeliveryModal 
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                patient={selectedPatientForDelivery}
                onSave={handleSaveDelivery}
            />
        )}
    </div>
  );
};

export default Maternity;