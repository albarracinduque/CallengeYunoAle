import { COLORS } from '../constants/theme';

const STATUS_CONFIG = {
  healthy:  { label: 'Healthy',  bg: '#F0FFF4', color: COLORS.statusHealthy, dot: COLORS.statusHealthy },
  degraded: { label: 'Degraded', bg: '#FFFAF0', color: COLORS.statusWarning,  dot: COLORS.statusWarning  },
  critical: { label: 'Critical', bg: '#FFF5F5', color: COLORS.statusCritical, dot: COLORS.statusCritical },
};

export default function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.healthy;

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      padding: '3px 10px',
      borderRadius: 20,
      backgroundColor: cfg.bg,
      color: cfg.color,
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: '0.03em',
      textTransform: 'uppercase',
    }}>
      <span style={{
        width: 6,
        height: 6,
        borderRadius: '50%',
        backgroundColor: cfg.dot,
        flexShrink: 0,
      }} />
      {cfg.label}
    </span>
  );
}
