import { escapeCsv, isoDaysAgo, isoNow, newId, seedDefects } from './utils';

// Mock data for projects
let projects = [
  {
    id: "p1",
    name: "ЖК Северный",
    code: "NORTH-01",
    location: "Москва",
    stages: [
      { id: "s1", name: "Фундамент", startDate: isoDaysAgo(120), endDate: isoDaysAgo(90) },
      { id: "s2", name: "Каркас", startDate: isoDaysAgo(89), endDate: isoDaysAgo(30) },
      { id: "s3", name: "Отделка", startDate: isoDaysAgo(29) },
    ],
  },
  {
    id: "p2",
    name: "БЦ Восход",
    code: "SUN-02",
    location: "Санкт-Петербург",
    stages: [
      { id: "s4", name: "Подготовка площадки", startDate: isoDaysAgo(60), endDate: isoDaysAgo(55) },
      { id: "s5", name: "Монтаж", startDate: isoDaysAgo(54) },
    ],
  },
];

// Mock data for defects
let defects = seedDefects();

// List of users (for assigning to defects)
let users = [
  { id: "u1", name: "Анна Смирнова", email: "anna@example.com", role: "manager" },
  { id: "u2", name: "Иван Петров", email: "ivan@example.com", role: "engineer" },
  { id: "u3", name: "Ольга Кузнецова", email: "olga@example.com", role: "observer" },
];

// Route handlers

// List all users
export const listUsers = (req, res) => {
  res.json(users);
};

// List all projects
export const listProjects = (req, res) => {
  res.json(projects);
};

// List all defects with query filters
export const listDefects = (req, res) => {
  const { q, status, priority, projectId, assigneeId, sort = "createdAt", order = "desc", page = "1", pageSize = "20" } = req.query;

  let data = defects.slice();
  if (q) {
    const qq = q.toLowerCase();
    data = data.filter(d =>
      d.title.toLowerCase().includes(qq) ||
      (d.description?.toLowerCase().includes(qq) ?? false)
    );
  }
  if (status) data = data.filter(d => d.status === status);
  if (priority) data = data.filter(d => d.priority === priority);
  if (projectId) data = data.filter(d => d.projectId === projectId);
  if (assigneeId) data = data.filter(d => d.assigneeId === assigneeId);

  data.sort((a, b) => {
    const dir = order === "asc" ? 1 : -1;
    const av = a[sort] ?? 0;
    const bv = b[sort] ?? 0;
    if (av === bv) return 0;
    return av > bv ? dir : -dir;
  });

  const p = Number(page) || 1;
  const ps = Number(pageSize) || 20;
  const start = (p - 1) * ps;
  const items = data.slice(start, start + ps);

  const response = { items, total: data.length, page: p, pageSize: ps };
  res.json(response);
};

// Create a new defect
export const createDefect = (req, res) => {
  const body = req.body;

  // Validate required fields
  if (!body?.title || !body?.projectId || !body?.priority) {
    return res.status(400).json({ message: "title, projectId and priority are required" });
  }

  const now = isoNow();
  const def = {
    id: newId("d"),
    projectId: body.projectId,
    title: body.title,
    description: body.description,
    priority: body.priority,
    assigneeId: body.assigneeId,
    reporterId: users[0].id,
    status: "new",
    dueDate: body.dueDate,
    createdAt: now,
    updatedAt: now,
    attachments: body.attachments ?? [],
    history: [],
    comments: [],
  };

  // Add the new defect to the defects array
  defects.unshift(def);

  console.log("Создан новый дефект:", def);

  // Respond with the newly created defect
  res.status(201).json(def);
};

// Update an existing defect
export const updateDefect = (req, res) => {
  const { id } = req.params;
  const body = req.body;
  const idx = defects.findIndex(d => d.id === id);

  if (idx === -1) return res.status(404).json({ message: "Defect not found" });

  const next = { ...defects[idx], ...body, updatedAt: isoNow() };
  defects[idx] = next;

  res.json(next);
};

// Delete a defect
export const deleteDefect = (req, res) => {
  const { id } = req.params;
  const idx = defects.findIndex(d => d.id === id);

  if (idx === -1) return res.status(404).json({ message: "Defect not found" });

  defects.splice(idx, 1);
  console.log(`Дефект с id ${id} удален`);

  res.status(204).end(); // No content status after successful deletion
};

// Export defects to CSV
export const exportDefectsCsv = (req, res) => {
  const cols = ["id", "projectId", "title", "description", "priority", "assigneeId", "reporterId", "status", "dueDate", "createdAt", "updatedAt"];
  const lines = [cols.join(",")];

  for (const d of defects) {
    const row = cols.map((c) => escapeCsv(d[c] ?? ""));
    lines.push(row.join(","));
  }

  const csv = lines.join("\n");
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename=defects.csv`);
  res.send(csv);
};

// Get statistics for defects
export const getStats = (req, res) => {
  const byStatus = { new: 0, in_progress: 0, in_review: 0, closed: 0, cancelled: 0 };
  const byPriority = { low: 0, medium: 0, high: 0, critical: 0 };

  const countsMonthly = new Map();
  for (const d of defects) {
    byStatus[d.status] = (byStatus[d.status] ?? 0) + 1;
    byPriority[d.priority] = (byPriority[d.priority] ?? 0) + 1;
    const month = d.createdAt.slice(0, 7);
    countsMonthly.set(month, (countsMonthly.get(month) ?? 0) + 1);
  }

  const months = Array.from(countsMonthly.entries())
    .sort(([a], [b]) => (a > b ? 1 : -1))
    .map(([month, count]) => ({ month, count }));

  const stats = { byStatus, byPriority, monthlyCreated: months };
  res.json(stats);
};
