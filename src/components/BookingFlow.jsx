import React, { useState, useEffect } from 'react';
import { setupsData, mockOccupiedSeats, snacksData } from '../data/setupsData';
import SeatLayout from './SeatLayout';
import { Gamepad, Check, User, Mail, Phone, Calendar, Clock, ChevronRight, ChevronLeft, CreditCard, Sparkles, RefreshCw, ShoppingCart, Plus, Minus, Flame, Cpu, QrCode, ShieldAlert, Award } from 'lucide-react';
import confetti from 'canvas-confetti';

const BookingFlow = ({ onBookingComplete, existingBookings = [], blockedSeats = {}, initialSetupId = null, setups = [], pausedSetups = {} }) => {
  const [step, setStep] = useState(1);
  const [selectedSetup, setSelectedSetup] = useState(null);
  const [bookingType, setBookingType] = useState('hourly'); // 'hourly' | 'daily'
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTimes, setSelectedTimes] = useState([]); // multiple slot hours
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [selectedSnacks, setSelectedSnacks] = useState({}); // { snackId: qty }
  const [registration, setRegistration] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [generatedTicket, setGeneratedTicket] = useState(null);
  const [occupiedSeats, setOccupiedSeats] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('upi'); // 'upi' | 'card' | 'bank'

  const activeSetups = setups && setups.length > 0 ? setups : setupsData;
  const isStationPaused = selectedSetup && selectedDate && pausedSetups[selectedSetup.id]?.includes(selectedDate);

  // Available Time Slots - 1 Hour slots
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

  // Default date to today
  useEffect(() => {
    const today = new Date();
    const formatted = today.toISOString().split('T')[0];
    setSelectedDate(formatted);
  }, []);

  // Sync initialSetupId from parent
  useEffect(() => {
    if (initialSetupId) {
      const setup = activeSetups.find(s => s.id === initialSetupId);
      if (setup) {
        setSelectedSetup(setup);
        setSelectedTimes([]);
        setSelectedSeats([]);
        setStep(2); // Skip Step 1 (Setup select), start at Step 2 (Date select)
      }
    } else {
      setSelectedSetup(null);
      setSelectedTimes([]);
      setSelectedSeats([]);
      setStep(1);
    }
  }, [initialSetupId, activeSetups]);

  // Update occupied seats dynamically
  useEffect(() => {
    if (!selectedSetup) return;
    
    let baseOccupied = mockOccupiedSeats[selectedSetup.id] || [];

    // Filter real bookings for same setup, date & overlap times
    const matches = existingBookings.filter(b => {
      const isSameSetup = b.setupId === selectedSetup.id;
      const isSameDate = b.date === selectedDate;
      if (!isSameSetup || !isSameDate) return false;
      
      if (bookingType === 'daily' || b.bookingType === 'daily') {
        return true;
      }
      
      const bookingSlots = b.times || [b.time];
      return selectedTimes.some(slot => bookingSlots.includes(slot));
    });

    const realOccupied = matches.flatMap(b => b.seats);
    const blocked = blockedSeats[selectedSetup.id] || [];
    const combined = Array.from(new Set([...baseOccupied, ...realOccupied, ...blocked]));
    setOccupiedSeats(combined);
    
    // Clear currently selected seats if they are now occupied
    setSelectedSeats(prev => prev.filter(seat => !combined.includes(seat)));
  }, [selectedSetup, selectedDate, selectedTimes, bookingType, existingBookings, blockedSeats]);

  const getNextDays = () => {
    const days = [];
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const dayNum = String(d.getDate()).padStart(2, '0');
      const dayName = weekdays[d.getDay()];
      const monthName = months[d.getMonth()];
      const isoString = d.toISOString().split('T')[0];
      
      days.push({
        isoString,
        dayNum,
        dayName,
        monthName,
        isToday: i === 0
      });
    }
    return days;
  };

  const handleSetupSelect = (setup) => {
    setSelectedSetup(setup);
    setSelectedTimes([]);
    setSelectedSeats([]);
    setBookingType('hourly');
    setStep(2);
  };

  const handleTimeToggle = (slot) => {
    setSelectedTimes(prev => {
      if (prev.includes(slot)) {
        return prev.filter(s => s !== slot);
      } else {
        return [...prev, slot];
      }
    });
  };

  const handleSeatToggle = (seatId) => {
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(prev => prev.filter(id => id !== seatId));
    } else {
      const maxSeats = selectedSetup.id === 'pc_multiplayer' ? 5 : 4;
      if (selectedSeats.length >= maxSeats) {
        setSelectedSeats(prev => [...prev.slice(1), seatId]);
      } else {
        setSelectedSeats(prev => [...prev, seatId]);
      }
    }
  };

  const handleSnackQuantity = (snackId, change) => {
    setSelectedSnacks(prev => {
      const currentQty = prev[snackId] || 0;
      const newQty = Math.max(0, currentQty + change);
      const updated = { ...prev };
      if (newQty === 0) {
        delete updated[snackId];
      } else {
        updated[snackId] = newQty;
      }
      return updated;
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRegistration(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!registration.name.trim()) errors.name = 'Full name is required';
    if (!registration.email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(registration.email)) {
      errors.email = 'Enter a valid email address';
    }
    if (!registration.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^[0-9\s-+]{10,14}$/.test(registration.phone.replace(/\s/g, ''))) {
      errors.phone = 'Enter a valid 10-digit number';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleDetailsSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      setStep(7); // Go to Payment gateway Step 7
    }
  };

  const getStationCost = () => {
    if (!selectedSetup) return 0;
    if (bookingType === 'daily') {
      return selectedSetup.dayPrice * selectedSeats.length;
    }
    const hoursCount = selectedTimes.length || 1;
    return selectedSetup.price * selectedSeats.length * hoursCount;
  };

  const getSnacksCost = () => {
    return Object.entries(selectedSnacks).reduce((sum, [snackId, qty]) => {
      const snack = snacksData.find(s => s.id === snackId);
      return sum + (snack ? snack.price * qty : 0);
    }, 0);
  };

  const getGrandTotal = () => {
    return getStationCost() + getSnacksCost();
  };

  const triggerConfetti = () => {
    const duration = 2.5 * 1000;
    const end = Date.now() + duration;
    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#00f2fe', '#fe019a', '#7000ff']
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#00f2fe', '#fe019a', '#7000ff']
      });
      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  };

  const handleConfirmBooking = () => {
    const bookingId = 'SD-' + Math.floor(100000 + Math.random() * 900000);
    const stationCost = getStationCost();
    const snacksCost = getSnacksCost();
    const grandTotal = getGrandTotal();

    const bookedSnacks = Object.entries(selectedSnacks).map(([snackId, qty]) => {
      const snack = snacksData.find(s => s.id === snackId);
      return {
        id: snackId,
        name: snack ? snack.name : '',
        qty,
        price: snack ? snack.price : 0
      };
    });

    const timeSummary = bookingType === 'daily' 
      ? 'Full-Day (12 Hours)' 
      : `${selectedTimes.length} Hour(s) [${selectedTimes.join(', ')}]`;

    const newBooking = {
      id: bookingId,
      setupId: selectedSetup.id,
      setupName: selectedSetup.name,
      bookingType,
      date: selectedDate,
      time: timeSummary,
      times: selectedTimes,
      seats: selectedSeats,
      snacks: bookedSnacks,
      user: registration,
      stationCost,
      snacksCost,
      price: grandTotal,
      timestamp: new Date().toISOString(),
      status: 'confirmed'
    };

    setGeneratedTicket(newBooking);
    onBookingComplete(newBooking);
    setStep(8); // Success Ticket screen is Step 8
    triggerConfetti();
  };

  const resetBookingFlow = () => {
    setStep(1);
    setSelectedSetup(null);
    setBookingType('hourly');
    setSelectedSeats([]);
    setSelectedTimes([]);
    setSelectedSnacks({});
    setRegistration({ name: '', email: '', phone: '' });
    setGeneratedTicket(null);
    setPaymentMethod('upi');
  };

  const getCardBorderClass = (setupId) => {
    if (setupId === 'ps4') return 'border-blue';
    if (setupId === 'ps5') return 'border-purple';
    if (setupId === 'steering_wheel') return 'border-pink';
    return '';
  };

  const getProgressActiveNode = () => {
    if (step === 1) return 1;
    if (step === 2 || step === 3) return 2;
    if (step === 4) return 3;
    if (step === 5) return 4;
    if (step === 6) return 5;
    return 6; // step 7 is payment
  };

  const progressNode = getProgressActiveNode();

  return (
    <div className="booking-wizard-wrapper">
      {/* 6-Step Sequential Progress Bar */}
      {step <= 7 && (
        <div className="step-progress-bar">
          <div className={`progress-node ${progressNode >= 1 ? 'active' : ''} ${progressNode > 1 ? 'completed' : ''}`}>
            <span className="node-num">{progressNode > 1 ? <Check size={12} /> : '1'}</span>
            <span className="node-label">Console</span>
          </div>
          <div className="progress-connector"><div className="connector-line" style={{ width: progressNode > 1 ? '100%' : '0%' }}></div></div>
          
          <div className={`progress-node ${progressNode >= 2 ? 'active' : ''} ${progressNode > 2 ? 'completed' : ''}`}>
            <span className="node-num">{progressNode > 2 ? <Check size={12} /> : '2'}</span>
            <span className="node-label">Date & Time</span>
          </div>
          <div className="progress-connector"><div className="connector-line" style={{ width: progressNode > 2 ? '100%' : '0%' }}></div></div>
          
          <div className={`progress-node ${progressNode >= 3 ? 'active' : ''} ${progressNode > 3 ? 'completed' : ''}`}>
            <span className="node-num">{progressNode > 3 ? <Check size={12} /> : '3'}</span>
            <span className="node-label">Seats Map</span>
          </div>
          <div className="progress-connector"><div className="connector-line" style={{ width: progressNode > 3 ? '100%' : '0%' }}></div></div>

          <div className={`progress-node ${progressNode >= 4 ? 'active' : ''} ${progressNode > 4 ? 'completed' : ''}`}>
            <span className="node-num">{progressNode > 4 ? <Check size={12} /> : '4'}</span>
            <span className="node-label">Snacks</span>
          </div>
          <div className="progress-connector"><div className="connector-line" style={{ width: progressNode > 4 ? '100%' : '0%' }}></div></div>

          <div className={`progress-node ${progressNode >= 5 ? 'active' : ''} ${progressNode > 5 ? 'completed' : ''}`}>
            <span className="node-num">{progressNode > 5 ? <Check size={12} /> : '5'}</span>
            <span className="node-label">Details</span>
          </div>
          <div className="progress-connector"><div className="connector-line" style={{ width: progressNode > 5 ? '100%' : '0%' }}></div></div>

          <div className={`progress-node ${progressNode >= 6 ? 'active' : ''}`}>
            <span className="node-num">6</span>
            <span className="node-label">Payment</span>
          </div>
        </div>
      )}

      {/* STEP 1: CONSOLE LIST */}
      {step === 1 && (
        <div className="step-container anim-fade-in">
          <div className="step-header">
            <h2>SELECT YOUR BATTLE CONSOLE</h2>
            <p>Deploy to our high-end dedicated gaming stations below</p>
          </div>

          <div className="setups-cards-grid">
            {activeSetups.map((setup) => (
              <div 
                key={setup.id} 
                className={`setup-cyber-card setup-card-premium cyber-panel ${getCardBorderClass(setup.id)}`}
                onClick={() => handleSetupSelect(setup)}
              >
                <div className="glow-bar-top"></div>
                <div className="setup-badge">{setup.category}</div>
                {setup.image && (
                  <div className="setup-card-image-box">
                    <img src={setup.image} alt={setup.name} className="setup-card-img" />
                    <div className="image-shimmer-sweep"></div>
                  </div>
                )}
                <div className="setup-header-card">
                  <h3 className="setup-title">{setup.name}</h3>
                  <div className="pricing-info-stack">
                    <div className="setup-price-tag">
                      <span className="price-val">₹{setup.price}</span>
                      <span className="price-unit">/hr</span>
                    </div>
                    {setup.dayPrice && (
                      <div className="setup-price-tag-day">
                        <Flame size={12} className="flame-icon" />
                        <span className="price-val-day text-magenta">₹{setup.dayPrice}</span>
                        <span className="price-unit-day">/day pass</span>
                      </div>
                    )}
                  </div>
                </div>
                <p className="setup-desc">{setup.description}</p>
                
                <div className="specs-hologram-chips">
                  {setup.specs.slice(0, 3).map((spec, idx) => (
                    <span key={idx} className="spec-holo-tag">
                      <Cpu size={10} className="spec-chip-cpu" /> {spec}
                    </span>
                  ))}
                </div>

                <div className="setup-footer">
                  <span className="setup-capacity">{setup.capacityText}</span>
                  <button className="setup-action-btn">
                    <span>SELECT STATION</span>
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 2: SELECT DATE */}
      {step === 2 && selectedSetup && (
        <div className="step-container anim-fade-in">
          <div className="step-header">
            <h2>SELECT BOOKING DATE</h2>
            <p>Pick your access date from the upcoming calendar</p>
          </div>

          <div className="single-picker-panel cyber-panel border-blue">
            <h3 className="sub-title"><Calendar size={18} /> AVAILABLE DATES</h3>
            <div className="horizontal-date-slider sliding-date-colored-row">
              {getNextDays().map((day) => (
                <button
                  key={day.isoString}
                  className={`date-chip date-chip-colored ${selectedDate === day.isoString ? 'selected' : ''}`}
                  onClick={() => setSelectedDate(day.isoString)}
                >
                  <span className="date-month">{day.monthName}</span>
                  <span className="date-number">{day.dayNum}</span>
                  <span className="date-weekday">{day.dayName}</span>
                </button>
              ))}
            </div>

            {isStationPaused && (
              <div className="paused-station-alert cyber-panel border-red anim-fade-in" style={{ marginTop: '20px' }}>
                <AlertOctagon size={24} className="text-red" />
                <div className="paused-alert-details">
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#fff', fontFamily: 'var(--font-cyber)' }}>STATION TEMPORARILY OFFLINE</h4>
                  <p style={{ margin: '0 0 4px 0', fontSize: '11px', color: 'var(--text-secondary)' }}>This gaming station is paused/disabled for maintenance on {selectedDate} by the cafe manager.</p>
                  <p style={{ margin: 0, fontSize: '9px', color: 'var(--text-dark)' }}>Please select a different date or go back to select another console.</p>
                </div>
              </div>
            )}
          </div>

          <div className="wizard-navigation-actions">
            <button className="btn-cyber btn-cyber-magenta" onClick={() => setStep(1)}>
              <ChevronLeft size={16} /> Back
            </button>
            <button className="btn-cyber btn-cyber-primary" onClick={() => setStep(3)} disabled={!selectedDate || isStationPaused}>
              Proceed to Time slots <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: SELECT TIMER SLOTS & PLAN */}
      {step === 3 && selectedSetup && (
        <div className="step-container anim-fade-in">
          <div className="step-header">
            <h2>CHOOSE TIMING PLAN</h2>
            <p>Select daily pass or multiple 1-hour slots</p>
          </div>

          <div className="timing-flow-layout-section">
            
            {/* Daily rate vs Hourly option toggle */}
            {selectedSetup.dayPrice && (
              <div className="pricing-plan-section-mini mini-plan-colored cyber-panel border-purple">
                <span className="lbl-mini-cyber"><Flame size={12} /> SELECT PRICING PLAN</span>
                <div className="plan-mini-toggle-row">
                  <button
                    className={`plan-mini-btn ${bookingType === 'hourly' ? 'active-hourly' : ''}`}
                    onClick={() => {
                      setBookingType('hourly');
                      setSelectedTimes([]);
                    }}
                  >
                    HOURLY PLAN (₹{selectedSetup.price}/hr)
                  </button>
                  <button
                    className={`plan-mini-btn ${bookingType === 'daily' ? 'active-daily' : ''}`}
                    onClick={() => {
                      setBookingType('daily');
                      setSelectedTimes([]);
                    }}
                  >
                    FULL-DAY PASS (₹{selectedSetup.dayPrice}/day)
                  </button>
                </div>
              </div>
            )}

            {/* Time Slots grid selector */}
            {bookingType === 'hourly' && (
              <div className="time-picker-section unified-tp-section timer-colored-card cyber-panel border-pink">
                <div className="time-section-header-recap">
                  <span className="lbl-mini-cyber"><Clock size={12} /> SELECT TIMER SLOT(S) - MULTI-SELECT SUPPORTED</span>
                  {selectedTimes.length > 0 && (
                    <span className="hours-recap-count-badge">{selectedTimes.length} Hour(s) Selected</span>
                  )}
                </div>
                <div className="time-slots-grid slots-mini-grid">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot}
                      className={`time-chip-btn time-chip-small-btn ${selectedTimes.includes(slot) ? 'selected' : ''}`}
                      onClick={() => handleTimeToggle(slot)}
                    >
                      <span>{slot}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {bookingType === 'daily' && (
              <div className="daily-pass-small-alert daily-alert-colored cyber-panel border-blue">
                <Flame size={16} className="flame-neon" />
                <span>Full-Day Session: 10:00 AM to 10:00 PM (12 Hours) reserved. Free snacks voucher included.</span>
              </div>
            )}
          </div>

          <div className="wizard-navigation-actions">
            <button className="btn-cyber btn-cyber-magenta" onClick={() => setStep(2)}>
              <ChevronLeft size={16} /> Back
            </button>
            <button 
              className="btn-cyber btn-cyber-primary" 
              onClick={() => setStep(4)}
              disabled={(bookingType === 'hourly' && selectedTimes.length === 0) || isStationPaused}
            >
              Choose Seating <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: SEAT SELECTOR (With bottom checkout price summary) */}
      {step === 4 && selectedSetup && (
        <div className="step-container anim-fade-in">
          <div className="step-header">
            <h2>SELECT YOUR COUCH / RIG</h2>
            <p>Cinema-style seat layout selector. Click to select seat. Dark seats are occupied.</p>
          </div>

          <div className="seating-selections-box">
            <SeatLayout 
              setup={selectedSetup}
              selectedSeats={selectedSeats}
              onSeatToggle={handleSeatToggle}
              occupiedSeats={occupiedSeats}
            />
          </div>

          {/* Sticky Bottom Recap Bar */}
          <div className="booking-sticky-bottom-bar cyber-panel border-blue">
            <div className="bottom-bar-left">
              <span className="seats-recap-lbl">SELECTED SEATS:</span>
              <span className="seats-recap-val text-cyan">
                {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None'}
              </span>
            </div>
            <div className="bottom-bar-center">
              <span className="price-recap-lbl">TOTAL PRICE ({bookingType === 'daily' ? 'Daily Pass' : `${selectedTimes.length} Hrs`}):</span>
              <span className="price-recap-val text-magenta">₹{getStationCost()}</span>
            </div>
            <div className="bottom-bar-right-actions">
              <button 
                className="btn-cyber btn-cyber-magenta btn-back-lobby-mini"
                onClick={() => setStep(3)}
              >
                Change Time
              </button>
              <button 
                className="btn-cyber btn-cyber-primary btn-bottom-checkout"
                onClick={() => setStep(5)}
                disabled={selectedSeats.length === 0}
              >
                <span>PROCEED TO SNACKS</span>
                <ShoppingCart size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 5: ADD SNACKS & FOOD ORDER */}
      {step === 5 && (
        <div className="step-container anim-fade-in">
          <div className="step-header">
            <h2 className="snacks-heading-neon">NEW SNACKS NOW AVAILABLE!!</h2>
            <p>Choose tasty snacks and drinks to be delivered directly to your gaming cabin.</p>
          </div>

          <div className="snacks-menu-grid">
            {snacksData.map((snack) => {
              const qty = selectedSnacks[snack.id] || 0;
              return (
                <div 
                  key={snack.id} 
                  className={`snack-cyber-card cyber-panel ${qty > 0 ? 'border-green-active selected-snack-card' : 'border-pink'}`}
                >
                  {qty > 0 && <span className="snack-card-selected-badge">{qty} ADDED</span>}
                  
                  <div className="snack-img-wrapper">
                    <img src={snack.image} alt={snack.name} className="snack-img" />
                    <div className="image-shimmer-sweep"></div>
                  </div>
                  <div className="snack-info">
                    <h4 className="snack-title">{snack.name}</h4>
                    <p className="snack-desc-text">{snack.description}</p>
                    <div className="snack-price-row">
                      <span className="snack-price">₹{snack.price}</span>
                      <div className="quantity-controller">
                        <button 
                          className="qty-btn"
                          onClick={() => handleSnackQuantity(snack.id, -1)}
                          disabled={qty === 0}
                        >
                          <Minus size={12} />
                        </button>
                        <span className="qty-value">{qty}</span>
                        <button 
                          className="qty-btn"
                          onClick={() => handleSnackQuantity(snack.id, 1)}
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="selection-recap-panel cart-summary-panel border-blue">
            <div className="recap-info">
              <div className="cart-header-title">
                <ShoppingCart size={16} className="text-cyan" />
                <span>SNACKS BASKET RECAP</span>
              </div>
              <div className="cart-item-list">
                {Object.entries(selectedSnacks).map(([snackId, qty]) => {
                  const s = snacksData.find(x => x.id === snackId);
                  return s ? (
                    <span key={snackId} className="cart-item-tag">{s.name} x{qty}</span>
                  ) : null;
                })}
                {Object.keys(selectedSnacks).length === 0 && (
                  <span className="cart-empty-text">No snacks selected (you can add snacks later at cafe counter)</span>
                )}
              </div>
            </div>
            <div className="recap-price">
              <span className="label">Snacks Subtotal:</span>
              <span className="price-val text-magenta">₹{getSnacksCost()}</span>
            </div>
          </div>

          <div className="wizard-navigation-actions">
            <button className="btn-cyber btn-cyber-magenta" onClick={() => setStep(4)}>
              <ChevronLeft size={16} /> Back
            </button>
            <button className="btn-cyber btn-cyber-primary" onClick={() => setStep(6)}>
              Proceed to Details <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 6: REGISTRATION DETAILS */}
      {step === 6 && (
        <div className="step-container anim-fade-in">
          <div className="step-header">
            <h2>GAMER DETAILS</h2>
            <p>Provide contact details to reserve seat and process booking</p>
          </div>

          <div className="registration-form-panel cyber-panel border-purple">
            <form onSubmit={handleDetailsSubmit}>
              <div className="cyber-input-group">
                <label className="cyber-input-label">Gamer Full Name</label>
                <div className="input-with-icon">
                  <User size={18} className="input-icon" />
                  <input
                    type="text"
                    name="name"
                    value={registration.name}
                    onChange={handleInputChange}
                    placeholder="Enter full name"
                    className="cyber-input"
                  />
                </div>
                {formErrors.name && <span className="error-text">{formErrors.name}</span>}
              </div>

              <div className="cyber-input-group">
                <label className="cyber-input-label">Email Address</label>
                <div className="input-with-icon">
                  <Mail size={18} className="input-icon" />
                  <input
                    type="email"
                    name="email"
                    value={registration.email}
                    onChange={handleInputChange}
                    placeholder="gamer@nexus.com"
                    className="cyber-input"
                  />
                </div>
                {formErrors.email && <span className="error-text">{formErrors.email}</span>}
              </div>

              <div className="cyber-input-group">
                <label className="cyber-input-label">Phone Number</label>
                <div className="input-with-icon">
                  <Phone size={18} className="input-icon" />
                  <input
                    type="tel"
                    name="phone"
                    value={registration.phone}
                    onChange={handleInputChange}
                    placeholder="Enter 10-digit number"
                    className="cyber-input"
                  />
                </div>
                {formErrors.phone && <span className="error-text">{formErrors.phone}</span>}
              </div>

              <div className="wizard-navigation-actions form-actions">
                <button type="button" className="btn-cyber btn-cyber-magenta" onClick={() => setStep(5)}>
                  <ChevronLeft size={16} /> Back
                </button>
                <button type="submit" className="btn-cyber btn-cyber-primary text-black">
                  PROCEED TO PAYMENT <ChevronRight size={16} />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STEP 7: SECURE PAYMENT GATEWAY (Simulated payment method added here later) */}
      {step === 7 && selectedSetup && (
        <div className="step-container anim-fade-in">
          <div className="step-header">
            <h2>SECURE PAYMENT DECK</h2>
            <p>Live payment methods will be integrated here later. Select a payment option to complete your reservation.</p>
          </div>

          <div className="payment-gateway-wrapper cyber-panel border-pink">
            {/* Top Security Header Alert */}
            <div className="payment-gateway-notice">
              <ShieldAlert size={18} className="text-magenta" />
              <span><strong>PAYMENT GATEWAY INTEGRATION PLACEHOLDER:</strong> Stripe / Razorpay API credentials will be integrated here in production. Select options below to simulate transactions.</span>
            </div>

            <div className="payment-gateway-split">
              {/* Payment Methods tabs selector */}
              <div className="payment-method-selector-tabs">
                <button 
                  className={`pay-tab-btn ${paymentMethod === 'upi' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('upi')}
                >
                  <QrCode size={16} />
                  <span>UPI SCAN QR</span>
                </button>
                <button 
                  className={`pay-tab-btn ${paymentMethod === 'card' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('card')}
                >
                  <CreditCard size={16} />
                  <span>CREDIT / DEBIT CARD</span>
                </button>
              </div>

              {/* Active Tab Panel */}
              <div className="payment-tab-content-panel">
                {paymentMethod === 'upi' && (
                  <div className="upi-simulation-content">
                    <div className="upi-qr-card">
                      <div className="upi-qr-frame">
                        {/* Mock QR graphic */}
                        <div className="qr-sim-graphics">
                          <div className="q-corner q-tl"></div>
                          <div className="q-corner q-tr"></div>
                          <div className="q-corner q-bl"></div>
                          <div className="q-dot q-d1"></div>
                          <div className="q-dot q-d2"></div>
                          <div className="q-dot q-d3"></div>
                          <div className="q-laser-sweep"></div>
                        </div>
                      </div>
                      <span className="upi-qr-text-tag">Scan QR to pay ₹{getGrandTotal()}</span>
                    </div>
                    <div className="upi-details-text">
                      <p><strong>Merchant VPA:</strong> shadowcafe@upi</p>
                      <p className="text-muted">Open any UPI app (GPay, PhonePe, Paytm) to scan and pay.</p>
                    </div>
                  </div>
                )}

                {paymentMethod === 'card' && (
                  <div className="card-simulation-content">
                    <div className="mock-card-graphic cyber-panel border-purple">
                      <div className="mock-card-header">
                        <span className="chip-symbol"></span>
                        <Award size={18} className="logo-icon text-cyan" />
                      </div>
                      <div className="mock-card-number">••••  ••••  ••••  7845</div>
                      <div className="mock-card-footer">
                        <div className="holder">
                          <span className="lbl text-muted">CARD HOLDER</span>
                          <span className="val">{registration.name || 'GAMER CHIEF'}</span>
                        </div>
                        <div className="expiry">
                          <span className="lbl text-muted">EXPIRES</span>
                          <span className="val">12/30</span>
                        </div>
                      </div>
                    </div>
                    <div className="card-input-simulation-fields">
                      <input type="text" placeholder="Card Number (XXXX XXXX XXXX XXXX)" className="cyber-input" disabled />
                      <div className="split-fields">
                        <input type="text" placeholder="MM/YY" className="cyber-input" disabled />
                        <input type="password" placeholder="CVV" className="cyber-input" disabled />
                      </div>
                      <p className="text-muted italic-info">🔒 Payment method input fields will be enabled once production APIs are connected.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bill Breakdown summary */}
            <div className="payment-receipt-breakdown">
              <h4 className="bill-title-recap">BILLING RECAP:</h4>
              <div className="bill-line">
                <span>{selectedSetup?.name} ({selectedSeats.length} rigs)</span>
                <span>₹{getStationCost()}</span>
              </div>
              {getSnacksCost() > 0 && (
                <div className="bill-line">
                  <span>Ordered Snacks & Food</span>
                  <span>₹{getSnacksCost()}</span>
                </div>
              )}
              <div className="bill-line highlight-green">
                <span>NET AMOUNT PAYABLE</span>
                <span>₹{getGrandTotal()}</span>
              </div>
            </div>

            <div className="wizard-navigation-actions form-actions payment-actions-row">
              <button type="button" className="btn-cyber btn-cyber-magenta" onClick={() => setStep(6)}>
                <ChevronLeft size={16} /> Back to Details
              </button>
              <button 
                type="button" 
                className="btn-cyber btn-cyber-primary text-black"
                onClick={handleConfirmBooking}
              >
                <CreditCard size={16} /> AUTHORIZE PAYMENT & COMPLETE RESERVATION
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 8: DIGITAL ACCESS PASS (TICKET) */}
      {step === 8 && generatedTicket && (
        <div className="step-container anim-fade-in">
          <div className="success-banner">
            <div className="success-icon-badge">
              <Sparkles size={24} />
            </div>
            <h2>RESERVATION CONFIRMED!</h2>
            <p>Your access pass has been registered. Scan the pass at counter desk.</p>
          </div>

          <div className="digital-ticket-container">
            <div className="ticket-card cyber-panel border-pink">
              <div className="ticket-header">
                <div className="ticket-brand">SHADOW CAFE</div>
                <div className="ticket-badge">{generatedTicket.bookingType === 'daily' ? 'FULL-DAY PASS' : 'HOURLY PASS'}</div>
              </div>

              <div className="ticket-body">
                <div className="ticket-main-info">
                  <h3 className="setup-name">{generatedTicket.setupName}</h3>
                  <div className="seat-badge-list">
                    {generatedTicket.seats.map((seat) => (
                      <span key={seat} className="seat-badge">{seat}</span>
                    ))}
                  </div>
                </div>

                <div className="ticket-grid-details">
                  <div className="detail-col">
                    <span className="label">GAMER</span>
                    <span className="value">{generatedTicket.user.name}</span>
                  </div>
                  <div className="detail-col">
                    <span className="label">PASS ID</span>
                    <span className="value code text-magenta">{generatedTicket.id}</span>
                  </div>
                  <div className="detail-col">
                    <span className="label">DATE</span>
                    <span className="value">{generatedTicket.date}</span>
                  </div>
                  <div className="detail-col">
                    <span className="label">TIMING</span>
                    <span className="value ticket-time-wrap">{generatedTicket.time}</span>
                  </div>
                </div>

                {generatedTicket.snacks.length > 0 && (
                  <div className="ticket-snacks-section">
                    <span className="label">ORDERED SNACKS</span>
                    <div className="ticket-snacks-list">
                      {generatedTicket.snacks.map(snack => (
                        <span key={snack.id} className="ticket-snack-tag">{snack.name} (x{snack.qty})</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="ticket-divider">
                <div className="cutout cutout-left"></div>
                <div className="dotted-line"></div>
                <div className="cutout cutout-right"></div>
              </div>

              <div className="ticket-footer">
                <div className="pricing-box">
                  <span className="label">GRAND TOTAL (PAID)</span>
                  <span className="value price-tag">₹{generatedTicket.price}</span>
                </div>

                <div className="qr-box-wrapper">
                  <div className="qr-code-graphic">
                    <div className="qr-square corner-tl"></div>
                    <div className="qr-code-graphic qr-square corner-tr"></div>
                    <div className="qr-code-graphic qr-square corner-bl"></div>
                    <div className="qr-dot dot-1"></div>
                    <div className="qr-dot dot-2"></div>
                    <div className="qr-dot dot-3"></div>
                    <div className="qr-dot dot-4"></div>
                    <div className="qr-dot dot-5"></div>
                    <div className="qr-dot dot-6"></div>
                  </div>
                  <span className="qr-scan-label">SCAN TO ENTER</span>
                </div>
              </div>
            </div>
          </div>

          <div className="ticket-page-actions">
            <button className="btn-cyber btn-cyber-primary" onClick={resetBookingFlow}>
              <RefreshCw size={16} /> BOOK ANOTHER STATION
            </button>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        /* Premium Card Layout additions */
        .setup-card-premium {
          position: relative;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
        }

        .setup-card-premium:hover {
          transform: translateY(-8px) scale(1.01);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.6), 0 0 20px rgba(112, 0, 255, 0.25);
        }

        .glow-bar-top {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 3px;
          background: linear-gradient(90deg, transparent, var(--neon-cyan), var(--neon-magenta), transparent);
          opacity: 0;
          transition: opacity 0.3s;
        }

        .setup-card-premium:hover .glow-bar-top {
          opacity: 1;
        }

        .image-shimmer-sweep {
          position: absolute;
          top: 0;
          left: -100%;
          width: 50%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.08), transparent);
          transform: skewX(-25deg);
        }

        .setup-card-premium:hover .image-shimmer-sweep {
          animation: imageShimmer 1.5s infinite;
        }

        @keyframes imageShimmer {
          0% { left: -100%; }
          100% { left: 200%; }
        }

        .specs-hologram-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 20px;
        }

        .spec-holo-tag {
          font-size: 10px;
          color: var(--text-secondary);
          background: rgba(255, 255, 255, 0.03);
          border: 1.5px solid rgba(255, 255, 255, 0.08);
          border-radius: 4px;
          padding: 3px 6px;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          transition: all 0.2s;
        }

        .setup-card-premium:hover .spec-holo-tag {
          border-color: rgba(0, 242, 254, 0.2);
          color: #fff;
          background: rgba(0, 242, 254, 0.03);
        }

        .spec-chip-cpu {
          color: var(--neon-cyan);
        }

        /* Time picker details */
        .time-section-header-recap {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        @media (max-width: 640px) {
          .time-section-header-recap {
            flex-direction: column;
            align-items: flex-start;
            gap: 6px;
          }
        }

        .hours-recap-count-badge {
          font-family: var(--font-cyber);
          font-size: 9px;
          font-weight: 700;
          color: var(--neon-green);
          border: 1px solid rgba(57, 255, 20, 0.3);
          background: rgba(57, 255, 20, 0.05);
          padding: 2px 8px;
          border-radius: 4px;
          box-shadow: 0 0 8px rgba(57, 255, 20, 0.2);
          letter-spacing: 0.5px;
          animation: flashBadge 1s infinite alternate;
        }

        @keyframes flashBadge {
          0% { opacity: 0.8; }
          100% { opacity: 1; }
        }

        .checkout-slots-txt {
          font-size: 11px;
          color: var(--text-primary);
          text-align: right;
          max-width: 250px;
          word-break: break-all;
        }

        .ticket-time-wrap {
          font-size: 11px !important;
          line-height: 1.4;
          word-break: break-word;
        }

        /* Highly Colored Selector Panel Styles */
        .single-picker-panel {
          padding: 24px;
          border-radius: 12px;
        }

        .sliding-date-colored-row {
          display: flex;
          gap: 12px;
          overflow-x: auto;
          padding: 10px 0;
        }

        .date-chip-colored {
          min-width: 84px;
          height: 100px;
          border-radius: 12px;
          border: 1.5px solid rgba(0, 242, 254, 0.15);
          background: rgba(8, 8, 16, 0.7);
          color: var(--text-secondary);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all var(--transition-normal);
          padding: 10px;
        }

        .date-chip-colored:hover {
          border-color: var(--neon-cyan);
          background: rgba(0, 242, 254, 0.06);
          box-shadow: 0 0 15px rgba(0, 242, 254, 0.2);
          transform: translateY(-2px);
          color: #fff;
        }

        .date-chip-colored.selected {
          border-color: var(--neon-cyan) !important;
          background: linear-gradient(135deg, rgba(0, 242, 254, 0.2) 0%, rgba(0, 119, 255, 0.1) 100%) !important;
          box-shadow: 0 0 20px rgba(0, 242, 254, 0.45), inset 0 0 10px rgba(0, 242, 254, 0.15) !important;
          color: #fff !important;
        }

        .date-chip-colored.selected .date-number {
          color: var(--neon-cyan);
          text-shadow: 0 0 8px var(--neon-cyan);
        }

        /* Step 3 colored timing layout */
        .timing-flow-layout-section {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .mini-plan-colored {
          padding: 20px;
        }

        .timer-colored-card {
          padding: 24px;
          border-radius: 12px;
        }

        .daily-alert-colored {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 13px;
          color: #fff;
          background: rgba(0, 119, 255, 0.08);
          padding: 16px 20px;
          border-radius: 8px;
        }

        .time-chip-btn {
          padding: 12px 14px;
          border-radius: 8px;
          border: 1.5px solid rgba(0, 242, 254, 0.25);
          background: rgba(8, 8, 16, 0.65);
          color: var(--text-secondary);
          cursor: pointer;
          font-size: 11px;
          font-family: var(--font-cyber);
          font-weight: 600;
          letter-spacing: 0.5px;
          transition: all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }

        .time-chip-btn::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 50%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(254, 1, 154, 0.15), transparent);
          transition: 0.5s;
        }

        .time-chip-btn:hover::after {
          left: 200%;
        }

        .time-chip-btn:hover:not(.selected) {
          border-color: var(--neon-cyan);
          color: #fff;
          background: rgba(0, 242, 254, 0.06);
          box-shadow: 0 0 12px rgba(0, 242, 254, 0.2);
          transform: translateY(-2px);
        }

        .time-chip-btn:active {
          transform: scale(0.93) translateY(0px) !important;
        }

        .time-chip-btn.selected {
          border-color: var(--neon-magenta) !important;
          color: #ffffff !important;
          background: linear-gradient(135deg, rgba(254, 1, 154, 0.35) 0%, rgba(112, 0, 255, 0.2) 100%) !important;
          box-shadow: 0 0 18px rgba(254, 1, 154, 0.55), inset 0 0 8px rgba(254, 1, 154, 0.2) !important;
          text-shadow: 0 0 5px rgba(255, 255, 255, 0.8);
          transform: scale(1.04) translateY(-1px);
          animation: slotGlow 2s infinite alternate;
        }

        @keyframes slotGlow {
          0% {
            box-shadow: 0 0 8px rgba(254, 1, 154, 0.35), inset 0 0 4px rgba(254, 1, 154, 0.1);
          }
          100% {
            box-shadow: 0 0 18px rgba(254, 1, 154, 0.7), inset 0 0 8px rgba(254, 1, 154, 0.3);
          }
        }

        /* Snacks custom selected outlines */
        .selected-snack-card {
          border: 1.5px solid var(--neon-green) !important;
          box-shadow: 0 0 15px rgba(57, 255, 20, 0.35) !important;
          background: rgba(57, 255, 20, 0.02) !important;
        }

        .snack-card-selected-badge {
          position: absolute;
          top: 8px;
          right: 8px;
          font-family: var(--font-cyber);
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 0.5px;
          background: var(--neon-green);
          color: #000;
          padding: 2px 6px;
          border-radius: 4px;
          box-shadow: 0 0 8px var(--neon-green);
          z-index: 5;
        }

        .border-green-active {
          border-color: var(--neon-green) !important;
        }

        /* Step 7 Simulated Payment Gateway CSS */
        .payment-gateway-wrapper {
          padding: 24px;
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .payment-gateway-notice {
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(254, 1, 154, 0.08);
          border: 1px solid rgba(254, 1, 154, 0.25);
          padding: 12px 18px;
          border-radius: 8px;
          font-size: 11px;
          color: var(--text-primary);
          line-height: 1.4;
        }

        .payment-gateway-split {
          display: grid;
          grid-template-columns: 240px 1fr;
          gap: 24px;
          min-height: 250px;
        }

        @media (max-width: 768px) {
          .payment-gateway-split {
            grid-template-columns: 1fr;
            gap: 16px;
          }
        }

        .payment-method-selector-tabs {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        @media (max-width: 768px) {
          .payment-method-selector-tabs {
            flex-direction: row;
          }
        }

        .pay-tab-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 20px;
          border-radius: 8px;
          background: rgba(8, 8, 16, 0.6);
          border: 1.5px solid rgba(255, 255, 255, 0.06);
          color: var(--text-secondary);
          cursor: pointer;
          font-family: var(--font-cyber);
          font-weight: 700;
          font-size: 11px;
          letter-spacing: 0.5px;
          transition: all var(--transition-normal);
        }

        @media (max-width: 768px) {
          .pay-tab-btn {
            flex: 1;
            justify-content: center;
            padding: 10px;
          }
        }

        .pay-tab-btn:hover {
          border-color: var(--neon-cyan);
          color: #fff;
          background: rgba(0, 242, 254, 0.04);
        }

        .pay-tab-btn.active {
          border-color: var(--neon-magenta);
          color: #fff;
          background: linear-gradient(135deg, rgba(254, 1, 154, 0.15) 0%, rgba(112, 0, 255, 0.08) 100%);
          box-shadow: 0 0 12px rgba(254, 1, 154, 0.25);
        }

        .payment-tab-content-panel {
          background: rgba(8, 8, 16, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        /* UPI QR simulation styles */
        .upi-simulation-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 16px;
          width: 100%;
        }

        .upi-qr-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }

        .upi-qr-frame {
          background: #ffffff;
          padding: 12px;
          border-radius: 12px;
          box-shadow: 0 0 20px rgba(255, 255, 255, 0.1);
          width: 140px;
          height: 140px;
          position: relative;
          overflow: hidden;
        }

        .qr-sim-graphics {
          width: 100%;
          height: 100%;
          position: relative;
          background-color: #ffffff;
        }

        .qr-sim-graphics .q-corner {
          position: absolute;
          width: 24px;
          height: 24px;
          border: 4px solid #000;
        }

        .qr-sim-graphics .q-tl { top: 0; left: 0; }
        .qr-sim-graphics .q-tr { top: 0; right: 0; }
        .qr-sim-graphics .q-bl { bottom: 0; left: 0; }

        .qr-sim-graphics .q-dot {
          position: absolute;
          background: #000;
        }

        .qr-sim-graphics .q-d1 { top: 40px; left: 40px; width: 16px; height: 16px; }
        .qr-sim-graphics .q-d2 { bottom: 30px; right: 30px; width: 20px; height: 12px; }
        .qr-sim-graphics .q-d3 { top: 20px; left: 70px; width: 12px; height: 28px; }

        .q-laser-sweep {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          height: 3px;
          background: var(--neon-magenta);
          box-shadow: 0 0 10px var(--neon-magenta);
          animation: qrLaser 2.2s infinite ease-in-out;
        }

        @keyframes qrLaser {
          0% { top: 0%; }
          50% { top: 100%; }
          100% { top: 0%; }
        }

        .upi-qr-text-tag {
          font-family: var(--font-cyber);
          font-size: 11px;
          font-weight: 700;
          color: var(--neon-green);
          letter-spacing: 0.5px;
        }

        .upi-details-text p {
          font-size: 12px;
          margin: 4px 0;
        }

        .text-muted {
          color: var(--text-dark) !important;
          font-size: 10px;
        }

        /* Card simulation styles */
        .card-simulation-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
          width: 100%;
          max-width: 380px;
        }

        .mock-card-graphic {
          width: 100%;
          height: 160px;
          border-radius: 12px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          background: linear-gradient(135deg, rgba(8, 8, 16, 0.9) 0%, rgba(112, 0, 255, 0.15) 100%);
        }

        .mock-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .chip-symbol {
          width: 32px;
          height: 24px;
          background: linear-gradient(135deg, #ffd700, #b8860b);
          border-radius: 4px;
          box-shadow: inset 0 0 4px rgba(0, 0, 0, 0.4);
        }

        .mock-card-number {
          font-family: monospace;
          font-size: 18px;
          letter-spacing: 3px;
          color: #fff;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
          text-align: center;
          margin: 12px 0;
        }

        .mock-card-footer {
          display: flex;
          justify-content: space-between;
          font-size: 10px;
        }

        .mock-card-footer .lbl {
          font-size: 7px;
          letter-spacing: 1px;
          margin-bottom: 2px;
        }

        .mock-card-footer .val {
          font-family: monospace;
          color: #fff;
          font-weight: 700;
        }

        .card-input-simulation-fields {
          display: flex;
          flex-direction: column;
          gap: 10px;
          width: 100%;
        }

        .split-fields {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .italic-info {
          font-style: italic;
          text-align: center;
        }

        /* Payment bill breakdown */
        .payment-receipt-breakdown {
          border-top: 1px dashed rgba(255, 255, 255, 0.08);
          padding-top: 16px;
        }

        .bill-title-recap {
          font-family: var(--font-cyber);
          font-size: 10px;
          color: var(--neon-cyan);
          letter-spacing: 1.5px;
          margin-bottom: 10px;
        }

        .bill-line {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: var(--text-secondary);
          margin: 6px 0;
        }

        .bill-line.highlight-green {
          font-family: var(--font-cyber);
          font-size: 14px;
          font-weight: 800;
          color: var(--neon-green);
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          padding-top: 10px;
          margin-top: 10px;
        }

        .payment-actions-row {
          margin-top: 10px;
        }

        /* Sticky bottom bar recap override */
        .booking-sticky-bottom-bar {
          position: fixed;
          bottom: 16px;
          left: 50%;
          transform: translateX(-50%);
          width: calc(100% - 48px);
          max-width: 900px;
          padding: 14px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          z-index: 99;
          border-radius: 12px;
          background: rgba(4, 4, 8, 0.95);
          border-color: var(--neon-blue);
          box-shadow: 0 -4px 30px rgba(0, 0, 0, 0.6), 0 0 20px rgba(0, 119, 255, 0.2);
        }

        @media (max-width: 640px) {
          .booking-sticky-bottom-bar {
            flex-direction: column;
            gap: 12px;
            bottom: 8px;
            padding: 12px 16px;
            width: calc(100% - 16px);
          }
        }

        .bottom-bar-left, .bottom-bar-center {
          display: flex;
          flex-direction: column;
        }

        .seats-recap-lbl, .price-recap-lbl {
          font-family: var(--font-cyber);
          font-size: 9px;
          color: var(--text-secondary);
          letter-spacing: 1px;
        }

        .seats-recap-val {
          font-family: var(--font-cyber);
          font-size: 13px;
          font-weight: 700;
        }

        .price-recap-val {
          font-family: var(--font-cyber);
          font-size: 18px;
          font-weight: 800;
        }

        .bottom-bar-right-actions {
          display: flex;
          gap: 12px;
        }

        .btn-bottom-checkout {
          font-size: 11px !important;
          padding: 10px 20px !important;
          border-radius: 6px !important;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .btn-back-lobby-mini {
          font-size: 11px !important;
          padding: 10px 16px !important;
          border-radius: 6px !important;
          border-color: rgba(254, 1, 154, 0.3) !important;
          color: var(--text-secondary) !important;
        }
        .btn-back-lobby-mini:hover {
           color: #fff !important;
           border-color: var(--neon-magenta) !important;
         }

         .paused-station-alert {
           display: flex;
           align-items: center;
           gap: 16px;
           padding: 20px;
           border-radius: 10px;
           background: rgba(255, 0, 85, 0.08);
           border: 1.5px solid var(--text-red);
           text-align: left;
         }
      `}} />
    </div>
  );
};

export default BookingFlow;
