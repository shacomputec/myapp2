import React, { useState, useMemo } from 'react';
import { MOCK_STAFF_MEMBERS, MOCK_ROLES } from '../constants';
import type { StaffMember, StaffRole, StaffStatus, StaffRoleName } from '../types';

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

const allDepartments = [...new Set(MOCK_STAFF_MEMBERS.map(s => s.department))];

const InfoPair: React.FC<{ label: string, value?: string | string[] | null }> = ({ label, value}) => (
    <div>
        <p className="text-xs font-semibold text-light-text uppercase tracking-wider">{label}</p>
        <p className="text-dark-text font-medium">
             {Array.isArray(value) ? value.join(', ') : (value || 'N/A')}
        </p>
    </div>
);

const StaffDetailModal: React.FC<{ staff: StaffMember, onClose: () => void }> = ({ staff, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl p-8 relative max-h-[90vh] flex flex-col">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                
                <div className="flex items-center mb-6 pb-6 border-b">
                    <img src={staff.avatarUrl} alt={staff.name} className="w-24 h-24 rounded-full mr-6" />
                    <div>
                        <h3 className="text-3xl font-bold text-dark-text">{staff.name}</h3>
                        <p className="text-lg text-primary font-semibold">{staff.role.name} - {staff.department}</p>
                         <p className="text-md text-light-text">{staff.designation} ({staff.rank})</p>
                    </div>
                </div>

                <div className="flex-grow overflow-y-auto space-y-6 pr-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-1 space-y-4 p-4 bg-light-bg rounded-lg">
                             <h4 className="text-lg font-semibold text-dark-text">Personal Information</h4>
                             <InfoPair label="Staff ID" value={staff.id} />
                             <InfoPair label="Gender" value={staff.gender} />
                             <InfoPair label="Date of Birth" value={staff.dateOfBirth} />
                             <InfoPair label="Home Town" value={staff.homeTown} />
                             <InfoPair label="SSNIT ID" value={staff.ssnitId} />
                             <InfoPair label="Digital Address" value={staff.digitalAddress} />
                        </div>
                         <div className="md:col-span-2 space-y-4 p-4 bg-light-bg rounded-lg">
                            <h4 className="text-lg font-semibold text-dark-text">Professional & Contact Details</h4>
                            <div className="grid grid-cols-2 gap-4">
                               <InfoPair label="License No." value={staff.licenseNumber} />
                               <InfoPair label="Registration No." value={staff.registrationNumber} />
                               <InfoPair label="Academic Qualifications" value={staff.academicQualifications} />
                               <InfoPair label="Professional Qualifications" value={staff.professionalQualifications} />
                               <InfoPair label="First Appointment" value={staff.firstAppointmentDate} />
                               <InfoPair label="Posted to Station" value={staff.currentStationPostDate} />
                               <InfoPair label="Last Promotion" value={staff.promotionDate} />
                               <InfoPair label="Bank" value={staff.bankName} />
                               <InfoPair label="Account Number" value={staff.accountNumber} />
                               <InfoPair label="Next of Kin" value={staff.nextOfKin} />
                               <InfoPair label="Next of Kin Contact" value={staff.nextOfKinContact} />
                           </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

interface StaffModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (staff: StaffMember) => void;
    staffToEdit?: StaffMember | null;
}

const StaffModal: React.FC<StaffModalProps> = ({ isOpen, onClose, onSave, staffToEdit }) => {
    const [formData, setFormData] = useState<Partial<Omit<StaffMember, 'role' | 'academicQualifications' | 'professionalQualifications'>> & { roleId?: string, academicQualifications?: string, professionalQualifications?: string }>({});

    React.useEffect(() => {
        if (isOpen) {
             const initialData = staffToEdit
                ? { ...staffToEdit, roleId: staffToEdit.role.id, academicQualifications: staffToEdit.academicQualifications.join(', '), professionalQualifications: staffToEdit.professionalQualifications.join(', ') }
                : { status: 'Active' as StaffStatus, roleId: '' };
             setFormData(initialData);
        }
    }, [isOpen, staffToEdit])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const { name, roleId, department, email, phone } = formData;
        if (!name || !roleId || !department || !email || !phone) {
            alert("Please fill all required fields.");
            return;
        }

        const role = MOCK_ROLES.find(r => r.id === roleId);
        if (!role) {
            alert("Please select a valid role.");
            return;
        }

        const staffData = {
            id: staffToEdit?.id || `S${Math.floor(100 + Math.random() * 900)}`,
            firstAppointmentDate: staffToEdit?.firstAppointmentDate || new Date().toISOString().split('T')[0],
            avatarUrl: staffToEdit?.avatarUrl || `https://picsum.photos/seed/${Math.random()}/100/100`,
            ...formData,
            academicQualifications: formData.academicQualifications ? formData.academicQualifications.split(',').map(s => s.trim()) : [],
            professionalQualifications: formData.professionalQualifications ? formData.professionalQualifications.split(',').map(s => s.trim()) : [],
            role: role,
        } as StaffMember;

        onSave(staffData);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl p-8 relative max-h-[90vh]">
                 <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                <h3 className="text-xl font-bold text-dark-text mb-4">{staffToEdit ? 'Edit Staff Details' : 'Add New Staff Member'}</h3>
                
                <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto max-h-[75vh] pr-4">
                    <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-4 border p-4 rounded-lg">
                        <legend className="px-2 font-semibold text-primary">Personal Details</legend>
                        <input type="text" name="name" placeholder="Full Name" value={formData.name || ''} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded-lg" />
                        <input type="date" name="dateOfBirth" value={formData.dateOfBirth || ''} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg" />
                        <select name="gender" value={formData.gender} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg"><option>Male</option><option>Female</option><option>Other</option></select>
                        <input type="text" name="homeTown" placeholder="Home Town" value={formData.homeTown || ''} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg" />
                    </fieldset>

                     <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-4 border p-4 rounded-lg">
                        <legend className="px-2 font-semibold text-primary">Professional Details</legend>
                        <select name="roleId" value={formData.roleId || ''} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded-lg"><option value="">Select Role</option>{MOCK_ROLES.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}</select>
                        <select name="department" value={formData.department || ''} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded-lg"><option value="">Select Department</option>{allDepartments.map(d => <option key={d} value={d}>{d}</option>)}</select>
                        <input type="text" name="designation" placeholder="Designation" value={formData.designation || ''} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg" />
                        <input type="text" name="rank" placeholder="Rank" value={formData.rank || ''} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg" />
                        <textarea name="academicQualifications" placeholder="Academic Qualifications (comma-separated)" value={formData.academicQualifications || ''} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg md:col-span-2" />
                        <textarea name="professionalQualifications" placeholder="Professional Qualifications (comma-separated)" value={formData.professionalQualifications || ''} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg md:col-span-2" />
                    </fieldset>
                    
                    <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-4 border p-4 rounded-lg">
                        <legend className="px-2 font-semibold text-primary">Contact & Financial</legend>
                        <input type="email" name="email" placeholder="Email" value={formData.email || ''} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded-lg" />
                        <input type="tel" name="phone" placeholder="Phone" value={formData.phone || ''} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded-lg" />
                        <input type="text" name="bankName" placeholder="Bank Name / Branch" value={formData.bankName || ''} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg" />
                        <input type="text" name="accountNumber" placeholder="Account Number" value={formData.accountNumber || ''} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg" />
                    </fieldset>

                    <div className="mt-6 flex justify-end">
                        <button type="submit" className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors font-semibold">
                            Save Staff Member
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const Staff: React.FC = () => {
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>(MOCK_STAFF_MEMBERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ department: 'All', role: 'All' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [viewingStaff, setViewingStaff] = useState<StaffMember | null>(null);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const filteredStaff = useMemo(() =>
    staffMembers.filter(staff => {
      const matchesSearch = staff.name.toLowerCase().includes(searchTerm.toLowerCase()) || staff.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDept = filters.department === 'All' || staff.department === filters.department;
      const matchesRole = filters.role === 'All' || staff.role.name === filters.role;
      return matchesSearch && matchesDept && matchesRole;
    }), [staffMembers, searchTerm, filters]);

  const staffSummary = useMemo(() => {
    const total = staffMembers.length;
    const doctors = staffMembers.filter(s => s.role.name === 'Doctor').length;
    const nurses = staffMembers.filter(s => s.role.name === 'Nurse').length;
    const admin = staffMembers.filter(s => s.role.name === 'Administrator').length;
    return { total, doctors, nurses, admin };
  }, [staffMembers]);

  const handleSaveStaff = (staff: StaffMember) => {
    setStaffMembers(prev => {
        const existing = prev.find(s => s.id === staff.id);
        if (existing) {
            return prev.map(s => s.id === staff.id ? staff : s);
        }
        return [...prev, staff];
    });
  };

  const handleToggleStatus = (staffId: string) => {
    setStaffMembers(prev => prev.map(staff => 
        staff.id === staffId 
        ? { ...staff, status: staff.status === 'Active' ? 'On Leave' : 'Active' } 
        : staff
    ));
  };

  const statusColors: { [key in StaffStatus]: string } = {
    'Active': 'bg-green-100 text-green-800',
    'On Leave': 'bg-yellow-100 text-yellow-800',
  };

  return (
    <div className="space-y-8">
        <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold text-dark-text">Staff Management</h2>
            <button onClick={() => { setEditingStaff(null); setIsModalOpen(true); }} className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors font-semibold flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                Add New Staff Member
            </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Total Staff" value={staffSummary.total.toString()} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283-.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm-9 3a2 2 0 11-4 0 2 2 0 014 0z" /></svg>} />
            <StatCard title="Doctors" value={staffSummary.doctors.toString()} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10h.01M15 10h.01M10 14v2a2 2 0 104 0v-2m-4 0h4" /></svg>} />
            <StatCard title="Nurses" value={staffSummary.nurses.toString()} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v11.494m-9-5.747h18" /></svg>} />
            <StatCard title="Admin Staff" value={staffSummary.admin.toString()} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 012-2h2a2 2 0 012 2v1m-6 0h6" /></svg>} />
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                 <input type="text" placeholder="Search by name or staff ID..." className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary md:col-span-1" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                 <select name="department" value={filters.department} onChange={handleFilterChange} className="w-full p-3 border border-gray-300 rounded-lg">
                    <option value="All">All Departments</option>
                    {allDepartments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                 <select name="role" value={filters.role} onChange={handleFilterChange} className="w-full p-3 border border-gray-300 rounded-lg">
                    <option value="All">All Roles</option>
                    {MOCK_ROLES.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                </select>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-light-bg">
                        <tr>
                            <th className="p-3 font-semibold text-light-text">Staff Member</th>
                            <th className="p-3 font-semibold text-light-text">Role</th>
                            <th className="p-3 font-semibold text-light-text">Department</th>
                            <th className="p-3 font-semibold text-light-text">Contact</th>
                            <th className="p-3 font-semibold text-light-text">Status</th>
                            <th className="p-3 font-semibold text-light-text">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStaff.map(staff => (
                            <tr key={staff.id} className="border-b hover:bg-gray-50">
                                <td className="p-3 font-medium text-dark-text flex items-center">
                                    <img src={staff.avatarUrl} alt={staff.name} className="w-10 h-10 rounded-full mr-3" />
                                    <div>
                                        <p>{staff.name}</p>
                                        <p className="text-sm text-light-text">{staff.id}</p>
                                    </div>
                                </td>
                                <td className="p-3">{staff.role.name}</td>
                                <td className="p-3">{staff.department}</td>
                                <td className="p-3">{staff.phone}</td>
                                <td className="p-3">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[staff.status]}`}>{staff.status}</span>
                                </td>
                                <td className="p-3 space-x-2">
                                     <button onClick={() => { setViewingStaff(staff); setIsDetailModalOpen(true); }} className="text-primary hover:underline text-sm font-medium">View</button>
                                     <button onClick={() => { setEditingStaff(staff); setIsModalOpen(true); }} className="text-primary hover:underline text-sm font-medium">Edit</button>
                                     <button onClick={() => handleToggleStatus(staff.id)} className="text-accent hover:underline text-sm font-medium">{staff.status === 'Active' ? 'Set on Leave' : 'Set Active'}</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
        <StaffModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveStaff} staffToEdit={editingStaff} />
        {viewingStaff && <StaffDetailModal staff={viewingStaff} onClose={() => setIsDetailModalOpen(false)} />}
    </div>
  );
};

export default Staff;