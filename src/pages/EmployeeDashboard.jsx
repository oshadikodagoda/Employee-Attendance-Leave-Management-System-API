import React, { useState } from 'react';

function EmployeeDashboard() {
  const [clockedIn, setClockedIn] = useState(false);
  
  // Temporary fake data until backend is ready
  const leaveRequests = [
    { id: 1, type: 'Annual Leave', startDate: '2026-10-10', endDate: '2026-10-12', status: 'Approved' },
    { id: 2, type: 'Sick Leave', startDate: '2026-11-01', endDate: '2026-11-01', status: 'Pending' }
  ];

  return (
    <div className="container my-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Employee Dashboard</h2>
        <a href="/" className="btn btn-outline-secondary btn-sm">Logout</a>
      </div>
      <hr />
      
      {/* Clock In/Out & PTO Cards */}
      <div className="row mb-4">
        <div className="col-md-6 mb-3">
          <div className="card p-3 text-center shadow-sm">
            <h5>Daily Attendance</h5>
            <p className="text-muted">Current Status: <strong>{clockedIn ? 'Clocked In' : 'Clocked Out'}</strong></p>
            <button 
              className={`btn ${clockedIn ? 'btn-danger' : 'btn-success'} w-50 mx-auto`}
              onClick={() => setClockedIn(!clockedIn)}
            >
              {clockedIn ? 'Clock Out' : 'Clock In'}
            </button>
          </div>
        </div>
        
        <div className="col-md-6 mb-3">
          <div className="card p-3 text-center shadow-sm">
            <h5>Remaining Paid Time Off (PTO)</h5>
            <h2 className="text-primary mt-2">12 Days</h2>
          </div>
        </div>
      </div>

      {/* Leave Request History */}
      <h4 className="mt-4">My Leave Requests</h4>
      <table className="table table-striped table-bordered mt-3">
        <thead className="table-dark">
          <tr>
            <th>Type</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {leaveRequests.map((req) => (
            <tr key={req.id}>
              <td>{req.type}</td>
              <td>{req.startDate}</td>
              <td>{req.endDate}</td>
              <td>
                <span className={`badge ${req.status === 'Approved' ? 'bg-success' : 'bg-warning text-dark'}`}>
                  {req.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default EmployeeDashboard;