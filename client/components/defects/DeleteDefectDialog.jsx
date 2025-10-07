import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDeleteDefect } from "@/lib/api";

export function DeleteDefectDialog({ open, onOpenChange, defect, onDelete }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteDefect = useDeleteDefect();

  const handleDelete = async () => {
    if (!defect) return;
    
    setIsDeleting(true);
    try {
      if (onDelete) {
        await onDelete();
      } else {
        await deleteDefect.mutateAsync(defect.id);
      }
      onOpenChange(false);
    } catch (error) {
      console.error("Ошибка при удалении дефекта:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Удаление дефекта</DialogTitle>
          <DialogDescription>
            Вы уверены, что хотите удалить дефект "{defect?.title}"? 
            Это действие нельзя отменить.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isDeleting}>
            Отмена
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete} 
            disabled={isDeleting}
          >
            {isDeleting ? "Удаление..." : "Удалить"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
