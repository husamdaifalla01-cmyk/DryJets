'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ExternalLink, TrendingUp, TrendingDown } from 'lucide-react'

interface SerpRanking {
  url: string
  keyword: string
  position: number
  impressions: number
  clicks: number
  ctr: number
}

interface SerpRankingsProps {
  rankings: SerpRanking[]
}

const getPositionColor = (position: number) => {
  if (position <= 3) return 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300'
  if (position <= 10) return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
  return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300'
}

export function SerpRankings({ rankings }: SerpRankingsProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>SERP Rankings by URL</CardTitle>
            <CardDescription>Your pages ranked for keywords in Google Search Results</CardDescription>
          </div>
          <Badge variant="outline">{rankings.length} pages</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {rankings.map((ranking, idx) => (
            <div
              key={idx}
              className="flex items-start justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Badge className={getPositionColor(ranking.position)}>
                    #{ranking.position}
                  </Badge>
                  <a
                    href={ranking.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-blue-600 hover:underline flex items-center gap-1"
                  >
                    {ranking.url}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  Ranking for: <span className="font-medium text-foreground">"{ranking.keyword}"</span>
                </p>
                <div className="flex items-center gap-6 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <span className="font-medium text-foreground">{ranking.impressions.toLocaleString()}</span>
                    impressions
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="font-medium text-foreground">{ranking.clicks.toLocaleString()}</span>
                    clicks
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="font-medium text-foreground">{ranking.ctr.toFixed(1)}%</span>
                    CTR
                  </span>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                Optimize
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t border-border">
          <h4 className="text-sm font-semibold text-foreground mb-3">Position Distribution</h4>
          <div className="grid gap-3 grid-cols-3">
            <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900">
              <div className="text-2xl font-bold text-green-900 dark:text-green-100">3</div>
              <p className="text-xs text-green-700 dark:text-green-300">Ranking in Top 3</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900">
              <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">12</div>
              <p className="text-xs text-blue-700 dark:text-blue-300">Ranking in Top 10</p>
            </div>
            <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-900">
              <div className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">28</div>
              <p className="text-xs text-yellow-700 dark:text-yellow-300">Ranking in Top 30</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
