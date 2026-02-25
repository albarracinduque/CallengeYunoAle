import { useState, useCallback } from 'react';
import './App.css';

import { useSimulation } from './simulation/engine';
import { COLORS, FONT } from './constants/theme';
import { PROCESSORS } from './constants/processors';

import Header        from './components/Header';
import AlertBanner   from './components/AlertBanner';
import ProcessorCard from './components/ProcessorCard';
import TrendChart    from './components/TrendChart';
import DrillDownPanel from './components/DrillDownPanel';

export default function App() {
  const [thresholds, setThresholds]           = useState({ critical: 60, degraded: 75 });
  const [selectedProcessor, setSelectedProcessor] = useState(null);
  const [showSettings, setShowSettings]       = useState(false);

  const { transactions, history, metrics, totalCount, elapsedSeconds, initialized } = useSimulation(thresholds);

  const alerts = PROCESSORS.filter(
    p => metrics[p.id] && (metrics[p.id].health === 'degraded' || metrics[p.id].health === 'critical')
  );

  const handleExport = useCallback(() => {
    const exportedAt = new Date().toISOString();
    const rows = [
      ['AeroSur Checkout Health Monitor — Snapshot Export'],
      [`Exported At,${exportedAt}`],
      [`Elapsed (s),${elapsedSeconds}`],
      [`Total Transactions,${totalCount}`],
      [],
      ['Processor', 'Method', 'Health', 'Auth Rate (%)', 'Avg Latency (ms)', 'Total', 'Approved', 'Declined', 'Failed', 'Pending', 'Alert'],
      ...PROCESSORS.map(p => {
        const m = metrics[p.id] || {};
        const isAlert = alerts.some(a => a.id === p.id);
        return [
          p.name,
          p.method,
          m.health || 'healthy',
          m.authRate ?? '',
          m.avgLatency ?? '',
          m.total ?? '',
          m.approved ?? '',
          m.declined ?? '',
          m.failed ?? '',
          m.pending ?? '',
          isAlert ? 'YES' : 'no',
        ];
      }),
    ];

    const csv  = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `aerosur-snapshot-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [metrics, totalCount, elapsedSeconds, alerts]);

  const handleCardClick = (processorId) => {
    setSelectedProcessor(prev => (prev === processorId ? null : processorId));
  };

  const selectedProc = PROCESSORS.find(p => p.id === selectedProcessor);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: COLORS.gray50, fontFamily: FONT }}>
      <Header
        elapsedSeconds={elapsedSeconds}
        totalCount={totalCount}
        onSettingsClick={() => setShowSettings(s => !s)}
        onExport={handleExport}
        showSettings={showSettings}
        thresholds={thresholds}
        onThresholdsChange={setThresholds}
      />

      {alerts.length > 0 && <AlertBanner alerts={alerts} metrics={metrics} />}

      <main style={{ padding: '24px 28px', maxWidth: 1400, margin: '0 auto' }}>
        {/* Processor Cards */}
        <section style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 16,
          marginBottom: 20,
        }}>
          {!initialized
            ? PROCESSORS.map(p => <SkeletonCard key={p.id} name={p.name} method={p.method} />)
            : PROCESSORS.map(p => (
                <ProcessorCard
                  key={p.id}
                  processor={p}
                  metrics={metrics[p.id]}
                  history={history[p.id]}
                  isSelected={selectedProcessor === p.id}
                  onClick={() => handleCardClick(p.id)}
                />
              ))
          }
        </section>

        {/* Trend Chart */}
        <section style={{ marginBottom: 20 }}>
          <TrendChart history={history} />
        </section>

        {/* Drill-Down Panel */}
        {selectedProc && (
          <section>
            <DrillDownPanel
              processor={selectedProc}
              transactions={transactions[selectedProc.id]}
              metrics={metrics[selectedProc.id]}
              onClose={() => setSelectedProcessor(null)}
            />
          </section>
        )}
      </main>

      {/* Footer */}
      <footer style={{
        textAlign: 'center',
        padding: '16px 28px',
        fontSize: 11,
        color: COLORS.gray400,
        borderTop: `1px solid ${COLORS.gray200}`,
        backgroundColor: COLORS.white,
        fontFamily: FONT,
      }}>
        AeroSur Checkout Health Monitor &mdash; powered by{' '}
        <span style={{ color: COLORS.primaryBlue, fontWeight: 600 }}>YUNO</span>
      </footer>
    </div>
  );
}

function SkeletonCard({ name, method }) {
  return (
    <div style={{
      backgroundColor: COLORS.white,
      borderRadius: 12,
      border: `2px solid ${COLORS.gray200}`,
      overflow: 'hidden',
      fontFamily: FONT,
    }}>
      <div style={{ height: 4, backgroundColor: COLORS.gray200 }} />
      <div style={{ padding: '16px 18px' }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.black, marginBottom: 4 }}>{name}</div>
        <div style={{
          display: 'inline-block', fontSize: 11, color: COLORS.gray400,
          backgroundColor: COLORS.gray100, padding: '2px 8px', borderRadius: 10, marginBottom: 16,
        }}>
          {method}
        </div>
        <div style={{
          width: '60%', height: 40, backgroundColor: COLORS.gray100,
          borderRadius: 6, marginBottom: 8, animation: 'pulse 1.5s ease-in-out infinite',
        }} />
        <div style={{ fontSize: 11, color: COLORS.gray400, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Initializing...
        </div>
      </div>
    </div>
  );
}
