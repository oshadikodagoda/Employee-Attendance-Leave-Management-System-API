import { useEffect, useState } from 'react';
import Layout from './Layout';
import { managerNav } from './ManagerDashboard';
import { api, initials, toList } from './api';

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [q, setQ] = useState('');
  const [role, setRole] = useState('All');

  useEffect(() => {
    api.employees().then((v) => setEmployees(toList(v, 'employees'))).catch(() => {});
    api.departments().then((v) => setDepartments(toList(v, 'departments'))).catch(() => {});
  }, []);

  const deptName = (e) =>
    e.department?.name ??
    e.Department?.name ??
    departments.find((d) => d.id === e.department_id)?.name ??
    '—';

  const shown = employees.filter(
    (e) =>
      (role === 'All' || String(e.role).toLowerCase() === role.toLowerCase()) &&
      `${e.name} ${e.email}`.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <Layout nav={managerNav} title="Employees" subtitle={`${employees.length} people in your organisation.`}>
      <div className="ae-card">
        <div className="ae-toolbar">
          <input
            className="ae-input"
            placeholder="Search by name or email…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <div className="ae-tabs">
            {['All', 'Employee', 'Manager', 'Admin'].map((r) => (
              <button key={r} className={role === r ? 'active' : ''} onClick={() => setRole(r)}>
                {r}
              </button>
            ))}
          </div>
        </div>

        {shown.length ? (
          <div className="ae-table-wrap">
            <table className="ae-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th>Leave Balance</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((e) => (
                  <tr key={e.id}>
                    <td>
                      <div className="ae-person">
                        <div className="ae-initials">{initials(e.name)}</div>
                        {e.name}
                      </div>
                    </td>
                    <td>{e.email}</td>
                    <td>{e.role}</td>
                    <td>{deptName(e)}</td>
                    <td>{e.pto_balance ?? '—'} days</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="ae-empty">No employees found.</p>
        )}
      </div>
    </Layout>
  );
}
