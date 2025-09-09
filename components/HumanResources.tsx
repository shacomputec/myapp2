import React, { useState, useMemo } from 'react';
import { MOCK_STAFF_MEMBERS, MOCK_LEAVE_REQUESTS, MOCK_PERFORMANCE_REVIEWS } from '../constants';
import type { Payroll, LeaveRequest, PerformanceReview, LeaveStatus, ReviewStatus, StaffMember } from '../types';

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


const HumanResources: React.FC = () => {
    const [staffMembers] = useState<StaffMember[]>(MOCK_STAFF_MEMBERS);
    const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(MOCK_LEAVE_REQUESTS);
    const [reviews] = useState<PerformanceReview[]>(MOCK_PERFORMANCE_REVIEWS);
    const [activeTab, setActiveTab] = useState<'Payroll' | 'Leave' | 'Reviews'>('Payroll');

    const payroll = useMemo(() => staffMembers.map(staff => ({
        staffId: staff.id,
        staffName: staff.name,
        role: staff.role.name,
        monthlySalary: staff.role.name === 'Doctor' ? 15000 : staff.role.name === 'Nurse' ? 8000 : staff.role.name === 'Administrator' ? 10000 : 5000,
        lastPaymentDate: '2024-06-28',
        nextPaymentDate: '2024-07-28',
    })), [staffMembers]);

    const summary = useMemo(() => {
        const totalPayroll = payroll.reduce((sum, p) => sum + p.monthlySalary, 0);
        const pendingLeave = leaveRequests.filter(r => r.status === 'Pending').length;
        const upcomingReviews = reviews.filter(r => r.status === 'Scheduled' && new Date(r.reviewDate) > new Date()).length;
        const staffOnLeave = staffMembers.filter(s => s.status === 'On Leave').length;
        return {
            totalPayroll: `GH₵${totalPayroll.toLocaleString()}`,
            pendingLeave,
            upcomingReviews,
            staffOnLeave,
        };
    }, [payroll, leaveRequests, reviews, staffMembers]);

    const handleLeaveStatusChange = (id: string, newStatus: LeaveStatus) => {
        setLeaveRequests(prev => prev.map(req => req.id === id ? { ...req, status: newStatus } : req));
    };

    const leaveStatusColors: Record<LeaveStatus, string> = {
        Pending: 'bg-yellow-100 text-yellow-800',
        Approved: 'bg-green-100 text-green-800',
        Rejected: 'bg-red-100 text-red-800',
    };
    
    const reviewStatusColors: Record<ReviewStatus, string> = {
        Scheduled: 'bg-blue-100 text-blue-800',
        Completed: 'bg-gray-100 text-gray-800',
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'Payroll':
                return (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-light-bg">
                                <tr>
                                    <th className="p-3 font-semibold text-light-text">Staff Name</th>
                                    <th className="p-3 font-semibold text-light-text">Role</th>
                                    <th className="p-3 font-semibold text-light-text">Monthly Salary</th>
                                    <th className="p-3 font-semibold text-light-text">Last Payment</th>
                                    <th className="p-3 font-semibold text-light-text">Next Payment</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payroll.map(p => (
                                    <tr key={p.staffId} className="border-b hover:bg-gray-50">
                                        <td className="p-3 font-medium text-dark-text">{p.staffName}</td>
                                        <td className="p-3">{p.role}</td>
                                        <td className="p-3">GH₵{p.monthlySalary.toLocaleString()}</td>
                                        <td className="p-3">{p.lastPaymentDate}</td>
                                        <td className="p-3">{p.nextPaymentDate}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );
            case 'Leave':
                return (
                     <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-light-bg">
                                <tr>
                                    <th className="p-3 font-semibold text-light-text">Staff Name</th>
                                    <th className="p-3 font-semibold text-light-text">Dates</th>
                                    <th className="p-3 font-semibold text-light-text">Type</th>
                                    <th className="p-3 font-semibold text-light-text">Status</th>
                                    <th className="p-3 font-semibold text-light-text">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leaveRequests.map(req => (
                                    <tr key={req.id} className="border-b hover:bg-gray-50">
                                        <td className="p-3 font-medium text-dark-text">{req.staffName}</td>
                                        <td className="p-3">{req.startDate} to {req.endDate}</td>
                                        <td className="p-3">{req.leaveType}</td>
                                        <td className="p-3">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${leaveStatusColors[req.status]}`}>{req.status}</span>
                                        </td>
                                        <td className="p-3 space-x-2">
                                            {req.status === 'Pending' && (
                                                <>
                                                    <button onClick={() => handleLeaveStatusChange(req.id, 'Approved')} className="text-sm font-medium text-success hover:underline">Approve</button>
                                                    <button onClick={() => handleLeaveStatusChange(req.id, 'Rejected')} className="text-sm font-medium text-accent hover:underline">Reject</button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );
            case 'Reviews':
                return (
                     <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-light-bg">
                                <tr>
                                    <th className="p-3 font-semibold text-light-text">Staff Name</th>
                                    <th className="p-3 font-semibold text-light-text">Reviewer</th>
                                    <th className="p-3 font-semibold text-light-text">Review Date</th>
                                    <th className="p-3 font-semibold text-light-text">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reviews.map(rev => (
                                    <tr key={rev.id} className="border-b hover:bg-gray-50">
                                        <td className="p-3 font-medium text-dark-text">{rev.staffName}</td>
                                        <td className="p-3">{rev.reviewerName}</td>
                                        <td className="p-3">{rev.reviewDate}</td>
                                        <td className="p-3">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${reviewStatusColors[rev.status]}`}>{rev.status}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );
        }
    };


    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold text-dark-text">Human Resources</h2>
             <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard title="Monthly Payroll" value={summary.totalPayroll} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>} />
                <StatCard title="Pending Leave Requests" value={summary.pendingLeave.toString()} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} />
                <StatCard title="Upcoming Reviews" value={summary.upcomingReviews.toString()} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>} />
                <StatCard title="Staff on Leave" value={summary.staffOnLeave.toString()} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>} />
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="border-b mb-4">
                    <nav className="flex space-x-4">
                        {(['Payroll', 'Leave', 'Reviews'] as const).map(tab => (
                            <button 
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-3 py-2 font-medium text-sm rounded-t-lg ${activeTab === tab ? 'border-b-2 border-primary text-primary' : 'text-light-text hover:text-dark-text'}`}
                            >
                                {tab === 'Leave' ? 'Leave Management' : tab}
                            </button>
                        ))}
                    </nav>
                </div>
                {renderContent()}
            </div>
        </div>
    );
};

export default HumanResources;