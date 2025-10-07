import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowDownUp, Edit3, Trash2, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { useDefects } from "@/lib/api";
import { PriorityBadge, StatusBadge } from "./Badges";
import { useAuth } from "@/hooks/use-auth";
import { DeleteDefectDialog } from "./DeleteDefectDialog";
import { EditDefectDialog } from "./EditDefectDialog";

export function DefectTable({ query, onSort }) {
  const { data, isLoading } = useDefects(query);
  const { hasRole, hasAnyRole } = useAuth();
  const [deleteDialog, setDeleteDialog] = useState({ open: false, defect: null });
  const [editDialog, setEditDialog] = useState({ open: false, defect: null });

  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <Head onClick={() => onSort("createdAt")} active={query.sort === "createdAt"}>Создано</Head>
            <Head onClick={() => onSort("title")} active={query.sort === "title"}>Дефект</Head>
            <Head>Статус</Head>
            <Head onClick={() => onSort("priority")} active={query.sort === "priority"}>Приоритет</Head>
            <Head>Исполнитель</Head>
            <Head onClick={() => onSort("dueDate")} active={query.sort === "dueDate"}>Срок</Head>
            <Head>Действия</Head>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && (
            <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Загрузка…</TableCell></TableRow>
          )}
          {!isLoading && data?.items.length === 0 && (
            <TableRow><TableCell colSpan={7} className="text-center py-10 text-muted-foreground">Ничего не найдено</TableCell></TableRow>
          )}
          {data?.items.map((d) => (
            <TableRow key={d.id}>
              <TableCell className="whitespace-nowrap text-muted-foreground">{new Date(d.createdAt).toLocaleDateString()}</TableCell>
              <TableCell className="max-w-[360px]">
                <Link to={`/defects/${d.id}`} className="hover:underline">
                  <div className="font-medium leading-tight">{d.title}</div>
                  <div className="text-xs text-muted-foreground">#{d.id.slice(-6)}</div>
                </Link>
              </TableCell>
              <TableCell><StatusBadge status={d.status} /></TableCell>
              <TableCell><PriorityBadge priority={d.priority} /></TableCell>
              <TableCell className="text-sm text-muted-foreground">{d.assigneeId}</TableCell>
              <TableCell className="whitespace-nowrap">{d.dueDate ? new Date(d.dueDate).toLocaleDateString() : "—"}</TableCell>
              <TableCell className="flex gap-2">
                <Link to={`/defects/${d.id}`}>
                  <Button variant="ghost" size="icon" className="h-8 w-8" title="Просмотр">
                    <Eye className="h-4 w-4" />
                  </Button>
                </Link>
                {/* Редактирование доступно только инженерам и выше */}
                {hasAnyRole(["engineer", "manager", "admin"]) && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8" 
                    title="Редактировать"
                    onClick={() => setEditDialog({ open: true, defect: d })}
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                )}
      {/* Удаление доступно менеджерам и выше */}
      {hasAnyRole(["manager", "admin"]) && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-rose-600" 
                    title="Удалить" 
                    onClick={() => setDeleteDialog({ open: true, defect: d })}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex items-center justify-between px-4 py-3 text-sm text-muted-foreground">
        <div>Всего: {data?.total ?? 0}</div>
        <div className="flex items-center gap-2">
          <span className="hidden md:inline">Страница {data?.page ?? 1}</span>
        </div>
      </div>
      
      <DeleteDefectDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, defect: open ? deleteDialog.defect : null })}
        defect={deleteDialog.defect}
      />
      
      <EditDefectDialog
        open={editDialog.open}
        onOpenChange={(open) => setEditDialog({ open, defect: open ? editDialog.defect : null })}
        defect={editDialog.defect}
      />
    </div>
  );
}

function Head({ children, onClick, active }) {
  return (
    <TableHead>
      <button onClick={onClick} className="inline-flex items-center gap-1">
        {children} {onClick && <ArrowDownUp className={`h-3 w-3 ${active ? "opacity-100" : "opacity-40"}`} />}
      </button>
    </TableHead>
  );
}
