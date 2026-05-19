import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// --- Public Pages ---
import LandingPage from './pages/LandingPage';
import AdminLogin from './pages/Auth/AdminLogin';

// --- Super Admin Pages ---
import SADashboard from './pages/SuperAdmin/SADashboard';
import NewRequests from './pages/SuperAdmin/Municipalities/NewRequests';
import ActiveCities from './pages/SuperAdmin/Municipalities/ActiveCities';
import CityPerformance from './pages/SuperAdmin/Municipalities/CityPerformance';
import CityControlPanel from './pages/SuperAdmin/Municipalities/CityControlPanel';
import Invoices from './pages/SuperAdmin/Revenue/Invoices';
import SubscriptionPlans from './pages/SuperAdmin/Revenue/SubscriptionPlans';
import Roles from './pages/SuperAdmin/Roles';
import Tickets from './pages/SuperAdmin/Tickets';
import Logs from './pages/SuperAdmin/Logs';
import GlobalSettings from './pages/SuperAdmin/GlobalSettings';

// --- City Admin (Tenant Admin) Pages ---
import CityDashboard from './pages/Admin/CityDashboard';

// 1. Live Tracking
import StaffTracking from './pages/Admin/LiveTracking/StaffTracking';
import VehicleTracking from './pages/Admin/LiveTracking/VehicleTracking';
import ToiletMonitoring from './pages/Admin/LiveTracking/ToiletMonitoring';
import GVPMap from './pages/Admin/LiveTracking/GVPMap';

// 2. Ward & Households
import WardDefinition from './pages/Admin/WardHouseholds/WardDefinition';
import RoadHierarchy from './pages/Admin/WardHouseholds/RoadHierarchy';
import HouseholdRegistry from './pages/Admin/WardHouseholds/HouseholdRegistry';
import AddHousehold from './pages/Admin/WardHouseholds/AddHousehold';
import AddWard from "./pages/Admin/WardHouseholds/AddWard";
import WardMapping from "./pages/Admin/WardHouseholds/WardMapping";
import AddRoad from "./pages/Admin/WardHouseholds/AddRoad";
import BulkQRGenerator from './pages/Admin/WardHouseholds/BulkQRGenerator';
import Profile from './pages/Admin/Settings/Profile';
import VehicleInventory from './pages/Admin/Vehicles/Inventory';
import WardDeployment from './pages/Admin/Vehicles/WardDeployment';
import FleetRequests from './pages/Admin/Vehicles/FleetRequests';
import VehicleMaintenance from './pages/Admin/Vehicles/VehicleMaintenance'; 
import FuelLogs from './pages/Admin/Vehicles/FuelLogs';
import MaintenanceInsurance from './pages/Admin/Vehicles/MaintenanceInsurance';
import GPSStatus from './pages/Admin/Vehicles/GPSStatus';
import StaffList from './pages/Admin/HR/StaffList';
import HierarchySetup from './pages/Admin/HR/HierarchySetup';
import AttendanceLog from './pages/Admin/HR/AttendanceLog';
import WorkAssignment from './pages/Admin/HR/WorkAssignment';
import RoleManagement from './pages/Admin/HR/RoleManagement';
import D2DCollectionLogs from './pages/Admin/SWM/D2DCollectionLogs';
import RouteOptimization from './pages/Admin/SWM/RouteOptimization';
import WasteProcessingPlant from './pages/Admin/SWM/WasteProcessingPlant';
import GrievanceCenter from './pages/Admin/Grievance/GrievanceCenter';
import AddGrievance from './pages/Admin/Grievance/AddGrievance';
import GrievanceSettings from './pages/Admin/Grievance/GrievanceSettings';
import GrievanceDetail from './pages/Admin/Grievance/GrievanceDetail';
import SakshamAI from './pages/Admin/Reports/SakshamAI';
import CollectionReport from './pages/Admin/Reports/CollectionReport';
import StaffReport from './pages/Admin/Reports/StaffReport';
import ComplaintReport from './pages/Admin/Reports/ComplaintReport';
import FuelReport from './pages/Admin/Reports/FuelReport';
import SystemConfig from './pages/Admin/Settings/SystemConfig';
import DeviceControl from './pages/Admin/Settings/DeviceControl';
import StaffGeofence from './pages/Admin/Settings/StaffGeofence';
import MaterialRecoveryFacility from './pages/Admin/SWM/MaterialRecoveryFacility';
import IecDashboard from './pages/Admin/IEC/IecDashboard';





// --- Components ---
import ProtectedRoute from './components/ProtectedRoute';

// =============================================================
// TEMPORARY PLACEHOLDER (Bhai, jab aap inke asli page bana lenge, tab import kar lena)
// =============================================================
const Placeholder = ({ title }) => (
  <div className="h-screen flex items-center justify-center bg-slate-50">
    <div className="text-center p-10 bg-white rounded-[40px] shadow-xl border border-slate-100">
      <h2 className="text-2xl font-black text-slate-800 uppercase mb-2">{title}</h2>
      <p className="text-emerald-600 font-bold text-xs tracking-widest uppercase">Coming Soon: GIS Engine V2 Integration</p>
    </div>
  </div>
);

function App() {
  useEffect(() => {
    const checkSession = () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        // Token decode karke expiry check karna
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expiryTime = payload.exp * 1000; // exp seconds mein hota hai
        const currentTime = Date.now();

        if (currentTime >= expiryTime) {
          // 🔥 Action: Session khatam!
          localStorage.clear();
          window.location.href = "/login"; // Seedha login par bhej do
          alert("Security Alert: Aapka session khatam ho gaya hai. Kripya fir se login karein.");
        }
      } catch (e) {
        console.error("Token decoding error");
        localStorage.clear();
      }
    };

    // Har 10 second mein pichhe se check karega ki time up toh nahi hua
    const sessionInterval = setInterval(checkSession, 10000);
    
    // Clean up interval on unmount
    return () => clearInterval(sessionInterval);
  }, []);
  // --- 🔐 AUTO-LOGOUT ENGINE END ---
  return (
    <BrowserRouter>
      <div className="antialiased font-sans">
        <Routes>
          {/* ================= PUBLIC ROUTES ================= */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<AdminLogin />} />


          {/* ================= SUPER ADMIN ROUTES ================= */}
          <Route path="/super-admin/*" element={
            <ProtectedRoute roleRequired="SUPER_ADMIN">
              <Routes>
                <Route path="dashboard" element={<SADashboard />} />
                <Route path="requests" element={<NewRequests />} />
                <Route path="tenants" element={<ActiveCities />} />
                <Route path="performance" element={<CityPerformance />} />
                <Route path="control-panel/:tenantId" element={<CityControlPanel />} />
                <Route path="invoices" element={<Invoices />} />
                <Route path="plans" element={<SubscriptionPlans />} />
                <Route path="roles" element={<Roles />} />
                <Route path="tickets" element={<Tickets />} />
                <Route path="logs" element={<Logs />} />
                <Route path="settings" element={<GlobalSettings />} />
              </Routes>
            </ProtectedRoute>
          } />


          {/* ================= CITY ADMIN ROUTES (TENANT_ADMIN) ================= */}
          
          {/* 1. Dashboard */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute roleRequired="TENANT_ADMIN"><CityDashboard /></ProtectedRoute>
          } />
          <Route path="/admin/profile" element={<Profile />} />
          
          
          {/* 2. Live Tracking (Map) */}
          <Route path="/admin/live-staff" element={<ProtectedRoute roleRequired="TENANT_ADMIN"><StaffTracking /></ProtectedRoute>} />
          <Route path="/admin/live-vehicles" element={<ProtectedRoute roleRequired="TENANT_ADMIN"><VehicleTracking /></ProtectedRoute>} />
          <Route path="/admin/live-toilets" element={<ProtectedRoute roleRequired="TENANT_ADMIN"><ToiletMonitoring /></ProtectedRoute>} />
          <Route path="/admin/live-gvps" element={<ProtectedRoute roleRequired="TENANT_ADMIN"><GVPMap /></ProtectedRoute>} />
          
          {/* 3. Ward & Households */}
          <Route path="/admin/wards" element={<ProtectedRoute roleRequired="TENANT_ADMIN"><WardDefinition /></ProtectedRoute>} />
          <Route path="/admin/roads/add" element={<ProtectedRoute roleRequired="TENANT_ADMIN"><AddRoad /></ProtectedRoute>} />
          <Route path="/admin/roads" element={<ProtectedRoute roleRequired="TENANT_ADMIN"><RoadHierarchy /></ProtectedRoute>} />
          <Route path="/admin/households" element={<ProtectedRoute roleRequired="TENANT_ADMIN"><HouseholdRegistry /></ProtectedRoute>} />
          
          <Route path="/admin/households/add" element={<ProtectedRoute roleRequired="TENANT_ADMIN"><AddHousehold /></ProtectedRoute>} />
          <Route path="/admin/wards/add" element={<AddWard />} />
          <Route path="/admin/mapping" element={<ProtectedRoute roleRequired="TENANT_ADMIN"><WardMapping /></ProtectedRoute>}/>
          <Route path="/admin/qr-management" element={<ProtectedRoute roleRequired="TENANT_ADMIN"><BulkQRGenerator /></ProtectedRoute>} />
          
          {/* 4. Vehicle Management (Naya Menu Jo Aapne Kaha Tha) */}
          <Route path="/admin/vehicles/inventory" element={<ProtectedRoute roleRequired="TENANT_ADMIN"><VehicleInventory /></ProtectedRoute>} />
          <Route path="/admin/vehicles/assign-ward" element={<ProtectedRoute roleRequired="TENANT_ADMIN"><WardDeployment /></ProtectedRoute>} />
          <Route path="/admin/vehicles/fleetrequest" element={<ProtectedRoute roleRequired="TENANT_ADMIN"><FleetRequests /></ProtectedRoute>} />
          <Route path="/admin/vehicles/maintenance" element={<ProtectedRoute roleRequired="TENANT_ADMIN"><VehicleMaintenance /></ProtectedRoute>}/>
          <Route path="/admin/vehicles/fuel-management" element={<ProtectedRoute roleRequired="TENANT_ADMIN"><FuelLogs /></ProtectedRoute>} />
          <Route path="/admin/vehicles/fitness-docs" element={<ProtectedRoute roleRequired="TENANT_ADMIN"><MaintenanceInsurance /></ProtectedRoute>} />
          <Route path="/admin/vehicles/gps-health" element={<ProtectedRoute roleRequired="TENANT_ADMIN"><GPSStatus /></ProtectedRoute>} />

          {/* 5. Human Resources */}
          <Route path="/admin/hierarchy" element={<ProtectedRoute roleRequired="TENANT_ADMIN"><HierarchySetup /></ProtectedRoute>} />
          <Route path="/admin/roles" element={<ProtectedRoute roleRequired="TENANT_ADMIN"><RoleManagement /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute roleRequired="TENANT_ADMIN"><StaffList /></ProtectedRoute>} />
          <Route path="/admin/assign-work" element={<ProtectedRoute roleRequired="TENANT_ADMIN"><WorkAssignment /></ProtectedRoute>} />
          <Route path="/admin/attendance" element={<ProtectedRoute roleRequired="TENANT_ADMIN"><AttendanceLog /></ProtectedRoute>} />

          {/* 6. SWM Operations */}
          <Route path="/admin/swm-logs" element={<ProtectedRoute roleRequired="TENANT_ADMIN"><D2DCollectionLogs /></ProtectedRoute>} />
          <Route path="/admin/routes" element={<ProtectedRoute roleRequired="TENANT_ADMIN"><RouteOptimization /></ProtectedRoute>} />
          <Route path="/admin/processing" element={<ProtectedRoute roleRequired="TENANT_ADMIN"><WasteProcessingPlant /></ProtectedRoute>} />
          <Route path="/admin/mrf" element={<ProtectedRoute roleRequired="TENANT_ADMIN"><MaterialRecoveryFacility /></ProtectedRoute>} />

          {/* 7. Grievance & Reports */}
          <Route path="/admin/complaints" element={<ProtectedRoute roleRequired="TENANT_ADMIN"><GrievanceCenter /></ProtectedRoute>} />
          
         <Route path="/admin/reports/staff" element={<ProtectedRoute roleRequired="TENANT_ADMIN"><StaffReport /></ProtectedRoute>} />
          <Route path="/admin/reports/grievance" element={<ProtectedRoute roleRequired="TENANT_ADMIN"><ComplaintReport /></ProtectedRoute>} />
          <Route path="/admin/reports/revenue" element={<ProtectedRoute roleRequired="TENANT_ADMIN"><Placeholder title="Revenue & Tax Report" /></ProtectedRoute>} />
          <Route path="/admin/reports/fuel-analysis" element={<ProtectedRoute roleRequired="TENANT_ADMIN"><FuelReport /></ProtectedRoute>} />
          <Route path="/admin/complaints/view/:id" element={<GrievanceDetail />} />
          <Route path="/admin/reports/ai" element={<ProtectedRoute roleRequired="TENANT_ADMIN"><SakshamAI /></ProtectedRoute>} />
          <Route path="/admin/reports/collection" element={<ProtectedRoute roleRequired="TENANT_ADMIN"><CollectionReport /></ProtectedRoute>} />
          {/* Ye Help-Desk Counter Form Page hai */}
          <Route path="/admin/complaints/add" element={<ProtectedRoute roleRequired="TENANT_ADMIN"><AddGrievance /></ProtectedRoute>} />
          <Route path="/admin/complaints/settings" element={<ProtectedRoute roleRequired="TENANT_ADMIN"><GrievanceSettings /></ProtectedRoute>} />
          {/* 8. Configuration Section */}
          <Route path="/admin/settings" element={<ProtectedRoute roleRequired="TENANT_ADMIN"><SystemConfig /></ProtectedRoute>} />
          <Route path="/admin/device-control" element={<ProtectedRoute roleRequired="TENANT_ADMIN"><DeviceControl /></ProtectedRoute>} />
          <Route path="/admin/device-control/geofence" element={<ProtectedRoute roleRequired="TENANT_ADMIN"><StaffGeofence /></ProtectedRoute>} />
        {/* 9. IEC Operations - Added 'key' to force re-render on path change */}
          <Route path="/admin/iec/campaigns" element={<ProtectedRoute roleRequired="TENANT_ADMIN"><IecDashboard key="camp" defaultTab="Campaigns" /></ProtectedRoute>} />
          <Route path="/admin/iec/media" element={<ProtectedRoute roleRequired="TENANT_ADMIN"><IecDashboard key="media" defaultTab="Media" /></ProtectedRoute>} />
          <Route path="/admin/iec/engagement" element={<ProtectedRoute roleRequired="TENANT_ADMIN"><IecDashboard key="eng" defaultTab="Engagement" /></ProtectedRoute>} />
          <Route path="/admin/iec/digital" element={<ProtectedRoute roleRequired="TENANT_ADMIN"><IecDashboard key="dig" defaultTab="Digital" /></ProtectedRoute>} />
          <Route path="/admin/iec/activity" element={<ProtectedRoute roleRequired="TENANT_ADMIN"><IecDashboard key="act" defaultTab="Activity" /></ProtectedRoute>} />
          


          {/* ================= FALLBACK 404 ================= */}
          <Route path="*" element={<div className="h-screen flex items-center justify-center bg-slate-100 text-slate-400 font-black">404 | NOT FOUND</div>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
