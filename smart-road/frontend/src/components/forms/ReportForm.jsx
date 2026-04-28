// frontend/src/components/forms/ReportForm.jsx
// Full featured damage report submission form

import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { reportsAPI, authAPI } from '../../services/api';
import { uploadImage } from '../../services/storage';
import { getCurrentLocation } from '../../utils/helpers';
import LocationPicker from '../map/LocationPicker';

const DAMAGE_TYPES = [
  { value: 'pothole', label: '🕳️ Pothole' },
  { value: 'crack', label: '〰️ Road Crack' },
  { value: 'flooding', label: '🌊 Flooding' },
  { value: 'collapse', label: '⚠️ Road Collapse' },
  { value: 'other', label: '🔧 Other' },
];

const initialForm = {
  reporter_name: '',
  reporter_email: '',
  reporter_phone: '',
  damage_type: '',
  description: '',
  address: '',
  latitude: null,
  longitude: null,
  image_url: '',
};

const ReportForm = () => {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [locating, setLocating] = useState(false);

  const fileRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadUser() {
      try {
        const user = await authAPI.getMe();
        console.log(user);

        if (user?.success && user?.data?.user) {
          const loggedInUser = user.data.user;

          setForm((f) => ({
            ...f,
            reporter_name:
              loggedInUser.reporterName ||
              loggedInUser.name ||
              loggedInUser.full_name ||
              '',
            reporter_email:
              loggedInUser.reporterEmail ||
              loggedInUser.email ||
              '',
          }));
        }
      } catch (err) {
        console.error('Failed to load user:', err);
      }
    }

    loadUser();
  }, []);

  const set = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: '' }));
  };

  const validate = () => {
    const newErrors = {};

    if (!form.reporter_name.trim()) {
      newErrors.reporter_name = 'Your name is required';
    }

    if (!form.reporter_email.trim() || !/\S+@\S+\.\S+/.test(form.reporter_email)) {
      newErrors.reporter_email = 'Valid email required';
    }

    if (!form.damage_type) {
      newErrors.damage_type = 'Damage type required';
    }

    if (!form.description.trim() || form.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    if (!form.latitude || !form.longitude) {
      newErrors.location = 'Please select a location on the map or use GPS';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be smaller than 5MB');
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleGeolocate = async () => {
    setLocating(true);
    try {
      const { lat, lng } = await getCurrentLocation();
      set('latitude', lat);
      set('longitude', lng);
      toast.success('📍 Location detected!');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLocating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      let imageUrl = '';

      if (imageFile) {
        toast.loading('Uploading image...', { id: 'img-upload' });
        imageUrl = await uploadImage(imageFile);
        toast.dismiss('img-upload');
      }

      await reportsAPI.create({ ...form, image_url: imageUrl });
      toast.success('✅ Report submitted successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  };


  const hasUserDetails = !!form.reporter_name || !!form.reporter_email;

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* Personal Info */}
      <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--text-primary)' }}>
          👤 Your Information
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Full Name *</label>
            <input
              className="form-input"
              type="text"
              placeholder="Your name"
              value={form.reporter_name}
              onChange={(e) => set('reporter_name', e.target.value)}
              disabled={!!form.reporter_name}
            />
            {errors.reporter_name && <span className="form-error">{errors.reporter_name}</span>}
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Email *</label>
            <input
              className="form-input"
              type="email"
              placeholder="you@email.com"
              value={form.reporter_email}
              onChange={(e) => set('reporter_email', e.target.value)}
              disabled={!!form.reporter_email}
            />
            {errors.reporter_email && <span className="form-error">{errors.reporter_email}</span>}
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Phone (optional)</label>
            <input
              className="form-input"
              type="tel"
              placeholder="+91 XXXXX XXXXX"
              value={form.reporter_phone}
              onChange={(e) => set('reporter_phone', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Damage Details */}
      <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--text-primary)' }}>
          🛣️ Damage Details
        </h3>
        <div className="form-group">
          <label className="form-label">Damage Type *</label>
          <select
            className="form-select"
            value={form.damage_type}
            onChange={(e) => set('damage_type', e.target.value)}
          >
            <option value="">Select damage type...</option>
            {DAMAGE_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          {errors.damage_type && <span className="form-error">{errors.damage_type}</span>}
        </div>
        <div className="form-group">
          <label className="form-label">Description *</label>
          <textarea
            className="form-textarea"
            placeholder="Describe the damage in detail (min. 10 characters)..."
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            rows={4}
          />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'right', display: 'block' }}>
            {form.description.length}/1000
          </span>
          {errors.description && <span className="form-error">{errors.description}</span>}
        </div>

        {/* Image Upload */}
        <div className="form-group">
          <label className="form-label">Photo (optional)</label>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleImageChange}
          />
          {imagePreview ? (
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <img
                src={imagePreview}
                alt="Preview"
                style={{
                  width: '100%',
                  maxHeight: '220px',
                  objectFit: 'cover',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                }}
              />
              <button
                type="button"
                className="btn btn-danger btn-sm"
                style={{ position: 'absolute', top: 8, right: 8 }}
                onClick={() => {
                  setImageFile(null);
                  setImagePreview(null);
                }}
              >
                ✕ Remove
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="btn btn-ghost"
              style={{
                width: '100%',
                justifyContent: 'center',
                padding: '1.5rem',
                border: '2px dashed var(--border)',
                borderRadius: 'var(--radius-md)',
              }}
              onClick={() => fileRef.current.click()}
            >
              📷 Click to upload image (max 5MB)
            </button>
          )}
        </div>
      </div>

      {/* Location */}
      <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            📍 Location
          </h3>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handleGeolocate}
            disabled={locating}
          >
            {locating ? '⏳ Detecting...' : '🎯 Use My GPS'}
          </button>
        </div>

        <LocationPicker
          lat={form.latitude}
          lng={form.longitude}
          onChange={({ lat, lng }) => { set('latitude', lat); set('longitude', lng); }}
          height="300px"
        />

        {form.latitude && form.longitude && (
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            ✅ Coordinates: {form.latitude.toFixed(6)}, {form.longitude.toFixed(6)}
          </p>
        )}
        {errors.location && <span className="form-error">{errors.location}</span>}

        <div className="form-group" style={{ marginTop: '1rem', marginBottom: 0 }}>
          <label className="form-label">Street Address (optional)</label>
          <input
            className="form-input"
            type="text"
            placeholder="e.g. Near Andheri Station, Mumbai"
            value={form.address}
            onChange={(e) => set('address', e.target.value)}
          />
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        className="btn btn-accent btn-lg"
        disabled={submitting}
        style={{ width: '100%', justifyContent: 'center' }}
      >
        {submitting ? (
          <>
            <span className="spinner spinner-sm" style={{ borderTopColor: 'white' }} />
            Submitting...
          </>
        ) : (
          '🚀 Submit Report'
        )}
      </button>
    </form>
  );
};

export default ReportForm;
