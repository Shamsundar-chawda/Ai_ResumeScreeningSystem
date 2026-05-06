import React, { useState, useEffect } from 'react';
import DashboardCharts from './DashboardCharts';

const AdminDashboard = () => {
  const [candidates, setCandidates] = useState([]);
  const [jobDescription, setJobDescription] = useState({ title: '', requiredSkills: '' });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('list'); // 'list' or 'analytics'
  const [searchQuery, setSearchQuery] = useState('');
  const [scoreFilter, setScoreFilter] = useState('all'); // 'all', 'high', 'medium', 'low'
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [jdRes, candRes] = await Promise.all([
        fetch('http://localhost:8081/api/jobDescription'),
        fetch('http://localhost:8081/api/rankCandidates')
      ]);
      
      const jdData = await jdRes.json();
      if (jdData.length > 0) {
        setJobDescription(jdData[0]);
      }
      
      const candData = await candRes.json();
      setCandidates(candData);
    } catch (error) {
      console.error("Error fetching data", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleJdSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch('http://localhost:8081/api/jobDescription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobDescription)
      });
      fetchData(); // Refresh to get updated scores
    } catch (error) {
      console.error("Error saving JD", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:8081/api/candidates/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setCandidates(prev => prev.filter(c => c.id !== id));
      } else {
        alert("Failed to delete candidate. Please try again.");
      }
    } catch (error) {
      console.error("Error deleting", error);
      alert("Error deleting candidate.");
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const response = await fetch(`http://localhost:8081/api/candidates/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        setCandidates(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
      }
    } catch (error) {
      console.error("Error updating status", error);
    }
  };

  const getPreviewUrl = (path) => {
    if (!path) return '#';
    const filename = path.replace(/^.*[\\/]/, '');
    return `http://localhost:8081/api/files/${filename}`;
  };

  // Filtering logic
  const filteredCandidates = candidates.filter(c => {
    const matchesSearch = searchQuery === '' || 
      (c.name && c.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.skills && c.skills.toLowerCase().includes(searchQuery.toLowerCase()));

    let matchesScore = true;
    if (scoreFilter === 'high') matchesScore = c.score >= 70;
    else if (scoreFilter === 'medium') matchesScore = c.score >= 40 && c.score < 70;
    else if (scoreFilter === 'low') matchesScore = c.score < 40;

    let matchesStatus = true;
    if (statusFilter !== 'all') matchesStatus = (c.status || 'New') === statusFilter;

    return matchesSearch && matchesScore && matchesStatus;
  });

  // CSV Export
  const handleExportCSV = () => {
    const headers = ['Name', 'Email', 'Skills', 'Experience', 'Score (%)', 'Status', 'Skill Gaps', 'AI Summary'];
    const rows = filteredCandidates.map(c => [
      c.name || '',
      c.email || '',
      `"${(c.skills || '').replace(/"/g, '""')}"`,
      c.experience || '',
      c.score ? c.score.toFixed(1) : '0',
      c.status || 'New',
      `"${(c.skillGaps || '').replace(/"/g, '""')}"`,
      `"${(c.aiSummary || '').replace(/"/g, '""')}"`
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `candidates_export_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusBadgeClass = (status) => {
    switch ((status || 'New').toLowerCase()) {
      case 'shortlisted': return 'status-badge shortlisted';
      case 'interviewed': return 'status-badge interviewed';
      case 'hired': return 'status-badge hired';
      case 'rejected': return 'status-badge rejected';
      default: return 'status-badge new';
    }
  };

  const statusOptions = ['New', 'Shortlisted', 'Interviewed', 'Hired', 'Rejected'];

  return (
    <div className="animate-fade-in" style={{ padding: '1rem 0' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        
        {/* JD Form Column */}
        <div>
          <div className="glass-panel" style={{ position: 'sticky', top: '100px' }}>
            <h3>Job Description Setup</h3>
            <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>Define required skills to match against candidate resumes.</p>
            
            <form onSubmit={handleJdSubmit}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Job Title</label>
              <input 
                type="text" 
                value={jobDescription.title}
                onChange={(e) => setJobDescription({...jobDescription, title: e.target.value})}
                placeholder="e.g. Senior Software Engineer"
                required
              />
              
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Required Skills (comma separated)</label>
              <textarea 
                rows="4"
                value={jobDescription.requiredSkills}
                onChange={(e) => setJobDescription({...jobDescription, requiredSkills: e.target.value})}
                placeholder="java, spring boot, react, mysql"
                required
              />
              
              <button type="submit" className="btn-primary" style={{ width: '100%' }}>Update & Rescore All</button>
            </form>
          </div>
        </div>

        {/* Main Content Column */}
        <div>
          <div className="glass-panel">
            <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--surface-border)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
              <button 
                onClick={() => setActiveTab('list')}
                style={{ background: 'transparent', color: activeTab === 'list' ? 'white' : 'var(--text-muted)', fontWeight: activeTab === 'list' ? 'bold' : 'normal', borderBottom: activeTab === 'list' ? '2px solid var(--primary)' : 'none', paddingBottom: '0.5rem' }}
              >
                Candidate List
              </button>
              <button 
                onClick={() => setActiveTab('analytics')}
                style={{ background: 'transparent', color: activeTab === 'analytics' ? 'white' : 'var(--text-muted)', fontWeight: activeTab === 'analytics' ? 'bold' : 'normal', borderBottom: activeTab === 'analytics' ? '2px solid var(--primary)' : 'none', paddingBottom: '0.5rem' }}
              >
                Dashboard Analytics
              </button>
            </div>

            {activeTab === 'analytics' ? (
              <DashboardCharts candidates={candidates} />
            ) : (
              <>
                {/* Search & Filters Bar */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}>
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                      </svg>
                      <input 
                        type="text"
                        className="search-input"
                        placeholder="Search by name, email, or skills..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ marginBottom: 0 }}
                      />
                    </div>
                    <button onClick={handleExportCSV} className="btn-secondary" style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                      </svg>
                      Export CSV
                    </button>
                  </div>

                  {/* Filter buttons row */}
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', alignSelf: 'center', marginRight: '0.25rem' }}>Score:</span>
                    {[
                      { key: 'all', label: 'All' },
                      { key: 'high', label: '≥70%' },
                      { key: 'medium', label: '40-69%' },
                      { key: 'low', label: '<40%' }
                    ].map(f => (
                      <button key={f.key} className={`btn-secondary ${scoreFilter === f.key ? 'active' : ''}`} onClick={() => setScoreFilter(f.key)}>
                        {f.label}
                      </button>
                    ))}
                    
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', alignSelf: 'center', marginLeft: '0.75rem', marginRight: '0.25rem' }}>Status:</span>
                    <button className={`btn-secondary ${statusFilter === 'all' ? 'active' : ''}`} onClick={() => setStatusFilter('all')}>All</button>
                    {statusOptions.map(s => (
                      <button key={s} className={`btn-secondary ${statusFilter === s ? 'active' : ''}`} onClick={() => setStatusFilter(s)}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h3>Ranked Candidates</h3>
                  <span style={{ background: 'rgba(16, 185, 129, 0.2)', color: 'var(--secondary)', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.85rem', fontWeight: 'bold' }}>
                    {filteredCandidates.length} of {candidates.length}
                  </span>
                </div>

                {loading ? (
                  <p>Loading candidates...</p>
                ) : filteredCandidates.length === 0 ? (
                  <p className="text-muted text-center" style={{ padding: '2rem 0' }}>
                    {candidates.length === 0 ? 'No candidates uploaded yet.' : 'No candidates match your filters.'}
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {filteredCandidates.map((cand, index) => (
                      <div key={cand.id} className="candidate-card animate-slide-up" style={{ animationDelay: `${index * 0.05}s` }}>
                        <div style={{ flex: 1, paddingRight: '2rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>#{index + 1}</span>
                              {cand.name}
                            </h4>
                            <span className={getStatusBadgeClass(cand.status)}>{cand.status || 'New'}</span>
                            {cand.shortlistedEmailSent && (
                              <span className="email-badge">
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                Email Sent
                              </span>
                            )}
                          </div>
                          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>{cand.email} • {cand.experience}</p>
                          
                          {cand.aiSummary && (
                            <div style={{ marginBottom: '1rem', background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '6px', borderLeft: '3px solid var(--primary)' }}>
                              <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 'bold', textTransform: 'uppercase' }}>AI Summary</span>
                              <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', marginTop: '0.25rem' }}>{cand.aiSummary}</p>
                            </div>
                          )}

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Matched Skills: </span>
                              <p style={{ fontSize: '0.85rem', color: 'var(--secondary)' }}>{cand.skills || 'None extracted'}</p>
                            </div>
                            {cand.skillGaps && (
                              <div>
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Skill Gaps: </span>
                                <p style={{ fontSize: '0.85rem', color: 'var(--danger)' }}>{cand.skillGaps}</p>
                              </div>
                            )}
                          </div>
                          
                          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                            <a href={getPreviewUrl(cand.resumePath)} target="_blank" rel="noreferrer" className="btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', display: 'inline-block' }}>
                              Preview Resume
                            </a>
                            <select 
                              className="status-select"
                              value={cand.status || 'New'}
                              onChange={(e) => handleStatusChange(cand.id, e.target.value)}
                            >
                              {statusOptions.map(s => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '1rem', minWidth: '120px' }}>
                          <div style={{ 
                            background: cand.score >= 70 ? 'rgba(16, 185, 129, 0.1)' : cand.score >= 40 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            color: cand.score >= 70 ? 'var(--secondary)' : cand.score >= 40 ? '#F59E0B' : 'var(--danger)',
                            border: `1px solid ${cand.score >= 70 ? 'var(--secondary)' : cand.score >= 40 ? '#F59E0B' : 'var(--danger)'}`,
                            padding: '0.5rem 1rem',
                            borderRadius: '6px',
                            fontWeight: 'bold',
                            fontSize: '1.2rem',
                            textAlign: 'center'
                          }}>
                            {cand.score ? cand.score.toFixed(1) : 0}%<br/>
                            <span style={{ fontSize: '0.7rem', fontWeight: 'normal' }}>Match</span>
                          </div>
                          <button onClick={() => handleDelete(cand.id)} className="btn-danger" style={{ fontSize: '0.8rem', width: '100%' }}>Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
