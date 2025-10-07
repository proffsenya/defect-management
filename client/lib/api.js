import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const API_URL = "http://localhost:8080"; // Убедитесь, что сервер работает на этом порту

// Функция для отправки запросов на сервер
export async function http(url, init) {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const token = user?.id;

  const headers = {
    ...(token && { "Authorization": `Bearer ${token}` }),
    ...init?.headers
  };

  // Не добавляем Content-Type для FormData, браузер сам установит multipart/form-data
  if (!(init?.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${API_URL}${url}`, {
    ...init,
    headers
  });

  if (!res.ok) {
    const errorMessage = await res.text();
    throw new Error(errorMessage);
  }

  // Если ответ пустой (например, статус 204), возвращаем null
  if (res.status === 204 || res.headers.get('content-length') === '0') {
    return null;
  }

  return res.json();
}

// Хук для получения пользователей (только для администраторов)
export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: () => http("/api/users")
  });
}

// Хук для получения инженеров (для выбора исполнителей)
export function useEngineers() {
  return useQuery({
    queryKey: ["engineers"],
    queryFn: () => http("/api/users/engineers")
  });
}

// Хук для получения проектов
export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: () => http("/api/projects")
  });
}

// Хук для получения дефектов с возможностью фильтрации
export function useDefects(query) {
  const params = new URLSearchParams();
  
  for (const [k, v] of Object.entries(query)) {
    if (v !== undefined && v !== null && v !== "") params.set(k, String(v));
  }

  return useQuery({
    queryKey: ["defects", Object.fromEntries(params)],
    queryFn: () => http(`/api/defects?${params.toString()}`)
  });
}

// Хук для получения статистики дефектов
export function useStats() {
  return useQuery({
    queryKey: ["stats"],
    queryFn: () => http("/api/defects/stats")
  });
}

// Хук для создания нового дефекта
export function useCreateDefect() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input) => http("/api/defects", { method: "POST", body: JSON.stringify(input) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["defects"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
    },
    onError: (error) => {
      console.error("Ошибка при создании дефекта:", error.message);  // Логируем ошибку
      alert("Произошла ошибка при создании дефекта"); // Уведомляем пользователя
    }
  });
}


// Хук для обновления дефекта
export function useUpdateDefect() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => http(`/api/defects/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data)
    }),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ["defects"] });
      qc.invalidateQueries({ queryKey: ["defect", id] });
      qc.invalidateQueries({ queryKey: ["stats"] });
    },
    onError: (error) => {
      console.error("Ошибка при обновлении дефекта:", error.message);
    }
  });
}

// Хук для удаления дефекта
export function useDeleteDefect() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => http(`/api/defects/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["defects"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
    },
    onError: (error) => {
      console.error("Ошибка при удалении дефекта:", error.message);
    }
  });
}

// Функция для скачивания CSV с дефектами
export function downloadCsv() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const token = user?.id;
  
  const url = "/api/defects/export";
  const a = document.createElement("a");
  
  // Создаем запрос с авторизацией
  fetch(url, {
    headers: {
      ...(token && { "Authorization": `Bearer ${token}` })
    }
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Ошибка при скачивании файла');
    }
    return response.blob();
  })
  .then(blob => {
    const url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = "defects.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  })
  .catch(error => {
    console.error("Ошибка при скачивании CSV:", error);
    alert("Ошибка при скачивании файла");
  });
}

// Хук для обновления статуса дефекта
export function useUpdateDefectStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, status, reason }) => {
      return http(`/api/defects/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, reason })
      });
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["defects"] });
      queryClient.invalidateQueries({ queryKey: ["defect", id] });
    },
  });
}

// Хук для добавления комментария
export function useAddComment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ defectId, message }) => {
      return http(`/api/defects/${defectId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ message })
      });
    },
    onSuccess: (_, { defectId }) => {
      queryClient.invalidateQueries({ queryKey: ["defect", defectId] });
    },
  });
}

// Хук для добавления вложения
export function useAddAttachment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ defectId, file }) => {
      const formData = new FormData();
      formData.append('file', file);
      
      return http(`/api/defects/${defectId}/attachments`, {
        method: 'POST',
        body: formData,
        headers: {} // Убираем Content-Type, чтобы браузер сам установил multipart/form-data
      });
    },
    onSuccess: (_, { defectId }) => {
      queryClient.invalidateQueries({ queryKey: ["defect", defectId] });
    },
  });
}

// Хук для удаления вложения
export function useRemoveAttachment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ defectId, attachmentId }) => {
      return http(`/api/defects/${defectId}/attachments/${attachmentId}`, {
        method: 'DELETE'
      });
    },
    onSuccess: (_, { defectId }) => {
      queryClient.invalidateQueries({ queryKey: ["defect", defectId] });
    },
  });
}
