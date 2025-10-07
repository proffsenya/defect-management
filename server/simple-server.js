import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3'; // Подключаем sqlite3 для работы с базой данных
import bcrypt from 'bcryptjs'; // Для хэширования паролей
import { escapeCsv, isoDaysAgo, isoNow, newId, seedDefects } from './routes/utils.js';
import { requireAuth, requireAdmin, requireManager, requireEngineer, requireActiveUser } from './middleware/auth.js';


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
  {
    id: "p3",
    name: "ТЦ Мегаполис",
    code: "MEGA-03",
    location: "Казань",
    stages: [
      { id: "s6", name: "Проектирование", startDate: isoDaysAgo(200), endDate: isoDaysAgo(150) },
      { id: "s7", name: "Строительство", startDate: isoDaysAgo(149), endDate: isoDaysAgo(50) },
      { id: "s8", name: "Отделка", startDate: isoDaysAgo(49), endDate: isoDaysAgo(10) },
      { id: "s9", name: "Запуск", startDate: isoDaysAgo(9) },
    ],
  },
  {
    id: "p4",
    name: "ЖК Золотые Ворота",
    code: "GOLD-04",
    location: "Владимир",
    stages: [
      { id: "s10", name: "Подготовка", startDate: isoDaysAgo(80), endDate: isoDaysAgo(70) },
      { id: "s11", name: "Строительство", startDate: isoDaysAgo(69), endDate: isoDaysAgo(20) },
      { id: "s12", name: "Благоустройство", startDate: isoDaysAgo(19) },
    ],
  },
  {
    id: "p5",
    name: "Офисный комплекс Сити",
    code: "CITY-05",
    location: "Екатеринбург",
    stages: [
      { id: "s13", name: "Проектирование", startDate: isoDaysAgo(150), endDate: isoDaysAgo(100) },
      { id: "s14", name: "Фундамент", startDate: isoDaysAgo(99), endDate: isoDaysAgo(80) },
      { id: "s15", name: "Каркас", startDate: isoDaysAgo(79), endDate: isoDaysAgo(40) },
      { id: "s16", name: "Отделка", startDate: isoDaysAgo(39), endDate: isoDaysAgo(5) },
      { id: "s17", name: "Сдача", startDate: isoDaysAgo(4) },
    ],
  },
  {
    id: "p6",
    name: "Складской комплекс Логистик",
    code: "LOG-06",
    location: "Новосибирск",
    stages: [
      { id: "s18", name: "Подготовка площадки", startDate: isoDaysAgo(90), endDate: isoDaysAgo(80) },
      { id: "s19", name: "Строительство", startDate: isoDaysAgo(79), endDate: isoDaysAgo(30) },
      { id: "s20", name: "Монтаж оборудования", startDate: isoDaysAgo(29), endDate: isoDaysAgo(5) },
      { id: "s21", name: "Тестирование", startDate: isoDaysAgo(4) },
    ],
  },
];

let defects = seedDefects();

const db = new sqlite3.Database('./database.db', (err) => {
  if (err) {
    console.error("Ошибка при подключении к базе данных", err.message);
  } else {
    console.log("Подключение к базе данных успешно");
  }
});

const createUsersTable = () => {
  const query = `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL
    );
  `;
  db.run(query, (err) => {
    if (err) {
      console.error("Ошибка при создании таблицы:", err.message);
    } else {
      console.log("Таблица users создана");
    }
  });
};

// Создание таблицы проектов
const createProjectsTable = () => {
  const query = `
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      code TEXT NOT NULL,
      location TEXT NOT NULL,
      stages TEXT NOT NULL
    );
  `;
  db.run(query, (err) => {
    if (err) {
      console.error("Ошибка при создании таблицы проектов:", err.message);
    } else {
      console.log("Таблица projects создана");
    }
  });
};

// Создание таблицы дефектов
const createDefectsTable = () => {
  const query = `
    CREATE TABLE IF NOT EXISTS defects (
      id TEXT PRIMARY KEY,
      projectId TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      priority TEXT NOT NULL,
      assigneeId TEXT,
      reporterId TEXT NOT NULL,
      status TEXT NOT NULL,
      dueDate TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      attachments TEXT DEFAULT '[]',
      history TEXT DEFAULT '[]',
      comments TEXT DEFAULT '[]'
    );
  `;
  db.run(query, (err) => {
    if (err) {
      console.error("Ошибка при создании таблицы дефектов:", err.message);
    } else {
      console.log("Таблица defects создана");
    }
  });
};

// Инициализация таблиц
createUsersTable();
createProjectsTable();
createDefectsTable();

// Добавление моковых данных проектов в базу данных
const insertMockProjects = () => {
  projects.forEach(project => {
    const stagesJson = JSON.stringify(project.stages);
    db.run(
      "INSERT OR IGNORE INTO projects (id, name, code, location, stages) VALUES (?, ?, ?, ?, ?)",
      [project.id, project.name, project.code, project.location, stagesJson],
      (err) => {
        if (err) {
          console.error("Ошибка при добавлении проекта:", err.message);
        }
      }
    );
  });
};

// Добавление моковых данных дефектов в базу данных
const insertMockDefects = () => {
  defects.forEach(defect => {
    const attachmentsJson = JSON.stringify(defect.attachments || []);
    const historyJson = JSON.stringify(defect.history || []);
    const commentsJson = JSON.stringify(defect.comments || []);
    
    db.run(
      "INSERT OR IGNORE INTO defects (id, projectId, title, description, priority, assigneeId, reporterId, status, dueDate, createdAt, updatedAt, attachments, history, comments) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        defect.id, defect.projectId, defect.title, defect.description, 
        defect.priority, defect.assigneeId, defect.reporterId, defect.status, 
        defect.dueDate, defect.createdAt, defect.updatedAt, 
        attachmentsJson, historyJson, commentsJson
      ],
      (err) => {
        if (err) {
          console.error("Ошибка при добавлении дефекта:", err.message);
        } else {
          console.log(`Дефект ${defect.id} добавлен`);
        }
      }
    );
  });
};

// Добавление тестовых пользователей
const insertTestUsers = () => {
  const testUsers = [
    { email: "admin@example.com", password: "admin123", role: "admin" },
    { email: "manager@example.com", password: "manager123", role: "manager" },
    { email: "engineer@example.com", password: "engineer123", role: "engineer" },
    { email: "user@example.com", password: "user123", role: "user" },
    { email: "observer@example.com", password: "observer123", role: "observer" },
    // Дополнительные инженеры для тестирования
    { email: "ivan.petrov@example.com", password: "engineer123", role: "engineer" },
    { email: "anna.smirnova@example.com", password: "engineer123", role: "engineer" },
    { email: "sergey.kuznetsov@example.com", password: "engineer123", role: "engineer" },
    { email: "elena.volkova@example.com", password: "engineer123", role: "engineer" },
    { email: "dmitry.kozlov@example.com", password: "engineer123", role: "engineer" },
    // Дополнительные менеджеры
    { email: "maria.ivanova@example.com", password: "manager123", role: "manager" },
    { email: "alexey.sidorov@example.com", password: "manager123", role: "manager" },
    // Дополнительные пользователи
    { email: "olga.nikolaeva@example.com", password: "user123", role: "user" },
    { email: "pavel.morozov@example.com", password: "user123", role: "user" }
  ];

  testUsers.forEach(user => {
    bcrypt.hash(user.password, 10, (err, hashedPassword) => {
      if (err) {
        console.error("Ошибка при хэшировании пароля:", err);
        return;
      }

      db.run(
        "INSERT OR IGNORE INTO users (email, password, role) VALUES (?, ?, ?)",
        [user.email, hashedPassword, user.role],
        (err) => {
          if (err) {
            console.error("Ошибка при добавлении тестового пользователя:", err.message);
          } else {
            console.log(`Тестовый пользователь ${user.email} добавлен`);
          }
        }
      );
    });
  });
};

// Добавляем моковые данные
setTimeout(() => {
  insertMockProjects();
  insertMockDefects();
  insertTestUsers();
}, 1000);

// Создание Express приложения
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware для установки пользователя в req.user
app.use((req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader) {
    const token = authHeader.replace('Bearer ', '');
    db.get("SELECT * FROM users WHERE id = ?", [token], (err, user) => {
      req.user = user || null;
      next();
    });
  } else {
    req.user = null;
    next();
  }
});

// Serve static files from dist/spa
app.use(express.static(path.join(__dirname, '../dist/spa')));

// User registration
app.post("/api/register", (req, res) => {
  const { email, password, role } = req.body;

  // Валидация
  if (!email || !password) {
    return res.status(400).json({ message: "Email и пароль обязательны" });
  }

  // Проверка существующего пользователя
  db.get("SELECT * FROM users WHERE email = ?", [email], (err, existingUser) => {
    if (err) {
      console.error("Ошибка при поиске пользователя:", err.message);
      return res.status(500).json({ message: "Ошибка при поиске пользователя" });
    }

    if (existingUser) {
      return res.status(409).json({ message: "Пользователь с таким email уже существует" });
    }

    // Хэширование пароля
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
        return res.status(500).json({ message: "Ошибка при хэшировании пароля" });
      }

      // Создание нового пользователя (без имени и createdAt)
      const newUser = {
        email,
        password: hashedPassword,
        role: role || "user",
      };

      // Сохранение нового пользователя в базу данных
      db.run("INSERT INTO users (email, password, role) VALUES (?, ?, ?)", 
        [newUser.email, newUser.password, newUser.role], 
        function(err) {
          if (err) {
            console.error("Ошибка при добавлении пользователя в базу данных:", err.message);
            return res.status(500).json({ message: "Ошибка при добавлении пользователя" });
          }

          // Возвращаем успешный ответ с данными пользователя (без пароля)
          const { password, ...userWithoutPassword } = newUser;
          res.status(201).json({ message: "Пользователь успешно зарегистрирован", user: userWithoutPassword });
        });
    });
  });
});

// User login
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email и пароль обязательны" });
  }

  // Поиск пользователя
  db.get("SELECT * FROM users WHERE email = ?", [email], (err, user) => {
    if (err) {
      console.error("Ошибка при поиске пользователя:", err.message);
      return res.status(500).json({ message: "Ошибка при поиске пользователя" });
    }

    if (!user) {
      return res.status(401).json({ message: "Неверный email или пароль" });
    }

    // Проверка пароля
    bcrypt.compare(password, user.password, (err, result) => {
      if (err) {
        return res.status(500).json({ message: "Ошибка при проверке пароля" });
      }

      if (!result) {
        return res.status(401).json({ message: "Неверный email или пароль" });
      }

      // Возвращаем пользователя (без пароля)
      const { password, ...userWithoutPassword } = user;
      res.json({ message: "Успешный вход", user: userWithoutPassword });
    });
  });
});

// Get current user (for authorization check)
app.get("/api/me", (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Не авторизован" });
  }

  const token = authHeader.replace('Bearer ', '');
  db.get("SELECT * FROM users WHERE id = ?", [token], (err, user) => {
    if (err || !user) {
      return res.status(401).json({ message: "Не авторизован" });
    }

    const { password, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
  });
});

// Projects data - доступно всем авторизованным пользователям
app.get("/api/projects", requireAuth, (req, res) => {
  db.all("SELECT * FROM projects", (err, rows) => {
    if (err) {
      return res.status(500).json({ message: "Ошибка при получении проектов" });
    }
    
    // Парсим stages из JSON
    const projectsWithStages = rows.map(project => ({
      ...project,
      stages: JSON.parse(project.stages)
    }));
    
    res.json(projectsWithStages);
  });
});

// Статистика дефектов - доступно всем авторизованным пользователям
app.get("/api/defects/stats", requireAuth, (req, res) => {
  console.log("Запрос статистики от пользователя:", req.user?.email);
  
  db.all("SELECT status, priority, createdAt FROM defects", (err, rows) => {
    if (err) {
      console.error("Ошибка при получении статистики:", err);
      return res.status(500).json({ message: "Ошибка при получении статистики" });
    }

    console.log("Найдено дефектов для статистики:", rows.length);

    const byStatus = { new: 0, in_progress: 0, in_review: 0, closed: 0, cancelled: 0 };
    const byPriority = { low: 0, medium: 0, high: 0, critical: 0 };
    const countsMonthly = new Map();

    rows.forEach(d => {
      byStatus[d.status] = (byStatus[d.status] ?? 0) + 1;
      byPriority[d.priority] = (byPriority[d.priority] ?? 0) + 1;
      const month = d.createdAt.slice(0, 7);
      countsMonthly.set(month, (countsMonthly.get(month) ?? 0) + 1);
    });

    const months = Array.from(countsMonthly.entries())
      .sort(([a], [b]) => (a > b ? 1 : -1))
      .map(([month, count]) => ({ month, count }));

    const stats = { byStatus, byPriority, monthlyCreated: months };
    console.log("Отправляем статистику:", stats);
    res.json(stats);
  });
});

// Экспорт дефектов в CSV - только менеджеры и выше
app.get("/api/defects/export", requireManager, (req, res) => {
  const cols = ["id", "projectId", "title", "description", "priority", "assigneeId", "reporterId", "status", "dueDate", "createdAt", "updatedAt"];
  const lines = [cols.join(",")];

  db.all("SELECT * FROM defects", (err, defects) => {
    if (err) {
      return res.status(500).json({ message: "Ошибка при экспорте дефектов" });
    }

    for (const d of defects) {
      const row = cols.map((c) => escapeCsv(d[c] ?? ""));
      lines.push(row.join(","));
    }

    const csv = lines.join("\n");
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename=defects.csv`);
    res.send(csv);
  });
});

// Defects data - доступно всем авторизованным пользователям
app.get("/api/defects/:id", requireAuth, (req, res) => {
  const { id } = req.params;
  
  db.get("SELECT * FROM defects WHERE id = ?", [id], (err, defect) => {
    if (err) {
      return res.status(500).json({ message: "Ошибка при получении дефекта" });
    }
    
    if (!defect) {
      return res.status(404).json({ message: "Defect not found" });
    }
    
    // Парсим JSON поля
    defect.attachments = JSON.parse(defect.attachments || '[]');
    defect.history = JSON.parse(defect.history || '[]');
    defect.comments = JSON.parse(defect.comments || '[]');
    
    res.json(defect);
  });
});

// Создание дефекта - только инженеры и выше
app.post("/api/defects", requireEngineer, (req, res) => {
  const { projectId, title, description, priority, assigneeId, dueDate } = req.body;

  // Валидация обязательных полей
  if (!title || !projectId || !priority) {
    return res.status(400).json({ message: "title, projectId и priority обязательны" });
  }

  const now = isoNow(); // Получаем текущее время
  const def = {
    id: newId("d"), // Генерация нового ID дефекта
    projectId,
    title,
    description,
    priority,
    assigneeId,
    reporterId: "u1", // Здесь можно использовать ID текущего пользователя
    status: "new",
    dueDate,
    createdAt: now,
    updatedAt: now,
    attachments: [], // Вы можете добавить обработку вложений
    history: [],
    comments: [],
  };

  // Сохраняем дефект в базу данных
  const query = `
    INSERT INTO defects (id, projectId, title, description, priority, assigneeId, reporterId, status, dueDate, createdAt, updatedAt, attachments, history, comments)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const attachmentsJson = JSON.stringify(def.attachments || []);
  const historyJson = JSON.stringify(def.history || []);
  const commentsJson = JSON.stringify(def.comments || []);

  db.run(
    query,
    [
      def.id,
      def.projectId,
      def.title,
      def.description,
      def.priority,
      def.assigneeId,
      def.reporterId,
      def.status,
      def.dueDate,
      def.createdAt,
      def.updatedAt,
      attachmentsJson,
      historyJson,
      commentsJson
    ],
    function (err) {
      if (err) {
        console.error("Ошибка при добавлении дефекта:", err.message);
        return res.status(500).json({ message: "Ошибка при добавлении дефекта" });
      }

      res.status(201).json(def); // Ответ с созданным дефектом
    }
  );
});

// Получение списка дефектов - доступно всем авторизованным пользователям
app.get("/api/defects", requireAuth, (req, res) => {
  const { q, status, priority, projectId, assigneeId, sort = "createdAt", order = "desc", page = "1", pageSize = "20" } = req.query;

  let query = "SELECT * FROM defects WHERE 1=1";
  const params = [];

  if (q) {
    query += " AND (title LIKE ? OR description LIKE ?)";
    params.push(`%${q}%`, `%${q}%`);
  }
  if (status) {
    query += " AND status = ?";
    params.push(status);
  }
  if (priority) {
    query += " AND priority = ?";
    params.push(priority);
  }
  if (projectId) {
    query += " AND projectId = ?";
    params.push(projectId);
  }
  if (assigneeId) {
    query += " AND assigneeId = ?";
    params.push(assigneeId);
  }

  // Добавляем сортировку
  const validSortFields = ["createdAt", "title", "priority", "status", "dueDate"];
  const sortField = validSortFields.includes(sort) ? sort : "createdAt";
  const sortOrder = order === "asc" ? "ASC" : "DESC";
  query += ` ORDER BY ${sortField} ${sortOrder}`;

  // Добавляем пагинацию
  const p = Number(page) || 1;
  const ps = Number(pageSize) || 20;
  const offset = (p - 1) * ps;
  query += ` LIMIT ${ps} OFFSET ${offset}`;

  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ message: "Ошибка при получении дефектов" });
    }

    // Получаем общее количество для пагинации
    let countQuery = "SELECT COUNT(*) as total FROM defects WHERE 1=1";
    const countParams = [];
    
    if (q) {
      countQuery += " AND (title LIKE ? OR description LIKE ?)";
      countParams.push(`%${q}%`, `%${q}%`);
    }
    if (status) {
      countQuery += " AND status = ?";
      countParams.push(status);
    }
    if (priority) {
      countQuery += " AND priority = ?";
      countParams.push(priority);
    }
    if (projectId) {
      countQuery += " AND projectId = ?";
      countParams.push(projectId);
    }
    if (assigneeId) {
      countQuery += " AND assigneeId = ?";
      countParams.push(assigneeId);
    }

    db.get(countQuery, countParams, (err, countResult) => {
      if (err) {
        return res.status(500).json({ message: "Ошибка при подсчете дефектов" });
      }

          const response = {
            items: rows,
            total: countResult.total,
            page: p,
            pageSize: ps
          };
          res.json(response);
    });
  });
});

// Получение списка пользователей - только администраторы
app.get("/api/users", requireAdmin, (req, res) => {
  db.all("SELECT id, email, role FROM users", (err, users) => {
    if (err) {
      return res.status(500).json({ message: "Ошибка при получении пользователей" });
    }
    res.json(users);
  });
});

// Получение списка инженеров для выбора исполнителей - доступно всем авторизованным пользователям
app.get("/api/users/engineers", requireAuth, (req, res) => {
  db.all("SELECT id, email, role FROM users WHERE role IN ('engineer', 'manager', 'admin')", (err, users) => {
    if (err) {
      return res.status(500).json({ message: "Ошибка при получении инженеров" });
    }
    
    // Форматируем данные для удобства использования
    const engineers = users.map(user => ({
      id: user.id,
      name: user.email.split('@')[0], // Используем часть email как имя
      email: user.email,
      role: user.role
    }));
    
    res.json(engineers);
  });
});

// Обновление дефекта - только инженеры и выше
app.patch("/api/defects/:id", requireEngineer, (req, res) => {
  const { id } = req.params;
  const { projectId, title, description, priority, assigneeId, dueDate, status } = req.body;

  // Получаем текущий дефект
  db.get("SELECT * FROM defects WHERE id = ?", [id], (err, defect) => {
    if (err) {
      return res.status(500).json({ message: "Ошибка при получении дефекта" });
    }

    if (!defect) {
      return res.status(404).json({ message: "Дефект не найден" });
    }

    // Обновляем дефект
    const updateFields = [];
    const values = [];

    if (projectId !== undefined) {
      updateFields.push("projectId = ?");
      values.push(projectId);
    }
    if (title !== undefined) {
      updateFields.push("title = ?");
      values.push(title);
    }
    if (description !== undefined) {
      updateFields.push("description = ?");
      values.push(description);
    }
    if (priority !== undefined) {
      updateFields.push("priority = ?");
      values.push(priority);
    }
    if (assigneeId !== undefined) {
      updateFields.push("assigneeId = ?");
      values.push(assigneeId);
    }
    if (dueDate !== undefined) {
      updateFields.push("dueDate = ?");
      values.push(dueDate);
    }
    if (status !== undefined) {
      updateFields.push("status = ?");
      values.push(status);
    }

    updateFields.push("updatedAt = ?");
    values.push(new Date().toISOString());
    values.push(id);

    const query = `UPDATE defects SET ${updateFields.join(", ")} WHERE id = ?`;

    db.run(query, values, function(err) {
      if (err) {
        return res.status(500).json({ message: "Ошибка при обновлении дефекта" });
      }

      // Получаем обновленный дефект
      db.get("SELECT * FROM defects WHERE id = ?", [id], (err, updatedDefect) => {
        if (err) {
          return res.status(500).json({ message: "Ошибка при получении обновленного дефекта" });
        }

        // Парсим JSON поля
        updatedDefect.attachments = JSON.parse(updatedDefect.attachments || '[]');
        updatedDefect.history = JSON.parse(updatedDefect.history || '[]');
        updatedDefect.comments = JSON.parse(updatedDefect.comments || '[]');

        res.json(updatedDefect);
      });
    });
  });
});

// Удаление дефекта - менеджеры и выше
app.delete("/api/defects/:id", requireManager, (req, res) => {
  const { id } = req.params;
  
  db.run("DELETE FROM defects WHERE id = ?", [id], function(err) {
    if (err) {
      return res.status(500).json({ message: "Ошибка при удалении дефекта" });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ message: "Дефект не найден" });
    }
    
    res.status(204).end();
  });
});


// Обновление статуса дефекта
app.patch("/api/defects/:id/status", requireAuth, requireEngineer, (req, res) => {
  const { id } = req.params;
  const { status, reason } = req.body;

  if (!status) {
    return res.status(400).json({ message: "Статус обязателен" });
  }

  const validStatuses = ['new', 'in_progress', 'in_review', 'closed', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: "Недопустимый статус" });
  }

  // Получаем текущий дефект
  db.get("SELECT * FROM defects WHERE id = ?", [id], (err, defect) => {
    if (err) {
      return res.status(500).json({ message: "Ошибка при получении дефекта" });
    }

    if (!defect) {
      return res.status(404).json({ message: "Дефект не найден" });
    }

    // Парсим историю
    const history = JSON.parse(defect.history || '[]');
    
    // Добавляем новую запись в историю
    history.push({
      action: `Статус изменен на "${status}"`,
      timestamp: new Date().toISOString(),
      changes: { status: status },
      reason: reason,
      changedBy: req.user.email
    });

    // Обновляем дефект
    db.run(
      "UPDATE defects SET status = ?, history = ?, updatedAt = ? WHERE id = ?",
      [status, JSON.stringify(history), new Date().toISOString(), id],
      function(err) {
        if (err) {
          return res.status(500).json({ message: "Ошибка при обновлении статуса" });
        }

        res.json({ message: "Статус обновлен", status });
      }
    );
  });
});

// Добавление комментария к дефекту
app.post("/api/defects/:id/comments", requireAuth, (req, res) => {
  const { id } = req.params;
  const { message } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({ message: "Сообщение обязательно" });
  }

  // Получаем текущий дефект
  db.get("SELECT * FROM defects WHERE id = ?", [id], (err, defect) => {
    if (err) {
      return res.status(500).json({ message: "Ошибка при получении дефекта" });
    }

    if (!defect) {
      return res.status(404).json({ message: "Дефект не найден" });
    }

    // Парсим комментарии
    const comments = JSON.parse(defect.comments || '[]');
    
    // Добавляем новый комментарий
    const newComment = {
      id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      message: message.trim(),
      authorId: req.user.id,
      authorName: req.user.name,
      createdAt: new Date().toISOString()
    };

    comments.push(newComment);

    // Обновляем дефект
    db.run(
      "UPDATE defects SET comments = ?, updatedAt = ? WHERE id = ?",
      [JSON.stringify(comments), new Date().toISOString(), id],
      function(err) {
        if (err) {
          return res.status(500).json({ message: "Ошибка при добавлении комментария" });
        }

        res.json({ message: "Комментарий добавлен", comment: newComment });
      }
    );
  });
});

// Добавление вложения к дефекту
app.post("/api/defects/:id/attachments", requireAuth, requireEngineer, (req, res) => {
  const { id } = req.params;

  // Получаем текущий дефект
  db.get("SELECT * FROM defects WHERE id = ?", [id], (err, defect) => {
    if (err) {
      return res.status(500).json({ message: "Ошибка при получении дефекта" });
    }

    if (!defect) {
      return res.status(404).json({ message: "Дефект не найден" });
    }

    // Парсим вложения
    const attachments = JSON.parse(defect.attachments || '[]');
    
    // Добавляем новое вложение (в реальном приложении здесь была бы загрузка файла)
    const newAttachment = {
      id: `att_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: req.body.name || "uploaded_file",
      size: req.body.size || 0,
      type: req.body.type || "application/octet-stream",
      url: req.body.url || "#",
      uploadedAt: new Date().toISOString(),
      uploadedBy: req.user.email
    };

    attachments.push(newAttachment);

    // Обновляем дефект
    db.run(
      "UPDATE defects SET attachments = ?, updatedAt = ? WHERE id = ?",
      [JSON.stringify(attachments), new Date().toISOString(), id],
      function(err) {
        if (err) {
          return res.status(500).json({ message: "Ошибка при добавлении вложения" });
        }

        res.json({ message: "Вложение добавлено", attachment: newAttachment });
      }
    );
  });
});

// Удаление вложения из дефекта
app.delete("/api/defects/:id/attachments/:attachmentId", requireAuth, requireEngineer, (req, res) => {
  const { id, attachmentId } = req.params;

  // Получаем текущий дефект
  db.get("SELECT * FROM defects WHERE id = ?", [id], (err, defect) => {
    if (err) {
      return res.status(500).json({ message: "Ошибка при получении дефекта" });
    }

    if (!defect) {
      return res.status(404).json({ message: "Дефект не найден" });
    }

    // Парсим вложения
    const attachments = JSON.parse(defect.attachments || '[]');
    
    // Удаляем вложение
    const filteredAttachments = attachments.filter(att => att.id !== attachmentId);

    if (filteredAttachments.length === attachments.length) {
      return res.status(404).json({ message: "Вложение не найдено" });
    }

    // Обновляем дефект
    db.run(
      "UPDATE defects SET attachments = ?, updatedAt = ? WHERE id = ?",
      [JSON.stringify(filteredAttachments), new Date().toISOString(), id],
      function(err) {
        if (err) {
          return res.status(500).json({ message: "Ошибка при удалении вложения" });
        }

        res.json({ message: "Вложение удалено" });
      }
    );
  });
});


// Catch-all handler: send back React's index.html file for any non-API routes
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../dist/spa/index.html'));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 API endpoints available at /api/*`);
  console.log(`🔐 Auth endpoints: /api/register, /api/login, /api/me`);
});
