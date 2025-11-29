/**
 * Incident Storage Service - Manages persistence of incidents in localStorage
 */

export interface StoredIncident {
  id: number;
  timestamp: string;
  location: string;
  weaponType: string;
  imageUrl: string;
  severity: 'high' | 'medium' | 'low';
  confidence: number;
  duration?: number; // Duration in seconds
  bbox?: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  };
}

export interface IncidentStats {
  total: number;
  thisMonth: number;
  totalSeconds: number; // Total seconds of all incidents
  monthlySeconds: number; // Seconds this month
  monthlyCost: number; // Cost in USD ($0.01 per second)
  lastUpdate: string;
}

const STORAGE_KEY = 'weapon_incidents';
const STATS_KEY = 'weapon_stats';
const MAX_INCIDENTS = 200; // Maximum incidents to store

class IncidentStorageService {
  /**
   * Load all incidents from localStorage
   */
  loadIncidents(): StoredIncident[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];
      
      const incidents = JSON.parse(data);
      return Array.isArray(incidents) ? incidents : [];
    } catch (error) {
      console.error('[Storage] Error loading incidents:', error);
      return [];
    }
  }

  /**
   * Save a new incident to localStorage
   */
  saveIncident(incident: StoredIncident): void {
    try {
      const incidents = this.loadIncidents();
      
      // Add new incident at the beginning
      incidents.unshift(incident);
      
      // Limit total stored incidents
      if (incidents.length > MAX_INCIDENTS) {
        incidents.splice(MAX_INCIDENTS);
      }
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(incidents));
      
      // Update stats
      this.updateStats();
      
      console.log('[Storage] Incident saved:', incident.id);
    } catch (error) {
      console.error('[Storage] Error saving incident:', error);
    }
  }

  /**
   * Get incidents with pagination
   */
  getIncidentsByPage(page: number, perPage: number): {
    incidents: StoredIncident[];
    totalPages: number;
    total: number;
  } {
    const allIncidents = this.loadIncidents();
    const total = allIncidents.length;
    const totalPages = Math.ceil(total / perPage);
    
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    const incidents = allIncidents.slice(startIndex, endIndex);
    
    return { incidents, totalPages, total };
  }

  /**
   * Get statistics
   */
  getStats(): IncidentStats {
    try {
      const data = localStorage.getItem(STATS_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('[Storage] Error loading stats:', error);
    }
    
    // If no stats, calculate from incidents
    return this.calculateStats();
  }

  /**
   * Calculate and update statistics
   */
  private updateStats(): void {
    const stats = this.calculateStats();
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  }

  /**
   * Calculate statistics from incidents
   */
  private calculateStats(): IncidentStats {
    const incidents = this.loadIncidents();
    const now = new Date();
    const monthAgo = new Date(now.getFullYear(), now.getMonth(), 1);
    
    console.log(`[Stats] Calculating stats for ${incidents.length} total incidents`);
    console.log(`[Stats] Month start: ${monthAgo.toISOString()}`);
    
    const incidentsThisMonth = incidents.filter(
      inc => new Date(inc.timestamp) >= monthAgo
    );
    
    console.log(`[Stats] Found ${incidentsThisMonth.length} incidents this month`);
    
    // Calculate total seconds for all incidents
    const totalSeconds = incidents.reduce(
      (sum, inc) => {
        const dur = inc.duration || 0;
        console.log(`[Stats] Incident ${inc.id}: duration=${dur}s, timestamp=${inc.timestamp}`);
        return sum + dur;
      },
      0
    );
    
    // Calculate seconds for this month
    const monthlySeconds = incidentsThisMonth.reduce(
      (sum, inc) => {
        const dur = inc.duration || 0;
        console.log(`[Stats] Monthly incident ${inc.id}: duration=${dur}s`);
        return sum + dur;
      },
      0
    );
    
    // Calculate cost: $0.01 per second
    const monthlyCost = monthlySeconds * 0.01;
    
    console.log(`[Stats] ===== SUMMARY =====`);
    console.log(`[Stats] Total incidents: ${incidents.length}`);
    console.log(`[Stats] This month: ${incidentsThisMonth.length}`);
    console.log(`[Stats] Total seconds: ${totalSeconds}s`);
    console.log(`[Stats] Monthly seconds: ${monthlySeconds}s`);
    console.log(`[Stats] Monthly cost: $${monthlyCost.toFixed(2)}`);
    console.log(`[Stats] ====================`);
    
    return {
      total: incidents.length,
      thisMonth: incidentsThisMonth.length,
      totalSeconds,
      monthlySeconds,
      monthlyCost,
      lastUpdate: new Date().toISOString()
    };
  }

  /**
   * Clear all incidents (for testing/reset)
   */
  clearAllIncidents(): void {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STATS_KEY);
    console.log('[Storage] All incidents cleared');
  }

  /**
   * Delete old incidents (older than X days)
   */
  deleteOldIncidents(daysOld: number = 30): number {
    const incidents = this.loadIncidents();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    const filtered = incidents.filter(
      inc => new Date(inc.timestamp) >= cutoffDate
    );
    
    const deletedCount = incidents.length - filtered.length;
    
    if (deletedCount > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      this.updateStats();
      console.log(`[Storage] Deleted ${deletedCount} old incidents`);
    }
    
    return deletedCount;
  }
}

// Export singleton instance
export const incidentStorage = new IncidentStorageService();
