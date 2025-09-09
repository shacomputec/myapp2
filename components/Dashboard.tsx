

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { Patient, LabOrder, StaffMember, Appointment } from '../types';
import { useLanguage } from '../services/localization';
import { useAuth } from '../services/auth';
import { useTheme } from '../services/theme';
import { getAppointmentBriefing } from '../services/geminiService';
import SummaryModal from './SummaryModal';

interface CardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}

const StatCard: React.FC<CardProps> = ({ title, value, icon, color }) => (
  <div className="bg-white p-6 rounded-xl shadow-md flex items-center justify-between dark:bg-slate-800 dark:border dark:border-slate-700">
    <div>
      <p className="text-sm font-medium text-light-text dark:text-slate-400">{title}</p>
      <p className="text-3xl font-bold text-dark-text dark:text-slate-200">{value}</p>
    </div>
    <div className={`text-white p-3 rounded-full ${color}`}>
      {icon}
    </div>
  </div>
);

interface DashboardProps {
    onSelectPatient: (patient: Patient) => void;
    patients: Patient[];
    labOrders: LabOrder[];
}

const AdminDashboard: React.FC<{ onSelectPatient: (patient: Patient) => void; patients: Patient[]; }> = ({ onSelectPatient, patients }) => {
  const recentPatients = patients.slice(0, 3);
  const { t } = useLanguage();
  const { theme } = useTheme();
  
  const initialChartData = useMemo(() => [
    { name: 'Mon', admissions: 4, discharges: 2 },
    { name: 'Tue', admissions: 3, discharges: 1 },
    { name: 'Wed', admissions: 5, discharges: 3 },
    { name: 'Thu', admissions: 2, discharges: 4 },
    { name: 'Fri', admissions: 6, discharges: 2 },
    { name: 'Sat', admissions: 8, discharges: 5 },
    { name: 'Sun', admissions: 7, discharges: 6 },
  ], []);

  const [chartData, setChartData] = useState(initialChartData);

  useEffect(() => {
    const interval = setInterval(() => {
      setChartData(prevData => {
        const newData = [...prevData];
        // Day index: Sun=0, Mon=1, ..., Sat=6. We'll map this to Mon=0 index for our array.
        const dayIndex = (new Date().getDay() + 6) % 7; 
        
        // Simulate new data for the current day
        newData[dayIndex] = {
          ...newData[dayIndex],
          admissions: newData[dayIndex].admissions + (Math.random() > 0.7 ? 1 : 0), // Occasionally add a new admission
          discharges: newData[dayIndex].discharges + (Math.random() > 0.85 ? 1 : 0), // Less frequently add a new discharge
        };
        return newData;
      });
    }, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-dark-text dark:text-slate-200">{t('dashboard.welcome')}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title={t('dashboard.totalPatients')} value="2,453" color="bg-primary" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>} />
        <StatCard title={t('dashboard.appointmentsToday')} value="32" color="bg-success" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} />
        <StatCard title={t('dashboard.surgeriesScheduled')} value="4" color="bg-accent" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>} />
        <StatCard title={t('dashboard.bedsAvailable')} value="18" color="bg-secondary" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md dark:bg-slate-800 dark:border dark:border-slate-700">
            <h3 className="text-lg font-semibold text-dark-text mb-4 dark:text-slate-200">Weekly Activity (Live)</h3>
            <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#475569' : '#e5e7eb'} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: theme === 'dark' ? '#94a3b8' : '#6b7280' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: theme === 'dark' ? '#94a3b8' : '#6b7280' }} allowDecimals={false} />
                        <Tooltip 
                            cursor={{fill: theme === 'dark' ? 'rgba(71, 85, 105, 0.5)' : 'rgba(229, 231, 235, 0.5)'}}
                            contentStyle={{ 
                                backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff', 
                                border: `1px solid ${theme === 'dark' ? '#334155' : '#e5e7eb'}` 
                            }} 
                        />
                        <Legend wrapperStyle={{ color: theme === 'dark' ? '#94a3b8' : '#374151' }} />
                        <Bar dataKey="admissions" fill="#0055A4" name="Admissions" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="discharges" fill="#008751" name="Discharges" radius={[4, 4, 0, 0]}/>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md dark:bg-slate-800 dark:border dark:border-slate-700">
            <h3 className="text-lg font-semibold text-dark-text mb-4 dark:text-slate-200">Recent Patients</h3>
            <div className="space-y-4">
                {recentPatients.map(patient => (
                    <div key={patient.id} onClick={() => onSelectPatient(patient)} className="flex items-center p-2 rounded-lg hover:bg-light-bg cursor-pointer dark:hover:bg-slate-700">
                        <img src={patient.avatarUrl} alt={patient.name} className="w-12 h-12 rounded-full mr-4" />
                        <div>
                            <p className="font-semibold text-dark-text dark:text-slate-200">{patient.name}</p>
                            <p className="text-sm text-light-text dark:text-slate-400">Last visit: {patient.lastVisit}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

interface DoctorDashboardProps {
    currentUser: StaffMember;
    patients: Patient[];
    labOrders: LabOrder[];
    onSelectPatient: (patient: Patient) => void;
}

const DoctorDashboard: React.FC<DoctorDashboardProps> = ({ currentUser, patients, labOrders, onSelectPatient }) => {
    
    const { myTodaysAppointments, criticalResults, myPatientIds } = useMemo(() => {
        const today = new Date().toISOString().split('T')[0];
        const allAppointments = patients.flatMap(p => p.appointments);

        const myTodaysAppointments = allAppointments.filter(
            (app): app is Appointment & { patient: Patient } => {
                const patient = patients.find(p => p.id === app.patientId);
                return !!patient && app.doctor === currentUser.name && app.date === today && app.status === 'Scheduled';
            }
        ).map(app => ({ ...app, patient: patients.find(p => p.id === app.patientId)! }));


        const myPatientIds = new Set(allAppointments.filter(app => app.doctor === currentUser.name).map(app => app.patientId));
        
        const criticalResults = labOrders.filter(
            order => myPatientIds.has(order.patientId) && order.isCritical && order.status === 'Completed'
        );

        return { myTodaysAppointments, criticalResults, myPatientIds };
    }, [currentUser, patients, labOrders]);

    const [briefingModalOpen, setBriefingModalOpen] = useState(false);
    const [briefingContent, setBriefingContent] = useState('');
    const [isGeneratingBriefing, setIsGeneratingBriefing] = useState(false);
    const [briefingPatientName, setBriefingPatientName] = useState('');

    const handleGenerateBriefing = useCallback(async (appointment: Appointment) => {
        const patient = patients.find(p => p.id === appointment.patientId);
        if (!patient) return;

        setBriefingPatientName(patient.name);
        setIsGeneratingBriefing(true);
        setBriefingContent('');
        setBriefingModalOpen(true);

        const patientHistory = `
            - Age: ${patient.age}, Gender: ${patient.gender}
            - Allergies: ${patient.allergies.join(', ') || 'None'}
            - Key Medical History: ${patient.medicalHistory.slice(0, 3).map(h => `${h.date}: ${h.diagnosis}`).join('; ')}
        `;

        try {
            const result = await getAppointmentBriefing(patientHistory, appointment.reason);
            setBriefingContent(result);
        } catch (error) {
            console.error(error);
            setBriefingContent("Could not generate briefing at this time.");
        } finally {
            setIsGeneratingBriefing(false);
        }
    }, [patients]);


    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold text-dark-text dark:text-slate-200">Welcome back, {currentUser.name}!</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Appointments Today" value={myTodaysAppointments.length.toString()} color="bg-primary" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} />
                <StatCard title="Critical Lab Results" value={criticalResults.length.toString()} color="bg-accent" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>} />
                 <StatCard title="Total Patients" value={myPatientIds.size.toString()} color="bg-success" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>} />
            </div>
            
            {/* My Tasks Section */}
            <div className="bg-white p-6 rounded-xl shadow-md dark:bg-slate-800 dark:border dark:border-slate-700">
                <h3 className="text-xl font-bold text-dark-text mb-4 dark:text-slate-200">My Tasks for Today</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Today's Appointments */}
                    <div>
                        <h4 className="text-lg font-semibold text-dark-text mb-4 dark:text-slate-200 flex items-center">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                             Today's Appointments ({myTodaysAppointments.length})
                        </h4>
                        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                             {myTodaysAppointments.length > 0 ? myTodaysAppointments.map(app => (
                                <div key={app.id} className="flex items-center justify-between p-3 rounded-lg bg-light-bg dark:bg-slate-700/50 hover:shadow-md transition-shadow">
                                    <div className="flex items-center cursor-pointer" onClick={() => onSelectPatient(app.patient)}>
                                        <img src={app.patient.avatarUrl} alt={app.patientName} className="w-10 h-10 rounded-full mr-3" />
                                        <div>
                                            <p className="font-semibold text-sm text-dark-text dark:text-slate-200">{app.patientName}</p>
                                            <p className="text-xs text-light-text dark:text-slate-400">{app.reason}</p>
                                        </div>
                                    </div>
                                    <div className="text-right flex items-center gap-2">
                                        <div>
                                            <p className="font-semibold text-sm text-primary">{app.time}</p>
                                            <p className={`text-xs font-medium rounded-full px-2 py-0.5 mt-1 ${app.type === 'Virtual' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'}`}>{app.type}</p>
                                        </div>
                                        <button
                                            onClick={() => handleGenerateBriefing(app)}
                                            className="bg-secondary text-primary-dark p-2 rounded-lg hover:bg-yellow-400 transition-colors ml-2"
                                            title="Generate AI Briefing"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-light-text dark:text-slate-400 text-center py-8">No appointments scheduled for today.</p>
                            )}
                        </div>
                    </div>
                    {/* Critical Lab Results */}
                    <div>
                         <h4 className="text-lg font-semibold text-dark-text mb-4 dark:text-slate-200 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                             Critical Lab Results ({criticalResults.length})
                        </h4>
                        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                            {criticalResults.length > 0 ? criticalResults.map(order => (
                                <div key={order.id} onClick={() => onSelectPatient(patients.find(p => p.id === order.patientId)!)} className="p-3 rounded-lg bg-red-50 border border-red-200 cursor-pointer hover:bg-red-100 dark:bg-red-900/20 dark:border-red-500/30 dark:hover:bg-red-900/40">
                                    <p className="font-semibold text-accent">{order.testName} Result</p>
                                    <p className="text-sm text-dark-text dark:text-slate-300">For: {order.patientName}</p>
                                    <p className="text-xs text-light-text dark:text-slate-400">Date: {order.orderDate}</p>
                                </div>
                            )) : (
                                <p className="text-light-text dark:text-slate-400 text-center py-8">No critical results requiring attention.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <SummaryModal
                isOpen={briefingModalOpen}
                onClose={() => setBriefingModalOpen(false)}
                content={briefingContent}
                patientName={briefingPatientName}
                title={`AI Briefing for ${briefingPatientName}`}
                isLoading={isGeneratingBriefing}
            />
        </div>
    );
};

const Dashboard: React.FC<DashboardProps> = ({ onSelectPatient, patients, labOrders }) => {
  const { currentUser } = useAuth();
  
  if (currentUser?.role.name === 'Doctor') {
      return <DoctorDashboard currentUser={currentUser} patients={patients} labOrders={labOrders} onSelectPatient={onSelectPatient} />;
  }

  // Fallback to the general/admin dashboard for other roles
  return <AdminDashboard onSelectPatient={onSelectPatient} patients={patients} />;
};

export default Dashboard;
