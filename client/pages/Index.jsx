import { useMemo, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { DefectFilters } from "@/components/defects/DefectFilters";
import { DefectTable } from "@/components/defects/DefectTable";
import { Analytics } from "@/components/defects/Analytics";
import { CreateDefectDialog } from "@/components/defects/CreateDefectDialog";
import { downloadCsv } from "@/lib/api";

export default function Index() {
  const [filters, setFilters] = useState({ page: 1, pageSize: 20, sort: "createdAt", order: "desc" });
  const [open, setOpen] = useState(false);

  const onSort = (sort) => {
    if (!sort) return;
    setFilters((f) => ({ ...f, sort, order: f.order === "asc" ? "desc" : "asc" }));
  };

  return (
    <AppLayout onCreateClick={() => setOpen(true)} onExportClick={() => downloadCsv()}>
      <section className="mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Центр управления дефектами</h1>
        <p className="text-muted-foreground mt-1 max-w-3xl">
          Полный цикл: регистрация, назначение, контроль статусов, комментарии и отчётность для руководства.
        </p>
      </section>

      <section className="space-y-4">
        <DefectFilters value={filters} onChange={setFilters} />
        <DefectTable query={filters} onSort={onSort} />
      </section>

      <section className="mt-8">
        <Analytics />
      </section>

      <CreateDefectDialog open={open} onOpenChange={setOpen} />
    </AppLayout>
  );
}
