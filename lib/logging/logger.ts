// Structured logging system
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  userId?: string;
  requestId?: string;
  service?: string;
  environment: string;
}

export class Logger {
  private static instance: Logger;
  private logLevel: LogLevel;
  private service: string;
  private environment: string;

  private constructor() {
    this.logLevel = this.getLogLevelFromEnv();
    this.service = process.env.SERVICE_NAME || 'jooka-ecommerce';
    this.environment = process.env.NODE_ENV || 'development';
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private getLogLevelFromEnv(): LogLevel {
    const level = process.env.LOG_LEVEL?.toUpperCase();
    switch (level) {
      case 'DEBUG': return LogLevel.DEBUG;
      case 'INFO': return LogLevel.INFO;
      case 'WARN': return LogLevel.WARN;
      case 'ERROR': return LogLevel.ERROR;
      default: return LogLevel.INFO;
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.logLevel;
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: Record<string, any>
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      service: this.service,
      environment: this.environment,
    };
  }

  private formatLogEntry(entry: LogEntry): string {
    const levelName = LogLevel[entry.level];
    const contextStr = entry.context ? ` | ${JSON.stringify(entry.context)}` : '';
    return `[${entry.timestamp}] ${levelName}: ${entry.message}${contextStr}`;
  }

  private writeLog(entry: LogEntry): void {
    if (!this.shouldLog(entry.level)) return;

    const formattedMessage = this.formatLogEntry(entry);

    // Console output with appropriate method
    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(formattedMessage);
        break;
      case LogLevel.INFO:
        console.info(formattedMessage);
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage);
        break;
      case LogLevel.ERROR:
        console.error(formattedMessage);
        break;
    }

    // In production, send to external logging service
    if (this.environment === 'production') {
      this.sendToExternalService(entry);
    }
  }

  private sendToExternalService(entry: LogEntry): void {
    // Integration with external logging services would go here
    // Examples: Datadog, New Relic, CloudWatch, etc.
    
    // For now, just ensure it's properly formatted for JSON logging
    if (process.env.JSON_LOGS === 'true') {
      console.log(JSON.stringify(entry));
    }
  }

  public debug(message: string, context?: Record<string, any>): void {
    const entry = this.createLogEntry(LogLevel.DEBUG, message, context);
    this.writeLog(entry);
  }

  public info(message: string, context?: Record<string, any>): void {
    const entry = this.createLogEntry(LogLevel.INFO, message, context);
    this.writeLog(entry);
  }

  public warn(message: string, context?: Record<string, any>): void {
    const entry = this.createLogEntry(LogLevel.WARN, message, context);
    this.writeLog(entry);
  }

  public error(message: string, context?: Record<string, any>): void {
    const entry = this.createLogEntry(LogLevel.ERROR, message, context);
    this.writeLog(entry);
  }

  // Specialized logging methods
  public logApiRequest(
    method: string,
    path: string,
    statusCode: number,
    duration: number,
    userId?: string,
    requestId?: string
  ): void {
    this.info('API Request', {
      method,
      path,
      statusCode,
      duration,
      userId,
      requestId,
      type: 'api_request',
    });
  }

  public logDatabaseQuery(
    query: string,
    duration: number,
    rowCount?: number,
    error?: string
  ): void {
    const level = error ? LogLevel.ERROR : LogLevel.DEBUG;
    const message = error ? 'Database Query Failed' : 'Database Query';
    
    const entry = this.createLogEntry(level, message, {
      query: query.substring(0, 200), // Truncate long queries
      duration,
      rowCount,
      error,
      type: 'database_query',
    });
    
    this.writeLog(entry);
  }

  public logUserAction(
    userId: string,
    action: string,
    resource?: string,
    details?: Record<string, any>
  ): void {
    this.info('User Action', {
      userId,
      action,
      resource,
      details,
      type: 'user_action',
    });
  }

  public logSecurityEvent(
    eventType: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    details: Record<string, any>
  ): void {
    const level = severity === 'critical' || severity === 'high' 
      ? LogLevel.ERROR 
      : LogLevel.WARN;
    
    const entry = this.createLogEntry(level, `Security Event: ${eventType}`, {
      eventType,
      severity,
      details,
      type: 'security_event',
    });
    
    this.writeLog(entry);
  }

  public logBusinessEvent(
    event: string,
    details: Record<string, any>
  ): void {
    this.info(`Business Event: ${event}`, {
      event,
      details,
      type: 'business_event',
    });
  }

  public logPerformanceMetric(
    metric: string,
    value: number,
    unit: string,
    tags?: Record<string, string>
  ): void {
    this.info(`Performance Metric: ${metric}`, {
      metric,
      value,
      unit,
      tags,
      type: 'performance_metric',
    });
  }

  // Method to create child logger with additional context
  public child(context: Record<string, any>): ChildLogger {
    return new ChildLogger(this, context);
  }
}

// Child logger that inherits context
class ChildLogger {
  constructor(
    private parent: Logger,
    private context: Record<string, any>
  ) {}

  private mergeContext(additionalContext?: Record<string, any>): Record<string, any> {
    return { ...this.context, ...additionalContext };
  }

  public debug(message: string, context?: Record<string, any>): void {
    this.parent.debug(message, this.mergeContext(context));
  }

  public info(message: string, context?: Record<string, any>): void {
    this.parent.info(message, this.mergeContext(context));
  }

  public warn(message: string, context?: Record<string, any>): void {
    this.parent.warn(message, this.mergeContext(context));
  }

  public error(message: string, context?: Record<string, any>): void {
    this.parent.error(message, this.mergeContext(context));
  }
}

// Export singleton instance
export const logger = Logger.getInstance();

// Convenience functions
export const log = {
  debug: (message: string, context?: Record<string, any>) => logger.debug(message, context),
  info: (message: string, context?: Record<string, any>) => logger.info(message, context),
  warn: (message: string, context?: Record<string, any>) => logger.warn(message, context),
  error: (message: string, context?: Record<string, any>) => logger.error(message, context),
  
  // Specialized logging
  apiRequest: (method: string, path: string, statusCode: number, duration: number, userId?: string, requestId?: string) =>
    logger.logApiRequest(method, path, statusCode, duration, userId, requestId),
  
  databaseQuery: (query: string, duration: number, rowCount?: number, error?: string) =>
    logger.logDatabaseQuery(query, duration, rowCount, error),
  
  userAction: (userId: string, action: string, resource?: string, details?: Record<string, any>) =>
    logger.logUserAction(userId, action, resource, details),
  
  securityEvent: (eventType: string, severity: 'low' | 'medium' | 'high' | 'critical', details: Record<string, any>) =>
    logger.logSecurityEvent(eventType, severity, details),
  
  businessEvent: (event: string, details: Record<string, any>) =>
    logger.logBusinessEvent(event, details),
  
  performanceMetric: (metric: string, value: number, unit: string, tags?: Record<string, string>) =>
    logger.logPerformanceMetric(metric, value, unit, tags),
};