'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useProfile } from '@/lib/hooks/useProfile';
import { CommandButton } from '@/components/command/CommandButton';
import { CommandPanel, DataPanel } from '@/components/command/CommandPanel';
import { StatusBadge } from '@/components/command/StatusBadge';
import { MetricDisplay } from '@/components/command/MetricDisplay';
import { ArrowLeft, Target, TrendingUp, Users, Lightbulb, CheckCircle, AlertTriangle, XCircle, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * STRATEGY & ANALYSIS PAGE
 *
 * Landscape analysis and marketing strategy dashboard.
 * Features SWOT matrix, competitor analysis, and strategy roadmap.
 */

type Tab = 'landscape' | 'strategy';

// Mock data (replace with actual API calls)
const mockLandscape = {
  totalAddressableMarket: '$50B',
  serviceableAddressableMarket: '$5B',
  serviceableObtainableMarket: '$250M',
  competitors: [
    { name: 'Competitor A', contentVolume: 250, avgEngagement: 5.2, platforms: ['Twitter', 'LinkedIn', 'Blog'] },
    { name: 'Competitor B', contentVolume: 180, avgEngagement: 4.8, platforms: ['LinkedIn', 'Medium'] },
    { name: 'Competitor C', contentVolume: 320, avgEngagement: 6.1, platforms: ['Twitter', 'Instagram', 'TikTok'] },
  ],
  strengths: [
    'Strong technical expertise',
    'Innovative product features',
    'Growing customer base',
    'Responsive support team',
  ],
  weaknesses: [
    'Limited brand awareness',
    'Small marketing team',
    'Budget constraints',
  ],
  opportunities: [
    'Emerging AI/automation trend',
    'Underserved SMB market',
    'Partnership potential with influencers',
    'Content gaps in competitor strategy',
  ],
  threats: [
    'Established competitors with larger budgets',
    'Market saturation in certain verticals',
    'Economic uncertainty affecting ad spend',
  ],
  recommendations: [
    'Focus on LinkedIn for B2B lead generation',
    'Create educational content around AI automation',
    'Partner with micro-influencers in target niche',
    'Develop case study content showcasing ROI',
    'Leverage Twitter for thought leadership',
  ],
  confidenceScore: 87,
};

const mockStrategy = {
  positioning: {
    statement: 'The only AI-powered marketing automation platform built specifically for resource-constrained SMBs',
    differentiators: [
      'Autonomous campaign execution',
      '99% cost reduction vs traditional agencies',
      'Zero marketing expertise required',
    ],
  },
  pillarTopics: [
    { name: 'Marketing Automation', contentIdeas: 8 },
    { name: 'AI in Business', contentIdeas: 12 },
    { name: 'SMB Growth Strategies', contentIdeas: 10 },
    { name: 'Content Marketing ROI', contentIdeas: 6 },
  ],
  campaigns: [
    { name: 'Launch Campaign', week: 1, duration: '2 weeks', contentPieces: 15, platforms: ['LinkedIn', 'Twitter'], budget: 500 },
    { name: 'Thought Leadership', week: 3, duration: '4 weeks', contentPieces: 30, platforms: ['LinkedIn', 'Medium'], budget: 800 },
    { name: 'Case Study Series', week: 7, duration: '3 weeks', contentPieces: 20, platforms: ['Blog', 'LinkedIn'], budget: 600 },
  ],
};

export default function StrategyPage() {
  const params = useParams();
  const profileId = params.id as string;
  const { data: profile } = useProfile(profileId);

  const [activeTab, setActiveTab] = useState<Tab>('landscape');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    // Simulate API call
    setTimeout(() => {
      setIsAnalyzing(false);
    }, 3000);
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link
        href={`/profiles/${profileId}`}
        className="inline-flex items-center gap-2 text-text-tertiary hover:text-neon-cyan transition-colors text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        BACK TO PROFILE
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient-cyan mb-2">
            STRATEGY & ANALYSIS
          </h1>
          <p className="text-text-tertiary">
            AI-powered market analysis and strategic recommendations for {profile?.brandName}
          </p>
        </div>
        <CommandButton onClick={handleAnalyze} loading={isAnalyzing}>
          <Target className="w-4 h-4" />
          {activeTab === 'landscape' ? 'RE-ANALYZE' : 'REGENERATE'}
        </CommandButton>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border-emphasis">
        <button
          className={cn(
            'px-6 py-3 font-mono text-sm uppercase transition-all',
            activeTab === 'landscape'
              ? 'border-b-2 border-neon-cyan text-neon-cyan'
              : 'text-text-tertiary hover:text-text-primary'
          )}
          onClick={() => setActiveTab('landscape')}
        >
          LANDSCAPE ANALYSIS
        </button>
        <button
          className={cn(
            'px-6 py-3 font-mono text-sm uppercase transition-all',
            activeTab === 'strategy'
              ? 'border-b-2 border-neon-cyan text-neon-cyan'
              : 'text-text-tertiary hover:text-text-primary'
          )}
          onClick={() => setActiveTab('strategy')}
        >
          MARKETING STRATEGY
        </button>
      </div>

      {/* Landscape Tab */}
      {activeTab === 'landscape' && (
        <div className="space-y-6">
          {/* Market Size */}
          <div className="grid grid-cols-3 gap-4">
            <MetricDisplay
              label="TAM"
              value={mockLandscape.totalAddressableMarket}
              subtitle="Total Addressable Market"
              icon={Users}
            />
            <MetricDisplay
              label="SAM"
              value={mockLandscape.serviceableAddressableMarket}
              subtitle="Serviceable Addressable Market"
              icon={Target}
              variant="green"
            />
            <MetricDisplay
              label="SOM"
              value={mockLandscape.serviceableObtainableMarket}
              subtitle="Serviceable Obtainable Market"
              icon={Zap}
              variant="purple"
            />
          </div>

          {/* SWOT Matrix */}
          <div>
            <h2 className="text-xl font-bold mb-4">SWOT ANALYSIS</h2>
            <div className="grid grid-cols-2 gap-4">
              <CommandPanel variant="green">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="w-5 h-5 text-neon-green" />
                  <h3 className="text-sm uppercase font-mono text-text-tertiary">STRENGTHS</h3>
                </div>
                <ul className="space-y-2">
                  {mockLandscape.strengths.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <span className="text-neon-green mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CommandPanel>

              <CommandPanel variant="magenta">
                <div className="flex items-center gap-2 mb-4">
                  <XCircle className="w-5 h-5 text-neon-magenta" />
                  <h3 className="text-sm uppercase font-mono text-text-tertiary">WEAKNESSES</h3>
                </div>
                <ul className="space-y-2">
                  {mockLandscape.weaknesses.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <span className="text-neon-magenta mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CommandPanel>

              <CommandPanel>
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-neon-cyan" />
                  <h3 className="text-sm uppercase font-mono text-text-tertiary">OPPORTUNITIES</h3>
                </div>
                <ul className="space-y-2">
                  {mockLandscape.opportunities.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <span className="text-neon-cyan mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CommandPanel>

              <CommandPanel variant="yellow">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="w-5 h-5 text-neon-yellow" />
                  <h3 className="text-sm uppercase font-mono text-text-tertiary">THREATS</h3>
                </div>
                <ul className="space-y-2">
                  {mockLandscape.threats.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <span className="text-neon-yellow mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CommandPanel>
            </div>
          </div>

          {/* Competitors */}
          <div>
            <h2 className="text-xl font-bold mb-4">COMPETITOR ANALYSIS</h2>
            <div className="grid grid-cols-3 gap-4">
              {mockLandscape.competitors.map((comp, idx) => (
                <DataPanel key={idx}>
                  <h3 className="font-bold mb-3">{comp.name}</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-text-tertiary">Content Volume:</span>
                      <span className="font-mono">{comp.contentVolume}/mo</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-tertiary">Avg Engagement:</span>
                      <span className="font-mono text-neon-cyan">{comp.avgEngagement}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-tertiary">Platforms:</span>
                      <span className="font-mono">{comp.platforms.length}</span>
                    </div>
                  </div>
                </DataPanel>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <CommandPanel>
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-5 h-5 text-neon-cyan" />
              <h3 className="text-sm uppercase font-mono text-text-tertiary">
                AI RECOMMENDATIONS (CONFIDENCE: {mockLandscape.confidenceScore}%)
              </h3>
            </div>
            <ul className="space-y-3">
              {mockLandscape.recommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="text-neon-cyan font-mono text-sm">{idx + 1}.</span>
                  <span className="text-text-secondary">{rec}</span>
                </li>
              ))}
            </ul>
          </CommandPanel>
        </div>
      )}

      {/* Strategy Tab */}
      {activeTab === 'strategy' && (
        <div className="space-y-6">
          {/* Positioning */}
          <CommandPanel>
            <h2 className="text-sm uppercase font-mono text-text-tertiary mb-4">POSITIONING STATEMENT</h2>
            <p className="text-lg mb-4">{mockStrategy.positioning.statement}</p>
            <div className="flex flex-wrap gap-2">
              {mockStrategy.positioning.differentiators.map((diff, idx) => (
                <span key={idx} className="px-3 py-1 bg-bg-elevated border border-neon-cyan text-sm">
                  {diff}
                </span>
              ))}
            </div>
          </CommandPanel>

          {/* Pillar Topics */}
          <div>
            <h2 className="text-xl font-bold mb-4">CONTENT PILLARS</h2>
            <div className="grid grid-cols-2 gap-4">
              {mockStrategy.pillarTopics.map((pillar, idx) => (
                <DataPanel key={idx}>
                  <h3 className="font-bold mb-2">{pillar.name}</h3>
                  <div className="text-text-tertiary text-sm">
                    {pillar.contentIdeas} content ideas generated
                  </div>
                </DataPanel>
              ))}
            </div>
          </div>

          {/* Campaign Roadmap */}
          <div>
            <h2 className="text-xl font-bold mb-4">CAMPAIGN ROADMAP</h2>
            <div className="space-y-4">
              {mockStrategy.campaigns.map((campaign, idx) => (
                <div key={idx} className="relative pl-8">
                  <div className="absolute left-0 top-2 w-4 h-4 border-2 border-neon-cyan bg-bg-primary" />
                  {idx < mockStrategy.campaigns.length - 1 && (
                    <div className="absolute left-2 top-6 bottom-0 w-0.5 bg-border-emphasis" />
                  )}
                  <DataPanel>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold">{campaign.name}</h3>
                        <p className="text-text-tertiary text-sm">Week {campaign.week} • {campaign.duration}</p>
                      </div>
                      <StatusBadge status="pending">PLANNED</StatusBadge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-text-tertiary">Content</div>
                        <div className="font-mono">{campaign.contentPieces} pieces</div>
                      </div>
                      <div>
                        <div className="text-text-tertiary">Platforms</div>
                        <div className="font-mono">{campaign.platforms.join(', ')}</div>
                      </div>
                      <div>
                        <div className="text-text-tertiary">Budget</div>
                        <div className="font-mono text-neon-cyan">${campaign.budget}</div>
                      </div>
                    </div>
                  </DataPanel>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
