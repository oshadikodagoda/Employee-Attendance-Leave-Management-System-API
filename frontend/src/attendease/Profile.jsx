import { useEffect, useState } from 'react';
import Layout from './Layout';
import { employeeNav } from './EmployeeDashboard';
import { api, getUser, initials, fmtDate } from './api';

export default function Profile() {
  const [user, setUser] = useState(getUser());

  useEffect(() => {
    api
      .me()
      .then((v) => setUser({ ...getUser(), ...(v.user || v.employee || v) }))
      .catch(() => {});
  }, []);

  const rows = [
    ['Full Name', user.name],
    ['Email', user.email],
    ['Role', user.role],
    ['Department', user.department?.name ?? user.Department?.name ?? user.department_id ?? '—'],
    ['Leave Balance', user.pto_balance != null ? `${user.pto_balance} days` : '—'],
    ['Member Since', user.createdAt ? fmtDate(user.createdAt) : '—'],
  ];

  return (
    <Layout nav={employeeNav} title="Profile" subtitle="Your account details.">
      <div className="ae-card ae-profile">
        <div className="ae-profile-head">
          <div className="ae-avatar ae-avatar-lg">{initials(user.name)}</div>
          <div>
            <h2>{user.name || 'Unknown user'}</h2>
            <span>{user.email}</span>
          </div>
        </div>
        <dl className="ae-details">
          {rows.map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{v || '—'}</dd>
            </div>
          ))}
        </dl>
      </div>
    </Layout>
  );
}
