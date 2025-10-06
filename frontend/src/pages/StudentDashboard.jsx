import React, { useEffect, useState } from 'react'
import axios from 'axios'

export default function StudentDashboard(){
  const [leaves, setLeaves] = useState([]);
  const [reason, setReason] = useState('');
  const [type, setType] = useState('Personal');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [file, setFile] = useState(null);
  const [msg, setMsg] = useState('');
  const [balance, setBalance] = useState({ Medical:10, Personal:5 });

  async function load(){
    try{
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/leaves', { headers: { Authorization: `Bearer ${token}` } });
      setLeaves(res.data);
    } catch(err){
      console.error(err);
    }
  }

  useEffect(()=>{ load() },[])
  // Poll for updates every 5 seconds so teacher approvals reflect in near-real-time
  useEffect(()=>{
    const id = setInterval(()=>{ load() }, 5000);
    return ()=>clearInterval(id);
  },[])

  async function submit(e){
    e.preventDefault();
    try{
      const token = localStorage.getItem('token');
      const fd = new FormData();
      fd.append('reason', reason);
      fd.append('startDate', startDate);
      fd.append('endDate', endDate);
      fd.append('type', type);
      if (file) fd.append('document', file);
      await axios.post('/api/leaves/apply', fd, { headers: { Authorization: `Bearer ${token}` } });
      setMsg('Leave applied');
      setReason(''); setStartDate(''); setEndDate(''); setFile(null);
      load();
    } catch(err){
      setMsg(err.response?.data?.msg || err.response?.data?.errors?.[0]?.msg || 'Error applying');
      console.error(err);
    }
  }

  return (
    <div>
      <div className="grid">
        <div>
          <div className="card">
            <h2>Apply for Leave</h2>
            <form onSubmit={submit} style={{display:'grid', gap:12}}>
              <div>
                <label>Type</label>
                <select value={type} onChange={e=>setType(e.target.value)}>
                  <option>Personal</option>
                  <option>Medical</option>
                  <option>Academic</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label>Reason</label>
                <textarea value={reason} onChange={e=>setReason(e.target.value)} />
              </div>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
                <div>
                  <label>Start date</label>
                  <input type="date" value={startDate} onChange={e=>setStartDate(e.target.value)} />
                </div>
                <div>
                  <label>End date</label>
                  <input type="date" value={endDate} onChange={e=>setEndDate(e.target.value)} />
                </div>
              </div>
              <div>
                <label>Document (optional)</label>
                <input type="file" onChange={e=>setFile(e.target.files[0])} />
              </div>
              <div style={{display:'flex', gap:8}}>
                <button className="btn" type="submit">Apply</button>
                <button type="button" className="btn secondary" onClick={()=>{ setReason(''); setStartDate(''); setEndDate(''); setFile(null); }}>Reset</button>
              </div>
              <div className="muted small">{msg}</div>
            </form>
          </div>

          <div style={{marginTop:18}} className="card">
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <h3>Leave History</h3>
              <button className="btn" onClick={load} style={{height:32}}>Refresh</button>
            </div>
            <table>
              <thead><tr><th>Reason</th><th>From</th><th>To</th><th>Approvals</th><th>Overall</th></tr></thead>
              <tbody>
                {leaves.map(l=> (
                  <tr key={l._id}>
                    <td style={{maxWidth:240, whiteSpace:'normal'}}>{l.reason}</td>
                    <td>{new Date(l.startDate).toLocaleDateString()}</td>
                    <td>{new Date(l.endDate).toLocaleDateString()}</td>
                    <td>
                      {Array.isArray(l.approvals) && l.approvals.map(a => (
                        <div key={a.role} style={{fontSize:12}}><strong>{a.role}:</strong> {a.action}{a.by ? ' • by ' + (a.by.name || a.by) : ''}</div>
                      ))}
                    </td>
                    <td>{l.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <aside>
          <div className="card">
            <h4>Leave Balance</h4>
            <div className="balance">
              <div>
                <div className="small">Medical</div>
                <div style={{fontWeight:700}}>{balance.Medical}</div>
              </div>
              <div>
                <div className="small">Personal</div>
                <div style={{fontWeight:700}}>{balance.Personal}</div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
