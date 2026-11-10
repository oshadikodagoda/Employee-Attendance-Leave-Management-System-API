// All backend calls live here. If your Express routes use different paths,
// change them in this one file only.
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function request(path, options = {}) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`);
  return data;
}

const post = (path, body) =>
  request(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined });

// Values your backend stores for leave status. Change if yours differ.
export const STATUS = { pending: 'Pending', approved: 'Approved', rejected: 'Rejected' };

export const api = {
  // auth
  login: (email, password) => post('/auth/login', { email, password }),

  // employee
  todayAttendance: () => request('/attendance/today'),
  checkIn: () => post('/attendance/check-in'),
  checkOut: () => post('/attendance/check-out'),
  myAttendance: () => request('/attendance/my'),
  myLeaves: () => request('/leaves/my'),
  leaveBalance: () => request('/leaves/balance'),
  applyLeave: (data) => post('/leaves', data),
  me: () => request('/auth/me'),

  // manager
  employees: () => request('/employees'),
  allLeaves: () => request('/leaves'),
  departments: () => request('/departments'),
  weeklyAttendance: () => request('/attendance/weekly'),
  updateLeave: (id, status) =>
    request(`/leaves/${id}`, { method: 'PUT', body: JSON.stringify({ status }) }),
};

// ---- helpers that tolerate different response / column shapes ----
export const toList = (v, ...keys) => {
  if (Array.isArray(v)) return v;
  for (const k of [...keys, 'data', 'rows', 'items']) if (Array.isArray(v?.[k])) return v[k];
  return [];
};
export const is = (status, key) => String(status || '').toLowerCase() === key;

export const leaveStart = (r) => r.startDate ?? r.start_date;
export const leaveEnd = (r) => r.endDate ?? r.end_date ?? leaveStart(r);
export const leaveType = (r) => r.type ?? r.leaveType ?? r.leave_type ?? 'Leave';
export const leaveName = (r) =>
  r.employee?.name ?? r.Employee?.name ?? r.User?.name ?? r.name ?? 'Employee';
export const leaveDays = (r) => {
  const s = new Date(leaveStart(r));
  const e = new Date(leaveEnd(r));
  return Math.max(1, Math.round((e - s) / 86400000) + 1);
};

export const logIn = (r) => r.checkIn ?? r.check_in ?? r.checkInTime;
export const logOut = (r) => r.checkOut ?? r.check_out ?? r.checkOutTime;

export function getUser() {
  try {
    return JSON.parse(localStorage.getItem('user')) || {};
  } catch {
    return {};
  }
}

export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

export const fmtTime = (d) =>
  d ? new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--';

export const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

export const fmtShort = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';

export const initials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('') || '?';
