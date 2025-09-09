import React, { useState, useEffect, useMemo, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { Patient, MedicalRecord, VitalSign, Vaccination, VaccinationStatus, CardiologyOrderStatus, LabOrder, Prescription, RadiologyOrder, CardiologyOrder, TherapySession, TherapyStatus, GeneticMarker, DischargeSummary, SOAPNote } from '../types';
import { MOCK_INVOICES, MOCK_MEDICATIONS } from '../constants';
import type { LabTestStatus, PrescriptionStatus, InvoiceStatus, RadiologyOrderStatus } from '../types';
import { getPatientChartSummary, getMealSuggestionForPatient, getGenomicTreatmentSuggestion, getDischargeSummary, generateClinicalNotesFromTranscript } from '../services/geminiService';
import ShareRecordModal from './ShareRecordModal';
import GhanaCardVerificationModal from './GhanaCardVerificationModal';
import OrderLabTestModal from './OrderLabTestModal';
import CreatePrescriptionModal from './CreatePrescriptionModal';
import OrderImagingTestModal from './OrderImagingTestModal';
import TreatmentCycleCard from './TreatmentCycleCard';
import OrderCardiologyTestModal from './OrderCardiologyTestModal';
import DischargeSummaryModal from './DischargeSummaryModal';
import AIScribeModal from './AIScribeModal';
import SummaryModal from './SummaryModal';
import { useLanguage } from '../services/localization';
import { useAuth } from '../services/auth';
import { useTheme } from '../services/theme';

interface PatientDetailProps {
  patient: Patient;
  onUpdatePatient: (patient: Patient) => void;
  labOrders: LabOrder[];
  prescriptions: Prescription[];
  radiologyOrders: RadiologyOrder[];
  cardiologyOrders: CardiologyOrder[];
  onAddLabOrder: (order: Omit<LabOrder, 'id' | 'patientName' | 'orderDate' | 'status'>) => void;
  onAddPrescription: (prescription: Omit<Prescription, 'id' | 'patientName' | 'doctor' | 'date' | 'status'>) => void;
  onAddRadiologyOrder: (order: Omit<RadiologyOrder, 'id' | 'patientName' | 'orderDate' | 'status'>) => void;
  onAddCardiologyOrder: (order: Omit<CardiologyOrder, 'id' | 'patientName' | 'orderDate' | 'status'>) => void;
  onAddDischargeSummary: (patientId: string, summary: string) => void;
}

const InfoPill: React.FC<{ label: string; value: string | React.ReactNode }> = ({ label, value }) => (
    <div className="bg-light-bg p-3 rounded-lg dark:bg-slate-800">
        <p className="text-xs font-semibold text-light-text uppercase dark:text-slate-400">{label}</p>
        <div className="text-dark-text font-medium dark:text-slate-200">{value}</div>
    </div>
);

const AddMedicalRecordModal: React.FC<{ isOpen: boolean; onClose: () => void; onSave: (record: MedicalRecord) => void; initialData?: { diagnosis: string, treatment: string } }> = ({ isOpen, onClose, onSave, initialData }) => {
    const [formData, setFormData] = useState({ diagnosis: '', treatment: '' });

    useEffect(() => {
        if(isOpen && initialData) {
            setFormData({
                diagnosis: initialData.diagnosis || '',
                treatment: initialData.treatment || ''
            })
        } else if (!isOpen) {
            setFormData({ diagnosis: '', treatment: '' });
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newRecord: MedicalRecord = {
            date: new Date().toISOString().split('T')[0],
            doctor: 'Dr. Evelyn Adjei', // Assuming logged in user
            ...formData
        };
        onSave(newRecord);
        onClose();
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 relative dark:bg-slate-800">
                 <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <h3 className="text-xl font-bold text-dark-text mb-4 dark:text-slate-200">Add New Medical Record</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-light-text mb-1 dark:text-slate-400">Diagnosis</label>
                        <input type="text" value={formData.diagnosis} onChange={e => setFormData({...formData, diagnosis: e.target.value})} required className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-light-text mb-1 dark:text-slate-400">Treatment / Notes</label>
                        <textarea value={formData.treatment} onChange={e => setFormData({...formData, treatment: e.target.value})} rows={8} required className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-slate-700 dark:border-slate-600 dark:text-white"></textarea>
                    </div>
                    <div className="flex justify-end pt-2">
                        <button type="submit" className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors font-semibold">Save Record</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const RecordVitalsModal: React.FC<{ isOpen: boolean; onClose: () => void; onSave: (vitals: VitalSign) => void; }> = ({ isOpen, onClose, onSave }) => {
    const [vitals, setVitals] = useState({ temperature: '', bloodPressure: '', heartRate: '', respiratoryRate: '' });
    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
         const newVitals: VitalSign = {
            date: new Date().toISOString().split('T')[0],
            ...vitals
        };
        onSave(newVitals);
        onClose();
    }

     return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 relative dark:bg-slate-800">
                 <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-white"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                <h3 className="text-xl font-bold text-dark-text mb-4 dark:text-slate-200">Record New Vital Signs</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <input type="text" placeholder="Temperature (°C)" value={vitals.temperature} onChange={e => setVitals({...vitals, temperature: e.target.value})} className="w-full p-2 border border-gray-300 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                        <input type="text" placeholder="Blood Pressure (mmHg)" value={vitals.bloodPressure} onChange={e => setVitals({...vitals, bloodPressure: e.target.value})} className="w-full p-2 border border-gray-300 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                        <input type="text" placeholder="Heart Rate (bpm)" value={vitals.heartRate} onChange={e => setVitals({...vitals, heartRate: e.target.value})} className="w-full p-2 border border-gray-300 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                        <input type="text" placeholder="Respiratory Rate (breaths/min)" value={vitals.respiratoryRate} onChange={e => setVitals({...vitals, respiratoryRate: e.target.value})} className="w-full p-2 border border-gray-300 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                    </div>
                    <div className="flex justify-end pt-2">
                        <button type="submit" className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark font-semibold">Save Vitals</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const MealSuggestionModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    patient: Patient;
    content: string;
    isLoading: boolean;
}> = ({ isOpen, onClose, patient, content, isLoading }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-6 relative dark:bg-slate-800">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <h3 className="text-xl font-bold text-dark-text mb-2 dark:text-slate-200">AI Meal Suggestion for {patient.name}</h3>
                <p className="text-sm text-light-text mb-4 dark:text-slate-400">Diagnosis: {patient.medicalHistory[0]?.diagnosis} | Plan: {patient.dietaryPlan}</p>
                <div className="bg-light-bg p-4 rounded-lg min-h-[250px] max-h-[60vh] overflow-y-auto dark:bg-slate-700">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-full">
                           <p className="text-light-text dark:text-slate-400">Generating meal plan...</p>
                        </div>
                    ) : (
                        <div className="prose prose-sm max-w-none text-gray-800 dark:text-slate-300" dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br />') }} />
                    )}
                </div>
            </div>
        </div>
    );
};

export const PatientDetail: React.FC<PatientDetailProps> = ({ patient, onUpdatePatient, labOrders, prescriptions, radiologyOrders, cardiologyOrders, onAddLabOrder, onAddPrescription, onAddRadiologyOrder, onAddCardiologyOrder, onAddDischargeSummary }) => {
  const [activeTab, setActiveTab] = useState('History');
  const [searchTerm, setSearchTerm] = useState('');
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [initialRecordData, setInitialRecordData] = useState<{ diagnosis: string, treatment: string } | undefined>(undefined);
  const [isVitalsModalOpen, setIsVitalsModalOpen] = useState(false);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [summaryContent, setSummaryContent] = useState('');
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [isMealModalOpen, setIsMealModalOpen] = useState(false);
  const [mealSuggestion, setMealSuggestion] = useState('');
  const [isGeneratingMeal, setIsGeneratingMeal] = useState(false);
  const [isLabOrderModalOpen, setIsLabOrderModalOpen] = useState(false);
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  const [isImagingOrderModalOpen, setIsImagingOrderModalOpen] = useState(false);
  const [isCardiologyOrderModalOpen, setIsCardiologyOrderModalOpen] = useState(false);
  const [isGenomicSuggestionModalOpen, setIsGenomicSuggestionModalOpen] = useState(false);
  const [genomicSuggestion, setGenomicSuggestion] = useState('');
  const [isGeneratingGenomicSuggestion, setIsGeneratingGenomicSuggestion] = useState(false);
  const [isDischargeModalOpen, setIsDischargeModalOpen] = useState(false);
  const [dischargeSummaryContent, setDischargeSummaryContent] = useState('');
  const [isGeneratingDischargeSummary, setIsGeneratingDischargeSummary] = useState(false);
  const [isScribeModalOpen, setIsScribeModalOpen] = useState(false);
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const actionMenuRef = useRef<HTMLDivElement>(null);


  const { hasPermission } = useAuth();
  const { t } = useLanguage();
  const { theme } = useTheme();
  
  const patientPrescriptions = useMemo(() => 
    prescriptions.filter(p => p.patientId === patient.id), 
    [prescriptions, patient.id]
  );
  
  useEffect(() => {
    setSearchTerm('');
  }, [activeTab]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (actionMenuRef.current && !actionMenuRef.current.contains(event.target as Node)) {
            setIsActionMenuOpen(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
        document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSaveMedicalRecord = (record: MedicalRecord) => {
    const updatedPatient = {
        ...patient,
        medicalHistory: [record, ...patient.medicalHistory],
    };
    onUpdatePatient(updatedPatient);
  };

  const handleSaveVitals = (vitals: VitalSign) => {
    const updatedPatient = {
        ...patient,
        vitals: [vitals, ...patient.vitals],
    };
    onUpdatePatient(updatedPatient);
  };
  
  const handleVerificationSuccess = () => {
    const updatedPatient = { ...patient, ghanaCardStatus: 'Verified' as const };
    onUpdatePatient(updatedPatient);
    setIsVerificationModalOpen(false);
  };

  const handleGenerateSummary = async () => {
      setIsGeneratingSummary(true);
      setIsSummaryModalOpen(true);
      
      const patientLabOrders = labOrders.filter(o => o.patientId === patient.id);
      
      // Compile a comprehensive string of patient data
      const patientDataString = `
        - Patient: ${patient.name}, ${patient.age}, ${patient.gender}
        - Blood Type: ${patient.bloodType}
        - Allergies: ${patient.allergies.join(', ') || 'None'}
        - Medical History: ${patient.medicalHistory.map(h => `${h.date}: ${h.diagnosis} (${h.treatment})`).join('; ')}
        - Recent Vitals: ${patient.vitals.slice(0, 1).map(v => `${v.date}: BP ${v.bloodPressure}, HR ${v.heartRate}, Temp ${v.temperature}`).join('; ')}
        - Recent Lab Results: ${patientLabOrders.map(o => `${o.orderDate}: ${o.testName} - ${o.status} (${o.results || 'N/A'})`).join('; ')}
        - Active Prescriptions: ${patientPrescriptions.map(p => `${p.date}: ${p.items.map(i => MOCK_MEDICATIONS.find(m => m.id === i.medicationId)?.name).join(', ')}`).join('; ')}
      `;

      const summary = await getPatientChartSummary(patientDataString);
      setSummaryContent(summary);
      setIsGeneratingSummary(false);
  };
  
  const handleGenerateDischargeSummary = async () => {
    setIsGeneratingDischargeSummary(true);
    setDischargeSummaryContent('');
    setIsDischargeModalOpen(true);
    
    const patientDataString = `
      - Patient: ${patient.name}, ${patient.age}, ${patient.gender}
      - Admission Diagnosis: ${patient.medicalHistory[patient.medicalHistory.length - 1]?.diagnosis || 'N/A'}
      - Discharge Diagnosis: ${patient.medicalHistory[0]?.diagnosis || 'N/A'}
      - Medical History: ${patient.medicalHistory.map(h => `${h.date}: ${h.diagnosis} (${h.treatment})`).join('; ')}
      - Lab Results: ${labOrders.filter(o => o.patientId === patient.id).map(o => `${o.testName}: ${o.results || o.status}`).join('; ')}
      - Prescriptions: ${prescriptions.filter(p => p.patientId === patient.id).map(p => `${p.items.map(i => MOCK_MEDICATIONS.find(m => m.id === i.medicationId)?.name).join(', ')}`).join('; ')}
    `;

    try {
        const summary = await getDischargeSummary(patientDataString);
        setDischargeSummaryContent(summary);
    } catch (e) {
        setDischargeSummaryContent("An error occurred while generating the discharge summary.");
    } finally {
        setIsGeneratingDischargeSummary(false);
    }
  };

  const handleSaveDischargeSummary = (summary: string) => {
    onAddDischargeSummary(patient.id, summary);
    setIsDischargeModalOpen(false);
  };

  const handleGenerateMealPlan = async () => {
    if (!patient.dietaryPlan || !patient.medicalHistory[0]?.diagnosis) {
        alert("Patient requires a dietary plan and a diagnosis to generate suggestions.");
        return;
    }
    setIsGeneratingMeal(true);
    setIsMealModalOpen(true);
    setMealSuggestion('');

    try {
        const suggestion = await getMealSuggestionForPatient(patient.medicalHistory[0].diagnosis, patient.dietaryPlan);
        setMealSuggestion(suggestion);
    } catch (error) {
        setMealSuggestion("An error occurred while generating the meal plan.");
    } finally {
        setIsGeneratingMeal(false);
    }
  };

  const handleGetGenomicSuggestion = async () => {
    if (!patient.genomicProfile || !patient.oncologyProfile) return;
    setIsGeneratingGenomicSuggestion(true);
    setGenomicSuggestion('');
    setIsGenomicSuggestionModalOpen(true);

    try {
        const result = await getGenomicTreatmentSuggestion(patient.oncologyProfile.cancerType, patient.genomicProfile.markers);
        setGenomicSuggestion(result);
    } catch (e) {
        setGenomicSuggestion('An error occurred while generating the suggestion.');
    } finally {
        setIsGeneratingGenomicSuggestion(false);
    }
  };
  
  const handleSaveFromScribe = (note: SOAPNote) => {
    const treatmentText = `Subjective: ${note.subjective}\n\nObjective: ${note.objective}\n\nPlan: ${note.plan}`;
    setInitialRecordData({ diagnosis: note.assessment, treatment: treatmentText });
    setIsScribeModalOpen(false);
    setIsRecordModalOpen(true);
  };


  const renderContent = () => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();

    switch (activeTab) {
        case 'History':
            const filteredHistory = patient.medicalHistory.filter(record =>
                record.diagnosis.toLowerCase().includes(lowerCaseSearchTerm) ||
                record.treatment.toLowerCase().includes(lowerCaseSearchTerm) ||
                record.doctor.toLowerCase().includes(lowerCaseSearchTerm)
            );
            return (
                <div className="space-y-4">
                    {filteredHistory.length > 0 ? filteredHistory.map((record, index) => (
                        <div key={index} className="bg-light-bg p-4 rounded-lg dark:bg-slate-700">
                            <p className="font-bold text-dark-text dark:text-slate-200">{record.diagnosis}</p>
                            <p className="text-sm dark:text-slate-300">Treatment: {record.treatment}</p>
                            <div className="text-xs text-light-text mt-2 dark:text-slate-400">
                                <span>{record.date}</span> | <span>{record.doctor}</span>
                            </div>
                        </div>
                    )) : <p className="text-light-text text-center p-4 dark:text-slate-400">No history records found{searchTerm && ` matching "${searchTerm}"`}.</p>}
                </div>
            );
        case 'Appointments':
            const filteredAppointments = patient.appointments.filter(app =>
                app.doctor.toLowerCase().includes(lowerCaseSearchTerm) ||
                app.department.toLowerCase().includes(lowerCaseSearchTerm) ||
                app.reason.toLowerCase().includes(lowerCaseSearchTerm)
            );
            return (
                <div className="overflow-x-auto">
                    {filteredAppointments.length > 0 ? (
                        <table className="w-full text-left">
                            <thead className="dark:text-slate-300">
                                <tr className="border-b dark:border-slate-700">
                                    <th className="p-2 font-semibold text-light-text">Date</th>
                                    <th className="p-2 font-semibold text-light-text">Doctor</th>
                                    <th className="p-2 font-semibold text-light-text">Department</th>
                                    <th className="p-2 font-semibold text-light-text">Type</th>
                                    <th className="p-2 font-semibold text-light-text">Status</th>
                                </tr>
                            </thead>
                            <tbody className="dark:text-slate-400">
                                {filteredAppointments.map(app => (
                                    <tr key={app.id} className="border-b dark:border-slate-700">
                                        <td className="p-2">{app.date} @ {app.time}</td>
                                        <td className="p-2">{app.doctor}</td>
                                        <td className="p-2">{app.department}</td>
                                        <td className="p-2">
                                            {app.type === 'Virtual' ? (
                                                <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-purple-900/50 dark:text-purple-300">Virtual</span>
                                            ) : (
                                                <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-slate-600 dark:text-slate-300">In-Person</span>
                                            )}
                                        </td>
                                        <td className="p-2"><span className={`px-2 py-1 text-xs rounded-full ${app.status === 'Scheduled' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300' : app.status === 'Completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'}`}>{app.status}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : <p className="text-light-text text-center p-4 dark:text-slate-400">No appointments found{searchTerm && ` matching "${searchTerm}"`}.</p>}
                </div>
            );
        case 'Vitals':
             const parsedVitals = useMemo(() => {
                if (!patient.vitals || patient.vitals.length === 0) {
                    return [];
                }
                return [...patient.vitals].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .map(v => {
                    const bp = v.bloodPressure ? v.bloodPressure.split(' ')[0].split('/') : [];
                    const systolic = bp.length > 0 ? parseInt(bp[0], 10) : null;
                    const diastolic = bp.length > 1 ? parseInt(bp[1], 10) : null;
                    return {
                        date: v.date,
                        temperature: v.temperature ? parseFloat(v.temperature) : null,
                        heartRate: v.heartRate ? parseInt(v.heartRate, 10) : null,
                        respiratoryRate: v.respiratoryRate ? parseInt(v.respiratoryRate, 10) : null,
                        systolic: systolic && !isNaN(systolic) ? systolic : null,
                        diastolic: diastolic && !isNaN(diastolic) ? diastolic : null,
                    };
                });
            }, [patient.vitals]);

             return (
                 <div className="space-y-6">
                    {parsedVitals.length > 1 ? (
                        <div className="space-y-8">
                            <h4 className="font-semibold text-dark-text dark:text-slate-200">Vitals Trend</h4>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={parsedVitals} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#475569' : '#e5e7eb'} />
                                        <XAxis dataKey="date" tick={{ fill: theme === 'dark' ? '#94a3b8' : '#6b7280', fontSize: 12 }} />
                                        <YAxis domain={['dataMin - 1', 'dataMax + 1']} label={{ value: '°C', angle: -90, position: 'insideLeft', fill: theme === 'dark' ? '#94a3b8' : '#6b7280' }} tick={{ fill: theme === 'dark' ? '#94a3b8' : '#6b7280', fontSize: 12 }} />
                                        <Tooltip contentStyle={{ backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff', border: `1px solid ${theme === 'dark' ? '#334155' : '#e5e7eb'}` }} />
                                        <Legend wrapperStyle={{ color: theme === 'dark' ? '#94a3b8' : '#374151' }} />
                                        <Line type="monotone" dataKey="temperature" stroke="#ef4444" name="Temperature (°C)" dot={false} strokeWidth={2} connectNulls />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={parsedVitals} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#475569' : '#e5e7eb'} />
                                        <XAxis dataKey="date" tick={{ fill: theme === 'dark' ? '#94a3b8' : '#6b7280', fontSize: 12 }} />
                                        <YAxis label={{ value: 'Rate', angle: -90, position: 'insideLeft', fill: theme === 'dark' ? '#94a3b8' : '#6b7280' }} tick={{ fill: theme === 'dark' ? '#94a3b8' : '#6b7280', fontSize: 12 }} />
                                        <Tooltip contentStyle={{ backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff', border: `1px solid ${theme === 'dark' ? '#334155' : '#e5e7eb'}` }} />
                                        <Legend wrapperStyle={{ color: theme === 'dark' ? '#94a3b8' : '#374151' }} />
                                        <Line type="monotone" dataKey="heartRate" stroke="#3b82f6" name="Heart Rate (bpm)" dot={false} strokeWidth={2} connectNulls />
                                        <Line type="monotone" dataKey="respiratoryRate" stroke="#22c55e" name="Resp. Rate (/min)" dot={false} strokeWidth={2} connectNulls />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                             <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={parsedVitals} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#475569' : '#e5e7eb'} />
                                        <XAxis dataKey="date" tick={{ fill: theme === 'dark' ? '#94a3b8' : '#6b7280', fontSize: 12 }} />
                                        <YAxis label={{ value: 'mmHg', angle: -90, position: 'insideLeft', fill: theme === 'dark' ? '#94a3b8' : '#6b7280' }} tick={{ fill: theme === 'dark' ? '#94a3b8' : '#6b7280', fontSize: 12 }} />
                                        <Tooltip contentStyle={{ backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff', border: `1px solid ${theme === 'dark' ? '#334155' : '#e5e7eb'}` }} />
                                        <Legend wrapperStyle={{ color: theme === 'dark' ? '#94a3b8' : '#374151' }} />
                                        <Line type="monotone" dataKey="systolic" stroke="#f97316" name="Systolic (mmHg)" dot={false} strokeWidth={2} connectNulls />
                                        <Line type="monotone" dataKey="diastolic" stroke="#a855f7" name="Diastolic (mmHg)" dot={false} strokeWidth={2} connectNulls />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    ) : null }
                     <h4 className="font-semibold text-dark-text dark:text-slate-200 pt-4 border-t dark:border-slate-700">Recorded Vitals</h4>
                    <div className="space-y-4">
                        {patient.vitals.map((vital, index) => (
                            <div key={index} className="bg-light-bg p-4 rounded-lg dark:bg-slate-700">
                                 <p className="text-sm font-semibold text-light-text mb-2 dark:text-slate-400">{vital.date}</p>
                                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <InfoPill label="Blood Pressure" value={vital.bloodPressure} />
                                    <InfoPill label="Heart Rate" value={vital.heartRate} />
                                    <InfoPill label="Temperature" value={vital.temperature} />
                                    <InfoPill label="Resp. Rate" value={vital.respiratoryRate} />
                                 </div>
                            </div>
                        ))}
                    </div>
                 </div>
             );
        case 'Lab Results':
            const patientLabOrders = labOrders.filter(o => o.patientId === patient.id);
            const filteredLabOrders = patientLabOrders.filter(order =>
                order.testName.toLowerCase().includes(lowerCaseSearchTerm) ||
                order.id.toLowerCase().includes(lowerCaseSearchTerm)
            );
            const labStatusColors: { [key in LabTestStatus]: string } = {
                Completed: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
                'In Progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
                Pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
            };
            return (
                <div className="overflow-x-auto">
                    {filteredLabOrders.length > 0 ? (
                        <table className="w-full text-left">
                            <thead className="dark:text-slate-300">
                                <tr className="border-b dark:border-slate-700">
                                    <th className="p-2 font-semibold text-light-text">Order ID</th>
                                    <th className="p-2 font-semibold text-light-text">Test Name</th>
                                    <th className="p-2 font-semibold text-light-text">Order Date</th>
                                    <th className="p-2 font-semibold text-light-text">Status</th>
                                </tr>
                            </thead>
                            <tbody className="dark:text-slate-400">
                                {filteredLabOrders.map(order => (
                                    <tr key={order.id} className="border-b dark:border-slate-700">
                                        <td className="p-2">{order.id}</td>
                                        <td className="p-2">{order.testName}</td>
                                        <td className="p-2">{order.orderDate}</td>
                                        <td className="p-2">
                                            <span className={`px-2 py-1 text-xs rounded-full ${labStatusColors[order.status]}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : <p className="text-light-text text-center p-4 dark:text-slate-400">No lab orders found{searchTerm && ` matching "${searchTerm}"`}.</p>}
                </div>
            );
         case 'Radiology':
            const patientRadiologyOrders = radiologyOrders.filter(o => o.patientId === patient.id);
            const filteredRadiologyOrders = patientRadiologyOrders.filter(order =>
                order.testName.toLowerCase().includes(lowerCaseSearchTerm) ||
                order.id.toLowerCase().includes(lowerCaseSearchTerm)
            );
             const radiologyStatusColors: { [key in RadiologyOrderStatus]: string } = {
                Completed: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
                'In Progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
                Pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
            };
            return (
                <div className="overflow-x-auto">
                    {filteredRadiologyOrders.length > 0 ? (
                        <table className="w-full text-left">
                            <thead className="dark:text-slate-300">
                                <tr className="border-b dark:border-slate-700">
                                    <th className="p-2 font-semibold text-light-text">Order ID</th>
                                    <th className="p-2 font-semibold text-light-text">Test Name</th>
                                    <th className="p-2 font-semibold text-light-text">Order Date</th>
                                    <th className="p-2 font-semibold text-light-text">Status</th>
                                </tr>
                            </thead>
                            <tbody className="dark:text-slate-400">
                                {filteredRadiologyOrders.map(order => (
                                    <tr key={order.id} className="border-b dark:border-slate-700">
                                        <td className="p-2">{order.id}</td>
                                        <td className="p-2">{order.testName}</td>
                                        <td className="p-2">{order.orderDate}</td>
                                        <td className="p-2">
                                            <span className={`px-2 py-1 text-xs rounded-full ${radiologyStatusColors[order.status]}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : <p className="text-light-text text-center p-4 dark:text-slate-400">No radiology orders found{searchTerm && ` matching "${searchTerm}"`}.</p>}
                </div>
            );
        case 'Prescriptions':
            const prescriptionStatusColors: { [key in PrescriptionStatus]: string } = {
                Dispensed: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
                Pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
                Cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
            };
             const filteredPrescriptions = patientPrescriptions.filter(p => {
                const medNames = p.items.map(i => MOCK_MEDICATIONS.find(m => m.id === i.medicationId)?.name || '').join(' ').toLowerCase();
                return medNames.includes(lowerCaseSearchTerm) || p.doctor.toLowerCase().includes(lowerCaseSearchTerm);
             });
            return (
                 <div className="overflow-x-auto">
                    {filteredPrescriptions.length > 0 ? (
                        <table className="w-full text-left">
                            <thead className="dark:text-slate-300">
                                <tr className="border-b dark:border-slate-700">
                                    <th className="p-2 font-semibold text-light-text">Date</th>
                                    <th className="p-2 font-semibold text-light-text">Medication(s)</th>
                                    <th className="p-2 font-semibold text-light-text">Doctor</th>
                                    <th className="p-2 font-semibold text-light-text">Status</th>
                                </tr>
                            </thead>
                            <tbody className="dark:text-slate-400">
                                {filteredPrescriptions.map(p => (
                                    <tr key={p.id} className="border-b dark:border-slate-700">
                                        <td className="p-2">{p.date}</td>
                                        <td className="p-2">{p.items.map(i => MOCK_MEDICATIONS.find(m => m.id === i.medicationId)?.name).join(', ')}</td>
                                        <td className="p-2">{p.doctor}</td>
                                        <td className="p-2">
                                             <span className={`px-2 py-1 text-xs rounded-full ${prescriptionStatusColors[p.status]}`}>
                                                {p.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : <p className="text-light-text text-center p-4 dark:text-slate-400">No prescriptions found{searchTerm && ` matching "${searchTerm}"`}.</p>}
                </div>
            );
        case 'Billing':
            const patientInvoices = MOCK_INVOICES.filter(inv => inv.patientId === patient.id);
             const invoiceStatusColors: { [key in InvoiceStatus]: string } = {
                Paid: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
                Pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
                Overdue: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
            };
            return (
                 <div className="overflow-x-auto">
                    {patientInvoices.length > 0 ? (
                        <table className="w-full text-left">
                            <thead className="dark:text-slate-300">
                                <tr className="border-b dark:border-slate-700">
                                    <th className="p-2 font-semibold text-light-text">Invoice ID</th>
                                    <th className="p-2 font-semibold text-light-text">Date</th>
                                    <th className="p-2 font-semibold text-light-text">Total Amount</th>
                                    <th className="p-2 font-semibold text-light-text">Status</th>
                                </tr>
                            </thead>
                            <tbody className="dark:text-slate-400">
                                {patientInvoices.map(inv => (
                                    <tr key={inv.id} className="border-b dark:border-slate-700">
                                        <td className="p-2">{inv.id}</td>
                                        <td className="p-2">{inv.date}</td>
                                        <td className="p-2">GH₵{inv.totalAmount.toFixed(2)}</td>
                                        <td className="p-2">
                                             <span className={`px-2 py-1 text-xs rounded-full ${invoiceStatusColors[inv.status]}`}>
                                                {inv.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : <p className="text-light-text text-center p-4 dark:text-slate-400">No invoices found for this patient.</p>}
                </div>
            );
        case 'Discharge':
            return (
                <div className="space-y-4">
                    {patient.dischargeSummaries && patient.dischargeSummaries.length > 0 ? patient.dischargeSummaries.map((summary, index) => (
                        <div key={index} className="bg-light-bg p-4 rounded-lg dark:bg-slate-700">
                            <p className="font-bold text-dark-text dark:text-slate-200">Discharge Summary</p>
                            <div className="text-xs text-light-text mb-2 dark:text-slate-400">
                                <span>{summary.date}</span> | <span>{summary.doctor}</span>
                            </div>
                            <pre className="text-sm dark:text-slate-300 whitespace-pre-wrap font-sans">{summary.summary}</pre>
                        </div>
                    )) : <p className="text-light-text text-center p-4 dark:text-slate-400">No discharge summaries found.</p>}
                </div>
            );
        case 'Oncology':
            if (!patient.oncologyProfile) return <p>No oncology profile for this patient.</p>;
            return (
                <div className="space-y-4">
                    {patient.oncologyProfile.treatmentPlan.map(cycle => <TreatmentCycleCard key={cycle.id} cycle={cycle} />)}
                </div>
            );
        case 'Cardiology':
            if (!patient.cardiologyProfile) return <p>No cardiology profile for this patient.</p>;
            const patientCardiologyOrders = cardiologyOrders.filter(o => o.patientId === patient.id);
            return (
                <div className="space-y-4">
                    <div>
                        <h4 className="font-semibold">Known Conditions</h4>
                        <p>{patient.cardiologyProfile.knownConditions.join(', ')}</p>
                    </div>
                     <div>
                        <h4 className="font-semibold">Risk Factors</h4>
                        <p>{patient.cardiologyProfile.riskFactors.join(', ')}</p>
                    </div>
                     <div>
                        <h4 className="font-semibold mt-4 pt-4 border-t">Cardiology Orders</h4>
                        {patientCardiologyOrders.map(order => (
                            <div key={order.id} className="bg-light-bg p-3 rounded-lg mt-2">
                                <p>{order.testName} - {order.status} ({order.orderDate})</p>
                            </div>
                        ))}
                    </div>
                </div>
            );
        case 'Maternity':
             if (!patient.gestationalAge) return <p>No maternity profile for this patient.</p>;
             return (
                 <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                        <InfoPill label={t('patientDetail.maternity.gestationalAge')} value={`${patient.gestationalAge} ${t('patientDetail.maternity.weeks')}`} />
                        <InfoPill label={t('patientDetail.maternity.dueDate')} value={patient.expectedDueDate || 'N/A'} />
                        <InfoPill label={t('patientDetail.maternity.riskLevel')} value={patient.riskLevel || 'Normal'} />
                    </div>
                    <div>
                        <h4 className="font-semibold mt-4 pt-4 border-t">{t('patientDetail.maternity.antenatalVisits')}</h4>
                        {patient.antenatalHistory && patient.antenatalHistory.length > 0 ? (
                           patient.antenatalHistory.map((visit, index) => (
                               <div key={index} className="bg-light-bg p-3 rounded-lg mt-2">
                                   <p className="font-bold">{visit.date}</p>
                                   <p className="text-sm">Gestation: {visit.weeksOfGestation} weeks, BP: {visit.bloodPressure}</p>
                               </div>
                           ))
                        ) : <p className="text-sm text-light-text">{t('patientDetail.maternity.noVisits')}</p>}
                    </div>
                 </div>
             );
        case 'Pediatrics':
            if (patient.age >= 18) return <p>Not a pediatric patient.</p>;
            const statusColors: Record<VaccinationStatus, string> = {
                Upcoming: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
                Administered: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
                Overdue: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
            };
            return (
                 <div>
                    <h4 className="font-semibold">{t('patientDetail.pediatrics.vaccinationSchedule')}</h4>
                     {patient.vaccinations && patient.vaccinations.length > 0 ? (
                        <table className="w-full text-left mt-2">
                             <thead className="dark:text-slate-300">
                                <tr className="border-b dark:border-slate-700">
                                    <th className="p-2 font-semibold text-light-text">{t('patientDetail.pediatrics.vaccine')}</th>
                                    <th className="p-2 font-semibold text-light-text">{t('patientDetail.pediatrics.dueDate')}</th>
                                    <th className="p-2 font-semibold text-light-text">{t('patientDetail.pediatrics.status')}</th>
                                </tr>
                            </thead>
                             <tbody className="dark:text-slate-400">
                                {patient.vaccinations.map(v => (
                                    <tr key={v.id} className="border-b dark:border-slate-700">
                                        <td className="p-2">{v.vaccineName}</td>
                                        <td className="p-2">{v.dueDate}</td>
                                        <td className="p-2">
                                            <span className={`px-2 py-1 text-xs rounded-full ${statusColors[v.status]}`}>
                                                {v.status}
                                            </span>
                                            {v.status === 'Administered' && <span className="text-xs ml-2 text-light-text">({t('patientDetail.pediatrics.administeredOn')} {v.administeredDate})</span>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                     ) : <p className="text-sm text-light-text mt-2">{t('patientDetail.pediatrics.noRecords')}</p>}
                 </div>
            );
        case 'Physiotherapy':
            const therapyStatusColors: Record<TherapyStatus, string> = {
                Scheduled: 'bg-blue-100 text-blue-800',
                Completed: 'bg-green-100 text-green-800',
                Cancelled: 'bg-red-100 text-red-800',
            };
             if (!patient.physiotherapyProfile) return <p>No physiotherapy profile for this patient.</p>;
             return (
                 <div>
                    <h4 className="font-semibold">{t('patientDetail.physiotherapy.title')}</h4>
                     {patient.physiotherapyProfile.sessions && patient.physiotherapyProfile.sessions.length > 0 ? (
                        <table className="w-full text-left mt-2">
                             <thead><tr className="border-b"><th className="p-2">Date</th><th className="p-2">Type</th><th className="p-2">Status</th></tr></thead>
                             <tbody>
                                {patient.physiotherapyProfile.sessions.map(s => (
                                    <tr key={s.id} className="border-b"><td className="p-2">{s.date}</td><td className="p-2">{s.sessionType}</td><td className="p-2"><span className={`px-2 py-1 text-xs rounded-full ${therapyStatusColors[s.status]}`}>{s.status}</span></td></tr>
                                ))}
                            </tbody>
                        </table>
                     ) : <p className="text-sm text-light-text mt-2">{t('patientDetail.physiotherapy.noRecords')}</p>}
                 </div>
             );
        case 'Genomics':
            if (!patient.genomicProfile) return <p>No genomic profile for this patient.</p>;
            const markerClassColors: Record<GeneticMarker['classification'], string> = {
                'Pathogenic': 'text-red-600',
                'Likely Pathogenic': 'text-orange-600',
                'Benign': 'text-green-600',
                'Variant of Uncertain Significance': 'text-gray-600',
            };
            return (
                <div>
                    <h4 className="font-semibold">Genomic Report Summary</h4>
                    <p className="text-sm italic bg-light-bg p-3 rounded-md mt-2">{patient.genomicProfile.summary}</p>
                    <h4 className="font-semibold mt-4 pt-4 border-t">Identified Genetic Markers</h4>
                    {patient.genomicProfile.markers.map(marker => (
                        <div key={marker.id} className="bg-light-bg p-3 rounded-lg mt-2">
                            <p className="font-bold">{marker.gene} - <span className="font-mono text-xs">{marker.variant}</span></p>
                            <p className={`font-semibold text-sm ${markerClassColors[marker.classification]}`}>{marker.classification}</p>
                            <p className="text-xs mt-1">{marker.implication}</p>
                        </div>
                    ))}
                </div>
            )
        default:
            return <div>Select a tab</div>;
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Patient Header */}
      <div className="bg-white p-6 rounded-xl shadow-md flex flex-col md:flex-row items-start justify-between dark:bg-slate-800">
        <div className="flex items-center">
            <img src={patient.avatarUrl} alt={patient.name} className="w-24 h-24 rounded-full mr-6 border-4 border-primary" />
            <div>
                <h2 className="text-3xl font-bold text-dark-text dark:text-slate-200">{patient.name}</h2>
                <p className="text-light-text dark:text-slate-400">{patient.age} years old {patient.gender}</p>
                 <div className="flex items-center space-x-2 mt-2">
                    <span className="text-xs font-semibold bg-gray-200 text-gray-800 px-2 py-1 rounded-full dark:bg-slate-700 dark:text-slate-300">{patient.patientType}</span>
                     {patient.nhisId && <span className="text-xs font-semibold bg-green-100 text-green-800 px-2 py-1 rounded-full dark:bg-green-900/50 dark:text-green-300">NHIS</span>}
                 </div>
            </div>
        </div>
        <div className="flex items-center space-x-2 mt-4 md:mt-0">
            {hasPermission('patient:write') && (
                <button 
                    onClick={() => { setInitialRecordData(undefined); setIsRecordModalOpen(true); }} 
                    className="bg-primary text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-primary-dark"
                >
                    {t('patientDetail.addRecord')}
                </button>
            )}
            
            <div className="relative" ref={actionMenuRef}>
                <button 
                    onClick={() => setIsActionMenuOpen(prev => !prev)}
                    className="bg-light-bg text-dark-text px-4 py-2 rounded-lg font-semibold text-sm hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 flex items-center"
                >
                    More Actions
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>

                {isActionMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg z-20 dark:bg-slate-800 ring-1 ring-black ring-opacity-5">
                        <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                            {hasPermission('admin:ai_assistant') && (
                                <button 
                                    onClick={() => { handleGenerateSummary(); setIsActionMenuOpen(false); }} 
                                    className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-slate-200 dark:hover:bg-slate-700 disabled:opacity-50"
                                    disabled={isGeneratingSummary}
                                >
                                    {t('patientDetail.generateSummary')}
                                </button>
                            )}
                            {hasPermission('patient:write') && (
                                <button 
                                    onClick={() => { setIsVitalsModalOpen(true); setIsActionMenuOpen(false); }} 
                                    className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-slate-200 dark:hover:bg-slate-700"
                                >
                                    {t('patientDetail.recordVitals')}
                                </button>
                            )}
                            <button 
                                onClick={() => { setIsShareModalOpen(true); setIsActionMenuOpen(false); }} 
                                className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-slate-200 dark:hover:bg-slate-700"
                            >
                                {t('patientDetail.shareRecord')}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>
      
      {/* Patient Info Pills */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <InfoPill label={t('patientDetail.pill.patientId')} value={patient.id} />
        {patient.patientType === 'National' ? (
            <>
                <InfoPill label={t('patientDetail.pill.ghanaCard')} value={
                    <div className="flex items-center">
                        <span>{patient.ghanaCardId || 'N/A'}</span>
                        {patient.ghanaCardStatus === 'Unverified' && patient.ghanaCardId &&
                            <button onClick={() => setIsVerificationModalOpen(true)} className="ml-2 text-xs text-accent hover:underline">({t('patientDetail.verifyIdNow')})</button>
                        }
                    </div>
                } />
                <InfoPill label={t('patientDetail.pill.verificationStatus')} value={
                    <span className={`px-2 py-0.5 text-xs rounded-full ${patient.ghanaCardStatus === 'Verified' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'}`}>{patient.ghanaCardStatus}</span>
                } />
                <InfoPill label={t('patientDetail.pill.nhisId')} value={patient.nhisId || 'N/A'} />
            </>
        ) : (
             <>
                <InfoPill label={t('patientDetail.pill.nationality')} value={patient.nationality} />
                <InfoPill label={t('patientDetail.pill.passportId')} value={patient.passportId} />
                <InfoPill label={t('patientDetail.pill.visaType')} value={patient.visaType} />
            </>
        )}
        <InfoPill label={t('patientDetail.pill.bloodType')} value={patient.bloodType} />
        <InfoPill label={t('patientDetail.pill.dietaryPlan')} value={
            <div className="flex items-center">
                <span>{patient.dietaryPlan || 'Standard'}</span>
                {patient.dietaryPlan && <button onClick={handleGenerateMealPlan} className="ml-2 text-xs text-accent hover:underline">(AI Meal Plan)</button>}
            </div>
        } />
      </div>

      {/* Tabs */}
      <div className="bg-white p-6 rounded-xl shadow-md dark:bg-slate-800">
        <div className="flex flex-wrap items-center justify-between mb-4 border-b -mx-6 px-6 pb-2 dark:border-slate-700">
            <nav className="flex flex-wrap -mb-px space-x-4">
                {['History', 'Appointments', 'Vitals', 'Lab Results', 'Radiology', 'Prescriptions', 'Billing', 'Discharge'].map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-light-text hover:text-dark-text hover:border-gray-300 dark:text-slate-400 dark:hover:text-slate-200'}`}>
                        {t(`patientDetail.tab.${tab.toLowerCase().replace(' ', '')}`)}
                    </button>
                ))}
            </nav>
            <div className="relative mt-2 sm:mt-0">
                <input
                    type="text"
                    placeholder={`Search in ${activeTab}...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full sm:w-64 p-2 pl-8 border border-gray-300 rounded-lg text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
                />
                 <svg className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
        </div>
        
        {/* Tab Content */}
        <div>{renderContent()}</div>
      </div>
      
       {/* More Tabs for specialized departments */}
       <div className="bg-white p-6 rounded-xl shadow-md dark:bg-slate-800">
          <div className="flex flex-wrap items-center justify-between mb-4 border-b -mx-6 px-6 pb-2 dark:border-slate-700">
              <nav className="flex flex-wrap -mb-px space-x-4">
                  {['Oncology', 'Cardiology', 'Maternity', 'Pediatrics', 'Physiotherapy', 'Genomics'].map(tab => (
                      (patient as any)[`${tab.toLowerCase()}Profile`] || (tab === 'Maternity' && patient.gestationalAge) || (tab === 'Pediatrics' && patient.age < 18) ?
                      <button key={tab} onClick={() => setActiveTab(tab)} className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-light-text hover:text-dark-text hover:border-gray-300 dark:text-slate-400 dark:hover:text-slate-200'}`}>
                          {t(`patientDetail.tab.${tab.toLowerCase()}`)}
                      </button> : null
                  ))}
              </nav>
               {hasPermission('patient:write') && activeTab === 'Discharge' && <button onClick={handleGenerateDischargeSummary} className="bg-primary text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-primary-dark">Generate Discharge Summary</button>}
                {hasPermission('patient:write') && (
                    <div className="flex gap-2">
                        {activeTab === 'Lab Results' && <button onClick={() => setIsLabOrderModalOpen(true)} className="bg-primary text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-primary-dark">Order Lab Test</button>}
                        {activeTab === 'Radiology' && <button onClick={() => setIsImagingOrderModalOpen(true)} className="bg-primary text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-primary-dark">Order Imaging Test</button>}
                        {activeTab === 'Cardiology' && <button onClick={() => setIsCardiologyOrderModalOpen(true)} className="bg-primary text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-primary-dark">Order Cardiology Test</button>}
                        {activeTab === 'Prescriptions' && (
                             <>
                                <button onClick={() => setIsScribeModalOpen(true)} className="bg-secondary text-primary-dark px-4 py-2 rounded-lg font-semibold text-sm hover:bg-yellow-400">AI Scribe</button>
                                <button onClick={() => setIsPrescriptionModalOpen(true)} className="bg-primary text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-primary-dark">Create Prescription</button>
                            </>
                        )}
                        {activeTab === 'Genomics' && patient.genomicProfile && <button onClick={handleGetGenomicSuggestion} className="bg-primary text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-primary-dark">Get AI Treatment Suggestions</button>}
                    </div>
                )}
          </div>
          <div>{renderContent()}</div>
       </div>

      {/* Modals */}
      <SummaryModal isOpen={isSummaryModalOpen} onClose={() => setIsSummaryModalOpen(false)} content={summaryContent} patientName={patient.name} isLoading={isGeneratingSummary}/>
      <AddMedicalRecordModal isOpen={isRecordModalOpen} onClose={() => setIsRecordModalOpen(false)} onSave={handleSaveMedicalRecord} initialData={initialRecordData}/>
      <RecordVitalsModal isOpen={isVitalsModalOpen} onClose={() => setIsVitalsModalOpen(false)} onSave={handleSaveVitals} />
      <ShareRecordModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} patient={patient} />
      <GhanaCardVerificationModal isOpen={isVerificationModalOpen} onClose={() => setIsVerificationModalOpen(false)} ghanaCardId={patient.ghanaCardId || ''} onVerifySuccess={handleVerificationSuccess} patientName={patient.name} />
      <MealSuggestionModal isOpen={isMealModalOpen} onClose={() => setIsMealModalOpen(false)} patient={patient} content={mealSuggestion} isLoading={isGeneratingMeal} />
      <OrderLabTestModal isOpen={isLabOrderModalOpen} onClose={() => setIsLabOrderModalOpen(false)} onSave={onAddLabOrder} patient={patient} />
      <CreatePrescriptionModal isOpen={isPrescriptionModalOpen} onClose={() => setIsPrescriptionModalOpen(false)} onSave={onAddPrescription} patient={patient} allPrescriptions={patientPrescriptions}/>
      <OrderImagingTestModal isOpen={isImagingOrderModalOpen} onClose={() => setIsImagingOrderModalOpen(false)} onSave={onAddRadiologyOrder} patient={patient} />
      <OrderCardiologyTestModal isOpen={isCardiologyOrderModalOpen} onClose={() => setIsCardiologyOrderModalOpen(false)} onSave={onAddCardiologyOrder} patient={patient} />
       <SummaryModal
          isOpen={isGenomicSuggestionModalOpen}
          onClose={() => setIsGenomicSuggestionModalOpen(false)}
          title="AI Genomic Treatment Suggestions"
          patientName={patient.name}
          content={genomicSuggestion}
          isLoading={isGeneratingGenomicSuggestion}
      />
       <DischargeSummaryModal 
          isOpen={isDischargeModalOpen} 
          onClose={() => setIsDischargeModalOpen(false)} 
          summary={dischargeSummaryContent}
          isLoading={isGeneratingDischargeSummary}
          onSave={handleSaveDischargeSummary}
          patientName={patient.name}
      />
       <AIScribeModal 
            isOpen={isScribeModalOpen}
            onClose={() => setIsScribeModalOpen(false)}
            patient={patient}
            onSaveToRecord={handleSaveFromScribe}
        />
    </div>
  );
};