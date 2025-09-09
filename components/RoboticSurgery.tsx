

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { MOCK_PATIENTS, MOCK_STAFF_MEMBERS, MOCK_ROBOTS } from '../constants';
import type { RoboticSurgeryProcedure, SurgicalAssistantMessage } from '../types';
import { getRoboticSurgeryGuidance } from '../services/geminiService';

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

const ScheduleRoboticSurgeryModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (surgery: Omit<RoboticSurgeryProcedure, 'id'>) => void;
}> = ({ isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState<Partial<Omit<RoboticSurgeryProcedure, 'id'>>>({});

    if (!isOpen) return null;

    const allSurgeons = MOCK_STAFF_MEMBERS.filter(s => s.role.name === 'Doctor').map(s => s.name);
    const availableRobots = MOCK_ROBOTS.filter(r => r.status === 'Available');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        
        if (name === 'patientId') {
            const patient = MOCK_PATIENTS.find(p => p.id === value);
            setFormData(prev => ({ ...prev, patientId: value, patientName: patient?.name || '' }));
        } else if (name === 'robotId') {
            const robot = MOCK_ROBOTS.find(r => r.id === value);
            setFormData(prev => ({ ...prev, robotId: value, robotName: robot?.name || '' }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const { patientId, procedure, surgeon, robotId, date, time, patientName, robotName } = formData;
        if (!patientId || !procedure || !surgeon || !robotId || !date || !time) {
            alert('Please fill all required fields.');
            return;
        }
        onSave({ patientId, procedure, surgeon, robotId, date, time, patientName, robotName } as Omit<RoboticSurgeryProcedure, 'id'>);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-8 relative dark:bg-slate-800">
                 <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-white"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                <h3 className="text-2xl font-bold text-dark-text mb-4 dark:text-slate-200">Schedule Robotic Surgery</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-light-text mb-1 dark:text-slate-400">Patient</label>
                        <select name="patientId" value={formData.patientId || ''} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200">
                            <option value="">Select a patient</option>
                            {MOCK_PATIENTS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-light-text mb-1 dark:text-slate-400">Procedure</label>
                        <input type="text" name="procedure" value={formData.procedure || ''} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" placeholder="e.g., Robotic Prostatectomy" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-light-text mb-1 dark:text-slate-400">Surgeon</label>
                            <select name="surgeon" value={formData.surgeon || ''} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200">
                                <option value="">Select Surgeon</option>
                                {allSurgeons.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-light-text mb-1 dark:text-slate-400">Surgical Robot</label>
                            <select name="robotId" value={formData.robotId || ''} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200">
                                <option value="">Select Robot</option>
                                {availableRobots.map(r => <option key={r.id} value={r.id}>{r.name} ({r.model})</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-light-text mb-1 dark:text-slate-400">Date</label>
                            <input type="date" name="date" value={formData.date || ''} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-light-text mb-1 dark:text-slate-400">Time</label>
                            <input type="time" name="time" value={formData.time || ''} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" />
                        </div>
                    </div>
                     <div className="mt-6 flex justify-end">
                        <button type="submit" className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark font-semibold">Schedule Procedure</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const RoboticSurgeryConsole: React.FC<{ procedure: RoboticSurgeryProcedure; onClose: () => void; }> = ({ procedure, onClose }) => {
    const [messages, setMessages] = useState<SurgicalAssistantMessage[]>([
        { sender: 'ai', text: `AI Assistant initialized for ${procedure.procedure}. How can I help, Dr. ${procedure.surgeon.split(' ').pop()}?` }
    ]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const imageRef = useRef<HTMLImageElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const imageUrlToBase64 = useCallback(async (url: string): Promise<string> => {
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
                    resolve((reader.result as string).split(',')[1]);
                } else {
                    reject(new Error("FileReader failed to read blob."));
                }
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }, []);

    const handleSendMessage = async () => {
        if (!userInput.trim() || isLoading) return;

        const newMessages: SurgicalAssistantMessage[] = [...messages, { sender: 'user', text: userInput }];
        setMessages(newMessages);
        const currentInput = userInput;
        setUserInput('');
        setIsLoading(true);

        try {
            if (!imageRef.current) throw new Error("Surgical image is not available.");
            
            const newImageUrl = `https://picsum.photos/seed/${Math.random()}/1024/768`;
            // First, update the image displayed
            imageRef.current.src = newImageUrl;

            // Then, fetch it and convert to base64 for the API
            const base64Image = await imageUrlToBase64(newImageUrl);
            const aiResponse = await getRoboticSurgeryGuidance(base64Image, currentInput);
            setMessages(prev => [...prev, { sender: 'ai', text: aiResponse }]);

        } catch (error) {
            console.error(error);
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            setMessages(prev => [...prev, { sender: 'ai', text: `Sorry, I encountered an error. Please try again. Details: ${errorMessage}` }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-gray-900 text-gray-200 p-6 rounded-xl shadow-2xl border border-gray-700 h-full flex flex-col -m-8">
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-700 flex-shrink-0">
                <div>
                    <h3 className="text-2xl font-bold text-cyan-400">{procedure.procedure}</h3>
                    <p className="text-sm text-gray-400">Patient: {procedure.patientName} | Surgeon: {procedure.surgeon}</p>
                </div>
                <button onClick={onClose} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                    &larr; Exit Console
                </button>
            </div>
            <div className="flex-grow flex gap-6 overflow-hidden">
                <div className="flex-[3] bg-black rounded-lg flex items-center justify-center relative overflow-hidden">
                    <img ref={imageRef} src={`https://picsum.photos/seed/${procedure.id}/1024/768`} alt="Surgical View" className="w-full h-full object-cover"/>
                    <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-md animate-pulse">● REC</div>
                    <div className="absolute bottom-2 left-2 bg-black/50 p-2 rounded-md text-xs"><p>Vitals: HR 72, BP 120/80, SpO2 99%</p><p>Robot: {procedure.robotName} | Status: Nominal</p></div>
                </div>
                <div className="flex-[1] bg-gray-800 rounded-lg p-4 flex flex-col border border-gray-700">
                    <h4 className="text-lg font-semibold text-cyan-400 mb-2 border-b border-gray-600 pb-2 flex-shrink-0">AI Assistant</h4>
                    <div className="flex-grow overflow-y-auto mb-4 pr-2 space-y-4">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-xs lg:max-w-sm px-4 py-2 rounded-lg ${msg.sender === 'user' ? 'bg-cyan-600' : 'bg-gray-700'}`}>
                                    <p className="text-sm">{msg.text}</p>
                                </div>
                            </div>
                        ))}
                        {isLoading && (<div className="flex justify-start"><div className="max-w-xs lg:max-w-sm px-4 py-2 rounded-lg bg-gray-700"><p className="text-sm animate-pulse">Analyzing...</p></div></div>)}
                        <div ref={messagesEndRef} />
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                        <input type="text" value={userInput} onChange={(e) => setUserInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="Ask for guidance..." className="flex-grow bg-gray-700 text-white placeholder-gray-400 p-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"/>
                        <button onClick={handleSendMessage} disabled={isLoading || !userInput.trim()} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed">Send</button>
                    </div>
                </div>
            </div>
        </div>
    );
};


interface RoboticSurgeryProps {
    roboticSurgeries: RoboticSurgeryProcedure[];
    onAddRoboticSurgery: (surgeryData: Omit<RoboticSurgeryProcedure, 'id'>) => void;
}

const RoboticSurgery: React.FC<RoboticSurgeryProps> = ({ roboticSurgeries, onAddRoboticSurgery }) => {
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
    const [view, setView] = useState<'list' | 'console'>('list');
    const [selectedProcedure, setSelectedProcedure] = useState<RoboticSurgeryProcedure | null>(null);

    const summary = useMemo(() => {
        const today = new Date().toISOString().split('T')[0];
        return {
            total: roboticSurgeries.length,
            today: roboticSurgeries.filter(s => s.date === today).length,
            availableRobots: MOCK_ROBOTS.filter(r => r.status === 'Available').length
        };
    }, [roboticSurgeries]);

    const handleLaunchConsole = (procedure: RoboticSurgeryProcedure) => {
        setSelectedProcedure(procedure);
        setView('console');
    };
    
    const handleExitConsole = () => {
        setSelectedProcedure(null);
        setView('list');
    };

    if (view === 'console' && selectedProcedure) {
        return <RoboticSurgeryConsole procedure={selectedProcedure} onClose={handleExitConsole} />;
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-dark-text dark:text-slate-200">Robotic Surgery Management</h2>
                <button onClick={() => setIsScheduleModalOpen(true)} className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors font-semibold flex items-center">
                    Schedule Procedure
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Total Procedures" value={summary.total.toString()} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>} />
                <StatCard title="Procedures Today" value={summary.today.toString()} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} />
                <StatCard title="Available Robots" value={summary.availableRobots.toString()} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>} />
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md dark:bg-slate-800 dark:border dark:border-slate-700">
                <h3 className="text-xl font-semibold text-dark-text mb-4 dark:text-slate-200">Scheduled Procedures</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-light-bg dark:bg-slate-700">
                            <tr>
                                <th className="p-3 font-semibold text-light-text dark:text-slate-300">Patient</th>
                                <th className="p-3 font-semibold text-light-text dark:text-slate-300">Procedure</th>
                                <th className="p-3 font-semibold text-light-text dark:text-slate-300">Surgeon</th>
                                <th className="p-3 font-semibold text-light-text dark:text-slate-300">Robot</th>
                                <th className="p-3 font-semibold text-light-text dark:text-slate-300">Date & Time</th>
                                <th className="p-3 font-semibold text-light-text dark:text-slate-300 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="dark:text-slate-400">
                            {roboticSurgeries.map((surgery) => (
                                <tr key={surgery.id} className="border-b dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50">
                                    <td className="p-3 font-medium text-dark-text dark:text-slate-200">{surgery.patientName}</td>
                                    <td className="p-3">{surgery.procedure}</td>
                                    <td className="p-3">{surgery.surgeon}</td>
                                    <td className="p-3">{surgery.robotName}</td>
                                    <td className="p-3">{surgery.date} @ {surgery.time}</td>
                                     <td className="p-3 text-center">
                                        <button onClick={() => handleLaunchConsole(surgery)} className="bg-cyan-600 text-white px-3 py-1 rounded-lg hover:bg-cyan-700 text-sm font-semibold">
                                            Launch Console
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <ScheduleRoboticSurgeryModal isOpen={isScheduleModalOpen} onClose={() => setIsScheduleModalOpen(false)} onSave={onAddRoboticSurgery} />
        </div>
    );
};

export default RoboticSurgery;