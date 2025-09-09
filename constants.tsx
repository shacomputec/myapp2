import React from 'react';
import type { Patient, Invoice, LabOrder, Medication, Prescription, InventoryItem, StaffMember, Surgery, CanteenItem, Vehicle, TransportRequest, Newborn, Vaccination, StaffRole, DeceasedRecord, EmergencyVisit, BloodUnit, BloodDonor, BankAccount, BankTransaction, Payroll, LeaveRequest, PerformanceReview, User, NHISClaim, Permission, SupplyRequisition, Supplier, PurchaseOrder, RadiologyOrder, CardiologyOrder, BillableItem, ICUBed, TherapySession, RoboticSurgeryRobot, RoboticSurgeryProcedure, GenomicSample, MentalHealthSession, VideoGenerationJob, Notification, NotificationType } from './types';
import { Page } from './types';

// Icons for the sidebar
const DashboardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>;
const PatientIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm-9 3a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const AppointmentIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const TelemedicineIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>;
const LabIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>;
const RadiologyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const PharmacyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.085a2 2 0 00-1.736.97l-2.5 5m9 .382l-3.5 7M12 15v5m0 0a2 2 0 11-4 0m4 0a2 2 0 104 0" /></svg>;
const SurgeryIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>;
const InventoryIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>;
const BillingIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const StaffIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21v-1.5a6 6 0 00-3-5.197m-1.5-2.293a4 4 0 016.326 0" /></svg>;
const ReportsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0h6" /></svg>;
const AIIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const SettingsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066 2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const BedIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>;
const LogisticsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17h2" /></svg>;
const CanteenIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 15 8 15 10c2-1 2.657-1.343 2.657-1.343a8 8 0 010 10z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18a6 6 0 006-6c0-2-1-4-2-5" /></svg>;
const MortuaryIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10m16-10v10M4 7h16M4 17h16" /></svg>;
const BloodBankIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 12.572l-7.5 7.428-7.5-7.428m0 0a4.5 4.5 0 117.5 4.428 4.5 4.5 0 117.5-4.428z" /></svg>;
const HRSIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14v6m-3-3h6M6 10h2a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2zm10 0h2a2 2 0 002-2V6a2 2 0 00-2-2h-2a2 2 0 00-2 2v2a2 2 0 002 2zM6 18h2a2 2 0 002-2v-2a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2z" /></svg>;
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const NHISIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H7a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>;
const BankIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>;
const MaternityIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14c-3.866 0-7 3.134-7 7h14c0-3.866-3.134-7-7-7z" /></svg>;
const PediatricsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>;
const EmergencyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
const OncologyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>;
const CardiologyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>;
const OPDIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1" /></svg>;
const ICUIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v4m0 0h-4m4 0l-5-5" /></svg>;
const PhysiotherapyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.5 16.5c3-3 5-5 5-5s2 2 5 5" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11.5v5" /><circle cx="12" cy="6.5" r="2.5" /></svg>;
const RoboticSurgeryIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l-4 4-4-4 4-4" /><circle cx="12" cy="12" r="10" /></svg>;
const VideoGenerationIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>;
const GenomicsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 11l3-3m0 0l3 3m-3-3v8m0-13a9 9 0 110 18 9 9 0 010-18z" /></svg>;
const DrugInteractionIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5h10m-5-5v10m5.46-1.54a5.5 5.5 0 11-10.92 0 5.5 5.5 0 0110.92 0z" /></svg>;
const MentalHealthIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const AboutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

const developerGroup = {
  title: 'Developer',
  translationKey: 'sidebar.group.developer',
  items: [
    { page: Page.RoboticSurgery, icon: <RoboticSurgeryIcon/>, translationKey: 'page.roboticSurgery', permission: 'developer:robotic_surgery' },
    { page: Page.VideoGeneration, icon: <VideoGenerationIcon/>, translationKey: 'page.videoGeneration', permission: 'developer:video_generation' },
    { page: Page.Genomics, icon: <GenomicsIcon/>, translationKey: 'page.genomics', permission: 'developer:genomics' },
    { page: Page.DrugInteraction, icon: <DrugInteractionIcon/>, translationKey: 'page.drugInteraction', permission: 'developer:drug_interaction' },
  ],
};

export const SIDEBAR_MENU = [
  {
    title: 'Main',
    translationKey: 'sidebar.group.main',
    items: [
      { page: Page.Dashboard, icon: <DashboardIcon />, translationKey: 'page.dashboard', permission: null },
      { page: Page.Patients, icon: <PatientIcon />, translationKey: 'page.patients', permission: 'patient:read' },
      { page: Page.PatientRegistration, icon: <PatientIcon />, translationKey: 'page.registerNational', permission: 'patient:register' },
      { page: Page.ForeignerRegistration, icon: <PatientIcon />, translationKey: 'page.registerForeigner', permission: 'patient:register' },
      { page: Page.Appointments, icon: <AppointmentIcon />, translationKey: 'page.appointments', permission: 'patient:read' },
      { page: Page.AIAssistant, icon: <AIIcon />, translationKey: 'page.aiAssistant', permission: 'admin:ai_assistant' },
      { page: Page.About, icon: <AboutIcon />, translationKey: 'page.about', permission: null },
    ]
  },
  {
    title: 'Clinical',
    translationKey: 'sidebar.group.clinical',
    items: [
      { page: Page.Telemedicine, icon: <TelemedicineIcon />, translationKey: 'page.telemedicine', permission: 'clinical:telemedicine' },
      { page: Page.Laboratory, icon: <LabIcon />, translationKey: 'page.laboratory', permission: 'clinical:laboratory' },
      { page: Page.Radiology, icon: <RadiologyIcon />, translationKey: 'page.radiology', permission: 'clinical:radiology' },
      { page: Page.Pharmacy, icon: <PharmacyIcon />, translationKey: 'page.pharmacy', permission: 'clinical:pharmacy' },
      { page: Page.Surgery, icon: <SurgeryIcon />, translationKey: 'page.surgery', permission: 'clinical:surgery' },
      { page: Page.Maternity, icon: <MaternityIcon />, translationKey: 'page.maternity', permission: 'clinical:maternity' },
      { page: Page.Pediatrics, icon: <PediatricsIcon />, translationKey: 'page.pediatrics', permission: 'clinical:pediatrics' },
      { page: Page.Emergency, icon: <EmergencyIcon />, translationKey: 'page.emergency', permission: 'clinical:emergency' },
      { page: Page.Oncology, icon: <OncologyIcon />, translationKey: 'page.oncology', permission: 'clinical:oncology' },
      { page: Page.Cardiology, icon: <CardiologyIcon />, translationKey: 'page.cardiology', permission: 'clinical:cardiology' },
      { page: Page.OPD, icon: <OPDIcon />, translationKey: 'page.opd', permission: 'clinical:opd' },
      { page: Page.ICU, icon: <ICUIcon />, translationKey: 'page.icu', permission: 'clinical:icu' },
      { page: Page.Physiotherapy, icon: <PhysiotherapyIcon />, translationKey: 'page.physiotherapy', permission: 'clinical:physiotherapy' },
      { page: Page.MentalHealth, icon: <MentalHealthIcon/>, translationKey: 'page.mentalHealth', permission: 'clinical:mental_health' },
      { page: Page.BloodBank, icon: <BloodBankIcon />, translationKey: 'page.bloodBank', permission: 'clinical:blood_bank' },
    ]
  },
  ...(typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? [developerGroup] : []),
  {
    title: 'Finance',
    translationKey: 'sidebar.group.finance',
    items: [
      { page: Page.Billing, icon: <BillingIcon />, translationKey: 'page.billing', permission: 'finance:billing' },
      { page: Page.Bank, icon: <BankIcon />, translationKey: 'page.bank', permission: 'finance:bank' },
      { page: Page.NHISClaims, icon: <NHISIcon />, translationKey: 'page.nhisClaims', permission: 'finance:nhis' },
    ]
  },
  {
    title: 'Operations',
    translationKey: 'sidebar.group.operations',
    items: [
      { page: Page.Inventory, icon: <InventoryIcon />, translationKey: 'page.inventory', permission: 'operations:inventory' },
      { page: Page.BedManagement, icon: <BedIcon />, translationKey: 'page.bedManagement', permission: 'operations:bed_management' },
      { page: Page.Logistics, icon: <LogisticsIcon />, translationKey: 'page.logistics', permission: 'operations:logistics' },
      { page: Page.Canteen, icon: <CanteenIcon />, translationKey: 'page.canteen', permission: 'operations:canteen' },
      { page: Page.Mortuary, icon: <MortuaryIcon />, translationKey: 'page.mortuary', permission: 'operations:mortuary' },
    ]
  },
  {
    title: 'Administration',
    translationKey: 'sidebar.group.admin',
    items: [
      { page: Page.Staff, icon: <StaffIcon />, translationKey: 'page.staffManagement', permission: 'admin:staff' },
      { page: Page.HumanResources, icon: <HRSIcon />, translationKey: 'page.humanResources', permission: 'admin:hr' },
      { page: Page.UserManagement, icon: <UserIcon />, translationKey: 'page.userManagement', permission: 'admin:users' },
      { page: Page.Reports, icon: <ReportsIcon />, translationKey: 'page.reports', permission: 'admin:reports' },
    ]
  }
];

export const SETTINGS_NAV_ITEM = { page: Page.Settings, icon: <SettingsIcon />, translationKey: 'page.settings', permission: 'admin:settings' };

export const NOTIFICATION_ICONS: Record<NotificationType, React.ReactNode> = {
    lab: <LabIcon />,
    appointment: <AppointmentIcon />,
    inventory: <InventoryIcon />,
    billing: <BillingIcon />,
    claim: <NHISIcon />,
    crisis: <EmergencyIcon />,
};

export const SERVICE_PRICES = {
  lab: {
    'Full Blood Count': 50,
    'Malaria RDT': 20,
    'Urinalysis': 25,
    'Lipid Profile': 80,
    'Liver Function Test': 70,
  },
  pharmacy: {
    'Paracetamol 500mg': 0.5,
    'Amoxicillin 500mg': 1.2,
    'Lisinopril 10mg': 2.0,
  },
  surgery: {
    'Appendectomy': 1500,
    'Hernia Repair': 2000,
    'Caesarean Section': 2500,
  }
};

const ALL_PERMISSIONS: Permission[] = [
  'patient:read', 'patient:write', 'patient:register',
  'clinical:telemedicine', 'clinical:laboratory', 'clinical:radiology', 'clinical:pharmacy', 'clinical:surgery', 'clinical:maternity', 'clinical:pediatrics', 'clinical:emergency', 'clinical:oncology', 'clinical:cardiology', 'clinical:blood_bank', 'clinical:opd', 'clinical:icu', 'clinical:physiotherapy', 'clinical:mental_health',
  'developer:robotic_surgery', 'developer:video_generation', 'developer:genomics', 'developer:drug_interaction',
  'finance:billing', 'finance:bank', 'finance:nhis',
  'operations:inventory', 'operations:bed_management', 'operations:logistics', 'operations:canteen', 'operations:mortuary',
  'admin:staff', 'admin:hr', 'admin:users', 'admin:reports', 'admin:settings', 'admin:ai_assistant'
];

const ALL_PERMISSIONS_EXCEPT_SETTINGS = ALL_PERMISSIONS.filter(p => p !== 'admin:settings');

export const MOCK_ROLES: StaffRole[] = [
    { id: 'R01', name: 'Doctor', permissions: ['patient:read', 'patient:write', 'clinical:telemedicine', 'clinical:laboratory', 'clinical:radiology', 'clinical:pharmacy', 'clinical:surgery', 'clinical:maternity', 'clinical:pediatrics', 'clinical:emergency', 'clinical:oncology', 'clinical:cardiology', 'clinical:blood_bank', 'clinical:opd', 'clinical:icu', 'clinical:physiotherapy', 'clinical:mental_health', 'admin:ai_assistant'] },
    { id: 'R02', name: 'Nurse', permissions: ['patient:read', 'patient:write'] },
    { id: 'R03', name: 'Administrator', permissions: ALL_PERMISSIONS },
    { id: 'R04', name: 'Pharmacist', permissions: ['patient:read', 'clinical:pharmacy', 'operations:inventory'] },
    { id: 'R05', name: 'Lab Technician', permissions: ['patient:read', 'clinical:laboratory'] },
    { id: 'R06', name: 'Developer', permissions: ['developer:robotic_surgery', 'developer:video_generation', 'developer:genomics', 'developer:drug_interaction', 'admin:ai_assistant'] },
    { id: 'R07', name: 'Visitor', permissions: ['patient:read'] },
    { id: 'R08', name: 'User', permissions: ALL_PERMISSIONS_EXCEPT_SETTINGS },
];

export const MOCK_STAFF_MEMBERS: StaffMember[] = [
  { id: 'S001', username: 'evelyn.adjei', name: 'Dr. Evelyn Adjei', avatarUrl: 'https://picsum.photos/seed/doc1/100/100', gender: 'Female', dateOfBirth: '1985-05-20', homeTown: 'Kumasi', digitalAddress: 'GA-123-4567', role: MOCK_ROLES[0], designation: 'General Practitioner', rank: 'Senior Medical Officer', department: 'OPD', status: 'Active', licenseNumber: 'GMC/DP/01234', registrationNumber: 'MDC/RN/5678', academicQualifications: ['MBChB'], professionalQualifications: ['MGCP'], firstAppointmentDate: '2010-08-01', currentStationPostDate: '2018-03-15', promotionDate: '2022-01-01', phone: '0244123456', email: 'evelyn.adjei@gh-hms.com', password: 'password123', ssnitId: 'SN123456789', bankName: 'GCB Bank', accountNumber: '1234567890123', nextOfKin: 'Mr. Kofi Adjei', nextOfKinContact: '0208123456' },
  { id: 'S002', username: 'patricia.owusu', name: 'Nurse Patricia Owusu', avatarUrl: 'https://picsum.photos/seed/nurse1/100/100', gender: 'Female', dateOfBirth: '1990-11-12', homeTown: 'Cape Coast', digitalAddress: 'CR-456-7890', role: MOCK_ROLES[1], designation: 'Staff Nurse', rank: 'Nursing Officer', department: 'General Ward', status: 'Active', licenseNumber: 'NMC/RN/98765', registrationNumber: 'NMC/RN/54321', academicQualifications: ['BSc Nursing'], professionalQualifications: [], firstAppointmentDate: '2015-09-10', currentStationPostDate: '2015-09-10', promotionDate: '2020-07-01', phone: '0266123456', email: 'patricia.owusu@gh-hms.com', password: 'password123', ssnitId: 'SN987654321', bankName: 'Absa Bank', accountNumber: '0987654321098', nextOfKin: 'Mrs. Grace Owusu', nextOfKinContact: '0277123456' },
  { id: 'S003', username: 'samuel.nkrumah', name: 'Mr. Samuel Nkrumah', avatarUrl: 'https://picsum.photos/seed/admin1/100/100', gender: 'Male', dateOfBirth: '1982-02-28', homeTown: 'Accra', digitalAddress: 'GA-789-1234', role: MOCK_ROLES[2], designation: 'Hospital Administrator', rank: 'Director', department: 'Administration', status: 'Active', academicQualifications: ['MHA', 'BSc. Administration'], professionalQualifications: ['CIHM'], firstAppointmentDate: '2008-05-20', currentStationPostDate: '2012-11-01', promotionDate: '2019-04-01', phone: '0208123456', email: 'samuel.nkrumah@gh-hms.com', password: 'password123', ssnitId: 'SN564738291', bankName: 'Stanbic Bank', accountNumber: '9087463524109', nextOfKin: 'Mrs. Clara Nkrumah', nextOfKinContact: '0244987654' },
  { id: 'S004', username: 'akua.mansa', name: 'Ms. Akua Mansa', avatarUrl: 'https://picsum.photos/seed/dev1/100/100', gender: 'Female', dateOfBirth: '1995-01-10', homeTown: 'Tema', digitalAddress: 'GT-321-9876', role: MOCK_ROLES[5], designation: 'Software Engineer', rank: 'Lead Developer', department: 'IT', status: 'Active', academicQualifications: ['BSc. Computer Science'], professionalQualifications: [], firstAppointmentDate: '2020-02-01', currentStationPostDate: '2020-02-01', promotionDate: '2023-01-01', phone: '0555123456', email: 'akua.mansa@gh-hms.com', password: 'password123', ssnitId: 'SN192837465', bankName: 'Fidelity Bank', accountNumber: '1029384756102', nextOfKin: 'Mr. Kwame Mensah', nextOfKinContact: '0241234567' },
  { id: 'S005', username: 'shacomputec', name: 'Sha Computec', avatarUrl: 'https://picsum.photos/seed/admin2/100/100', gender: 'Male', dateOfBirth: '1980-01-01', homeTown: 'Accra', digitalAddress: 'GA-000-0000', role: MOCK_ROLES[2], designation: 'System Administrator', rank: 'Director', department: 'Administration', status: 'Active', academicQualifications: ['MSc Info Systems'], professionalQualifications: ['CompTIA A+'], firstAppointmentDate: '2010-01-01', currentStationPostDate: '2010-01-01', promotionDate: '2015-01-01', phone: '0555111222', email: 'shacomputec@gh-hms.com', password: 'kobina5251', ssnitId: 'SN000000000', bankName: 'GCB Bank', accountNumber: '9876543210987', nextOfKin: 'Jane Doe', nextOfKinContact: '0555333444' },
  { id: 'S006', username: 'visitor', name: 'Visitor Account', avatarUrl: 'https://picsum.photos/seed/visitor1/100/100', gender: 'Other', dateOfBirth: '1990-01-01', homeTown: 'N/A', digitalAddress: 'N/A', role: MOCK_ROLES[6], designation: 'Visitor', rank: 'N/A', department: 'General', status: 'Active', academicQualifications: [], professionalQualifications: [], firstAppointmentDate: '2024-01-01', currentStationPostDate: '2024-01-01', promotionDate: '2024-01-01', phone: '0000000000', email: 'visitor@gh-hms.com', password: 'password123', ssnitId: 'N/A', bankName: 'N/A', accountNumber: 'N/A', nextOfKin: 'N/A', nextOfKinContact: 'N/A' },
  { id: 'S007', username: 'user', name: 'Standard User', avatarUrl: 'https://picsum.photos/seed/user1/100/100', gender: 'Other', dateOfBirth: '1992-03-03', homeTown: 'Accra', digitalAddress: 'GA-111-2222', role: MOCK_ROLES[7], designation: 'General User', rank: 'N/A', department: 'General', status: 'Active', academicQualifications: [], professionalQualifications: [], firstAppointmentDate: '2024-01-01', currentStationPostDate: '2024-01-01', promotionDate: '2024-01-01', phone: '0241234567', email: 'user@gh-hms.com', password: 'password123', ssnitId: 'N/A', bankName: 'N/A', accountNumber: 'N/A', nextOfKin: 'N/A', nextOfKinContact: 'N/A' },
];

export const MOCK_USERS: User[] = MOCK_STAFF_MEMBERS.map(s => ({
  id: s.id,
  name: s.name,
  email: s.email,
  role: s.role.name,
  status: 'Active',
  lastLogin: new Date(Date.now() - Math.random() * 1000 * 3600 * 24).toISOString(),
  avatarUrl: s.avatarUrl,
}));

export const MOCK_PATIENTS: Patient[] = [
  { id: 'P001', name: 'Ama Serwaa', age: 34, gender: 'Female', bloodType: 'O+', patientType: 'National', ghanaCardId: 'GHA-123456789-0', ghanaCardStatus: 'Verified', nhisId: '12345678', phone: '0244123456', address: '123 Adabraka St, Accra', avatarUrl: 'https://picsum.photos/seed/p1/100/100', lastVisit: '2024-07-10', allergies: ['Penicillin'], medicalHistory: [{ date: '2024-07-10', diagnosis: 'Malaria', treatment: 'Artemether/Lumefantrine', doctor: 'Dr. Evelyn Adjei' }], appointments: [], vitals: [], dischargeSummaries: [] },
  { id: 'P002', name: 'Kofi Annan', age: 45, gender: 'Male', bloodType: 'A+', patientType: 'National', ghanaCardId: 'GHA-987654321-1', ghanaCardStatus: 'Unverified', nhisId: '87654321', phone: '0208123456', address: '456 Osu Ave, Accra', avatarUrl: 'https://picsum.photos/seed/p2/100/100', lastVisit: '2024-06-22', allergies: [], medicalHistory: [{ date: '2024-06-22', diagnosis: 'Hypertension', treatment: 'Lisinopril', doctor: 'Dr. Evelyn Adjei' }], appointments: [], vitals: [], dischargeSummaries: [] },
  { id: 'P003', name: 'Adwoa Boateng', age: 28, gender: 'Female', bloodType: 'B-', patientType: 'National', ghanaCardId: 'GHA-112233445-5', ghanaCardStatus: 'Verified', nhisId: '11223344', phone: '0266123456', address: '789 East Legon Hills, Accra', avatarUrl: 'https://picsum.photos/seed/p3/100/100', lastVisit: '2024-07-15', allergies: ['Dust Mites'], medicalHistory: [{ date: '2024-07-15', diagnosis: 'Prenatal Checkup', treatment: 'Folic Acid, Routine Ultrasound', doctor: 'Dr. Evelyn Adjei' }], appointments: [], vitals: [], dischargeSummaries: [], gestationalAge: 32, expectedDueDate: '2024-09-10', riskLevel: 'Normal', antenatalHistory: [] },
  { id: 'FN-001', name: 'John Smith', age: 52, gender: 'Male', bloodType: 'AB+', patientType: 'Foreigner', nationality: 'British', passportId: 'GBR1234567', visaType: 'Business', visaExpiry: '2025-01-15', phone: '0555123456', address: 'Movenpick Hotel, Accra', avatarUrl: 'https://picsum.photos/seed/p4/100/100', lastVisit: '2024-07-01', allergies: ['Shellfish'], medicalHistory: [{ date: '2024-07-01', diagnosis: 'Food Poisoning', treatment: 'IV Fluids, Antibiotics', doctor: 'Dr. Evelyn Adjei' }], appointments: [], vitals: [], dischargeSummaries: [] },
];

MOCK_PATIENTS.forEach(p => {
  p.appointments = [
    { id: `A${p.id}-1`, patientId: p.id, patientName: p.name, date: '2024-08-05', time: '10:00', doctor: 'Dr. Evelyn Adjei', department: 'OPD', reason: 'Follow-up', status: 'Scheduled', type: 'In-Person' },
    { id: `A${p.id}-2`, patientId: p.id, patientName: p.name, date: '2024-06-15', time: '14:30', doctor: 'Dr. Evelyn Adjei', department: 'OPD', reason: 'Initial Consultation', status: 'Completed', type: 'In-Person' },
  ]
  p.vitals = [
    { date: '2024-07-10', temperature: '38.5 °C', bloodPressure: '120/80 mmHg', heartRate: '95 bpm', respiratoryRate: '20 breaths/min' }
  ]
});

export const MOCK_LAB_ORDERS: LabOrder[] = [
    { id: 'LAB-001', patientId: 'P001', patientName: 'Ama Serwaa', testName: 'Malaria RDT', orderDate: '2024-07-10', status: 'Completed', results: 'Positive for Plasmodium falciparum', isCritical: true, icd10Code: 'B54' },
    { id: 'LAB-002', patientId: 'P002', patientName: 'Kofi Annan', testName: 'Lipid Profile', orderDate: '2024-06-22', status: 'Completed', results: 'Total Cholesterol: 240 mg/dL, LDL: 160 mg/dL', isCritical: false, icd10Code: 'E78.5' },
    { id: 'LAB-003', patientId: 'P003', patientName: 'Adwoa Boateng', testName: 'Full Blood Count', orderDate: '2024-07-15', status: 'In Progress', isCritical: false },
];

export const MOCK_RADIOLOGY_ORDERS: RadiologyOrder[] = [
    { id: 'RAD-001', patientId: 'P002', patientName: 'Kofi Annan', testName: 'Chest X-Ray', orderDate: '2024-06-22', status: 'Completed', results: 'Mild cardiomegaly observed. Lungs are clear.', imageUrl: 'https://picsum.photos/seed/xray1/400/300', isUrgent: false },
];

export const MOCK_CARDIOLOGY_ORDERS: CardiologyOrder[] = [
    { id: 'CARD-001', patientId: 'P002', patientName: 'Kofi Annan', testName: 'ECG', orderDate: '2024-06-22', status: 'Completed', results: 'Normal sinus rhythm. No acute ST changes.', imageUrl: 'https://picsum.photos/seed/ecg1/400/200', isUrgent: false },
];

export const MOCK_PRESCRIPTIONS: Prescription[] = [
  { id: 'RX-001', patientId: 'P001', patientName: 'Ama Serwaa', doctor: 'Dr. Evelyn Adjei', date: '2024-07-10', status: 'Dispensed', items: [{ medicationId: 'MED-002', dosage: '500mg', quantity: 24 }] },
  { id: 'RX-002', patientId: 'P002', patientName: 'Kofi Annan', doctor: 'Dr. Evelyn Adjei', date: '2024-06-22', status: 'Dispensed', items: [{ medicationId: 'MED-003', dosage: '10mg', quantity: 30 }] },
];

export const MOCK_MEDICATIONS: Medication[] = [
  { id: 'MED-001', name: 'Paracetamol 500mg', stockLevel: 1000, unit: 'tabs', lowStockThreshold: 200, unitPrice: 0.5, description: 'Pain and fever relief', manufacturer: 'Kina Pharma', sideEffects: ['Nausea', 'Stomach pain'] },
  { id: 'MED-002', name: 'Amoxicillin 500mg', stockLevel: 500, unit: 'caps', lowStockThreshold: 100, unitPrice: 1.2, description: 'Antibiotic', manufacturer: 'Ernest Chemists', sideEffects: ['Diarrhea', 'Rash'] },
  { id: 'MED-003', name: 'Lisinopril 10mg', stockLevel: 300, unit: 'tabs', lowStockThreshold: 50, unitPrice: 2.0, description: 'Blood pressure medication', manufacturer: 'Kina Pharma', sideEffects: ['Dizziness', 'Cough'] },
];

export const MOCK_INVOICES: Invoice[] = [
    { id: 'INV-001', patientId: 'P001', patientName: 'Ama Serwaa', date: '2024-07-10', dueDate: '2024-08-09', totalAmount: 70.00, status: 'Paid', items: [{ id: 'I-1', description: 'Consultation', quantity: 1, unitPrice: 50.00, total: 50.00 }, { id: 'I-2', description: 'Malaria Test', quantity: 1, unitPrice: 20.00, total: 20.00 }] },
];

export const MOCK_BILLABLE_ITEMS: BillableItem[] = [
    { id: 'B-001', patientId: 'P002', patientName: 'Kofi Annan', date: '2024-06-22', description: 'Consultation', amount: 50, status: 'Unbilled' },
];

export const MOCK_INVENTORY_ITEMS: InventoryItem[] = [
    { id: 'INV-001', name: 'Syringes 10ml', category: 'Medical Supplies', quantity: 500, unit: 'boxes', reorderLevel: 100, supplier: 'MedSupply Ghana', lastUpdated: '2024-07-15' },
];

export const MOCK_SURGERIES: Surgery[] = [
    { id: 'SURG-001', patientId: 'P001', patientName: 'Ama Serwaa', procedure: 'Appendectomy', surgeon: 'Dr. Mensah', operatingRoom: 'OR-01', date: '2023-01-20', time: '09:00', status: 'Completed', preOpChecklist: [] },
];

export const MOCK_CANTEEN_INVENTORY: CanteenItem[] = [
    { id: 'CAN-001', name: 'Rice', quantity: 50, unit: 'kg', reorderLevel: 20 },
];

export const MOCK_VEHICLES: Vehicle[] = [
    { id: 'VEH-001', type: 'Ambulance', licensePlate: 'GV 123-24', driver: 'Kwame Ofori', status: 'Available' },
];

export const MOCK_TRANSPORT_REQUESTS: TransportRequest[] = [
    { id: 'TR-001', patientId: 'P002', patientName: 'Kofi Annan', origin: 'General Ward', destination: 'Radiology', requestTime: '2024-07-16T10:00:00Z', status: 'Pending', urgency: 'Routine' },
];

export const MOCK_NEWBORNS: Newborn[] = [
  { id: 'NB-001', motherId: 'P003', motherName: 'Adwoa Boateng', timeOfBirth: '2024-07-18T08:30:00Z', gender: 'Female', weightKg: 3.2, apgarScore: 9 },
];

export const MOCK_VACCINATIONS: Vaccination[] = [];

export const MOCK_DECEASED_RECORDS: DeceasedRecord[] = [
    { id: 'MORT-001', patientId: null, name: 'Yaw Antwi', age: 78, gender: 'Male', dateOfDeath: '2024-07-14', timeOfDeath: '22:15', dateAdmitted: '2024-07-15', status: 'In Storage', storageBay: 'Bay-01' },
];

export const MOCK_EMERGENCY_VISITS: EmergencyVisit[] = [
  { id: 'ER-001', patientId: 'P001', patientName: 'Ama Serwaa', avatarUrl: MOCK_PATIENTS[0].avatarUrl, arrivalTime: new Date(Date.now() - 30 * 60000).toISOString(), chiefComplaint: 'Fever and headache', status: 'Waiting for Triage' },
];

export const MOCK_BLOOD_UNITS: BloodUnit[] = [
    { id: 'UNIT-001', bloodType: 'O+', donorId: 'D001', donorName: 'Kwesi Mensah', donationDate: '2024-06-10', expiryDate: '2024-07-22', status: 'Available' },
];

export const MOCK_BLOOD_DONORS: BloodDonor[] = [
    { id: 'D001', name: 'Kwesi Mensah', bloodType: 'O+', lastDonationDate: '2024-06-10', phone: '0201112222', totalDonations: 5 },
];

export const MOCK_BANK_ACCOUNTS: BankAccount[] = [
    { id: 'ACC-01', bankName: 'GCB Bank', accountNumber: '1234567890', balance: 500000 },
];

export const MOCK_BANK_TRANSACTIONS: BankTransaction[] = [
    { id: 'TXN-001', date: '2024-07-15', description: 'NHIS Bulk Payment', type: 'Deposit', amount: 15000, accountId: 'ACC-01', status: 'Pending' },
];

export const MOCK_LEAVE_REQUESTS: LeaveRequest[] = [
    { id: 'LR-001', staffId: 'S002', staffName: 'Nurse Patricia Owusu', leaveType: 'Annual', startDate: '2024-08-01', endDate: '2024-08-14', reason: 'Personal', status: 'Pending' },
];

export const MOCK_PERFORMANCE_REVIEWS: PerformanceReview[] = [
    { id: 'PR-001', staffId: 'S001', staffName: 'Dr. Evelyn Adjei', reviewerName: 'Dr. Osei', reviewDate: '2024-12-15', status: 'Scheduled' },
];

export const MOCK_NHIS_CLAIMS: NHISClaim[] = [
  { id: 'NHIS-001', patientId: 'P001', patientName: 'Ama Serwaa', nhisId: '12345678', submissionDate: '2024-07-12', totalAmount: 70, status: 'Submitted', items: [{ id: 'CI-1', description: 'Consultation', code: 'C101', amount: 50 }, { id: 'CI-2', description: 'Malaria Test', code: 'L203', amount: 20 }] },
  { id: 'NHIS-002', patientId: 'P002', patientName: 'Kofi Annan', nhisId: '87654321', submissionDate: '2024-06-25', totalAmount: 130, status: 'Rejected', items: [], rejectionReason: 'Invalid diagnosis code for prescribed medication.' },
];

export const MOCK_SUPPLIERS: Supplier[] = [
    { id: 'SUP-01', name: 'MedSupply Ghana', contactPerson: 'Ama Adjei', phone: '0302123456', email: 'sales@medsupply.com.gh', address: '123 Industrial Area, Accra', itemCount: 250 },
];

export const MOCK_PURCHASE_ORDERS: PurchaseOrder[] = [
    { id: 'PO-001', supplierId: 'SUP-01', supplierName: 'MedSupply Ghana', orderDate: '2024-07-01', expectedDeliveryDate: '2024-07-15', status: 'Fulfilled', items: [], totalCost: 5000 },
];

export const MOCK_SUPPLY_REQUISITIONS: SupplyRequisition[] = [
    { id: 'REQ-001', requestingDepartment: 'General Ward', requestDate: '2024-07-14', items: [{ itemId: 'INV-001', itemName: 'Syringes 10ml', quantity: 10 }], status: 'Pending', urgency: 'Routine' },
];

export const MOCK_ICU_BEDS: ICUBed[] = [];
export const MOCK_THERAPY_SESSIONS: TherapySession[] = [];
export const MOCK_ROBOTS: RoboticSurgeryRobot[] = [
  { id: 'ROBO-01', name: 'Da Vinci Xi', model: 'XI-1000', status: 'Available', lastMaintenance: '2024-06-01' },
];
export const MOCK_ROBOTIC_SURGERIES: RoboticSurgeryProcedure[] = [];
export const MOCK_VIDEO_JOBS: VideoGenerationJob[] = [];
export const MOCK_GENOMIC_SAMPLES: GenomicSample[] = [];
export const MOCK_MENTAL_HEALTH_SESSIONS: MentalHealthSession[] = [];
export const MOCK_NOTIFICATIONS: Notification[] = [
  {id: 'N001', type: 'lab', message: 'Critical lab result for Kofi Annan (Lipid Profile) is ready.', isRead: false, timestamp: new Date(Date.now() - 3600000).toISOString(), link: { page: Page.Patients, patientId: 'P002' }, userId: 'S001'},
  {id: 'N002', type: 'inventory', message: 'Paracetamol stock is low (1000/200).', isRead: true, timestamp: new Date(Date.now() - 86400000).toISOString(), link: { page: Page.Inventory }, userId: 'S003'},
  {id: 'N003', type: 'claim', message: 'NHIS Claim NHIS-002 for Kofi Annan was rejected.', isRead: false, timestamp: new Date(Date.now() - 2 * 3600000).toISOString(), link: { page: Page.NHISClaims }, userId: 'S003'},
];