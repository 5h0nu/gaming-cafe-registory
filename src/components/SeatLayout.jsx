import React from 'react';
import { Monitor, Gamepad, Gamepad2, Shield, Compass, Users } from 'lucide-react';

const SeatLayout = ({ setup, selectedSeats, onSeatToggle, occupiedSeats = [] }) => {
  if (!setup) return null;

  const { layout, category } = setup;
  
  // Icon selector based on setup type
  const getSeatIcon = (cat, size = 18) => {
    switch (cat) {
      case 'PC':
        return setup.id === 'pc_multiplayer' ? <Shield size={size} /> : <Monitor size={size} />;
      case 'Console':
        return setup.id === 'ps5_multiplayer' ? <Users size={size} /> : <Gamepad size={size} />;
      case 'Simulator':
        return <Compass size={size} />;
      default:
        return <Gamepad2 size={size} />;
    }
  };

  // Helper to check seat status
  const getSeatStatus = (seatId) => {
    if (occupiedSeats.includes(seatId)) return 'occupied';
    if (selectedSeats.includes(seatId)) return 'selected';
    return 'available';
  };

  // Render seats based on columns/rows or custom clusters
  const renderPCLayout = () => {
    // Standard rows
    const seatsByRow = {};
    layout.seats.forEach(seat => {
      if (!seatsByRow[seat.row]) seatsByRow[seat.row] = [];
      seatsByRow[seat.row].push(seat);
    });

    return (
      <div className="pc-layout-grid">
        {Object.keys(seatsByRow).map((rowName) => (
          <div key={rowName} className="pc-row-container">
            <div className="pc-row-label">ROW {rowName}</div>
            <div className="pc-seats-row">
              {seatsByRow[rowName].map((seat) => {
                const status = getSeatStatus(seat.id);
                return (
                  <button
                    key={seat.id}
                    className={`seat-node seat-${status}`}
                    onClick={() => status === 'available' || status === 'selected' ? onSeatToggle(seat.id) : null}
                    disabled={status === 'occupied'}
                    title={`${seat.id} - ${status.toUpperCase()}`}
                  >
                    <span className="seat-icon">{getSeatIcon(category)}</span>
                    <span className="seat-label">{seat.num}</span>
                  </button>
                );
              })}
            </div>
            <div className="desk-indicator"></div>
          </div>
        ))}
      </div>
    );
  };

  const renderConsoleLayout = () => {
    // Custom curved layout for couches/lounges
    return (
      <div className="console-layout-grid">
        <div className="console-arch">
          {layout.seats.map((seat) => {
            const status = getSeatStatus(seat.id);
            return (
              <div key={seat.id} className="console-seat-wrapper">
                <button
                  className={`seat-node seat-${status} seat-console`}
                  onClick={() => status === 'available' || status === 'selected' ? onSeatToggle(seat.id) : null}
                  disabled={status === 'occupied'}
                  title={`${seat.id} - ${status.toUpperCase()}`}
                >
                  <span className="seat-icon">{getSeatIcon(category, 22)}</span>
                  <span className="seat-label">{seat.num}</span>
                </button>
                <div className="couch-backing"></div>
                <div className="station-number">{seat.id}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderSimulatorLayout = () => {
    // Simulators arranged in cockpits
    return (
      <div className="sim-layout-grid">
        {layout.seats.map((seat) => {
          const status = getSeatStatus(seat.id);
          return (
            <div key={seat.id} className="sim-seat-wrapper">
              <div className="sim-screen-arc"></div>
              <button
                className={`seat-node seat-${status} seat-sim`}
                onClick={() => status === 'available' || status === 'selected' ? onSeatToggle(seat.id) : null}
                disabled={status === 'occupied'}
                title={`${seat.id} - ${status.toUpperCase()}`}
              >
                <span className="seat-icon">{getSeatIcon(category, 24)}</span>
                <span className="seat-label">{seat.num}</span>
              </button>
              <div className="sim-chair-base"></div>
              <div className="station-number">{seat.id}</div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="seat-booking-container">
      {/* Visual Screen / Center stage */}
      <div className="screen-bar">
        <div className="screen-neon-glow"></div>
        <div className="screen-title">
          {category === 'PC' ? 'CENTRAL SERVER HUB & DESKS' : category === 'Console' ? 'MAIN DISPLAY AREA' : 'RACING SIM PLATFORM'}
        </div>
      </div>

      {/* Render layout dynamic */}
      <div className="seating-area">
        {category === 'PC' && renderPCLayout()}
        {category === 'Console' && renderConsoleLayout()}
        {category === 'Simulator' && renderSimulatorLayout()}
      </div>

      {/* Seat legend */}
      <div className="seat-legend">
        <div className="legend-item">
          <div className="legend-box available-box"></div>
          <span>Available</span>
        </div>
        <div className="legend-item">
          <div className="legend-box selected-box"></div>
          <span>Selected</span>
        </div>
        <div className="legend-item">
          <div className="legend-box occupied-box"></div>
          <span>Occupied</span>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .seat-booking-container {
          width: 100%;
          padding: 24px;
          border-radius: 12px;
          background: rgba(10, 10, 18, 0.4);
          border: 1px solid rgba(0, 242, 254, 0.08);
          margin-top: 20px;
        }

        /* Screen Bar style */
        .screen-bar {
          text-align: center;
          margin-bottom: 50px;
          position: relative;
        }

        .screen-neon-glow {
          width: 80%;
          height: 4px;
          background: linear-gradient(90deg, transparent, var(--neon-cyan), transparent);
          margin: 0 auto 10px;
          box-shadow: 0 0 15px var(--neon-cyan), 0 0 30px var(--neon-cyan);
          border-radius: 4px;
        }

        .screen-title {
          font-family: var(--font-cyber);
          font-size: 11px;
          letter-spacing: 3px;
          color: var(--text-secondary);
          text-transform: uppercase;
        }

        .seating-area {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 250px;
          margin-bottom: 30px;
        }

        /* Seat Nodes general */
        .seat-node {
          width: 48px;
          height: 48px;
          border-radius: 8px;
          border: 1.5px solid transparent;
          background: rgba(15, 23, 42, 0.6);
          color: var(--text-primary);
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
          transition: all var(--transition-fast);
          gap: 2px;
        }

        .seat-node:focus {
          outline: none;
        }

        .seat-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0.8;
          transition: transform 0.2s;
        }

        .seat-label {
          font-size: 9px;
          font-family: var(--font-cyber);
          opacity: 0.6;
        }

        /* Available states */
        .seat-available {
          border-color: rgba(0, 242, 254, 0.3);
          box-shadow: inset 0 0 6px rgba(0, 242, 254, 0.05);
        }

        .seat-available:hover {
          border-color: var(--neon-cyan);
          background: rgba(0, 242, 254, 0.1);
          box-shadow: 0 0 12px rgba(0, 242, 254, 0.3), inset 0 0 8px rgba(0, 242, 254, 0.1);
          transform: translateY(-2px);
        }

        .seat-available:hover .seat-icon {
          transform: scale(1.1);
          opacity: 1;
        }

        /* Selected states */
        .seat-selected {
          border-color: var(--neon-green);
          background: rgba(57, 255, 20, 0.12);
          box-shadow: 0 0 15px rgba(57, 255, 20, 0.4), inset 0 0 10px rgba(57, 255, 20, 0.2);
          animation: pulseGreenBorder 2s infinite;
        }

        @keyframes pulseGreenBorder {
          0%, 100% {
            box-shadow: 0 0 12px rgba(57, 255, 20, 0.3), inset 0 0 8px rgba(57, 255, 20, 0.1);
          }
          50% {
            box-shadow: 0 0 20px rgba(57, 255, 20, 0.6), inset 0 0 12px rgba(57, 255, 20, 0.3);
          }
        }

        /* Occupied states */
        .seat-occupied {
          border-color: rgba(255, 255, 255, 0.05);
          background: rgba(30, 30, 40, 0.25);
          color: var(--text-dark);
          cursor: not-allowed;
          opacity: 0.35;
        }

        .seat-occupied .seat-icon {
          opacity: 0.3;
        }

        /* PC Layout styles */
        .pc-layout-grid {
          display: flex;
          flex-direction: column;
          gap: 30px;
          width: 100%;
          max-width: 600px;
        }

        .pc-row-container {
          display: flex;
          flex-direction: column;
          gap: 8px;
          position: relative;
        }

        .pc-row-label {
          font-family: var(--font-cyber);
          font-size: 10px;
          color: var(--text-secondary);
          letter-spacing: 2px;
          margin-bottom: 2px;
        }

        .pc-seats-row {
          display: flex;
          justify-content: space-between;
          gap: 12px;
        }

        .desk-indicator {
          height: 3px;
          background: rgba(0, 242, 254, 0.15);
          border-radius: 2px;
          width: 100%;
          margin-top: 4px;
        }

        /* Console Layout styles */
        .console-layout-grid {
          display: flex;
          justify-content: center;
          width: 100%;
        }

        .console-arch {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 35px;
          max-width: 500px;
        }

        @media (max-width: 640px) {
          .console-arch {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .console-seat-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
        }

        .seat-console {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          z-index: 2;
        }

        .couch-backing {
          position: absolute;
          bottom: 12px;
          width: 76px;
          height: 24px;
          background: rgba(30, 30, 50, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-bottom: none;
          border-radius: 12px 12px 0 0;
          z-index: 1;
        }

        .station-number {
          margin-top: 28px;
          font-size: 10px;
          color: var(--text-secondary);
          font-family: var(--font-cyber);
        }

        /* Simulator layout styles */
        .sim-layout-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 40px;
          max-width: 400px;
        }

        .sim-seat-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          padding: 10px;
        }

        .seat-sim {
          width: 64px;
          height: 64px;
          border-radius: 12px;
          z-index: 2;
        }

        .sim-screen-arc {
          position: absolute;
          top: -6px;
          width: 80px;
          height: 12px;
          border-top: 3px solid rgba(0, 242, 254, 0.4);
          border-radius: 50% 50% 0 0;
          z-index: 1;
        }

        .sim-chair-base {
          position: absolute;
          bottom: 22px;
          width: 44px;
          height: 14px;
          background: rgba(22, 22, 38, 0.8);
          border: 1.5px solid rgba(0, 242, 254, 0.15);
          border-radius: 0 0 8px 8px;
          z-index: 1;
        }

        /* Legend styles */
        .seat-legend {
          display: flex;
          justify-content: center;
          gap: 24px;
          margin-top: 24px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          padding-top: 20px;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: var(--text-secondary);
        }

        .legend-box {
          width: 16px;
          height: 16px;
          border-radius: 4px;
          border: 1px solid transparent;
        }

        .available-box {
          border-color: var(--neon-cyan);
          background: rgba(0, 242, 254, 0.05);
        }

        .selected-box {
          border-color: var(--neon-green);
          background: rgba(57, 255, 20, 0.1);
        }

        .occupied-box {
          border-color: rgba(255, 255, 255, 0.05);
          background: rgba(30, 30, 40, 0.25);
          opacity: 0.35;
        }
      `}} />
    </div>
  );
};

export default SeatLayout;
