import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, LayersControl } from 'react-leaflet';
import { decodeLocation } from '../utils/codec';
import { MapPin, Navigation, ExternalLink, ArrowLeft, Share2, Phone, MessageSquare } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

export default function Viewer() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (code) {
      const decoded = decodeLocation(code);
      if (decoded) {
        setLocation(decoded);
      } else {
        setError(true);
      }
    } else {
      setError(true);
    }
  }, [code]);

  if (error) {
    return (
      <div className="viewer-container error-state">
        <MapPin size={48} className="text-secondary opacity-50 mb-4" />
        <h2>Invalid Location Code</h2>
        <p className="text-secondary">The code you entered is invalid or has expired.</p>
        <button className="btn-primary mt-6" onClick={() => navigate('/')}>
          <ArrowLeft size={18} /> Go Back to Home
        </button>
      </div>
    );
  }

  if (!location) {
    return (
      <div className="viewer-container loading-state">
        <div className="spinner"></div>
        <p className="text-secondary">Locating exact destination...</p>
      </div>
    );
  }

  const handleOpenGoogleMaps = () => {
    // Intent to open Google Maps app or website directly to coordinates
    const url = `https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`;
    window.open(url, '_blank');
  };

  return (
    <div className="viewer-container">
      <header className="app-header viewer-header">
        <button className="icon-btn" onClick={() => navigate('/')}>
          <ArrowLeft size={24} />
        </button>
        <h1>Delivery Location</h1>
        <div className="code-badge">{code}</div>
      </header>

      <main className="main-content split-layout">
        <div className="user-section">
          <div className="map-wrapper viewer-map">
            <MapContainer center={[location.lat, location.lng]} zoom={18} scrollWheelZoom={true} className="map-container">
              <LayersControl position="topright">
                <LayersControl.BaseLayer checked name="Street Map">
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                </LayersControl.BaseLayer>
                <LayersControl.BaseLayer name="Satellite">
                  <TileLayer
                    attribution='Tiles &copy; Esri'
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                  />
                </LayersControl.BaseLayer>
              </LayersControl>
              <Marker position={[location.lat, location.lng]} />
            </MapContainer>
          </div>
        </div>

        <div className="driver-section">
          <div className="location-info">
            <h3>Destination Found</h3>
            <p className="coords" style={{marginBottom: '1rem'}}>{location.lat.toFixed(5)}, {location.lng.toFixed(5)}</p>
            
            {location.noteIndex > 0 && location.noteText && (
              <div key="delivery-note" style={{ background: 'var(--bg-dark)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: '1.5rem', textAlign: 'left' }}>
                <strong style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Delivery Note</strong>
                <p style={{ fontWeight: '500' }}>{location.noteText}</p>
              </div>
            )}
          </div>
          
          <div className="action-buttons" style={{ flexDirection: 'column' }}>
            <button className="btn-primary cta-large pulse-animation" onClick={handleOpenGoogleMaps}>
              <Navigation size={22} />
              Open in Google Maps
            </button>

            {location.phone && (
              <div style={{ display: 'flex', gap: '0.75rem', width: '100%', marginTop: '0.5rem' }}>
                <a href={`tel:${location.phone}`} style={{ flex: 1, textDecoration: 'none' }}>
                  <button className="btn-secondary" style={{ width: '100%', padding: '1rem' }}>
                    <Phone size={20} /> Call
                  </button>
                </a>
                <a href={`https://wa.me/${location.phone}`} target="_blank" rel="noopener noreferrer" style={{ flex: 1, textDecoration: 'none' }}>
                  <button className="btn-secondary" style={{ width: '100%', padding: '1rem', color: '#16a34a', borderColor: '#bbf7d0' }}>
                    <MessageSquare size={20} /> WhatsApp
                  </button>
                </a>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
