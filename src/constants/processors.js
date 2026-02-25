export const PROCESSORS = [
  {
    id: 'processor-a',
    name: 'Processor A',
    method: 'Cards (Visa/MC)',
    baseAuthRate: 0.83,
    baseLatency: 320,
    currency: 'USD',
  },
  {
    id: 'processor-b',
    name: 'Processor B',
    method: 'Cards (Visa/MC)',
    baseAuthRate: 0.81,
    baseLatency: 290,
    currency: 'USD',
  },
  {
    id: 'pix-provider',
    name: 'PIX Provider',
    method: 'PIX',
    baseAuthRate: 0.88,
    baseLatency: 180,
    currency: 'BRL',
  },
  {
    id: 'oxxo-provider',
    name: 'OXXO Provider',
    method: 'OXXO',
    baseAuthRate: 0.79,
    baseLatency: 450,
    currency: 'MXN',
  },
];

// Degradation timeline for Processor B (in seconds from start)
// Minute 0-1: Normal | 1-2: Degrading | 2-3.5: Critical | 3.5-4.5: Recovering | 4.5-5.5: Almost recovered | 5.5+: Normal
export const DEGRADATION_TIMELINE = [
  { start: 0,   end: 60,       authRate: 0.81, latency: 290  },
  { start: 60,  end: 120,      authRate: 0.65, latency: 800  },
  { start: 120, end: 210,      authRate: 0.42, latency: 1800 },
  { start: 210, end: 270,      authRate: 0.55, latency: 1100 },
  { start: 270, end: 330,      authRate: 0.72, latency: 500  },
  { start: 330, end: Infinity, authRate: 0.81, latency: 290  },
];
