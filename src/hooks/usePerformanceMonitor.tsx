import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

interface PerformanceMetrics {
  queryTimes: number[];
  averageQueryTime: number;
  errorCount: number;
  connectionIssues: number;
  lastError: Error | null;
  isHealthy: boolean;
}

interface QueryMetric {
  operation: string;
  duration: number;
  success: boolean;
  timestamp: Date;
  error?: Error;
}

export const usePerformanceMonitor = () => {
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    queryTimes: [],
    averageQueryTime: 0,
    errorCount: 0,
    connectionIssues: 0,
    lastError: null,
    isHealthy: true
  });
  
  const recentQueries = useRef<QueryMetric[]>([]);
  const maxMetricsHistory = 100;

  // Track query performance
  const trackQuery = useCallback((operation: string, startTime: number, success: boolean, error?: Error) => {
    const duration = Date.now() - startTime;
    
    const queryMetric: QueryMetric = {
      operation,
      duration,
      success,
      timestamp: new Date(),
      error
    };
    
    // Add to recent queries
    recentQueries.current.push(queryMetric);
    if (recentQueries.current.length > maxMetricsHistory) {
      recentQueries.current = recentQueries.current.slice(-maxMetricsHistory);
    }
    
    // Update metrics
    setMetrics(prev => {
      const newQueryTimes = [...prev.queryTimes, duration].slice(-50); // Keep last 50 query times
      const averageQueryTime = newQueryTimes.reduce((sum, time) => sum + time, 0) / newQueryTimes.length;
      const errorCount = success ? prev.errorCount : prev.errorCount + 1;
      
      // Check if system is healthy
      const recentErrors = recentQueries.current
        .filter(q => q.timestamp.getTime() > Date.now() - 5 * 60 * 1000) // Last 5 minutes
        .filter(q => !q.success).length;
      
      const isHealthy = recentErrors < 5 && averageQueryTime < 5000; // Less than 5 errors in 5 min and avg < 5s
      
      return {
        queryTimes: newQueryTimes,
        averageQueryTime,
        errorCount,
        connectionIssues: prev.connectionIssues,
        lastError: error || prev.lastError,
        isHealthy
      };
    });
    
    // Show performance warnings
    if (!success && error) {
      console.error(`Query failed for ${operation}:`, error);
      
      // Show toast for critical errors
      if (error.message.includes('timeout') || error.message.includes('connection')) {
        toast({
          title: "Performance Issue",
          description: `Slow response detected for ${operation}. System may be under heavy load.`,
          variant: "destructive",
          duration: 5000
        });
      }
    }
    
    // Log slow queries
    if (duration > 3000) {
      console.warn(`Slow query detected: ${operation} took ${duration}ms`);
    }
  }, [toast]);

  // Track connection issues
  const trackConnectionIssue = useCallback((issue: string) => {
    console.warn('Connection issue detected:', issue);
    
    setMetrics(prev => ({
      ...prev,
      connectionIssues: prev.connectionIssues + 1,
      isHealthy: false
    }));
    
    toast({
      title: "Connection Issue",
      description: issue,
      variant: "destructive",
      duration: 8000
    });
  }, [toast]);

  // Create a wrapper for timing database operations
  const timeOperation = useCallback(<T,> (
    operation: string,
    asyncFn: () => Promise<T>
  ): Promise<T> => {
    const startTime = Date.now();
    
    return asyncFn()
      .then(result => {
        trackQuery(operation, startTime, true);
        return result;
      })
      .catch(error => {
        trackQuery(operation, startTime, false, error);
        throw error;
      });
  }, [trackQuery]);

  // Get performance report
  const getPerformanceReport = useCallback(() => {
    const recent = recentQueries.current.filter(q => 
      q.timestamp.getTime() > Date.now() - 10 * 60 * 1000 // Last 10 minutes
    );
    
    const successRate = recent.length > 0 
      ? (recent.filter(q => q.success).length / recent.length) * 100 
      : 100;
    
    const slowQueries = recent.filter(q => q.duration > 2000);
    
    return {
      totalQueries: recent.length,
      successRate: Math.round(successRate),
      slowQueries: slowQueries.length,
      averageTime: metrics.averageQueryTime,
      isHealthy: metrics.isHealthy,
      recentErrors: recent.filter(q => !q.success).slice(-5) // Last 5 errors
    };
  }, [metrics]);

  // Monitor memory usage
  useEffect(() => {
    const monitorMemory = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const usedMB = Math.round(memory.usedJSHeapSize / 1048576);
        const limitMB = Math.round(memory.jsHeapSizeLimit / 1048576);
        
        if (usedMB > limitMB * 0.8) { // 80% of limit
          console.warn(`High memory usage: ${usedMB}MB / ${limitMB}MB`);
          toast({
            title: "High Memory Usage",
            description: "The application is using significant memory. Consider refreshing the page.",
            variant: "destructive"
          });
        }
      }
    };
    
    const interval = setInterval(monitorMemory, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [toast]);

  // Auto-reset metrics periodically
  useEffect(() => {
    const resetInterval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        errorCount: 0,
        connectionIssues: 0,
        isHealthy: true
      }));
      
      // Keep only recent queries
      recentQueries.current = recentQueries.current.filter(q => 
        q.timestamp.getTime() > Date.now() - 30 * 60 * 1000 // Last 30 minutes
      );
    }, 30 * 60 * 1000); // Reset every 30 minutes
    
    return () => clearInterval(resetInterval);
  }, []);

  return {
    metrics,
    timeOperation,
    trackConnectionIssue,
    getPerformanceReport
  };
};
