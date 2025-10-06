import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

export default function Register(){
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Student');
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  async function submit(e){
    e.preventDefault();
    try{
      const res = await axios.post('/api/auth/register', { name, email, password, role });
      // Admin accounts get token immediately; others wait for activation
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('role', role);
        setMsg(res.data.msg || 'Account created');
        if (role === 'Admin') { navigate('/admin'); window.location.reload(); }
        else if (role === 'Student') navigate('/');
        else { navigate('/teacher'); window.location.reload(); }
      } else {
        setMsg(res.data.msg || 'Account created. Wait for admin activation.');
      }
    } catch(err){
      setMsg(err.response?.data?.msg || 'Error');
    }
  }

  return (
    <div className="card" style={{maxWidth:520, margin:'24px auto'}}>
      <h2>Create account</h2>
      <form onSubmit={submit} style={{display:'grid', gap:10}}>
        <label className="muted">Role</label>
        <select value={role} onChange={e=>setRole(e.target.value)}>
          <option>Student</option>
          <option>Faculty</option>
          <option>HOD</option>
          <option>Admin</option>
        </select>
        <label className="muted">Name</label>
        <input value={name} onChange={e=>setName(e.target.value)} />
        <label className="muted">Email</label>
        <input value={email} onChange={e=>setEmail(e.target.value)} />
        <label className="muted">Password</label>
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button className="btn" type="submit">Create account</button>
      </form>
      <div style={{marginTop:8}}>{msg}</div>
    </div>
  )
}
