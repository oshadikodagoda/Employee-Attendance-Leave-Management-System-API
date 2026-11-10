import { useEffect, useState } from 'react';
import Layout from './Layout';
import { managerNav } from './ManagerDashboard';
import { api, toList, is, leaveStart, leaveEnd, leaveType, leaveName, leaveDays } from './api';

export default function Reports() {
  const [employees, setEmployees] = useState([]);
  const [leaves, setLeaves] = useState([]);

  useEffect(() => {
    api.employees().then((v) => setEmployees(toList(v, 'employees'))).catch(() => {});
    api.allLeaves().then((v) => setLeaves(toList(v, 'leaves', 'leaveRequests'))).catch(() => {});
  }, []);

  const approved = leaves.filter((l) => is(l.status, 'approved'));
  const daysTaken = approved.reduce((n, l) => n + leaveDays(l), 0);

  const summary = [
    ['Employees', employees.length],
    ['Leave Requests', leaves.length],
    ['Approved', approved.length],
    ['Pending', leaves.filter((l) => is(l.status, 'pending')).length],
    ['Rejected', leaves.filter((l) => is(l.status, 'rejected')).length],
    ['Days Taken', daysTaken],
  ];

  const byType = Object.entries(
    approved.reduce((m, l) => ({ ...m, [leaveType(l)]: (m[leaveType(l)] || 0) + leaveDays(l) }), {})
  ).sort((a, b) => b[1] - a[1]);
  const maxType = Math.max(1, ...byType.map(([, v]) => v));

  const byPerson = employees
    .map((e) => {
      const mine = approved.filter((l) => (l.employee_id ?? l.employeeId) === e.id || leaveName(l) === e.name);
      return { name: e.name, taken: mine.reduce((n, l) => n + leaveDays(l), 0), left: e.pto_balance };
    })
    .sort((a, b) => b.taken - a.taken);

  const exportCsv = () => {
    const lines = [
      ['Employee', 'Type', 'From', 'To', 'Days', 'Status'],
      ...leaves.map((l) => [
        leaveName(l), leaveType(l), leaveStart(l), leaveEnd(l), leaveDays(l), l.status,
      ]),
    ];
    const csv = lines.map((r) => r.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = 'leave-report.csv';
    a.click();
  };

  return (
    <Layout nav={managerNav} title="Reports" subtitle="Leave and attendance summary.">
      <div className="ae-report-stats">
        {summary.map(([k, v]) => (
          <div className="ae-card ae-stat" key={k}>
            <strong>{v}</strong>
            <span>{k}</span>
          </div>
        ))}
      </div>

      <div className="ae-page-grid" style={{ marginTop: 18 }}>
        <div className="ae-card">
          <h2>Approved Leave Days by Type</h2>
          {byType.length ? (
            <div className="ae-hbars">
              {byType.map(([type, days]) => (
                <div key={type} className="ae-hbar">
                  <span>{type}</span>
                  <div>
                    <i style={{ width: `${(days / maxType) * 100}%` }} />
                  </div>
                  <b>{days}</b>
                </div>
              ))}
            </div>
          ) : (
            <p className="ae-empty">No approved leave yet.</p>
          )}
        </div>

        <div className="ae-card">
          <div className="ae-section-head" style={{ marginTop: 0 }}>
            <h2 style={{ margin: 0 }}>Per Employee</h2>
            <button className="ae-link" onClick={exportCsv}>
              Export CSV
            </button>
          </div>
          {byPerson.length ? (
            <table className="ae-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Days Taken</th>
                  <th>Balance</th>
                </tr>
              </thead>
              <tbody>
                {byPerson.map((p) => (
                  <tr key={p.name}>
                    <td>{p.name}</td>
                    <td>{p.taken}</td>
                    <td>{p.left ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="ae-empty">No employees found.</p>
          )}
        </div>
      </div>
    </Layout>
  );
}
