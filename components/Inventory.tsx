import React, { useState, useMemo, useEffect } from 'react';
import { MOCK_INVENTORY_ITEMS, MOCK_PRESCRIPTIONS, MOCK_SUPPLIERS, MOCK_PURCHASE_ORDERS } from '../constants';
import type { InventoryItem, InventoryCategory, ReorderSuggestion, Supplier, PurchaseOrder, PurchaseOrderStatus, PurchaseOrderItem } from '../types';
import { getInventoryReorderSuggestion } from '../services/geminiService';

type StockStatus = 'In Stock' | 'Low Stock' | 'Out of Stock';

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

const ReorderSuggestionModal: React.FC<{ 
    isOpen: boolean; 
    onClose: () => void; 
    suggestions: ReorderSuggestion[]; 
    isLoading: boolean;
    onCreatePO: (suggestions: ReorderSuggestion[]) => void;
}> = ({ isOpen, onClose, suggestions, isLoading, onCreatePO }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl p-8 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <h3 className="text-2xl font-bold text-dark-text mb-4">AI-Powered Reorder Suggestions</h3>
                {isLoading ? (
                    <div className="text-center p-12">
                         <svg className="animate-spin mx-auto h-10 w-10 text-primary mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="text-light-text">Analyzing inventory and consumption data...</p>
                    </div>
                ) : suggestions.length > 0 ? (
                    <div className="max-h-[60vh] overflow-y-auto">
                        <table className="w-full text-left">
                            <thead className="bg-light-bg sticky top-0">
                                <tr>
                                    <th className="p-3 font-semibold text-light-text">Item</th>
                                    <th className="p-3 font-semibold text-light-text">Current/Reorder</th>
                                    <th className="p-3 font-semibold text-light-text">Suggested Qty</th>
                                    <th className="p-3 font-semibold text-light-text">Reasoning</th>
                                </tr>
                            </thead>
                            <tbody>
                                {suggestions.map(s => (
                                    <tr key={s.itemId} className="border-b hover:bg-gray-50">
                                        <td className="p-3 font-medium text-dark-text">{s.itemName}</td>
                                        <td className="p-3">{s.currentQuantity} / {s.reorderLevel}</td>
                                        <td className="p-3 font-bold text-primary">{s.suggestedQuantity}</td>
                                        <td className="p-3 text-sm text-light-text italic">"{s.reasoning}"</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center p-12">
                        <p className="text-light-text">No items require reordering at this time. All stock levels are sufficient.</p>
                    </div>
                )}
                <div className="mt-6 flex justify-end space-x-3">
                    <button onClick={onClose} className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 font-semibold">Close</button>
                    {suggestions.length > 0 && <button onClick={() => onCreatePO(suggestions)} className="bg-success text-white px-6 py-2 rounded-lg hover:bg-green-700 font-semibold">Create Purchase Order</button>}
                </div>
            </div>
        </div>
    );
};


const Inventory: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'Stock' | 'Suppliers' | 'POs'>('Stock');
    const [inventory, setInventory] = useState<InventoryItem[]>(MOCK_INVENTORY_ITEMS);
    const [suppliers, setSuppliers] = useState<Supplier[]>(MOCK_SUPPLIERS);
    const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(MOCK_PURCHASE_ORDERS);
    
    const [searchTerm, setSearchTerm] = useState('');
    const [isReorderModalOpen, setIsReorderModalOpen] = useState(false);
    const [isGeneratingSuggestion, setIsGeneratingSuggestion] = useState(false);
    const [reorderSuggestions, setReorderSuggestions] = useState<ReorderSuggestion[]>([]);
 
    const inventorySummary = useMemo(() => {
      const lowStock = inventory.filter(i => i.quantity <= i.reorderLevel && i.quantity > 0).length;
      const outOfStock = inventory.filter(i => i.quantity === 0).length;
      return { total: inventory.length, lowStock, outOfStock };
    }, [inventory]);

    const handleGenerateSuggestion = async () => {
      setIsGeneratingSuggestion(true);
      setIsReorderModalOpen(true);
      setReorderSuggestions([]);

      try {
          const inventoryData = JSON.stringify(inventory.map(i => ({ id: i.id, name: i.name, quantity: i.quantity, reorderLevel: i.reorderLevel, supplier: i.supplier, category: i.category })));
          const consumptionData = JSON.stringify(MOCK_PRESCRIPTIONS.filter(p => p.status === 'Dispensed').flatMap(p => p.items));
          const suggestions = await getInventoryReorderSuggestion(inventoryData, consumptionData);
          setReorderSuggestions(suggestions);
      } catch (error) {
          console.error(error);
          alert((error as Error).message);
          setIsReorderModalOpen(false);
      } finally {
          setIsGeneratingSuggestion(false);
      }
    };
    
    const handleCreatePOFromSuggestion = (suggestions: ReorderSuggestion[]) => {
        // This is a placeholder for a more complex implementation
        // For now, it will just log the action
        console.log("Creating PO from suggestions:", suggestions);
        alert("Functionality to create PO from suggestions would be implemented here.");
        setIsReorderModalOpen(false);
    };

    const getStatus = (item: InventoryItem): StockStatus => {
        if (item.quantity === 0) return 'Out of Stock';
        if (item.quantity <= item.reorderLevel) return 'Low Stock';
        return 'In Stock';
    };

    const statusColors: { [key in StockStatus]: string } = {
        'In Stock': 'bg-green-100 text-green-800',
        'Low Stock': 'bg-yellow-100 text-yellow-800',
        'Out of Stock': 'bg-red-100 text-red-800',
    };

    const poStatusColors: { [key in PurchaseOrderStatus]: string } = {
        'Draft': 'bg-gray-100 text-gray-800',
        'Sent': 'bg-blue-100 text-blue-800',
        'Partially Fulfilled': 'bg-yellow-100 text-yellow-800',
        'Fulfilled': 'bg-green-100 text-green-800',
        'Cancelled': 'bg-red-100 text-red-800',
    };


    const renderContent = () => {
        switch(activeTab) {
            case 'Stock':
                return (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className="bg-light-bg">
                          <tr>
                            <th className="p-3 font-semibold text-light-text">Item ID</th>
                            <th className="p-3 font-semibold text-light-text">Name</th>
                            <th className="p-3 font-semibold text-light-text">Category</th>
                            <th className="p-3 font-semibold text-light-text">Quantity</th>
                            <th className="p-3 font-semibold text-light-text">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {inventory.map((item) => {
                            const status = getStatus(item);
                            return (
                              <tr key={item.id} className="border-b hover:bg-gray-50">
                                <td className="p-3 font-medium text-primary">{item.id}</td>
                                <td className="p-3 font-medium text-dark-text">{item.name}</td>
                                <td className="p-3">{item.category}</td>
                                <td className="p-3 font-semibold">{item.quantity} {item.unit}</td>
                                <td className="p-3">
                                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[status]}`}>{status}</span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                );
            case 'Suppliers':
                return (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className="bg-light-bg">
                          <tr>
                            <th className="p-3 font-semibold text-light-text">Supplier Name</th>
                            <th className="p-3 font-semibold text-light-text">Contact Person</th>
                            <th className="p-3 font-semibold text-light-text">Phone</th>
                            <th className="p-3 font-semibold text-light-text">Email</th>
                          </tr>
                        </thead>
                        <tbody>
                          {suppliers.map((s) => (
                              <tr key={s.id} className="border-b hover:bg-gray-50">
                                <td className="p-3 font-medium text-dark-text">{s.name}</td>
                                <td className="p-3">{s.contactPerson}</td>
                                <td className="p-3">{s.phone}</td>
                                <td className="p-3 text-primary hover:underline cursor-pointer">{s.email}</td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                );
            case 'POs':
                return (
                     <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className="bg-light-bg">
                          <tr>
                            <th className="p-3 font-semibold text-light-text">PO ID</th>
                            <th className="p-3 font-semibold text-light-text">Supplier</th>
                            <th className="p-3 font-semibold text-light-text">Order Date</th>
                            <th className="p-3 font-semibold text-light-text">Total Cost</th>
                            <th className="p-3 font-semibold text-light-text">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {purchaseOrders.map((po) => (
                              <tr key={po.id} className="border-b hover:bg-gray-50">
                                <td className="p-3 font-medium text-primary">{po.id}</td>
                                <td className="p-3 font-medium text-dark-text">{po.supplierName}</td>
                                <td className="p-3">{po.orderDate}</td>
                                <td className="p-3">GH₵{po.totalCost.toFixed(2)}</td>
                                <td className="p-3">
                                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${poStatusColors[po.status]}`}>{po.status}</span>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                );
            default: return null;
        }
    }


  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-3xl font-bold text-dark-text">Inventory & Procurement</h2>
         <div className="flex items-center space-x-2">
            <button onClick={() => alert("Add new PO modal would open here")} className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors font-semibold text-sm flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                Create Purchase Order
            </button>
            <button onClick={handleGenerateSuggestion} disabled={isGeneratingSuggestion} className="bg-secondary text-primary-dark px-4 py-2 rounded-lg hover:bg-yellow-400 transition-colors font-semibold text-sm flex items-center disabled:bg-gray-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                {isGeneratingSuggestion ? 'Analyzing...' : 'Generate Reorder Suggestion'}
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Unique Items" value={inventorySummary.total.toString()} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" /></svg>} />
        <StatCard title="Low Stock Items" value={inventorySummary.lowStock.toString()} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>} />
        <StatCard title="Out of Stock" value={inventorySummary.outOfStock.toString()} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>} />
      </div>

      <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="border-b mb-4">
            <nav className="flex space-x-4">
                {(['Stock', 'Suppliers', 'POs'] as const).map(tab => (
                    <button 
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-3 py-2 font-medium text-sm rounded-t-lg ${activeTab === tab ? 'border-b-2 border-primary text-primary' : 'text-light-text hover:text-dark-text'}`}
                    >
                        {tab === 'Stock' ? 'Current Stock' : tab === 'POs' ? 'Purchase Orders' : tab}
                    </button>
                ))}
            </nav>
        </div>
        
        {renderContent()}
      </div>

      <ReorderSuggestionModal isOpen={isReorderModalOpen} onClose={() => setIsReorderModalOpen(false)} suggestions={reorderSuggestions} isLoading={isGeneratingSuggestion} onCreatePO={handleCreatePOFromSuggestion} />
    </div>
  );
};

export default Inventory;
