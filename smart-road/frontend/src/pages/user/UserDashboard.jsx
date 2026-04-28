// frontend/src/pages/user/UserDashboard.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import useReports from '../../hooks/useReports';
import useDebounce from '../../hooks/useDebounce';
import ReportCard from '../../components/ui/ReportCard';
import Pagination from '../../components/ui/Pagination';
import Modal from '../../components/ui/Modal';
import StatusBadge from '../../components/ui/StatusBadge';
import { formatDateTime, damageEmoji, capitalize } from '../../utils/helpers';

const STATUS_OPTIONS = ['', 'pending', 'in_progress', 'resolved', 'rejected'];
const TYPE_OPTIONS = ['', 'pothole', 'crack', 'flooding', 'collapse', 'other'];

const UserDashboard = () => {
  const [search, setSearch] = useState('');
  const [statusF, setStatusF] = useState('');
  const [typeF, setTypeF] = useState('');
  const [selected, setSelected] = useState(null);

  const debouncedSearch = useDebounce(search, 400);

  const { reports, pagination, loading, updateParams, setPage } = useReports({
    search: debouncedSearch,
    status: statusF,
    damage_type: typeF,
  });

  // Sync debounced search → params
  useState(() => {
    updateParams({ search: debouncedSearch });
  }, [debouncedSearch]);

  return (
    <div className="page-wrapper">
      <div className="container">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div className="page-header" style={{ margin: 0 }}>
            <h1 className="page-title">📋 Reports</h1>
            <p className="page-subtitle">Track the status of your submitted reports.</p>
          </div>
          <Link to="/report" className="btn btn-accent">
            + New Report
          </Link>
        </div>

        {/* Filters */}
        <div className="glass-card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search */}
          <div className="search-bar" style={{ flex: '1', minWidth: '180px' }}>
            <span className="search-icon">🔍</span>
            <input
              className="form-input search-input"
              placeholder="Search reports..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); updateParams({ search: e.target.value }); }}
              style={{ margin: 0 }}
            />
          </div>
          <select
            className="form-select"
            value={statusF}
            onChange={(e) => { setStatusF(e.target.value); updateParams({ status: e.target.value }); }}
            style={{ width: '150px', margin: 0 }}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s ? capitalize(s) : 'All Statuses'}</option>
            ))}
          </select>
          <select
            className="form-select"
            value={typeF}
            onChange={(e) => { setTypeF(e.target.value); updateParams({ damage_type: e.target.value }); }}
            style={{ width: '150px', margin: 0 }}
          >
            {TYPE_OPTIONS.map((t) => (
              <option key={t} value={t}>{t ? `${damageEmoji[t]} ${capitalize(t)}` : 'All Types'}</option>
            ))}
          </select>
        </div>

        {/* Reports Grid */}
        {loading ? (
          <div className="loading-container"><div className="spinner" /><p>Loading reports...</p></div>
        ) : reports.length === 0 ? (
          <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>No reports found</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              {search || statusF || typeF ? 'Try adjusting your filters.' : 'You haven\'t submitted any reports yet.'}
            </p>
            <Link to="/report" className="btn btn-accent">📍 Report Damage</Link>
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
              {reports.map((r) => (
                <ReportCard key={r.id} report={r} onClick={setSelected} />
              ))}
            </div>
            <Pagination pagination={pagination} onPageChange={setPage} />
          </>
        )}
      </div>

      {/* Report Detail Modal */}
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Report Details">
        {selected && (
          <div>
            {selected.image_url && (
              <img
                src={selected.image_url}
                alt="Road damage"
                style={{ width: '100%', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', maxHeight: '240px', objectFit: 'cover' }}
              />
            )}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              <span className={`damage-pill damage-${selected.damage_type}`}>
                {damageEmoji[selected.damage_type]} {capitalize(selected.damage_type)}
              </span>
              <StatusBadge status={selected.status} />
            </div>
            <p style={{ color: 'var(--text-primary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1rem' }}>
              {selected.description}
            </p>
            <div style={{ display: 'grid', gap: '0.5rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              {selected.address && <span>📍 {selected.address}</span>}
              <span>🌐 {selected.latitude?.toFixed(6)}, {selected.longitude?.toFixed(6)}</span>
              <span>📅 Submitted: {formatDateTime(selected.created_at)}</span>
              {selected.resolved_at && <span>✅ Resolved: {formatDateTime(selected.resolved_at)}</span>}
              {selected.admin_notes && (
                <div style={{ marginTop: '0.75rem', padding: '0.875rem', background: 'var(--bg-overlay)', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--primary)' }}>
                  <strong style={{ display: 'block', marginBottom: '0.3rem' }}>Admin Notes:</strong>
                  {selected.admin_notes}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default UserDashboard;
