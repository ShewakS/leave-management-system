import React, { useEffect, useState } from 'react'
import axios from 'axios'

export default function AdminDashboard(){
  const [users, setUsers] = useState([]);
  const [msg, setMsg] = useState('');

  async function load(){
    try{
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } });
      setUsers(res.data);
    } catch(err){ setMsg('Failed to load users'); }
  }

  useEffect(()=>{ load() },[])

  async function updateUser(userId, changes){
    try{
      const token = localStorage.getItem('token');
      const res = await axios.post(`/api/admin/users/${userId}`, changes, { headers: { Authorization: `Bearer ${token}` } });
      setMsg('Updated');
      setUsers(users.map(u => u._id === res.data._id ? res.data : u));
    } catch(err){ setMsg(err.response?.data?.msg || 'Update failed'); }
  }

  return (
    <div className="card">
      <h2>Admin: User Management</h2>
      <div className="muted small" style={{marginBottom:8}}>{msg}</div>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Active</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u._id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>
                <select value={u.role} onChange={e=>updateUser(u._id, { role: e.target.value })}>
                  <option>Student</option>
                  <option>Faculty</option>
                  <option>HOD</option>
                  <option>Admin</option>
                </select>
              </td>
              <td>{u.isActive ? 'Yes' : 'No'}</td>
              <td>
                {u.isActive
                  ? <button className="btn" onClick={()=>updateUser(u._id, { isActive: false })}>Deactivate</button>
                  : <button className="btn" onClick={()=>updateUser(u._id, { isActive: true })}>Activate</button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}


