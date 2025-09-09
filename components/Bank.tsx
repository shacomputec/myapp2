import React, { useState, useMemo, useEffect } from 'react';
import { MOCK_BANK_ACCOUNTS } from '../constants';
import type { BankAccount, BankTransaction, ReconciliationStatus, TransactionType, MobileMoneyProvider } from '../types';

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

interface ReconcileModalProps {
    transaction: BankTransaction;
    isOpen: boolean;
    onClose: () => void;
    onSave: (transactionId: string, reconciliationId: string) => void;
}
const ReconcileModal: React.FC<ReconcileModalProps> = ({ transaction, isOpen, onClose, onSave }) => {
    const [reconciliationId, setReconciliationId] = useState('');

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (!reconciliationId) {
            alert('Please enter a reconciliation ID.');
            return;
        }
        onSave(transaction.id, reconciliationId);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-8 relative dark:bg-slate-800">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <h3 className="text-xl font-bold text-dark-text mb-2 dark:text-slate-200">Reconcile Transaction</h3>
                <p className="text-sm text-light-text mb-4 dark:text-slate-400">Transaction ID: {transaction.id}</p>
                <div className="space-y-4 bg-light-bg p-4 rounded-lg dark:bg-slate-700 dark:text-slate-300">
                    <p><strong>Description:</strong> {transaction.description}</p>
                    <p><strong>Amount:</strong> GH₵{transaction.amount.toFixed(2)}</p>
                    <p><strong>Date:</strong> {new Date(transaction.date).toLocaleDateString()}</p>
                </div>
                <div className="mt-4">
                    <label htmlFor="reconciliationId" className="block text-sm font-medium text-light-text mb-1 dark:text-slate-400">
                        Reconciliation ID (e.g., Invoice #, Payroll ID)
                    </label>
                    <input
                        type="text"
                        id="reconciliationId"
                        value={reconciliationId}
                        onChange={(e) => setReconciliationId(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-slate-600 dark:border-slate-500 dark:text-slate-200"
                        placeholder="e.g., INV-001 or PAYROLL-JUL24"
                    />
                </div>
                <div className="mt-6 flex justify-end">
                    <button onClick={handleSubmit} className="bg-success text-white px-6 py-2 rounded-lg hover:bg-green-700 font-semibold">
                        Mark as Reconciled
                    </button>
                </div>
            </div>
        </div>
    );
};

const AddAccountModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (account: Omit<BankAccount, 'id'>) => void;
}> = ({ isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState({ bankName: '', accountNumber: '', balance: 0 });
    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...formData, balance: Number(formData.balance) });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-8 relative dark:bg-slate-800">
                <button type="button" onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-white"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                <h3 className="text-xl font-bold text-dark-text mb-4 dark:text-slate-200">Add New Bank Account</h3>
                <div className="space-y-4">
                    <input type="text" placeholder="Bank Name (e.g., GCB Bank)" value={formData.bankName} onChange={e => setFormData({...formData, bankName: e.target.value})} required className="w-full p-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" />
                    <input type="text" placeholder="Account Number" value={formData.accountNumber} onChange={e => setFormData({...formData, accountNumber: e.target.value})} required className="w-full p-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" />
                    <input type="number" placeholder="Initial Balance" value={formData.balance} onChange={e => setFormData({...formData, balance: Number(e.target.value)})} required className="w-full p-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" />
                </div>
                 <div className="mt-6 flex justify-end">
                    <button type="submit" className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark font-semibold">Save Account</button>
                </div>
            </form>
        </div>
    );
};

const NewTransactionModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (transaction: Omit<BankTransaction, 'id' | 'status'>) => void;
    accounts: BankAccount[];
}> = ({ isOpen, onClose, onSave, accounts }) => {
    const initialFormState = {
        date: new Date().toISOString().split('T')[0],
        description: '',
        type: 'Deposit' as TransactionType,
        amount: 0,
        accountId: accounts[0]?.id || '',
        momoProvider: 'MTN Mobile Money' as MobileMoneyProvider,
        momoTransactionId: '',
        senderNumber: '',
        senderCountry: '',
        originalAmount: 0,
        originalCurrency: '',
        swiftCode: '',
    };
    const [formData, setFormData] = useState(initialFormState);

    useEffect(() => {
        if(isOpen) {
            setFormData(initialFormState);
        }
    }, [isOpen]);

    if (!isOpen) return null;
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({...formData, amount: Number(formData.amount)});
        onClose();
    };
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
             <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-8 relative max-h-[90vh] flex flex-col dark:bg-slate-800">
                 <button type="button" onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-white"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                <h3 className="text-xl font-bold text-dark-text mb-4 dark:text-slate-200">Log New Transaction</h3>
                <div className="space-y-4 flex-grow overflow-y-auto pr-2">
                    <input type="date" name="date" value={formData.date} onChange={handleChange} required className="w-full p-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" />
                    <input type="text" name="description" placeholder="Description" value={formData.description} onChange={handleChange} required className="w-full p-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" />
                    <div className="grid grid-cols-2 gap-4">
                        <select name="type" value={formData.type} onChange={handleChange} required className="w-full p-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200">
                            <option value="Deposit">Standard Deposit</option>
                            <option value="Mobile Money Deposit">Mobile Money Deposit</option>
                            <option value="International Transfer">International Transfer</option>
                            <option value="Withdrawal">Withdrawal</option>
                            <option value="Transfer">Internal Transfer</option>
                        </select>
                        <input type="number" name="amount" placeholder="Amount (GHS)" value={formData.amount} onChange={handleChange} required className="w-full p-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" />
                    </div>
                    <select name="accountId" value={formData.accountId} onChange={handleChange} required className="w-full p-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200">
                        {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.bankName} - {acc.accountNumber}</option>)}
                    </select>

                    {formData.type === 'Mobile Money Deposit' && (
                        <div className="p-4 bg-light-bg rounded-lg space-y-4 border dark:bg-slate-700 dark:border-slate-600">
                            <h4 className="font-semibold text-dark-text dark:text-slate-200">Mobile Money Details</h4>
                            <select name="momoProvider" value={formData.momoProvider} onChange={handleChange} className="w-full p-2 border rounded-lg dark:bg-slate-600 dark:border-slate-500 dark:text-slate-200">
                                <option>MTN Mobile Money</option>
                                <option>Vodafone Cash</option>
                                <option>AirtelTigo Money</option>
                            </select>
                            <div className="grid grid-cols-2 gap-4">
                                <input type="tel" name="senderNumber" placeholder="Sender Phone Number" value={formData.senderNumber} onChange={handleChange} className="w-full p-2 border rounded-lg dark:bg-slate-600 dark:border-slate-500 dark:text-slate-200" />
                                <input type="text" name="momoTransactionId" placeholder="Transaction ID" value={formData.momoTransactionId} onChange={handleChange} className="w-full p-2 border rounded-lg dark:bg-slate-600 dark:border-slate-500 dark:text-slate-200" />
                            </div>
                        </div>
                    )}

                     {formData.type === 'International Transfer' && (
                        <div className="p-4 bg-light-bg rounded-lg space-y-4 border dark:bg-slate-700 dark:border-slate-600">
                            <h4 className="font-semibold text-dark-text dark:text-slate-200">International Transfer Details</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <input type="text" name="senderCountry" placeholder="Sender Country" value={formData.senderCountry} onChange={handleChange} className="w-full p-2 border rounded-lg dark:bg-slate-600 dark:border-slate-500 dark:text-slate-200" />
                                <input type="text" name="swiftCode" placeholder="SWIFT Code" value={formData.swiftCode} onChange={handleChange} className="w-full p-2 border rounded-lg dark:bg-slate-600 dark:border-slate-500 dark:text-slate-200" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <input type="number" name="originalAmount" placeholder="Original Amount" value={formData.originalAmount} onChange={handleChange} className="w-full p-2 border rounded-lg dark:bg-slate-600 dark:border-slate-500 dark:text-slate-200" />
                                <input type="text" name="originalCurrency" placeholder="Original Currency (e.g., USD)" value={formData.originalCurrency} onChange={handleChange} className="w-full p-2 border rounded-lg dark:bg-slate-600 dark:border-slate-500 dark:text-slate-200" />
                            </div>
                        </div>
                    )}
                </div>
                 <div className="mt-6 flex justify-end pt-4 border-t dark:border-slate-700">
                    <button type="submit" className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark font-semibold">Log Transaction</button>
                </div>
            </form>
        </div>
    );
};

interface BankProps {
  transactions: BankTransaction[];
  setTransactions: React.Dispatch<React.SetStateAction<BankTransaction[]>>;
}


const Bank: React.FC<BankProps> = ({ transactions, setTransactions }) => {
  const [accounts, setAccounts] = useState<BankAccount[]>(MOCK_BANK_ACCOUNTS);
  const [selectedTransaction, setSelectedTransaction] = useState<BankTransaction | null>(null);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);

  const summary = useMemo(() => {
    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentTransactions = transactions.filter(t => new Date(t.date) >= thirtyDaysAgo);

    const inflow30d = recentTransactions
        .filter(t => t.type.includes('Deposit') || t.type.includes('Transfer'))
        .reduce((sum, t) => sum + t.amount, 0);
        
    const outflow30d = recentTransactions
        .filter(t => t.type === 'Withdrawal')
        .reduce((sum, t) => sum + t.amount, 0);

    const pendingReconciliation = transactions.filter(t => t.status === 'Pending').length;

    return { totalBalance, inflow30d, outflow30d, pendingReconciliation };
  }, [accounts, transactions]);
  
  const handleReconcileSave = (transactionId: string, reconciliationId: string) => {
    setTransactions(prev => prev.map(t =>
        t.id === transactionId
            ? { ...t, status: 'Reconciled', reconciliationId }
            : t
    ));
    setSelectedTransaction(null);
  };

  const handleAddAccount = (newAccountData: Omit<BankAccount, 'id'>) => {
    const newAccount: BankAccount = {
        id: `ACC-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
        ...newAccountData,
    };
    setAccounts(prev => [...prev, newAccount]);
  };

  const handleAddTransaction = (newTransactionData: Omit<BankTransaction, 'id' | 'status'>) => {
    const newTransaction: BankTransaction = {
        id: `TXN-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
        status: 'Pending',
        ...newTransactionData,
    };
    setTransactions(prev => [newTransaction, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));

    // Update account balance
    setAccounts(prevAccounts => prevAccounts.map(acc => {
        if (acc.id === newTransaction.accountId) {
            const amountChange = newTransaction.type.includes('Deposit') || newTransaction.type === 'International Transfer' ? newTransaction.amount : -newTransaction.amount;
            return { ...acc, balance: acc.balance + amountChange };
        }
        return acc;
    }));
  };

  const statusColors: Record<ReconciliationStatus, string> = {
    'Reconciled': 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    'Pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-3xl font-bold text-dark-text dark:text-slate-200">Bank Management</h2>
        <div className="flex items-center space-x-2">
            <button onClick={() => setIsAccountModalOpen(true)} className="bg-light-bg text-dark-text px-4 py-2 rounded-lg hover:bg-gray-200 font-semibold text-sm dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600">Add Account</button>
            <button onClick={() => setIsTransactionModalOpen(true)} className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark font-semibold text-sm">New Transaction</button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Balance" value={`GH₵${summary.totalBalance.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>} />
        <StatCard title="Total Inflow (30d)" value={`GH₵${summary.inflow30d.toLocaleString('en-GH')}`} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 9l-5 5-5-5" /></svg>} />
        <StatCard title="Total Outflow (30d)" value={`GH₵${summary.outflow30d.toLocaleString('en-GH')}`} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M7 15l5-5 5 5" /></svg>} />
        <StatCard title="Pending Reconciliations" value={summary.pendingReconciliation.toString()} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-md dark:bg-slate-800 dark:border dark:border-slate-700">
            <h3 className="text-xl font-semibold text-dark-text mb-4 dark:text-slate-200">Accounts Overview</h3>
            <div className="space-y-4">
                {accounts.map(account => (
                    <div key={account.id} className="bg-light-bg p-4 rounded-lg dark:bg-slate-700">
                        <p className="font-bold text-dark-text dark:text-slate-200">{account.bankName}</p>
                        <p className="text-sm text-light-text dark:text-slate-400">{account.accountNumber}</p>
                        <p className="text-lg font-semibold text-primary mt-1">GH₵{account.balance.toLocaleString('en-GH', { minimumFractionDigits: 2 })}</p>
                    </div>
                ))}
            </div>
        </div>
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md dark:bg-slate-800 dark:border dark:border-slate-700">
            <h3 className="text-xl font-semibold text-dark-text mb-4 dark:text-slate-200">Recent Transactions</h3>
            <div className="overflow-x-auto max-h-[400px]">
                <table className="w-full text-left">
                    <thead className="bg-light-bg sticky top-0 dark:bg-slate-700">
                        <tr>
                            <th className="p-3 font-semibold text-light-text dark:text-slate-300">Date</th>
                            <th className="p-3 font-semibold text-light-text dark:text-slate-300">Description</th>
                            <th className="p-3 font-semibold text-light-text dark:text-slate-300 text-right">Amount</th>
                            <th className="p-3 font-semibold text-light-text dark:text-slate-300">Status</th>
                            <th className="p-3 font-semibold text-light-text dark:text-slate-300">Action</th>
                        </tr>
                    </thead>
                    <tbody className="dark:text-slate-400">
                        {transactions.map(t => (
                            <tr key={t.id} className="border-b dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50">
                                <td className="p-3 text-sm">{new Date(t.date).toLocaleDateString()}</td>
                                <td className="p-3 text-sm">
                                    <span className="dark:text-slate-300">{t.description}</span>
                                    {t.type === 'Mobile Money Deposit' && t.momoProvider && (
                                        <span className="block text-xs text-light-text dark:text-slate-400">From: {t.senderNumber} ({t.momoProvider})</span>
                                    )}
                                    {t.type === 'International Transfer' && (
                                        <span className="block text-xs text-light-text dark:text-slate-400">From: {t.senderCountry} ({t.originalCurrency} {t.originalAmount?.toLocaleString()})</span>
                                    )}
                                </td>
                                <td className={`p-3 text-right font-semibold ${t.type.includes('Deposit') || t.type === 'International Transfer' ? 'text-success' : 'text-accent'}`}>
                                    {t.type.includes('Deposit') || t.type === 'International Transfer' ? '+' : '-'}GH₵{t.amount.toFixed(2)}
                                </td>
                                <td className="p-3">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[t.status]}`}>{t.status}</span>
                                </td>
                                <td className="p-3">
                                    {t.status === 'Pending' && (
                                        <button onClick={() => setSelectedTransaction(t)} className="text-primary hover:underline text-sm font-medium">Reconcile</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      </div>

       {selectedTransaction && (
            <ReconcileModal 
                isOpen={!!selectedTransaction}
                onClose={() => setSelectedTransaction(null)}
                transaction={selectedTransaction}
                onSave={handleReconcileSave}
            />
       )}
       <AddAccountModal isOpen={isAccountModalOpen} onClose={() => setIsAccountModalOpen(false)} onSave={handleAddAccount} />
       <NewTransactionModal isOpen={isTransactionModalOpen} onClose={() => setIsTransactionModalOpen(false)} onSave={handleAddTransaction} accounts={accounts} />
    </div>
  );
};

export default Bank;
