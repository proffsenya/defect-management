export function newId(prefix) {
  return `${prefix}_${Math.random().toString(36).substr(2, 9)}`;
}

export function isoNow() {
  return new Date().toISOString();
}

export function isoDaysAgo(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

export function escapeCsv(str) {
  if (str == null) return "";
  const s = String(str);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function seedDefects() {
  const now = isoNow();
  const users = ["u1", "u2", "u3", "u4", "u5", "u6", "u7", "u8", "u9", "u10"];
  const projects = ["p1", "p2", "p3", "p4", "p5", "p6"];
  const statuses = ["new", "in_progress", "in_review", "closed", "cancelled"];
  const priorities = ["low", "medium", "high", "critical"];

  const defects = [];
  
  // Создаем 50 моковых дефектов для лучшей статистики
  for (let i = 1; i <= 50; i++) {
    const createdDaysAgo = Math.floor(Math.random() * 180); // За последние 6 месяцев
    const created = isoDaysAgo(createdDaysAgo);
    
    // Создаем более реалистичное распределение статусов
    let status;
    const statusRand = Math.random();
    if (statusRand < 0.15) status = "new";
    else if (statusRand < 0.45) status = "in_progress";
    else if (statusRand < 0.65) status = "in_review";
    else if (statusRand < 0.90) status = "closed";
    else status = "cancelled";
    
    // Создаем более реалистичное распределение приоритетов
    let priority;
    const priorityRand = Math.random();
    if (priorityRand < 0.10) priority = "critical";
    else if (priorityRand < 0.30) priority = "high";
    else if (priorityRand < 0.70) priority = "medium";
    else priority = "low";
    
    defects.push({
      id: `d_${i.toString().padStart(3, '0')}`,
      projectId: projects[Math.floor(Math.random() * projects.length)],
      title: `Дефект ${i}: ${getRandomTitle()}`,
      description: `Подробное описание дефекта ${i}. ${getRandomDescription()}`,
      priority: priority,
      assigneeId: Math.random() > 0.2 ? users[Math.floor(Math.random() * users.length)] : null,
      reporterId: users[Math.floor(Math.random() * users.length)],
      status: status,
      dueDate: Math.random() > 0.4 ? isoDaysAgo(-Math.floor(Math.random() * 60)) : null,
      createdAt: created,
      updatedAt: created,
      attachments: [],
      history: [],
      comments: [],
    });
  }

  return defects;
}

function getRandomTitle() {
  const titles = [
    "Трещина в стене",
    "Протечка воды",
    "Неровная поверхность",
    "Отсутствует изоляция",
    "Поврежденная проводка",
    "Некачественная покраска",
    "Скол на плитке",
    "Неправильная установка",
    "Отсутствует крепление",
    "Деформация материала"
  ];
  return titles[Math.floor(Math.random() * titles.length)];
}

function getRandomDescription() {
  const descriptions = [
    "Требуется немедленное устранение",
    "Не влияет на функциональность",
    "Критический дефект безопасности",
    "Может привести к дальнейшим проблемам",
    "Требует замены материала",
    "Необходима консультация специалиста"
  ];
  return descriptions[Math.floor(Math.random() * descriptions.length)];
}
