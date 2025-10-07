import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useCreateDefect, useProjects, useEngineers } from "@/lib/api";

export function CreateDefectDialog({ open, onOpenChange }) {
  const createDefect = useCreateDefect(); // Хук для создания дефекта
  const { data: projects } = useProjects();
  const { data: engineers } = useEngineers();

  const [form, setForm] = useState({ projectId: "", title: "", description: "", priority: "medium", assigneeId: undefined, dueDate: undefined });

  const submit = async () => {
    if (!form.projectId || !form.title) return; // Проверка на обязательные поля
    try {
      await createDefect.mutateAsync(form); // Отправка данных на сервер
      onOpenChange(false); // Закрытие диалога после отправки
      setForm({ projectId: "", title: "", description: "", priority: "medium", assigneeId: undefined, dueDate: undefined }); // Очистка формы
    } catch (error) {
      console.error("Ошибка при создании дефекта:", error);
      // Ошибка уже обрабатывается в useCreateDefect хуке
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Новый дефект</DialogTitle>
          <DialogDescription>Заполните ключевые поля для регистрации дефекта</DialogDescription>
        </DialogHeader>
        <div className="py-2 space-y-3">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <Label>Проект</Label>
              <Select value={form.projectId} onValueChange={(v) => setForm({ ...form, projectId: v })}>
                <SelectTrigger><SelectValue placeholder="Выберите проект" /></SelectTrigger>
                <SelectContent>
                  {projects?.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Приоритет</Label>
              <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Низкий</SelectItem>
                  <SelectItem value="medium">Средний</SelectItem>
                  <SelectItem value="high">Высокий</SelectItem>
                  <SelectItem value="critical">Критический</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1">
            <Label>Заголовок</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Короткое описание" />
          </div>
          <div className="space-y-1">
            <Label>Описание</Label>
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} placeholder="Подробное описание дефекта" />
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <Label>Исполнитель</Label>
              <Select value={form.assigneeId || "__none__"} onValueChange={(v) => setForm({ ...form, assigneeId: v === "__none__" ? undefined : v })}>
                <SelectTrigger><SelectValue placeholder="Не назначен" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Не назначен</SelectItem>
                  {engineers?.map((engineer) => (
                    <SelectItem key={engineer.id} value={engineer.id}>
                      {engineer.name} ({engineer.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Срок</Label>
              <Input type="date" value={form.dueDate ?? ""} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Отмена</Button>
          <Button onClick={submit} disabled={!form.projectId || !form.title || createDefect.isLoading}>Создать</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
