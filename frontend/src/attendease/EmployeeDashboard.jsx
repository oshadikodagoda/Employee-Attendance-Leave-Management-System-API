import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from './Layout';
import { Home, Calendar, User, Check, Briefcase, ArrowRight } from './icons';
import { api, getUser, fmtTime, fmtDate, toList, is, leaveStart, logIn, logOut } from './api';

export const employeeNav = [
  { to: '/dashboard', label: 'Dashboard', Icon: Home, end: true },
  { to: '/leaves', label: 'My Leaves', Icon: Calendar },
  { to: '/profile', label: 'Profile', Icon: User },
];

export default function EmployeeDashboard() {
  const user = getUser();
  const firstName = (user.name || 'there').split(' ')[0];

  const [today, setToday] = useState(null); // { checkIn, checkOut }
  const [balance, setBalance] = useState(null);
  const [upcoming, setUpcoming] = useState(null);
  const [activity, setActivity] = useState([]);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const [t, b, l, a] = await Promise.allSettled([
      api.todayAttendance(),
      api.leaveBalance(),
      api.myLeaves(),
      api.myAttendance(),
    ]);
    if (t.status === 'fulfilled') setToday(t.value);
    if (b.status === 'fulfilled') {
      const v = b.value;
      setBalance(typeof v === 'object' ? v.balance ?? v.pto_balance ?? v.remaining ?? null : v);
    } else if (user.pto_balance != null) {
      setBalance(user.pto_balance);
    }
    if (l.status === 'fulfilled') {
      const leaves = toList(l.value, 'leaves', 'leaveRequests');
      const next = leaves
        .filter((x) => new Date(leaveStart(x)) >= new Date() && !is(x.status, 'rejected'))
        .sort((a, b) => new Date(leaveStart(a)) - new Date(leaveStart(b)))[0];
      setUpcoming(next ? leaveStart(next) : null);
    }
    if (a.status === 'fulfilled') {
      const rows = toList(a.value, 'records', 'logs');
      const events = rows.flatMap((r) => [
        logIn(r) && { type: 'in', time: logIn(r) },
        logOut(r) && { type: 'out', time: logOut(r) },
      ]);
      setActivity(
        events
          .filter(Boolean)
          .sort((x, y) => new Date(y.time) - new Date(x.time))
          .slice(0, 5)
      );
    }
  };

  useEffect(() => {
    load();
  }, []);

  const tIn = today && logIn(today);
  const tOut = today && logOut(today);
  const checkedIn = Boolean(tIn && !tOut);

  const toggle = async () => {
    setBusy(true);
    try {
      await (checkedIn ? api.checkOut() : api.checkIn());
      await load();
    } catch (err) {
      alert(err.message);
    } finally {
      setBusy(false);
    }
  };

  const label = (d) => {
    const date = new Date(d);
    const isToday = date.toDateString() === new Date().toDateString();
    return `${isToday ? 'Today' : fmtDate(d)} • ${fmtTime(d)}`;
  };

  return (
    <Layout nav={employeeNav} title={`Hello, ${firstName}!`} subtitle="Here's your overview for today.">
      <div className="ae-stack">
        <div className="ae-card ae-status">
          <div className={`ae-status-icon ${checkedIn ? '' : 'off'}`}>
            <Check size={30} strokeWidth={3} />
          </div>
          <div className="ae-status-text">
            <small>You are</small>
            <h3>{checkedIn ? 'Checked In' : tOut ? 'Checked Out' : 'Not Checked In'}</h3>
            <span>{checkedIn ? fmtTime(tIn) : tOut ? fmtTime(tOut) : '—'}</span>
          </div>
          <div className="ae-divider" />
          <button className="ae-btn-outline" onClick={toggle} disabled={busy}>
            {checkedIn ? 'Check Out' : 'Check In'}
          </button>
        </div>

        <div className="ae-grid-2">
          <div className="ae-card ae-info">
            <Briefcase size={30} strokeWidth={1.8} />
            <div>
              <small>Leave Balance</small>
              <strong>
                {balance ?? '—'}
                <em>days</em>
              </strong>
            </div>
          </div>
          <div className="ae-card ae-info">
            <Calendar size={30} strokeWidth={1.8} />
            <div>
              <small>Upcoming Leave</small>
              <strong>{upcoming ? fmtDate(upcoming) : 'None'}</strong>
            </div>
          </div>
        </div>

        <div>
          <div className="ae-section-head">
            <h2>Recent Activity</h2>
            <Link className="ae-link" to="/attendance">
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="ae-card" style={{ padding: '6px 24px' }}>
            {activity.length ? (
              <ul className="ae-activity">
                {activity.map((e, i) => (
                  <li key={i}>
                    <span className={`ae-dot ${e.type === 'out' ? 'out' : ''}`} />
                    <div>
                      <b>{e.type === 'in' ? 'Checked In' : 'Checked Out'}</b>
                      <span>{label(e.time)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="ae-empty">No activity yet.</p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
