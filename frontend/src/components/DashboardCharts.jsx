import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const DashboardCharts = ({ candidates }) => {
  if (!candidates || candidates.length === 0) {
    return <div className="text-muted text-center" style={{ padding: '2rem 0' }}>No data to display charts.</div>;
  }

  // 1. Calculate average score
  const avgScore = candidates.reduce((acc, c) => acc + (c.score || 0), 0) / candidates.length;

  // 2. Score Distribution (0-39, 40-69, 70-100)
  const allDist = [
    { name: 'High Match (>70%)', value: candidates.filter(c => c.score >= 70).length, color: '#10B981' },
    { name: 'Medium Match (40-69%)', value: candidates.filter(c => c.score >= 40 && c.score < 70).length, color: '#F59E0B' },
    { name: 'Low Match (<40%)', value: candidates.filter(c => c.score < 40).length, color: '#EF4444' }
  ];
  const distribution = allDist.filter(d => d.value > 0);

  // 3. Common Skill Gaps
  const skillGapsCount = {};
  candidates.forEach(c => {
    if (c.skillGaps) {
      const gaps = c.skillGaps.split(',').map(s => s.trim()).filter(s => s);
      gaps.forEach(g => {
        skillGapsCount[g] = (skillGapsCount[g] || 0) + 1;
      });
    }
  });

  const skillGapsData = Object.keys(skillGapsCount)
    .map(key => ({ skill: key, count: skillGapsCount[key] }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // 4. Status Breakdown
  const statusCount = {};
  candidates.forEach(c => {
    const st = c.status || 'New';
    statusCount[st] = (statusCount[st] || 0) + 1;
  });

  const statusColors = {
    'New': '#94A3B8',
    'Shortlisted': '#10B981',
    'Interviewed': '#3B82F6',
    'Hired': '#F59E0B',
    'Rejected': '#EF4444'
  };

  const statusData = Object.keys(statusCount)
    .map(key => ({ name: key, value: statusCount[key], color: statusColors[key] || '#94A3B8' }))
    .sort((a, b) => b.value - a.value);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isPie = data.name !== undefined;

      return (
        <div style={{ background: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255,255,255,0.15)', padding: '12px 18px', borderRadius: '12px', color: '#fff', boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(10px)' }}>
          <p style={{ margin: 0, fontWeight: 'bold', fontSize: '1.1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px', marginBottom: '8px' }}>
            {isPie ? data.name : `Missing: ${data.skill}`}
          </p>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            <span style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '1.1rem' }}>{payload[0].value}</span> candidate{payload[0].value !== 1 ? 's' : ''} {isPie ? 'in this category' : 'lack this skill'}
          </p>
        </div>
      );
    }
    return null;
  };

  const getPoolQuality = () => {
    if (avgScore >= 70) return { text: "Excellent", color: "#10B981" };
    if (avgScore >= 40) return { text: "Average", color: "#F59E0B" };
    return { text: "Weak", color: "#EF4444" };
  };
  const poolQuality = getPoolQuality();

  // Count shortlisted
  const shortlistedCount = candidates.filter(c => (c.status || 'New') !== 'New' && (c.status || 'New') !== 'Rejected').length;

  return (
    <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '1rem' }}>
      
      <svg width="0" height="0">
        <defs>
          <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
          <linearGradient id="highGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>
          <linearGradient id="medGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#B45309" />
          </linearGradient>
          <linearGradient id="lowGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#EF4444" />
            <stop offset="100%" stopColor="#B91C1C" />
          </linearGradient>
          <linearGradient id="statusBarGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#A78BFA" />
          </linearGradient>
        </defs>
      </svg>

      {/* KPI Cards */}
      <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem' }}>
        
        {/* Total Applicants */}
        <div className="glass-panel" style={{ padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-20px', right: '-20px', background: 'var(--primary)', opacity: 0.1, width: '100px', height: '100px', borderRadius: '50%' }}></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            <span className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Applicants</span>
          </div>
          <h2 style={{ fontSize: '2.5rem', margin: 0, background: 'linear-gradient(to right, #ffffff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{candidates.length}</h2>
        </div>

        {/* Average Match */}
        <div className="glass-panel" style={{ padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-20px', right: '-20px', background: avgScore >= 70 ? '#10B981' : '#F59E0B', opacity: 0.1, width: '100px', height: '100px', borderRadius: '50%' }}></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={avgScore >= 70 ? '#10B981' : '#F59E0B'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <circle cx="12" cy="12" r="6"></circle>
              <circle cx="12" cy="12" r="2"></circle>
            </svg>
            <span className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Avg Match</span>
          </div>
          <h2 style={{ fontSize: '2.5rem', margin: 0, color: avgScore >= 70 ? 'var(--secondary)' : (avgScore >= 40 ? '#F59E0B' : 'var(--danger)') }}>
            {avgScore.toFixed(1)}%
          </h2>
        </div>

        {/* Pool Quality */}
        <div className="glass-panel" style={{ padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-20px', right: '-20px', background: poolQuality.color, opacity: 0.1, width: '100px', height: '100px', borderRadius: '50%' }}></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={poolQuality.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <span className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Pool Quality</span>
          </div>
          <h2 style={{ fontSize: '2rem', margin: 0, color: poolQuality.color }}>{poolQuality.text}</h2>
        </div>

        {/* Shortlisted */}
        <div className="glass-panel" style={{ padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-20px', right: '-20px', background: '#6366F1', opacity: 0.1, width: '100px', height: '100px', borderRadius: '50%' }}></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="8.5" cy="7" r="4"></circle>
              <polyline points="17 11 19 13 23 9"></polyline>
            </svg>
            <span className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Progressing</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <h2 style={{ fontSize: '2.5rem', margin: 0, color: '#A78BFA' }}>{shortlistedCount}</h2>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>/ {candidates.length}</span>
          </div>
        </div>

      </div>

      {/* Distribution Chart */}
      <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem', marginBottom: '1rem' }}>
          <h4 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-main)' }}>Candidate Suitability</h4>
          <p style={{ margin: '5px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Distribution of candidates based on JD match percentage.</p>
        </div>
        <div style={{ height: 280, width: '100%', flex: 1 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={distribution}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={100}
                paddingAngle={8}
                dataKey="value"
                stroke="none"
                label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {distribution.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color === '#10B981' ? 'url(#highGradient)' : entry.color === '#F59E0B' ? 'url(#medGradient)' : 'url(#lowGradient)'} 
                    style={{ filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.3))' }}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Custom Legend */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '0.5rem' }}>
          {distribution.map((d, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: d.color }}></div>
              {d.name.split(' ')[0]} Match
            </div>
          ))}
        </div>
      </div>

      {/* Status Breakdown Chart */}
      <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem', marginBottom: '1rem' }}>
          <h4 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-main)' }}>Pipeline Status</h4>
          <p style={{ margin: '5px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Current status of candidates in your hiring pipeline.</p>
        </div>
        <div style={{ height: 280, width: '100%', flex: 1 }}>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData} layout="vertical" margin={{ left: 10, right: 20 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" stroke="var(--text-muted)" fontSize={13} axisLine={false} tickLine={false} width={90} />
                <Tooltip cursor={{fill: 'rgba(255,255,255,0.02)'}} content={<CustomTooltip />} />
                <Bar 
                  dataKey="value" 
                  radius={[0, 6, 6, 0]} 
                  barSize={22} 
                  animationDuration={1500}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`status-${index}`} fill={entry.color} style={{ opacity: 0.85 }} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p className="text-muted">No status data yet.</p>
            </div>
          )}
        </div>
        {/* Status legend */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
          {statusData.map((d, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <div style={{ width: 10, height: 10, borderRadius: '3px', background: d.color }}></div>
              {d.name}: {d.value}
            </div>
          ))}
        </div>
      </div>

      {/* Skill Gaps Chart */}
      <div className="glass-panel" style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column' }}>
        <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem', marginBottom: '1rem' }}>
          <h4 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-main)' }}>Common Skill Gaps</h4>
          <p style={{ margin: '5px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Required skills most frequently missing from applicant resumes.</p>
        </div>
        <div style={{ height: 220, width: '100%', flex: 1 }}>
          {skillGapsData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={skillGapsData} margin={{ left: 10, right: 20, bottom: 5 }}>
                <XAxis dataKey="skill" stroke="var(--text-muted)" fontSize={12} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip cursor={{fill: 'rgba(255,255,255,0.02)'}} content={<CustomTooltip />} />
                <Bar 
                  dataKey="count" 
                  fill="url(#barGradient)" 
                  radius={[6, 6, 0, 0]} 
                  barSize={36} 
                  animationDuration={1500}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ textAlign: 'center', background: 'rgba(16, 185, 129, 0.05)', padding: '2rem', borderRadius: '50%', border: '1px dashed rgba(16, 185, 129, 0.3)' }}>
                <h3 style={{ color: 'var(--secondary)', margin: 0 }}>All Good!</h3>
                <p className="text-muted" style={{ margin: '5px 0 0 0', fontSize: '0.9rem' }}>No major skill gaps identified.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;
