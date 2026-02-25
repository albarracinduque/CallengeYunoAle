import { COLORS, FONT } from '../constants/theme';

function formatElapsed(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function Header({
  elapsedSeconds,
  totalCount,
  onSettingsClick,
  onExport,
  showSettings,
  thresholds,
  onThresholdsChange,
}) {
  return (
    <>
      <header style={{
        backgroundColor: COLORS.white,
        borderBottom: `1px solid ${COLORS.gray200}`,
        padding: '0 28px',
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontFamily: FONT,
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      }}>
        {/* Left: Logo + Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            backgroundColor: COLORS.primaryBlue,
            color: COLORS.white,
            fontWeight: 800,
            fontSize: 13,
            letterSpacing: '0.08em',
            padding: '6px 12px',
            borderRadius: 6,
          }}>
            YUNO
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.black, lineHeight: 1.2 }}>
              AeroSur Checkout Health Monitor
            </div>
            <div style={{ fontSize: 11, color: COLORS.gray500, fontWeight: 400 }}>
              Live Payment Processor Dashboard
            </div>
          </div>
        </div>

        {/* Right: Stats + Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <Stat label="Elapsed" value={formatElapsed(elapsedSeconds)} />
            <Stat label="Total Transactions" value={totalCount.toLocaleString()} />
          </div>

          <div style={{ width: 1, height: 32, backgroundColor: COLORS.gray200 }} />

          <button
            onClick={onSettingsClick}
            style={btnStyle(showSettings ? COLORS.primaryBlue : COLORS.white, showSettings)}
          >
            <SettingsIcon color={showSettings ? COLORS.white : COLORS.gray600} />
            Settings
          </button>

          <button onClick={onExport} style={btnStyle(COLORS.white, false)}>
            <ExportIcon color={COLORS.gray600} />
            Export Snapshot
          </button>
        </div>
      </header>

      {/* Settings Panel */}
      {showSettings && (
        <div style={{
          backgroundColor: COLORS.white,
          borderBottom: `1px solid ${COLORS.gray200}`,
          padding: '16px 28px',
          display: 'flex',
          alignItems: 'center',
          gap: 32,
          fontFamily: FONT,
        }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.gray600 }}>Alert Thresholds</span>
          <ThresholdInput
            label="Critical below"
            value={thresholds.critical}
            onChange={v => onThresholdsChange({ ...thresholds, critical: v })}
            color={COLORS.statusCritical}
          />
          <ThresholdInput
            label="Degraded below"
            value={thresholds.degraded}
            onChange={v => onThresholdsChange({ ...thresholds, degraded: v })}
            color={COLORS.statusWarning}
          />
        </div>
      )}
    </>
  );
}

function Stat({ label, value }) {
  return (
    <div style={{ textAlign: 'right' }}>
      <div style={{ fontSize: 17, fontWeight: 700, color: COLORS.black, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 10, color: COLORS.gray400, fontWeight: 500, marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
    </div>
  );
}

function ThresholdInput({ label, value, onChange, color }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: COLORS.gray600 }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: color, flexShrink: 0 }} />
      {label}
      <input
        type="number"
        min={0}
        max={100}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{
          width: 60,
          padding: '4px 8px',
          border: `1px solid ${COLORS.gray300}`,
          borderRadius: 6,
          fontSize: 13,
          fontWeight: 600,
          color: COLORS.black,
          textAlign: 'center',
          fontFamily: FONT,
        }}
      />
      <span>%</span>
    </label>
  );
}

function btnStyle(bg, active) {
  return {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '7px 14px',
    border: `1px solid ${active ? COLORS.primaryBlue : COLORS.gray200}`,
    borderRadius: 8,
    backgroundColor: bg,
    color: active ? COLORS.white : COLORS.gray600,
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: FONT,
    transition: 'all 0.15s ease',
  };
}

function SettingsIcon({ color }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function ExportIcon({ color }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}
