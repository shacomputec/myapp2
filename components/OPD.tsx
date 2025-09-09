import React, { useState, useMemo } from 'react';
import type { Patient, Appointment } from '../types';

interface OPDProps {
  patients: Patient[];
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

type OPDStatus = 'Waiting for Triage' | 'Waiting for Doctor' | 'In Consultation';

interface OPDVisit extends Appointment {
    opdStatus: OPDStatus;
}


const OPD: React.FC<OPDProps> = ({ patients, onSelectPatient }) => {
    const today = new Date().toISOString().split('T')[0];

    const initialVisits = useMemo(() => {
        return patients.flatMap(p => 
            p.appointments
                .filter(a => a.date === today && a.type === 'In-Person')
                .map((a, index) => ({
                    ...a,
                    // Assign a mock status for demonstration
                    opdStatus: index % 3 === 0 ? 'Waiting for Triage' : (index % 3 === 1 ? 'Waiting for Doctor' : 'In Consultation')
                }))
        ) as OPDVisit[];
    }, [patients, today]);
    
    const [opdVisits, setOpdVisits] = useState<OPDVisit[]>(initialVisits);
    
    const summary = useMemo(() => ({
        waitingTriage: opdVisits.filter(v => v.opdStatus === 'Waiting for Triage').length,
        waitingDoctor: opdVisits.filter(v => v.opdStatus === 'Waiting for Doctor').length,
        inConsultation: opdVisits.filter(v => v.opdStatus === 'In Consultation').length,
        total: opdVisits.length,
    }), [opdVisits]);

    const columns: OPDStatus[] = ['Waiting for Triage', 'Waiting for Doctor', 'In Consultation'];
    
    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold text-dark-text">Outpatient Department (OPD)</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard title="Total OPD Visits Today" value={summary.total.toString()} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857" /></svg>} />
                <StatCard title="Waiting for Triage" value={summary.waitingTriage.toString()} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} />
                <StatCard title="Waiting for Doctor" value={summary.waitingDoctor.toString()} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
                <StatCard title="In Consultation" value={summary.inConsultation.toString()} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1" /></svg>} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {columns.map(status => (
                    <div key={status} className="bg-light-bg rounded-lg p-4">
                        <h3 className="font-bold text-dark-text mb-4 text-center">{status} ({opdVisits.filter(v => v.opdStatus === status).length})</h3>
                        <div className="space-y-3 h-[60vh] overflow-y-auto">
                            {opdVisits.filter(v => v.opdStatus === status).map(visit => {
                                const patient = patients.find(p => p.id === visit.patientId);
                                return (
                                <div key={visit.id} className="bg-white p-4 rounded-lg shadow-sm cursor-pointer" onClick={() => patient && onSelectPatient(patient)}>
                                    <p className="font-semibold text-dark-text">{visit.patientName}</p>
                                    <p className="text-sm text-light-text">Reason: {visit.reason}</p>
                                    <p className="text-xs text-primary font-medium mt-2">With: {visit.doctor}</p>
                                </div>
                            )})}
                        </div>
                    </div>
                ))}
            </div>

        </div>
    );
};

export default OPD;
