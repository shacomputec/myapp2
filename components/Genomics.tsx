import React, { useMemo } from 'react';
import type { GenomicSample, GenomicSampleStatus } from '../types';

interface GenomicsProps {
    genomicSamples: GenomicSample[];
    setGenomicSamples: React.Dispatch<React.SetStateAction<GenomicSample[]>>;
}

const StatCard: React.FC<{ title: string; value: string | number; }> = ({ title, value }) => (
    <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
        <p className="text-sm font-medium text-gray-400">{title}</p>
        <p className="text-3xl font-bold text-white">{value}</p>
    </div>
);

const Genomics: React.FC<GenomicsProps> = ({ genomicSamples, setGenomicSamples }) => {
    
    const summary = useMemo(() => {
        return {
            totalSamples: genomicSamples.length,
            pendingAnalysis: genomicSamples.filter(s => s.status === 'Sequencing' || s.status === 'Sample Collected').length,
            reportsGenerated: genomicSamples.filter(s => s.status === 'Report Generated').length,
        }
    }, [genomicSamples]);

    const statusColors: Record<GenomicSampleStatus, string> = {
        'Sample Collected': 'bg-blue-500/10 text-blue-400',
        'Sequencing': 'bg-yellow-500/10 text-yellow-400',
        'Analysis Complete': 'bg-purple-500/10 text-purple-400',
        'Report Generated': 'bg-green-500/10 text-green-400',
    };

    return (
        <div className="space-y-8 bg-gray-900 -m-8 p-8 min-h-full">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-white">Genomics & Precision Medicine</h2>
                <button onClick={() => alert("Request new sequencing modal would open here.")} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-500 font-semibold flex items-center">
                    Request Sequencing
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Total Genomic Profiles" value={summary.totalSamples} />
                <StatCard title="Samples Pending Analysis" value={summary.pendingAnalysis} />
                <StatCard title="Reports Generated" value={summary.reportsGenerated} />
            </div>

            <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
                <h3 className="text-xl font-semibold text-white mb-4">Genomic Sample Tracking</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-gray-300">
                        <thead>
                            <tr className="border-b border-gray-700">
                                <th className="p-3 font-semibold">Sample ID</th>
                                <th className="p-3 font-semibold">Patient</th>
                                <th className="p-3 font-semibold">Sample Type</th>
                                <th className="p-3 font-semibold">Collection Date</th>
                                <th className="p-3 font-semibold">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {genomicSamples.map(sample => (
                                <tr key={sample.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                                    <td className="p-3 font-medium text-blue-400">{sample.id}</td>
                                    <td className="p-3">{sample.patientName}</td>
                                    <td className="p-3">{sample.sampleType}</td>
                                    <td className="p-3">{sample.collectionDate}</td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[sample.status]}`}>{sample.status}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Genomics;
