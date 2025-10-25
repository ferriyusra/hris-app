export type AttendanceStatus = 'present' | 'late' | 'half_day' | 'absent';

export type AttendanceRecord = {
  id: string;
  employee_id: string;
  date: string; // ISO date string (YYYY-MM-DD)
  clock_in: string | null; // ISO timestamp
  clock_out: string | null; // ISO timestamp
  status: AttendanceStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type AttendanceRecordWithEmployee = AttendanceRecord & {
  employee_name: string;
  employee_position: string;
  work_hours: number | null; // Hours worked (decimal)
};

export type AttendanceTodayStatus = {
  has_record: boolean;
  is_clocked_in: boolean;
  is_clocked_out: boolean;
  record: AttendanceRecord | null;
};

export type AttendanceStats = {
  total_days: number;
  present_days: number;
  late_days: number;
  half_days: number;
  absent_days: number;
  attendance_rate: number; // Percentage
  total_work_hours: number;
  average_work_hours: number;
};

export type AttendanceDateRange = {
  from: string; // ISO date string
  to: string; // ISO date string
};

export type AttendanceFilter = {
  employee_id?: string;
  date_from?: string;
  date_to?: string;
  status?: AttendanceStatus;
  search?: string; // For employee name search
};

export type MonthlyAttendanceSummary = {
  employee_id: string;
  employee_name: string;
  employee_position: string;
  month: string; // YYYY-MM format
  total_days: number;
  present_days: number;
  late_days: number;
  half_days: number;
  absent_days: number;
  attendance_rate: number;
  total_work_hours: number;
};

export type AttendanceFormState = {
  status?: string;
  errors?: {
    id?: string[];
    employee_id?: string[];
    date?: string[];
    clock_in?: string[];
    clock_out?: string[];
    status?: string[];
    notes?: string[];
    _form?: string[];
  };
};

export type ClockInData = {
  employee_id: string;
  date: string;
  clock_in: string;
  status: AttendanceStatus;
  notes?: string;
};

export type ClockOutData = {
  id: string;
  clock_out: string;
};

export type CreateAttendanceData = {
  employee_id: string;
  date: string;
  clock_in: string;
  clock_out?: string;
  status: AttendanceStatus;
  notes?: string;
};

export type UpdateAttendanceData = {
  id: string;
  date?: string;
  clock_in?: string;
  clock_out?: string;
  status?: AttendanceStatus;
  notes?: string;
};
