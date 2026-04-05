import { Badge } from '@/components/ui/badge'

interface Props {
  status: 'active' | 'closed'
  isNew?: boolean
}

export function JobStatusBadge({ status, isNew }: Props) {
  if (isNew) {
    return (
      <Badge className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium">
        New
      </Badge>
    )
  }
  if (status === 'closed') {
    return (
      <Badge variant="secondary" className="text-muted-foreground">
        Closed
      </Badge>
    )
  }
  return (
    <Badge variant="outline" className="text-foreground/70 border-border">
      Active
    </Badge>
  )
}
