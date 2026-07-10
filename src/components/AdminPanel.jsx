import React, { useState, useEffect } from 'react';
import { setupsData, mockOccupiedSeats } from '../data/setupsData';
import { Trash2, ShieldAlert, Monitor, Gamepad, Calendar, Clock, DollarSign, Search, User, Filter, AlertTriangle, Cpu, Plus, Power, Layers, Ban, CheckCircle, ShieldCheck, Ticket, Terminal, Activity, FileText, Database, X, Printer, RefreshCw, Settings, LogOut } from 'lucide-react';

const AdminPanel = ({ 
  bookings = [], 
  onCancelBooking, 
  onBlockSeats, 
  blockedSeats = {},
  setups = [],
  onAddSetup,
  onRemoveSetup,
  isShopClosed,
  onToggleShopClosed,
  pausedSetups = {},
  onPauseSetup,
  onAddBooking,
  systemConfigs = {},
  onUpdateConfigs,
  onLogout
}) => {
  const [activeSubTab, setActiveSubTab] = useState('overview'); // 'overview' | 'booker' | 'offerings' | 'paused' | 'logs' | 'settings'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSetupId, setSelectedSetupId] = useState('ps5');
  const [filterSetup, setFilterSetup] = useState('all');

  // Form states for adding setups
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('Console');
  const [formPrice, setFormPrice] = useState('');
  const [formDayPrice, setFormDayPrice] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formSpecs, setFormSpecs] = useState('');
  const [formRigCount, setFormRigCount] = useState(4);
  const [formError, setFormError] = useState('');

  // Form states for Admin Quick Reservation
  const [bookSetupId, setBookSetupId] = useState('ps5');
  const [bookDate, setBookDate] = useState('');
  const [bookTimes, setBookTimes] = useState([]); 
  const [bookType, setBookType] = useState('hourly'); 
  const [bookSeats, setBookSeats] = useState([]); 
  const [bookName, setBookName] = useState('');
  const [bookPhone, setBookPhone] = useState('');
  const [bookError, setBookError] = useState('');
  const [bookSuccess, setBookSuccess] = useState('');

  // Form states for Pausing setups
  const [pauseSetupId, setPauseSetupId] = useState('ps5');
  const [pauseDate, setPauseDate] = useState('');

  // Form states for System Configuration
  const [settingsSiteName, setSettingsSiteName] = useState(systemConfigs?.siteName || 'SHADOW GAMING CAFE');
  const [settingsSeoDesc, setSettingsSeoDesc] = useState(systemConfigs?.seoDesc || '');
  const [settingsHelpLine, setSettingsHelpLine] = useState(systemConfigs?.helpLine || '');
  const [settingsLocation, setSettingsLocation] = useState(systemConfigs?.location || '');
  const [settingsLogoIcon, setSettingsLogoIcon] = useState(systemConfigs?.logoIcon || 'Gamepad2');
  const [settingsLogoUrl, setSettingsLogoUrl] = useState(systemConfigs?.logoUrl || '');
  const [settingsHeroSloganTop, setSettingsHeroSloganTop] = useState(systemConfigs?.heroSloganTop || 'LEVEL UP YOUR GAMING EXPERIENCE!');
  const [settingsHeroImageUrl, setSettingsHeroImageUrl] = useState(systemConfigs?.heroImageUrl || '/shadow_hero.png');
  const [settingsHeroTaglineBottom, setSettingsHeroTaglineBottom] = useState(systemConfigs?.heroTaglineBottom || 'PLAY. COMPETE. CONQUER.');
  const [settingsSuccess, setSettingsSuccess] = useState('');

  // Invoice modal state
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Simulated activity feed
  const [activityFeed, setActivityFeed] = useState([
    { id: 1, time: '12:20 PM', text: 'Admin blocked rig TB1-03 for PC Multiplayer' },
    { id: 2, time: '12:15 PM', text: 'Gamer booked rig PS5S-01 for 2 hours' },
    { id: 3, time: '11:50 AM', text: 'System diagnostic completed. All systems nominal.' },
    { id: 4, time: '11:30 AM', text: 'Offline walk-in registered for PlayStation 4' },
    { id: 5, time: '10:45 AM', text: 'Maintenance override activated on steering wheel rig 02' }
  ]);

  const activeSetups = setups && setups.length > 0 ? setups : setupsData;

  // Set default dates and settings variables
  useEffect(() => {
    const today = new Date();
    const formatted = today.toISOString().split('T')[0];
    setBookDate(formatted);
    setPauseDate(formatted);
  }, []);

  useEffect(() => {
    if (systemConfigs) {
      setSettingsSiteName(systemConfigs.siteName || 'SHADOW GAMING CAFE');
      setSettingsSeoDesc(systemConfigs.seoDesc || '');
      setSettingsHelpLine(systemConfigs.helpLine || '');
      setSettingsLocation(systemConfigs.location || '');
      setSettingsLogoIcon(systemConfigs.logoIcon || 'Gamepad2');
      setSettingsLogoUrl(systemConfigs.logoUrl || '');
      setSettingsHeroSloganTop(systemConfigs.heroSloganTop || 'LEVEL UP YOUR GAMING EXPERIENCE!');
      setSettingsHeroImageUrl(systemConfigs.heroImageUrl || '/shadow_hero.png');
      setSettingsHeroTaglineBottom(systemConfigs.heroTaglineBottom || 'PLAY. COMPETE. CONQUER.');
    }
  }, [systemConfigs]);

  // Compute metrics
  const totalBookings = bookings.length;
  const totalRevenue = bookings.reduce((sum, b) => sum + b.price, 0);
  const totalPossibleSeats = activeSetups.reduce((sum, s) => sum + s.seatCount, 0);
  const currentBookedSeatsCount = bookings.flatMap(b => b.seats).length;
  const occupancyPercentage = totalPossibleSeats > 0 ? Math.round((currentBookedSeatsCount / totalPossibleSeats) * 100) : 0;

  // Filter bookings list
  const filteredBookings = bookings.filter(b => {
    const matchesSearch = 
      b.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterSetup === 'all' || b.setupId === filterSetup;
    
    return matchesSearch && matchesFilter;
  });

  const currentSetup = activeSetups.find(s => s.id === selectedSetupId) || activeSetups[0];
  const selectedSetupBookings = bookings.filter(b => b.setupId === selectedSetupId);
  const occupiedSetupSeats = selectedSetupBookings.flatMap(b => b.seats);
  const blockedSetupSeats = blockedSeats[selectedSetupId] || [];

  const handleToggleBlockSeat = (seatId) => {
    if (currentSetup) {
      onBlockSeats(currentSetup.id, seatId);
      const logText = `Blocked rig ${seatId} for ${currentSetup.name}`;
      setActivityFeed(prev => [
        { id: Date.now(), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), text: logText },
        ...prev.slice(0, 7)
      ]);
    }
  };

  const getSetupDistribution = () => {
    const counts = {};
    activeSetups.forEach(s => counts[s.name] = 0);
    bookings.forEach(b => {
      if (counts[b.setupName] !== undefined) {
        counts[b.setupName] += b.seats.length;
      }
    });
    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  };

  const distData = getSetupDistribution();
  const maxCount = Math.max(...distData.map(d => d.count), 1);

  // Available slots array
  const timeSlots = [
    '10:00 AM - 11:00 AM',
    '11:00 AM - 12:00 PM',
    '12:00 PM - 01:00 PM',
    '01:00 PM - 02:00 PM',
    '02:00 PM - 03:00 PM',
    '03:00 PM - 04:00 PM',
    '04:00 PM - 05:00 PM',
    '05:00 PM - 06:00 PM',
    '06:00 PM - 07:00 PM',
    '07:00 PM - 08:00 PM',
    '08:00 PM - 09:00 PM',
    '09:00 PM - 10:00 PM',
    '10:00 PM - 11:00 PM',
    '11:00 PM - 12:00 AM',
  ];

  // Calculate occupied seats dynamically for Admin reservation form
  const getAdminFormOccupiedSeats = () => {
    const targetSetup = activeSetups.find(s => s.id === bookSetupId);
    if (!targetSetup) return [];

    const baseMock = mockOccupiedSeats[bookSetupId] || [];
    
    const overlapBookings = bookings.filter(b => {
      const isSameSetup = b.setupId === bookSetupId;
      const isSameDate = b.date === bookDate;
      if (!isSameSetup || !isSameDate) return false;

      if (bookType === 'daily' || b.bookingType === 'daily') {
        return true;
      }

      const bookingSlots = b.times || [b.time];
      return bookTimes.some(slot => bookingSlots.includes(slot));
    });

    const realOccupied = overlapBookings.flatMap(b => b.seats);
    const blocked = blockedSeats[bookSetupId] || [];
    return Array.from(new Set([...baseMock, ...realOccupied, ...blocked]));
  };

  const adminFormOccupied = getAdminFormOccupiedSeats();

  const handleAdminSeatToggle = (seatId) => {
    setBookSeats(prev => {
      if (prev.includes(seatId)) {
        return prev.filter(x => x !== seatId);
      } else {
        return [...prev, seatId];
      }
    });
  };

  const handleAdminTimeToggle = (slot) => {
    setBookTimes(prev => {
      if (prev.includes(slot)) {
        return prev.filter(s => s !== slot);
      } else {
        return [...prev, slot];
      }
    });
  };

  // Submit Admin Booking
  const handleAdminBookingSubmit = (e) => {
    e.preventDefault();
    setBookError('');
    setBookSuccess('');

    if (!bookName.trim()) {
      setBookError('Please enter user name.');
      return;
    }
    if (!bookPhone.trim()) {
      setBookError('Please enter user phone number.');
      return;
    }
    if (bookSeats.length === 0) {
      setBookError('Please select at least 1 seat.');
      return;
    }
    if (bookType === 'hourly' && bookTimes.length === 0) {
      setBookError('Please select at least 1 hour slot.');
      return;
    }

    const selectedSetupObj = activeSetups.find(s => s.id === bookSetupId);
    if (!selectedSetupObj) return;

    let finalCost = 0;
    if (bookType === 'daily') {
      finalCost = (selectedSetupObj.dayPrice || 1399) * bookSeats.length;
    } else {
      finalCost = selectedSetupObj.price * bookSeats.length * bookTimes.length;
    }

    const bookingId = 'SD-' + Math.floor(100000 + Math.random() * 900000);
    const timeSummary = bookType === 'daily' 
      ? 'Full-Day (12 Hours)' 
      : `${bookTimes.length} Hour(s) [${bookTimes.join(', ')}]`;

    const adminCreatedBooking = {
      id: bookingId,
      setupId: bookSetupId,
      setupName: selectedSetupObj.name,
      bookingType: bookType,
      date: bookDate,
      time: timeSummary,
      times: bookTimes,
      seats: bookSeats,
      snacks: [],
      user: {
        name: bookName,
        email: `${bookName.replace(/\s+/g, '').toLowerCase()}@admin-walkin.com`,
        phone: bookPhone
      },
      stationCost: finalCost,
      snacksCost: 0,
      price: finalCost,
      timestamp: new Date().toISOString(),
      status: 'confirmed'
    };

    onAddBooking(adminCreatedBooking);
    setBookSuccess(`Walk-in Reservation ${bookingId} created successfully!`);
    
    setActivityFeed(prev => [
      { id: Date.now(), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), text: `Registered gamer ${bookName} on ${selectedSetupObj.name}` },
      ...prev.slice(0, 7)
    ]);

    setBookName('');
    setBookPhone('');
    setBookSeats([]);
    setBookTimes([]);
  };

  // Submit Add Setup Form
  const handleCreateSetupSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    if (!formName.trim()) {
      setFormError('Console setup name is required.');
      return;
    }
    if (!formPrice || Number(formPrice) <= 0) {
      setFormError('Enter a valid hourly price.');
      return;
    }
    if (!formRigCount || Number(formRigCount) <= 0) {
      setFormError('Seat rigs count must be at least 1.');
      return;
    }

    const newSetupId = 'setup_' + Math.floor(100000 + Math.random() * 900000);
    
    const seats = [];
    const prefix = formCategory === 'PC' ? 'PC' : (formCategory === 'Console' ? 'PS5S' : 'RIG');
    for (let i = 1; i <= Number(formRigCount); i++) {
      seats.push({
        id: `${prefix}-${String(i).padStart(2, '0')}`,
        row: 'Row A',
        num: i
      });
    }

    const newSetupObj = {
      id: newSetupId,
      name: formName,
      category: formCategory,
      price: Number(formPrice),
      dayPrice: formDayPrice ? Number(formDayPrice) : undefined,
      description: formDesc || 'Deploy to our premium gaming consoles lounge.',
      specs: formSpecs ? formSpecs.split(',').map(s => s.trim()).filter(Boolean) : ['High-End CPU Node', '4K UHD TV Display'],
      capacityText: `${formRigCount} Rigs Available`,
      seatCount: Number(formRigCount),
      image: formCategory === 'PC' ? '/pc_cyber.png' : (formCategory === 'Simulator' ? '/wheel_cyber.png' : '/ps5_cyber.png'),
      layout: {
        rows: 1,
        seatsPerRow: Number(formRigCount),
        seats
      }
    };

    onAddSetup(newSetupObj);

    setActivityFeed(prev => [
      { id: Date.now(), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), text: `Deployed new station offering: ${formName}` },
      ...prev.slice(0, 7)
    ]);

    setFormName('');
    setFormPrice('');
    setFormDayPrice('');
    setFormDesc('');
    setFormSpecs('');
    setFormRigCount(4);

    setSelectedSetupId(newSetupId);
  };

  // Submit Settings Save
  const handleSettingsSaveSubmit = (e) => {
    e.preventDefault();
    setSettingsSuccess('');

    if (!settingsSiteName.trim()) {
      alert('Site name cannot be empty.');
      return;
    }

    const updatedConfigs = {
      siteName: settingsSiteName,
      seoDesc: settingsSeoDesc,
      helpLine: settingsHelpLine,
      location: settingsLocation,
      logoIcon: settingsLogoIcon,
      logoUrl: settingsLogoUrl,
      heroSloganTop: settingsHeroSloganTop,
      heroImageUrl: settingsHeroImageUrl,
      heroTaglineBottom: settingsHeroTaglineBottom
    };

    onUpdateConfigs(updatedConfigs);
    setSettingsSuccess('System Configurations committed and saved successfully!');

    setActivityFeed(prev => [
      { id: Date.now(), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), text: `Updated portal settings: ${settingsSiteName}` },
      ...prev.slice(0, 7)
    ]);

    setTimeout(() => {
      setSettingsSuccess('');
    }, 4000);
  };

  // Populate Mock Data
  const handlePopulateMockData = () => {
    const mockNames = ['Kabir Sharma', 'Aarav Mehta', 'Ananya Roy', 'Rohan Das', 'Dia Sen'];
    const mockPhones = ['9876543210', '9123456789', '9456123780', '9898987676', '9700012345'];
    const setupKeys = activeSetups.map(s => s.id);

    for (let i = 0; i < 3; i++) {
      const targetSetupId = setupKeys[i % setupKeys.length];
      const targetSetup = activeSetups.find(x => x.id === targetSetupId);
      const bookingId = 'SD-' + Math.floor(100000 + Math.random() * 900000);
      const selectedSeat = targetSetup.layout.seats[i % targetSetup.layout.seats.length].id;
      const hourlyRate = targetSetup.price;
      const finalCost = hourlyRate * 2;

      const mockBooking = {
        id: bookingId,
        setupId: targetSetupId,
        setupName: targetSetup.name,
        bookingType: 'hourly',
        date: new Date().toISOString().split('T')[0],
        time: `2 Hour(s) [10:00 AM - 11:00 AM, 11:00 AM - 12:00 PM]`,
        times: ['10:00 AM - 11:00 AM', '11:00 AM - 12:00 PM'],
        seats: [selectedSeat],
        snacks: [],
        user: {
          name: mockNames[i],
          email: `${mockNames[i].replace(/\s+/g, '').toLowerCase()}@mock-data.com`,
          phone: mockPhones[i]
        },
        stationCost: finalCost,
        snacksCost: 0,
        price: finalCost,
        timestamp: new Date().toISOString(),
        status: 'confirmed'
      };
      onAddBooking(mockBooking);
    }

    setActivityFeed(prev => [
      { id: Date.now(), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), text: 'Populated mock reservations database' },
      ...prev
    ]);
  };

  const handleResetSystemData = () => {
    localStorage.removeItem('nexus_bookings');
    localStorage.removeItem('nexus_blocked_seats');
    localStorage.removeItem('nexus_paused_setups');
    window.location.reload();
  };

  const handleTogglePauseWithLog = (sId, date) => {
    onPauseSetup(sId, date);
    const setupName = activeSetups.find(x => x.id === sId)?.name || sId;
    const isPaused = pausedSetups[sId]?.includes(date);
    const logText = isPaused ? `Re-enabled ${setupName} on ${date}` : `Paused ${setupName} on ${date}`;
    setActivityFeed(prev => [
      { id: Date.now(), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), text: logText },
      ...prev.slice(0, 7)
    ]);
  };

  return (
    <div className="admin-dashboard-container anim-fade-in">
      <div className="admin-header-row">
        <div className="admin-header">
          <h2>SHADOW CONTROL DECK</h2>
          <p>Real-time server telemetry, game station offerings, overrides, and configurations configurator.</p>
        </div>

        {/* Emergency Shop Status */}
        <div className="shop-status-toggle-card cyber-panel">
          <span className="lbl-status-desc">SYSTEM MAIN POWER:</span>
          <button 
            className={`btn-shop-toggle ${isShopClosed ? 'status-closed' : 'status-open'}`}
            onClick={onToggleShopClosed}
          >
            <Power size={14} />
            <span>{isShopClosed ? 'CAFE OFFLINE' : 'CAFE ONLINE'}</span>
          </button>
          
          <button 
            className="btn-shop-toggle status-closed"
            onClick={onLogout}
            style={{ border: '1px solid rgba(255, 0, 85, 0.4)', background: 'rgba(255, 0, 85, 0.05)', color: 'var(--text-red)' }}
          >
            <LogOut size={14} />
            <span>SECURE LOGOUT</span>
          </button>
        </div>
      </div>

      {/* Advanced Tabbed Selector Row */}
      <div className="admin-tabs-nav">
        <button 
          className={`tab-btn ${activeSubTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('overview')}
        >
          <Activity size={14} />
          <span>OVERVIEW</span>
        </button>
        
        <button 
          className={`tab-btn ${activeSubTab === 'booker' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('booker')}
        >
          <Ticket size={14} />
          <span>WALK-IN BOOKER</span>
        </button>

        <button 
          className={`tab-btn ${activeSubTab === 'offerings' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('offerings')}
        >
          <Layers size={14} />
          <span>STATIONS</span>
        </button>

        <button 
          className={`tab-btn ${activeSubTab === 'paused' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('paused')}
        >
          <Ban size={14} />
          <span>PAUSE CALENDAR</span>
        </button>

        <button 
          className={`tab-btn ${activeSubTab === 'logs' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('logs')}
        >
          <FileText size={14} />
          <span>GAMER LOGS ({bookings.length})</span>
        </button>

        <button 
          className={`tab-btn ${activeSubTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('settings')}
        >
          <Settings size={14} />
          <span>SYSTEM CONFIGS</span>
        </button>
      </div>

      {/* SUBTAB 1: SYSTEM OVERVIEW PANEL */}
      {activeSubTab === 'overview' && (
        <div className="subtab-view-container anim-fade-in">
          <div className="metrics-cards-grid">
            <div className="metric-card cyber-panel border-blue card-glow-blue">
              <div className="metric-decor-glow cyan-bg"></div>
              <div className="metric-icon-box cyan-glow">
                <span className="rupee-icon-large">₹</span>
              </div>
              <div className="metric-details">
                <span className="metric-label">TOTAL REVENUE</span>
                <span className="metric-value">₹{totalRevenue}</span>
              </div>
            </div>

            <div className="metric-card cyber-panel border-purple card-glow-purple">
              <div className="metric-decor-glow purple-bg"></div>
              <div className="metric-icon-box magenta-glow">
                <User size={24} />
              </div>
              <div className="metric-details">
                <span className="metric-label">ACTIVE BOOKINGS</span>
                <span className="metric-value">{totalBookings} Passes</span>
              </div>
            </div>

            <div className="metric-card cyber-panel border-pink card-glow-pink">
              <div className="metric-decor-glow pink-bg"></div>
              <div className="metric-icon-box purple-glow">
                <Monitor size={24} />
              </div>
              <div className="metric-details">
                <span className="metric-label">SEAT OCCUPANCY</span>
                <span className="metric-value">{occupancyPercentage}%</span>
              </div>
            </div>
          </div>

          <div className="admin-grid-layout">
            <div className="admin-left-col">
              {/* Seating Monitor */}
              <div className="seat-controller-card cyber-panel border-purple">
                <div className="card-header-deck">
                  <div className="header-info">
                    <h3>LIVE SEAT OCCUPANCY</h3>
                    <span className="live-pulse-dot-indicator"></span>
                  </div>
                  <div className="console-chips-selector-row">
                    {activeSetups.map(s => (
                      <button
                        key={s.id}
                        className={`console-selector-chip ${selectedSetupId === s.id ? 'active' : ''}`}
                        onClick={() => setSelectedSetupId(s.id)}
                      >
                        <span>{s.name.replace('Console Lounge', '').replace('Solo Station', '').replace('Station', '').replace('Lounge', '')}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="monitor-seating-box-wrapper">
                  <div className="screen-simulation-bar">RIG MATRIX STATUS</div>
                  {currentSetup ? (
                    <div className="monitor-seating-grid">
                      {currentSetup.layout.seats.map((seat) => {
                        const isBooked = occupiedSetupSeats.includes(seat.id);
                        const isBlocked = blockedSetupSeats.includes(seat.id);
                        
                        let stateClass = 'free';
                        if (isBooked) stateClass = 'booked';
                        if (isBlocked) stateClass = 'blocked';

                        return (
                          <button
                            key={seat.id}
                            className={`monitor-seat-node node-${stateClass}`}
                            onClick={() => handleToggleBlockSeat(seat.id)}
                          >
                            <Cpu size={14} className="node-cpu-icon" />
                            <span className="node-number-lbl">{seat.num}</span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="no-setups-mon-alert">No setups active. Add consoles in Stations tab.</div>
                  )}
                </div>

                <div className="monitor-legend">
                  <div className="leg-item"><div className="leg-dot free"></div><span>Available</span></div>
                  <div className="leg-item"><div className="leg-dot booked"></div><span>Reserved</span></div>
                  <div className="leg-item"><div className="leg-dot blocked"></div><span>Blocked (offline)</span></div>
                </div>
              </div>
            </div>

            <div className="admin-right-col">
              {/* Simulated activity feed */}
              <div className="telemetry-log-card cyber-panel border-pink">
                <div className="card-header-simple">
                  <Terminal size={16} className="text-pink" />
                  <h3>SYSTEM ACTIVITY FEED</h3>
                </div>
                <div className="terminal-scroller-box">
                  {activityFeed.map((feed) => (
                    <div key={feed.id} className="terminal-feed-line">
                      <span className="time text-pink">[{feed.time}]</span>
                      <span className="arrow">»</span>
                      <span className="text">{feed.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Station Demand Chart */}
              <div className="popularity-chart-card cyber-panel border-blue" style={{ marginTop: '20px' }}>
                <h3>STATION CAPACITY RESERVATIONS</h3>
                <div className="bar-chart-container">
                  {distData.map((item, idx) => {
                    const percentage = (item.count / maxCount) * 100;
                    return (
                      <div key={idx} className="chart-bar-row">
                        <span className="bar-name">{item.name}</span>
                        <div className="bar-track">
                          <div className="bar-fill" style={{ width: `${percentage}%` }}>
                            {item.count > 0 && <span className="bar-fill-glow-line"></span>}
                          </div>
                        </div>
                        <span className="bar-val">{item.count} Seats</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: WALK-IN BOOKER WIZARD */}
      {activeSubTab === 'booker' && (
        <div className="subtab-view-container anim-fade-in">
          <div className="admin-reservation-panel cyber-panel border-purple" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h3 className="section-title-mini"><Ticket size={16} className="text-purple" /> WALK-IN RESERVATION WIZARD</h3>
            <p className="card-desc">Generate passes immediately for cash/counter walk-in customers.</p>

            {bookError && <div className="form-error-toast text-red" style={{ marginBottom: '16px' }}>{bookError}</div>}
            {bookSuccess && <div className="form-success-toast text-green" style={{ marginBottom: '16px' }}>{bookSuccess}</div>}

            <form onSubmit={handleAdminBookingSubmit} className="admin-book-quick-form">
              <div className="form-split-row">
                <div className="field-group">
                  <label className="lbl-mini-cyber">SELECT SETUP</label>
                  <select 
                    value={bookSetupId} 
                    onChange={e => {
                      setBookSetupId(e.target.value);
                      setBookSeats([]);
                    }}
                    className="cyber-input select-cyber"
                  >
                    {activeSetups.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div className="field-group">
                  <label className="lbl-mini-cyber">SELECT DATE</label>
                  <input 
                    type="date" 
                    value={bookDate} 
                    onChange={e => {
                      setBookDate(e.target.value);
                      setBookSeats([]);
                    }} 
                    className="cyber-input"
                  />
                </div>
              </div>

              <div className="form-split-row" style={{ marginTop: '10px' }}>
                <div className="field-group">
                  <label className="lbl-mini-cyber">PLAN TYPE</label>
                  <div className="plan-toggle-row-simple">
                    <button 
                      type="button"
                      className={`plan-mini-btn ${bookType === 'hourly' ? 'active-hourly' : ''}`}
                      onClick={() => {
                        setBookType('hourly');
                        setBookTimes([]);
                        setBookSeats([]);
                      }}
                    >
                      Hourly Plan
                    </button>
                    {activeSetups.find(s => s.id === bookSetupId)?.dayPrice && (
                      <button 
                        type="button"
                        className={`plan-mini-btn ${bookType === 'daily' ? 'active-daily' : ''}`}
                        onClick={() => {
                          setBookType('daily');
                          setBookTimes([]);
                          setBookSeats([]);
                        }}
                      >
                        Day Pass
                      </button>
                    )}
                  </div>
                </div>

                <div className="field-group">
                  <label className="lbl-mini-cyber">GAMER NAME</label>
                  <input 
                    type="text" 
                    placeholder="Enter full name" 
                    value={bookName} 
                    onChange={e => setBookName(e.target.value)} 
                    className="cyber-input"
                  />
                </div>
              </div>

              {bookType === 'hourly' && (
                <div className="field-group" style={{ marginTop: '14px' }}>
                  <label className="lbl-mini-cyber">CHOOSE SLOTS (MULTI-SELECT):</label>
                  <div className="time-slots-grid slots-mini-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
                    {timeSlots.map(slot => (
                      <button
                        key={slot}
                        type="button"
                        className={`time-chip-btn time-chip-small-btn ${bookTimes.includes(slot) ? 'selected' : ''}`}
                        onClick={() => handleAdminTimeToggle(slot)}
                        style={{ padding: '8px 4px', fontSize: '9px' }}
                      >
                        {slot.split(' - ')[0]}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="form-split-row" style={{ marginTop: '14px' }}>
                <div className="field-group">
                  <label className="lbl-mini-cyber">CLICK RIG(S) TO SELECT:</label>
                  <div className="admin-seats-selection-row">
                    {activeSetups.find(s => s.id === bookSetupId)?.layout.seats.map(seat => {
                      const isOccupied = adminFormOccupied.includes(seat.id);
                      const isSelected = bookSeats.includes(seat.id);
                      return (
                        <button
                          key={seat.id}
                          type="button"
                          className={`admin-seat-badge ${isSelected ? 'selected' : ''} ${isOccupied ? 'occupied' : ''}`}
                          onClick={() => !isOccupied && handleAdminSeatToggle(seat.id)}
                          disabled={isOccupied}
                        >
                          {seat.num}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="field-group">
                  <label className="lbl-mini-cyber">GAMER PHONE NUMBER</label>
                  <input 
                    type="tel" 
                    placeholder="Enter phone" 
                    value={bookPhone} 
                    onChange={e => setBookPhone(e.target.value)} 
                    className="cyber-input"
                  />
                </div>
              </div>

              <button type="submit" className="btn-cyber btn-cyber-primary btn-add-console-deck" style={{ marginTop: '20px' }}>
                <Plus size={14} /> GENERATE WALK-IN PASS
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SUBTAB 3: STATIONS MANAGEMENT */}
      {activeSubTab === 'offerings' && (
        <div className="subtab-view-container anim-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div className="offerings-creator-card cyber-panel border-blue">
            <h3 className="section-title-mini"><Layers size={16} /> CAFE STATION CONFIGURATION</h3>
            <p className="card-desc">Add or remove setups. Station lists will refresh instantly across client lobby cards.</p>

            <div className="active-offerings-simple-list">
              {activeSetups.map(s => (
                <div key={s.id} className="offering-mini-item">
                  <div className="offering-details">
                    <span className="name">{s.name}</span>
                    <span className="price-tag">₹{s.price}/hr {s.dayPrice ? `· ₹${s.dayPrice}/day pass` : ''} ({s.seatCount} rigs)</span>
                  </div>
                  <button 
                    className="btn-remove-offering"
                    onClick={() => onRemoveSetup(s.id)}
                    title={`Decommission ${s.name}`}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>

            <form onSubmit={handleCreateSetupSubmit} className="add-setup-sim-form">
              <h4 className="form-sub-header">DEPLOY NEW GAME STATION:</h4>
              
              {formError && <div className="form-error-toast text-red">{formError}</div>}
              
              <input 
                type="text" 
                placeholder="Station Name (e.g. PlayStation 5 Pro Lounge)" 
                value={formName}
                onChange={e => setFormName(e.target.value)}
                className="cyber-input"
              />

              <div className="form-split-row">
                <select 
                  value={formCategory} 
                  onChange={e => setFormCategory(e.target.value)}
                  className="cyber-input select-cyber"
                >
                  <option value="Console">Console</option>
                  <option value="PC">PC Node</option>
                  <option value="Simulator">Simulator</option>
                </select>

                <input 
                  type="number" 
                  placeholder="Rigs / Seat capacity count" 
                  value={formRigCount}
                  onChange={e => setFormRigCount(e.target.value)}
                  className="cyber-input"
                  min="1"
                />
              </div>

              <div className="form-split-row">
                <input 
                  type="number" 
                  placeholder="Hourly Cost (₹)" 
                  value={formPrice}
                  onChange={e => setFormPrice(e.target.value)}
                  className="cyber-input"
                />

                <input 
                  type="number" 
                  placeholder="Daily Cost (₹, Optional)" 
                  value={formDayPrice}
                  onChange={e => setFormDayPrice(e.target.value)}
                  className="cyber-input"
                />
              </div>

              <input 
                type="text" 
                placeholder="Hardware specifications (comma-separated)" 
                value={formSpecs}
                onChange={e => setFormSpecs(e.target.value)}
                className="cyber-input"
              />

              <textarea 
                placeholder="Description/slogan for gamer details card..." 
                value={formDesc}
                onChange={e => setFormDesc(e.target.value)}
                className="cyber-input textarea-cyber"
                rows="2"
              />

              <button type="submit" className="btn-cyber btn-cyber-primary btn-add-console-deck">
                <Plus size={14} /> DEPLOY STATION OFFERING
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SUBTAB 4: PAUSE CALENDAR */}
      {activeSubTab === 'paused' && (
        <div className="subtab-view-container anim-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div className="pause-calendar-card cyber-panel border-pink">
            <h3 className="section-title-mini"><Ban size={16} className="text-pink" /> PAUSE CALENDAR MAINTENANCE</h3>
            <p className="card-desc">Mark a setup offline on a specific day. Gamers will be blocked from selecting dates.</p>
            
            <div className="pause-form-row">
              <select 
                value={pauseSetupId}
                onChange={e => setPauseSetupId(e.target.value)}
                className="cyber-input select-cyber"
                style={{ flex: 1 }}
              >
                {activeSetups.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>

              <input 
                type="date" 
                value={pauseDate} 
                onChange={e => setPauseDate(e.target.value)} 
                className="cyber-input"
                style={{ width: '180px' }}
              />

              <button 
                className="btn-cyber btn-cyber-magenta btn-pause-toggle"
                onClick={() => handleTogglePauseWithLog(pauseSetupId, pauseDate)}
              >
                TOGGLE PAUSE STATUS
              </button>
            </div>

            <div className="paused-dates-list-wrapper">
              <h4 className="list-lbl">OFFLINE SERVICES LOG:</h4>
              {Object.entries(pausedSetups).some(([_, dates]) => dates && dates.length > 0) ? (
                <div className="paused-list-tags">
                  {Object.entries(pausedSetups).flatMap(([setupId, dates]) => {
                    if (!dates) return [];
                    const sName = activeSetups.find(x => x.id === setupId)?.name || setupId;
                    return dates.map(d => (
                      <div key={`${setupId}-${d}`} className="paused-date-chip cyber-panel border-red">
                        <span className="info">{sName} (Offline on {d})</span>
                        <button 
                          className="btn-unpause"
                          onClick={() => handleTogglePauseWithLog(setupId, d)}
                        >
                          Re-enable Station
                        </button>
                      </div>
                    ));
                  })}
                </div>
              ) : (
                <div className="no-paused-alert">All stations operational. No maintenance pauses set.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 5: RESERVATIONS LOGGER */}
      {activeSubTab === 'logs' && (
        <div className="subtab-view-container anim-fade-in">
          <div className="database-control-bar cyber-panel">
            <div className="db-lbl">
              <Database size={16} className="text-cyan" />
              <span>DATABASE UTILITIES:</span>
            </div>
            <div className="db-actions">
              <button className="btn-db-action btn-import-db" onClick={handlePopulateMockData}>
                <RefreshCw size={12} /> POPULATE MOCK DATA
              </button>
              <button className="btn-db-action btn-reset-db" onClick={handleResetSystemData}>
                <AlertTriangle size={12} /> SYSTEM RESET (CLEAR ALL)
              </button>
            </div>
          </div>

          <div className="bookings-list-card cyber-panel border-blue">
            <div className="card-header list-header">
              <div className="list-title-stack">
                <h3>RESERVATIONS DATA LOGGER</h3>
                <span className="subtitle">Search, inspect details, and print gamer passes invoices.</span>
              </div>
              
              <div className="search-filter-row">
                <div className="search-box">
                  <Search size={16} className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search name, phone, pass ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="admin-input-small"
                  />
                </div>

                <div className="filter-box">
                  <Filter size={16} className="filter-icon" />
                  <select
                    value={filterSetup}
                    onChange={(e) => setFilterSetup(e.target.value)}
                    className="admin-select-small"
                  >
                    <option value="all">All Setups</option>
                    {activeSetups.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="admin-table-container">
              {filteredBookings.length === 0 ? (
                <div className="admin-empty-state">
                  <AlertTriangle size={48} className="empty-warn-icon" />
                  <h4>NO RESERVATIONS FOUND</h4>
                  <p>No matches. Populate the database above to verify visual graphs.</p>
                </div>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>GAMER</th>
                      <th>STATION</th>
                      <th>DATE & SLOTS</th>
                      <th>RIGS</th>
                      <th>TOTAL</th>
                      <th>INVOICE</th>
                      <th>ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.map((b) => (
                      <tr key={b.id}>
                        <td>
                          <div className="gamer-details-cell">
                            <span className="g-name">{b.user.name}</span>
                            <span className="g-id">ID: {b.id}</span>
                            <span className="g-contact">{b.user.phone}</span>
                          </div>
                        </td>
                        <td>
                          <div className="station-details-cell">
                            <span className="s-name">{b.setupName}</span>
                            <span className="plan-badge">{b.bookingType === 'daily' ? 'Full Day' : 'Hourly'}</span>
                          </div>
                        </td>
                        <td>
                          <div className="time-details-cell">
                            <span className="t-date"><Calendar size={11} /> {b.date}</span>
                            <span className="t-slot"><Clock size={11} /> {b.time}</span>
                          </div>
                        </td>
                        <td>
                          <span className="seats-cell">{b.seats.join(', ')}</span>
                        </td>
                        <td>
                          <span className="price-cell">₹{b.price}</span>
                        </td>
                        <td>
                          <button 
                            className="btn-invoice-action"
                            onClick={() => setSelectedInvoice(b)}
                            title="Print Invoice / Bill"
                          >
                            <Printer size={14} />
                            <span>INVOICE</span>
                          </button>
                        </td>
                        <td>
                          <button 
                            className="btn-delete-action"
                            onClick={() => onCancelBooking(b.id)}
                            title="Cancel Booking"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 6: SYSTEM CONFIGURATIONS */}
      {activeSubTab === 'settings' && (
        <div className="subtab-view-container anim-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div className="settings-card-panel cyber-panel border-purple" style={{ padding: '24px', borderRadius: '12px' }}>
            <h3 className="section-title-mini"><Settings size={16} className="text-purple" /> SYSTEM PORTAL CONFIGURATOR</h3>
            <p className="card-desc">Modify portal identity variables, SEO settings, and business listings dynamically.</p>

            {settingsSuccess && <div className="form-success-toast text-green" style={{ marginBottom: '16px' }}>{settingsSuccess}</div>}

            <form onSubmit={handleSettingsSaveSubmit} className="admin-settings-form" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-split-row">
                <div className="field-group">
                  <label className="lbl-mini-cyber">PORTAL NAME (SITE TITLE)</label>
                  <input 
                    type="text" 
                    value={settingsSiteName}
                    onChange={e => setSettingsSiteName(e.target.value)}
                    className="cyber-input"
                    placeholder="e.g. SHADOW GAMING CAFE"
                  />
                </div>

                <div className="field-group">
                  <label className="lbl-mini-cyber">CUSTOM LOGO IMAGE URL (LINK)</label>
                  <input 
                    type="text" 
                    value={settingsLogoUrl}
                    onChange={e => setSettingsLogoUrl(e.target.value)}
                    className="cyber-input"
                    placeholder="https://example.com/logo.png"
                  />
                </div>
              </div>

              <div className="form-split-row">
                <div className="field-group">
                  <label className="lbl-mini-cyber">PORTAL LOGO ICON (LUCIDE FALLBACK)</label>
                  <select 
                    value={settingsLogoIcon}
                    onChange={e => setSettingsLogoIcon(e.target.value)}
                    className="cyber-input select-cyber"
                  >
                    <option value="Gamepad2">Esports Gamepad (Gamepad2)</option>
                    <option value="Monitor">Pro Display Monitor (Monitor)</option>
                    <option value="Cpu">Battle Telemetry Node (Cpu)</option>
                    <option value="Award">VIP Trophy Badge (Award)</option>
                    <option value="Terminal">Developer CLI Deck (Terminal)</option>
                    <option value="Tv">Retro Couch Lounge (Tv)</option>
                    <option value="Shield">Secure Access Pass (Shield)</option>
                  </select>
                </div>

                <div className="field-group">
                  <label className="lbl-mini-cyber">CUSTOMER HELPLINE CONTACT</label>
                  <input 
                    type="text" 
                    value={settingsHelpLine}
                    onChange={e => setSettingsHelpLine(e.target.value)}
                    className="cyber-input"
                    placeholder="e.g. +91 99999-XXXXX"
                  />
                </div>
              </div>

              <div className="form-split-row">
                <div className="field-group" style={{ gridColumn: 'span 2' }}>
                  <label className="lbl-mini-cyber">CAFE LOCATION ADDRESS</label>
                  <input 
                    type="text" 
                    value={settingsLocation}
                    onChange={e => setSettingsLocation(e.target.value)}
                    className="cyber-input"
                    placeholder="e.g. Connaught Place, New Delhi"
                  />
                </div>
              </div>

              <div className="field-group">
                <label className="lbl-mini-cyber">SEO META DESCRIPTION</label>
                <textarea 
                  value={settingsSeoDesc}
                  onChange={e => setSettingsSeoDesc(e.target.value)}
                  className="cyber-input textarea-cyber"
                  rows="3"
                  placeholder="Describe your cafe for search engine listings..."
                />
              </div>

              <div style={{ borderTop: '1px dashed rgba(255, 255, 255, 0.08)', paddingTop: '16px', marginTop: '8px' }}>
                <h4 className="form-sub-header" style={{ marginBottom: '12px' }}>HERO POSTER CUSTOMIZER:</h4>
                <div className="form-split-row">
                  <div className="field-group">
                    <label className="lbl-mini-cyber">HERO TOP SLOGAN</label>
                    <input 
                      type="text" 
                      value={settingsHeroSloganTop}
                      onChange={e => setSettingsHeroSloganTop(e.target.value)}
                      className="cyber-input"
                      placeholder="e.g. LEVEL UP YOUR GAMING EXPERIENCE!"
                    />
                  </div>
                  <div className="field-group">
                    <label className="lbl-mini-cyber">HERO BOTTOM TAGLINE</label>
                    <input 
                      type="text" 
                      value={settingsHeroTaglineBottom}
                      onChange={e => setSettingsHeroTaglineBottom(e.target.value)}
                      className="cyber-input"
                      placeholder="e.g. PLAY. COMPETE. CONQUER."
                    />
                  </div>
                </div>
                <div className="field-group" style={{ marginTop: '12px' }}>
                  <label className="lbl-mini-cyber">HERO BANNER ILLUSTRATION IMAGE URL</label>
                  <input 
                    type="text" 
                    value={settingsHeroImageUrl}
                    onChange={e => setSettingsHeroImageUrl(e.target.value)}
                    className="cyber-input"
                    placeholder="https://example.com/illustration.png"
                  />
                </div>
              </div>

              <button type="submit" className="btn-cyber btn-cyber-primary btn-add-console-deck" style={{ marginTop: '10px' }}>
                <CheckCircle size={14} /> COMMIT CONFIGURATIONS
              </button>
            </form>
          </div>
        </div>
      )}

      {/* DOT-MATRIX SIMULATED BILL INVOICE MODAL */}
      {selectedInvoice && (
        <div className="invoice-modal-overlay anim-fade-in">
          <div className="invoice-modal-box cyber-panel border-green">
            <button className="btn-close-modal" onClick={() => setSelectedInvoice(null)}>
              <X size={18} />
            </button>
            
            <div className="invoice-print-receipt">
              <div className="receipt-header">
                <h3>{settingsSiteName.toUpperCase()}</h3>
                <p>{settingsLocation}</p>
                <p>Ph: {settingsHelpLine}</p>
                <div className="receipt-divider">================================</div>
              </div>

              <div className="receipt-meta">
                <p><span>TICKET ID:</span> <span>{selectedInvoice.id}</span></p>
                <p><span>DATE:</span> <span>{selectedInvoice.date}</span></p>
                <p><span>GAMER:</span> <span>{selectedInvoice.user.name}</span></p>
                <p><span>CONTACT:</span> <span>{selectedInvoice.user.phone}</span></p>
                <div className="receipt-divider">--------------------------------</div>
              </div>

              <div className="receipt-items">
                <div className="receipt-item-row header">
                  <span>ITEM / PLAN</span>
                  <span>AMT</span>
                </div>
                <div className="receipt-item-row">
                  <span className="desc-wrap">{selectedInvoice.setupName}</span>
                  <span>₹{selectedInvoice.stationCost}</span>
                </div>
                <div className="receipt-sub-desc">
                  <span>- {selectedInvoice.bookingType === 'daily' ? 'Full-Day Session' : `${selectedInvoice.time}`}</span>
                </div>
                <div className="receipt-sub-desc">
                  <span>- Rig number(s): {selectedInvoice.seats.join(', ')}</span>
                </div>

                {selectedInvoice.snacks && selectedInvoice.snacks.length > 0 && (
                  <>
                    <div className="receipt-divider">- - - - - - - - - - - - - - - -</div>
                    {selectedInvoice.snacks.map((snack, idx) => (
                      <div key={idx} className="receipt-item-row">
                        <span>{snack.name} (x{snack.qty})</span>
                        <span>₹{snack.price * snack.qty}</span>
                      </div>
                    ))}
                  </>
                )}
                <div className="receipt-divider">================================</div>
              </div>

              <div className="receipt-summary">
                <p className="receipt-row-final">
                  <span>NET AMOUNT:</span>
                  <span>₹{selectedInvoice.price}/-</span>
                </p>
                <p className="text-status">STATUS: PAID IN FULL</p>
              </div>

              <div className="receipt-footer">
                <p>*** THANK YOU FOR PLAYING! ***</p>
                <p>EAT. PLAY. GAME. REPEAT.</p>
              </div>
            </div>

            <div className="invoice-print-actions">
              <button className="btn-cyber btn-cyber-primary" onClick={() => window.print()}>
                <Printer size={16} /> PRINT PHYSICAL BILL
              </button>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .admin-dashboard-container {
          max-width: 1200px;
          margin: 0 auto 80px;
          padding: 10px 0;
        }

        .admin-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
          gap: 20px;
        }

        @media (max-width: 768px) {
          .admin-header-row {
            flex-direction: column;
            align-items: flex-start;
          }
        }

        .admin-header {
          flex: 1;
        }

        .admin-header h2 {
          font-family: var(--font-cyber);
          font-size: 26px;
          letter-spacing: 2px;
          color: var(--text-primary);
          text-shadow: 0 0 10px rgba(255, 255, 255, 0.05);
          margin-bottom: 8px;
        }

        .admin-header p {
          color: var(--text-secondary);
          font-size: 13px;
        }

        /* Emergency Closed Button styles */
        .shop-status-toggle-card {
          padding: 10px 20px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 12px;
          border-color: rgba(255, 255, 255, 0.08);
          background: rgba(8, 8, 16, 0.5);
        }

        .lbl-status-desc {
          font-family: var(--font-cyber);
          font-size: 9px;
          font-weight: 700;
          color: var(--text-secondary);
          letter-spacing: 0.5px;
        }

        .btn-shop-toggle {
          border: 1.5px solid transparent;
          padding: 8px 16px;
          border-radius: 6px;
          font-family: var(--font-cyber);
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all var(--transition-normal);
        }

        .status-open {
          border-color: var(--neon-green);
          color: var(--neon-green);
          background: rgba(57, 255, 20, 0.05);
          box-shadow: 0 0 8px rgba(57, 255, 20, 0.15);
        }

        .status-open:hover {
          background: var(--neon-green);
          color: #000;
          box-shadow: 0 0 15px var(--neon-green);
        }

        .status-closed {
          border-color: var(--text-red);
          color: var(--text-red);
          background: rgba(255, 0, 85, 0.05);
          box-shadow: 0 0 8px rgba(255, 0, 85, 0.15);
        }

        .status-closed:hover {
          background: var(--text-red);
          color: #fff;
          box-shadow: 0 0 15px var(--text-red);
        }

        /* Advanced Tabbed Nav overrides */
        .admin-tabs-nav {
          display: flex;
          gap: 12px;
          margin-bottom: 30px;
          border-bottom: 1.5px solid rgba(255, 255, 255, 0.05);
          padding-bottom: 12px;
          overflow-x: auto;
        }

        .admin-tabs-nav .tab-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          border-radius: 6px;
          background: rgba(8, 8, 16, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.06);
          color: var(--text-secondary);
          cursor: pointer;
          font-family: var(--font-cyber);
          font-weight: 700;
          font-size: 10px;
          letter-spacing: 0.5px;
          transition: all 0.25s;
          white-space: nowrap;
        }

        .admin-tabs-nav .tab-btn:hover {
          border-color: var(--neon-cyan);
          color: #fff;
          background: rgba(0, 242, 254, 0.04);
        }

        .admin-tabs-nav .tab-btn.active {
          border-color: var(--neon-magenta);
          color: #fff;
          background: linear-gradient(135deg, rgba(254, 1, 154, 0.15) 0%, rgba(112, 0, 255, 0.08) 100%);
          box-shadow: 0 0 10px rgba(254, 1, 154, 0.25);
        }

        .subtab-view-container {
          width: 100%;
        }

        /* Database control panel styles */
        .database-control-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 20px;
          border-radius: 8px;
          margin-bottom: 24px;
          background: rgba(8, 8, 16, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.06);
        }

        @media (max-width: 640px) {
          .database-control-bar {
            flex-direction: column;
            gap: 12px;
            align-items: flex-start;
          }
        }

        .database-control-bar .db-lbl {
          display: flex;
          align-items: center;
          gap: 10px;
          font-family: var(--font-cyber);
          font-size: 10px;
          font-weight: 700;
          color: #fff;
        }

        .database-control-bar .db-actions {
          display: flex;
          gap: 10px;
        }

        .btn-db-action {
          padding: 6px 12px;
          border-radius: 4px;
          border: 1px solid transparent;
          font-family: var(--font-cyber);
          font-size: 9px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s;
        }

        .btn-import-db {
          border-color: var(--neon-cyan);
          color: var(--neon-cyan);
          background: rgba(0, 242, 254, 0.04);
        }

        .btn-import-db:hover {
          background: var(--neon-cyan);
          color: #000;
          box-shadow: 0 0 8px var(--neon-cyan);
        }

        .btn-reset-db {
          border-color: var(--text-red);
          color: var(--text-red);
          background: rgba(255, 0, 85, 0.04);
        }

        .btn-reset-db:hover {
          background: var(--text-red);
          color: #fff;
          box-shadow: 0 0 8px var(--text-red);
        }

        /* Metrics Row overrides */
        .metrics-cards-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          margin-bottom: 40px;
        }

        @media (max-width: 768px) {
          .metrics-cards-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }
        }

        .metric-card {
          padding: 24px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          gap: 20px;
          position: relative;
          overflow: hidden;
          transition: all var(--transition-normal);
        }

        .metric-card:hover {
          transform: translateY(-4px);
        }

        .metric-decor-glow {
          position: absolute;
          top: -50%;
          left: -20%;
          width: 60px;
          height: 120%;
          filter: blur(40px);
          opacity: 0.15;
          transform: rotate(30deg);
        }

        .cyan-bg { background: var(--neon-cyan); }
        .purple-bg { background: var(--neon-purple); }
        .pink-bg { background: var(--neon-magenta); }

        .card-glow-blue:hover { box-shadow: 0 0 15px rgba(0, 242, 254, 0.25); }
        .card-glow-purple:hover { box-shadow: 0 0 15px rgba(112, 0, 255, 0.25); }
        .card-glow-pink:hover { box-shadow: 0 0 15px rgba(254, 1, 154, 0.25); }

        .metric-icon-box {
          width: 54px;
          height: 54px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #fff;
        }

        .cyan-glow {
          border-color: rgba(0, 242, 254, 0.3);
          color: var(--neon-cyan);
          box-shadow: 0 0 10px rgba(0, 242, 254, 0.15);
        }

        .magenta-glow {
          border-color: rgba(112, 0, 255, 0.3);
          color: var(--neon-purple);
          box-shadow: 0 0 10px rgba(112, 0, 255, 0.15);
        }

        .purple-glow {
          border-color: rgba(254, 1, 154, 0.3);
          color: var(--neon-magenta);
          box-shadow: 0 0 10px rgba(254, 1, 154, 0.15);
        }

        .metric-details {
          display: flex;
          flex-direction: column;
        }

        .metric-label {
          font-family: var(--font-cyber);
          font-size: 9px;
          letter-spacing: 1px;
          color: var(--text-secondary);
          margin-bottom: 4px;
        }

        .metric-value {
          font-family: var(--font-cyber);
          font-size: 24px;
          font-weight: 800;
          color: #fff;
        }

        .rupee-icon-large {
          font-size: 22px;
          font-weight: 800;
          font-family: var(--font-cyber);
        }

        /* Layout Grid */
        .admin-grid-layout {
          display: grid;
          grid-template-columns: 380px 1fr;
          gap: 30px;
        }

        @media (max-width: 1024px) {
          .admin-grid-layout {
            grid-template-columns: 1fr;
          }
        }

        .admin-left-col {
          display: flex;
          flex-direction: column;
          gap: 30px;
        }

        .admin-right-col {
          display: flex;
          flex-direction: column;
          gap: 30px;
        }

        /* Seat Controller Deck UI */
        .card-header-deck {
          display: flex;
          flex-direction: column;
          gap: 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          padding-bottom: 16px;
          margin-bottom: 16px;
        }

        .card-header-deck .header-info {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .card-header-deck h3 {
          font-size: 15px;
          margin: 0;
        }

        .live-pulse-dot-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--neon-cyan);
          box-shadow: 0 0 8px var(--neon-cyan);
          animation: adminPulse 1.2s infinite alternate;
        }

        @keyframes adminPulse {
          0% { opacity: 0.4; }
          100% { opacity: 1; }
        }

        .console-chips-selector-row {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding-bottom: 4px;
        }

        .console-selector-chip {
          padding: 6px 12px;
          border-radius: 6px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          color: var(--text-secondary);
          cursor: pointer;
          font-family: var(--font-cyber);
          font-size: 10px;
          font-weight: 700;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .console-selector-chip:hover {
          border-color: var(--neon-cyan);
          color: #fff;
        }

        .console-selector-chip.active {
          border-color: var(--neon-purple);
          color: #fff;
          background: rgba(112, 0, 255, 0.15);
          box-shadow: 0 0 8px rgba(112, 0, 255, 0.25);
        }

        .card-desc {
          font-size: 11px;
          color: var(--text-secondary);
          margin-bottom: 20px;
          line-height: 1.4;
        }

        .monitor-seating-box-wrapper {
          background: rgba(4, 4, 8, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.04);
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 20px;
        }

        .screen-simulation-bar {
          width: 100%;
          text-align: center;
          font-family: var(--font-cyber);
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 2px;
          color: var(--text-dark);
          border-bottom: 1.5px solid rgba(255, 255, 255, 0.05);
          padding-bottom: 10px;
          margin-bottom: 24px;
        }

        .no-setups-mon-alert {
          text-align: center;
          font-size: 12px;
          color: var(--text-dark);
          padding: 20px 0;
          font-style: italic;
        }

        .monitor-seating-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          justify-items: center;
        }

        .monitor-seat-node {
          width: 52px;
          height: 52px;
          border-radius: 10px;
          border: 1.5px solid transparent;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          transition: all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .monitor-seat-node:hover {
          transform: translateY(-2px) scale(1.04);
        }

        .node-cpu-icon {
          opacity: 0.6;
        }

        .node-number-lbl {
          font-family: var(--font-cyber);
          font-size: 9px;
          font-weight: 700;
        }

        .node-free {
          background: rgba(0, 242, 254, 0.04);
          border-color: rgba(0, 242, 254, 0.25);
          color: var(--neon-cyan);
        }
        .node-free:hover {
          border-color: var(--neon-cyan);
          box-shadow: 0 0 10px rgba(0, 242, 254, 0.25);
        }

        .node-booked {
          background: rgba(112, 0, 255, 0.06);
          border-color: rgba(112, 0, 255, 0.3);
          color: var(--neon-purple);
        }
        .node-booked:hover {
          border-color: var(--neon-purple);
          box-shadow: 0 0 10px rgba(112, 0, 255, 0.25);
        }

        .node-blocked {
          background: repeating-linear-gradient(45deg, rgba(254, 1, 154, 0.03), rgba(254, 1, 154, 0.03) 8px, rgba(0, 0, 0, 0) 8px, rgba(0, 0, 0, 0) 16px);
          border-color: var(--neon-magenta) !important;
          color: var(--neon-magenta);
          animation: adminBlockPulse 1.5s infinite alternate;
        }

        @keyframes adminBlockPulse {
          0% { box-shadow: 0 0 4px rgba(254, 1, 154, 0.15); }
          100% { box-shadow: 0 0 12px rgba(254, 1, 154, 0.35); }
        }

        .monitor-legend {
          display: flex;
          justify-content: space-around;
          font-size: 11px;
          border-top: 1px solid rgba(255, 255, 255, 0.04);
          padding-top: 16px;
        }

        .leg-item {
          display: flex;
          align-items: center;
          gap: 6px;
          color: var(--text-secondary);
        }

        .leg-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .leg-dot.free { background: var(--neon-cyan); box-shadow: 0 0 6px var(--neon-cyan); }
        .leg-dot.booked { background: var(--neon-purple); box-shadow: 0 0 6px var(--neon-purple); }
        .leg-dot.blocked { background: var(--neon-magenta); box-shadow: 0 0 6px var(--neon-magenta); }

        /* Timer Chips animations inside Admin Panel */
        .slots-mini-grid {
          display: grid;
          gap: 8px;
          margin-top: 10px;
        }

        .time-chip-small-btn {
          background: rgba(8, 8, 16, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: var(--text-secondary);
          padding: 8px 4px;
          border-radius: 6px;
          cursor: pointer;
          font-family: var(--font-cyber);
          font-size: 9px;
          font-weight: 600;
          transition: all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          text-align: center;
          outline: none;
        }

        .time-chip-small-btn:hover {
          border-color: var(--neon-cyan);
          background: rgba(0, 242, 254, 0.04);
          transform: translateY(-2px);
          color: #fff;
        }

        .time-chip-small-btn.selected {
          color: #ffffff !important;
          background: linear-gradient(135deg, rgba(254, 1, 154, 0.35) 0%, rgba(112, 0, 255, 0.2) 100%) !important;
          border-color: var(--neon-magenta) !important;
          box-shadow: 0 0 18px rgba(254, 1, 154, 0.55), inset 0 0 8px rgba(254, 1, 154, 0.2) !important;
          text-shadow: 0 0 5px rgba(255, 255, 255, 0.8);
          transform: scale(1.06) translateY(-2px);
          animation: adminSlotGlow 2s infinite alternate;
        }

        @keyframes adminSlotGlow {
          0% {
            box-shadow: 0 0 8px rgba(254, 1, 154, 0.35), inset 0 0 4px rgba(254, 1, 154, 0.1);
          }
          100% {
            box-shadow: 0 0 20px rgba(254, 1, 154, 0.8), inset 0 0 10px rgba(254, 1, 154, 0.4);
          }
        }

        /* Telemetry scroller feed */
        .telemetry-log-card {
          padding: 24px;
          border-radius: 12px;
          background: rgba(4, 4, 8, 0.7);
        }

        .card-header-simple {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          padding-bottom: 10px;
        }

        .card-header-simple h3 {
          font-size: 14px;
          margin: 0;
        }

        .terminal-scroller-box {
          font-family: monospace;
          font-size: 11px;
          color: #fff;
          background: #020204;
          border: 1.5px solid rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          padding: 16px;
          min-height: 140px;
          max-height: 200px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .terminal-feed-line {
          display: flex;
          gap: 8px;
          line-height: 1.4;
        }

        .terminal-feed-line .time {
          color: var(--neon-magenta);
        }

        .terminal-feed-line .arrow {
          color: var(--neon-cyan);
        }

        .terminal-feed-line .text {
          color: #ffffff;
        }

        /* Station Demand Chart overrides */
        .chart-bar-row {
          display: flex;
          align-items: center;
          gap: 16px;
          margin: 14px 0;
          font-size: 12px;
        }

        .bar-name {
          width: 110px;
          color: var(--text-secondary);
          text-overflow: ellipsis;
          overflow: hidden;
          white-space: nowrap;
        }

        .bar-track {
          flex: 1;
          height: 10px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 4px;
          overflow: hidden;
          position: relative;
        }

        .bar-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--neon-cyan), var(--neon-purple));
          border-radius: 4px;
          position: relative;
        }

        .bar-fill-glow-line {
          position: absolute;
          top: 0;
          right: 0;
          width: 4px;
          height: 100%;
          background: #ffffff;
          box-shadow: 0 0 6px #ffffff;
        }

        .bar-val {
          width: 56px;
          text-align: right;
          color: var(--text-primary);
          font-weight: 600;
        }

        /* Pause Day Calendar styling rules */
        .pause-calendar-card {
          padding: 24px;
          border-radius: 12px;
        }

        .pause-form-row {
          display: flex;
          gap: 12px;
          margin-bottom: 20px;
        }

        @media (max-width: 640px) {
          .pause-form-row {
            flex-direction: column;
          }
        }

        .btn-pause-toggle {
          padding: 10px 16px !important;
          font-size: 11px !important;
          border-radius: 6px !important;
        }

        .paused-dates-list-wrapper {
          border-top: 1px dashed rgba(255, 255, 255, 0.06);
          padding-top: 16px;
        }

        .paused-dates-list-wrapper .list-lbl {
          font-family: var(--font-cyber);
          font-size: 9px;
          font-weight: 700;
          color: var(--neon-cyan);
          letter-spacing: 0.5px;
          margin-bottom: 10px;
        }

        .paused-list-tags {
          display: flex;
          flex-direction: column;
          gap: 8px;
          max-height: 150px;
          overflow-y: auto;
        }

        .paused-date-chip {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 12px;
          background: rgba(255, 0, 85, 0.04);
          border-radius: 6px;
        }

        .paused-date-chip .info {
          font-size: 11px;
          color: #fff;
          font-weight: 600;
        }

        .btn-unpause {
          background: var(--text-red);
          color: #fff;
          border: none;
          padding: 4px 10px;
          border-radius: 4px;
          font-family: var(--font-cyber);
          font-size: 8px;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 0 6px var(--text-red);
          transition: transform 0.2s;
        }

        .btn-unpause:hover {
          transform: scale(1.05);
        }

        .no-paused-alert {
          font-size: 11px;
          color: var(--text-dark);
          font-style: italic;
        }

        /* Cafe Offerings list creator styles */
        .section-title-mini {
          font-family: var(--font-cyber);
          font-size: 13px;
          color: #fff;
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
        }

        .active-offerings-simple-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          max-height: 180px;
          overflow-y: auto;
          background: rgba(4, 4, 8, 0.3);
          border: 1.5px solid rgba(255, 255, 255, 0.04);
          border-radius: 8px;
          padding: 8px;
          margin-bottom: 24px;
        }

        .offering-mini-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 12px;
          background: rgba(255, 255, 255, 0.01);
          border: 1px solid rgba(255, 255, 255, 0.04);
          border-radius: 6px;
          transition: border-color 0.2s;
        }

        .offering-mini-item:hover {
          border-color: rgba(0, 242, 254, 0.2);
        }

        .offering-mini-item .offering-details {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .offering-mini-item .name {
          font-weight: 700;
          font-size: 11px;
          color: #fff;
        }

        .offering-mini-item .price-tag {
          font-family: var(--font-cyber);
          font-size: 8px;
          color: var(--text-secondary);
        }

        .btn-remove-offering {
          background: transparent;
          border: 1px solid rgba(255, 0, 85, 0.3);
          color: var(--text-red);
          width: 24px;
          height: 24px;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .btn-remove-offering:hover {
          background: var(--text-red);
          color: #fff;
          box-shadow: 0 0 8px var(--text-red);
        }

        .add-setup-sim-form {
          border-top: 1px dashed rgba(255, 255, 255, 0.06);
          padding-top: 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .form-sub-header {
          font-family: var(--font-cyber);
          font-size: 9px;
          font-weight: 700;
          color: var(--neon-cyan);
          letter-spacing: 0.5px;
          margin-bottom: 4px;
        }

        .form-error-toast {
          font-size: 11px;
          background: rgba(255, 0, 85, 0.08);
          border: 1.5px solid rgba(255, 0, 85, 0.25);
          padding: 8px 12px;
          border-radius: 6px;
        }

        .form-success-toast {
          font-size: 11px;
          background: rgba(57, 255, 20, 0.08);
          border: 1.5px solid rgba(57, 255, 20, 0.25);
          padding: 8px 12px;
          border-radius: 6px;
        }

        .form-split-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .select-cyber {
          background-color: #040408 !important;
          color: var(--text-secondary);
          cursor: pointer;
        }

        .textarea-cyber {
          resize: none;
        }

        .btn-add-console-deck {
          font-size: 11px !important;
          padding: 10px !important;
          border-radius: 6px !important;
          justify-content: center;
          gap: 6px;
        }

        /* Admin Quick reservation form styles */
        .admin-reservation-panel {
          padding: 24px;
          border-radius: 12px;
        }

        .admin-book-quick-form {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .field-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
          flex: 1;
        }

        .plan-toggle-row-simple {
          display: flex;
          gap: 8px;
        }

        .plan-toggle-row-simple .plan-mini-btn {
          flex: 1;
          background: rgba(8, 8, 16, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: var(--text-secondary);
          padding: 8px;
          border-radius: 6px;
          cursor: pointer;
          font-family: var(--font-cyber);
          font-size: 10px;
          font-weight: 600;
          transition: all 0.2s;
        }

        .plan-toggle-row-simple .plan-mini-btn:hover {
          border-color: rgba(112, 0, 255, 0.3);
          color: #fff;
        }

        .plan-toggle-row-simple .active-hourly {
          border-color: var(--neon-blue) !important;
          background: rgba(0, 119, 255, 0.1) !important;
          color: var(--neon-cyan) !important;
        }

        .plan-toggle-row-simple .active-daily {
          border-color: var(--neon-magenta) !important;
          background: rgba(254, 1, 154, 0.1) !important;
          color: var(--neon-magenta) !important;
        }

        .admin-seats-selection-row {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .admin-seat-badge {
          width: 26px;
          height: 26px;
          border-radius: 4px;
          border: 1.5px solid rgba(0, 242, 254, 0.25);
          background: rgba(8, 8, 16, 0.6);
          color: var(--neon-cyan);
          font-family: var(--font-cyber);
          font-size: 10px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .admin-seat-badge:hover:not(.occupied) {
          border-color: var(--neon-cyan);
          background: rgba(0, 242, 254, 0.1);
        }

        .admin-seat-badge.selected {
          border-color: var(--neon-green) !important;
          background: rgba(57, 255, 20, 0.15) !important;
          color: var(--neon-green) !important;
          box-shadow: 0 0 6px var(--neon-green);
        }

        .admin-seat-badge.occupied {
          border-color: rgba(255, 255, 255, 0.05) !important;
          background: rgba(255, 255, 255, 0.02) !important;
          color: var(--text-dark) !important;
          cursor: not-allowed;
        }

        /* Reservations Log overrides */
        .list-header {
          flex-direction: column;
          align-items: flex-start !important;
          gap: 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          padding-bottom: 16px;
          margin-bottom: 0px !important;
        }

        .list-title-stack h3 {
          margin-bottom: 2px;
        }

        .list-title-stack .subtitle {
          font-size: 11px;
          color: var(--text-secondary);
        }

        .search-filter-row {
          display: flex;
          gap: 12px;
          width: 100%;
        }

        @media (max-width: 640px) {
          .search-filter-row {
            flex-direction: column;
          }
        }

        .search-box, .filter-box {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(8, 8, 16, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 6px;
          padding: 0 12px;
          flex: 1;
        }

        .search-icon, .filter-icon {
          color: var(--text-secondary);
        }

        .admin-input-small, .admin-select-small {
          background: transparent;
          border: none;
          color: #fff;
          font-size: 12px;
          padding: 8px 0;
          width: 100%;
          outline: none;
        }

        .admin-select-small option {
          background: #040408;
          color: #fff;
        }

        /* Reservations Table overrides */
        .admin-table-container {
          overflow-x: auto;
          width: 100%;
        }

        .admin-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          font-size: 12px;
        }

        .admin-table th {
          padding: 16px 20px;
          font-family: var(--font-cyber);
          font-size: 9px;
          color: var(--text-secondary);
          letter-spacing: 1px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          text-transform: uppercase;
        }

        .admin-table td {
          padding: 16px 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.03);
          vertical-align: middle;
        }

        .admin-table tr:hover td {
          background: rgba(255, 255, 255, 0.01);
        }

        .gamer-details-cell {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .gamer-details-cell .g-name {
          font-weight: 700;
          color: #fff;
        }

        .gamer-details-cell .g-id {
          font-family: var(--font-cyber);
          font-size: 9px;
          color: var(--neon-cyan);
        }

        .gamer-details-cell .g-contact {
          font-size: 10px;
          color: var(--text-dark);
        }

        .station-details-cell {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .station-details-cell .s-name {
          font-weight: 600;
          color: #fff;
        }

        .plan-badge {
          font-size: 8px;
          color: var(--neon-purple);
          border: 1px solid rgba(112, 0, 255, 0.3);
          border-radius: 4px;
          padding: 1px 6px;
          align-self: flex-start;
          font-family: var(--font-cyber);
          letter-spacing: 0.5px;
          background: rgba(112, 0, 255, 0.05);
        }

        .time-details-cell {
          display: flex;
          flex-direction: column;
          gap: 4px;
          max-width: 160px;
        }

        .time-details-cell span {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .time-details-cell .t-date {
          color: var(--text-secondary);
        }

        .time-details-cell .t-slot {
          color: var(--neon-purple);
          word-break: break-word;
          line-height: 1.35;
        }

        .seats-cell {
          font-family: var(--font-cyber);
          font-weight: 700;
          color: var(--neon-cyan);
          background: rgba(0, 242, 254, 0.04);
          border: 1px solid rgba(0, 242, 254, 0.15);
          padding: 2px 8px;
          border-radius: 4px;
        }

        .price-cell {
          font-family: var(--font-cyber);
          font-weight: 800;
          color: var(--neon-green);
          font-size: 14px;
        }

        .btn-delete-action {
          width: 32px;
          height: 32px;
          border-radius: 6px;
          border: 1px solid rgba(254, 1, 154, 0.25);
          background: rgba(254, 1, 154, 0.04);
          color: var(--neon-magenta);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .btn-delete-action:hover {
          border-color: var(--neon-magenta);
          background: var(--neon-magenta);
          color: #000;
          box-shadow: 0 0 8px var(--neon-magenta);
        }

        /* Print Invoice / Bill Action button */
        .btn-invoice-action {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 4px;
          border: 1.5px solid rgba(0, 242, 254, 0.3);
          background: rgba(0, 242, 254, 0.05);
          color: var(--neon-cyan);
          font-family: var(--font-cyber);
          font-size: 9px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-invoice-action:hover {
          border-color: var(--neon-cyan);
          background: var(--neon-cyan);
          color: #000;
          box-shadow: 0 0 8px var(--neon-cyan);
        }

        /* Empty state overrides */
        .admin-empty-state {
          padding: 60px 40px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .empty-warn-icon {
          color: var(--text-dark);
          margin-bottom: 16px;
        }

        .admin-empty-state h4 {
          font-family: var(--font-cyber);
          letter-spacing: 1px;
          font-size: 14px;
          margin-bottom: 8px;
        }

        .admin-empty-state p {
          font-size: 12px;
          color: var(--text-secondary);
        }

        /* simulated receipt popups styles */
        .invoice-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(4, 4, 8, 0.85);
          backdrop-filter: blur(8px);
          z-index: 999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .invoice-modal-box {
          width: 100%;
          max-width: 360px;
          padding: 32px;
          background: rgba(8, 8, 16, 0.95);
          border-radius: 16px;
          position: relative;
        }

        .btn-close-modal {
          position: absolute;
          top: 16px;
          right: 16px;
          background: transparent;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
        }

        .btn-close-modal:hover {
          color: #fff;
        }

        .invoice-print-receipt {
          background: #fbfbfd;
          border: 1px solid #d3d3d3;
          border-radius: 2px;
          box-shadow: 0 0 10px rgba(0,0,0,0.1);
          color: #000;
          font-family: monospace;
          padding: 20px;
          font-size: 11px;
          line-height: 1.5;
        }

        .receipt-header {
          text-align: center;
        }

        .receipt-header h3 {
          font-size: 13px;
          font-weight: 800;
          margin-bottom: 4px;
        }

        .receipt-divider {
          text-align: center;
          margin: 10px 0;
        }

        .receipt-meta p, .receipt-item-row {
          display: flex;
          justify-content: space-between;
          margin: 4px 0;
        }

        .receipt-item-row.header {
          font-weight: 800;
          border-bottom: 1px dashed #000;
          padding-bottom: 4px;
          margin-bottom: 6px;
        }

        .receipt-sub-desc {
          font-size: 10px;
          color: #444;
          padding-left: 10px;
        }

        .desc-wrap {
          max-width: 200px;
          word-break: break-word;
        }

        .receipt-summary {
          margin-top: 14px;
        }

        .receipt-row-final {
          display: flex;
          justify-content: space-between;
          font-weight: 800;
          font-size: 12px;
        }

        .text-status {
          text-align: center;
          font-weight: 800;
          color: #008000;
          margin-top: 8px;
        }

        .receipt-footer {
          text-align: center;
          margin-top: 16px;
          font-size: 10px;
        }

        .invoice-print-actions {
          margin-top: 20px;
          display: flex;
          justify-content: center;
        }
      `}} />
    </div>
  );
};

export default AdminPanel;
