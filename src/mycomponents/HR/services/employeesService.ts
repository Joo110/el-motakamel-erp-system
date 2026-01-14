// services/employeesService.ts
import axiosClient from "@/lib/axiosClient";

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
  department?: string;
  workLocation?: string;
  role?: string;
  level?: string;
  employmentType?: string;
  manager?: string;
  salary?: number | string;
  dateOfEmployment?: string;
  avatar?: string | null;
  [key: string]: any;
}

const BASE = "/employees";

/**
 * جلب قائمة الموظفين
 * يعيد مصفوفة Employee[] حتى لو كان الـ response مغلفاً داخل data.employees
 */
export const getEmployeesService = async (params?: Record<string, any>): Promise<Employee[]> => {
  const response = await axiosClient.get<
    { status?: string; results?: number; data?: { employees?: Employee[] } }
  >(BASE, {
    params,
    headers: { "Cache-Control": "no-cache" },
  });

  const maybeArray = (response.data as any);
  if (Array.isArray(maybeArray)) return maybeArray as Employee[];
  if (maybeArray?.data?.employees && Array.isArray(maybeArray.data.employees)) {
    return maybeArray.data.employees;
  }
  if (maybeArray?.employees && Array.isArray(maybeArray.employees)) {
    return maybeArray.employees;
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
export const getEmployeeByIdService = async (id: string): Promise<Employee> => {
  const res = await axiosClient.get(`${BASE}/${id}`);
  return res.data.data.employee;
};

export const updateEmployeeService = async (id: string, payload: FormData) => {
  try {
    const response = await axiosClient.patch(`/employees/${id}`, payload, {
    });
    return response.data;
  } catch (error) {
    console.error('updateEmployeeService error:', error);
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
  deleteEmployeeService,
};