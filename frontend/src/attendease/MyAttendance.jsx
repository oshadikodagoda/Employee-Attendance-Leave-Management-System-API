import { useEffect, useState } from 'react';
import Layout from './Layout';
import { employeeNav } from './EmployeeDashboard';
import { api, fmtDate, fmtTime, toList, logIn, logOut } from './api';

const hours = (a, b) => {
  if (!a || !b) return '—';
  const h = (new Date(b) - new Date(a)) / 3600000;
  return `${Math.floor(h)}h ${Math.round((h % 1) * 60)}m`;
};

export default function MyAttendance() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    api
      .myAttendance()
      .then((v) => setRows(toList(v, 'records', 'logs')))
      .catch(() => setRows([]));
  }, []);

  const sorted = [...rows].sort(
    (a, b) => new Date(logIn(b) || b.date) - new Date(logIn(a) || a.date)
  );

  return (
    <Layout nav={employeeNav} title="My Attendance" subtitle="Your check-in history.">
      <div className="ae-card">
        {sorted.length ? (
          <div className="ae-table-wrap">
            <table className="ae-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Worked</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((r, i) => (
                  <tr key={r.id ?? i}>
                    <td>{fmtDate(r.date || logIn(r))}</td>
                    <td>{fmtTime(logIn(r))}</td>
                    <td>{logOut(r) ? fmtTime(logOut(r)) : '—'}</td>
                    <td>{hours(logIn(r), logOut(r))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="ae-empty">No attendance records yet.</p>
        )}
      </div>
    </Layout>
  );
}
