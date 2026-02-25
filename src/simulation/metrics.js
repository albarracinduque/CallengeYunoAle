const WINDOW_MS = 5 * 60 * 1000; // 5-minute rolling window

export function calculateMetrics(transactions, windowMs = WINDOW_MS) {
  const now = Date.now();
  const windowStart = now - windowMs;
  const recent = transactions.filter(tx => tx.timestamp >= windowStart);

  if (recent.length === 0) {
    return { authRate: 0, avgLatency: 0, total: 0, approved: 0, declined: 0, failed: 0, pending: 0 };
  }

  const approved = recent.filter(tx => tx.status === 'approved').length;
  const declined = recent.filter(tx => tx.status === 'declined').length;
  const failed   = recent.filter(tx => tx.status === 'failed').length;
  const pending  = recent.filter(tx => tx.status === 'pending').length;
  const total    = recent.length;

  const authRate  = (approved / total) * 100;
  const avgLatency = recent.reduce((sum, tx) => sum + tx.latency, 0) / total;

  return {
    authRate: Math.round(authRate * 10) / 10,
    avgLatency: Math.round(avgLatency),
    total,
    approved,
    declined,
    failed,
    pending,
  };
}

export function getHealthStatus(authRate, thresholds = { critical: 60, degraded: 75 }) {
  if (authRate < thresholds.critical) return 'critical';
  if (authRate < thresholds.degraded) return 'degraded';
  return 'healthy';
}

export function getLatencyColor(latency) {
  if (latency > 1000) return '#E53E3E';
  if (latency > 500)  return '#ED8936';
  return '#9DA1B3';
}
