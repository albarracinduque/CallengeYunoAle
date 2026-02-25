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

  const { transactions, history, metrics, totalCount, elapsedSeconds } = useSimulation(thresholds);

  const alerts = PROCESSORS.filter(
    p => metrics[p.id] && (metrics[p.id].health === 'degraded' || metrics[p.id].health === 'critical')
  );

  const handleExport = useCallback(() => {
    const snapshot = {
      exportedAt: new Date().toISOString(),
      elapsedSeconds,
      totalTransactions: totalCount,
      processors: PROCESSORS.map(p => ({
        id: p.id,
        name: p.name,
        method: p.method,
        metrics: metrics[p.id] || {},
      })),
      activeAlerts: alerts.map(p => ({
        id: p.id,
        name: p.name,
        health: metrics[p.id]?.health,
        authRate: metrics[p.id]?.authRate,
      })),
    };

    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `aerosur-snapshot-${Date.now()}.json`;
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
          {PROCESSORS.map(p => (
            <ProcessorCard
              key={p.id}
              processor={p}
              metrics={metrics[p.id]}
              history={history[p.id]}
              isSelected={selectedProcessor === p.id}
              onClick={() => handleCardClick(p.id)}
            />
          ))}
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
