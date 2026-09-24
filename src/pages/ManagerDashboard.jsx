import React, { useState } from 'react';

function ManagerDashboard() {
  const [requests, setRequests] = useState([
    { id: 101, employee: 'John Doe', type: 'Casual Leave', dates: '2026-10-05 to 2026-10-06' },
    { id: 102, employee: 'Jane Smith', type: 'Sick Leave', dates: '2026-10-08 to 2026-10-08' }
  ]);

  const handleAction = (id, action) => {
    setRequests(requests.filter(req => req.id !== id));
    alert(`Request ${action}!`);
  };

  return (
    <div className="container my-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Manager Approval Dashboard</h2>
        <a href="/" className="btn btn-outline-secondary btn-sm">Logout</a>
      </div>
      <hr />

      <h4 className="mt-4">Pending Leave Requests</h4>
      <table className="table table-bordered table-hover mt-3">
        <thead className="table-dark">
          <tr>
            <th>Employee Name</th>
            <th>Leave Type</th>
            <th>Dates</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {requests.length > 0 ? (
            requests.map((req) => (
              <tr key={req.id}>
                <td>{req.employee}</td>
                <td>{req.type}</td>
                <td>{req.dates}</td>
                <td>
                  <button className="btn btn-success btn-sm me-2" onClick={() => handleAction(req.id, 'Approved')}>
                    Approve
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleAction(req.id, 'Rejected')}>
                    Reject
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center text-muted">No pending requests</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ManagerDashboard;