import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents, LayersControl } from 'react-leaflet';
import { encodeLocation, DELIVERY_NOTES } from '../utils/codec';
import { MapPin, Copy, Share2, Navigation, Check, LocateFixed, Search, Phone, FileText } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet icon not showing correctly in some React setups
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

function LocationMarker({ position, setPosition }) {
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  const markerRef = useRef(null);
  
  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          setPosition(marker.getLatLng());
        }
      },
    }),
    [setPosition],
  );

  return position === null ? null : (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={position}
      ref={markerRef}
    />
  );
}

export default function Home() {
  const navigate = useNavigate();
  // Default to a central rural location, or user's location if available later
  const [position, setPosition] = useState({ lat: 20.5937, lng: 78.9629 }); // Center of India
  const [generatedCode, setGeneratedCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [map, setMap] = useState(null);
  const [driverCode, setDriverCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [noteIndex, setNoteIndex] = useState(0);

  useEffect(() => {
    if (map && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setPosition(newPos);
          map.flyTo([newPos.lat, newPos.lng], 15);
        },
        (err) => console.warn(err),
        { enableHighAccuracy: true }
      );
    }
  }, [map]);

  const handleLocateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setPosition(newPos);
          if (map) map.flyTo([newPos.lat, newPos.lng], 16);
        },
        (err) => alert('Could not get your location. Please enable location permissions.'),
        { enableHighAccuracy: true }
      );
    }
  };

  const handleGenerate = () => {
    if (!position) return;
    const code = encodeLocation(position.lat, position.lng, phoneNumber, noteIndex);
    setGeneratedCode(code);
    setCopied(false);
  };

  const handleDriverSubmit = (e) => {
    e.preventDefault();
    if (driverCode.trim()) {
      navigate(`/v/${driverCode.trim()}`);
    }
  };

  const shareUrl = `${window.location.origin}/v/${generatedCode}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <div className="home-container">
      <header className="app-header">
        <MapPin size={28} className="text-primary" />
        <h1>ExactDrop</h1>
      </header>
      
      <main className="main-content split-layout">
        <div className="user-section">
          <div className="map-wrapper">
            <button 
              className="icon-btn" 
              onClick={handleLocateMe}
              title="Locate Me"
              style={{ position: 'absolute', bottom: '20px', right: '20px', zIndex: 1000, background: 'white', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}
            >
              <LocateFixed size={20} className="text-primary" />
            </button>
            <MapContainer ref={setMap} center={[position.lat, position.lng]} zoom={13} scrollWheelZoom={true} className="map-container">
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
              <LocationMarker position={position} setPosition={setPosition} />
            </MapContainer>
          </div>
        </div>

        <div className="driver-section">
          <div className="instructions">
            <h2>Find & Share Exact Locations</h2>
            <p>Tap on the map or drag the pin to your exact location, then generate a unique code.</p>
            
            <div className="driver-search-box">
              <p className="search-label" style={{ fontWeight: '500', fontSize: '0.9rem', marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>Are you a driver?</p>
              <form className="input-group" onSubmit={handleDriverSubmit}>
                <input 
                  type="text" 
                  className="code-input"
                  placeholder="Enter 8+ digit code"
                  value={driverCode}
                  onChange={(e) => setDriverCode(e.target.value)}
                />
                <button type="submit" className="btn-primary" style={{ padding: '0 1rem' }}>
                  <Search size={20} />
                </button>
              </form>
            </div>
          </div>

          <div className="action-panel">
            {!generatedCode ? (
              <div className="advanced-options">
                <div className="input-group">
                  <span className="input-icon"><Phone size={18} /></span>
                  <input 
                    type="tel" 
                    placeholder="Phone Number (Optional)" 
                    className="code-input"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </div>
                <div className="input-group">
                  <span className="input-icon"><FileText size={18} /></span>
                  <select 
                    className="code-input" 
                    value={noteIndex} 
                    onChange={(e) => setNoteIndex(Number(e.target.value))}
                  >
                    {DELIVERY_NOTES.map((note, idx) => (
                      <option key={idx} value={idx}>{note}</option>
                    ))}
                  </select>
                </div>
                <button className="btn-primary generate-btn cta-large pulse-animation" onClick={handleGenerate} style={{marginTop: '1.5rem'}}>
                  Generate Location Code
                </button>
              </div>
            ) : (
              <div className="result-card glass-panel">
                <div className="qr-wrapper">
                  <QRCodeSVG 
                    value={shareUrl} 
                    size={150} 
                    level={"H"}
                    includeMargin={true}
                    style={{ borderRadius: '8px', border: '1px solid var(--border-color)' }}
                  />
                </div>
                <div className="code-display">
                  <span className="code-label">Your Unique Code</span>
                  <div className="code-value">{generatedCode}</div>
                </div>
              
              <div className="action-buttons">
                <button className="btn-secondary" onClick={copyToClipboard}>
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                  {copied ? 'Copied!' : 'Copy Link'}
                </button>
                <button className="btn-secondary" onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: 'My Exact Location',
                      text: 'Here is my exact location for delivery.',
                      url: shareUrl
                    }).catch(console.error);
                  } else {
                    copyToClipboard();
                  }
                }}>
                  <Share2 size={18} />
                  Share
                </button>
                <button className="btn-primary" onClick={() => navigate(`/v/${generatedCode}`)}>
                  <Navigation size={18} />
                  Preview
                </button>
              </div>
              <button className="btn-text" onClick={() => setGeneratedCode('')}>
                Create New Code
              </button>
            </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
