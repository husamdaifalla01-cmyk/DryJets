'use client';

import React, { useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  useNarrativeInsights,
  useGrowthInsights,
  useAlgorithmInsights,
  useEEATInsights,
  useAttributionInsights,
  useCreativeInsights,
  useMemoryInsights,
} from '@/lib/hooks/useIntelligence';
import { CommandButton } from '@/components/command/CommandButton';
import { CommandPanel } from '@/components/command/CommandPanel';
import { Brain, TrendingUp, Zap, Award, GitBranch, Palette, Database, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * INTELLIGENCE DASHBOARD
 *
 * AI-powered marketing intelligence across 7 domains.
 * 26 backend endpoints providing deep insights.
 */

type Tab = 'narrative' | 'growth' | 'algorithm' | 'eeat' | 'attribution' | 'creative' | 'memory';

export default function IntelligencePage() {
  const searchParams = useSearchParams();
  const profileId = searchParams?.get('profileId') || '';

  const [activeTab, setActiveTab] = useState<Tab>('narrative');

  // Fetch all intelligence data
  const { data: narrative, isLoading: narrativeLoading } = useNarrativeInsights(profileId);
  const { data: growth, isLoading: growthLoading } = useGrowthInsights(profileId);
  const { data: algorithm, isLoading: algorithmLoading } = useAlgorithmInsights(profileId);
  const { data: eeat, isLoading: eeatLoading } = useEEATInsights(profileId);
  const { data: attribution, isLoading: attributionLoading } = useAttributionInsights(profileId);
  const { data: creative, isLoading: creativeLoading } = useCreativeInsights(profileId);
  const { data: memory, isLoading: memoryLoading } = useMemoryInsights(profileId);

  if (!profileId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Brain className="w-12 h-12 mx-auto mb-4 text-text-tertiary" />
          <p className="text-text-tertiary">Please select a profile to view intelligence insights.</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'narrative' as Tab, label: 'Narrative', icon: Brain, count: narrative?.narratives?.length },
    { id: 'growth' as Tab, label: 'Growth', icon: TrendingUp, count: growth?.opportunities?.length },
    { id: 'algorithm' as Tab, label: 'Algorithm', icon: Zap, count: algorithm?.platformAlgorithms?.length },
    { id: 'eeat' as Tab, label: 'E-E-A-T', icon: Award, count: eeat?.overallScore },
    { id: 'attribution' as Tab, label: 'Attribution', icon: GitBranch, count: attribution?.touchpoints?.length },
    { id: 'creative' as Tab, label: 'Creative', icon: Palette, count: creative?.topPerformers?.length },
    { id: 'memory' as Tab, label: 'Memory', icon: Database, count: memory?.learnedPatterns?.length },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Marketing Intelligence</h1>
        <p className="text-text-tertiary">
          AI-powered insights across 7 intelligence domains
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border-subtle overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={cn(
              'px-4 py-3 text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2',
              activeTab === tab.id
                ? 'border-b-2 border-primary text-primary'
                : 'text-text-tertiary hover:text-text-primary'
            )}
            onClick={() => setActiveTab(tab.id)}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {tab.count !== undefined && (
              <span className="text-xs bg-bg-elevated px-2 py-0.5 rounded-full">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Narrative Intelligence */}
      {activeTab === 'narrative' && (
        <div className="space-y-6">
          {narrativeLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : narrative ? (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {narrative.narratives?.map((n, idx) => (
                  <CommandPanel key={idx} variant="default">
                    <h3 className="font-bold text-lg mb-2">{n.topic}</h3>
                    <p className="text-text-tertiary text-sm mb-4">{n.angle}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-text-tertiary">Effectiveness</span>
                      <span className="font-bold text-primary">{n.effectiveness}%</span>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {n.platforms?.map((p, i) => (
                        <span key={i} className="px-2 py-1 bg-bg-elevated text-xs rounded">
                          {p}
                        </span>
                      ))}
                    </div>
                  </CommandPanel>
                ))}
              </div>

              {narrative.recommendations && narrative.recommendations.length > 0 && (
                <CommandPanel variant="elevated">
                  <h3 className="font-bold mb-4">AI Recommendations</h3>
                  <ul className="space-y-2">
                    {narrative.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <span className="text-primary mt-1">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </CommandPanel>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-text-tertiary">
              <p>No narrative intelligence available yet.</p>
            </div>
          )}
        </div>
      )}

      {/* Growth Intelligence */}
      {activeTab === 'growth' && (
        <div className="space-y-6">
          {growthLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : growth ? (
            <>
              <div className="bg-bg-surface border border-border-subtle rounded-xl p-6">
                <div className="text-center">
                  <div className="text-5xl font-bold text-primary mb-2">
                    {growth.growthScore}
                  </div>
                  <div className="text-text-tertiary">Overall Growth Score</div>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-lg mb-4">Growth Opportunities</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {growth.opportunities?.map((opp, idx) => (
                    <CommandPanel key={idx} variant="default">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold">{opp.type}</h4>
                        <span className={cn(
                          'text-xs px-2 py-1 rounded',
                          opp.impact === 'high' ? 'bg-accent-success/10 text-accent-success' :
                          opp.impact === 'medium' ? 'bg-accent-warning/10 text-accent-warning' :
                          'bg-bg-elevated text-text-tertiary'
                        )}>
                          {opp.impact} impact
                        </span>
                      </div>
                      <p className="text-sm text-text-tertiary mb-2">{opp.description}</p>
                      <div className="text-sm font-medium text-primary">
                        Expected: {opp.expectedGrowth}
                      </div>
                    </CommandPanel>
                  ))}
                </div>
              </div>

              {growth.projections && growth.projections.length > 0 && (
                <div>
                  <h3 className="font-bold text-lg mb-4">Growth Projections</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {growth.projections.map((proj, idx) => (
                      <div key={idx} className="bg-bg-surface border border-border-subtle rounded-lg p-4">
                        <div className="text-text-tertiary text-sm mb-1">{proj.metric}</div>
                        <div className="text-2xl font-bold mb-2">{proj.current.toLocaleString()}</div>
                        <div className="text-sm">
                          <span className="text-text-tertiary">30d: </span>
                          <span className="text-accent-success">{proj.projected30d.toLocaleString()}</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-text-tertiary">90d: </span>
                          <span className="text-primary">{proj.projected90d.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-text-tertiary">
              <p>No growth intelligence available yet.</p>
            </div>
          )}
        </div>
      )}

      {/* Algorithm Intelligence */}
      {activeTab === 'algorithm' && (
        <div className="space-y-6">
          {algorithmLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : algorithm ? (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {algorithm.platformAlgorithms?.map((platform, idx) => (
                  <CommandPanel key={idx} variant="default">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-lg">{platform.platform}</h3>
                      <div className="text-2xl font-bold text-primary">
                        {platform.score}
                      </div>
                    </div>
                    <div className="space-y-3">
                      {platform.factors?.map((factor, i) => (
                        <div key={i} className="border-t border-border-subtle pt-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">{factor.name}</span>
                            <span className="text-sm text-primary">{factor.yourScore}/100</span>
                          </div>
                          <p className="text-xs text-text-tertiary">{factor.recommendation}</p>
                        </div>
                      ))}
                    </div>
                  </CommandPanel>
                ))}
              </div>

              {algorithm.optimizationTips && algorithm.optimizationTips.length > 0 && (
                <div>
                  <h3 className="font-bold text-lg mb-4">Optimization Tips</h3>
                  <div className="space-y-2">
                    {algorithm.optimizationTips.map((tip, idx) => (
                      <div key={idx} className="bg-bg-surface border border-border-subtle rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-semibold text-sm mb-1">{tip.platform}</div>
                            <p className="text-sm text-text-tertiary">{tip.tip}</p>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <span className={cn(
                              'text-xs px-2 py-1 rounded',
                              tip.impact === 'high' ? 'bg-accent-success/10 text-accent-success' :
                              tip.impact === 'medium' ? 'bg-accent-warning/10 text-accent-warning' :
                              'bg-bg-elevated text-text-tertiary'
                            )}>
                              {tip.impact}
                            </span>
                            <span className="text-xs px-2 py-1 rounded bg-bg-elevated">
                              {tip.difficulty}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-text-tertiary">
              <p>No algorithm intelligence available yet.</p>
            </div>
          )}
        </div>
      )}

      {/* E-E-A-T Intelligence */}
      {activeTab === 'eeat' && (
        <div className="space-y-6">
          {eeatLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : eeat ? (
            <>
              <div className="bg-bg-surface border border-border-subtle rounded-xl p-6">
                <div className="text-center">
                  <div className="text-5xl font-bold text-primary mb-2">
                    {eeat.overallScore}
                  </div>
                  <div className="text-text-tertiary">Overall E-E-A-T Score</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { key: 'experience', label: 'Experience', data: eeat.experience },
                  { key: 'expertise', label: 'Expertise', data: eeat.expertise },
                  { key: 'authoritativeness', label: 'Authoritativeness', data: eeat.authoritativeness },
                  { key: 'trustworthiness', label: 'Trustworthiness', data: eeat.trustworthiness },
                ].map((item) => item.data && (
                  <CommandPanel key={item.key} variant="default">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold">{item.label}</h3>
                      <div className="text-2xl font-bold text-primary">{item.data.score}</div>
                    </div>

                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-accent-success mb-2">Strengths</h4>
                      <ul className="space-y-1">
                        {item.data.strengths?.map((s: string, i: number) => (
                          <li key={i} className="text-sm text-text-tertiary flex items-start gap-2">
                            <span className="text-accent-success">✓</span>
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-accent-warning mb-2">Improvement Areas</h4>
                      <ul className="space-y-1">
                        {item.data.improvementActions?.map((a: string, i: number) => (
                          <li key={i} className="text-sm text-text-tertiary flex items-start gap-2">
                            <span className="text-accent-warning">→</span>
                            <span>{a}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CommandPanel>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-text-tertiary">
              <p>No E-E-A-T intelligence available yet.</p>
            </div>
          )}
        </div>
      )}

      {/* Attribution Intelligence */}
      {activeTab === 'attribution' && (
        <div className="space-y-6">
          {attributionLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : attribution ? (
            <>
              {attribution.touchpoints && attribution.touchpoints.length > 0 && (
                <div>
                  <h3 className="font-bold text-lg mb-4">Touchpoints</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {attribution.touchpoints.map((tp, idx) => (
                      <div key={idx} className="bg-bg-surface border border-border-subtle rounded-lg p-4">
                        <div className="font-semibold mb-2">{tp.channel}</div>
                        <div className="text-xs text-text-tertiary mb-3">{tp.stage}</div>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-text-tertiary">Interactions:</span>
                            <span>{tp.interactions.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-text-tertiary">Conversions:</span>
                            <span className="text-accent-success">{tp.conversions}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-text-tertiary">Value:</span>
                            <span className="text-primary">${tp.value.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {attribution.conversions && attribution.conversions.length > 0 && (
                <div>
                  <h3 className="font-bold text-lg mb-4">Top Conversion Paths</h3>
                  <div className="space-y-2">
                    {attribution.conversions.map((conv, idx) => (
                      <div key={idx} className="bg-bg-surface border border-border-subtle rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-mono text-sm mb-1">{conv.path}</div>
                            <div className="text-xs text-text-tertiary">Avg time: {conv.avgTime}</div>
                          </div>
                          <div className="text-right ml-4">
                            <div className="text-lg font-bold text-primary">{conv.conversions}</div>
                            <div className="text-xs text-text-tertiary">${conv.value.toLocaleString()}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-text-tertiary">
              <p>No attribution intelligence available yet.</p>
            </div>
          )}
        </div>
      )}

      {/* Creative Intelligence */}
      {activeTab === 'creative' && (
        <div className="space-y-6">
          {creativeLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : creative ? (
            <>
              {creative.topPerformers && creative.topPerformers.length > 0 && (
                <div>
                  <h3 className="font-bold text-lg mb-4">Top Performing Elements</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {creative.topPerformers.map((elem, idx) => (
                      <div key={idx} className="bg-bg-surface border border-border-subtle rounded-lg p-4">
                        <div className="text-xs text-text-tertiary uppercase mb-2">{elem.type}</div>
                        <div className="font-medium text-sm mb-3">{elem.value}</div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-text-tertiary">Performance</span>
                          <span className="text-primary font-bold">{elem.performance}%</span>
                        </div>
                        <div className="text-xs text-text-tertiary mt-1">
                          Used {elem.usage} times
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {creative.recommendations && creative.recommendations.length > 0 && (
                <div>
                  <h3 className="font-bold text-lg mb-4">Creative Recommendations</h3>
                  <div className="space-y-3">
                    {creative.recommendations.map((rec, idx) => (
                      <CommandPanel key={idx} variant="default">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold">{rec.element}</h4>
                          <span className="text-xs px-2 py-1 rounded bg-accent-success/10 text-accent-success">
                            {rec.expectedLift} lift
                          </span>
                        </div>
                        <p className="text-sm text-text-tertiary mb-2">{rec.suggestion}</p>
                        <p className="text-xs text-text-tertiary italic">{rec.reasoning}</p>
                      </CommandPanel>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-text-tertiary">
              <p>No creative intelligence available yet.</p>
            </div>
          )}
        </div>
      )}

      {/* Memory Intelligence */}
      {activeTab === 'memory' && (
        <div className="space-y-6">
          {memoryLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : memory ? (
            <>
              {memory.learnedPatterns && memory.learnedPatterns.length > 0 && (
                <div>
                  <h3 className="font-bold text-lg mb-4">Learned Patterns</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {memory.learnedPatterns.map((pattern, idx) => (
                      <div key={idx} className="bg-bg-surface border border-border-subtle rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="font-medium text-sm flex-1">{pattern.pattern}</div>
                          <div className="text-xs px-2 py-1 rounded bg-primary/10 text-primary ml-2">
                            {pattern.confidence}% confidence
                          </div>
                        </div>
                        <div className="text-xs text-text-tertiary">
                          Seen {pattern.occurrences} times • Last: {new Date(pattern.lastSeen).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {memory.contentMemory && memory.contentMemory.length > 0 && (
                <div>
                  <h3 className="font-bold text-lg mb-4">Content Memory</h3>
                  <div className="space-y-4">
                    {memory.contentMemory.map((content, idx) => (
                      <CommandPanel key={idx} variant="default">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold">{content.topic}</h4>
                          <div className="text-lg font-bold text-primary">{content.performance}%</div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h5 className="text-xs font-semibold text-accent-success mb-2">Best Practices</h5>
                            <ul className="space-y-1">
                              {content.bestPractices?.map((bp, i) => (
                                <li key={i} className="text-xs text-text-tertiary flex items-start gap-1">
                                  <span className="text-accent-success">✓</span>
                                  <span>{bp}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h5 className="text-xs font-semibold text-accent-error mb-2">Avoid</h5>
                            <ul className="space-y-1">
                              {content.avoid?.map((a, i) => (
                                <li key={i} className="text-xs text-text-tertiary flex items-start gap-1">
                                  <span className="text-accent-error">✗</span>
                                  <span>{a}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </CommandPanel>
                    ))}
                  </div>
                </div>
              )}

              {memory.audienceInsights && memory.audienceInsights.length > 0 && (
                <div>
                  <h3 className="font-bold text-lg mb-4">Audience Insights</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {memory.audienceInsights.map((insight, idx) => (
                      <div key={idx} className="bg-bg-surface border border-border-subtle rounded-lg p-4">
                        <div className="font-semibold mb-3">{insight.segment}</div>
                        <div className="space-y-2 text-sm">
                          <div>
                            <div className="text-xs text-text-tertiary mb-1">Preferences</div>
                            <div className="flex flex-wrap gap-1">
                              {insight.preferences?.map((p, i) => (
                                <span key={i} className="text-xs px-2 py-0.5 bg-bg-elevated rounded">
                                  {p}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="flex justify-between items-center pt-2 border-t border-border-subtle">
                            <span className="text-xs text-text-tertiary">Engagement</span>
                            <span className="text-sm font-bold text-primary">{insight.engagement}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-text-tertiary">
              <p>No memory intelligence available yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
