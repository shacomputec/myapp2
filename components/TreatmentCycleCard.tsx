import React from 'react';
import type { TreatmentCycle } from '../types';

const TreatmentCycleCard: React.FC<{ cycle: TreatmentCycle }> = ({ cycle }) => {
    const statusColors = {
        'Completed': 'bg-green-100 text-green-800',
        'In Progress': 'bg-blue-100 text-blue-800',
        'Scheduled': 'bg-yellow-100 text-yellow-800',
        'On Hold': 'bg-gray-100 text-gray-800',
    };
    return (
        <div className="bg-light-bg p-4 rounded-lg">
            <div className="flex justify-between items-start">
                <div>
                    <p className="font-bold text-dark-text">{cycle.type}</p>
                    <p className="text-sm text-light-text">{cycle.startDate} to {cycle.endDate}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[cycle.status]}`}>{cycle.status}</span>
            </div>
            {cycle.drugsAdministered && cycle.drugsAdministered.length > 0 && (
                <p className="text-sm mt-2"><span className="font-semibold">Drugs:</span> {cycle.drugsAdministered.join(', ')}</p>
            )}
            {cycle.notes && <p className="text-sm italic mt-2 text-dark-text">"{cycle.notes}"</p>}
        </div>
    );
};

export default TreatmentCycleCard;
