'use client';

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  useTrendPredictions,
  useContentOptimizations,
  useABTestResults,
  useKeywordOpportunities,
  useCampaignForecasts,
  useModelPerformance,
} from '@/lib/hooks/useML';
import { CommandPanel } from '@/components/command/CommandPanel';
import { TrendingUp, FileText, FlaskConical, Key, BarChart3, Cpu, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * ML PREDICTION CENTER
 *
 * Machine learning powered predictions and optimizations.
 * 16 endpoints across 6 categories.
 */

type Tab = 'trends' | 'content' | 'tests' | 'keywords' | 'forecasts' | 'models';

export default function MLLabPage() {
  const searchParams = useSearchParams();
  const profileId = searchParams?.get('profileId') || '';
  const [activeTab, setActiveTab] = useState<Tab>('trends');

  const { data: trends, isLoading: trendsLoading } = useTrendPredictions(profileId);
  const { data: optimizations, isLoading: optLoading } = useContentOptimizations(profileId);
  const { data: tests, isLoading: testsLoading } = useABTestResults(profileId);
  const { data: keywords, isLoading: keywordsLoading } = useKeywordOpportunities(profileId);
  const { data: forecasts, isLoading: forecastsLoading } = useCampaignForecasts(profileId);
  const { data: models, isLoading: modelsLoading } = useModelPerformance(profileId);

  if (!profileId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Cpu className="w-12 h-12 mx-auto mb-4 text-text-tertiary" />
          <p className="text-text-tertiary">Please select a profile to view ML predictions.</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'trends' as Tab, label: 'Trends', icon: TrendingUp, count: trends?.length },
    { id: 'content' as Tab, label: 'Content', icon: FileText, count: optimizations?.length },
    { id: 'tests' as Tab, label: 'A/B Tests', icon: FlaskConical, count: tests?.length },
    { id: 'keywords' as Tab, label: 'Keywords', icon: Key, count: keywords?.length },
    { id: 'forecasts' as Tab, label: 'Forecasts', icon: BarChart3, count: forecasts?.length },
    { id: 'models' as Tab, label: 'Models', icon: Cpu, count: models?.length },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">ML Prediction Center</h1>
        <p className="text-text-tertiary">
          Machine learning powered insights and predictions
        </p>
      </div>

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

      {activeTab === 'trends' && (
        <div className="space-y-4">
          {trendsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : trends && trends.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {trends.map((trend, idx) => (
                <CommandPanel key={idx} variant="default">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold">{trend.topic}</h3>
                    <span className={cn(
                      'text-xs px-2 py-1 rounded',
                      trend.momentum === 'rising' ? 'bg-accent-success/10 text-accent-success' :
                      trend.momentum === 'declining' ? 'bg-accent-error/10 text-accent-error' :
                      'bg-bg-elevated text-text-tertiary'
                    )}>
                      {trend.momentum}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-text-tertiary">Confidence</span>
                      <span className="font-bold text-primary">{trend.confidence}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-tertiary">Peak Date</span>
                      <span>{new Date(trend.peakDate).toLocaleDateString()}</span>
                    </div>
                    {trend.relatedTopics && trend.relatedTopics.length > 0 && (
                      <div className="pt-2 border-t border-border-subtle">
                        <div className="text-xs text-text-tertiary mb-2">Related Topics</div>
                        <div className="flex flex-wrap gap-1">
                          {trend.relatedTopics.map((t, i) => (
                            <span key={i} className="text-xs px-2 py-0.5 bg-bg-elevated rounded">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CommandPanel>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-text-tertiary">
              <p>No trend predictions available yet.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'content' && (
        <div className="space-y-4">
          {optLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : optimizations && optimizations.length > 0 ? (
            optimizations.map((opt, idx) => (
              <CommandPanel key={idx} variant="default">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold mb-1">{opt.title}</h3>
                    <div className="text-sm text-text-tertiary">Content ID: {opt.contentId}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-text-tertiary">Current → Optimized</div>
                    <div className="text-2xl font-bold">
                      <span className="text-text-tertiary">{opt.currentScore}</span>
                      <span className="text-primary"> → {opt.optimizedScore}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  {opt.suggestions?.map((sug, i) => (
                    <div key={i} className="bg-bg-base rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-text-tertiary uppercase">{sug.type}</span>
                        <span className="text-xs text-accent-success">+{sug.impact}%</span>
                      </div>
                      <p className="text-sm">{sug.suggestion}</p>
                    </div>
                  ))}
                </div>
              </CommandPanel>
            ))
          ) : (
            <div className="text-center py-12 text-text-tertiary">
              <p>No content optimizations available yet.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'tests' && (
        <div className="space-y-4">
          {testsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : tests && tests.length > 0 ? (
            tests.map((test, idx) => (
              <CommandPanel key={idx} variant="default">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold mb-1">{test.name}</h3>
                    <div className="text-sm text-text-tertiary">Sample size: {test.sampleSize.toLocaleString()}</div>
                  </div>
                  <span className={cn(
                    'text-xs px-2 py-1 rounded',
                    test.status === 'completed' ? 'bg-accent-success/10 text-accent-success' :
                    test.status === 'running' ? 'bg-accent-info/10 text-accent-info' :
                    'bg-bg-elevated text-text-tertiary'
                  )}>
                    {test.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {test.variants?.map((variant, i) => (
                    <div key={i} className={cn(
                      'bg-bg-base rounded-lg p-4',
                      test.winner === variant.id && 'ring-2 ring-accent-success'
                    )}>
                      <div className="font-semibold mb-2">{variant.name}</div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-text-tertiary">Conv. Rate</span>
                          <span className="font-bold text-primary">{variant.conversionRate.toFixed(2)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-tertiary">Impressions</span>
                          <span>{variant.impressions.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-tertiary">Conversions</span>
                          <span className="text-accent-success">{variant.conversions}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {test.winner && (
                  <div className="mt-4 text-sm text-center text-accent-success">
                    Winner: {test.variants?.find(v => v.id === test.winner)?.name} ({test.confidence}% confidence)
                  </div>
                )}
              </CommandPanel>
            ))
          ) : (
            <div className="text-center py-12 text-text-tertiary">
              <p>No A/B tests available yet.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'keywords' && (
        <div className="space-y-4">
          {keywordsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : keywords && keywords.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {keywords.map((kw, idx) => (
                <CommandPanel key={idx} variant="default">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold">{kw.keyword}</h3>
                    <span className={cn(
                      'text-xs px-2 py-1 rounded',
                      kw.difficulty === 'easy' ? 'bg-accent-success/10 text-accent-success' :
                      kw.difficulty === 'medium' ? 'bg-accent-warning/10 text-accent-warning' :
                      'bg-accent-error/10 text-accent-error'
                    )}>
                      {kw.difficulty}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm mb-3">
                    <div className="flex justify-between">
                      <span className="text-text-tertiary">Search Volume</span>
                      <span className="font-bold">{kw.searchVolume.toLocaleString()}/mo</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-tertiary">Opportunity Score</span>
                      <span className="font-bold text-primary">{kw.opportunity}/100</span>
                    </div>
                  </div>
                  {kw.relatedKeywords && kw.relatedKeywords.length > 0 && (
                    <div className="pt-2 border-t border-border-subtle">
                      <div className="text-xs text-text-tertiary mb-2">Related Keywords</div>
                      <div className="flex flex-wrap gap-1">
                        {kw.relatedKeywords.map((r, i) => (
                          <span key={i} className="text-xs px-2 py-0.5 bg-bg-elevated rounded">
                            {r}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </CommandPanel>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-text-tertiary">
              <p>No keyword opportunities available yet.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'forecasts' && (
        <div className="space-y-4">
          {forecastsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : forecasts && forecasts.length > 0 ? (
            forecasts.map((forecast, idx) => (
              <CommandPanel key={idx} variant="default">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-bold">{forecast.name}</h3>
                  <div className="text-right">
                    <div className="text-xs text-text-tertiary">Confidence</div>
                    <div className="text-xl font-bold text-primary">{forecast.confidence}%</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-text-tertiary mb-1">Reach</div>
                    <div className="text-xl font-bold">{forecast.projectedReach.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-text-tertiary mb-1">Engagement</div>
                    <div className="text-xl font-bold text-primary">{forecast.projectedEngagement.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-text-tertiary mb-1">Conversions</div>
                    <div className="text-xl font-bold text-accent-success">{forecast.projectedConversions}</div>
                  </div>
                  <div>
                    <div className="text-text-tertiary mb-1">ROI</div>
                    <div className="text-xl font-bold text-accent-success">{forecast.projectedROI}%</div>
                  </div>
                </div>
              </CommandPanel>
            ))
          ) : (
            <div className="text-center py-12 text-text-tertiary">
              <p>No campaign forecasts available yet.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'models' && (
        <div className="space-y-4">
          {modelsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : models && models.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {models.map((model, idx) => (
                <CommandPanel key={idx} variant="default">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold mb-1">{model.name}</h3>
                      <div className="text-sm text-text-tertiary">{model.type}</div>
                    </div>
                    <span className={cn(
                      'text-xs px-2 py-1 rounded',
                      model.status === 'active' ? 'bg-accent-success/10 text-accent-success' :
                      model.status === 'training' ? 'bg-accent-info/10 text-accent-info' :
                      'bg-accent-warning/10 text-accent-warning'
                    )}>
                      {model.status}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-text-tertiary">Accuracy</span>
                      <span className="font-bold text-primary">{model.accuracy}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-tertiary">Predictions</span>
                      <span>{model.predictions.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-tertiary">Last Trained</span>
                      <span>{new Date(model.lastTrained).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CommandPanel>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-text-tertiary">
              <p>No models available yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
