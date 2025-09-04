// Data persistence utilities for the productivity app

export interface TimeEntry {
  id: string;
  subjectId: string;
  startTime: number;
  endTime: number;
  duration: number; // in seconds
  date: string; // YYYY-MM-DD format for easy querying
}

export interface Subject {
  id: string;
  name: string;
  typeId: string;
  icon: string;
  isActive: boolean;
  totalTime: number;
  startTime?: number;
}

export interface Type {
  id: string;
  name: string;
  icon: string;
}

export interface AppData {
  types: Type[];
  subjects: Subject[];
  timeEntries: TimeEntry[];
  lastUpdated: number;
  version: string; // for future migrations
}

const STORAGE_KEY = 'productivity-app-data';
const CURRENT_VERSION = '1.0.0';

// Default data structure
const defaultData: AppData = {
  types: [
    { id: "1", name: "Courses", icon: "GraduationCap" },
    { id: "2", name: "Work", icon: "Briefcase" },
    { id: "3", name: "Projects", icon: "Code" },
  ],
  subjects: [
    { id: "1", name: "React Course", typeId: "1", icon: "BookOpen", isActive: false, totalTime: 0 },
    { id: "2", name: "Client Project", typeId: "2", icon: "Briefcase", isActive: false, totalTime: 0 },
    { id: "3", name: "Portfolio Website", typeId: "3", icon: "Code", isActive: false, totalTime: 0 },
  ],
  timeEntries: [],
  lastUpdated: Date.now(),
  version: CURRENT_VERSION
};

// Load data from localStorage
export function loadData(): AppData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return defaultData;
    }
    
    const data = JSON.parse(stored) as AppData;
    
    // Handle version migrations here in the future
    if (data.version !== CURRENT_VERSION) {
      // For now, just update the version
      data.version = CURRENT_VERSION;
    }
    
    return data;
  } catch (error) {
    console.error('Error loading data from localStorage:', error);
    return defaultData;
  }
}

// Save data to localStorage
export function saveData(data: AppData): void {
  try {
    const dataToSave = {
      ...data,
      lastUpdated: Date.now(),
      version: CURRENT_VERSION
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  } catch (error) {
    console.error('Error saving data to localStorage:', error);
  }
}

// Create a new time entry
export function createTimeEntry(subjectId: string, startTime: number, endTime: number): TimeEntry {
  const durationMs = endTime - startTime;
  const durationSeconds = Math.floor(durationMs / 1000); // Convert to seconds
  
  // startTime is a UTC timestamp, but we want to store the date in local timezone
  // We need to create a Date object and then get the local date components
  const dateObj = new Date(startTime);
  
  // Get local date components (this handles timezone conversion correctly)
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  const date = `${year}-${month}-${day}`;
  
  return {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    subjectId,
    startTime,
    endTime,
    duration: durationSeconds, // Store duration in seconds, not milliseconds
    date
  };
}

// Create a manual time entry (for forgotten time)
export function createManualTimeEntry(subjectId: string, durationMinutes: number): TimeEntry {
  const now = Date.now();
  const durationMs = durationMinutes * 60 * 1000; // Convert minutes to milliseconds
  const startTime = now - durationMs; // Calculate start time based on duration
  
  // Create date string in local timezone
  const dateObj = new Date(startTime);
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  const date = `${year}-${month}-${day}`;
  
  return {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    subjectId,
    startTime,
    endTime: now,
    duration: durationMinutes * 60, // Store duration in seconds
    date
  };
}

// Calculate total time for a subject from time entries
export function calculateSubjectTotalTime(subjectId: string, timeEntries: TimeEntry[]): number {
  return timeEntries
    .filter(entry => entry.subjectId === subjectId)
    .reduce((total, entry) => total + entry.duration, 0);
}

// Get time breakdown for a subject
export function getTimeBreakdown(subjectId: string, timeEntries: TimeEntry[]) {
  const subjectEntries = timeEntries.filter(entry => entry.subjectId === subjectId);
  
  const now = new Date();
  
  // Create date strings in local timezone using the same reliable method
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const today = `${year}-${month}-${day}`;
  
  // Calculate week start (Sunday) in local time
  const weekStartDate = new Date(now);
  weekStartDate.setDate(now.getDate() - now.getDay());
  const weekStartYear = weekStartDate.getFullYear();
  const weekStartMonth = String(weekStartDate.getMonth() + 1).padStart(2, '0');
  const weekStartDay = String(weekStartDate.getDate()).padStart(2, '0');
  const weekStart = `${weekStartYear}-${weekStartMonth}-${weekStartDay}`;
  
  // Calculate month start (first day of current month) in local time
  const monthStartDate = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthStartYear = monthStartDate.getFullYear();
  const monthStartMonth = String(monthStartDate.getMonth() + 1).padStart(2, '0');
  const monthStartDay = String(monthStartDate.getDate()).padStart(2, '0');
  const monthStart = `${monthStartYear}-${monthStartMonth}-${monthStartDay}`;
  
  const daily = subjectEntries
    .filter(entry => entry.date === today)
    .reduce((total, entry) => total + entry.duration, 0);
    
  const weekly = subjectEntries
    .filter(entry => entry.date >= weekStart)
    .reduce((total, entry) => total + entry.duration, 0);
    
  const monthly = subjectEntries
    .filter(entry => entry.date >= monthStart)
    .reduce((total, entry) => total + entry.duration, 0);
    
  const allTime = subjectEntries
    .reduce((total, entry) => total + entry.duration, 0);
  

  
  return { daily, weekly, monthly, allTime };
}

// Export data as JSON
export function exportData(): string {
  const data = loadData();
  return JSON.stringify(data, null, 2);
}

// Import data from JSON
export function importData(jsonData: string): { success: boolean; error?: string } {
  try {
    const data = JSON.parse(jsonData) as AppData;
    
    // Validate the data structure
    if (!data.types || !data.subjects || !data.timeEntries) {
      return { success: false, error: 'Invalid data format' };
    }
    
    // Save the imported data
    saveData(data);
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Invalid JSON format' };
  }
}

// Clear all data
export function clearData(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// Get storage usage info
export function getStorageInfo(): { used: number; available: number; percentage: number } {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    const used = data ? new Blob([data]).size : 0;
    const available = 5 * 1024 * 1024; // 5MB typical limit
    const percentage = (used / available) * 100;
    
    return { used, available, percentage };
  } catch (error) {
    return { used: 0, available: 0, percentage: 0 };
  }
}

