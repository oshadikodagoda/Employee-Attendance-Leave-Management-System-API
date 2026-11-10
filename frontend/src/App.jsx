import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import {
  Login, EmployeeDashboard, ManagerDashboard,
  MyLeaves, MyAttendance, Profile,
  Employees, LeaveRequests, Reports,
} from './attendease';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />

        {/* Employee */}
        <Route path="/dashboard" element={<EmployeeDashboard />} />
        <Route path="/employee" element={<EmployeeDashboard />} />
        <Route path="/leaves" element={<MyLeaves />} />
        <Route path="/attendance" element={<MyAttendance />} />
        <Route path="/profile" element={<Profile />} />

        {/* Manager */}
        <Route path="/manager" element={<ManagerDashboard />} />
        <Route path="/manager/employees" element={<Employees />} />
        <Route path="/manager/leaves" element={<LeaveRequests />} />
        <Route path="/manager/reports" element={<Reports />} />
      </Routes>
    </Router>
  );
}

export default App;