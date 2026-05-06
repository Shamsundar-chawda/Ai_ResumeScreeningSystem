import React, { useState, useRef } from 'react';

const UploadResume = () => {
  const [file, setFile] = useState(null);
  const [name, setName] = useState('');
  const [status, setStatus] = useState('idle');
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !name) {
      alert('Please provide a name and a file.');
      return;
    }

    setStatus('uploading');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', name);

    try {
      const response = await fetch('http://localhost:8081/api/uploadResume', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data);
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error(error);
      setStatus('error');
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto', paddingTop: '2rem' }}>
      <div className="glass-panel text-center">
        <h2>Submit Your Resume</h2>
        <p className="text-muted" style={{ marginBottom: '2rem' }}>Our AI will parse and match your skills to our open positions.</p>
        
        {status === 'success' && result ? (
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--secondary)', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
            <h3 style={{ color: 'var(--secondary)' }}>Upload Successful!</h3>
            <p><strong>Name:</strong> {result.name}</p>
            <p><strong>Email Extracted:</strong> {result.email}</p>
            <p><strong>Skills Found:</strong> {result.skills || 'None'}</p>
            <p><strong>Experience:</strong> {result.experience}</p>
            <p><strong>Match Score:</strong> {result.score.toFixed(1)}%</p>
            <button className="btn-primary" style={{ marginTop: '1rem' }} onClick={() => { setStatus('idle'); setFile(null); setName(''); setResult(null); }}>Submit Another</button>
          </div>
        ) : (
          <form onSubmit={handleUpload}>
            <div style={{ textAlign: 'left' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Full Name</label>
              <input 
                type="text" 
                placeholder="John Doe" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
              />
            </div>

            <div 
              style={{
                border: '2px dashed var(--primary)',
                padding: '3rem',
                borderRadius: '8px',
                background: 'rgba(79, 70, 229, 0.05)',
                cursor: 'pointer',
                marginBottom: '1.5rem',
                transition: 'all 0.3s'
              }}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current.click()}
            >
              {file ? (
                <div>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '1rem' }}>
                    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                    <polyline points="13 2 13 9 20 9"></polyline>
                  </svg>
                  <p style={{ fontWeight: '500', color: 'white' }}>{file.name}</p>
                </div>
              ) : (
                <div>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '1rem' }}>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                  <p style={{ color: 'var(--text-muted)' }}>Drag & Drop your resume here (PDF/DOCX/TXT) or click to browse</p>
                </div>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                style={{ display: 'none' }} 
                accept=".pdf,.docx,.txt" 
                onChange={handleFileChange} 
              />
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={status === 'uploading'}>
              {status === 'uploading' ? 'Analyzing...' : 'Upload & Match'}
            </button>
            {status === 'error' && <p style={{ color: 'var(--danger)', marginTop: '1rem' }}>Upload failed. Ensure the server is running.</p>}
          </form>
        )}
      </div>
    </div>
  );
};

export default UploadResume;
