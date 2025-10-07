import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function StatusBadge({ status }) {
  const map = {
    new: { label: "Новая", variant: "bg-blue-600/10 text-blue-700 border-blue-600/20" },
    in_progress: { label: "В работе", variant: "bg-amber-500/10 text-amber-700 border-amber-500/20" },
    in_review: { label: "На проверке", variant: "bg-violet-500/10 text-violet-700 border-violet-500/20" },
    closed: { label: "Закрыта", variant: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20" },
    cancelled: { label: "Отменена", variant: "bg-rose-500/10 text-rose-700 border-rose-500/20" },
  };
  const s = map[status];
  return <Badge className={cn("border", s.variant)}>{s.label}</Badge>;
}

export function PriorityBadge({ priority }) {
  const map = {
    low: { label: "Низкий", variant: "bg-slate-500/10 text-slate-700 border-slate-500/20" },
    medium: { label: "Средний", variant: "bg-sky-500/10 text-sky-700 border-sky-500/20" },
    high: { label: "Высокий", variant: "bg-orange-500/10 text-orange-700 border-orange-500/20" },
    critical: { label: "Критический", variant: "bg-red-500/10 text-red-700 border-red-500/20" },
  };
  const p = map[priority];
  return <Badge className={cn("border", p.variant)}>{p.label}</Badge>;
}
