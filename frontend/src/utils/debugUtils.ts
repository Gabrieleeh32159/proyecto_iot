/**
 * Utility functions for testing and debugging
 * Available in browser console
 */

import { incidentStorage, type StoredIncident } from '../services/incidentStorage';

// Make utilities available globally for console debugging
if (typeof window !== 'undefined') {
  (window as any).incidentUtils = {
    
    // View all stored incidents
    viewIncidents: () => {
      const incidents = incidentStorage.loadIncidents();
      console.table(incidents.map((i: StoredIncident) => ({
        id: i.id,
        timestamp: i.timestamp,
        weaponType: i.weaponType,
        confidence: `${(i.confidence * 100).toFixed(1)}%`,
        severity: i.severity,
        duration: i.duration ? `${i.duration}s` : 'N/A'
      })));
      return incidents;
    },
    
    // View statistics
    viewStats: () => {
      const stats = incidentStorage.getStats();
      console.log('📊 Statistics:', stats);
      return stats;
    },
    
    // Clear all incidents (use with caution!)
    clearAll: () => {
      if (confirm('⚠️ Are you sure you want to delete ALL incidents?')) {
        incidentStorage.clearAllIncidents();
        console.log('✅ All incidents cleared');
        window.location.reload();
      }
    },
    
    // Delete old incidents
    deleteOld: (days: number = 30) => {
      const deleted = incidentStorage.deleteOldIncidents(days);
      console.log(`🗑️ Deleted ${deleted} incidents older than ${days} days`);
      return deleted;
    },
    
    // Export incidents as JSON
    exportJSON: () => {
      const incidents = incidentStorage.loadIncidents();
      const dataStr = JSON.stringify(incidents, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `incidents_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      console.log('📥 Incidents exported');
    },
    
    // Get raw localStorage data
    getRaw: () => {
      return {
        incidents: localStorage.getItem('weapon_incidents'),
        stats: localStorage.getItem('weapon_stats')
      };
    },
    
    // Show help
    help: () => {
      console.log(`
🛠️ Incident Utils - Available Commands:

incidentUtils.viewIncidents()     - View all incidents in table
incidentUtils.viewStats()          - View statistics
incidentUtils.clearAll()           - Clear all incidents (with confirmation)
incidentUtils.deleteOld(30)        - Delete incidents older than X days
incidentUtils.exportJSON()         - Export incidents as JSON file
incidentUtils.getRaw()             - Get raw localStorage data
incidentUtils.help()               - Show this help

Example usage:
  incidentUtils.viewIncidents()
  incidentUtils.deleteOld(7)  // Delete older than 7 days
      `);
    }
  };
  
  console.log('🛠️ Incident Utils loaded! Type "incidentUtils.help()" for commands');
}

export {};
