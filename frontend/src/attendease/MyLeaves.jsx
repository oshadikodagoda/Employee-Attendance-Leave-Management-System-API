import { useEffect, useState } from 'react';
import Layout from './Layout';
import { employeeNav } from './EmployeeDashboard';
import { api, fmtDate, toList, leaveStart, leaveEnd, leaveType, leaveDays } from './api';
import StatusBadge from './StatusBadge';

const TYPES = ['Annual Leave', 'Sick Leave', 'Casual Leave', 'Unpaid Leave'];
const empty = { type: TYPES[0], startDate: '', endDate: '', reason: '' };

export default function MyLeaves() {
  const [leaves, setLeaves] = useState([]);
  const [form, setForm] = useState(empty);
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = () =>
    api
      .myLeaves()
      .then((v) => setLeaves(toList(v, 'leaves', 'leaveRequests')))
      .catch(() => setLeaves([]));

  useEffect(() => {
    load();
  }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (form.endDate < form.startDate) {
      setMsg({ ok: false, text: 'End date must be on or after the start date.' });
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      // Sent under both common names so it matches either backend style.
      await api.applyLeave({ ...form, leaveType: form.type, leave_type: form.type });
      setForm(empty);
      setMsg({ ok: true, text: 'Leave request submitted.' });
      load();
    } catch (err) {
      setMsg({ ok: false, text: err.message });
    } finally {
      setBusy(false);
    }
  };

  const sorted = [...leaves].sort((a, b) => new Date(leaveStart(b)) - new Date(leaveStart(a)));

  return (
    <Layout nav={employeeNav} title="My Leaves" subtitle="Apply for leave and track your requests.">
      <div className="ae-page-grid">
        <form className="ae-card ae-form" onSubmit={submit}>
          <h2>Apply for Leave</h2>
          <label>
            Leave Type
            <select value={form.type} onChange={set('type')}>
              {TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
          <div className="ae-form-row">
            <label>
              From
              <input type="date" value={form.startDate} onChange={set('startDate')} required />
            </label>
            <label>
              To
              <input type="date" value={form.endDate} onChange={set('endDate')} required />
            </label>
          </div>
          <label>
            Reason
            <textarea rows="3" value={form.reason} onChange={set('reason')} placeholder="Optional" />
          </label>
          {msg && <p className={msg.ok ? 'ae-ok' : 'ae-error'}>{msg.text}</p>}
          <button className="ae-btn" disabled={busy}>
            {busy ? 'Submitting…' : 'Submit Request'}
          </button>
        </form>

        <div className="ae-card">
          <h2>My Requests</h2>
          {sorted.length ? (
            <div className="ae-table-wrap">
              <table className="ae-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>From</th>
                    <th>To</th>
                    <th>Days</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((r) => (
                    <tr key={r.id}>
                      <td>{leaveType(r)}</td>
                      <td>{fmtDate(leaveStart(r))}</td>
                      <td>{fmtDate(leaveEnd(r))}</td>
                      <td>{leaveDays(r)}</td>
                      <td>
                        <StatusBadge status={r.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="ae-empty">You haven't requested any leave yet.</p>
          )}
        </div>
      </div>
    </Layout>
  );
}
