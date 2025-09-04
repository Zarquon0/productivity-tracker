"use client";

import { useState, useEffect, useRef } from "react";
import { Clock, Plus, BookOpen, Briefcase, Code, GraduationCap, FolderOpen, Edit2, Settings, Target, Users, Calendar, FileText, Zap, Star, Heart, ShoppingCart, Camera, Music, Gamepad2, Palette, Calculator, Globe, Mail, Phone, MapPin, Video, Headphones, Coffee, Utensils, Car, Plane, Train, Bus, Bike, Dumbbell, Brain, Eye, Ear, Hand, Smile, Frown, Meh, ChevronDown, ChevronUp, MoreVertical } from "lucide-react";
import { usePersistentData } from "../hooks/usePersistentData";
import DataManager from "../components/DataManager";
import { Type, Subject } from "../lib/storage";

type TimeFrame = 'daily' | 'weekly' | 'monthly' | 'allTime';

export default function Home() {
  const {
    data,
    isLoading,
    updateTypes,
    updateSubjects,
    startTracking,
    stopTracking,
    getSubjectTimeBreakdown,
    getTypeTotalTime,
    getActiveSubject,
    refreshData,
    addManualTimeEntry
  } = usePersistentData();

  const [activeSubject, setActiveSubject] = useState<string | null>(null);
  const [editingSubject, setEditingSubject] = useState<string | null>(null);
  const [editingType, setEditingType] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [editingIcon, setEditingIcon] = useState<string | null>(null);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [selectedTimeFrame, setSelectedTimeFrame] = useState<TimeFrame>('daily');
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set());
  const [contextMenu, setContextMenu] = useState<{
    show: boolean;
    x: number;
    y: number;
    type: 'subject' | 'type';
    id: string;
  } | null>(null);

  // Helper: open context menu anchored to a DOM element (for mobile kebab buttons)
  const openContextMenuAtElement = (
    e: React.MouseEvent,
    entityType: 'subject' | 'type',
    id: string
  ) => {
    e.preventDefault();
    e.stopPropagation();
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    setContextMenu({
      show: true,
      x: rect.left + rect.width / 2,
      y: rect.top, // open above the button
      type: entityType,
      id
    });
  };

  // Removed old interval effect - now handled by forceUpdate

  const handleSubjectClick = (subjectId: string) => {
    const currentActive = getActiveSubject();
    
    console.log('Subject clicked:', { subjectId, currentActive: currentActive?.id });
    
    if (currentActive && currentActive.id === subjectId) {
      // Stop tracking current subject
      console.log('Stopping current subject');
      stopTracking(subjectId);
      setActiveSubject(null);
    } else {
      // Stop any current tracking and start new one
      if (currentActive) {
        console.log('Stopping previous subject before starting new one');
        stopTracking(currentActive.id);
      }
      console.log('Starting new subject');
      startTracking(subjectId);
      setActiveSubject(subjectId);
    }
  };

  // Force re-render for active timer display
  const [, forceUpdate] = useState({});
  useEffect(() => {
    if (activeSubject) {
      console.log('Setting up forceUpdate interval for:', activeSubject);
      const interval = setInterval(() => {
        forceUpdate({});
      }, 1000);
      return () => {
        console.log('Clearing forceUpdate interval for:', activeSubject);
        clearInterval(interval);
      };
    }
  }, [activeSubject]);

  const handleDragStart = (e: React.DragEvent, subjectId: string) => {
    e.dataTransfer.setData("subjectId", subjectId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetTypeId: string) => {
    e.preventDefault();
    const subjectId = e.dataTransfer.getData("subjectId");
    
    const updatedSubjects = data.subjects.map(subject => 
      subject.id === subjectId 
        ? { ...subject, typeId: targetTypeId }
        : subject
    );
    updateSubjects(updatedSubjects);
  };

  const addNewSubject = () => {
    const newSubject: Subject = {
      id: Date.now().toString(),
      name: `New Subject ${data.subjects.length + 1}`,
      typeId: data.types[0]?.id || "1",
      icon: "BookOpen",
      isActive: false,
      totalTime: 0
    };
    updateSubjects([...data.subjects, newSubject]);
  };

  const addNewType = () => {
    const newType: Type = {
      id: Date.now().toString(),
      name: `New Type ${data.types.length + 1}`,
      icon: "FolderOpen"
    };
    updateTypes([...data.types, newType]);
  };

  const availableIcons = [
    { name: "BookOpen", component: BookOpen, label: "Book" },
    { name: "Briefcase", component: Briefcase, label: "Work" },
    { name: "Code", component: Code, label: "Code" },
    { name: "GraduationCap", component: GraduationCap, label: "Education" },
    { name: "FolderOpen", component: FolderOpen, label: "Folder" },
    { name: "Clock", component: Clock, label: "Time" },
    { name: "Settings", component: Settings, label: "Settings" },
    { name: "Target", component: Target, label: "Target" },
    { name: "Users", component: Users, label: "People" },
    { name: "Calendar", component: Calendar, label: "Calendar" },
    { name: "FileText", component: FileText, label: "Document" },
    { name: "Zap", component: Zap, label: "Lightning" },
    { name: "Star", component: Star, label: "Star" },
    { name: "Heart", component: Heart, label: "Heart" },
    { name: "ShoppingCart", component: ShoppingCart, label: "Shopping" },
    { name: "Camera", component: Camera, label: "Camera" },
    { name: "Music", component: Music, label: "Music" },
    { name: "Gamepad2", component: Gamepad2, label: "Gaming" },
    { name: "Palette", component: Palette, label: "Art" },
    { name: "Calculator", component: Calculator, label: "Calculator" },
    { name: "Globe", component: Globe, label: "World" },
    { name: "Mail", component: Mail, label: "Email" },
    { name: "Phone", component: Phone, label: "Phone" },
    { name: "MapPin", component: MapPin, label: "Location" },
    { name: "Video", component: Video, label: "Video" },
    { name: "Headphones", component: Headphones, label: "Audio" },
    { name: "Coffee", component: Coffee, label: "Coffee" },
    { name: "Utensils", component: Utensils, label: "Food" },
    { name: "Car", component: Car, label: "Car" },
    { name: "Plane", component: Plane, label: "Plane" },
    { name: "Train", component: Train, label: "Train" },
    { name: "Bus", component: Bus, label: "Bus" },
    { name: "Bike", component: Bike, label: "Bike" },
    { name: "Dumbbell", component: Dumbbell, label: "Fitness" },
    { name: "Brain", component: Brain, label: "Brain" },
    { name: "Eye", component: Eye, label: "Eye" },
    { name: "Ear", component: Ear, label: "Ear" },
    { name: "Hand", component: Hand, label: "Hand" },
    { name: "Smile", component: Smile, label: "Happy" },
    { name: "Frown", component: Frown, label: "Sad" },
    { name: "Meh", component: Meh, label: "Neutral" },
  ];

  const getIconComponent = (iconName: string) => {
    const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
      BookOpen,
      Briefcase,
      Code,
      GraduationCap,
      FolderOpen,
      Clock,
      Settings,
      Target,
      Users,
      Calendar,
      FileText,
      Zap,
      Star,
      Heart,
      ShoppingCart,
      Camera,
      Music,
      Gamepad2,
      Palette,
      Calculator,
      Globe,
      Mail,
      Phone,
      MapPin,
      Video,
      Headphones,
      Coffee,
      Utensils,
      Car,
      Plane,
      Train,
      Bus,
      Bike,
      Dumbbell,
      Brain,
      Eye,
      Ear,
      Hand,
      Smile,
      Frown,
      Meh
    };
    return iconMap[iconName] || BookOpen;
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Get time for the selected timeframe
  const getTimeForTimeFrame = (subjectId: string, timeFrame: TimeFrame) => {
    const breakdown = getSubjectTimeBreakdown(subjectId);
    switch (timeFrame) {
      case 'daily':
        return breakdown.daily;
      case 'weekly':
        return breakdown.weekly;
      case 'monthly':
        return breakdown.monthly;
      case 'allTime':
        return breakdown.allTime;
      default:
        return breakdown.allTime;
    }
  };

  // Get type total time for the selected timeframe
  const getTypeTotalTimeForTimeFrame = (typeId: string, timeFrame: TimeFrame) => {
    const typeSubjects = data.subjects.filter(subject => subject.typeId === typeId);
    return typeSubjects.reduce((total, subject) => {
      const breakdown = getSubjectTimeBreakdown(subject.id);
      switch (timeFrame) {
        case 'daily':
          return total + breakdown.daily;
        case 'weekly':
          return total + breakdown.weekly;
        case 'monthly':
          return total + breakdown.monthly;
        case 'allTime':
          return total + breakdown.allTime;
        default:
          return total + breakdown.allTime;
      }
    }, 0);
  };

  // Toggle subject expansion
  const toggleSubjectExpansion = (subjectId: string) => {
    setExpandedSubjects(prev => {
      const newSet = new Set(prev);
      if (newSet.has(subjectId)) {
        newSet.delete(subjectId);
      } else {
        newSet.add(subjectId);
      }
      return newSet;
    });
  };

  // This function is now provided by the hook
  // const getTypeTotalTime = (typeId: string) => {
  //   return getTypeTotalTime(typeId);
  // };

  const handleSubjectRightClick = (e: React.MouseEvent, subjectId: string) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent body right-click from triggering
    // Right-click on text immediately starts editing
    const subject = data.subjects.find(s => s.id === subjectId);
    if (subject) {
      setEditingSubject(subjectId);
      setEditValue(subject.name);
    }
  };

  const handleTypeRightClick = (e: React.MouseEvent, typeId: string) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent body right-click from triggering
    // Right-click on text immediately starts editing
    const type = data.types.find(t => t.id === typeId);
    if (type) {
      setEditingType(typeId);
      setEditValue(type.name);
    }
  };



  const handleSubjectBodyRightClick = (e: React.MouseEvent, subjectId: string) => {
    e.preventDefault();
    handleContextMenu(e, 'subject', subjectId);
  };

  const handleTypeBodyRightClick = (e: React.MouseEvent, typeId: string) => {
    e.preventDefault();
    handleContextMenu(e, 'type', typeId);
  };

  const handleEditSave = () => {
    if (editingSubject) {
      const updatedSubjects = data.subjects.map(subject => 
        subject.id === editingSubject 
          ? { ...subject, name: editValue }
          : subject
      );
      updateSubjects(updatedSubjects);
      setEditingSubject(null);
    } else if (editingType) {
      const updatedTypes = data.types.map(type => 
        type.id === editingType 
          ? { ...type, name: editValue }
          : type
      );
      updateTypes(updatedTypes);
      setEditingType(null);
    }
    setEditValue("");
  };

  const handleEditCancel = () => {
    setEditingSubject(null);
    setEditingType(null);
    setEditValue("");
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleEditSave();
    } else if (e.key === "Escape") {
      handleEditCancel();
    }
  };

  const handleTypeIconClick = (e: React.MouseEvent, typeId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingIcon(typeId);
    setShowIconPicker(true);
  };

  const handleIconSelect = (iconName: string) => {
    if (editingIcon) {
      // Only editing types now since we removed subject icons
      const updatedTypes = data.types.map(type => 
        type.id === editingIcon 
          ? { ...type, icon: iconName }
          : type
      );
      updateTypes(updatedTypes);
    }
    setEditingIcon(null);
    setShowIconPicker(false);
  };

  const handleIconPickerClose = () => {
    setEditingIcon(null);
    setShowIconPicker(false);
  };

  const handleContextMenu = (e: React.MouseEvent, type: 'subject' | 'type', id: string) => {
    e.preventDefault();
    setContextMenu({
      show: true,
      x: e.clientX,
      y: e.clientY,
      type,
      id
    });
  };

  const handleContextMenuClose = () => {
    setContextMenu(null);
  };

  const handleDelete = () => {
    if (!contextMenu) return;

    if (contextMenu.type === 'subject') {
      const updatedSubjects = data.subjects.filter(subject => subject.id !== contextMenu.id);
      updateSubjects(updatedSubjects);
      // If the deleted subject was active, clear the active subject
      if (activeSubject === contextMenu.id) {
        setActiveSubject(null);
      }
    } else {
      // Delete type and move all its subjects to the first remaining type
      const remainingTypes = data.types.filter(type => type.id !== contextMenu.id);
      if (remainingTypes.length > 0) {
        const firstTypeId = remainingTypes[0].id;
        const updatedSubjects = data.subjects.map(subject => 
          subject.typeId === contextMenu.id 
            ? { ...subject, typeId: firstTypeId }
            : subject
        );
        updateSubjects(updatedSubjects);
        updateTypes(remainingTypes);
      }
    }
    setContextMenu(null);
  };

  const handleEdit = () => {
    if (!contextMenu) return;

    if (contextMenu.type === 'subject') {
      const subject = data.subjects.find(s => s.id === contextMenu.id);
      if (subject) {
        setEditingSubject(contextMenu.id);
        setEditValue(subject.name);
      }
    } else {
      const type = data.types.find(t => t.id === contextMenu.id);
      if (type) {
        setEditingType(contextMenu.id);
        setEditValue(type.name);
      }
    }
    setContextMenu(null);
  };

  const handleEditIcon = () => {
    if (!contextMenu) return;
    
    // Only available for types since subjects don't have icons anymore
    if (contextMenu.type === 'type') {
      setEditingIcon(contextMenu.id);
      setShowIconPicker(true);
    }
    setContextMenu(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6 pb-24">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-white">Productivity Tracker</h1>
            
            {/* Timeframe Selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">View:</span>
              <div className="relative">
                <select
                  value={selectedTimeFrame}
                  onChange={(e) => setSelectedTimeFrame(e.target.value as TimeFrame)}
                  className="bg-gray-800 border border-gray-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-blue-400 cursor-pointer appearance-none pr-10 text-sm font-medium"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="allTime">All Time</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
          <p className="text-gray-400">Organize and track your work across different types</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {data.types.map(type => (
            <div
              key={type.id}
              className="bg-gray-800 rounded-lg p-6 border border-gray-700"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, type.id)}
            >
              <div 
                className="flex items-center justify-between mb-4"
                onContextMenu={(e) => handleTypeBodyRightClick(e, type.id)}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="cursor-pointer hover:bg-gray-700 p-1 rounded transition-colors"
                    onClick={(e) => handleTypeIconClick(e, type.id)}
                    onContextMenu={(e) => handleTypeIconClick(e, type.id)}
                    title="Click or right-click to change icon"
                  >
                    {(() => {
                      const IconComponent = getIconComponent(type.icon);
                      return <IconComponent className="w-5 h-5 text-blue-400" />;
                    })()}
                  </div>
                  {editingType === type.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={handleEditKeyDown}
                        onBlur={handleEditSave}
                        className="text-xl font-semibold text-white bg-transparent border-b border-blue-400 focus:outline-none focus:border-blue-300"
                        autoFocus
                      />
                      <button
                        onClick={handleEditSave}
                        className="p-1 text-blue-400 hover:text-blue-300"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <h2 
                      className="text-xl font-semibold text-white cursor-pointer hover:text-blue-300 transition-colors"
                      onContextMenu={(e) => handleTypeRightClick(e, type.id)}
                    >
                      {type.name}
                    </h2>
                  )}
                </div>
                
                {getTypeTotalTimeForTimeFrame(type.id, selectedTimeFrame) > 0 && (
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <Clock className="w-4 h-4" />
                    <span className="font-mono">
                      {formatTime(getTypeTotalTimeForTimeFrame(type.id, selectedTimeFrame))}
                    </span>
                  </div>
                )}
                {/* Mobile-only more button for type actions */}
                <button
                  className="md:hidden p-2 ml-2 text-gray-300 hover:text-white rounded"
                  aria-label="More actions"
                  onClick={(e) => openContextMenuAtElement(e, 'type', type.id)}
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-2">
                {data.subjects
                  .filter(subject => subject.typeId === type.id)
                  .map(subject => {
                    const timeBreakdown = getSubjectTimeBreakdown(subject.id);
                    const timeForTimeFrame = getTimeForTimeFrame(subject.id, selectedTimeFrame);
                    
                    // Calculate current time: accumulated time + current session time (if active)
                    let currentTime = timeForTimeFrame;
                    if (subject.isActive && subject.startTime) {
                      const sessionTime = Math.floor((Date.now() - subject.startTime) / 1000);
                      currentTime += sessionTime;
                    }
                    
                    const isExpanded = expandedSubjects.has(subject.id);
                    
                    return (
                    <div
                      key={subject.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, subject.id)}
                      className={`
                        rounded-lg border transition-all overflow-hidden
                        ${subject.isActive 
                          ? 'bg-blue-600 border-blue-500' 
                          : 'bg-gray-700 border-gray-600'
                        }
                      `}
                    >
                      <div
                        onClick={() => handleSubjectClick(subject.id)}
                        onContextMenu={(e) => handleSubjectBodyRightClick(e, subject.id)}
                        className="flex items-center justify-between p-3 cursor-pointer hover:bg-opacity-80 transition-colors"
                      >
                        <div className="flex items-center">
                          {editingSubject === subject.id ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onKeyDown={handleEditKeyDown}
                                onBlur={handleEditSave}
                                className={`font-medium bg-transparent border-b border-blue-400 focus:outline-none focus:border-blue-300 ${
                                  subject.isActive ? 'text-white' : 'text-gray-200'
                                }`}
                                autoFocus
                              />
                              <button
                                onClick={handleEditSave}
                                className="p-1 text-blue-400 hover:text-blue-300"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <span 
                              className={`font-medium cursor-pointer hover:text-blue-300 transition-colors ${
                                subject.isActive ? 'text-white' : 'text-gray-200'
                              }`}
                              onContextMenu={(e) => handleSubjectRightClick(e, subject.id)}
                            >
                              {subject.name}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {(currentTime > 0 || subject.isActive) && (
                            <div className="flex items-center gap-1 text-sm">
                              <Clock className="w-3 h-3 text-gray-400" />
                              <span className="text-gray-300 font-mono">
                                {formatTime(currentTime)}
                              </span>
                            </div>
                          )}
                          
                          {/* Time breakdown dropdown button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSubjectExpansion(subject.id);
                            }}
                            className="p-1 hover:bg-gray-600 rounded transition-colors"
                            title="View time breakdown"
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-gray-400" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-gray-400" />
                            )}
                          </button>

                          {/* Mobile-only more button for subject actions */}
                          <button
                            className="md:hidden p-1 hover:bg-gray-600 rounded"
                            aria-label="More actions"
                            onClick={(e) => openContextMenuAtElement(e, 'subject', subject.id)}
                          >
                            <MoreVertical className="w-4 h-4 text-gray-300" />
                          </button>
                        </div>
                      </div>
                      
                      {/* Expanded time breakdown */}
                      {isExpanded && (
                        <div className="px-3 pb-3 border-t border-gray-600 bg-gray-800 rounded-b-lg">
                          <div className="pt-3 space-y-2 text-sm">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-300">Daily:</span>
                              <span className="font-mono text-gray-200">
                                {formatTime(timeBreakdown.daily)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-300">Weekly:</span>
                              <span className="font-mono text-gray-200">
                                {formatTime(timeBreakdown.weekly)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-300">Monthly:</span>
                              <span className="font-mono text-gray-200">
                                {formatTime(timeBreakdown.monthly)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-300">All Time:</span>
                              <span className="font-mono text-gray-200">
                                {formatTime(timeBreakdown.allTime)}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex gap-4 justify-center">
          <button
            onClick={addNewSubject}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add New Subject
          </button>
          
          <button
            onClick={addNewType}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add New Type
          </button>
        </div>

        {/* Sticky DataManager is rendered globally; no inline section here */}

        {activeSubject && (
          <div className="mt-6 p-4 bg-blue-600 rounded-lg">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-white" />
              <span className="text-white font-medium">
                Currently tracking: {data.subjects.find(s => s.id === activeSubject)?.name}
              </span>
            </div>
          </div>
        )}

         {/* Icon Picker Modal */}
         {showIconPicker && (
           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
             <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
               <div className="flex items-center justify-between mb-4">
                 <h3 className="text-xl font-semibold text-white">Choose an Icon</h3>
                 <button
                   onClick={handleIconPickerClose}
                   className="text-gray-400 hover:text-white transition-colors"
                 >
                   ✕
                 </button>
               </div>
               
               <div className="grid grid-cols-6 gap-3">
                 {availableIcons.map((icon) => (
                   <button
                     key={icon.name}
                     onClick={() => handleIconSelect(icon.name)}
                     className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-gray-700 transition-colors group"
                     title={icon.label}
                   >
                     <icon.component className="w-6 h-6 text-gray-300 group-hover:text-blue-400" />
                     <span className="text-xs text-gray-400 group-hover:text-gray-300">
                       {icon.label}
                     </span>
                   </button>
                 ))}
               </div>
             </div>
           </div>
         )}

         {/* Context Menu */}
         {contextMenu && (
           <div 
             className="fixed z-50 bg-gray-800 border border-gray-600 rounded-lg shadow-lg py-1 min-w-[150px]"
             style={{ 
               left: contextMenu.x, 
               top: contextMenu.y,
               transform: 'translate(-50%, -100%)'
             }}
           >
             <button
               onClick={handleEdit}
               className="w-full px-4 py-2 text-left text-gray-200 hover:bg-gray-700 transition-colors flex items-center gap-2"
             >
               <Edit2 className="w-4 h-4" />
               Edit {contextMenu.type === 'subject' ? 'Subject' : 'Type'}
             </button>
             {contextMenu.type === 'type' && (
               <button
                 onClick={handleEditIcon}
                 className="w-full px-4 py-2 text-left text-gray-200 hover:bg-gray-700 transition-colors flex items-center gap-2"
               >
                 <span className="text-blue-400">🎨</span>
                 Edit Icon
               </button>
             )}
             <button
               onClick={handleDelete}
               className="w-full px-4 py-2 text-left text-red-400 hover:bg-gray-700 transition-colors flex items-center gap-2"
             >
               <span className="text-red-400">🗑</span>
               Delete {contextMenu.type === 'subject' ? 'Subject' : 'Type'}
             </button>
           </div>
         )}

         {/* Click outside to close context menu */}
         {contextMenu && (
           <div 
             className="fixed inset-0 z-40" 
             onClick={handleContextMenuClose}
           />
         )}
      </div>
      {/* Sticky Data Manager (fixed footer) */}
      <DataManager 
        onDataImported={refreshData}
        subjects={data.subjects.map(s => ({ id: s.id, name: s.name }))}
        onAddManualTime={addManualTimeEntry}
      />
    </div>
  );
}
