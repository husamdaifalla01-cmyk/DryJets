'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useState } from 'react'
import { Search, TrendingUp, TrendingDown } from 'lucide-react'

interface Keyword {
  id: string
  keyword: string
  rank: number
  previousRank?: number
  monthlySearches: number
  ctr: number
  impressions: number
  clicks: number
}

interface KeywordTrackingProps {
  keywords?: Keyword[]
}

export function KeywordTracking({ keywords = [] }: KeywordTrackingProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'rank' | 'searches' | 'clicks'>('rank')

  const filteredKeywords = keywords.filter(kw =>
    kw.keyword.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const sortedKeywords = [...filteredKeywords].sort((a, b) => {
    switch (sortBy) {
      case 'rank':
        return a.rank - b.rank
      case 'searches':
        return b.monthlySearches - a.monthlySearches
      case 'clicks':
        return b.clicks - a.clicks
      default:
        return 0
    }
  })

  const getRankChange = (current: number, previous?: number) => {
    if (!previous) return null
    const change = previous - current
    if (change > 0) return { direction: 'up', amount: change }
    if (change < 0) return { direction: 'down', amount: Math.abs(change) }
    return { direction: 'neutral', amount: 0 }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Keyword Rankings</CardTitle>
        <CardDescription>Track all your keywords and their positions in search results</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Search and Filters */}
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm"
            >
              <option value="rank">Sort by Rank</option>
              <option value="searches">Sort by Searches</option>
              <option value="clicks">Sort by Clicks</option>
            </select>
          </div>

          {/* Keywords List */}
          {sortedKeywords.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {sortedKeywords.map((kw) => {
                const rankChange = getRankChange(kw.rank, kw.previousRank)
                return (
                  <div
                    key={kw.id}
                    className="p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-foreground">{kw.keyword}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                          <span className="font-semibold">#{kw.rank}</span>
                        </Badge>
                        {rankChange && (
                          <Badge
                            variant={rankChange.direction === 'up' ? 'secondary' : 'destructive'}
                            className="text-xs gap-1"
                          >
                            {rankChange.direction === 'up' ? (
                              <>
                                <TrendingUp className="h-3 w-3" />↑{rankChange.amount}
                              </>
                            ) : (
                              <>
                                <TrendingDown className="h-3 w-3" />↓{rankChange.amount}
                              </>
                            )}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-xs text-muted-foreground">
                      <div>
                        <span className="block text-foreground font-semibold">
                          {kw.monthlySearches.toLocaleString()}
                        </span>
                        <span>Monthly searches</span>
                      </div>
                      <div>
                        <span className="block text-foreground font-semibold">{kw.impressions.toLocaleString()}</span>
                        <span>Impressions</span>
                      </div>
                      <div>
                        <span className="block text-foreground font-semibold">{kw.clicks.toLocaleString()}</span>
                        <span>Clicks</span>
                      </div>
                      <div>
                        <span className="block text-foreground font-semibold">{kw.ctr.toFixed(1)}%</span>
                        <span>CTR</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {keywords.length === 0 ? 'No keywords tracked yet' : 'No keywords match your search'}
              </p>
            </div>
          )}

          {/* Summary Stats */}
          {keywords.length > 0 && (
            <div className="mt-6 pt-4 border-t border-border grid gap-3 grid-cols-3 text-sm">
              <div>
                <p className="text-muted-foreground">Avg. Position</p>
                <p className="text-lg font-bold text-foreground">
                  {(keywords.reduce((sum, kw) => sum + kw.rank, 0) / keywords.length).toFixed(1)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Total Clicks</p>
                <p className="text-lg font-bold text-foreground">
                  {keywords.reduce((sum, kw) => sum + kw.clicks, 0).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Avg. CTR</p>
                <p className="text-lg font-bold text-foreground">
                  {(keywords.reduce((sum, kw) => sum + kw.ctr, 0) / keywords.length).toFixed(2)}%
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
