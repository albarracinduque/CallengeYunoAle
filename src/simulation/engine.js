import { useState, useEffect, useRef } from 'react';
import { PROCESSORS, DEGRADATION_TIMELINE } from '../constants/processors';
import { calculateMetrics, getHealthStatus } from './metrics';

function generateId() {
  return 'TX-' + Math.random().toString(36).substr(2, 9).toUpperCase();
}

function jitter(value, pct = 0.4) {
  const variation = value * pct;
  return Math.max(50, Math.round(value + (Math.random() * variation * 2 - variation)));
}

function getStatus(authRate, processorId) {
  const rand = Math.random();
  const isPIXorOXXO = processorId === 'pix-provider' || processorId === 'oxxo-provider';
  const pendingProb = isPIXorOXXO ? 0.08 : 0.04;
  const failedProb  = 0.03;

  if (rand < pendingProb) return 'pending';
  if (rand < pendingProb + failedProb) return 'failed';

  const remaining      = rand - pendingProb - failedProb;
  const remainingPool  = 1 - pendingProb - failedProb;
  return (remaining / remainingPool) < authRate ? 'approved' : 'declined';
}

function getProcessorBParams(elapsedSeconds) {
  for (const phase of DEGRADATION_TIMELINE) {
    if (elapsedSeconds >= phase.start && elapsedSeconds < phase.end) {
      return { authRate: phase.authRate, latency: phase.latency };
    }
  }
  return null;
}

const INITIAL_TX_STATE = {
  'processor-a': [],
  'processor-b': [],
  'pix-provider': [],
  'oxxo-provider': [],
};

const INITIAL_HIST_STATE = {
  'processor-a': [],
  'processor-b': [],
  'pix-provider': [],
  'oxxo-provider': [],
};

export function useSimulation(thresholds) {
  const [transactions, setTransactions]     = useState(INITIAL_TX_STATE);
  const [history, setHistory]               = useState(INITIAL_HIST_STATE);
  const [metrics, setMetrics]               = useState({});
  const [totalCount, setTotalCount]         = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [initialized, setInitialized]       = useState(false);

  const startTimeRef   = useRef(Date.now());
  const txBufferRef    = useRef({ 'processor-a': [], 'processor-b': [], 'pix-provider': [], 'oxxo-provider': [] });
  const totalCountRef  = useRef(0);

  // Transaction generator — every 2.5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      let newTotal = 0;

      PROCESSORS.forEach(processor => {
        const count = Math.floor(Math.random() * 3) + 1; // 1-3 per tick
        const degraded = processor.id === 'processor-b' ? getProcessorBParams(elapsed) : null;
        const authRate   = degraded ? degraded.authRate : processor.baseAuthRate + (Math.random() * 0.06 - 0.03);
        const baseLatency = degraded ? degraded.latency : processor.baseLatency;

        const newTxs = Array.from({ length: count }, () => ({
          id: generateId(),
          processorId: processor.id,
          status: getStatus(authRate, processor.id),
          latency: jitter(baseLatency),
          timestamp: Date.now(),
          amount: Math.floor(Math.random() * 800) + 50,
          currency: processor.currency,
        }));

        txBufferRef.current[processor.id] = [
          ...newTxs,
          ...txBufferRef.current[processor.id],
        ].slice(0, 500);

        newTotal += count;
      });

      totalCountRef.current += newTotal;
      setTransactions({ ...txBufferRef.current });
      setTotalCount(totalCountRef.current);
      setInitialized(true);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  // History recorder — every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setElapsedSeconds(elapsed);

      const m = Math.floor(elapsed / 60);
      const s = elapsed % 60;
      const timestamp = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;

      setHistory(prev => {
        const next = {};
        PROCESSORS.forEach(processor => {
          const pm = calculateMetrics(txBufferRef.current[processor.id]);
          next[processor.id] = [
            ...prev[processor.id],
            { timestamp, authRate: pm.authRate },
          ].slice(-120);
        });
        return next;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Metrics recalculation whenever transactions or thresholds change
  useEffect(() => {
    const newMetrics = {};
    PROCESSORS.forEach(processor => {
      const m = calculateMetrics(transactions[processor.id]);
      newMetrics[processor.id] = {
        ...m,
        health: getHealthStatus(m.authRate, thresholds),
      };
    });
    setMetrics(newMetrics);
  }, [transactions, thresholds]);

  return { transactions, history, metrics, totalCount, elapsedSeconds, initialized };
}
