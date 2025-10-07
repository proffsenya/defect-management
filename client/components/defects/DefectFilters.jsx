import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProjects, useEngineers } from "@/lib/api";

export function DefectFilters({ value, onChange }) {
  const { data: projects } = useProjects();
  const { data: engineers } = useEngineers();

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
      <div className="space-y-1 md:col-span-2">
        <Label>Поиск</Label>
        <Input placeholder="Название или описание" value={value.q ?? ""} onChange={(e) => onChange({ ...value, q: e.target.value })} />
      </div>
      <div className="space-y-1">
        <Label>Статус</Label>
        <Select value={String(value.status ?? "__all__")} onValueChange={(v) => onChange({ ...value, status: (v === "__all__" ? undefined : v) })}>
          <SelectTrigger><SelectValue placeholder="Все" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Все</SelectItem>
            <SelectItem value="new">Новая</SelectItem>
            <SelectItem value="in_progress">В работе</SelectItem>
            <SelectItem value="in_review">На проверке</SelectItem>
            <SelectItem value="closed">Закрыта</SelectItem>
            <SelectItem value="cancelled">Отменена</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label>Приоритет</Label>
        <Select value={String(value.priority ?? "__all__")} onValueChange={(v) => onChange({ ...value, priority: v === "__all__" ? undefined : v })}>
          <SelectTrigger><SelectValue placeholder="Все" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Все</SelectItem>
            <SelectItem value="low">Низкий</SelectItem>
            <SelectItem value="medium">Средний</SelectItem>
            <SelectItem value="high">Высокий</SelectItem>
            <SelectItem value="critical">Критический</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label>Проект</Label>
        <Select value={String(value.projectId ?? "__all__")} onValueChange={(v) => onChange({ ...value, projectId: v === "__all__" ? undefined : v })}>
          <SelectTrigger><SelectValue placeholder="Все" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Все</SelectItem>
            {projects?.map((p) => (
              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label>Исполнитель</Label>
        <Select value={String(value.assigneeId ?? "__all__")} onValueChange={(v) => onChange({ ...value, assigneeId: v === "__all__" ? undefined : v })}>
          <SelectTrigger><SelectValue placeholder="Все" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Все</SelectItem>
            {engineers?.map((engineer) => (
              <SelectItem key={engineer.id} value={engineer.id}>{engineer.name} ({engineer.role})</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
