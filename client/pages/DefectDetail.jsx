import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Calendar, User, AlertTriangle, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { StatusWorkflow } from "@/components/defects/StatusWorkflow";
import { Comments } from "@/components/defects/Comments";
import { History } from "@/components/defects/History";
import { Attachments } from "@/components/defects/Attachments";
import { DeleteDefectDialog } from "@/components/defects/DeleteDefectDialog";
import { http, useDeleteDefect } from "@/lib/api";

export default function DefectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasAnyRole, isAuthenticated, hasRole } = useAuth();
  const [defect, setDefect] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const deleteDefect = useDeleteDefect();

  useEffect(() => {
    // Загружаем дефект только если пользователь авторизован
    if (isAuthenticated) {
      http(`/api/defects/${id}`)
        .then(data => {
          setDefect(data);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [id, isAuthenticated]);

  const handleStatusChange = (changeData) => {
    // Обновление статуса дефекта
    const updatedDefect = {
      ...defect,
      status: changeData.status,
      updatedAt: changeData.changedAt,
      history: [
        ...(defect.history || []),
        {
          action: `Статус изменен на "${changeData.status}"`,
          timestamp: changeData.changedAt,
          changes: { status: changeData.status },
          reason: changeData.reason
        }
      ]
    };
    
    setDefect(updatedDefect);
    
    // Отправка на сервер
    http(`/api/defects/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: changeData.status })
    });
  };

  const handleAddComment = (comment) => {
    const updatedDefect = {
      ...defect,
      comments: [...(defect.comments || []), comment]
    };
    setDefect(updatedDefect);
  };

  const handleAddAttachment = (attachment) => {
    const updatedDefect = {
      ...defect,
      attachments: [...(defect.attachments || []), attachment]
    };
    setDefect(updatedDefect);
  };

  const handleRemoveAttachment = (attachmentId) => {
    const updatedDefect = {
      ...defect,
      attachments: (defect.attachments || []).filter(att => att.id !== attachmentId)
    };
    setDefect(updatedDefect);
  };

  const handleDeleteDefect = async () => {
    try {
      await deleteDefect.mutateAsync(id);
      navigate('/defects');
    } catch (error) {
      console.error("Ошибка при удалении дефекта:", error);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Загрузка...</div>;
  }

  if (!isAuthenticated) {
    return <div className="min-h-screen flex items-center justify-center">Требуется авторизация</div>;
  }

  if (!defect) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Дефект не найден</h1>
          <Button onClick={() => navigate('/defects')}>
            Вернуться к списку
          </Button>
        </div>
      </div>
    );
  }

  const getPriorityColor = (priority) => {
    const colors = {
      low: "bg-green-100 text-green-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-orange-100 text-orange-800",
      critical: "bg-red-100 text-red-800"
    };
    return colors[priority] || "bg-gray-100 text-gray-800";
  };

  const getStatusColor = (status) => {
    const colors = {
      new: "bg-blue-100 text-blue-800",
      in_progress: "bg-yellow-100 text-yellow-800",
      in_review: "bg-purple-100 text-purple-800",
      closed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800"
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/defects')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{defect.title}</h1>
            <p className="text-muted-foreground">ID: {defect.id}</p>
          </div>
        </div>
        
            {/* Кнопка удаления для менеджеров и выше */}
            {hasAnyRole(["manager", "admin"]) && (
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={() => setDeleteDialog(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Удалить дефект
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Основная информация */}
        <div className="lg:col-span-2 space-y-6">
          {/* Описание */}
          <Card>
            <CardHeader>
              <CardTitle>Описание</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{defect.description}</p>
            </CardContent>
          </Card>

          {/* Комментарии */}
          <Comments
            defectId={defect.id}
            comments={defect.comments || []}
            onAddComment={handleAddComment}
          />

          {/* Вложения */}
          <Attachments
            defectId={defect.id}
            attachments={defect.attachments || []}
            onAddAttachment={handleAddAttachment}
            onRemoveAttachment={handleRemoveAttachment}
          />
        </div>

        {/* Боковая панель */}
        <div className="space-y-6">
          {/* Статус и приоритет */}
          <Card>
            <CardHeader>
              <CardTitle>Информация</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-medium">Приоритет:</span>
                <Badge className={getPriorityColor(defect.priority)}>
                  {defect.priority}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="font-medium">Статус:</span>
                <Badge className={getStatusColor(defect.status)}>
                  {defect.status}
                </Badge>
              </div>

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>Исполнитель: {defect.assigneeName || "Не назначен"}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Создан: {new Date(defect.createdAt).toLocaleDateString('ru')}</span>
                </div>
                
                {defect.dueDate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Срок: {new Date(defect.dueDate).toLocaleDateString('ru')}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Управление статусом */}
          <StatusWorkflow
            defect={defect}
            onStatusChange={handleStatusChange}
          />

          {/* История изменений */}
          <History history={defect.history || []} />
        </div>
      </div>
      
      {/* Диалог удаления */}
      <DeleteDefectDialog
        open={deleteDialog}
        onOpenChange={setDeleteDialog}
        defect={defect}
        onDelete={handleDeleteDefect}
      />
    </div>
  );
}
