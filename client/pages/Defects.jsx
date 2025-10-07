import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { DefectFilters } from "@/components/defects/DefectFilters";
import { DefectTable } from "@/components/defects/DefectTable";
import { CreateDefectDialog } from "@/components/defects/CreateDefectDialog";
import { downloadCsv } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";

export default function DefectsPage() {
  const [filters, setFilters] = useState({
    page: 1,
    pageSize: 20,
    sort: "createdAt",
    order: "desc",
  });
  const [open, setOpen] = useState(false);
  const { hasRole, hasAnyRole } = useAuth();

  const onSort = (sort) => {
    if (!sort) return;
    setFilters((f) => ({
      ...f,
      sort,
      order: f.order === "asc" ? "desc" : "asc",
    }));
  };

  return (
    <AppLayout
      onCreateClick={hasAnyRole(["engineer", "manager", "admin"]) ? () => setOpen(true) : undefined}
      onExportClick={hasAnyRole(["manager", "admin"]) ? () => downloadCsv() : undefined}
    >
      <h1 className="mb-4 text-2xl font-extrabold tracking-tight md:text-3xl">
        Список дефектов
      </h1>
      
      {/* Информация о роли пользователя */}
      <div className="mb-4 p-3 bg-muted rounded-lg">
        <p className="text-sm text-muted-foreground">
          Ваша роль: <span className="font-medium">{JSON.parse(localStorage.getItem("user"))?.role}</span>
        </p>
        {hasRole("observer") && (
          <p className="text-sm text-amber-600 mt-1">
            ⚠️ У вас ограниченный доступ - только просмотр отчетов
          </p>
        )}
      </div>

      <div className="space-y-4">
        <DefectFilters value={filters} onChange={setFilters} />
        <DefectTable query={filters} onSort={onSort} />
      </div>

      {/* Показываем форму создания дефекта только для инженеров и выше */}
      {hasAnyRole(["engineer", "manager", "admin"]) && (
        <CreateDefectDialog open={open} onOpenChange={setOpen} />
      )}

      {/* Дополнительные функции для менеджеров */}
      {hasAnyRole(["manager", "admin"]) && (
        <div className="mt-6 p-4 border rounded-lg bg-card">
          <h3 className="text-lg font-semibold mb-2">Функции менеджера</h3>
          <div className="flex gap-2">
            <button 
              onClick={() => alert("Назначение задач...")}
              className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
            >
              Назначить задачи
            </button>
            <button 
              onClick={() => alert("Управление проектами...")}
              className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
            >
              Управление проектами
            </button>
          </div>
        </div>
      )}

      {/* Функции администратора */}
      {hasRole("admin") && (
        <div className="mt-6 p-4 border rounded-lg bg-red-50">
          <h3 className="text-lg font-semibold mb-2 text-red-800">Функции администратора</h3>
          <div className="flex gap-2">
            <button 
              onClick={() => alert("Управление пользователями...")}
              className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
            >
              Управление пользователями
            </button>
            <button 
              onClick={() => alert("Системные настройки...")}
              className="px-3 py-1 bg-purple-500 text-white rounded text-sm hover:bg-purple-600"
            >
              Системные настройки
            </button>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
