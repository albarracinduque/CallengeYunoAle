import { COLORS, PROCESSOR_COLORS, FONT } from '../constants/theme';
import { getLatencyColor } from '../simulation/metrics';
import StatusBadge from './StatusBadge';

const HEALTH_BAR_COLOR = {
  healthy:  COLORS.statusHealthy,
  degraded: COLORS.statusWarning,
  critical: COLORS.statusCritical,
};

function Sparkline({ data, health }) {
  if (!data || data.length < 2) {
    return <div style={{ height: 36 }} />;
  }
  const points = data.slice(-20);
  const W = 120, H = 36;
  const rates = points.map(p => p.authRate);
  const dataMin = Math.min(...rates);
  const dataMax = Math.max(...rates);
  const padding = Math.max((dataMax - dataMin) * 0.15, 3); // visual breathing room
  const min = Math.max(0,   dataMin - padding);
  const max = Math.min(100, dataMax + padding);
  const range = max - min || 1;

  const coords = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * W;
      const y = H - ((p.authRate - min) / range) * H;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  const color = HEALTH_BAR_COLOR[health] || COLORS.primaryBlue;

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={`grad-${health}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.15" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline fill="none" stroke={color} strokeWidth="1.5" points={coords} strokeLinejoin="round" />
    </svg>
  );
}

export default function ProcessorCard({ processor, metrics, history, isSelected, onClick }) {
  const m      = metrics || { authRate: 0, avgLatency: 0, total: 0, health: 'healthy' };
  const health = m.health || 'healthy';
  const barColor = HEALTH_BAR_COLOR[health];
  const procColor = PROCESSOR_COLORS[processor.id];

  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: COLORS.white,
        borderRadius: 12,
        border: isSelected ? `2px solid ${COLORS.primaryBlue}` : `2px solid ${COLORS.gray200}`,
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'box-shadow 0.15s ease, border-color 0.15s ease',
        boxShadow: isSelected
          ? `0 0 0 3px ${COLORS.lilac}`
          : '0 1px 4px rgba(0,0,0,0.07)',
        fontFamily: FONT,
        position: 'relative',
      }}
    >
      {/* Top color bar */}
      <div style={{ height: 4, backgroundColor: barColor, transition: 'background-color 0.3s ease' }} />

      <div style={{ padding: '16px 18px' }}>
        {/* Header row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.black }}>{processor.name}</div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              marginTop: 3,
              fontSize: 11,
              color: COLORS.gray500,
              backgroundColor: COLORS.gray100,
              padding: '2px 8px',
              borderRadius: 10,
              fontWeight: 500,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: procColor }} />
              {processor.method}
            </div>
          </div>
          <StatusBadge status={health} />
        </div>

        {/* BIG auth rate number */}
        <div style={{ marginBottom: 12 }}>
          <div style={{
            fontSize: 40,
            fontWeight: 800,
            color: barColor,
            lineHeight: 1,
            letterSpacing: '-0.02em',
            transition: 'color 0.3s ease',
          }}>
            {m.authRate > 0 ? `${m.authRate.toFixed(1)}%` : '—'}
          </div>
          <div style={{ fontSize: 11, color: COLORS.gray400, marginTop: 2, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Authorization Rate
          </div>
        </div>

        {/* Sub-metrics */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 14 }}>
          <SubMetric label="Transactions" value={m.total.toLocaleString()} />
          <SubMetric
            label="Avg Latency"
            value={m.avgLatency > 0 ? `${m.avgLatency}ms` : '—'}
            color={getLatencyColor(m.avgLatency)}
          />
        </div>

        {/* Sparkline */}
        <Sparkline data={history} health={health} />
      </div>

      {/* Selected indicator */}
      {isSelected && (
        <div style={{
          backgroundColor: COLORS.lilac,
          padding: '6px 18px',
          fontSize: 11,
          color: COLORS.primaryBlue,
          fontWeight: 600,
          textAlign: 'center',
          letterSpacing: '0.03em',
        }}>
          Detail view below
        </div>
      )}
    </div>
  );
}

function SubMetric({ label, value, color }) {
  return (
    <div>
      <div style={{ fontSize: 15, fontWeight: 600, color: color || COLORS.black }}>{value}</div>
      <div style={{ fontSize: 10, color: COLORS.gray400, textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 500 }}>{label}</div>
    </div>
  );
}
