export type UserRole = 'super_admin' | 'tenant_admin' | 'hr_manager' | 'employee';
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'half_day' | 'leave' | 'holiday' | 'weekend';

export interface Tenant {
  id: string;
  name: string;
  code: string;
  domain: string;
  isActive: boolean;
  logo?: string;
  config: TenantConfig;
  createdAt: string;
}

export interface TenantConfig {
  theme: ThemeConfig;
  enabledModules: string[];
  maxEmployees: number;
}

export interface ThemeConfig {
  mode: 'light' | 'dark';
  primaryColor: string;
  accentColor: string;
  fontFamily: string;
  sidebarStyle: 'default' | 'compact' | 'gradient';
}

export interface User {
  id: string;
  username: string;
  password: string;
  email: string;
  fullName: string;
  role: UserRole;
  tenantId: string;
  avatar?: string;
  isActive: boolean;
}

export interface AuthToken {
  token: string;
  user: Omit<User, 'password'>;
  expiresAt: string;
}

export interface Employee {
  id: string;
  tenantId: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  departmentId: string;
  designationId: string;
  plantId?: string;
  dateOfJoining: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  address: string;
  city: string;
  state: string;
  status: 'active' | 'inactive' | 'offboarded';
  shiftId?: string;
  avatar?: string;
  departmentName?: string;
  designationName?: string;
}

export interface AttendanceRecord {
  id: string;
  tenantId: string;
  employeeId: string;
  date: string;
  status: AttendanceStatus;
  checkIn?: string;
  checkOut?: string;
  shiftId?: string;
  workHours?: number;
  overtime?: number;
  remarks?: string;
  source: 'manual' | 'biometric' | 'system';
}

export interface Department {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  isActive: boolean;
}

export interface Designation {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  level: number;
  isActive: boolean;
}

export interface Holiday {
  id: string;
  tenantId: string;
  name: string;
  date: string;
  type: 'national' | 'regional' | 'company';
  isOptional: boolean;
}

export interface Shift {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  startTime: string;
  endTime: string;
  graceMinutes: number;
  isDefault: boolean;
}

export interface ShiftRoster {
  id: string;
  tenantId: string;
  employeeId: string;
  shiftId: string;
  date: string;
  isOverride: boolean;
}

export interface PunchLog {
  id: string;
  tenantId: string;
  employeeId: string;
  timestamp: string;
  type: 'in' | 'out';
  source: 'biometric' | 'manual' | 'mobile';
  deviceId?: string;
  location?: string;
}

export interface MenuItem {
  id: string;
  label: string;
  icon: string;
  route?: string;
  children?: MenuItem[];
  roles: UserRole[];
  moduleId?: string;
  order: number;
  isActive: boolean;
}

export interface AppModule {
  id: string;
  name: string;
  code: string;
  description: string;
  isActive: boolean;
  icon: string;
}

export interface Role {
  id: string;
  tenantId: string;
  name: string;
  code: UserRole;
  permissions: string[];
  isSystem: boolean;
}

export interface OffboardingRecord {
  id: string;
  tenantId: string;
  employeeId: string;
  initiatedDate: string;
  lastWorkingDate: string;
  reason: string;
  status: 'initiated' | 'in_progress' | 'completed' | 'cancelled';
  checklist: OffboardingCheckItem[];
}

export interface OffboardingCheckItem {
  id: string;
  task: string;
  isCompleted: boolean;
  completedDate?: string;
  assignee: string;
}

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  type?: 'text' | 'date' | 'badge' | 'avatar' | 'actions';
  width?: string;
  badgeMap?: Record<string, string>;
}

export interface DashboardStats {
  totalEmployees: number;
  presentToday: number;
  absentToday: number;
  lateToday: number;
  onLeave: number;
  attendanceRate: number;
  trends: {
    employees: number;
    present: number;
    absent: number;
    late: number;
  };
  quickStats: {
    avgWorkHours: number;
    onTimeRate: number;
    upcomingHolidays: number;
    pendingOffboarding: number;
  };
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
    borderWidth?: number;
    fill?: boolean;
    tension?: number;
  }[];
}
