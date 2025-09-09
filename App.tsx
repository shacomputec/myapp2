import React, { useState, useCallback } from 'react';
import { Page, Permission } from './types';
import type { Patient, LabOrder, Prescription, RadiologyOrder, NHISClaim, CardiologyOrder, Surgery as SurgeryType, BillableItem, Invoice, InvoiceStatus, BankTransaction, ICUBed, TherapySession, RoboticSurgeryProcedure, GenomicSample, DischargeSummary, NotificationLink, MentalHealthSession, Notification, VideoGenerationJob, SystemMode } from './types';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import PatientList from './components/PatientList';
import { PatientDetail } from './components/PatientDetail';
import PatientRegistration from './components/PatientRegistration';
import ForeignerRegistration from './components/ForeignerRegistration';
import AIAssistant from './components/AIAssistant';
import Telemedicine from './components/Telemedicine';
import Laboratory from './components/Laboratory';
import Pharmacy from './components/Pharmacy';
import Billing from './components/Billing';
import Inventory from './components/Inventory';
import BedManagement from './components/BedManagement';
import Appointments from './components/Appointments';
import Reports from './components/Reports';
import Staff from './components/Staff';
import Settings from './components/Settings';
import Bank from './components/Bank';
import Surgery from './components/Surgery';
import Maternity from './components/Maternity';
import Pediatrics from './components/Pediatrics';
import Emergency from './components/Emergency';
import Logistics from './components/Logistics';
import Canteen from './components/Canteen';
import Mortuary from './components/Mortuary';
import BloodBank from './components/BloodBank';
import HumanResources from './components/HumanResources';
import UserManagement from './components/UserManagement';
import NHISClaims from './components/NHISClaims';
import Radiology from './components/Radiology';
import Oncology from './components/Oncology';
import Cardiology from './components/Cardiology';
import OPD from './components/OPD';
import ICU from './components/ICU';
import Physiotherapy from './components/Physiotherapy';
import RoboticSurgery from './components/RoboticSurgery';
import VideoGeneration from './components/VideoGeneration';
import Genomics from './components/Genomics';
import DrugInteraction from './components/DrugInteraction';
import MentalHealth from './components/MentalHealth';
import About from './components/About';
import AccessDenied from './components/AccessDenied';
import Login from './components/Login';
import { MOCK_PATIENTS, MOCK_LAB_ORDERS, MOCK_PRESCRIPTIONS, MOCK_RADIOLOGY_ORDERS, MOCK_NHIS_CLAIMS, MOCK_CARDIOLOGY_ORDERS, MOCK_SURGERIES, MOCK_INVOICES, MOCK_BILLABLE_ITEMS, SERVICE_PRICES, MOCK_MEDICATIONS, MOCK_BANK_TRANSACTIONS, MOCK_ICU_BEDS, MOCK_THERAPY_SESSIONS, MOCK_ROBOTIC_SURGERIES, MOCK_GENOMIC_SAMPLES, MOCK_MENTAL_HEALTH_SESSIONS, MOCK_VIDEO_JOBS } from './constants';
import { LanguageProvider } from './services/localization';
import { AuthProvider, useAuth } from './services/auth';
import { ThemeProvider } from './services/theme';
import { NotificationProvider, useNotifications } from './services/notifications';
import { SystemProvider, useSystem } from './services/system';

const PAGE_PERMISSIONS: Partial<Record<Page, Permission | null>> = {
  [Page.Dashboard]: null,
  [Page.Patients]: 'patient:read',
  [Page.PatientRegistration]: 'patient:register',
  [Page.ForeignerRegistration]: 'patient:register',
  [Page.Appointments]: 'patient:read',
  [Page.Telemedicine]: 'clinical:telemedicine',
  [Page.Laboratory]: 'clinical:laboratory',
  [Page.Radiology]: 'clinical:radiology',
  [Page.Pharmacy]: 'clinical:pharmacy',
  [Page.Surgery]: 'clinical:surgery',
  [Page.Maternity]: 'clinical:maternity',
  [Page.Pediatrics]: 'clinical:pediatrics',
  [Page.Emergency]: 'clinical:emergency',
  [Page.Oncology]: 'clinical:oncology',
  [Page.Cardiology]: 'clinical:cardiology',
  [Page.OPD]: 'clinical:opd',
  [Page.ICU]: 'clinical:icu',
  [Page.Physiotherapy]: 'clinical:physiotherapy',
  [Page.MentalHealth]: 'clinical:mental_health',
  [Page.AIAssistant]: 'admin:ai_assistant',
  [Page.Billing]: 'finance:billing',
  [Page.Bank]: 'finance:bank',
  [Page.Inventory]: 'operations:inventory',
  [Page.BedManagement]: 'operations:bed_management',
  [Page.Logistics]: 'operations:logistics',
  [Page.Canteen]: 'operations:canteen',
  [Page.Mortuary]: 'operations:mortuary',
  [Page.BloodBank]: 'clinical:blood_bank',
  [Page.Staff]: 'admin:staff',
  [Page.HumanResources]: 'admin:hr',
  [Page.UserManagement]: 'admin:users',
  [Page.Reports]: 'admin:reports',
  [Page.Settings]: 'admin:settings',
  [Page.NHISClaims]: 'finance:nhis',
  [Page.RoboticSurgery]: 'developer:robotic_surgery',
  [Page.VideoGeneration]: 'developer:video_generation',
  [Page.Genomics]: 'developer:genomics',
  [Page.DrugInteraction]: 'developer:drug_interaction',
  [Page.About]: null,
};


const AppContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(Page.Dashboard);
  const [patients, setPatients] = useState<Patient[]>(MOCK_PATIENTS);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [labOrders, setLabOrders] = useState<LabOrder[]>(MOCK_LAB_ORDERS);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(MOCK_PRESCRIPTIONS);
  const [radiologyOrders, setRadiologyOrders] = useState<RadiologyOrder[]>(MOCK_RADIOLOGY_ORDERS);
  const [cardiologyOrders, setCardiologyOrders] = useState<CardiologyOrder[]>(MOCK_CARDIOLOGY_ORDERS);
  const [surgeries, setSurgeries] = useState<SurgeryType[]>(MOCK_SURGERIES);
  const [nhisClaims, setNhisClaims] = useState<NHISClaim[]>(MOCK_NHIS_CLAIMS);
  const [invoices, setInvoices] = useState<Invoice[]>(MOCK_INVOICES);
  const [billableItems, setBillableItems] = useState<BillableItem[]>(MOCK_BILLABLE_ITEMS);
  const [bankTransactions, setBankTransactions] = useState<BankTransaction[]>(MOCK_BANK_TRANSACTIONS);
  const [icuBeds, setIcuBeds] = useState<ICUBed[]>(MOCK_ICU_BEDS);
  const [therapySessions, setTherapySessions] = useState<TherapySession[]>(MOCK_THERAPY_SESSIONS);
  const [roboticSurgeries, setRoboticSurgeries] = useState<RoboticSurgeryProcedure[]>(MOCK_ROBOTIC_SURGERIES);
  const [videoJobs, setVideoJobs] = useState<VideoGenerationJob[]>(MOCK_VIDEO_JOBS);
  const [genomicSamples, setGenomicSamples] = useState<GenomicSample[]>(MOCK_GENOMIC_SAMPLES);
  const [mentalHealthSessions, setMentalHealthSessions] = useState<MentalHealthSession[]>(MOCK_MENTAL_HEALTH_SESSIONS);
  const { hasPermission, currentUser } = useAuth();
  const { addNotification } = useNotifications();
  const { isSystemLocked, systemMode } = useSystem();

  const handleSelectPatient = useCallback((patient: Patient) => {
    setSelectedPatient(patient);
    setCurrentPage(Page.PatientDetail);
  }, []);

  const handleUpdatePatient = useCallback((updatedPatient: Patient) => {
    if (isSystemLocked) return;
    setPatients(prevPatients =>
      prevPatients.map(p => (p.id === updatedPatient.id ? updatedPatient : p))
    );
    if (selectedPatient && selectedPatient.id === updatedPatient.id) {
        setSelectedPatient(updatedPatient);
    }
  }, [selectedPatient, isSystemLocked]);

  const handleAddPatient = useCallback((patientData: Omit<Patient, 'id' | 'avatarUrl' | 'lastVisit' | 'medicalHistory' | 'appointments' | 'vitals' | 'dischargeSummaries'>) => {
    if (isSystemLocked) return;
    const newPatient: Patient = {
      ...patientData,
      id: patientData.patientType === 'National' ? `P${(Math.random() * 1000).toFixed(0).padStart(3, '0')}` : `FN-${(Math.random() * 100).toFixed(0).padStart(3, '0')}`,
      avatarUrl: `https://picsum.photos/seed/${Math.random()}/100/100`,
      lastVisit: new Date().toISOString().split('T')[0],
      medicalHistory: [],
      appointments: [],
      vitals: [],
      dischargeSummaries: [],
    };
    setPatients(prev => [newPatient, ...prev]);
    // Navigate to the new patient's detail page after a short delay
    setTimeout(() => {
        handleSelectPatient(newPatient);
    }, 500);
  }, [handleSelectPatient, isSystemLocked]);

  const handleAddDischargeSummary = useCallback((patientId: string, summary: string) => {
    if (isSystemLocked) return;
    const patient = patients.find(p => p.id === patientId);
    if (!patient) return;

    const newSummary: DischargeSummary = {
        date: new Date().toISOString().split('T')[0],
        doctor: currentUser?.name || 'Dr. System',
        summary: summary,
    };
    
    const updatedPatient: Patient = {
        ...patient,
        dischargeSummaries: [...(patient.dischargeSummaries || []), newSummary],
    };

    handleUpdatePatient(updatedPatient);
  }, [patients, handleUpdatePatient, currentUser, isSystemLocked]);

  const handleAddBillableItem = useCallback((itemData: Omit<BillableItem, 'id' | 'patientName' | 'status' | 'date'>) => {
    if (isSystemLocked) return;
    const patient = patients.find(p => p.id === itemData.patientId);
    if (!patient) return;
  
    const date = new Date().toISOString().split('T')[0];
  
    setBillableItems(prevItems => {
      const exists = prevItems.some(item =>
        item.patientId === itemData.patientId &&
        item.description === itemData.description &&
        item.date === date
      );
  
      if (exists) {
        console.log("Billable item already exists for this service today.");
        return prevItems;
      }
  
      const newItem: BillableItem = {
        id: `BILL-${Math.random().toString(36).substr(2, 7).toUpperCase()}`,
        patientName: patient.name,
        date,
        status: 'Unbilled',
        ...itemData
      };
      return [newItem, ...prevItems];
    });
  }, [patients, isSystemLocked]);

  const handleAddLabOrder = useCallback((orderData: Omit<LabOrder, 'id' | 'patientName' | 'orderDate' | 'status'>) => {
    if (isSystemLocked) return;
    const patient = patients.find(p => p.id === orderData.patientId);
    if (!patient) return;

    const newOrder: LabOrder = {
        ...orderData,
        id: `LAB-${(Math.random() * 1000).toFixed(0).padStart(3, '0')}`,
        patientName: patient.name,
        orderDate: new Date().toISOString().split('T')[0],
        status: 'Pending',
    };
    setLabOrders(prev => [newOrder, ...prev]);
  }, [patients, isSystemLocked]);
  
  const handleAddRadiologyOrder = useCallback((orderData: Omit<RadiologyOrder, 'id' | 'patientName' | 'orderDate' | 'status'>) => {
    if (isSystemLocked) return;
    const patient = patients.find(p => p.id === orderData.patientId);
    if (!patient) return;

    const newOrder: RadiologyOrder = {
        ...orderData,
        id: `RAD-${(Math.random() * 1000).toFixed(0).padStart(3, '0')}`,
        patientName: patient.name,
        orderDate: new Date().toISOString().split('T')[0],
        status: 'Pending',
    };
    setRadiologyOrders(prev => [newOrder, ...prev]);
  }, [patients, isSystemLocked]);
  
  const handleAddCardiologyOrder = useCallback((orderData: Omit<CardiologyOrder, 'id' | 'patientName' | 'orderDate' | 'status'>) => {
    if (isSystemLocked) return;
    const patient = patients.find(p => p.id === orderData.patientId);
    if (!patient) return;

    const newOrder: CardiologyOrder = {
        ...orderData,
        id: `CARD-${(Math.random() * 1000).toFixed(0).padStart(3, '0')}`,
        patientName: patient.name,
        orderDate: new Date().toISOString().split('T')[0],
        status: 'Pending',
    };
    setCardiologyOrders(prev => [newOrder, ...prev]);
  }, [patients, isSystemLocked]);


  const handleAddPrescription = useCallback((prescriptionData: Omit<Prescription, 'id' | 'patientName' | 'doctor' | 'date' | 'status'>) => {
      if (isSystemLocked) return;
      const patient = patients.find(p => p.id === prescriptionData.patientId);
      if (!patient) return;

      const newPrescription: Prescription = {
          ...prescriptionData,
          id: `RX-${(Math.random() * 1000).toFixed(0).padStart(3, '0')}`,
          patientName: patient.name,
          doctor: 'Dr. Evelyn Adjei', // Mocked logged-in doctor
          date: new Date().toISOString().split('T')[0],
          status: 'Pending',
      };
      setPrescriptions(prev => [newPrescription, ...prev]);
  }, [patients, isSystemLocked]);

  const handleAddSurgery = useCallback((surgeryData: Omit<SurgeryType, 'id' | 'status' | 'preOpChecklist'>) => {
    if (isSystemLocked) return;
    const newSurgery: SurgeryType = {
        ...surgeryData,
        id: `SURG-${(Math.random() * 1000).toFixed(0).padStart(3, '0')}`,
        status: 'Scheduled',
        preOpChecklist: [
            { id: 'c1', text: 'Patient Consent Signed', completed: false },
            { id: 'c2', text: 'Pre-op Vitals Recorded', completed: false },
            { id: 'c3', text: 'Fasting Confirmed', completed: false },
            { id: 'c4', text: 'Anesthesia Consult Done', completed: false },
        ]
    };
    setSurgeries(prev => [newSurgery, ...prev]);
  }, [isSystemLocked]);

  const handleUpdateSurgery = useCallback((updatedSurgery: SurgeryType) => {
    if (isSystemLocked) return;
    const previousSurgery = surgeries.find(s => s.id === updatedSurgery.id);
    setSurgeries(prev => prev.map(s => s.id === updatedSurgery.id ? updatedSurgery : s));

    if (updatedSurgery.status === 'Completed' && previousSurgery?.status !== 'Completed') {
        const price = (SERVICE_PRICES.surgery as any)[updatedSurgery.procedure] || 5000;
        handleAddBillableItem({
            patientId: updatedSurgery.patientId,
            description: `Surgery: ${updatedSurgery.procedure}`,
            amount: price,
        });
    }
  }, [surgeries, handleAddBillableItem, isSystemLocked]);

  const handleAddRoboticSurgery = useCallback((surgeryData: Omit<RoboticSurgeryProcedure, 'id'>) => {
    if (isSystemLocked) return;
    const newSurgery: RoboticSurgeryProcedure = {
        ...surgeryData,
        id: `ROBO-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
    };
    setRoboticSurgeries(prev => [newSurgery, ...prev]);
  }, [isSystemLocked]);

    const handleAddVideoJob = useCallback((job: VideoGenerationJob) => {
        if (isSystemLocked) return;
        setVideoJobs(prev => [job, ...prev]);
    }, [isSystemLocked]);

    const handleUpdateVideoJob = useCallback((updatedJob: VideoGenerationJob) => {
        if (isSystemLocked) return;
        setVideoJobs(prev => prev.map(j => (j.id === updatedJob.id ? updatedJob : j)));
    }, [isSystemLocked]);
  
  const handleGenerateInvoice = useCallback((patient: Patient, itemsToBill: BillableItem[]) => {
    if (isSystemLocked) return;
    const newInvoice: Invoice = {
        id: `INV-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
        patientId: patient.id,
        patientName: patient.name,
        date: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0], // 30 days from now
        totalAmount: itemsToBill.reduce((sum, item) => sum + item.amount, 0),
        status: 'Pending',
        items: itemsToBill.map((item, index) => ({
            id: `I-${Date.now()}-${index}`,
            description: item.description,
            quantity: 1, // For simplicity, all billable items are quantity 1
            unitPrice: item.amount,
            total: item.amount,
        })),
    };
    setInvoices(prev => [newInvoice, ...prev]);

    const billedItemIds = new Set(itemsToBill.map(item => item.id));
    setBillableItems(prev => prev.map(item => 
        billedItemIds.has(item.id) ? { ...item, status: 'Billed' } : item
    ));
}, [isSystemLocked]);

const handleUpdateInvoiceStatus = useCallback((invoiceId: string, status: InvoiceStatus) => {
    if (isSystemLocked) return;
    setInvoices(prev => prev.map(inv => inv.id === invoiceId ? { ...inv, status } : inv));
}, [isSystemLocked]);

const handleAddTransaction = useCallback((transactionData: Omit<BankTransaction, 'id' | 'status'>) => {
    if (isSystemLocked) return;
    const newTransaction: BankTransaction = {
        id: `TXN-${Math.random().toString(36).substr(2, 7).toUpperCase()}`,
        status: 'Pending', // All new transactions need reconciliation
        ...transactionData,
    };
    setBankTransactions(prev => [newTransaction, ...prev]);
}, [isSystemLocked]);

const handleNotificationClick = useCallback((link: NotificationLink) => {
    if (link.page === Page.MentalHealth && link.patientId) {
        const patient = patients.find(p => p.id === link.patientId);
        if (patient) {
            setCurrentPage(Page.MentalHealth);
            // This is a bit of a hack for the MentalHealth component to know which patient to show.
            // A better solution would be a global state or routing.
            setTimeout(() => setSelectedPatient(patient), 0);
            return;
        }
    }
    if (link.patientId) {
        const patient = patients.find(p => p.id === link.patientId);
        if (patient) {
            handleSelectPatient(patient); // this also sets currentPage to PatientDetail
            return;
        }
    }
    // If there's no patient or patient not found, just navigate to the page
    setCurrentPage(link.page);
  }, [patients, handleSelectPatient]);

  const wrappedSetLabOrders = useCallback((updater: React.SetStateAction<LabOrder[]>) => {
    if (isSystemLocked) return;
    setLabOrders(updater);
  }, [isSystemLocked]);

  const wrappedSetRadiologyOrders = useCallback((updater: React.SetStateAction<RadiologyOrder[]>) => {
    if (isSystemLocked) return;
    setRadiologyOrders(updater);
  }, [isSystemLocked]);

  const wrappedSetCardiologyOrders = useCallback((updater: React.SetStateAction<CardiologyOrder[]>) => {
    if (isSystemLocked) return;
    setCardiologyOrders(updater);
  }, [isSystemLocked]);

  const wrappedSetPrescriptions = useCallback((updater: React.SetStateAction<Prescription[]>) => {
    if (isSystemLocked) return;
    setPrescriptions(updater);
  }, [isSystemLocked]);
  
  const wrappedSetNhisClaims = useCallback((updater: React.SetStateAction<NHISClaim[]>) => {
    if (isSystemLocked) return;
    setNhisClaims(updater);
  }, [isSystemLocked]);
  
  const wrappedSetBankTransactions = useCallback((updater: React.SetStateAction<BankTransaction[]>) => {
    if (isSystemLocked) return;
    setBankTransactions(updater);
  }, [isSystemLocked]);
  
  const wrappedSetIcuBeds = useCallback((updater: React.SetStateAction<ICUBed[]>) => {
    if (isSystemLocked) return;
    setIcuBeds(updater);
  }, [isSystemLocked]);
  
  const wrappedSetTherapySessions = useCallback((updater: React.SetStateAction<TherapySession[]>) => {
    if (isSystemLocked) return;
    setTherapySessions(updater);
  }, [isSystemLocked]);

  const wrappedSetGenomicSamples = useCallback((updater: React.SetStateAction<GenomicSample[]>) => {
    if (isSystemLocked) return;
    setGenomicSamples(updater);
  }, [isSystemLocked]);


  const renderPage = () => {
    const requiredPermission = PAGE_PERMISSIONS[currentPage];
    if (requiredPermission && !hasPermission(requiredPermission)) {
        // If user lands on a page they don't have access to (e.g. after role switch)
        // show access denied. The sidebar already prevents navigation.
        return <AccessDenied />;
    }

    if (selectedPatient && currentPage === Page.PatientDetail) {
      if (!hasPermission('patient:read')) return <AccessDenied />;
      return <PatientDetail 
          patient={selectedPatient} 
          onUpdatePatient={handleUpdatePatient}
          labOrders={labOrders}
          prescriptions={prescriptions}
          radiologyOrders={radiologyOrders}
          cardiologyOrders={cardiologyOrders}
          onAddLabOrder={handleAddLabOrder}
          onAddPrescription={handleAddPrescription}
          onAddRadiologyOrder={handleAddRadiologyOrder}
          onAddCardiologyOrder={handleAddCardiologyOrder}
          onAddDischargeSummary={handleAddDischargeSummary}
        />;
    }

    switch (currentPage) {
      case Page.Dashboard:
        return <Dashboard onSelectPatient={handleSelectPatient} patients={patients} labOrders={labOrders} />;
      case Page.Patients:
        return <PatientList patients={patients} onSelectPatient={handleSelectPatient} />;
      case Page.PatientRegistration:
        return <PatientRegistration onAddPatient={handleAddPatient} />;
      case Page.ForeignerRegistration:
        return <ForeignerRegistration onAddPatient={handleAddPatient} />;
        case Page.Appointments:
        return <Appointments onSelectPatient={handleSelectPatient} />;
      case Page.Telemedicine:
        return <Telemedicine onSelectPatient={handleSelectPatient} patients={patients} onUpdatePatient={handleUpdatePatient} />;
      case Page.Laboratory:
        return <Laboratory onSelectPatient={handleSelectPatient} labOrders={labOrders} setLabOrders={wrappedSetLabOrders} onAddBillableItem={handleAddBillableItem} />;
      case Page.Radiology:
        return <Radiology onSelectPatient={handleSelectPatient} radiologyOrders={radiologyOrders} setRadiologyOrders={wrappedSetRadiologyOrders} />;
      case Page.Oncology:
        return <Oncology patients={patients} onSelectPatient={handleSelectPatient} onUpdatePatient={handleUpdatePatient} />;
      case Page.Cardiology:
        return <Cardiology onSelectPatient={handleSelectPatient} cardiologyOrders={cardiologyOrders} setCardiologyOrders={wrappedSetCardiologyOrders} />;
      case Page.Pharmacy:
        return <Pharmacy onSelectPatient={handleSelectPatient} prescriptions={prescriptions} setPrescriptions={wrappedSetPrescriptions} onAddBillableItem={handleAddBillableItem} />;
      case Page.DrugInteraction:
        return <DrugInteraction />;
      case Page.Surgery:
        return <Surgery surgeries={surgeries} onAddSurgery={handleAddSurgery} onUpdateSurgery={handleUpdateSurgery} />;
      case Page.RoboticSurgery:
          return <RoboticSurgery roboticSurgeries={roboticSurgeries} onAddRoboticSurgery={handleAddRoboticSurgery} />;
      case Page.VideoGeneration:
          return <VideoGeneration jobs={videoJobs} onAddJob={handleAddVideoJob} onUpdateJob={handleUpdateVideoJob} />;
      case Page.Genomics:
          return <Genomics genomicSamples={genomicSamples} setGenomicSamples={wrappedSetGenomicSamples} />;
      case Page.Maternity:
          return <Maternity onSelectPatient={handleSelectPatient}/>;
      case Page.Pediatrics:
          return <Pediatrics onSelectPatient={handleSelectPatient} />;
      case Page.Emergency:
          return <Emergency onSelectPatient={handleSelectPatient} />;
      case Page.OPD:
          return <OPD patients={patients} onSelectPatient={handleSelectPatient} />;
      case Page.ICU:
          return <ICU icuBeds={icuBeds} setIcuBeds={wrappedSetIcuBeds} onSelectPatient={handleSelectPatient} />;
      case Page.Physiotherapy:
          return <Physiotherapy therapySessions={therapySessions} setTherapySessions={wrappedSetTherapySessions} onSelectPatient={handleSelectPatient} />;
      case Page.MentalHealth:
        return <MentalHealth patients={patients} selectedPatient={selectedPatient} onSelectPatient={setSelectedPatient} onUpdatePatient={handleUpdatePatient} addNotification={addNotification} />;
      case Page.AIAssistant:
        return <AIAssistant />;
      case Page.Billing:
        return <Billing invoices={invoices} billableItems={billableItems} patients={patients} onGenerateInvoice={handleGenerateInvoice} onUpdateInvoiceStatus={handleUpdateInvoiceStatus} onAddTransaction={handleAddTransaction} />;
      case Page.Bank:
        return <Bank transactions={bankTransactions} setTransactions={wrappedSetBankTransactions} />;
      case Page.Inventory:
        return <Inventory />;
      case Page.BedManagement:
        return <BedManagement onSelectPatient={handleSelectPatient} patients={patients} />;
      case Page.Logistics:
        return <Logistics />;
      case Page.Canteen:
        return <Canteen />;
      case Page.Mortuary:
        return <Mortuary />;
      case Page.BloodBank:
        return <BloodBank onSelectPatient={handleSelectPatient} />;
      case Page.Staff:
        return <Staff />;
      case Page.HumanResources:
        return <HumanResources />;
      case Page.UserManagement:
        return <UserManagement />;
      case Page.Reports:
        return <Reports />;
      case Page.Settings:
        return <Settings />;
      case Page.NHISClaims:
        return <NHISClaims claims={nhisClaims} setClaims={wrappedSetNhisClaims} />;
      case Page.About:
        return <About />;
      default:
        return <Dashboard onSelectPatient={handleSelectPatient} patients={patients} labOrders={labOrders} />;
    }
  };

  if (!currentUser) {
    return <Login />;
  }

  return (
    <div className="flex h-screen bg-light-bg dark:bg-slate-900">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <div className="flex-1 flex flex-col overflow-hidden">
        {systemMode === 'demo' && (
            <div className="bg-secondary text-primary-dark text-center py-1 text-sm font-bold z-50 shadow-md">
                DEMO MODE
            </div>
        )}
        <Header onNotificationClick={handleNotificationClick} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-light-bg p-8 dark:bg-slate-900 relative">
          {isSystemLocked && currentPage !== Page.Settings && (
              <div className="absolute inset-0 bg-gray-100 bg-opacity-80 dark:bg-slate-900 dark:bg-opacity-80 z-40 flex flex-col items-center justify-center text-center p-4" role="alert" aria-busy="true">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-accent mb-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                  </svg>
                  <h2 className="text-2xl font-bold text-dark-text dark:text-slate-200">System Locked</h2>
                  <p className="text-light-text dark:text-slate-400 mt-2">The system is currently in read-only mode. Please contact an administrator to make changes.</p>
              </div>
          )}
          {renderPage()}
        </main>
      </div>
    </div>
  );
};

const App: React.FC = () => (
  <ThemeProvider>
    <LanguageProvider>
      <AuthProvider>
        <SystemProvider>
          <NotificationProvider>
              <AppContent />
          </NotificationProvider>
        </SystemProvider>
      </AuthProvider>
    </LanguageProvider>
  </ThemeProvider>
);


export default App;