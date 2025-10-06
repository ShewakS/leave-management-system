import React, { useEffect, useState } from 'react'
import axios from 'axios'

export default function TeacherDashboard(){
  const [leaves, setLeaves] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const role = localStorage.getItem('role') || '';

  useEffect(()=>{
    async function load(){
      try{
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/leaves', { headers: { Authorization: `Bearer ${token}` } });
        setLeaves(res.data);
      } catch(err){
        console.error(err);
      }
    }
    load();
  },[])

  function toggle(id){
    // create a new Set for immutable update
    const s = new Set(selected);
    if (s.has(id)) s.delete(id); else s.add(id);
    setSelected(s);
  }

  function isPendingForRole(leave){
    if (!leave || !Array.isArray(leave.approvals)) return false;
    return leave.approvals.some(a => a.role === role && a.action === 'Pending');
  }

  async function bulk(action){
    try{
      if (!selected || selected.size === 0) return alert('No leaves selected');
      const token = localStorage.getItem('token');
      const res = await axios.post('/api/leaves/approve', { leaveIds: Array.from(selected), action }, { headers: { Authorization: `Bearer ${token}` } });
      alert(`Updated ${res.data.updated}`)
      // Update local leaves state with returned results
      const updated = res.data.results || [];
      if (updated.length) {
        setLeaves(prev => {
          const map = new Map(prev.map(l=>[l._id,l]));
          for (const u of updated) map.set(u._id, u);
          return Array.from(map.values());
        });
      }
      // clear selection
      setSelected(new Set());
    } catch(err){
      console.error(err); alert('Error')
    }
  }

  return (
    <div className="grid">
      <div>
        <h3>Pending Leaves</h3>
        <div className="card">
          <table>
            <thead><tr><th></th><th>Student</th><th>Reason</th><th>From</th><th>To</th><th>Status</th></tr></thead>
            <tbody>
              {leaves.map(l=> (
                <tr key={l._id}>
                  <td>
                    {isPendingForRole(l) ? (
                      <input
                        type="checkbox"
                        checked={selected.has(l._id)}
                        onChange={() => toggle(l._id)}
                      />
                    ) : (
                      <div style={{fontSize:12, color:'#666'}}>—</div>
                    )}
                  </td>
                  <td>{l.student?.name}</td>
                  <td>{l.reason}</td>
                  <td>{new Date(l.startDate).toLocaleDateString()}</td>
                  <td>{new Date(l.endDate).toLocaleDateString()}</td>
                  <td>{l.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <aside>
        <div className="card">
          <h4>Actions</h4>
          <button className="btn" onClick={()=>bulk('Approved')} disabled={selected.size===0}>Approve Selected</button>
          <button className="btn" style={{marginTop:8, background:'#dc2626'}} onClick={()=>bulk('Rejected')} disabled={selected.size===0}>Reject Selected</button>
        </div>
      </aside>
    </div>
  )
}
