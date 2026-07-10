import React, { useState, useEffect } from 'react';
import ThreeDBackground from './components/ThreeDBackground';
import BookingFlow from './components/BookingFlow';
import AdminPanel from './components/AdminPanel';
import { setupsData } from './data/setupsData';
import * as LucideIcons from 'lucide-react';
import './App.css';

const defaultConfigs = {
  siteName: 'SHADOW GAMING CAFE',
  seoDesc: 'Connaught Place\'s premium esports cafe offering PS5 Pro, 4K UHD stations, and simulators.',
  helpLine: '+91 99999-XXXXX',
  location: 'Connaught Place, New Delhi',
  logoIcon: 'Gamepad2',
  logoUrl: '', // Custom uploaded image URL
  heroSloganTop: 'LEVEL UP YOUR GAMING EXPERIENCE!',
  heroImageUrl: '/shadow_hero.png',
  heroTaglineBottom: 'PLAY. COMPETE. CONQUER.'
};

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [bookings, setBookings] = useState([]);
  const [blockedSeats, setBlockedSeats] = useState({});
  const [isBookingActive, setIsBookingActive] = useState(false);
  const [preSelectedSetupId, setPreSelectedSetupId] = useState(null);

  // Authentication States
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // System Config State
  const [systemConfigs, setSystemConfigs] = useState(() => {
    const saved = localStorage.getItem('nexus_system_configs');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure all properties are initialized
        if (parsed.logoUrl === undefined) parsed.logoUrl = '';
        if (parsed.heroSloganTop === undefined) parsed.heroSloganTop = defaultConfigs.heroSloganTop;
        if (parsed.heroImageUrl === undefined) parsed.heroImageUrl = defaultConfigs.heroImageUrl;
        if (parsed.heroTaglineBottom === undefined) parsed.heroTaglineBottom = defaultConfigs.heroTaglineBottom;
        return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return defaultConfigs;
  });

  // Dynamic setups state
  const [setups, setSetups] = useState(() => {
    const savedSetups = localStorage.getItem('nexus_setups');
    if (savedSetups) {
      try {
        return JSON.parse(savedSetups);
      } catch (e) {
        console.error('Error parsing setups', e);
      }
    }
    return setupsData;
  });

  // Emergency shop closed status
  const [isShopClosed, setIsShopClosed] = useState(() => {
    const closed = localStorage.getItem('nexus_shop_closed');
    return closed === 'true';
  });

  // Paused setups state (e.g. { setupId: [dates...] })
  const [pausedSetups, setPausedSetups] = useState(() => {
    const saved = localStorage.getItem('nexus_paused_setups');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing paused setups', e);
      }
    }
    return {};
  });

  // URL route listener
  useEffect(() => {
    const handleLocationCheck = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      if (path === '/admin' || hash === '#/admin' || hash === '#admin') {
        setActiveTab('admin');
      }
    };
    
    handleLocationCheck();
    window.addEventListener('popstate', handleLocationCheck);
    window.addEventListener('hashchange', handleLocationCheck);
    
    return () => {
      window.removeEventListener('popstate', handleLocationCheck);
      window.removeEventListener('hashchange', handleLocationCheck);
    };
  }, []);

  // Update SEO and document title
  useEffect(() => {
    document.title = systemConfigs.siteName;
    
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', systemConfigs.seoDesc);
  }, [systemConfigs]);

  // Load bookings and blocked seats from LocalStorage on mount
  useEffect(() => {
    const savedBookings = localStorage.getItem('nexus_bookings');
    if (savedBookings) {
      try {
        setBookings(JSON.parse(savedBookings));
      } catch (e) {
        console.error('Error parsing bookings', e);
      }
    }

    const savedBlocked = localStorage.getItem('nexus_blocked_seats');
    if (savedBlocked) {
      try {
        setBlockedSeats(JSON.parse(savedBlocked));
      } catch (e) {
        console.error('Error parsing blocked seats', e);
      }
    }
  }, []);

  // Save setups to localStorage
  useEffect(() => {
    localStorage.setItem('nexus_setups', JSON.stringify(setups));
  }, [setups]);

  // Save shop status to localStorage
  useEffect(() => {
    localStorage.setItem('nexus_shop_closed', isShopClosed ? 'true' : 'false');
  }, [isShopClosed]);

  const handleUpdateConfigs = (newConfigs) => {
    setSystemConfigs(newConfigs);
    localStorage.setItem('nexus_system_configs', JSON.stringify(newConfigs));
  };

  // Complete Booking
  const handleBookingComplete = (newBooking) => {
    const updated = [newBooking, ...bookings];
    setBookings(updated);
    localStorage.setItem('nexus_bookings', JSON.stringify(updated));
  };

  // Cancel Booking
  const handleCancelBooking = (bookingId) => {
    const updated = bookings.filter(b => b.id !== bookingId);
    setBookings(updated);
    localStorage.setItem('nexus_bookings', JSON.stringify(updated));
  };

  // Toggle Block Seat
  const handleBlockSeat = (setupId, seatId) => {
    setBlockedSeats(prev => {
      const currentBlocked = prev[setupId] || [];
      let updatedBlocked;
      if (currentBlocked.includes(seatId)) {
        updatedBlocked = currentBlocked.filter(id => id !== seatId);
      } else {
        updatedBlocked = [...currentBlocked, seatId];
      }
      const newBlocked = { ...prev, [setupId]: updatedBlocked };
      localStorage.setItem('nexus_blocked_seats', JSON.stringify(newBlocked));
      return newBlocked;
    });
  };

  // Pause Setup
  const handlePauseSetup = (setupId, date) => {
    setPausedSetups(prev => {
      const dates = prev[setupId] || [];
      let updatedDates;
      if (dates.includes(date)) {
        updatedDates = dates.filter(d => d !== date);
      } else {
        updatedDates = [...dates, date];
      }
      const newPaused = { ...prev, [setupId]: updatedDates };
      localStorage.setItem('nexus_paused_setups', JSON.stringify(newPaused));
      return newPaused;
    });
  };

  // Dynamic Add Setup
  const handleAddSetup = (newSetup) => {
    setSetups(prev => [...prev, newSetup]);
  };

  // Dynamic Remove Setup
  const handleRemoveSetup = (setupId) => {
    setSetups(prev => prev.filter(s => s.id !== setupId));
  };

  const handleStartBooking = (setupId = null) => {
    setPreSelectedSetupId(setupId);
    setActiveTab('booking');
    setIsBookingActive(true);
  };

  // Handle Admin Authorization
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setLoginError('');

    const formattedUser = username.trim().toLowerCase();
    
    // Accepts 'admin' or 'admin user' as username, and '12345678' as password
    if ((formattedUser === 'admin' || formattedUser === 'admin user') && password === '12345678') {
      setIsAdminAuthenticated(true);
      setLoginError('');
      setUsername('');
      setPassword('');
    } else {
      setLoginError('ACCESS DENIED: Credentials mismatch. Security code is invalid.');
    }
  };

  // Resolve dynamic logo icon
  const HeaderLogoIcon = LucideIcons[systemConfigs.logoIcon] || LucideIcons.Gamepad2;

  return (
    <>
      {/* 3D Canvas Background */}
      {(!isShopClosed || activeTab === 'admin') && <ThreeDBackground />}

      {/* Main Navigation Header */}
      <header className="nexus-header cyber-panel">
        <div className="header-logo" onClick={() => { setIsBookingActive(false); setActiveTab('home'); }}>
          {systemConfigs.logoUrl ? (
            <img src={systemConfigs.logoUrl} alt="Logo" className="logo-icon custom-logo-img" />
          ) : (
            <HeaderLogoIcon className="logo-icon" />
          )}
          <span className="logo-text">
            {systemConfigs.siteName.split(' ')[0]}
            <span className="glow-text"> {systemConfigs.siteName.split(' ').slice(1).join(' ') || 'GAMING'}</span>
          </span>
        </div>

        <nav className="header-nav">
          <button 
            className={`nav-link ${activeTab === 'home' || activeTab === 'booking' ? 'active' : ''}`}
            onClick={() => { setIsBookingActive(false); setActiveTab('home'); }}
          >
            LOBBY
          </button>
          <button 
            className={`nav-link ${activeTab === 'tickets' ? 'active' : ''}`}
            onClick={() => setActiveTab('tickets')}
          >
            MY PASSES
          </button>
          <button 
            className={`nav-link ${activeTab === 'admin' ? 'active' : ''}`}
            onClick={() => setActiveTab('admin')}
          >
            CONTROL DECK
          </button>
        </nav>
      </header>

      <main className="app-container main-content-area">
        {/* SHOP CLOSED EMERGENCY OVERLAY PAGE (Booking and Lobby disabled) */}
        {isShopClosed && activeTab !== 'admin' && (
          <div className="shop-closed-emergency-screen anim-fade-in cyber-panel border-red">
            <LucideIcons.AlertOctagon size={64} className="shop-closed-icon text-red" />
            <h2>{systemConfigs.siteName} IS TEMPORARILY CLOSED</h2>
            <div className="shop-closed-divider"></div>
            <p>Our online seat reservation is currently closed by the cafe manager.</p>
            <p className="sub-text">Please check back later or contact walk-in assistance for console seat availability.</p>
            <div className="shop-closed-status-badge">CAFE STATUS: OFFLINE</div>
          </div>
        )}

        {/* TAB 1: HOME/LANDING PAGE */}
        {activeTab === 'home' && !isBookingActive && !isShopClosed && (
          <div className="landing-section anim-fade-in">
            
            {/* Poster Header Hero Box */}
            <div className="hero-poster-header">
              <div className="poster-top-badge slogan-marker">{systemConfigs.heroSloganTop}</div>
              
              <div className="hero-banner-image-container">
                <img src={systemConfigs.heroImageUrl || '/shadow_hero.png'} alt="Shadow Gaming" className="hero-logo-banner-img" />
              </div>

              <div className="cyber-glitch-title">
                <h1>{systemConfigs.siteName.split(' ')[0]}</h1>
                <h2 className="glow-magenta-title">{systemConfigs.siteName.split(' ').slice(1).join(' ') || 'GAMING'}</h2>
                <div className="slogan-arrows-row">
                  <span className="arrows-left">«««</span>
                  <span className="slogan-center-text">{systemConfigs.heroTaglineBottom}</span>
                  <span className="arrows-right">»»»</span>
                </div>
              </div>
            </div>

            {/* Poster Layout: Station Hourly Cards */}
            <div className="promo-cards-grid">
              {setups.map(s => {
                let borderClass = 'border-purple';
                let tagColor = 'purple-bg';
                if (s.id === 'ps4') {
                  borderClass = 'border-blue';
                  tagColor = 'blue-bg';
                } else if (s.id === 'steering_wheel') {
                  borderClass = 'border-pink';
                  tagColor = 'pink-bg';
                }
                
                return (
                  <div 
                    key={s.id}
                    className={`promo-card clickable-promo-card cyber-panel ${borderClass}`}
                    onClick={() => handleStartBooking(s.id)}
                  >
                    <span className={`promo-badge ${tagColor}`}>{s.category} Arena</span>
                    <div className="promo-img-box">
                      <img src={s.image || '/ps5_cyber.png'} alt={s.name} className="promo-console-img" />
                    </div>
                    <div className="promo-price-row">
                      <span className="cur-sym">₹</span>
                      <span className="price-val text-purple">{s.price}</span>
                      <span className="unit-label">/hr</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Poster Layout: Full-Day Booking Panel */}
            {setups.some(s => s.dayPrice) && (
              <div className="full-day-booking-promo-panel cyber-panel border-pink">
                <div className="promo-full-day-title">
                  <LucideIcons.Flame size={16} className="flame-neon" />
                  <span>FULL-DAY BOOKINGS AVAILABLE</span>
                  <LucideIcons.Flame size={16} className="flame-neon" />
                </div>
                <div className="full-day-rates-row">
                  {setups.filter(s => s.dayPrice).map(s => {
                    let leftBorder = 'border-left-purple';
                    let textColor = 'text-purple';
                    if (s.id === 'ps4') {
                      leftBorder = 'border-left-blue';
                      textColor = 'text-cyan';
                    }
                    return (
                      <div key={s.id} className={`full-day-rate-col clickable-full-day ${leftBorder}`} onClick={() => handleStartBooking(s.id)}>
                        <span className="lbl">{s.name}</span>
                        <div className={`rate-val-box ${textColor}`}>
                          <span>₹{s.dayPrice}</span>
                          <span className="unit">/day</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Poster Layout: Snacks Showcase */}
            <div className="snacks-showcase-section">
              <h2 className="snacks-title-cyber slogan-marker">NEW SNACKS NOW AVAILABLE!!</h2>
              
              <div className="snacks-promo-grid">
                <div className="snack-promo-card cyber-panel border-red">
                  <div className="snack-promo-img-box">
                    <img src="/noodles_cyber.png" alt="Cup Noodles" className="snack-promo-img" />
                  </div>
                  <h4 className="snack-promo-title">CUP NOODLES</h4>
                  <div className="snack-promo-price">₹58</div>
                </div>

                <div className="snack-promo-card cyber-panel border-red">
                  <div className="snack-promo-img-box">
                    <img src="/pizza_cyber.png" alt="Pizza Combo" className="snack-promo-img" />
                  </div>
                  <h4 className="snack-promo-title">PIZZA COMBOS</h4>
                  <div className="snack-promo-price">₹299</div>
                </div>

                <div className="snack-promo-card cyber-panel border-red">
                  <div className="snack-promo-img-box">
                    <img src="/mega_pizza_cyber.png" alt="Mega Offer" className="snack-promo-img" />
                  </div>
                  <h4 className="snack-promo-title">3 PIZZAS + 1 COKE</h4>
                  <div className="snack-promo-price">₹389</div>
                </div>

                <div className="snack-promo-card cyber-panel border-red">
                  <div className="snack-promo-img-box">
                    <img src="/snacks_cyber.png" alt="Snacks" className="snack-promo-img" />
                  </div>
                  <h4 className="snack-promo-title">COKE, CHIPS & SNACKS</h4>
                  <div className="snack-promo-price">₹20/-</div>
                </div>
              </div>
            </div>

            {/* Poster Layout: Features Footer Bar */}
            <div className="features-footer-grid">
              <div className="feature-badge-item">
                <LucideIcons.Wifi size={18} className="feat-icon text-cyan" />
                <div className="feat-desc">
                  <span className="title">HIGH SPEED</span>
                  <span className="desc">INTERNET</span>
                </div>
              </div>

              <div className="feature-badge-item">
                <LucideIcons.Monitor size={18} className="feat-icon text-cyan" />
                <div className="feat-desc">
                  <span className="title">4K UHD</span>
                  <span className="desc">DISPLAYS</span>
                </div>
              </div>

              <div className="feature-badge-item">
                <LucideIcons.Headphones size={18} className="feat-icon text-cyan" />
                <div className="feat-desc">
                  <span className="title">PREMIUM</span>
                  <span className="desc">HEADSETS</span>
                </div>
              </div>

              <div className="feature-badge-item">
                <LucideIcons.Zap size={18} className="feat-icon text-cyan" />
                <div className="feat-desc">
                  <span className="title">COMFY</span>
                  <span className="desc">SEATING</span>
                </div>
              </div>

              <div className="feature-badge-item">
                <LucideIcons.Snowflake size={18} className="feat-icon text-cyan" />
                <div className="feat-desc">
                  <span className="title">AIR</span>
                  <span className="desc">CONDITIONED</span>
                </div>
              </div>

              <div className="feature-badge-item">
                <LucideIcons.Shield size={18} className="feat-icon text-cyan" />
                <div className="feat-desc">
                  <span className="title">SAFE &</span>
                  <span className="desc">SECURE</span>
                </div>
              </div>
            </div>

            {/* Center Book Button */}
            <div className="hero-cta-btn-box" style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <button className="btn-cyber btn-cyber-primary btn-hero-book" onClick={() => handleStartBooking(null)}>
                <LucideIcons.Play size={18} /> BOOK YOUR SESSION NOW
              </button>
              
              <a 
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(systemConfigs.location)}`}
                target="_blank" 
                rel="noreferrer"
                className="btn-cyber btn-cyber-magenta btn-hero-directions"
                style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 28px', borderRadius: '6px' }}
              >
                <LucideIcons.MapPin size={18} /> GET DIRECTIONS
              </a>
            </div>

            {/* Bottom Slogan Layout */}
            <div className="poster-bottom-footer-bar">
              <span className="slogan-footer slogan-marker">EAT. PLAY. GAME. REPEAT.</span>
              <span className="slogan-footer slogan-marker text-pink">WALK-INS WELCOME!</span>
            </div>

          </div>
        )}

        {/* TAB 2: ACTIVE BOOKING FLOW */}
        {(activeTab === 'booking' || (activeTab === 'home' && isBookingActive)) && !isShopClosed && (
          <div className="booking-panel-section">
            <div className="booking-header-back">
              <button className="btn-back-home" onClick={() => { setIsBookingActive(false); setActiveTab('home'); }}>
                ← BACK TO STATIONS LOBBY
              </button>
            </div>
            <BookingFlow 
              onBookingComplete={handleBookingComplete}
              existingBookings={bookings}
              blockedSeats={blockedSeats}
              initialSetupId={preSelectedSetupId}
              setups={setups}
              pausedSetups={pausedSetups}
            />
          </div>
        )}

        {/* TAB 3: USER BOOKED TICKETS / PASSES */}
        {activeTab === 'tickets' && !isShopClosed && (
          <div className="tickets-lobby-section anim-fade-in">
            <div className="section-title-header">
              <h2>MY DIGITAL ACCESS PASSES</h2>
              <p>Your confirmed upcoming gaming slots at {systemConfigs.siteName}.</p>
            </div>

            {bookings.length === 0 ? (
              <div className="empty-passes-card cyber-panel border-purple">
                <LucideIcons.Ticket size={48} className="empty-pass-icon" />
                <h3>NO ACTIVE BOOKINGS</h3>
                <p>You haven't reserved any gaming stations yet. Secure your spot now!</p>
                <button className="btn-cyber btn-cyber-primary" onClick={() => handleStartBooking(null)}>
                  BOOK A STATION
                </button>
              </div>
            ) : (
              <div className="passes-grid-layout">
                {bookings.map((booking) => (
                  <div key={booking.id} className="ticket-item-card cyber-panel border-pink">
                    <div className="ticket-item-header">
                      <span className="station-category">{booking.setupName}</span>
                      <span className="ticket-id-code">ID: {booking.id}</span>
                    </div>

                    <div className="ticket-item-details">
                      <div className="detail-item">
                        <span className="lbl">GAMER</span>
                        <span className="val">{booking.user.name}</span>
                      </div>
                      <div className="detail-item">
                        <span className="lbl">DATE / TIME</span>
                        <span className="val">{booking.date} @ {booking.time}</span>
                      </div>
                      <div className="detail-item">
                        <span className="lbl">STATION PLAN</span>
                        <span className="val text-cyan">{booking.bookingType === 'daily' ? 'Full-Day Pass' : 'Hourly Slot'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="lbl">RIG NUMBERS</span>
                        <span className="val highlight text-purple">{booking.seats.join(', ')}</span>
                      </div>
                      {booking.snacks && booking.snacks.length > 0 && (
                        <div className="detail-item">
                          <span className="lbl">FOOD DELIVERIES</span>
                          <span className="val text-magenta">{booking.snacks.map(s => `${s.name} x${s.qty}`).join(', ')}</span>
                        </div>
                      )}
                      <div className="detail-item">
                        <span className="lbl">TOTAL PRICE</span>
                        <span className="val price text-cyan">₹{booking.price}</span>
                      </div>
                    </div>

                    <div className="ticket-item-footer">
                      <span className="ticket-status-dot green"></span>
                      <span className="ticket-status-lbl">CONFIRMED PASS</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: ADMIN DASHBOARD */}
        {activeTab === 'admin' && (
          isAdminAuthenticated ? (
            <AdminPanel 
              bookings={bookings}
              onCancelBooking={handleCancelBooking}
              onBlockSeats={handleBlockSeat}
              blockedSeats={blockedSeats}
              setups={setups}
              onAddSetup={handleAddSetup}
              onRemoveSetup={handleRemoveSetup}
              isShopClosed={isShopClosed}
              onToggleShopClosed={() => setIsShopClosed(prev => !prev)}
              pausedSetups={pausedSetups}
              onPauseSetup={handlePauseSetup}
              onAddBooking={handleBookingComplete}
              systemConfigs={systemConfigs}
              onUpdateConfigs={handleUpdateConfigs}
              onLogout={() => setIsAdminAuthenticated(false)}
            />
          ) : (
            <div className="admin-login-overlay anim-fade-in" style={{ padding: '80px 20px', maxWidth: '400px', margin: '0 auto' }}>
              <div className="admin-login-box cyber-panel border-magenta" style={{ padding: '32px' }}>
                <div className="login-header" style={{ textAlign: 'center', marginBottom: '24px' }}>
                  <LucideIcons.ShieldAlert size={48} className="text-magenta" style={{ filter: 'drop-shadow(0 0 8px var(--neon-magenta))', animation: 'logoPulse 2s infinite alternate', marginBottom: '12px' }} />
                  <h3 style={{ fontFamily: 'var(--font-cyber)', fontSize: '16px', letterSpacing: '1px', color: '#fff', margin: '0 0 8px 0' }}>SHADOW DECK GATEWAY</h3>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0 }}>Authorized access node only. Credentials required.</p>
                </div>
                
                {loginError && <div className="form-error-toast text-red" style={{ marginBottom: '16px', fontSize: '10px' }}>{loginError}</div>}
                
                <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div className="cyber-input-group">
                    <label className="cyber-input-label">Operator ID</label>
                    <input 
                      type="text" 
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      placeholder="e.g. admin"
                      className="cyber-input"
                    />
                  </div>
                  <div className="cyber-input-group">
                    <label className="cyber-input-label">Security Key</label>
                    <input 
                      type="password" 
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="cyber-input"
                    />
                  </div>
                  <div className="login-actions-row" style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                    <button type="button" className="btn-cyber btn-cyber-magenta" style={{ flex: 1, padding: '10px' }} onClick={() => { setActiveTab('home'); setIsBookingActive(false); }}>
                      Exit Node
                    </button>
                    <button type="submit" className="btn-cyber btn-cyber-primary" style={{ flex: 1, padding: '10px' }}>
                      Authorize
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )
        )}
      </main>
    </>
  );
}

export default App;
