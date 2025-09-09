
import React, { useState, useMemo } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { MOCK_PATIENTS, MOCK_INVOICES } from '../constants';
import type { Patient, Invoice, Appointment } from '../types';
import { getReportSummary } from '../services/geminiService';
import { useAuth } from '../services/auth';
import SummaryModal from './SummaryModal';

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; }> = ({ title, value, icon }) => (
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

const ChartCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-dark-text">{title}</h3>
            <button className="text-xs bg-light-bg px-3 py-1 rounded-md text-light-text hover:bg-gray-200">Download CSV</button>
        </div>
        <div style={{ width: '100%', height: 300 }}>
            {children}
        </div>
    </div>
);

const Reports: React.FC = () => {
    type DateRange = '7d' | '30d' | '90d' | 'all';
    const [dateRange, setDateRange] = useState<DateRange>('30d');
    const { hasPermission } = useAuth();
    const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
    const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
    const [summaryContent, setSummaryContent] = useState('');

    const allAppointments = useMemo(() => MOCK_PATIENTS.flatMap(p => p.appointments), []);

    const { filteredAppointments, filteredInvoices, filteredPatients } = useMemo(() => {
        const now = new Date();
        let startDate = new Date();

        if (dateRange !== 'all') {
            const daysToSubtract = { '7d': 7, '30d': 30, '90d': 90 }[dateRange];
            startDate.setDate(now.getDate() - daysToSubtract);
        } else {
            startDate = new Date(0); // The beginning of time
        }

        const fa = allAppointments.filter(a => new Date(a.date) >= startDate);
        const fi = MOCK_INVOICES.filter(i => new Date(i.date) >= startDate);
        const patientIdsInDateRange = new Set([...fa.map(a => a.patientId), ...fi.map(i => i.patientId)]);
        const fp = MOCK_PATIENTS.filter(p => patientIdsInDateRange.has(p.id));

        return { filteredAppointments: fa, filteredInvoices: fi, filteredPatients: fp };

    }, [dateRange, allAppointments]);

    const kpiData = useMemo(() => {
        const totalRevenue = filteredInvoices
            .filter(i => i.status === 'Paid')
            .reduce((sum, i) => sum + i.totalAmount, 0);
        
        const totalAge = filteredPatients.reduce((sum, p) => sum + p.age, 0);
        const avgAge = filteredPatients.length > 0 ? (totalAge / filteredPatients.length).toFixed(0) : 0;
        
        return {
            totalAppointments: filteredAppointments.length,
            activePatients: filteredPatients.length,
            totalRevenue: `GH₵${totalRevenue.toLocaleString()}`,
            avgAge: avgAge,
        };
    }, [filteredAppointments, filteredInvoices, filteredPatients]);
    
    const genderData = useMemo(() => {
        const counts = filteredPatients.reduce((acc, p) => {
            acc[p.gender] = (acc[p.gender] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [filteredPatients]);

    const appointmentTrendData = useMemo(() => {
        const trend = filteredAppointments.reduce((acc, app) => {
            const date = new Date(app.date).toLocaleDateString('en-CA'); // YYYY-MM-DD
            acc[date] = (acc[date] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        
        return Object.entries(trend)
            .map(([date, count]) => ({ date, count }))
            .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [filteredAppointments]);
    
     const financialData = useMemo(() => {
        const data = filteredInvoices.reduce((acc, inv) => {
            const month = new Date(inv.date).toLocaleString('default', { month: 'short', year: 'numeric' });
            if (!acc[month]) {
                acc[month] = { month, paid: 0, outstanding: 0 };
            }
            if (inv.status === 'Paid') {
                acc[month].paid += inv.totalAmount;
            } else {
                acc[month].outstanding += inv.totalAmount;
            }
            return acc;
        }, {} as Record<string, { month: string; paid: number; outstanding: number }>);

        return Object.values(data);
    }, [filteredInvoices]);

    const departmentPerformance = useMemo(() => {
        const counts = filteredAppointments.reduce((acc, app) => {
            acc[app.department] = (acc[app.department] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(counts)
            .map(([name, appointments]) => ({ name, appointments }))
            .sort((a, b) => b.appointments - a.appointments);
    }, [filteredAppointments]);

    const handleGenerateSummary = async () => {
        setIsGeneratingSummary(true);
        setSummaryContent('');
        setIsSummaryModalOpen(true);

        const reportDataString = `
            **Selected Date Range:** ${dateRange}

            **Key Performance Indicators:**
            - Total Appointments: ${kpiData.totalAppointments}
            - Active Patients: ${kpiData.activePatients}
            - Total Revenue: ${kpiData.totalRevenue}
            - Average Patient Age: ${kpiData.avgAge} years

            **Appointment Trend (Count per day):**
            ${appointmentTrendData.map(d => `- ${d.date}: ${d.count}`).join('\n')}

            **Financial Performance (by Month):**
            ${financialData.map(d => `- ${d.month}: Paid GH₵${d.paid.toFixed(2)}, Outstanding GH₵${d.outstanding.toFixed(2)}`).join('\n')}

            **Department Performance (Appointment Count):**
            ${departmentPerformance.map(d => `- ${d.name}: ${d.appointments}`).join('\n')}

            **Patient Demographics (Gender):**
            ${genderData.map(d => `- ${d.name}: ${d.value}`).join('\n')}
        `;

        try {
            const result = await getReportSummary(reportDataString);
            setSummaryContent(result);
        } catch (error) {
            setSummaryContent("An error occurred while generating the summary. Please try again.");
            console.error(error);
        } finally {
            setIsGeneratingSummary(false);
        }
    };


    const GENDER_COLORS = ['#0055A4', '#008751', '#FCD116'];

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="text-3xl font-bold text-dark-text">Reporting & Analytics</h2>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <div className="flex items-center space-x-2 bg-white p-1 rounded-lg shadow-sm">
                        {(['7d', '30d', '90d', 'all'] as DateRange[]).map(range => (
                            <button 
                                key={range}
                                onClick={() => setDateRange(range)}
                                className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
                                    dateRange === range ? 'bg-primary text-white' : 'text-light-text hover:bg-light-bg'
                                }`}
                            >
                                {range === '7d' && 'Last 7 Days'}
                                {range === '30d' && 'Last 30 Days'}
                                {range === '90d' && 'Last 90 Days'}
                                {range === 'all' && 'All Time'}
                            </button>
                        ))}
                    </div>
                    {hasPermission('admin:ai_assistant') && (
                        <button onClick={handleGenerateSummary} disabled={isGeneratingSummary} className="bg-secondary text-primary-dark px-4 py-2 rounded-lg hover:bg-yellow-400 font-semibold text-sm flex items-center justify-center disabled:bg-gray-300">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-6.857 2.143L12 21l-2.143-6.857L3 12l6.857-2.143L12 3z" />
                            </svg>
                            {isGeneratingSummary ? 'Analyzing...' : 'Generate AI Summary'}
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Appointments" value={kpiData.totalAppointments} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} />
                <StatCard title="Active Patients" value={kpiData.activePatients} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>} />
                <StatCard title="Total Revenue" value={kpiData.totalRevenue} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>} />
                <StatCard title="Average Patient Age" value={kpiData.avgAge} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c1.104 0 2.104.896 2.104 2s-.896 2-2.104 2S9.896 11.104 9.896 10s.896-2 2.104-2zm0-4c4.418 0 8 3.582 8 8s-3.582 8-8 8-8-3.582-8-8 3.582-8 8-8z" /></svg>} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ChartCard title="Appointment Trends">
                    <ResponsiveContainer>
                        <LineChart data={appointmentTrendData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="count" name="Appointments" stroke="#0055A4" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartCard>
                <ChartCard title="Patient Demographics">
                    <ResponsiveContainer>
                        <PieChart>
                            <Pie data={genderData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" paddingAngle={5}>
                                {genderData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={GENDER_COLORS[index % GENDER_COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>
            
             <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-3">
                    <ChartCard title="Financial Performance">
                         <ResponsiveContainer>
                            <BarChart data={financialData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="paid" stackId="a" fill="#008751" name="Paid" />
                                <Bar dataKey="outstanding" stackId="a" fill="#CE1126" name="Outstanding" />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>
                </div>
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md">
                     <h3 className="text-lg font-semibold text-dark-text mb-4">Department Performance</h3>
                     <div className="space-y-2">
                        {departmentPerformance.map(dept => (
                            <div key={dept.name}>
                                <div className="flex justify-between text-sm font-medium text-dark-text mb-1">
                                    <span>{dept.name}</span>
                                    <span>{dept.appointments} Appointments</span>
                                </div>
                                <div className="w-full bg-light-bg rounded-full h-2.5">
                                    <div className="bg-primary h-2.5 rounded-full" style={{ width: `${(dept.appointments / Math.max(...departmentPerformance.map(d => d.appointments))) * 100}%` }}></div>
                                </div>
                            </div>
                        ))}
                     </div>
                </div>
            </div>
            <SummaryModal 
                isOpen={isSummaryModalOpen} 
                onClose={() => setIsSummaryModalOpen(false)} 
                content={summaryContent} 
                isLoading={isGeneratingSummary} 
                title="AI Report Analysis"
                patientName=""
            />
        </div>
    );
};

export default Reports;
