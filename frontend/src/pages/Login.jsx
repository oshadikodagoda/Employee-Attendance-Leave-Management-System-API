import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Employee');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (role === 'Employee') {
      navigate('/employee');
    } else {
      navigate('/manager');
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="card p-4 shadow" style={{ width: '380px' }}>
        <h3 className="text-center mb-4 text-primary">Attendance Portal</h3>
        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label">Email Address</label>
            <input 
              type="email" 
              className="form-control" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="user@company.com"
              required 
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="form-control" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="••••••••"
              required 
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Select Role:</label>
            <select className="form-select" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="Employee">Employee</option>
              <option value="Manager">Manager</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary w-100 mt-2">Login</button>
        </form>
      </div>
    </div>
  );
}

export default Login;