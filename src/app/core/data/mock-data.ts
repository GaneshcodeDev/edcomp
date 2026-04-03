import {
  Tenant, User, Employee, AttendanceRecord, Department, Designation,
  Holiday, Shift, ShiftRoster, PunchLog, MenuItem, AppModule, Role,
  OffboardingRecord
} from '../models';

export const MOCK_TENANTS: Tenant[] = [
  {
    id: 't1', name: 'Acme Corp', code: 'ACME', domain: 'acme.attendease.com',
    isActive: true, createdAt: '2024-01-01',
    config: {
      theme: { mode: 'light', primaryColor: '#4F46E5', accentColor: '#7C3AED', fontFamily: 'Inter', sidebarStyle: 'gradient' },
      enabledModules: ['employees', 'attendance', 'reports', 'offboarding', 'masters', 'configuration'],
      maxEmployees: 500
    }
  },
  {
    id: 't2', name: 'TechVista Solutions', code: 'TVST', domain: 'techvista.attendease.com',
    isActive: true, createdAt: '2024-03-15',
    config: {
      theme: { mode: 'light', primaryColor: '#0EA5E9', accentColor: '#8B5CF6', fontFamily: 'Inter', sidebarStyle: 'default' },
      enabledModules: ['employees', 'attendance', 'reports'],
      maxEmployees: 200
    }
  },
  {
    id: 't3', name: 'Global Industries', code: 'GIND', domain: 'global.attendease.com',
    isActive: false, createdAt: '2024-06-20',
    config: {
      theme: { mode: 'light', primaryColor: '#059669', accentColor: '#D97706', fontFamily: 'Roboto', sidebarStyle: 'compact' },
      enabledModules: ['employees', 'attendance'],
      maxEmployees: 100
    }
  }
];

export const MOCK_USERS: User[] = [
  { id: 'U1', username: 'superadmin', password: 'admin123', email: 'super@attendease.com', fullName: 'Super Admin', role: 'super_admin', tenantId: 't1', isActive: true },
  { id: 'U2', username: 'acmeadmin', password: 'admin123', email: 'admin@acme.com', fullName: 'Acme Admin', role: 'tenant_admin', tenantId: 't1', isActive: true },
  { id: 'U3', username: 'techadmin', password: 'admin123', email: 'admin@techvista.com', fullName: 'Tech Admin', role: 'tenant_admin', tenantId: 't2', isActive: true },
  { id: 'U4', username: 'hrmanager', password: 'admin123', email: 'hr@acme.com', fullName: 'Priya Sharma', role: 'hr_manager', tenantId: 't1', isActive: true },
  { id: 'U5', username: 'john.doe', password: 'user123', email: 'john@acme.com', fullName: 'John Doe', role: 'employee', tenantId: 't1', isActive: true },
  { id: 'U6', username: 'jane.smith', password: 'user123', email: 'jane@techvista.com', fullName: 'Jane Smith', role: 'employee', tenantId: 't2', isActive: true },
];

export const MOCK_DEPARTMENTS: Department[] = [
  { id: 'D1', tenantId: 't1', name: 'Engineering', code: 'ENG', isActive: true },
  { id: 'D2', tenantId: 't1', name: 'Human Resources', code: 'HR', isActive: true },
  { id: 'D3', tenantId: 't1', name: 'Finance', code: 'FIN', isActive: true },
  { id: 'D4', tenantId: 't1', name: 'Operations', code: 'OPS', isActive: true },
  { id: 'D5', tenantId: 't1', name: 'Sales & Marketing', code: 'SAL', isActive: true },
  { id: 'D6', tenantId: 't2', name: 'Engineering', code: 'ENG', isActive: true },
  { id: 'D7', tenantId: 't2', name: 'Human Resources', code: 'HR', isActive: true },
  { id: 'D8', tenantId: 't2', name: 'Finance', code: 'FIN', isActive: true },
  { id: 'D9', tenantId: 't2', name: 'Operations', code: 'OPS', isActive: true },
  { id: 'D10', tenantId: 't2', name: 'Product', code: 'PRD', isActive: true },
];

export const MOCK_DESIGNATIONS: Designation[] = [
  { id: 'DG1', tenantId: 't1', name: 'Director', code: 'DIR', level: 1, isActive: true },
  { id: 'DG2', tenantId: 't1', name: 'Manager', code: 'MGR', level: 2, isActive: true },
  { id: 'DG3', tenantId: 't1', name: 'Senior Engineer', code: 'SE', level: 3, isActive: true },
  { id: 'DG4', tenantId: 't1', name: 'Junior Engineer', code: 'JE', level: 4, isActive: true },
  { id: 'DG5', tenantId: 't1', name: 'Intern', code: 'INT', level: 5, isActive: true },
  { id: 'DG6', tenantId: 't2', name: 'Director', code: 'DIR', level: 1, isActive: true },
  { id: 'DG7', tenantId: 't2', name: 'Manager', code: 'MGR', level: 2, isActive: true },
  { id: 'DG8', tenantId: 't2', name: 'Senior Engineer', code: 'SE', level: 3, isActive: true },
  { id: 'DG9', tenantId: 't2', name: 'Junior Engineer', code: 'JE', level: 4, isActive: true },
  { id: 'DG10', tenantId: 't2', name: 'Intern', code: 'INT', level: 5, isActive: true },
];

export const MOCK_EMPLOYEES: Employee[] = [
  // Acme Corp (t1) - 14 employees
  { id: 'E1', tenantId: 't1', employeeCode: 'ACM001', firstName: 'John', lastName: 'Doe', email: 'john@acme.com', phone: '555-0101', departmentId: 'D1', designationId: 'DG3', dateOfJoining: '2023-03-15', dateOfBirth: '1990-05-20', gender: 'male', address: '123 Main St', city: 'New York', state: 'NY', status: 'active', shiftId: 'S1' },
  { id: 'E2', tenantId: 't1', employeeCode: 'ACM002', firstName: 'Sarah', lastName: 'Johnson', email: 'sarah@acme.com', phone: '555-0102', departmentId: 'D1', designationId: 'DG2', dateOfJoining: '2022-07-01', dateOfBirth: '1988-11-15', gender: 'female', address: '456 Oak Ave', city: 'New York', state: 'NY', status: 'active', shiftId: 'S1' },
  { id: 'E3', tenantId: 't1', employeeCode: 'ACM003', firstName: 'Michael', lastName: 'Brown', email: 'michael@acme.com', phone: '555-0103', departmentId: 'D2', designationId: 'DG2', dateOfJoining: '2021-01-10', dateOfBirth: '1985-03-22', gender: 'male', address: '789 Pine Rd', city: 'Boston', state: 'MA', status: 'active', shiftId: 'S1' },
  { id: 'E4', tenantId: 't1', employeeCode: 'ACM004', firstName: 'Emily', lastName: 'Davis', email: 'emily@acme.com', phone: '555-0104', departmentId: 'D3', designationId: 'DG3', dateOfJoining: '2023-09-20', dateOfBirth: '1992-08-10', gender: 'female', address: '321 Elm St', city: 'Chicago', state: 'IL', status: 'active', shiftId: 'S1' },
  { id: 'E5', tenantId: 't1', employeeCode: 'ACM005', firstName: 'David', lastName: 'Wilson', email: 'david@acme.com', phone: '555-0105', departmentId: 'D4', designationId: 'DG1', dateOfJoining: '2020-02-14', dateOfBirth: '1980-12-05', gender: 'male', address: '654 Maple Dr', city: 'New York', state: 'NY', status: 'active', shiftId: 'S2' },
  { id: 'E6', tenantId: 't1', employeeCode: 'ACM006', firstName: 'Jessica', lastName: 'Martinez', email: 'jessica@acme.com', phone: '555-0106', departmentId: 'D5', designationId: 'DG3', dateOfJoining: '2024-01-08', dateOfBirth: '1993-06-18', gender: 'female', address: '987 Cedar Ln', city: 'New York', state: 'NY', status: 'active', shiftId: 'S1' },
  { id: 'E7', tenantId: 't1', employeeCode: 'ACM007', firstName: 'Robert', lastName: 'Anderson', email: 'robert@acme.com', phone: '555-0107', departmentId: 'D1', designationId: 'DG4', dateOfJoining: '2024-06-01', dateOfBirth: '1995-09-30', gender: 'male', address: '147 Birch Ave', city: 'Boston', state: 'MA', status: 'active', shiftId: 'S1' },
  { id: 'E8', tenantId: 't1', employeeCode: 'ACM008', firstName: 'Amanda', lastName: 'Taylor', email: 'amanda@acme.com', phone: '555-0108', departmentId: 'D1', designationId: 'DG3', dateOfJoining: '2023-04-12', dateOfBirth: '1991-02-28', gender: 'female', address: '258 Walnut St', city: 'New York', state: 'NY', status: 'active', shiftId: 'S1' },
  { id: 'E9', tenantId: 't1', employeeCode: 'ACM009', firstName: 'Daniel', lastName: 'Thomas', email: 'daniel@acme.com', phone: '555-0109', departmentId: 'D3', designationId: 'DG4', dateOfJoining: '2024-08-15', dateOfBirth: '1996-04-12', gender: 'male', address: '369 Spruce Ct', city: 'Chicago', state: 'IL', status: 'active', shiftId: 'S1' },
  { id: 'E10', tenantId: 't1', employeeCode: 'ACM010', firstName: 'Olivia', lastName: 'Garcia', email: 'olivia@acme.com', phone: '555-0110', departmentId: 'D5', designationId: 'DG2', dateOfJoining: '2022-11-01', dateOfBirth: '1987-07-25', gender: 'female', address: '741 Ash Blvd', city: 'New York', state: 'NY', status: 'active', shiftId: 'S1' },
  { id: 'E11', tenantId: 't1', employeeCode: 'ACM011', firstName: 'James', lastName: 'Moore', email: 'james@acme.com', phone: '555-0111', departmentId: 'D4', designationId: 'DG3', dateOfJoining: '2023-02-20', dateOfBirth: '1989-10-08', gender: 'male', address: '852 Poplar Way', city: 'Boston', state: 'MA', status: 'active', shiftId: 'S3' },
  { id: 'E12', tenantId: 't1', employeeCode: 'ACM012', firstName: 'Sophia', lastName: 'White', email: 'sophia@acme.com', phone: '555-0112', departmentId: 'D2', designationId: 'DG4', dateOfJoining: '2025-01-06', dateOfBirth: '1997-01-14', gender: 'female', address: '963 Willow Pl', city: 'New York', state: 'NY', status: 'active', shiftId: 'S1' },
  { id: 'E13', tenantId: 't1', employeeCode: 'ACM013', firstName: 'Kevin', lastName: 'Harris', email: 'kevin@acme.com', phone: '555-0113', departmentId: 'D1', designationId: 'DG5', dateOfJoining: '2025-06-01', dateOfBirth: '2000-03-19', gender: 'male', address: '159 Cherry St', city: 'Chicago', state: 'IL', status: 'inactive', shiftId: 'S1' },
  { id: 'E14', tenantId: 't1', employeeCode: 'ACM014', firstName: 'Rachel', lastName: 'Clark', email: 'rachel@acme.com', phone: '555-0114', departmentId: 'D5', designationId: 'DG4', dateOfJoining: '2024-03-01', dateOfBirth: '1994-11-22', gender: 'female', address: '357 Hickory Ln', city: 'New York', state: 'NY', status: 'offboarded', shiftId: 'S1' },
  // TechVista (t2) - 8 employees
  { id: 'E15', tenantId: 't2', employeeCode: 'TVS001', firstName: 'Jane', lastName: 'Smith', email: 'jane@techvista.com', phone: '555-0201', departmentId: 'D6', designationId: 'DG8', dateOfJoining: '2023-05-10', dateOfBirth: '1991-04-15', gender: 'female', address: '100 Tech Blvd', city: 'San Francisco', state: 'CA', status: 'active', shiftId: 'S1' },
  { id: 'E16', tenantId: 't2', employeeCode: 'TVS002', firstName: 'Alex', lastName: 'Kim', email: 'alex@techvista.com', phone: '555-0202', departmentId: 'D6', designationId: 'DG7', dateOfJoining: '2022-08-20', dateOfBirth: '1986-09-03', gender: 'male', address: '200 Innovation Dr', city: 'San Francisco', state: 'CA', status: 'active', shiftId: 'S1' },
  { id: 'E17', tenantId: 't2', employeeCode: 'TVS003', firstName: 'Priya', lastName: 'Patel', email: 'priya@techvista.com', phone: '555-0203', departmentId: 'D7', designationId: 'DG7', dateOfJoining: '2023-01-15', dateOfBirth: '1990-12-20', gender: 'female', address: '300 Startup Ln', city: 'San Jose', state: 'CA', status: 'active', shiftId: 'S1' },
  { id: 'E18', tenantId: 't2', employeeCode: 'TVS004', firstName: 'Marcus', lastName: 'Lee', email: 'marcus@techvista.com', phone: '555-0204', departmentId: 'D8', designationId: 'DG8', dateOfJoining: '2024-02-01', dateOfBirth: '1993-07-11', gender: 'male', address: '400 Venture Ct', city: 'San Francisco', state: 'CA', status: 'active', shiftId: 'S1' },
  { id: 'E19', tenantId: 't2', employeeCode: 'TVS005', firstName: 'Lisa', lastName: 'Wang', email: 'lisa@techvista.com', phone: '555-0205', departmentId: 'D10', designationId: 'DG6', dateOfJoining: '2021-10-01', dateOfBirth: '1984-02-28', gender: 'female', address: '500 Product Ave', city: 'San Jose', state: 'CA', status: 'active', shiftId: 'S1' },
  { id: 'E20', tenantId: 't2', employeeCode: 'TVS006', firstName: 'Tom', lastName: 'Chen', email: 'tom@techvista.com', phone: '555-0206', departmentId: 'D6', designationId: 'DG9', dateOfJoining: '2025-01-10', dateOfBirth: '1998-05-05', gender: 'male', address: '600 Code St', city: 'San Francisco', state: 'CA', status: 'active', shiftId: 'S1' },
  { id: 'E21', tenantId: 't2', employeeCode: 'TVS007', firstName: 'Nina', lastName: 'Gupta', email: 'nina@techvista.com', phone: '555-0207', departmentId: 'D9', designationId: 'DG8', dateOfJoining: '2023-11-15', dateOfBirth: '1992-08-17', gender: 'female', address: '700 Deploy Rd', city: 'San Jose', state: 'CA', status: 'active', shiftId: 'S2' },
  { id: 'E22', tenantId: 't2', employeeCode: 'TVS008', firstName: 'Ryan', lastName: 'Brooks', email: 'ryan@techvista.com', phone: '555-0208', departmentId: 'D6', designationId: 'DG10', dateOfJoining: '2025-09-01', dateOfBirth: '2001-01-30', gender: 'male', address: '800 Intern Way', city: 'San Francisco', state: 'CA', status: 'inactive', shiftId: 'S1' },
];

export const MOCK_SHIFTS: Shift[] = [
  { id: 'S1', tenantId: 't1', name: 'General', code: 'GEN', startTime: '09:00', endTime: '18:00', graceMinutes: 15, isDefault: true },
  { id: 'S2', tenantId: 't1', name: 'Morning', code: 'MRN', startTime: '06:00', endTime: '14:00', graceMinutes: 10, isDefault: false },
  { id: 'S3', tenantId: 't1', name: 'Afternoon', code: 'AFT', startTime: '14:00', endTime: '22:00', graceMinutes: 10, isDefault: false },
  { id: 'S4', tenantId: 't1', name: 'Night', code: 'NGT', startTime: '22:00', endTime: '06:00', graceMinutes: 15, isDefault: false },
];

export const MOCK_HOLIDAYS: Holiday[] = [
  { id: 'H1', tenantId: 't1', name: "New Year's Day", date: '2026-01-01', type: 'national', isOptional: false },
  { id: 'H2', tenantId: 't1', name: "Martin Luther King Jr. Day", date: '2026-01-19', type: 'national', isOptional: false },
  { id: 'H3', tenantId: 't1', name: "Presidents' Day", date: '2026-02-16', type: 'national', isOptional: true },
  { id: 'H4', tenantId: 't1', name: 'Good Friday', date: '2026-04-03', type: 'regional', isOptional: true },
  { id: 'H5', tenantId: 't1', name: 'Memorial Day', date: '2026-05-25', type: 'national', isOptional: false },
  { id: 'H6', tenantId: 't1', name: 'Independence Day', date: '2026-07-04', type: 'national', isOptional: false },
  { id: 'H7', tenantId: 't1', name: 'Labor Day', date: '2026-09-07', type: 'national', isOptional: false },
  { id: 'H8', tenantId: 't1', name: 'Company Foundation Day', date: '2026-03-15', type: 'company', isOptional: false },
  { id: 'H9', tenantId: 't1', name: 'Thanksgiving', date: '2026-11-26', type: 'national', isOptional: false },
  { id: 'H10', tenantId: 't1', name: 'Christmas Day', date: '2026-12-25', type: 'national', isOptional: false },
  { id: 'H11', tenantId: 't1', name: 'Diwali', date: '2026-10-20', type: 'regional', isOptional: true },
  { id: 'H12', tenantId: 't2', name: "New Year's Day", date: '2026-01-01', type: 'national', isOptional: false },
  { id: 'H13', tenantId: 't2', name: 'Independence Day', date: '2026-07-04', type: 'national', isOptional: false },
];

function generateAttendanceRecords(): AttendanceRecord[] {
  const records: AttendanceRecord[] = [];
  const employees = MOCK_EMPLOYEES.filter(e => e.status === 'active');
  const statuses: Array<{ status: AttendanceRecord['status']; weight: number }> = [
    { status: 'present', weight: 65 }, { status: 'late', weight: 10 },
    { status: 'absent', weight: 8 }, { status: 'leave', weight: 7 },
    { status: 'half_day', weight: 5 }, { status: 'weekend', weight: 5 },
  ];

  let id = 1;
  // Generate records for March 25 - April 1, 2026
  for (let d = 25; d <= 31; d++) {
    const dateStr = `2026-03-${d.toString().padStart(2, '0')}`;
    const dayOfWeek = new Date(dateStr).getDay();
    for (const emp of employees) {
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        records.push({ id: `A${id++}`, tenantId: emp.tenantId, employeeId: emp.id, date: dateStr, status: 'weekend', source: 'system' });
        continue;
      }
      const rand = Math.random() * 100;
      let cumulative = 0;
      let chosen: AttendanceRecord['status'] = 'present';
      for (const s of statuses) {
        cumulative += s.weight;
        if (rand <= cumulative) { chosen = s.status; break; }
      }
      const checkIn = chosen === 'present' ? `09:0${Math.floor(Math.random() * 10)}` :
                       chosen === 'late' ? `09:${15 + Math.floor(Math.random() * 45)}` :
                       chosen === 'half_day' ? '09:05' : undefined;
      const checkOut = checkIn ? (chosen === 'half_day' ? '13:00' : `18:0${Math.floor(Math.random() * 10)}`) : undefined;
      const workHours = chosen === 'present' ? 8 + Math.random() * 1.5 :
                        chosen === 'late' ? 7 + Math.random() * 1 :
                        chosen === 'half_day' ? 4 : 0;
      records.push({
        id: `A${id++}`, tenantId: emp.tenantId, employeeId: emp.id, date: dateStr,
        status: chosen, checkIn, checkOut, shiftId: emp.shiftId,
        workHours: Math.round(workHours * 10) / 10,
        overtime: workHours > 8.5 ? Math.round((workHours - 8.5) * 10) / 10 : 0,
        source: Math.random() > 0.3 ? 'biometric' : 'manual'
      });
    }
  }
  // April 1 records
  const apr1 = '2026-04-01';
  for (const emp of employees) {
    const rand = Math.random() * 100;
    let chosen: AttendanceRecord['status'] = rand < 60 ? 'present' : rand < 72 ? 'late' : rand < 82 ? 'absent' : rand < 90 ? 'leave' : 'half_day';
    const checkIn = chosen === 'present' ? `09:0${Math.floor(Math.random() * 8)}` :
                     chosen === 'late' ? `09:${16 + Math.floor(Math.random() * 30)}` :
                     chosen === 'half_day' ? '09:03' : undefined;
    const checkOut = checkIn ? (chosen === 'half_day' ? '13:00' : `18:0${Math.floor(Math.random() * 10)}`) : undefined;
    const wh = chosen === 'present' ? 8.5 : chosen === 'late' ? 7.5 : chosen === 'half_day' ? 4 : 0;
    records.push({
      id: `A${id++}`, tenantId: emp.tenantId, employeeId: emp.id, date: apr1,
      status: chosen, checkIn, checkOut, shiftId: emp.shiftId,
      workHours: wh, overtime: 0, source: 'biometric'
    });
  }
  return records;
}

export const MOCK_ATTENDANCE: AttendanceRecord[] = generateAttendanceRecords();

export const MOCK_PUNCH_LOGS: PunchLog[] = [
  { id: 'PL1', tenantId: 't1', employeeId: 'E1', timestamp: '2026-04-01T09:02:00', type: 'in', source: 'biometric', deviceId: 'BIO-01', location: 'Main Entrance' },
  { id: 'PL2', tenantId: 't1', employeeId: 'E1', timestamp: '2026-04-01T18:05:00', type: 'out', source: 'biometric', deviceId: 'BIO-01', location: 'Main Entrance' },
  { id: 'PL3', tenantId: 't1', employeeId: 'E2', timestamp: '2026-04-01T08:55:00', type: 'in', source: 'biometric', deviceId: 'BIO-02', location: 'Side Gate' },
  { id: 'PL4', tenantId: 't1', employeeId: 'E2', timestamp: '2026-04-01T18:10:00', type: 'out', source: 'biometric', deviceId: 'BIO-02', location: 'Side Gate' },
  { id: 'PL5', tenantId: 't1', employeeId: 'E3', timestamp: '2026-04-01T09:15:00', type: 'in', source: 'manual', location: 'Reception' },
  { id: 'PL6', tenantId: 't1', employeeId: 'E3', timestamp: '2026-04-01T17:50:00', type: 'out', source: 'manual', location: 'Reception' },
  { id: 'PL7', tenantId: 't1', employeeId: 'E4', timestamp: '2026-04-01T09:00:00', type: 'in', source: 'biometric', deviceId: 'BIO-01', location: 'Main Entrance' },
  { id: 'PL8', tenantId: 't1', employeeId: 'E4', timestamp: '2026-04-01T18:02:00', type: 'out', source: 'biometric', deviceId: 'BIO-01', location: 'Main Entrance' },
  { id: 'PL9', tenantId: 't1', employeeId: 'E5', timestamp: '2026-04-01T05:58:00', type: 'in', source: 'biometric', deviceId: 'BIO-03', location: 'Warehouse Gate' },
  { id: 'PL10', tenantId: 't1', employeeId: 'E5', timestamp: '2026-04-01T14:05:00', type: 'out', source: 'biometric', deviceId: 'BIO-03', location: 'Warehouse Gate' },
  { id: 'PL11', tenantId: 't1', employeeId: 'E6', timestamp: '2026-04-01T09:30:00', type: 'in', source: 'mobile', location: 'Remote' },
  { id: 'PL12', tenantId: 't1', employeeId: 'E6', timestamp: '2026-04-01T18:15:00', type: 'out', source: 'mobile', location: 'Remote' },
  { id: 'PL13', tenantId: 't1', employeeId: 'E7', timestamp: '2026-04-01T09:05:00', type: 'in', source: 'biometric', deviceId: 'BIO-01', location: 'Main Entrance' },
  { id: 'PL14', tenantId: 't1', employeeId: 'E8', timestamp: '2026-04-01T08:50:00', type: 'in', source: 'biometric', deviceId: 'BIO-02', location: 'Side Gate' },
  { id: 'PL15', tenantId: 't1', employeeId: 'E8', timestamp: '2026-04-01T18:00:00', type: 'out', source: 'biometric', deviceId: 'BIO-02', location: 'Side Gate' },
  { id: 'PL16', tenantId: 't2', employeeId: 'E15', timestamp: '2026-04-01T09:01:00', type: 'in', source: 'biometric', deviceId: 'TV-BIO-01', location: 'Office Entrance' },
  { id: 'PL17', tenantId: 't2', employeeId: 'E15', timestamp: '2026-04-01T18:08:00', type: 'out', source: 'biometric', deviceId: 'TV-BIO-01', location: 'Office Entrance' },
  { id: 'PL18', tenantId: 't2', employeeId: 'E16', timestamp: '2026-04-01T08:45:00', type: 'in', source: 'biometric', deviceId: 'TV-BIO-01', location: 'Office Entrance' },
  { id: 'PL19', tenantId: 't2', employeeId: 'E16', timestamp: '2026-04-01T18:20:00', type: 'out', source: 'biometric', deviceId: 'TV-BIO-01', location: 'Office Entrance' },
  { id: 'PL20', tenantId: 't2', employeeId: 'E17', timestamp: '2026-04-01T09:10:00', type: 'in', source: 'mobile', location: 'WFH' },
  { id: 'PL21', tenantId: 't2', employeeId: 'E17', timestamp: '2026-04-01T17:55:00', type: 'out', source: 'mobile', location: 'WFH' },
  { id: 'PL22', tenantId: 't1', employeeId: 'E9', timestamp: '2026-04-01T09:25:00', type: 'in', source: 'biometric', deviceId: 'BIO-01', location: 'Main Entrance' },
  { id: 'PL23', tenantId: 't1', employeeId: 'E10', timestamp: '2026-04-01T08:58:00', type: 'in', source: 'biometric', deviceId: 'BIO-02', location: 'Side Gate' },
  { id: 'PL24', tenantId: 't1', employeeId: 'E11', timestamp: '2026-04-01T13:55:00', type: 'in', source: 'biometric', deviceId: 'BIO-03', location: 'Warehouse Gate' },
];

export const MOCK_SHIFT_ROSTER: ShiftRoster[] = [
  { id: 'SR1', tenantId: 't1', employeeId: 'E1', shiftId: 'S1', date: '2026-04-01', isOverride: false },
  { id: 'SR2', tenantId: 't1', employeeId: 'E2', shiftId: 'S1', date: '2026-04-01', isOverride: false },
  { id: 'SR3', tenantId: 't1', employeeId: 'E5', shiftId: 'S2', date: '2026-04-01', isOverride: false },
  { id: 'SR4', tenantId: 't1', employeeId: 'E11', shiftId: 'S3', date: '2026-04-01', isOverride: false },
  { id: 'SR5', tenantId: 't1', employeeId: 'E5', shiftId: 'S4', date: '2026-04-02', isOverride: true },
  { id: 'SR6', tenantId: 't1', employeeId: 'E1', shiftId: 'S1', date: '2026-04-02', isOverride: false },
  { id: 'SR7', tenantId: 't1', employeeId: 'E3', shiftId: 'S1', date: '2026-04-01', isOverride: false },
  { id: 'SR8', tenantId: 't1', employeeId: 'E4', shiftId: 'S1', date: '2026-04-01', isOverride: false },
  { id: 'SR9', tenantId: 't1', employeeId: 'E6', shiftId: 'S1', date: '2026-04-01', isOverride: false },
  { id: 'SR10', tenantId: 't1', employeeId: 'E7', shiftId: 'S1', date: '2026-04-01', isOverride: false },
  { id: 'SR11', tenantId: 't1', employeeId: 'E8', shiftId: 'S1', date: '2026-04-01', isOverride: false },
  { id: 'SR12', tenantId: 't1', employeeId: 'E9', shiftId: 'S1', date: '2026-04-01', isOverride: false },
];

export const MOCK_APP_MODULES: AppModule[] = [
  { id: 'MOD1', name: 'Employee Management', code: 'employees', description: 'Manage employee records, onboarding, and profiles', isActive: true, icon: 'bi-people' },
  { id: 'MOD2', name: 'Attendance Management', code: 'attendance', description: 'Track daily attendance, shifts, and punch logs', isActive: true, icon: 'bi-calendar-check' },
  { id: 'MOD3', name: 'Configuration', code: 'configuration', description: 'System configuration, tenants, roles, and menus', isActive: true, icon: 'bi-gear' },
  { id: 'MOD4', name: 'Reports & Analytics', code: 'reports', description: 'Generate attendance and employee reports', isActive: true, icon: 'bi-file-earmark-bar-graph' },
  { id: 'MOD5', name: 'Offboarding', code: 'offboarding', description: 'Manage employee offboarding workflow', isActive: true, icon: 'bi-box-arrow-right' },
  { id: 'MOD6', name: 'Master Data', code: 'masters', description: 'Departments, designations, and other master tables', isActive: true, icon: 'bi-database' },
];

export const MOCK_ROLES: Role[] = [
  { id: 'R1', tenantId: 't1', name: 'Super Administrator', code: 'super_admin', isSystem: true, permissions: ['employee.read', 'employee.write', 'attendance.read', 'attendance.write', 'config.manage', 'reports.view', 'reports.export', 'masters.manage', 'offboarding.manage'] },
  { id: 'R2', tenantId: 't1', name: 'Tenant Administrator', code: 'tenant_admin', isSystem: true, permissions: ['employee.read', 'employee.write', 'attendance.read', 'attendance.write', 'reports.view', 'reports.export', 'masters.manage', 'offboarding.manage'] },
  { id: 'R3', tenantId: 't1', name: 'HR Manager', code: 'hr_manager', isSystem: false, permissions: ['employee.read', 'employee.write', 'attendance.read', 'attendance.write', 'reports.view', 'offboarding.manage'] },
  { id: 'R4', tenantId: 't1', name: 'Employee', code: 'employee', isSystem: true, permissions: ['attendance.read'] },
];

export const MOCK_OFFBOARDING: OffboardingRecord[] = [
  {
    id: 'OB1', tenantId: 't1', employeeId: 'E14', initiatedDate: '2025-12-01', lastWorkingDate: '2025-12-31',
    reason: 'Career change', status: 'completed',
    checklist: [
      { id: 'OC1', task: 'IT Asset Return (Laptop, ID Card)', isCompleted: true, completedDate: '2025-12-28', assignee: 'IT Admin' },
      { id: 'OC2', task: 'Access Revocation (Email, VPN, Systems)', isCompleted: true, completedDate: '2025-12-31', assignee: 'IT Admin' },
      { id: 'OC3', task: 'Knowledge Transfer', isCompleted: true, completedDate: '2025-12-20', assignee: 'Team Lead' },
      { id: 'OC4', task: 'Exit Interview', isCompleted: true, completedDate: '2025-12-29', assignee: 'HR Manager' },
      { id: 'OC5', task: 'Final Settlement', isCompleted: true, completedDate: '2026-01-15', assignee: 'Finance' },
    ]
  },
  {
    id: 'OB2', tenantId: 't1', employeeId: 'E13', initiatedDate: '2026-03-15', lastWorkingDate: '2026-04-15',
    reason: 'Relocation', status: 'in_progress',
    checklist: [
      { id: 'OC6', task: 'IT Asset Return (Laptop, ID Card)', isCompleted: false, assignee: 'IT Admin' },
      { id: 'OC7', task: 'Access Revocation (Email, VPN, Systems)', isCompleted: false, assignee: 'IT Admin' },
      { id: 'OC8', task: 'Knowledge Transfer', isCompleted: true, completedDate: '2026-03-28', assignee: 'Team Lead' },
      { id: 'OC9', task: 'Exit Interview', isCompleted: false, assignee: 'HR Manager' },
      { id: 'OC10', task: 'Final Settlement', isCompleted: false, assignee: 'Finance' },
    ]
  },
  {
    id: 'OB3', tenantId: 't1', employeeId: 'E9', initiatedDate: '2026-03-20', lastWorkingDate: '2026-04-20',
    reason: 'Higher studies', status: 'initiated',
    checklist: [
      { id: 'OC11', task: 'IT Asset Return', isCompleted: false, assignee: 'IT Admin' },
      { id: 'OC12', task: 'Access Revocation', isCompleted: false, assignee: 'IT Admin' },
      { id: 'OC13', task: 'Knowledge Transfer', isCompleted: false, assignee: 'Team Lead' },
      { id: 'OC14', task: 'Exit Interview', isCompleted: false, assignee: 'HR Manager' },
      { id: 'OC15', task: 'Final Settlement', isCompleted: false, assignee: 'Finance' },
    ]
  },
  {
    id: 'OB4', tenantId: 't2', employeeId: 'E22', initiatedDate: '2026-02-10', lastWorkingDate: '2026-03-10',
    reason: 'Contract ended', status: 'completed',
    checklist: [
      { id: 'OC16', task: 'IT Asset Return', isCompleted: true, completedDate: '2026-03-08', assignee: 'IT Admin' },
      { id: 'OC17', task: 'Access Revocation', isCompleted: true, completedDate: '2026-03-10', assignee: 'IT Admin' },
      { id: 'OC18', task: 'Knowledge Transfer', isCompleted: true, completedDate: '2026-03-05', assignee: 'Team Lead' },
      { id: 'OC19', task: 'Exit Interview', isCompleted: true, completedDate: '2026-03-09', assignee: 'HR Manager' },
      { id: 'OC20', task: 'Final Settlement', isCompleted: true, completedDate: '2026-03-20', assignee: 'Finance' },
    ]
  },
  {
    id: 'OB5', tenantId: 't1', employeeId: 'E12', initiatedDate: '2026-03-28', lastWorkingDate: '2026-04-30',
    reason: 'Personal reasons', status: 'initiated',
    checklist: [
      { id: 'OC21', task: 'IT Asset Return', isCompleted: false, assignee: 'IT Admin' },
      { id: 'OC22', task: 'Access Revocation', isCompleted: false, assignee: 'IT Admin' },
      { id: 'OC23', task: 'Knowledge Transfer', isCompleted: false, assignee: 'Team Lead' },
      { id: 'OC24', task: 'Exit Interview', isCompleted: false, assignee: 'HR Manager' },
      { id: 'OC25', task: 'Final Settlement', isCompleted: false, assignee: 'Finance' },
    ]
  },
];

export const MOCK_MENU_ITEMS: MenuItem[] = [
  { id: 'M1', label: 'Dashboard', icon: 'bi-speedometer2', route: '/dashboard', roles: ['super_admin', 'tenant_admin', 'hr_manager', 'employee'], order: 1, isActive: true },
  { id: 'M2', label: 'Employees', icon: 'bi-people', roles: ['super_admin', 'tenant_admin', 'hr_manager'], order: 2, isActive: true, children: [
    { id: 'M2a', label: 'Employee List', icon: '', route: '/employees/list', roles: ['super_admin', 'tenant_admin', 'hr_manager'], order: 1, isActive: true },
    { id: 'M2b', label: 'Add Employee', icon: '', route: '/employees/add', roles: ['super_admin', 'tenant_admin', 'hr_manager'], order: 2, isActive: true },
  ]},
  { id: 'M3', label: 'Attendance', icon: 'bi-calendar-check', roles: ['super_admin', 'tenant_admin', 'hr_manager', 'employee'], order: 3, isActive: true, children: [
    { id: 'M3a', label: 'Daily Monitoring', icon: '', route: '/attendance/daily-monitoring', roles: ['super_admin', 'tenant_admin', 'hr_manager'], order: 1, isActive: true },
    { id: 'M3b', label: 'Manual Entry', icon: '', route: '/attendance/manual-entry', roles: ['super_admin', 'tenant_admin', 'hr_manager'], order: 2, isActive: true },
    { id: 'M3c', label: 'Punch Logs', icon: '', route: '/attendance/punch-logs', roles: ['super_admin', 'tenant_admin', 'hr_manager'], order: 3, isActive: true },
  ]},
  { id: 'M4', label: 'Reports', icon: 'bi-file-earmark-bar-graph', route: '/reports', roles: ['super_admin', 'tenant_admin', 'hr_manager'], order: 7, isActive: true },
  { id: 'M5', label: 'Settings', icon: 'bi-palette', route: '/settings', roles: ['super_admin', 'tenant_admin', 'hr_manager', 'employee'], order: 9, isActive: true },
];
