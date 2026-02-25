import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { COLORS, PROCESSOR_COLORS, FONT } from '../constants/theme';
import { PROCESSORS } from '../constants/processors';

function buildChartData(history) {
  const backbone = history['processor-a'];
  if (!backbone || backbone.length === 0) return [];

  return backbone.map((point, i) => ({
    timestamp: point.timestamp,
    'processor-a':  history['processor-a'][i]?.authRate ?? null,
    'processor-b':  history['processor-b'][i]?.authRate ?? null,
    'pix-provider': history['pix-provider'][i]?.authRate ?? null,
    'oxxo-provider':history['oxxo-provider'][i]?.authRate ?? null,
  }));
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  return (
    <div style={{
      backgroundColor: COLORS.white,
      border: `1px solid ${COLORS.gray200}`,
      borderRadius: 8,
      padding: '10px 14px',
      fontFamily: FONT,
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    }}>
      <div style={{ fontSize: 11, color: COLORS.gray500, marginBottom: 8, fontWeight: 600 }}>{label}</div>
      {payload.map(entry => (
        <div key={entry.dataKey} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: entry.color }} />
          <span style={{ fontSize: 12, color: COLORS.gray600, minWidth: 100 }}>
            {PROCESSORS.find(p => p.id === entry.dataKey)?.name}
          </span>
          <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.black }}>
            {entry.value != null ? `${entry.value.toFixed(1)}%` : '—'}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function TrendChart({ history }) {
  const data = buildChartData(history).slice(-60); // last 5 min @ 5s intervals

  return (
    <div style={{
      backgroundColor: COLORS.white,
      borderRadius: 12,
      border: `1px solid ${COLORS.gray200}`,
      padding: '20px 24px',
      fontFamily: FONT,
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    }}>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.black }}>Authorization Rate Trends</div>
        <div style={{ fontSize: 12, color: COLORS.gray500, marginTop: 2 }}>All processors — rolling view</div>
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={COLORS.gray100} vertical={false} />
          <XAxis
            dataKey="timestamp"
            tick={{ fontSize: 10, fill: COLORS.gray400, fontFamily: FONT }}
            tickLine={false}
            axisLine={{ stroke: COLORS.gray200 }}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 10, fill: COLORS.gray400, fontFamily: FONT }}
            tickLine={false}
            axisLine={false}
            tickFormatter={v => `${v}%`}
            width={38}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={75} stroke={COLORS.statusWarning}  strokeDasharray="4 4" strokeOpacity={0.5} />
          <ReferenceLine y={60} stroke={COLORS.statusCritical} strokeDasharray="4 4" strokeOpacity={0.5} />

          {PROCESSORS.map(p => (
            <Line
              key={p.id}
              type="monotone"
              dataKey={p.id}
              stroke={PROCESSOR_COLORS[p.id]}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 20, marginTop: 12, flexWrap: 'wrap' }}>
        {PROCESSORS.map(p => (
          <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: COLORS.gray600 }}>
            <span style={{ width: 14, height: 3, borderRadius: 2, backgroundColor: PROCESSOR_COLORS[p.id], display: 'inline-block' }} />
            {p.name}
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: COLORS.gray400 }}>
          <span style={{ width: 14, height: 1, borderTop: `2px dashed ${COLORS.statusWarning}`, display: 'inline-block', opacity: 0.6 }} />
          Degraded threshold
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: COLORS.gray400 }}>
          <span style={{ width: 14, height: 1, borderTop: `2px dashed ${COLORS.statusCritical}`, display: 'inline-block', opacity: 0.6 }} />
          Critical threshold
        </div>
      </div>
    </div>
  );
}
