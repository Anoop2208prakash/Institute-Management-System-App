// src/types/index.ts

// --- 1. ENUMS (Must match Prisma exactly) ---
export enum Gender {
  MALE = "MALE",
  FEMALE = "FEMALE",
  OTHER = "OTHER",
}

export enum AttendanceStatus {
  PRESENT = "PRESENT",
  ABSENT = "ABSENT",
  LATE = "LATE",
  EXCUSED = "EXCUSED",
}

export enum LoanStatus {
  ISSUED = "ISSUED",
  RETURNED = "RETURNED",
  OVERDUE = "OVERDUE",
}

export enum ComplaintStatus {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  RESOLVED = "RESOLVED",
}

export enum HostelStatus {
  OCCUPIED = "OCCUPIED",
  VACATED = "VACATED",
}

export enum GatePassStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

// --- 2. AUTH & USER TYPES ---
export interface Role {
  id: string;
  name: string;
  displayName: string;
  description?: string;
}

export interface User {
  id: string;
  email: string;
  avatar?: string;
  roleId: string;
  role?: Role;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// --- 3. PROFILE TYPES ---
export interface Admin {
  id: string;
  userId: string;
  fullName: string;
  phone?: string;
  bloodGroup?: string;
}

export interface Teacher {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  address?: string;
  qualification?: string;
  bloodGroup?: string;
  joiningDate: string;
}

export interface Student {
  id: string;
  userId: string;
  admissionNo: string;
  fullName: string;
  dob: string | Date;
  gender: Gender;
  address?: string;
  phone?: string;
  bloodGroup?: string;
  needsHostel: boolean;
  classId: string;
  class?: Class;
}

// --- 4. ACADEMIC TYPES ---
export interface Class {
  id: string;
  name: string;
  description?: string;
  teacherId?: string;
  students?: Student[];
  subjects?: Subject[];
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  classId: string;
  teacherId?: string;
}

// --- 5. COMPONENT PROPS & API RESPONSES ---
export interface AuthResponse {
  token: string;
  user: User;
  profile: Student | Teacher | Admin;
}

export interface ApiResponse<T> {
  message: string;
  data: T;
  status: number;
}