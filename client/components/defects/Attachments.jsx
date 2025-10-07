import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, File, Image, X, Download } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useAddAttachment, useRemoveAttachment } from "@/lib/api";

export function Attachments({ defectId, attachments = [], onAddAttachment, onRemoveAttachment }) {
  const [uploading, setUploading] = useState(false);
  const { hasAnyRole } = useAuth();
  const addAttachment = useAddAttachment();
  const removeAttachment = useRemoveAttachment();

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    
    try {
      for (const file of files) {
        await addAttachment.mutateAsync({
          defectId,
          file
        });
        
        // Вызываем callback для обновления локального состояния
        const attachment = {
          id: `att_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          size: file.size,
          type: file.type,
          url: URL.createObjectURL(file), // Временная ссылка для демо
          uploadedAt: new Date().toISOString(),
          uploadedBy: "current_user"
        };
        
        onAddAttachment(attachment);
      }
    } catch (error) {
      console.error("Ошибка при загрузке файла:", error);
    }
    
    setUploading(false);
    e.target.value = ""; // Очистить input
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type) => {
    if (type.startsWith('image/')) return <Image className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  const handleRemoveAttachment = async (attachmentId) => {
    try {
      await removeAttachment.mutateAsync({
        defectId,
        attachmentId
      });
      
      // Вызываем callback для обновления локального состояния
      onRemoveAttachment(attachmentId);
    } catch (error) {
      console.error("Ошибка при удалении вложения:", error);
    }
  };

  const canManageAttachments = hasAnyRole(['manager', 'engineer']);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Вложения ({attachments.length})
          {canManageAttachments && (
            <Badge variant="outline" className="text-xs">
              Можете управлять
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Загрузка файлов */}
        {canManageAttachments && (
          <div className="space-y-2">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-4 text-gray-500" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Нажмите для загрузки</span> или перетащите файлы
                </p>
                <p className="text-xs text-gray-500">PNG, JPG, PDF, DOC до 10MB</p>
              </div>
              <input
                type="file"
                multiple
                className="hidden"
                onChange={handleFileUpload}
                disabled={uploading}
                accept="image/*,.pdf,.doc,.docx,.txt"
              />
            </label>
            {uploading && (
              <p className="text-sm text-muted-foreground">Загрузка файлов...</p>
            )}
          </div>
        )}

        {/* Список вложений */}
        <div className="space-y-2">
          {attachments.length === 0 ? (
            <p className="text-sm text-muted-foreground">Вложений нет</p>
          ) : (
            attachments.map((attachment) => (
              <div key={attachment.id} className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="flex-shrink-0">
                  {getFileIcon(attachment.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{attachment.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(attachment.size)} • {new Date(attachment.uploadedAt).toLocaleDateString('ru')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(attachment.url, '_blank')}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  {canManageAttachments && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveAttachment(attachment.id)}
                      disabled={removeAttachment.isLoading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
