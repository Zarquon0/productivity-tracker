"use client";

import { useState, useRef } from 'react';
import { Download, Upload, Trash2, Database, AlertTriangle, FileText, Clock, ChevronDown } from 'lucide-react';
import { exportData, importData, clearData, getStorageInfo } from '../lib/storage';

interface DataManagerProps {
  onDataImported: () => void;
  subjects: Array<{ id: string; name: string }>;
  onAddManualTime: (subjectId: string, durationMinutes: number) => void;
}

export default function DataManager({ onDataImported, subjects, onAddManualTime }: DataManagerProps) {
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [importMethod, setImportMethod] = useState<'paste' | 'file'>('paste');
  const [showManualTimeModal, setShowManualTimeModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [timeInput, setTimeInput] = useState('');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `productivity-app-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    if (importMethod === 'paste') {
      if (!importText.trim()) {
        setImportError('Please paste the exported data');
        return;
      }
    }

    const result = importData(importText);
    if (result.success) {
      setImportText('');
      setImportError('');
      setShowImportModal(false);
      onDataImported();
    } else {
      setImportError(result.error || 'Import failed');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setImportText(content);
      setImportMethod('file');
      setImportError('');
    };
    reader.onerror = () => {
      setImportError('Failed to read file');
    };
    reader.readAsText(file);
  };

  const handleClearData = () => {
    clearData();
    setShowClearConfirm(false);
    onDataImported();
  };

  // Close mobile menu when clicking outside
  const handleClickOutside = (e: React.MouseEvent) => {
    if (showMobileMenu) {
      setShowMobileMenu(false);
    }
  };

  const storageInfo = getStorageInfo();

  return (
    <>
      {/* Sticky Footer Bar */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-gray-900/90 backdrop-blur border-t border-gray-700">
        <div className="max-w-6xl mx-auto px-4">
          {/* Desktop Layout (horizontal) */}
          <div className="hidden md:flex items-center gap-3 justify-between py-2">
            {/* Title */}
            <div className="flex items-center gap-2 min-w-0">
              <Database className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-semibold text-white truncate">Data Management</h3>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => setShowManualTimeModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors text-xs"
                title="Add manual time entry"
              >
                <Clock className="w-3.5 h-3.5" />
                Add Time
              </button>
              <button
                onClick={handleExport}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors text-xs"
              >
                <Download className="w-3.5 h-3.5" />
                Export
              </button>
              <button
                onClick={() => setShowImportModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors text-xs"
              >
                <Upload className="w-3.5 h-3.5" />
                Import
              </button>
              <button
                onClick={() => setShowClearConfirm(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors text-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear
              </button>
            </div>

            {/* Storage Usage */}
            <div className="flex items-center gap-2 min-w-[140px] justify-end">
              <div className="w-24 bg-gray-700 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-2 rounded-full ${
                    storageInfo.percentage > 80 ? 'bg-red-500' :
                    storageInfo.percentage > 60 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(storageInfo.percentage, 100)}%` }}
                />
              </div>
              <span className="text-xs text-gray-400 tabular-nums">
                {Math.round(storageInfo.percentage)}%
              </span>
            </div>
          </div>

          {/* Mobile Layout (dropdown menu) */}
          <div className="md:hidden py-2">
            <div className="flex items-center justify-center">
              <div className="relative">
                <button
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg text-white transition-colors"
                >
                  <Database className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-semibold">Data Management</span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showMobileMenu ? 'rotate-180' : ''}`} />
                </button>
                
                {/* Mobile Dropdown Menu */}
                {showMobileMenu && (
                  <>
                    {/* Backdrop to close menu when clicking outside */}
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setShowMobileMenu(false)}
                    />
                    
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-800 border border-gray-600 rounded-lg shadow-lg py-2 min-w-[200px] z-50">
                      <button
                        onClick={() => {
                          setShowManualTimeModal(true);
                          setShowMobileMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-gray-200 hover:bg-gray-700 transition-colors flex items-center gap-2"
                      >
                        <Clock className="w-4 h-4 text-purple-400" />
                        Add Time
                      </button>
                      <button
                        onClick={() => {
                          handleExport();
                          setShowMobileMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-gray-200 hover:bg-gray-700 transition-colors flex items-center gap-2"
                      >
                        <Download className="w-4 h-4 text-blue-400" />
                        Export Data
                      </button>
                      <button
                        onClick={() => {
                          setShowImportModal(true);
                          setShowMobileMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-gray-200 hover:bg-gray-700 transition-colors flex items-center gap-2"
                      >
                        <Upload className="w-4 h-4 text-green-400" />
                        Import Data
                      </button>
                      <button
                        onClick={() => {
                          setShowClearConfirm(true);
                          setShowMobileMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-gray-200 hover:bg-gray-700 transition-colors flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                        Clear All Data
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

              {/* Import Modal */}
        {showImportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white">Import Data</h3>
                <button
                  onClick={() => {
                    setShowImportModal(false);
                    setImportText('');
                    setImportError('');
                    setImportMethod('paste');
                  }}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                {/* Import Method Tabs */}
                <div className="flex border-b border-gray-600">
                  <button
                    onClick={() => setImportMethod('paste')}
                    className={`px-4 py-2 border-b-2 transition-colors ${
                      importMethod === 'paste' 
                        ? 'border-blue-400 text-blue-400' 
                        : 'border-transparent text-gray-400 hover:text-gray-300'
                    }`}
                  >
                    <Upload className="w-4 h-4 inline mr-2" />
                    Paste JSON
                  </button>
                  <button
                    onClick={() => setImportMethod('file')}
                    className={`px-4 py-2 border-b-2 transition-colors ${
                      importMethod === 'file' 
                        ? 'border-blue-400 text-blue-400' 
                        : 'border-transparent text-gray-400 hover:text-gray-300'
                    }`}
                  >
                    <FileText className="w-4 h-4 inline mr-2" />
                    Upload File
                  </button>
                </div>

                {/* File Upload Section */}
                {importMethod === 'file' && (
                  <div className="space-y-3">
                    <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".json"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors mx-auto"
                      >
                        <FileText className="w-4 h-4" />
                        Choose JSON File
                      </button>
                      <p className="text-gray-400 text-sm mt-2">
                        Select a previously exported JSON file
                      </p>
                    </div>
                    
                    {importText && (
                      <div className="p-3 bg-gray-700 rounded-lg">
                        <p className="text-green-400 text-sm mb-2">✓ File loaded successfully</p>
                        <p className="text-gray-300 text-xs font-mono truncate">
                          {importText.substring(0, 100)}...
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Paste Section */}
                {importMethod === 'paste' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Paste exported data here:
                    </label>
                    <textarea
                      value={importText}
                      onChange={(e) => setImportText(e.target.value)}
                      className="w-full h-32 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                      placeholder="Paste the JSON data from your exported file..."
                    />
                  </div>
                )}
                
                {importError && (
                  <div className="flex items-center gap-2 p-3 bg-red-900/50 border border-red-500 rounded-lg">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    <span className="text-red-400 text-sm">{importError}</span>
                  </div>
                )}
                
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => {
                      setShowImportModal(false);
                      setImportText('');
                      setImportError('');
                      setImportMethod('paste');
                    }}
                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleImport}
                    disabled={!importText.trim()}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                  >
                    Import Data
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      {/* Clear Data Confirmation */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-400" />
              <h3 className="text-xl font-semibold text-white">Clear All Data</h3>
            </div>
            
            <p className="text-gray-300 mb-6">
              This will permanently delete all your types, subjects, and time tracking data. 
              This action cannot be undone. Make sure you have exported your data if you want to keep it.
            </p>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleClearData}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Clear All Data
              </button>
            </div>
          </div>
                  </div>
        )}

        {/* Manual Time Entry Modal */}
        {showManualTimeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white">Add Manual Time Entry</h3>
                <button
                  onClick={() => {
                    setShowManualTimeModal(false);
                    setSelectedSubject('');
                    setTimeInput('');
                  }}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Select Subject:
                  </label>
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Choose a subject...</option>
                    {subjects.map(subject => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Time Duration (minutes):
                  </label>
                  <input
                    type="number"
                    value={timeInput}
                    onChange={(e) => setTimeInput(e.target.value)}
                    placeholder="e.g., 30"
                    min="1"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
                
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => {
                      setShowManualTimeModal(false);
                      setSelectedSubject('');
                      setTimeInput('');
                    }}
                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (selectedSubject && timeInput) {
                        const duration = parseInt(timeInput);
                        if (duration > 0) {
                          onAddManualTime(selectedSubject, duration);
                          setShowManualTimeModal(false);
                          setSelectedSubject('');
                          setTimeInput('');
                        }
                      }
                    }}
                    disabled={!selectedSubject || !timeInput || parseInt(timeInput) <= 0}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                  >
                    Add Time
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
}