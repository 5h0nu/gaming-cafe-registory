export const setupsData = [
  {
    id: 'ps4',
    name: 'PlayStation 4 Console Lounge',
    category: 'Console',
    price: 79,
    dayPrice: 1199,
    description: 'Classic couch gaming with dual DualShock 4 controllers and a massive library of classic co-op games.',
    specs: ['PlayStation 4 Pro', '50" Full HD LED Display', '2x DualShock 4 Controllers', 'Huge Library of Co-op Classics'],
    capacityText: '1 to 2 Players',
    icon: 'Gamepad2',
    seatCount: 6,
    image: '/ps4_cyber.png',
    layout: {
      rows: 1,
      seatsPerRow: 6,
      seats: [
        { id: 'PS4-01', row: 'Row A', num: 1 },
        { id: 'PS4-02', row: 'Row A', num: 2 },
        { id: 'PS4-03', row: 'Row A', num: 3 },
        { id: 'PS4-04', row: 'Row A', num: 4 },
        { id: 'PS4-05', row: 'Row A', num: 5 },
        { id: 'PS4-06', row: 'Row A', num: 6 }
      ]
    }
  },
  {
    id: 'ps5',
    name: 'PlayStation 5 Solo Station',
    category: 'Console',
    price: 119,
    dayPrice: 1399,
    description: 'Immersive single-player couch console experience with 55" 4K HDR TV and high-end surround sound.',
    specs: ['PlayStation 5 Disc Edition', '55" LG OLED 4K TV', 'DualSense Wireless Controller', 'Pulse 3D Wireless Headset', 'Reclining Gaming Couch'],
    capacityText: 'Single Couch Player',
    icon: 'Gamepad',
    seatCount: 8,
    image: '/ps5_cyber.png',
    layout: {
      rows: 1,
      seatsPerRow: 8,
      seats: [
        { id: 'PS5S-01', row: 'Couch Row', num: 1 },
        { id: 'PS5S-02', row: 'Couch Row', num: 2 },
        { id: 'PS5S-03', row: 'Couch Row', num: 3 },
        { id: 'PS5S-04', row: 'Couch Row', num: 4 },
        { id: 'PS5S-05', row: 'Couch Row', num: 5 },
        { id: 'PS5S-06', row: 'Couch Row', num: 6 },
        { id: 'PS5S-07', row: 'Couch Row', num: 7 },
        { id: 'PS5S-08', row: 'Couch Row', num: 8 }
      ]
    }
  },
  {
    id: 'steering_wheel',
    name: 'Holographic Racing Simulator',
    category: 'Simulator',
    price: 169,
    description: 'Ultra-immersive virtual cockpit racing simulator with high-torque direct drive wheel and premium load-cell pedals.',
    specs: ['Fanatec DD Pro Direct Drive', 'Fanatec ClubSport Pedals V3', 'Next Level Racing Cockpit', 'Samsung 49" Ultrawide Curve', 'Thrustmaster Sequential Shifter'],
    capacityText: 'Racing Sim Rig',
    icon: 'Compass',
    seatCount: 4,
    image: '/wheel_cyber.png',
    layout: {
      rows: 1,
      seatsPerRow: 4,
      seats: [
        { id: 'RIG-01', row: 'Track A', num: 1 },
        { id: 'RIG-02', row: 'Track A', num: 2 },
        { id: 'RIG-03', row: 'Track B', num: 1 },
        { id: 'RIG-04', row: 'Track B', num: 2 }
      ]
    }
  },
  {
    id: 'pc',
    name: 'Pro PC Gaming Station',
    category: 'PC',
    price: 99,
    description: 'High-end gaming rig equipped with RTX 4070 Ti, Intel i7, 240Hz monitor, and premium mechanical keyboard.',
    specs: ['RTX 4070 Ti 12GB', 'Core i7 13th Gen', '32GB RAM DDR5', '240Hz IPS Gaming Display', 'Logitech G Pro Gear'],
    capacityText: 'Single Station',
    icon: 'Monitor',
    seatCount: 16,
    image: '/pc_cyber.png',
    layout: {
      rows: 2,
      seatsPerRow: 8,
      seats: [
        { id: 'PC-01', row: 'A', num: 1 }, { id: 'PC-02', row: 'A', num: 2 },
        { id: 'PC-03', row: 'A', num: 3 }, { id: 'PC-04', row: 'A', num: 4 },
        { id: 'PC-05', row: 'A', num: 5 }, { id: 'PC-06', row: 'A', num: 6 },
        { id: 'PC-07', row: 'A', num: 7 }, { id: 'PC-08', row: 'A', num: 8 },
        { id: 'PC-09', row: 'B', num: 1 }, { id: 'PC-10', row: 'B', num: 2 },
        { id: 'PC-11', row: 'B', num: 3 }, { id: 'PC-12', row: 'B', num: 4 },
        { id: 'PC-13', row: 'B', num: 5 }, { id: 'PC-14', row: 'B', num: 6 },
        { id: 'PC-15', row: 'B', num: 7 }, { id: 'PC-16', row: 'B', num: 8 }
      ]
    }
  },
  {
    id: 'pc_multiplayer',
    name: '5v5 VIP PC Team Booth',
    category: 'PC',
    price: 399,
    description: 'Soundproof team rooms optimized for esports training, containing 5 premium RTX 4080 workstations.',
    specs: ['RTX 4080 16GB', 'Core i9 13th Gen', '64GB RAM DDR5', '360Hz Esports Display', 'HyperX Cloud III Headset'],
    capacityText: '5-Player Team Space',
    icon: 'Shield',
    seatCount: 10,
    image: '/pc_cyber.png',
    layout: {
      rows: 2,
      seatsPerRow: 5,
      seats: [
        { id: 'TB1-01', row: 'Room 1', num: 1 }, { id: 'TB1-02', row: 'Room 1', num: 2 },
        { id: 'TB1-03', row: 'Room 1', num: 3 }, { id: 'TB1-04', row: 'Room 1', num: 4 },
        { id: 'TB1-05', row: 'Room 1', num: 5 },
        { id: 'TB2-01', row: 'Room 2', num: 1 }, { id: 'TB2-02', row: 'Room 2', num: 2 },
        { id: 'TB2-03', row: 'Room 2', num: 3 }, { id: 'TB2-04', row: 'Room 2', num: 4 },
        { id: 'TB2-05', row: 'Room 2', num: 5 }
      ]
    }
  }
];

export const mockOccupiedSeats = {
  'pc': ['PC-03', 'PC-07', 'PC-11', 'PC-12'],
  'pc_multiplayer': ['TB1-03', 'TB2-01', 'TB2-02'],
  'ps5': ['PS5S-02', 'PS5S-05'],
  'ps4': ['PS4-04'],
  'steering_wheel': ['RIG-01', 'RIG-04']
};

export const snacksData = [
  {
    id: 'noodles',
    name: 'Cup Noodles',
    price: 58,
    image: '/noodles_cyber.png',
    description: 'Hot & Spicy Cup Noodles, cooked fresh with chopped veggies'
  },
  {
    id: 'pizza_combo',
    name: 'Pizza Combos',
    price: 299,
    image: '/pizza_cyber.png',
    description: 'Personal pan pizza with french fries and a chilling Coke can'
  },
  {
    id: 'mega_pizza',
    name: '3 Pizzas + 1 Coke Mega Offer',
    price: 389,
    image: '/mega_pizza_cyber.png',
    description: 'Special Dominos Offer: 3 freshly baked pizzas and a large Coke bottle'
  },
  {
    id: 'coke_chips',
    name: 'Coke, Chips & Snacks',
    price: 20,
    image: '/snacks_cyber.png',
    description: 'Cold Coca-Cola can and a bag of Lay\'s potato chips'
  }
];
