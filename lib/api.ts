import type {
  ApiResponse,
  AuthTokens,
  User,
  Employee,
  CreateEmployeeData,
  UpdateEmployeeData,
  Department,
  CreateDepartmentData,
  UpdateDepartmentData,
  Position,
  CreatePositionData,
  UpdatePositionData,
  Vacation,
  CreateVacationData,
  UpdateVacationData,
  HRRequest,
  CreateRequestData,
  UpdateRequestData,
  SystemUser,
  CreateUserData,
  UpdateUserData,
  DashboardSummary,
  RecentActivity,
  LoginCredentials,
} from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

let accessToken: string | null =
  typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
let refreshToken: string | null =
  typeof window !== "undefined" ? localStorage.getItem("refresh_token") : null;

export function setTokens(tokens: AuthTokens | null) {
  if (tokens) {
    accessToken = tokens.access_token;
    refreshToken = tokens.refresh_token;
    localStorage.setItem("access_token", accessToken);
    localStorage.setItem("refresh_token", refreshToken);
  } else {
    accessToken = null;
    refreshToken = null;
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  }
}

export function getAccessToken() {
  return accessToken;
}

async function refreshAccessToken(): Promise<boolean> {
  if (!refreshToken) return false;

  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) return false;

    const data: ApiResponse<AuthTokens> = await response.json();
    setTokens(data.data);
    return true;
  } catch {
    return false;
  }
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (accessToken) {
    (headers as Record<string, string>)["Authorization"] =
      `Bearer ${accessToken}`;
  }

  let response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Handle 401 - try to refresh token
  if (response.status === 401 && refreshToken) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      (headers as Record<string, string>)["Authorization"] =
        `Bearer ${accessToken}`;
      response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
      });
    }
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw {
      statusCode: body?.error?.statusCode ?? response.status,
      message: body?.message ?? "Erro de conexão com o servidor",
      error: body?.error?.error ?? "NetworkError",
    };
  }

  return response.json();
}

// Auth API
export const authApi = {
  login: async (
    credentials: LoginCredentials,
  ): Promise<ApiResponse<AuthTokens & { user: User }>> => {
    const response = await apiRequest<ApiResponse<AuthTokens & { user: User }>>(
      "/auth/login",
      {
        method: "POST",
        body: JSON.stringify(credentials),
      },
    );
    setTokens({
      access_token: response.data.access_token,
      refresh_token: response.data.refresh_token,
    });
    return response;
  },

  logout: async (): Promise<void> => {
    try {
      await apiRequest("/auth/logout", { method: "POST" });
    } finally {
      setTokens(null);
    }
  },

  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    return apiRequest<ApiResponse<User>>("/auth/me");
  },
};

// Employees API
export const employeesApi = {
  getAll: async (): Promise<ApiResponse<Employee[]>> => {
    return apiRequest<ApiResponse<Employee[]>>("/employees");
  },

  getById: async (id: string): Promise<ApiResponse<Employee>> => {
    return apiRequest<ApiResponse<Employee>>(`/employees/${id}`);
  },

  create: async (data: CreateEmployeeData): Promise<ApiResponse<Employee>> => {
    return apiRequest<ApiResponse<Employee>>("/employees", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update: async (
    id: string,
    data: UpdateEmployeeData,
  ): Promise<ApiResponse<Employee>> => {
    return apiRequest<ApiResponse<Employee>>(`/employees/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    return apiRequest<ApiResponse<void>>(`/employees/${id}`, {
      method: "DELETE",
    });
  },
};

// Departments API
export const departmentsApi = {
  getAll: async (): Promise<ApiResponse<Department[]>> => {
    return apiRequest<ApiResponse<Department[]>>("/departments");
  },

  getById: async (id: string): Promise<ApiResponse<Department>> => {
    return apiRequest<ApiResponse<Department>>(`/departments/${id}`);
  },

  create: async (
    data: CreateDepartmentData,
  ): Promise<ApiResponse<Department>> => {
    return apiRequest<ApiResponse<Department>>("/departments", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update: async (
    id: string,
    data: UpdateDepartmentData,
  ): Promise<ApiResponse<Department>> => {
    return apiRequest<ApiResponse<Department>>(`/departments/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    return apiRequest<ApiResponse<void>>(`/departments/${id}`, {
      method: "DELETE",
    });
  },
};

// Positions API
export const positionsApi = {
  getAll: async (): Promise<ApiResponse<Position[]>> => {
    return apiRequest<ApiResponse<Position[]>>("/positions");
  },

  getById: async (id: string): Promise<ApiResponse<Position>> => {
    return apiRequest<ApiResponse<Position>>(`/positions/${id}`);
  },

  create: async (data: CreatePositionData): Promise<ApiResponse<Position>> => {
    return apiRequest<ApiResponse<Position>>("/positions", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update: async (
    id: string,
    data: UpdatePositionData,
  ): Promise<ApiResponse<Position>> => {
    return apiRequest<ApiResponse<Position>>(`/positions/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    return apiRequest<ApiResponse<void>>(`/positions/${id}`, {
      method: "DELETE",
    });
  },
};

// Vacations API
export const vacationsApi = {
  getAll: async (): Promise<ApiResponse<Vacation[]>> => {
    return apiRequest<ApiResponse<Vacation[]>>("/vacations");
  },

  getById: async (id: string): Promise<ApiResponse<Vacation>> => {
    return apiRequest<ApiResponse<Vacation>>(`/vacations/${id}`);
  },

  create: async (data: CreateVacationData): Promise<ApiResponse<Vacation>> => {
    return apiRequest<ApiResponse<Vacation>>("/vacations", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update: async (
    id: string,
    data: UpdateVacationData,
  ): Promise<ApiResponse<Vacation>> => {
    return apiRequest<ApiResponse<Vacation>>(`/vacations/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    return apiRequest<ApiResponse<void>>(`/vacations/${id}`, {
      method: "DELETE",
    });
  },
};

// Requests API
export const requestsApi = {
  getAll: async (): Promise<ApiResponse<HRRequest[]>> => {
    return apiRequest<ApiResponse<HRRequest[]>>("/requests");
  },

  getById: async (id: string): Promise<ApiResponse<HRRequest>> => {
    return apiRequest<ApiResponse<HRRequest>>(`/requests/${id}`);
  },

  create: async (data: CreateRequestData): Promise<ApiResponse<HRRequest>> => {
    return apiRequest<ApiResponse<HRRequest>>("/requests", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update: async (
    id: string,
    data: UpdateRequestData,
  ): Promise<ApiResponse<HRRequest>> => {
    return apiRequest<ApiResponse<HRRequest>>(`/requests/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  approve: async (id: string): Promise<ApiResponse<HRRequest>> => {
    return apiRequest<ApiResponse<HRRequest>>(`/requests/${id}/approve`, {
      method: "PATCH",
    });
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    return apiRequest<ApiResponse<void>>(`/requests/${id}`, {
      method: "DELETE",
    });
  },
};

// Users API
export const usersApi = {
  getAll: async (): Promise<ApiResponse<SystemUser[]>> => {
    return apiRequest<ApiResponse<SystemUser[]>>("/users");
  },

  getById: async (id: string): Promise<ApiResponse<SystemUser>> => {
    return apiRequest<ApiResponse<SystemUser>>(`/users/${id}`);
  },

  create: async (data: CreateUserData): Promise<ApiResponse<SystemUser>> => {
    return apiRequest<ApiResponse<SystemUser>>("/users", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update: async (
    id: string,
    data: UpdateUserData,
  ): Promise<ApiResponse<SystemUser>> => {
    return apiRequest<ApiResponse<SystemUser>>(`/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    return apiRequest<ApiResponse<void>>(`/users/${id}`, {
      method: "DELETE",
    });
  },
};

// Dashboard API
export const dashboardApi = {
  getSummary: async (): Promise<ApiResponse<DashboardSummary>> => {
    return apiRequest<ApiResponse<DashboardSummary>>("/dashboard/summary");
  },

  getRecentActivity: async (): Promise<ApiResponse<RecentActivity[]>> => {
    return apiRequest<ApiResponse<RecentActivity[]>>("/dashboard/activity");
  },
};
