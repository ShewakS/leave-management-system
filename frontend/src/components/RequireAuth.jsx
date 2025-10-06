import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Navigate } from 'react-router-dom'

export default function RequireAuth({ children }){
  const [loading, setLoading] = useState(true);
  const [ok, setOk] = useState(false);

  useEffect(()=>{
    async function check(){
      const token = localStorage.getItem('token');
      if (!token) { setOk(false); setLoading(false); return }
      try{
        const res = await axios.get('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } });
        setOk(true);
      } catch(err){ setOk(false); }
      setLoading(false);
    }
    check();
  },[])

  if (loading) return <div className="card">Checking authentication...</div>
  if (!ok) return <Navigate to="/login" replace />
  return children
}
