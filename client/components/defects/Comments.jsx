import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { useAddComment } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";

export function Comments({ defectId, comments = [], onAddComment }) {
  const [newComment, setNewComment] = useState("");
  const { user } = useAuth();
  const addComment = useAddComment();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    try {
      await addComment.mutateAsync({
        defectId,
        message: newComment
      });
      
      // Вызываем callback для обновления локального состояния
      onAddComment({
        message: newComment,
        authorId: user.id,
        authorName: user.name,
        createdAt: new Date().toISOString()
      });
      
      setNewComment("");
    } catch (error) {
      console.error("Ошибка при добавлении комментария:", error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Комментарии ({comments.length})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Список комментариев */}
        <div className="space-y-3">
          {comments.map((comment, index) => (
            <div key={index} className="flex gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  {comment.authorName?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{comment.authorName}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(comment.createdAt), { 
                      addSuffix: true, 
                      locale: ru 
                    })}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{comment.message}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Форма добавления комментария */}
        <form onSubmit={handleSubmit} className="space-y-2">
          <Textarea
            placeholder="Добавить комментарий..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={3}
          />
          <div className="flex justify-end">
            <Button type="submit" size="sm" disabled={addComment.isLoading}>
              {addComment.isLoading ? "Отправка..." : "Отправить"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
