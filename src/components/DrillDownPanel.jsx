import { COLORS, FONT } from '../constants/theme';

const STATUS_STYLE = {
  approved: { bg: '#F0FFF4', color: '#276749', label: 'Approved' },
  declined: { bg: '#FFFAF0', color: '#C05621', label: 'Declined' },
  failed:   { bg: '#FFF5F5', color: '#C53030', label: 'Failed'   },
  pending:  { bg: '#EBF8FF', color: '#2B6CB0', label: 'Pending'  },
};

function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString('en-US', { hour12: false });
}

function formatAmount(amount, currency) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

function latencyColor(ms) {
  if (ms > 1000) return '#E53E3E';
  if (ms > 500)  return '#ED8936';
  return COLORS.gray600;
}

export default function DrillDownPanel({ processor, transactions, metrics, onClose }) {
  const m   = metrics || {};
  const txs = (transactions || []).slice(0, 50);

  return (
    <div style={{
      backgroundColor: COLORS.white,
      borderRadius: 12,
      border: `1px solid ${COLORS.gray200}`,
      fontFamily: FONT,
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      overflow: 'hidden',
    }}>
      {/* Panel Header */}
      <div style={{
        padding: '16px 24px',
        borderBottom: `1px solid ${COLORS.gray200}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: COLORS.gray50,
      }}>
        <div>
          <span style={{ fontSize: 15, fontWeight: 700, color: COLORS.black }}>{processor.name}</span>
          <span style={{ fontSize: 12, color: COLORS.gray500, marginLeft: 10 }}>{processor.method}</span>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: `1px solid ${COLORS.gray200}`,
            borderRadius: 6,
            padding: '4px 12px',
            cursor: 'pointer',
            fontSize: 12,
            color: COLORS.gray600,
            fontFamily: FONT,
          }}
        >
          Close
        </button>
      </div>

      {/* Status Breakdown */}
      <div style={{ padding: '16px 24px', display: 'flex', gap: 12, borderBottom: `1px solid ${COLORS.gray100}` }}>
        {['approved', 'declined', 'failed', 'pending'].map(status => {
          const cfg = STATUS_STYLE[status];
          return (
            <div key={status} style={{
              flex: 1,
              backgroundColor: cfg.bg,
              borderRadius: 8,
              padding: '12px 16px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: cfg.color }}>
                {m[status] ?? 0}
              </div>
              <div style={{ fontSize: 11, color: cfg.color, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: 2 }}>
                {cfg.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Transaction Table */}
      <div style={{ maxHeight: 340, overflowY: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
            <tr style={{ backgroundColor: COLORS.gray50 }}>
              {['Time', 'TX ID', 'Amount', 'Status', 'Latency'].map(col => (
                <th key={col} style={{
                  padding: '10px 16px',
                  textAlign: 'left',
                  fontSize: 11,
                  fontWeight: 600,
                  color: COLORS.gray500,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  borderBottom: `1px solid ${COLORS.gray200}`,
                  whiteSpace: 'nowrap',
                }}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {txs.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: COLORS.gray400, fontSize: 13 }}>
                  Waiting for transactions...
                </td>
              </tr>
            ) : (
              txs.map((tx, idx) => {
                const cfg = STATUS_STYLE[tx.status] || STATUS_STYLE.pending;
                return (
                  <tr key={tx.id} style={{ backgroundColor: idx % 2 === 0 ? COLORS.white : COLORS.gray50 }}>
                    <td style={{ padding: '9px 16px', color: COLORS.gray500, whiteSpace: 'nowrap' }}>
                      {formatTime(tx.timestamp)}
                    </td>
                    <td style={{ padding: '9px 16px', fontWeight: 500, color: COLORS.black, fontVariantNumeric: 'tabular-nums' }}>
                      {tx.id}
                    </td>
                    <td style={{ padding: '9px 16px', color: COLORS.black, fontWeight: 600 }}>
                      {formatAmount(tx.amount, tx.currency)}
                    </td>
                    <td style={{ padding: '9px 16px' }}>
                      <span style={{
                        backgroundColor: cfg.bg,
                        color: cfg.color,
                        padding: '2px 9px',
                        borderRadius: 10,
                        fontSize: 11,
                        fontWeight: 600,
                      }}>
                        {cfg.label}
                      </span>
                    </td>
                    <td style={{ padding: '9px 16px', fontWeight: 600, color: latencyColor(tx.latency) }}>
                      {tx.latency}ms
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
