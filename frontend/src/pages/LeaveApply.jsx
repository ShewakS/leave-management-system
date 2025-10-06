import React, { useState } from 'react'
import axios from 'axios'

export default function LeaveApply(){
  const [reason, setReason] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [type, setType] = useState('Personal');
  const [file, setFile] = useState(null);
  const [msg, setMsg] = useState('');

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
      const res = await axios.post('/api/leaves/apply', fd, { headers: { Authorization: `Bearer ${token}` } });
      setMsg('Leave applied');
    } catch(err){
      setMsg(err.response?.data?.msg || err.response?.data?.errors?.[0]?.msg || 'Error applying');
      console.error(err);
    }
  }

  return (
    <div style={{padding:20}}>
      <h2>Apply Leave</h2>
      <form onSubmit={submit}>
        <div>
          <label>Reason</label><br/>
          <textarea value={reason} onChange={e=>setReason(e.target.value)} />
        </div>
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
          <label>Start</label>
          <input type="date" value={startDate} onChange={e=>setStartDate(e.target.value)} />
        </div>
        <div>
          <label>End</label>
          <input type="date" value={endDate} onChange={e=>setEndDate(e.target.value)} />
        </div>
        <div>
          <label>Document (optional)</label>
          <input type="file" onChange={e=>setFile(e.target.files[0])} />
        </div>
        <button type="submit">Apply</button>
      </form>
      <div>{msg}</div>
    </div>
  )
}
