import { useEffect, useState } from 'react';
import Layout from './Layout';
import { managerNav } from './ManagerDashboard';
import StatusBadge from './StatusBadge';
import {
  api, fmtDate, initials, toList, is, STATUS,
  leaveStart, leaveEnd, leaveType, leaveName, leaveDays,
} from './api';

const FILTERS = ['pending', 'approved', 'rejected', 'all'];

export default function LeaveRequests() {
  const [leaves, setLeaves] = useState([]);
  const [filter, setFilter] = useState('pending');

  const load = () =>
    api
      .allLeaves()
      .then((v) => setLeaves(toList(v, 'leaves', 'leaveRequests')))
      .catch(() => setLeaves([]));

  useEffect(() => {
    load();
  }, []);

  const decide = async (id, status) => {
    try {
      await api.updateLeave(id, status);
      setLeaves((all) => all.map((l) => (l.id === id ? { ...l, status } : l)));
    } catch (err) {
      alert(err.message);
    }
  };

  const count = (f) => (f === 'all' ? leaves.length : leaves.filter((l) => is(l.status, f)).length);
  const shown = leaves
    .filter((l) => filter === 'all' || is(l.status, filter))
    .sort((a, b) => new Date(leaveStart(b)) - new Date(leaveStart(a)));

  return (
    <Layout nav={managerNav} title="Leave Requests" subtitle="Review and respond to your team's requests.">
      <div className="ae-card">
        <div className="ae-toolbar">
          <div className="ae-tabs">
            {FILTERS.map((f) => (
              <button key={f} className={filter === f ? 'active' : ''} onClick={() => setFilter(f)}>
                {f.charAt(0).toUpperCase() + f.slice(1)} <em>{count(f)}</em>
              </button>
            ))}
          </div>
        </div>

        {shown.length ? (
          <div className="ae-table-wrap">
            <table className="ae-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Type</th>
                  <th>Dates</th>
                  <th>Days</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {shown.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <div className="ae-person">
                        <div className="ae-initials">{initials(leaveName(r))}</div>
                        {leaveName(r)}
                      </div>
                    </td>
                    <td>{leaveType(r)}</td>
                    <td>
                      {fmtDate(leaveStart(r))} – {fmtDate(leaveEnd(r))}
                    </td>
                    <td>{leaveDays(r)}</td>
                    <td className="ae-muted-cell">{r.reason || '—'}</td>
                    <td>
                      <StatusBadge status={r.status} />
                    </td>
                    <td>
                      {is(r.status, 'pending') && (
                        <div className="ae-actions">
                          <button className="ae-pill solid" onClick={() => decide(r.id, STATUS.approved)}>
                            Approve
                          </button>
                          <button className="ae-pill ghost" onClick={() => decide(r.id, STATUS.rejected)}>
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="ae-empty">Nothing here.</p>
        )}
      </div>
    </Layout>
  );
}
