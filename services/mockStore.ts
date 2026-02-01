
import { User, Complaint, HostelStats } from '../types';

const USERS_KEY = 'resident_resolve_users';
const COMPLAINTS_KEY = 'resident_resolve_complaints';
const CURRENT_USER_KEY = 'resident_resolve_current_user';

export const mockStore = {
  getUsers: (): User[] => JSON.parse(localStorage.getItem(USERS_KEY) || '[]'),
  saveUser: (user: User) => {
    const users = mockStore.getUsers();
    const updated = [...users.filter(u => u.uid !== user.uid), user];
    localStorage.setItem(USERS_KEY, JSON.stringify(updated));
  },
  getCurrentUser: (): User | null => {
    const data = localStorage.getItem(CURRENT_USER_KEY);
    return data ? JSON.parse(data) : null;
  },
  setCurrentUser: (user: User | null) => {
    if (user) localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(CURRENT_USER_KEY);
  },
  getComplaints: (): Complaint[] => JSON.parse(localStorage.getItem(COMPLAINTS_KEY) || '[]'),
  saveComplaint: (complaint: Complaint) => {
    const complaints = mockStore.getComplaints();
    const existingIdx = complaints.findIndex(c => c.id === complaint.id);
    if (existingIdx >= 0) {
      complaints[existingIdx] = complaint;
    } else {
      complaints.push(complaint);
    }
    localStorage.setItem(COMPLAINTS_KEY, JSON.stringify(complaints));
  },
  getHostelStats: (): HostelStats[] => {
    const complaints = mockStore.getComplaints();
    const hostels: Record<string, { raised: number, resolved: number }> = {};
    
    // Default list of hostels to ensure they show up on landing even with 0 complaints
    const defaultHostels = ['Emerald Hall', 'Sapphire Heights', 'Ruby Residency', 'Diamond Dorms'];
    defaultHostels.forEach(h => hostels[h] = { raised: 0, resolved: 0 });

    complaints.forEach(c => {
      const name = c.hostelName || 'General';
      if (!hostels[name]) hostels[name] = { raised: 0, resolved: 0 };
      hostels[name].raised++;
      if (c.status === 'Resolved' || c.status === 'Closed') {
        hostels[name].resolved++;
      }
    });

    return Object.entries(hostels).map(([hostelName, stats]) => {
      // If 0 raised, give a default high starting rating for brand new hostels
      const rating = stats.raised > 0 ? (stats.resolved / stats.raised) * 5 : 5.0;
      return {
        hostelName,
        totalRaised: stats.raised,
        totalResolved: stats.resolved,
        rating: parseFloat(rating.toFixed(1))
      };
    }).sort((a, b) => b.rating - a.rating);
  }
};

// Initialize only core accounts, no dummy complaints
if (mockStore.getUsers().length === 0) {
  const defaultWarden: User = { uid: 'w1', name: 'Admin Warden', email: 'warden@test.com', role: 'warden' };
  // Demo worker starts without a profession to test the selection flow
  const defaultWorker: User = { uid: 'wk1', name: 'Demo Worker', email: 'worker@test.com', role: 'worker' };
  const defaultStudent: User = { 
    uid: 's1', 
    name: 'Demo Student', 
    email: 'student@test.com', 
    role: 'student',
    studentId: 'STU001',
    roomNumber: '101',
    hostelName: 'Emerald Hall'
  };
  
  mockStore.saveUser(defaultWarden);
  mockStore.saveUser(defaultWorker);
  mockStore.saveUser(defaultStudent);
}
