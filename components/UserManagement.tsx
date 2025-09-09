import React, { useState, useMemo } from 'react';
import { MOCK_USERS, MOCK_ROLES as initialMockRoles } from '../constants';
import type { User, UserStatus, StaffRoleName, StaffRole, Permission } from '../types';

const ALL_PERMISSIONS: { group: string; permissions: { id: Permission; label: string }[] }[] = [
    {
        group: 'Patient Management',
        permissions: [
            { id: 'patient:read', label: 'View Patient Records' },
            { id: 'patient:write', label: 'Edit Patient Records & Add Notes' },
            { id: 'patient:register', label: 'Register New Patients' },
        ],
    },
    {
        group: 'Clinical Modules',
        permissions: [
            { id: 'clinical:telemedicine', label: 'Access Telemedicine' },
            { id: 'clinical:laboratory', label: 'Access Laboratory' },
            { id: 'clinical:pharmacy', label: 'Access Pharmacy' },
            { id: 'clinical:surgery', label: 'Access Surgery Module' },
        ],
    },
    {
        group: 'Finance',
        permissions: [
            { id: 'finance:billing', label: 'Access Billing & Invoicing' },
            { id: 'finance:bank', label: 'Access Bank Management' },
            { id: 'finance:nhis', label: 'Manage NHIS Claims' },
        ],
    },
    {
        group: 'Administration',
        permissions: [
            { id: 'admin:staff', label: 'Manage Staff Roster' },
            { id: 'admin:hr', label: 'Access Human Resources' },
            { id: 'admin:users', label: 'Manage Users & Roles' },
            { id: 'admin:reports', label: 'View System Reports' },
            { id: 'admin:ai_assistant', label: 'Use AI Assistant' },
            { id: 'admin:settings', label: 'Change System Settings' },
        ],
    },
];

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

interface UserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (user: User) => void;
    userToEdit?: User | null;
}

const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, onSave, userToEdit }) => {
    const [formData, setFormData] = useState<Partial<User>>({});

    React.useEffect(() => {
        if (isOpen) {
            setFormData(userToEdit || { status: 'Active' });
        }
    }, [isOpen, userToEdit]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const { name, email, role } = formData;
        if (!name || !email || !role) {
            alert("Please fill all required fields.");
            return;
        }

        const userData = {
            id: userToEdit?.id || `U${Math.floor(100 + Math.random() * 900)}`,
            lastLogin: userToEdit?.lastLogin || new Date().toISOString(),
            avatarUrl: userToEdit?.avatarUrl || `https://picsum.photos/seed/${Math.random()}/100/100`,
            ...formData,
        } as User;

        onSave(userData);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-8 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                <h3 className="text-xl font-bold text-dark-text mb-4">{userToEdit ? 'Edit User' : 'Add New User'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-light-text mb-1">Full Name</label>
                            <input type="text" name="name" value={formData.name || ''} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded-lg" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-light-text mb-1">Email</label>
                            <input type="email" name="email" value={formData.email || ''} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded-lg" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-light-text mb-1">Role</label>
                            <select name="role" value={formData.role || ''} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded-lg">
                                <option value="">Select Role</option>
                                {initialMockRoles.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                            </select>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-light-text mb-1">Status</label>
                            <select name="status" value={formData.status || 'Active'} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded-lg">
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end">
                        <button type="submit" className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark font-semibold">Save User</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

interface PermissionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (roleId: string, permissions: Permission[]) => void;
    role: StaffRole | null;
}

const PermissionsModal: React.FC<PermissionsModalProps> = ({ isOpen, onClose, onSave, role }) => {
    const [currentPermissions, setCurrentPermissions] = useState<Set<Permission>>(new Set());

    React.useEffect(() => {
        if (role) {
            setCurrentPermissions(new Set(role.permissions));
        }
    }, [role]);

    if (!isOpen || !role) return null;

    const handlePermissionChange = (permission: Permission, checked: boolean) => {
        setCurrentPermissions(prev => {
            const newPermissions = new Set(prev);
            if (checked) {
                newPermissions.add(permission);
            } else {
                newPermissions.delete(permission);
            }
            return newPermissions;
        });
    };
    
    const handleSave = () => {
        onSave(role.id, Array.from(currentPermissions));
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-8 relative max-h-[90vh] flex flex-col">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                <h3 className="text-xl font-bold text-dark-text mb-4">Edit Permissions for <span className="text-primary">{role.name}</span></h3>
                <div className="flex-grow overflow-y-auto pr-2 space-y-4">
                    {ALL_PERMISSIONS.map(group => (
                        <div key={group.group}>
                            <h4 className="font-semibold text-dark-text border-b pb-1 mb-2">{group.group}</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {group.permissions.map(perm => (
                                    <label key={perm.id} className="flex items-center space-x-3 p-2 rounded-md hover:bg-light-bg">
                                        <input
                                            type="checkbox"
                                            checked={currentPermissions.has(perm.id)}
                                            onChange={(e) => handlePermissionChange(perm.id, e.target.checked)}
                                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                        />
                                        <span className="text-sm text-dark-text">{perm.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
                 <div className="mt-6 flex justify-end border-t pt-4">
                    <button onClick={handleSave} className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark font-semibold">Save Changes</button>
                </div>
            </div>
        </div>
    )
};


const UserManagement: React.FC = () => {
    const [users, setUsers] = useState<User[]>(MOCK_USERS);
    const [roles, setRoles] = useState<StaffRole[]>(initialMockRoles);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({ role: 'All', status: 'All' });
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [editingRole, setEditingRole] = useState<StaffRole | null>(null);
    const [activeTab, setActiveTab] = useState<'Users' | 'Roles'>('Users');

    const summary = useMemo(() => ({
        total: users.length,
        admins: users.filter(u => u.role === 'Administrator').length,
        activeNow: users.filter(u => new Date(u.lastLogin) > new Date(Date.now() - 3600 * 1000 * 4)).length,
        inactive: users.filter(u => u.status === 'Inactive').length,
    }), [users]);

    const filteredUsers = useMemo(() =>
        users.filter(user => {
            const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesRole = filters.role === 'All' || user.role === filters.role;
            const matchesStatus = filters.status === 'All' || user.status === filters.status;
            return matchesSearch && matchesRole && matchesStatus;
        }),
    [users, searchTerm, filters]);

    const handleSaveUser = (user: User) => {
        setUsers(prev => {
            const existing = prev.find(u => u.id === user.id);
            if (existing) {
                return prev.map(u => u.id === user.id ? user : u);
            }
            return [user, ...prev];
        });
    };
    
    const handleSavePermissions = (roleId: string, permissions: Permission[]) => {
        setRoles(prev => prev.map(r => r.id === roleId ? {...r, permissions} : r));
    }

    const handleToggleStatus = (userId: string) => {
        setUsers(prev => prev.map(user =>
            user.id === userId
                ? { ...user, status: user.status === 'Active' ? 'Inactive' : 'Active' }
                : user
        ));
    };

    const statusColors: Record<UserStatus, string> = {
        Active: 'bg-green-100 text-green-800',
        Inactive: 'bg-red-100 text-red-800',
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-dark-text">User Management</h2>
                <button onClick={() => { setEditingUser(null); setIsUserModalOpen(true); }} className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark font-semibold flex items-center">
                    Add New User
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard title="Total Users" value={summary.total.toString()} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm-9 3a2 2 0 11-4 0 2 2 0 014 0z" /></svg>} />
                <StatCard title="Administrators" value={summary.admins.toString()} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 0121 9z" /></svg>} />
                <StatCard title="Active Now" value={summary.activeNow.toString()} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.829a1.5 1.5 0 100-2.121 1.5 1.5 0 000 2.121z" /></svg>} />
                <StatCard title="Inactive Accounts" value={summary.inactive.toString()} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>} />
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="border-b mb-4">
                    <nav className="flex space-x-4">
                        {(['Users', 'Roles'] as const).map(tab => (
                            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-3 py-2 font-medium text-sm rounded-t-lg ${activeTab === tab ? 'border-b-2 border-primary text-primary' : 'text-light-text hover:text-dark-text'}`}>
                                {tab === 'Roles' ? 'Roles & Permissions' : tab}
                            </button>
                        ))}
                    </nav>
                </div>

                {activeTab === 'Users' && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <input type="text" placeholder="Search by name or email..." className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary md:col-span-1" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                            <select value={filters.role} name="role" onChange={(e) => setFilters(prev => ({...prev, role: e.target.value}))} className="w-full p-3 border border-gray-300 rounded-lg">
                                <option value="All">All Roles</option>
                                {initialMockRoles.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                            </select>
                            <select value={filters.status} name="status" onChange={(e) => setFilters(prev => ({...prev, status: e.target.value}))} className="w-full p-3 border border-gray-300 rounded-lg">
                                <option value="All">All Statuses</option>
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-light-bg">
                                    <tr>
                                        <th className="p-3 font-semibold text-light-text">User</th>
                                        <th className="p-3 font-semibold text-light-text">Role</th>
                                        <th className="p-3 font-semibold text-light-text">Last Login</th>
                                        <th className="p-3 font-semibold text-light-text">Status</th>
                                        <th className="p-3 font-semibold text-light-text">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map(user => (
                                        <tr key={user.id} className="border-b hover:bg-gray-50">
                                            <td className="p-3 font-medium text-dark-text flex items-center">
                                                <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-full mr-3" />
                                                <div><p>{user.name}</p><p className="text-sm text-light-text">{user.email}</p></div>
                                            </td>
                                            <td className="p-3">{user.role}</td>
                                            <td className="p-3">{new Date(user.lastLogin).toLocaleString()}</td>
                                            <td className="p-3">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[user.status]}`}>{user.status}</span>
                                            </td>
                                            <td className="p-3 space-x-2">
                                                <button onClick={() => { setEditingUser(user); setIsUserModalOpen(true); }} className="text-primary hover:underline text-sm font-medium">
                                                    Edit
                                                </button>
                                                <button onClick={() => handleToggleStatus(user.id)} className="text-sm font-medium text-accent hover:underline">
                                                    {user.status === 'Active' ? 'Deactivate' : 'Activate'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
                
                {activeTab === 'Roles' && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-light-bg">
                                <tr>
                                    <th className="p-3 font-semibold text-light-text">Role Name</th>
                                    <th className="p-3 font-semibold text-light-text">Permissions Summary</th>
                                    <th className="p-3 font-semibold text-light-text">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {roles.map(role => (
                                    <tr key={role.id} className="border-b hover:bg-gray-50">
                                        <td className="p-3 font-medium text-dark-text">{role.name}</td>
                                        <td className="p-3 text-sm text-light-text">{role.permissions.length} permissions granted</td>
                                        <td className="p-3">
                                            <button onClick={() => { setEditingRole(role); setIsPermissionsModalOpen(true); }} className="text-primary hover:underline text-sm font-medium">
                                                Manage Permissions
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            <UserModal isOpen={isUserModalOpen} onClose={() => setIsUserModalOpen(false)} onSave={handleSaveUser} userToEdit={editingUser} />
            {editingRole && <PermissionsModal isOpen={isPermissionsModalOpen} onClose={() => { setIsPermissionsModalOpen(false); setEditingRole(null); }} onSave={handleSavePermissions} role={editingRole} />}
        </div>
    );
};

export default UserManagement;
