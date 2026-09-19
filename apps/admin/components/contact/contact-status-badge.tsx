import { Badge } from '@/components/ui';

interface ContactStatusBadgeProps {
  handled: boolean;
}

export function ContactStatusBadge({ handled }: ContactStatusBadgeProps) {
  if (handled) {
    return <Badge variant="success">İncelendi</Badge>;
  }

  return <Badge variant="warning">Bekliyor</Badge>;
}
