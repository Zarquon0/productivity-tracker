import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  loadData, 
  saveData, 
  createTimeEntry, 
  createManualTimeEntry,
  calculateSubjectTotalTime,
  getTimeBreakdown,
  AppData, 
  Type, 
  Subject, 
  TimeEntry 
} from '../lib/storage';

// Custom hook for managing persistent app data
export function usePersistentData() {
  const [data, setData] = useState<AppData>(() => loadData());
  const [isLoading, setIsLoading] = useState(true);
  const stoppingRef = useRef<Set<string>>(new Set());

  // Load data on mount
  useEffect(() => {
    const loadedData = loadData();
    setData(loadedData);
    setIsLoading(false);
  }, []);

  // Auto-save whenever data changes
  useEffect(() => {
    if (!isLoading) {
      saveData(data);
    }
  }, [data, isLoading]);

  // Update types
  const updateTypes = useCallback((newTypes: Type[]) => {
    setData(prev => ({ ...prev, types: newTypes }));
  }, []);

  // Update subjects
  const updateSubjects = useCallback((newSubjects: Subject[]) => {
    console.log('updateSubjects called with:', newSubjects.length, 'subjects');
    setData(prev => {
      // Preserve startTime for active subjects when updating, but only if they're actually active
      const updatedSubjects = newSubjects.map(newSubject => {
        const existingSubject = prev.subjects.find(s => s.id === newSubject.id);
        // Only preserve startTime if the subject is currently active AND has a startTime
        if (existingSubject && existingSubject.isActive && existingSubject.startTime && newSubject.isActive) {
          return { ...newSubject, startTime: existingSubject.startTime };
        }
        // If the subject is not active, ensure startTime is undefined
        if (!newSubject.isActive) {
          return { ...newSubject, startTime: undefined };
        }
        return newSubject;
      });
      return { ...prev, subjects: updatedSubjects };
    });
  }, []);

  // Add a new time entry
  const addTimeEntry = useCallback((subjectId: string, startTime: number, endTime: number) => {
    const timeEntry = createTimeEntry(subjectId, startTime, endTime);
    setData(prev => ({
      ...prev,
      timeEntries: [...prev.timeEntries, timeEntry]
    }));
  }, []);

  // Add a manual time entry
  const addManualTimeEntry = useCallback((subjectId: string, durationMinutes: number) => {
    const timeEntry = createManualTimeEntry(subjectId, durationMinutes);
    setData(prev => ({
      ...prev,
      timeEntries: [...prev.timeEntries, timeEntry]
    }));
  }, []);

  // Start tracking time for a subject
  const startTracking = useCallback((subjectId: string) => {
    const startTime = Date.now();
    console.log('Starting tracking:', { subjectId, startTime });
    setData(prev => ({
      ...prev,
      subjects: prev.subjects.map(subject => 
        subject.id === subjectId 
          ? { ...subject, isActive: true, startTime }
          : { ...subject, isActive: false }
      )
    }));
  }, []);

  // Stop tracking time for a subject
  const stopTracking = useCallback((subjectId: string) => {
    // Prevent duplicate calls to stopTracking for the same subject
    if (stoppingRef.current.has(subjectId)) {
      console.log('stopTracking already in progress for:', subjectId);
      return;
    }
    
    stoppingRef.current.add(subjectId);
    console.log('stopTracking called with:', subjectId, new Error().stack?.split('\n').slice(1, 4).join('\n'));
    
    setData(prev => {
      const subject = prev.subjects.find(s => s.id === subjectId);
      if (!subject || !subject.startTime) {
        console.log('Stop tracking called but subject not found or not tracking:', { subjectId, subject });
        stoppingRef.current.delete(subjectId);
        return prev;
      }

      const endTime = Date.now();
      const duration = endTime - subject.startTime;
      const timeEntry = createTimeEntry(subjectId, subject.startTime, endTime);
      
      console.log('Stopping tracking:', {
        subjectId,
        subjectName: subject.name,
        startTime: subject.startTime,
        endTime,
        durationMs: duration,
        durationSeconds: Math.floor(duration / 1000)
      });
      
      return {
        ...prev,
        subjects: prev.subjects.map(s => 
          s.id === subjectId 
            ? { ...s, isActive: false, startTime: undefined }
            : s
        ),
        timeEntries: [...prev.timeEntries, timeEntry]
      };
    });
    
    // Clear the stopping flag after a short delay to allow the state update to complete
    setTimeout(() => {
      stoppingRef.current.delete(subjectId);
    }, 100);
  }, []);

  // Get time breakdown for a subject
  const getSubjectTimeBreakdown = useCallback((subjectId: string) => {
    return getTimeBreakdown(subjectId, data.timeEntries);
  }, [data.timeEntries]);

  // Get total time for a type
  const getTypeTotalTime = useCallback((typeId: string) => {
    const typeSubjects = data.subjects.filter(subject => subject.typeId === typeId);
    return typeSubjects.reduce((total, subject) => {
      const breakdown = getTimeBreakdown(subject.id, data.timeEntries);
      return total + breakdown.allTime;
    }, 0);
  }, [data.subjects, data.timeEntries]);

  // Get currently active subject
  const getActiveSubject = useCallback(() => {
    return data.subjects.find(subject => subject.isActive) || null;
  }, [data.subjects]);

  // Force refresh data from localStorage
  const refreshData = useCallback(() => {
    const loadedData = loadData();
    setData(loadedData);
  }, []);

  return {
    data,
    isLoading,
    updateTypes,
    updateSubjects,
    addTimeEntry,
    addManualTimeEntry,
    startTracking,
    stopTracking,
    getSubjectTimeBreakdown,
    getTypeTotalTime,
    getActiveSubject,
    refreshData
  };
}