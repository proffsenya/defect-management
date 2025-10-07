import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";
import { useUpdateDefectStatus } from "@/lib/api";
import { CheckCircle, Clock, AlertCircle, XCircle, Eye } from "lucide-react";

export function StatusWorkflow({ defect, onStatusChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [reason, setReason] = useState("");
  const { hasAnyRole } = useAuth();
  const updateStatus = useUpdateDefectStatus();

  const statusConfig = {
    new: {
      label: "Новая",
      color: "bg-blue-100 text-blue-800",
      icon: AlertCircle,
      nextStatuses: ["in_progress", "cancelled"],
      allowedRoles: ["manager", "engineer"]
    },
    in_progress: {
      label: "В работе", 
      color: "bg-yellow-100 text-yellow-800",
      icon: Clock,
      nextStatuses: ["in_review", "cancelled"],
      allowedRoles: ["engineer"]
    },
    in_review: {
      label: "На проверке",
      color: "bg-purple-100 text-purple-800", 
      icon: Eye,
      nextStatuses: ["closed", "in_progress"],
      allowedRoles: ["manager"]
    },
    closed: {
      label: "Закрыта",
      color: "bg-green-100 text-green-800",
      icon: CheckCircle,
      nextStatuses: [],
      allowedRoles: []
    },
    cancelled: {
      label: "Отменена",
      color: "bg-red-100 text-red-800",
      icon: XCircle,
      nextStatuses: [],
      allowedRoles: []
    }
  };

  const currentConfig = statusConfig[defect.status];
  const canChangeStatus = hasAnyRole(currentConfig.allowedRoles);

  const handleStatusChange = async () => {
    if (!newStatus) return;
    
    try {
      await updateStatus.mutateAsync({
        id: defect.id,
        status: newStatus,
        reason: reason
      });
      
      // Вызываем callback для обновления локального состояния
      onStatusChange({
        status: newStatus,
        reason: reason,
        changedAt: new Date().toISOString()
      });
      
      setIsOpen(false);
      setNewStatus("");
      setReason("");
    } catch (error) {
      console.error("Ошибка при обновлении статуса:", error);
    }
  };

  const getStatusOptions = () => {
    return currentConfig.nextStatuses.map(status => ({
      value: status,
      label: statusConfig[status].label
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Управление статусом
          <Badge className={currentConfig.color}>
            {currentConfig.label}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Текущий статус */}
        <div className="flex items-center gap-2">
          <currentConfig.icon className="h-5 w-5" />
          <span className="font-medium">Текущий статус: {currentConfig.label}</span>
        </div>

        {/* Workflow диаграмма */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Возможные переходы:</h4>
          <div className="flex flex-wrap gap-2">
            {currentConfig.nextStatuses.map(status => {
              const config = statusConfig[status];
              return (
                <Badge key={status} variant="outline" className="text-xs">
                  {config.label}
                </Badge>
              );
            })}
          </div>
        </div>

        {/* Кнопка изменения статуса */}
        {canChangeStatus && currentConfig.nextStatuses.length > 0 && (
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                Изменить статус
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Изменение статуса дефекта</DialogTitle>
                <DialogDescription>
                  Выберите новый статус и укажите причину изменения
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Новый статус</label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите статус" />
                    </SelectTrigger>
                    <SelectContent>
                      {getStatusOptions().map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Причина изменения</label>
                  <Textarea
                    placeholder="Укажите причину изменения статуса..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Отмена
                </Button>
                <Button onClick={handleStatusChange} disabled={!newStatus || updateStatus.isLoading}>
                  {updateStatus.isLoading ? "Сохранение..." : "Изменить статус"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {!canChangeStatus && (
          <p className="text-sm text-muted-foreground">
            У вас нет прав для изменения статуса этого дефекта
          </p>
        )}
      </CardContent>
    </Card>
  );
}
