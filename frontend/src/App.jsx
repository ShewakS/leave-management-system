import React, { useEffect, useState } from 'react'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import Login from './pages/Login'
import StudentDashboard from './pages/StudentDashboard'
import LeaveApply from './pages/LeaveApply'
import TeacherDashboard from './pages/TeacherDashboard'
import Register from './pages/Register'
import AdminDashboard from './pages/AdminDashboard'
import RequireAuth from './components/RequireAuth'
import './styles.css'

export default function App(){
  const [role, setRole] = useState(localStorage.getItem('role') || '');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(()=>{
    setRole(localStorage.getItem('role')||'')
    async function loadUser(){
      const token = localStorage.getItem('token');
      if (!token) return;
      try{
        const res = await axios.get('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } });
        setUser(res.data);
      } catch(err){
        setUser(null);
      }
    }
    loadUser();
  },[])

  function logout(){
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setRole('');
    navigate('/login');
  }

  return (
    <div>
      <nav className="appbar">
        <div className="container" style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <div className="logo">🎓</div>
          </div>

          <div style={{display:'flex',alignItems:'center',gap:24}}>
            <div className="nav-links">
              {role==='Student' && <Link to="/apply">Apply Leave</Link>}
              {(role==='Faculty' || role==='HOD') && <Link to="/teacher">Approvals</Link>}
              <Link to="/">History</Link>
              {role==='Admin' && <Link to="/admin">Admin</Link>}
            </div>
            <div>
              <input className="search" placeholder="Search students, leaves..." />
            </div>
          </div>

          <div style={{display:'flex',alignItems:'center',gap:12}}>
            {!role ? (
              <>
                <Link to="/login" className="btn secondary">Login</Link>
                <Link to="/register" className="btn secondary">Create account</Link>
              </>
            ) : (
              <div className="user-chip">
                <div className="avatar">{user?.name?.split(' ').map(n=>n[0]).slice(0,2).join('')}</div>
                <div style={{marginLeft:8}}>
                  <div style={{fontWeight:700}}>{user?.name || 'User'}</div>
                  <div className="small muted">{user?.role || role}</div>
                </div>
                <button className="btn ghost" style={{marginLeft:12}} onClick={logout}>Logout</button>
              </div>
            )}
          </div>
        </div>
      </nav>
      <div className="container" style={{marginTop:18}}>
        <Routes>
          <Route path="/" element={<RequireAuth><StudentDashboard/></RequireAuth>} />
          <Route path="/login" element={<Login/>} />
          <Route path="/apply" element={<LeaveApply/>} />
          <Route path="/register" element={<Register/>} />
          <Route path="/teacher" element={<RequireAuth><TeacherDashboard/></RequireAuth>} />
          <Route path="/admin" element={<RequireAuth><AdminDashboard/></RequireAuth>} />
        </Routes>
      </div>
    </div>
  )
}
