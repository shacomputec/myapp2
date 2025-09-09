

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { MOCK_PATIENTS } from '../constants';
import type { Patient, Appointment, SOAPNote, MedicalRecord } from '../types';
import AIScribeModal from './AIScribeModal';
import { useAuth } from '../services/auth';

interface TelemedicineProps {
  onSelectPatient: (patient: Patient) => void;
  patients: Patient[];
  onUpdatePatient: (patient: Patient) => void;
}

interface VideoCallModalProps {
    patient: Patient | null;
    onClose: () => void;
    onUpdatePatient: (patient: Patient) => void;
}

const VideoCallModal: React.FC<VideoCallModalProps> = ({ patient, onClose, onUpdatePatient }) => {
    const doctorVideoRef = useRef<HTMLVideoElement>(null);
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);
    const [isScribeModalOpen, setIsScribeModalOpen] = useState(false);
    const { hasPermission } = useAuth();

    useEffect(() => {
        let stream: MediaStream | null = null;
        const enableStream = async () => {
            try {
                // Requesting both video and audio
                stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                if (doctorVideoRef.current) {
                    doctorVideoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.error("Error accessing camera/mic: ", err);
                // In a real app, you'd show a user-friendly error message here
            }
        };

        if (patient) {
            enableStream();
        }

        return () => {
            // Cleanup: stop all tracks on the stream when the modal is closed
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [patient]);
    
    // Effect to toggle video/audio tracks on/off based on state
    useEffect(() => {
        if (doctorVideoRef.current && doctorVideoRef.current.srcObject) {
            const stream = doctorVideoRef.current.srcObject as MediaStream;
            stream.getVideoTracks().forEach(track => track.enabled = isVideoEnabled);
            stream.getAudioTracks().forEach(track => track.enabled = isAudioEnabled);
        }
    }, [isVideoEnabled, isAudioEnabled]);

    const handleSaveFromScribe = useCallback((note: SOAPNote) => {
        if (!patient) return;
        const treatmentText = `Subjective: ${note.subjective}\n\nObjective: ${note.objective}\n\nPlan: ${note.plan}`;
        const newRecord: MedicalRecord = {
            date: new Date().toISOString().split('T')[0],
            doctor: 'Dr. Evelyn Adjei', // Assuming logged in user
            diagnosis: note.assessment,
            treatment: `(Telemedicine Consultation) ${treatmentText}`
        };

        const updatedPatient = {
            ...patient,
            medicalHistory: [newRecord, ...patient.medicalHistory],
        };
        onUpdatePatient(updatedPatient);
        setIsScribeModalOpen(false);
        onClose(); // Close the main call modal after saving
    }, [patient, onUpdatePatient, onClose]);


    if (!patient) return null;

    return (
        <>
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl p-6 relative animate-fade-in-up flex flex-col h-[90vh] dark:bg-slate-800">
                <div className="flex justify-between items-start">
                     <h3 className="text-xl font-bold text-dark-text mb-4 dark:text-slate-200">Virtual Consultation with {patient.name}</h3>
                     <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                
                <div className="relative bg-gray-900 rounded-lg flex-grow flex items-center justify-center text-white overflow-hidden">
                    {/* Patient Video Feed Simulation */}
                    <img src={patient.avatarUrl.replace('/100/100', '/800/600')} alt={patient.name} className="w-full h-full object-cover blur-sm" />
                     <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col items-center justify-center">
                        <svg className="animate-spin h-8 w-8 text-white mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                         <p className="font-semibold">{patient.name} is connecting...</p>
                    </div>

                    {/* Doctor's View (Live) */}
                    <div className="absolute bottom-4 right-4 w-48 h-36 bg-black rounded-md border-2 border-gray-600 overflow-hidden shadow-lg">
                         <video ref={doctorVideoRef} autoPlay playsInline muted className="w-full h-full object-cover"></video>
                         {!isVideoEnabled && (
                            <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center">
                                 <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                            </div>
                         )}
                    </div>
                </div>

                <div className="flex-shrink-0 flex justify-center items-center space-x-4 mt-4 pt-4 border-t dark:border-slate-700">
                    <button onClick={() => setIsAudioEnabled(prev => !prev)} className={`p-3 rounded-full transition-colors ${isAudioEnabled ? 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-slate-600 dark:text-slate-200' : 'bg-accent text-white'}`}>
                        {isAudioEnabled ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
                        )}
                    </button>
                    <button onClick={() => setIsVideoEnabled(prev => !prev)} className={`p-3 rounded-full transition-colors ${isVideoEnabled ? 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-slate-600 dark:text-slate-200' : 'bg-accent text-white'}`}>
                        {isVideoEnabled ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                        ) : (
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                        )}
                    </button>
                     {hasPermission('admin:ai_assistant') && (
                        <button onClick={() => setIsScribeModalOpen(true)} className="p-3 rounded-full transition-colors bg-secondary text-primary-dark hover:bg-yellow-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2-2H4a2 2 0 01-2-2v-4z" />
                            </svg>
                        </button>
                     )}
                    <button onClick={onClose} className="px-8 py-3 bg-accent text-white rounded-full font-semibold hover:bg-red-700 flex items-center space-x-2">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 5h.01M5 12h.01M5 19h.01M12 5h.01M12 12h.01M12 19h.01M19 5h.01M19 12h.01M19 19h.01" /></svg>
                         <span>End Call</span>
                    </button>
                </div>
            </div>
        </div>
        {isScribeModalOpen && (
            <AIScribeModal
                isOpen={isScribeModalOpen}
                onClose={() => setIsScribeModalOpen(false)}
                patient={patient}
                onSaveToRecord={handleSaveFromScribe}
            />
        )}
        </>
    );
};


const Telemedicine: React.FC<TelemedicineProps> = ({ onSelectPatient, patients, onUpdatePatient }) => {
    const [isCallModalOpen, setIsCallModalOpen] = useState(false);
    const [callingPatient, setCallingPatient] = useState<Patient | null>(null);

    const virtualAppointments = useMemo(() => {
        const allAppointments: { patient: Patient, appointment: Appointment }[] = [];
        MOCK_PATIENTS.forEach(patient => {
            patient.appointments
                .filter(app => app.type === 'Virtual')
                .forEach(appointment => {
                    allAppointments.push({ patient, appointment });
                });
        });
        return allAppointments.sort((a, b) => new Date(a.appointment.date).getTime() - new Date(b.appointment.date).getTime());
    }, []);

    const upcomingAppointments = virtualAppointments.filter(
        item => item.appointment.status === 'Scheduled'
    );

    const pastAppointments = virtualAppointments.filter(
        item => item.appointment.status !== 'Scheduled'
    );

    const handleStartCall = (patient: Patient) => {
        setCallingPatient(patient);
        setIsCallModalOpen(true);
    };

    const handleEndCall = () => {
        setIsCallModalOpen(false);
        setCallingPatient(null);
    };

    const AppointmentCard: React.FC<{item: {patient: Patient, appointment: Appointment}}> = ({ item }) => (
        <div className="bg-white p-4 rounded-xl shadow-md flex items-center justify-between dark:bg-slate-800 dark:border dark:border-slate-700">
            <div className="flex items-center">
                <img src={item.patient.avatarUrl} alt={item.patient.name} className="w-12 h-12 rounded-full mr-4" />
                <div>
                    <p className="font-bold text-dark-text dark:text-slate-200">{item.patient.name}</p>
                    <p className="text-sm text-light-text dark:text-slate-400">{item.appointment.date} at {item.appointment.time}</p>
                    <p className="text-sm text-light-text dark:text-slate-400">Reason: {item.appointment.reason}</p>
                </div>
            </div>
            <div className="flex items-center space-x-2">
                 <button onClick={() => onSelectPatient(item.patient)} className="text-primary hover:underline text-sm font-medium">
                    View Record
                </button>
                {item.appointment.status === 'Scheduled' && (
                    <button onClick={() => handleStartCall(item.patient)} className="bg-success text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-semibold">
                        Start Call
                    </button>
                )}
            </div>
        </div>
    );

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold text-dark-text dark:text-slate-200">Telemedicine Portal</h2>
            
            {/* Upcoming Appointments */}
            <div>
                <h3 className="text-xl font-semibold text-dark-text mb-4 dark:text-slate-200">Upcoming Virtual Appointments</h3>
                <div className="space-y-4">
                    {upcomingAppointments.length > 0 ? (
                        upcomingAppointments.map(item => <AppointmentCard key={item.appointment.id} item={item} />)
                    ) : (
                        <p className="text-light-text p-4 bg-white rounded-lg shadow-sm dark:text-slate-400 dark:bg-slate-800">No upcoming virtual appointments.</p>
                    )}
                </div>
            </div>

            {/* Past Consultations */}
            <div>
                <h3 className="text-xl font-semibold text-dark-text mb-4 dark:text-slate-200">Past Consultations</h3>
                <div className="space-y-4">
                     {pastAppointments.length > 0 ? (
                        pastAppointments.map(item => <AppointmentCard key={item.appointment.id} item={item} />)
                     ) : (
                        <p className="text-light-text p-4 bg-white rounded-lg shadow-sm dark:text-slate-400 dark:bg-slate-800">No past virtual consultations found.</p>
                     )}
                </div>
            </div>

            <VideoCallModal patient={callingPatient} onClose={handleEndCall} onUpdatePatient={onUpdatePatient} />
        </div>
    );
};

export default Telemedicine;