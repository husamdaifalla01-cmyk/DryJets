'use client'

export interface DashboardHeaderProps {
  title: string
  description?: string
  action?: React.ReactNode
}

export function DashboardHeader({ title, description, action }: DashboardHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold text-foreground">{title}</h1>
        {description && (
          <p className="text-muted-foreground mt-2">{description}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}
