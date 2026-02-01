
export type UserRole = 'student' | 'warden' | 'worker';

export type ComplaintStatus = 'Submitted' | 'Assigned' | 'In Progress' | 'Resolved' | 'Closed';

export type ComplaintCategory = 'Plumbing' | 'Electricity' | 'Cleanliness' | 'Internet' | 'Room Issue' | 'Other';

export type ComplaintPriority = 'Low' | 'Medium' | 'High';

export interface User {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  profession?: ComplaintCategory;
  studentId?: string;
  roomNumber?: string;
  hostelName?: string; // Renamed from block
}

export interface Complaint {
  id: string;
  title: string;
  description: string;
  category: ComplaintCategory;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  studentId: string;
  studentName: string;
  roomNumber: string;
  hostelName: string; // Renamed from block
  assignedWorkerId?: string;
  assignedWorkerName?: string;
  createdAt: number;
  updatedAt: number;
  feedback?: string;
  remarks?: string;
}

export interface HostelStats {
  hostelName: string; // Renamed from block
  totalRaised: number;
  totalResolved: number;
  rating: number;
}
