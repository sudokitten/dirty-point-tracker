import { useState } from 'react';
import OverviewTab from './OverviewTab.jsx';
import AnalysisTab from './AnalysisTab.jsx';
import BuildTab from './BuildTab.jsx';

export default function MatchCardDetail({ match, playerRow, playerPuuid }) {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="bg-page border border-t-0 border-border-default rounded-b-xl overflow-hidden">
      {/* Sub-Navigation Tabs */}
      <div className="flex bg-section border-b border-border-default">
        {['overview', 'analysis', 'build'].map((tab) => (
          <button
            key={tab}
            onClick={(e) => { e.stopPropagation(); setActiveTab(tab); }}
            className={`px-6 py-3 text-[11px] font-black uppercase tracking-widest transition-all border-b-2
              ${activeTab === tab
                ? 'border-accent text-primary bg-accent/5'
                : 'border-transparent text-muted hover:text-primary'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && <OverviewTab match={match} playerPuuid={playerPuuid} />}
        {activeTab === 'analysis' && <AnalysisTab match={match} />}
        {activeTab === 'build' && <BuildTab playerRow={playerRow} matchId={match.matchId} playerPuuid={playerPuuid} />}
      </div>
    </div>
  );
}
