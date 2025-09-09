import React, { useState, useEffect } from 'react';
import type { Patient, ICUBed } from '../types';

interface ICUProps {
  icuBeds: ICUBed[];
  setIcuBeds: React.Dispatch<React.SetStateAction<ICUBed[]>>;
  onSelectPatient: (patient: Patient) => void;
}

const VitalSign: React.FC<{ label: string; value: string | number; unit: string; colorClass: string }> = ({ label, value, unit, colorClass }) => (
    <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className={`text-2xl font-bold ${colorClass}`}>
            {value} <span className="text-sm font-light">{unit}</span>
        </p>
    </div>
);

const ICUBedCard: React.FC<{ bed: ICUBed }> = ({ bed }) => {
    const [vitals, setVitals] = useState(bed.vitals);

    useEffect(() => {
        if (bed.status !== 'Occupied') return;
        
        const interval = setInterval(() => {
            setVitals(prev => {
                if (!prev) return null;
                return {
                    heartRate: prev.heartRate + Math.floor(Math.random() * 3) - 1,
                    spO2: Math.min(100, prev.spO2 + Math.floor(Math.random() * 3) - 1),
                    respiratoryRate: prev.respiratoryRate + Math.floor(Math.random() * 3) - 1,
                    bloodPressure: `${130 + Math.floor(Math.random() * 11) - 5}/${85 + Math.floor(Math.random() * 7) - 3}`,
                };
            });
        }, 2000);

        return () => clearInterval(interval);
    }, [bed.status]);

    const statusStyles = {
        Occupied: 'border-red-500 bg-red-50',
        Available: 'border-green-500 bg-green-50',
        Cleaning: 'border-yellow-500 bg-yellow-50',
    };

    return (
        <div className={`p-4 rounded-xl shadow-md border-l-4 ${statusStyles[bed.status]}`}>
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-dark-text">{bed.id}</h3>
                <span className="text-xs font-semibold px-2 py-1 rounded-full bg-white">{bed.status}</span>
            </div>
            {bed.status === 'Occupied' && vitals ? (
                <div className="mt-4">
                    <p className="font-semibold text-primary">{bed.patientName}</p>
                    <div className="mt-4 p-4 bg-gray-800 text-white rounded-lg space-y-2">
                        <VitalSign label="HR" value={vitals.heartRate} unit="bpm" colorClass="text-green-400" />
                        <VitalSign label="SpO2" value={vitals.spO2} unit="%" colorClass="text-blue-400" />
                        <VitalSign label="BP" value={vitals.bloodPressure} unit="mmHg" colorClass="text-yellow-400" />
                        <VitalSign label="RR" value={vitals.respiratoryRate} unit="/min" colorClass="text-purple-400" />
                    </div>
                </div>
            ) : (
                <div className="mt-4 flex items-center justify-center h-48">
                    <p className="text-light-text">{bed.status === 'Available' ? 'Ready for Admission' : 'Bed is being prepared'}</p>
                </div>
            )}
        </div>
    );
};


const ICU: React.FC<ICUProps> = ({ icuBeds, setIcuBeds, onSelectPatient }) => {
    return (
        <div className="space-y-8">
             <h2 className="text-3xl font-bold text-dark-text">Intensive Care Unit (ICU)</h2>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {icuBeds.map(bed => (
                    <ICUBedCard key={bed.id} bed={bed} />
                ))}
             </div>
        </div>
    );
};

export default ICU;
