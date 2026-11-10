import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from './Layout';
import { Home, Users, FileText, BarChart, Calendar, Clock, ArrowRight } from './icons';
import { api, fmtShort, initials, toList, is, STATUS, leaveStart, leaveEnd, leaveType, leaveName } from './api';

export const managerNav = [
  { to: '/manager', label: 'Dashboard', Icon: Home, end: true },
  { to: '/manager/employees', label: 'Employees', Icon: Users },
  { to: '/manager/leaves', label: 'Leave Requests', Icon: FileText },
  { to: '/manager/reports', label: 'Reports', Icon: BarChart },
];

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

export default function ManagerDashboard() {
  const [stats, setStats] = useState({ total: 0, onLeave: 0, late: 0 });
  const [week, setWeek] = useState(DAYS.map((day) => ({ day, count: 0 })));
  const [pending, setPending] = useState([]);

  const load = async () => {
    const [e, l, w] = await Promise.allSettled([
      api.employees(),
      api.allLeaves(),
      api.weeklyAttendance(),
    ]);

    const employees = e.status === 'fulfilled' ? toList(e.value, 'employees') : [];
    const leaves = l.status === 'fulfilled' ? toList(l.value, 'leaves', 'leaveRequests') : [];

    const now = new Date();
    const onLeave = leaves.filter(
      (x) => is(x.status, 'approved') && new Date(leaveStart(x)) <= now && new Date(leaveEnd(x)) >= now
    ).length;

    let late = 0;
    if (w.status === 'fulfilled') {
      const rows = toList(w.value, 'days');
      setWeek(DAYS.map((day) => ({ day, count: rows.find((r) => r.day === day)?.count ?? 0 })));
      late = w.value.lateToday ?? 0;
    }

    setStats({ total: employees.length, onLeave, late });
    setPending(leaves.filter((x) => is(x.status, 'pending')).slice(0, 5));
  };

  useEffect(() => {
    load();
  }, []);

  const decide = async (id, status) => {
    try {
      await api.updateLeave(id, status);
      setPending((p) => p.filter((x) => x.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const max = Math.max(50, ...week.map((d) => d.count));
  const ticks = [max, Math.round(max / 2), 0];

  return (
    <Layout nav={managerNav} title="Manager Dashboard" subtitle="Overview at a glance.">
      <div className="ae-grid-3">
        <div className="ae-card ae-stat">
          <Users size={22} />
          <strong>{stats.total}</strong>
          <span>Total Employees</span>
        </div>
        <div className="ae-card ae-stat">
          <Calendar size={22} />
          <strong>{stats.onLeave}</strong>
          <span>On Leave</span>
        </div>
        <div className="ae-card ae-stat">
          <Clock size={22} />
          <strong>{stats.late}</strong>
          <span>Late Today</span>
        </div>
      </div>

      <div className="ae-manager-grid">
        <div className="ae-card">
          <h2>Attendance Overview</h2>
          <div className="ae-chart">
            <div className="ae-chart-y">
              {ticks.map((t) => (
                <span key={t}>{t}</span>
              ))}
            </div>
            <div className="ae-chart-plot">
              {week.map((d) => (
                <div
                  key={d.day}
                  className="ae-bar"
                  style={{ height: `${(d.count / max) * 100}%` }}
                  title={`${d.day}: ${d.count}`}
                >
                  <span>{d.day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="ae-card">
          <div className="ae-section-head" style={{ marginTop: 0 }}>
            <h2 style={{ margin: 0 }}>Pending Leave Requests</h2>
            <Link className="ae-link" to="/manager/leaves">
              View All <ArrowRight size={14} />
            </Link>
          </div>

          {pending.length ? (
            pending.map((r) => {
              const name = leaveName(r);
              const range =
                fmtShort(leaveStart(r)) === fmtShort(leaveEnd(r))
                  ? fmtShort(leaveStart(r))
                  : `${fmtShort(leaveStart(r))} – ${fmtShort(leaveEnd(r))}`;
              return (
                <div className="ae-request" key={r.id}>
                  <div className="ae-initials">{initials(name)}</div>
                  <div className="ae-request-info">
                    <b>{name}</b>
                    <span>
                      {leaveType(r)} • {range}
                    </span>
                  </div>
                  <button className="ae-pill solid" onClick={() => decide(r.id, STATUS.approved)}>
                    Approve
                  </button>
                  <button className="ae-pill ghost" onClick={() => decide(r.id, STATUS.rejected)}>
                    Reject
                  </button>
                </div>
              );
            })
          ) : (
            <p className="ae-empty">No pending requests.</p>
          )}
        </div>
      </div>
    </Layout>
  );
}
