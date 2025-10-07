import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useProjects, useEngineers, useUpdateDefect } from "@/lib/api";

export function EditDefectDialog({ open, onOpenChange, defect }) {
  const [form, setForm] = useState({
    projectId: "",
    title: "",
    description: "",
    priority: "medium",
    assigneeId: undefined,
    dueDate: undefined,
    status: "new"
  });
  
  const { data: projects } = useProjects();
  const { data: engineers } = useEngineers();
  const updateDefect = useUpdateDefect();

  // Заполняем форму данными дефекта при открытии
  useEffect(() => {
    if (defect && open) {
      setForm({
        projectId: defect.projectId || "",
        title: defect.title || "",
        description: defect.description || "",
        priority: defect.priority || "medium",
        assigneeId: defect.assigneeId || undefined,
        dueDate: defect.dueDate || undefined,
        status: defect.status || "new"
      });
    }
  }, [defect, open]);

  const handleSubmit = async () => {
    if (!form.projectId || !form.title || !defect) return;
    
    try {
      await updateDefect.mutateAsync({
        id: defect.id,
        ...form
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Ошибка при обновлении дефекта:", error);
    }
  };

  if (!defect) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Редактирование дефекта</DialogTitle>
          <DialogDescription>
            Измените необходимые поля дефекта
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Проект</Label>
              <Select value={form.projectId} onValueChange={(v) => setForm({ ...form, projectId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите проект" />
                </SelectTrigger>
                <SelectContent>
                  {projects?.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Статус</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">Новая</SelectItem>
                  <SelectItem value="in_progress">В работе</SelectItem>
                  <SelectItem value="in_review">На проверке</SelectItem>
                  <SelectItem value="closed">Закрыта</SelectItem>
                  <SelectItem value="cancelled">Отменена</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Приоритет</Label>
              <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Низкий</SelectItem>
                  <SelectItem value="medium">Средний</SelectItem>
                  <SelectItem value="high">Высокий</SelectItem>
                  <SelectItem value="critical">Критический</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Исполнитель</Label>
              <Select value={form.assigneeId || "__none__"} onValueChange={(v) => setForm({ ...form, assigneeId: v === "__none__" ? undefined : v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Не назначен" />
                </SelectTrigger>
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
          </div>
          
          <div className="space-y-2">
            <Label>Заголовок</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Короткое описание"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Описание</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
              placeholder="Подробное описание дефекта"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Срок</Label>
            <Input
              type="date"
              value={form.dueDate || ""}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!form.projectId || !form.title || updateDefect.isLoading}
          >
            {updateDefect.isLoading ? "Сохранение..." : "Сохранить"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
