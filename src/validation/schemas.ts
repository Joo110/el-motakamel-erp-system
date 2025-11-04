// src/validation/schemas.ts
import { z } from "zod";

export const EmployeeSchema = z.object({
  name: z.string().min(2, "Name is required").max(200),
  email: z.string().email("Invalid email").optional(),
  phone: z.string().regex(/^(?:\+?20|0)?1[0-9]{9}$/, "Invalid phone").optional(),
  nationalId: z.string().regex(/^\d{14}$/, "National ID must be 14 digits").optional(),
  jobTitle: z.string().max(100).optional(),
  department: z.string().optional(),
  salary: z.preprocess((v) => (v === "" ? undefined : Number(v)), z.number().nonnegative().optional()),
  dateOfBirth: z.string().optional(),
  dateOfEmployment: z.string().optional(),
  address: z.string().max(500).optional(),
  role: z.string().optional(),
  level: z.string().optional(),
  employmentType: z.string().optional(),
  manager: z.string().optional(),
  alternatePhone: z.string().optional(),
});

export type Employee = z.infer<typeof EmployeeSchema>;

/* Example Product schema */
export const ProductSchema = z.object({
  name: z.string().min(1, "Name required"),
  code: z.string().min(1),
  price: z.preprocess((v) => Number(v), z.number().nonnegative()),
  tax: z.preprocess((v) => Number(v), z.number().min(0).max(100)).optional(),
  stock: z.preprocess((v) => Number(v), z.number().int().nonnegative()),
});
export type Product = z.infer<typeof ProductSchema>;

/* Example Inventory schema */
export const InventorySchema = z.object({
  name: z.string().min(1),
  location: z.string().optional(),
  capacity: z.preprocess((v) => (v === "" ? undefined : Number(v)), z.number().nonnegative().optional()),
});
export type Inventory = z.infer<typeof InventorySchema>;

/* Payroll item schema (example) */
export const PayrollItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  salary: z.preprocess((v) => Number(v), z.number().nonnegative()),
  overtime: z.preprocess((v) => Number(v), z.number().nonnegative()).optional(),
  bonus: z.preprocess((v) => Number(v), z.number().nonnegative()).optional(),
});
export type PayrollItem = z.infer<typeof PayrollItemSchema>;