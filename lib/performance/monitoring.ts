// Performance monitoring system
import { NextRequest, NextResponse } from 'next/server';
import { log } from '@/lib/logging/logger';

// Performance metrics collection
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, PerformanceMetric[]> = new Map();
  private readonly maxMetricsPerEndpoint = 100;

  private constructor() {}

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  public recordMetric(endpoint: string, metric: PerformanceMetric): void {
    const endpointMetrics = this.metrics.get(endpoint) || [];
    
    // Keep only the most recent metrics
    if (endpointMetrics.length >= this.maxMetricsPerEndpoint) {
      endpointMetrics.shift();
    }
    
    endpointMetrics.push(metric);
    this.metrics.set(endpoint, endpointMetrics);

    // Log performance metric
    log.performanceMetric(
      `api_response_time`,
      metric.duration,
      'ms',
      {
        endpoint,
        method: metric.method,
        status: metric.statusCode.toString(),
      }
    );
  }

  public getMetrics(endpoint: string): PerformanceMetric[] {
    return this.metrics.get(endpoint) || [];
  }

  public getAverageResponseTime(endpoint: string): number {
    const metrics = this.getMetrics(endpoint);
    if (metrics.length === 0) return 0;
    
    const total = metrics.reduce((sum, metric) => sum + metric.duration, 0);
    return total / metrics.length;
  }

  public getPercentile(endpoint: string, percentile: number): number {
    const metrics = this.getMetrics(endpoint);
    if (metrics.length === 0) return 0;
    
    const sorted = metrics.map(m => m.duration).sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[index] || 0;
  }

  public getAllEndpointStats(): Record<string, EndpointStats> {
    const stats: Record<string, EndpointStats> = {};
    
    this.metrics.forEach((metrics, endpoint) => {
      if (metrics.length === 0) return;
      
      const durations = metrics.map(m => m.duration);
      const statusCodes = metrics.map(m => m.statusCode);
      
      stats[endpoint] = {
        requestCount: metrics.length,
        averageResponseTime: durations.reduce((a, b) => a + b, 0) / durations.length,
        p50: this.getPercentile(endpoint, 50),
        p95: this.getPercentile(endpoint, 95),
        p99: this.getPercentile(endpoint, 99),
        errorRate: statusCodes.filter(code => code >= 400).length / statusCodes.length,
        lastUpdated: new Date().toISOString(),
      };
    });
    
    return stats;
  }

  public clearMetrics(endpoint?: string): void {
    if (endpoint) {
      this.metrics.delete(endpoint);
    } else {
      this.metrics.clear();
    }
  }
}

export interface PerformanceMetric {
  timestamp: number;
  duration: number;
  method: string;
  statusCode: number;
  userId?: string;
  userAgent?: string;
  memoryUsage?: NodeJS.MemoryUsage;
}

export interface EndpointStats {
  requestCount: number;
  averageResponseTime: number;
  p50: number;
  p95: number;
  p99: number;
  errorRate: number;
  lastUpdated: string;
}

// Performance monitoring middleware
export function withPerformanceMonitoring(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const startTime = Date.now();
    const startMemory = process.memoryUsage();
    const monitor = PerformanceMonitor.getInstance();
    
    try {
      const response = await handler(request);
      const duration = Date.now() - startTime;
      const endMemory = process.memoryUsage();
      
      // Record performance metric
      const metric: PerformanceMetric = {
        timestamp: startTime,
        duration,
        method: request.method,
        statusCode: response.status,
        userAgent: request.headers.get('user-agent') || undefined,
        memoryUsage: {
          rss: endMemory.rss - startMemory.rss,
          heapTotal: endMemory.heapTotal - startMemory.heapTotal,
          heapUsed: endMemory.heapUsed - startMemory.heapUsed,
          external: endMemory.external - startMemory.external,
          arrayBuffers: endMemory.arrayBuffers - startMemory.arrayBuffers,
        },
      };
      
      monitor.recordMetric(request.nextUrl.pathname, metric);
      
      // Add performance headers
      response.headers.set('X-Response-Time', `${duration}ms`);
      if (metric.memoryUsage) {
        response.headers.set('X-Memory-Usage', `${Math.round(metric.memoryUsage.heapUsed / 1024 / 1024)}MB`);
      }
      
      // Alert on slow responses
      if (duration > 5000) { // 5 seconds
        log.warn('Slow API response detected', {
          endpoint: request.nextUrl.pathname,
          method: request.method,
          duration,
          statusCode: response.status,
        });
      }
      
      return response;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      // Record error metric
      const metric: PerformanceMetric = {
        timestamp: startTime,
        duration,
        method: request.method,
        statusCode: 500,
        userAgent: request.headers.get('user-agent') || undefined,
      };
      
      monitor.recordMetric(request.nextUrl.pathname, metric);
      
      throw error;
    }
  };
}

// Database query performance monitoring
export class DatabaseMonitor {
  private static queryTimes: Map<string, number[]> = new Map();
  
  public static recordQuery(query: string, duration: number): void {
    // Normalize query for grouping (remove specific values)
    const normalizedQuery = query
      .replace(/\$\d+/g, '$?') // Replace parameter placeholders
      .replace(/\d+/g, '?') // Replace numbers
      .replace(/'[^']*'/g, "'?'") // Replace string literals
      .substring(0, 100); // Limit length
    
    const times = this.queryTimes.get(normalizedQuery) || [];
    times.push(duration);
    
    // Keep only recent measurements
    if (times.length > 50) {
      times.shift();
    }
    
    this.queryTimes.set(normalizedQuery, times);
    
    // Log slow queries
    if (duration > 1000) { // 1 second
      log.warn('Slow database query detected', {
        query: normalizedQuery,
        duration,
      });
    }
    
    // Log query performance
    log.databaseQuery(normalizedQuery, duration);
  }
  
  public static getQueryStats(): Record<string, { avg: number; count: number; max: number }> {
    const stats: Record<string, { avg: number; count: number; max: number }> = {};
    
    this.queryTimes.forEach((times, query) => {
      const avg = times.reduce((a, b) => a + b, 0) / times.length;
      const max = Math.max(...times);

      stats[query] = {
        avg: Math.round(avg),
        count: times.length,
        max: Math.round(max),
      };
    });
    
    return stats;
  }
}

// Memory usage monitoring
export class MemoryMonitor {
  private static measurements: NodeJS.MemoryUsage[] = [];
  private static readonly maxMeasurements = 100;
  
  public static recordUsage(): void {
    const usage = process.memoryUsage();
    this.measurements.push(usage);
    
    if (this.measurements.length > this.maxMeasurements) {
      this.measurements.shift();
    }
    
    // Alert on high memory usage
    const heapUsedMB = usage.heapUsed / 1024 / 1024;
    if (heapUsedMB > 500) { // 500MB threshold
      log.warn('High memory usage detected', {
        heapUsedMB: Math.round(heapUsedMB),
        heapTotalMB: Math.round(usage.heapTotal / 1024 / 1024),
        rssMB: Math.round(usage.rss / 1024 / 1024),
      });
    }
  }
  
  public static getStats(): {
    current: NodeJS.MemoryUsage;
    average: NodeJS.MemoryUsage;
    peak: NodeJS.MemoryUsage;
  } {
    if (this.measurements.length === 0) {
      const current = process.memoryUsage();
      return { current, average: current, peak: current };
    }
    
    const current = this.measurements[this.measurements.length - 1];
    
    const average: NodeJS.MemoryUsage = {
      rss: Math.round(this.measurements.reduce((sum, m) => sum + m.rss, 0) / this.measurements.length),
      heapTotal: Math.round(this.measurements.reduce((sum, m) => sum + m.heapTotal, 0) / this.measurements.length),
      heapUsed: Math.round(this.measurements.reduce((sum, m) => sum + m.heapUsed, 0) / this.measurements.length),
      external: Math.round(this.measurements.reduce((sum, m) => sum + m.external, 0) / this.measurements.length),
      arrayBuffers: Math.round(this.measurements.reduce((sum, m) => sum + m.arrayBuffers, 0) / this.measurements.length),
    };
    
    const peak: NodeJS.MemoryUsage = {
      rss: Math.max(...this.measurements.map(m => m.rss)),
      heapTotal: Math.max(...this.measurements.map(m => m.heapTotal)),
      heapUsed: Math.max(...this.measurements.map(m => m.heapUsed)),
      external: Math.max(...this.measurements.map(m => m.external)),
      arrayBuffers: Math.max(...this.measurements.map(m => m.arrayBuffers)),
    };
    
    return { current, average, peak };
  }
}

// Start memory monitoring (server-side only)
if (typeof window === 'undefined') {
  setInterval(() => {
    MemoryMonitor.recordUsage();
  }, 30000); // Every 30 seconds
}

// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance();

// Health check endpoint data
export function getHealthMetrics() {
  const memoryStats = MemoryMonitor.getStats();
  const queryStats = DatabaseMonitor.getQueryStats();
  const endpointStats = performanceMonitor.getAllEndpointStats();
  
  return {
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: {
      currentMB: Math.round(memoryStats.current.heapUsed / 1024 / 1024),
      averageMB: Math.round(memoryStats.average.heapUsed / 1024 / 1024),
      peakMB: Math.round(memoryStats.peak.heapUsed / 1024 / 1024),
    },
    database: {
      queryCount: Object.values(queryStats).reduce((sum, stat) => sum + stat.count, 0),
      averageQueryTime: Object.values(queryStats).reduce((sum, stat) => sum + stat.avg, 0) / Object.keys(queryStats).length || 0,
      slowQueries: Object.entries(queryStats).filter(([_, stat]) => stat.avg > 1000).length,
    },
    api: {
      endpointCount: Object.keys(endpointStats).length,
      totalRequests: Object.values(endpointStats).reduce((sum, stat) => sum + stat.requestCount, 0),
      averageResponseTime: Object.values(endpointStats).reduce((sum, stat) => sum + stat.averageResponseTime, 0) / Object.keys(endpointStats).length || 0,
      errorRate: Object.values(endpointStats).reduce((sum, stat) => sum + stat.errorRate, 0) / Object.keys(endpointStats).length || 0,
    },
  };
}