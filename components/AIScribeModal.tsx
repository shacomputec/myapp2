import React, { useState, useEffect } from 'react';
import type { Patient, SOAPNote } from '../types';
import { generateClinicalNotesFromTranscript } from '../services/geminiService';

// @ts-ignore
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;

if (recognition) {
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
}

interface AIScribeModalProps {
    isOpen: boolean;
    onClose: () => void;
    patient: Patient;
    onSaveToRecord: (note: SOAPNote) => void;
}

const AIScribeModal: React.FC<AIScribeModalProps> = ({ isOpen, onClose, patient, onSaveToRecord }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [finalTranscript, setFinalTranscript] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedNote, setGeneratedNote] = useState<SOAPNote | null>(null);

    useEffect(() => {
        if (!isOpen || !recognition) return;

        recognition.onresult = (event: any) => {
            let interimTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    setFinalTranscript(prev => prev + event.results[i][0].transcript);
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }
            setTranscript(finalTranscript + interimTranscript);
        };
        
        recognition.onerror = (event: any) => {
            console.error('Speech recognition error', event.error);
        };
        
        return () => {
             if (recognition) recognition.stop();
        }

    }, [isOpen, finalTranscript]);

    const handleToggleRecording = () => {
        if (isRecording) {
            recognition?.stop();
            setIsRecording(false);
        } else {
            setTranscript('');
            setFinalTranscript('');
            setGeneratedNote(null);
            recognition?.start();
            setIsRecording(true);
        }
    };
    
    const handleGenerateNote = async () => {
        if(!finalTranscript) return;
        setIsGenerating(true);
        try {
            const note = await generateClinicalNotesFromTranscript(finalTranscript);
            setGeneratedNote(note);
        } catch (e) {
            console.error(e);
            alert("Failed to generate notes from transcript.");
        } finally {
            setIsGenerating(false);
        }
    };
    
    const handleSave = () => {
        if (generatedNote) {
            onSaveToRecord(generatedNote);
        }
    };
    
    const handleClose = () => {
        if (isRecording) {
            recognition?.stop();
        }
        setIsRecording(false);
        setTranscript('');
        setFinalTranscript('');
        setGeneratedNote(null);
        onClose();
    };


    if (!isOpen) return null;

    if (!recognition) {
        return (
             <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex justify-center items-center p-4">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-8 relative dark:bg-slate-800">
                     <h3 className="text-xl font-bold text-dark-text mb-4 dark:text-slate-200">Browser Not Supported</h3>
                    <p className="text-light-text dark:text-slate-400">The AI Scribe feature requires a browser that supports the Web Speech API, such as Google Chrome.</p>
                    <div className="mt-4 flex justify-end">
                        <button onClick={onClose} className="bg-primary text-white px-4 py-2 rounded-lg">Close</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex justify-center items-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl p-8 relative max-h-[90vh] flex flex-col dark:bg-slate-800">
                 <button type="button" onClick={handleClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <h3 className="text-2xl font-bold text-dark-text mb-4 dark:text-slate-200">AI Scribe for {patient.name}</h3>

                <div className="flex-grow overflow-y-auto pr-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Transcript Section */}
                    <div className="flex flex-col">
                        <h4 className="font-semibold text-dark-text mb-2 dark:text-slate-200">Live Transcript</h4>
                        <div className="w-full p-3 h-full bg-light-bg border border-gray-200 rounded-lg overflow-y-auto text-sm text-dark-text dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300">
                             {transcript || <span className="text-light-text italic">Recording will appear here...</span>}
                        </div>
                    </div>
                    {/* SOAP Note Section */}
                     <div className="flex flex-col">
                        <h4 className="font-semibold text-dark-text mb-2 dark:text-slate-200">Generated SOAP Note</h4>
                        <div className="w-full p-3 h-full bg-light-bg border border-gray-200 rounded-lg overflow-y-auto text-sm text-dark-text dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300">
                            {isGenerating ? <p>Generating note...</p> : generatedNote ? (
                                <div className="space-y-2">
                                    <p><strong>Subjective:</strong> {generatedNote.subjective}</p>
                                    <p><strong>Objective:</strong> {generatedNote.objective}</p>
                                    <p><strong>Assessment:</strong> {generatedNote.assessment}</p>
                                    <p><strong>Plan:</strong> {generatedNote.plan}</p>
                                </div>
                            ) : <p className="text-light-text italic">Generated notes will appear here...</p>}
                        </div>
                    </div>
                </div>

                <div className="border-t pt-4 mt-4 flex justify-between items-center dark:border-slate-700">
                    <button onClick={handleToggleRecording} className={`px-4 py-2 rounded-lg font-semibold flex items-center ${isRecording ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-dark-text dark:bg-slate-600 dark:text-slate-200'}`}>
                         <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-2 ${isRecording ? 'animate-pulse' : ''}`} fill="currentColor" viewBox="0 0 16 16">
                            <path d={isRecording ? "M5 3.5h6A1.5 1.5 0 0 1 12.5 5v6a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 11V5A1.5 1.5 0 0 1 5 3.5z" : "M8 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm0 1A5 5 0 1 1 8 3a5 5 0 0 1 0 10z"}/>
                        </svg>
                        {isRecording ? 'Stop Recording' : 'Start Recording'}
                    </button>
                    <div className="space-x-2">
                        <button onClick={handleGenerateNote} disabled={isRecording || isGenerating || !finalTranscript} className="bg-secondary text-primary-dark px-4 py-2 rounded-lg hover:bg-yellow-400 font-semibold disabled:bg-gray-300 dark:disabled:bg-slate-600">
                            {isGenerating ? 'Generating...' : 'Generate Note'}
                        </button>
                        <button onClick={handleSave} disabled={!generatedNote} className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark font-semibold disabled:bg-gray-400 dark:disabled:bg-slate-600">
                            Save to Record
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIScribeModal;
