// Middleware для проверки аутентификации и ролей

// Проверка аутентификации
export const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Требуется аутентификация" });
  }
  next();
};

// Проверка роли администратора
export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: "Требуются права администратора" });
  }
  next();
};

// Проверка роли менеджера или выше
export const requireManager = (req, res, next) => {
  const allowedRoles = ['admin', 'manager'];
  if (!req.user || !allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ message: "Требуются права менеджера или выше" });
  }
  next();
};

// Проверка роли инженера или выше
export const requireEngineer = (req, res, next) => {
  const allowedRoles = ['admin', 'manager', 'engineer'];
  if (!req.user || !allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ message: "Требуются права инженера или выше" });
  }
  next();
};

// Проверка любой роли кроме наблюдателя
export const requireActiveUser = (req, res, next) => {
  const allowedRoles = ['admin', 'manager', 'engineer', 'user'];
  if (!req.user || !allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ message: "Недостаточно прав для выполнения операции" });
  }
  next();
};

// Проверка конкретной роли
export const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ message: `Требуется роль: ${role}` });
    }
    next();
  };
};

// Проверка одной из ролей
export const requireAnyRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: `Требуется одна из ролей: ${roles.join(', ')}` });
    }
    next();
  };
};
