import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'

export default function Login(){
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Student');
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  async function submit(e){
    e.preventDefault();
    try{
      // in a full app we'd send role-aware login; for scaffold, we just store role locally
      const res = await axios.post('/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      // fetch user profile to get role
      try{
        const me = await axios.get('/api/auth/me', { headers: { Authorization: `Bearer ${res.data.token}` } });
        localStorage.setItem('role', me.data.role);
        setMsg('Logged in');
  // Navigate to teacher approvals for non-students
  if (me.data.role === 'Student') navigate('/');
  else { navigate('/teacher'); window.location.reload(); }
      } catch(err){
        setMsg('Logged in but failed to load profile');
        navigate('/');
      }
    } catch(err){
      setMsg(err.response?.data?.msg || 'Error');
    }
  }

  return (
    <div className="card" style={{maxWidth:520, margin:'24px auto'}}>
      <h2>Login</h2>
      <form onSubmit={submit} style={{display:'grid', gap:10}}>
        <label className="muted">Role</label>
        <select value={role} onChange={e=>setRole(e.target.value)}>
          <option>Student</option>
          <option>Faculty</option>
          <option>HOD</option>
        </select>

        <label className="muted">Email</label>
        <input value={email} onChange={e=>setEmail(e.target.value)} />

        <label className="muted">Password</label>
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} />

        <div style={{display:'flex', gap:8}}>
          <button className="btn" type="submit">Login</button>
        </div>
        <div style={{marginTop:6}}><Link to="/register">Create account</Link></div>
      </form>
      <div style={{marginTop:8}}>{msg}</div>
    </div>
  )
}
