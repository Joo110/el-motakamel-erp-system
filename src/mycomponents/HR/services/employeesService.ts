import axiosClient from "@/lib/axiosClient";

export interface EmployeeDocument {
  fileId?: string;
  viewLink?: string;
  downloadLink?: string;
  name?: string;
  [key: string]: any;
}

export interface Employee {
  _id?: string;
  id?: string;
  name?: string;
  jobTitle?: string;
  nationalId?: string;
  address?: string;
  dateOfBirth?: string;
  email?: string;
  phone?: string;
  alternativePhone?: string;
  department?: string | any;
  workLocation?: string;
  role?: string;
  level?: string;
  employmentType?: string;
  manager?: string | any;
  salary?: number | string;
  dateOfEmployment?: string;
  avatar?: string | null;
  active?: boolean;
  documents?: EmployeeDocument[]; // <- documents ممكن تجي من الـ API
  [key: string]: any;
}

const BASE = "/employees";

export const getEmployeesService = async (params?: Record<string, any>): Promise<Employee[]> => {
  const response = await axiosClient.get(BASE, {
    params,
    headers: { "Cache-Control": "no-cache" },
  });

  const payload: any = response.data;

  if (Array.isArray(payload)) {
    return payload as Employee[];
  }
  if (Array.isArray(payload?.data)) {
    return payload.data as Employee[];
  }
  if (Array.isArray(payload?.employees)) {
    return payload.employees as Employee[];
  }
  if (Array.isArray(payload?.data?.employees)) {
    return payload.data.employees as Employee[];
  }

  return [];
};

export const createEmployeeService = async (payload: FormData) => {
  try {
    const response = await axiosClient.post('/employees', payload, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('createEmployeeService error:', error);
    throw error;
  }
};

export const getEmployeeByIdService = async (id: string): Promise<Employee | any> => {
  const res = await axiosClient.get(`${BASE}/${id}`);
  const payload: any = res.data;

  if (payload?.data?.employee) return payload.data.employee;
  if (payload?.data) return payload.data;
  if (payload?.employee) return payload.employee;
  return payload;
};

export const updateEmployeeService = async (id: string, payload: FormData) => {
  try {
    const response = await axiosClient.patch(`/employees/${id}`, payload);
    return response.data;
  } catch (error) {
    console.error('updateEmployeeService error:', error);
    throw error;
  }
};

/**
 * Activate inactive employee
 * PATCH /employees/activate/:id
 * API example returns no body — نُعيد response.data أو null
 */
export const activateEmployeeService = async (id: string): Promise<any> => {
  try {
    const response = await axiosClient.patch(`${BASE}/activate/${id}`, {}, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response?.data ?? null;
  } catch (error) {
    console.error("activateEmployeeService error:", error);
    throw error;
  }
};

export const deleteEmployeeService = async (id: string) => {
  const res = await axiosClient.delete(`${BASE}/${id}`);
  return res.data;
};

export default {
  getEmployeesService,
  createEmployeeService,
  getEmployeeByIdService,
  updateEmployeeService,
  activateEmployeeService,
  deleteEmployeeService,
};
