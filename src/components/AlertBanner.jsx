import { COLORS, FONT } from '../constants/theme';

export default function AlertBanner({ alerts, metrics }) {
  const criticalCount  = alerts.filter(p => metrics[p.id]?.health === 'critical').length;
  const degradedCount  = alerts.filter(p => metrics[p.id]?.health === 'degraded').length;
  const processorNames = alerts.map(p => p.name).join(', ');

  return (
    <div style={{
      background: 'linear-gradient(90deg, #C53030 0%, #E53E3E 100%)',
      color: COLORS.white,
      padding: '12px 28px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      fontFamily: FONT,
      animation: 'pulse 2s ease-in-out infinite',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <AlertIcon />
        <div>
          <span style={{ fontWeight: 700, fontSize: 14 }}>
            {alerts.length} Active Alert{alerts.length > 1 ? 's' : ''}
          </span>
          <span style={{ fontWeight: 400, fontSize: 13, marginLeft: 10, opacity: 0.9 }}>
            {processorNames}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 16, fontSize: 12 }}>
        {criticalCount > 0 && (
          <Chip label={`${criticalCount} Critical`} bg="rgba(255,255,255,0.2)" />
        )}
        {degradedCount > 0 && (
          <Chip label={`${degradedCount} Degraded`} bg="rgba(255,255,255,0.15)" />
        )}
      </div>
    </div>
  );
}

function Chip({ label, bg }) {
  return (
    <span style={{
      backgroundColor: bg,
      padding: '3px 10px',
      borderRadius: 12,
      fontWeight: 600,
      fontSize: 12,
    }}>
      {label}
    </span>
  );
}

function AlertIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}
