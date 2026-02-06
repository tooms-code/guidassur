type LogLevel = "debug" | "info" | "warn" | "error";

interface LogContext {
  [key: string]: unknown;
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: {
    message: string;
    stack?: string;
    name: string;
  };
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

// Minimum log level (configurable via env)
const MIN_LEVEL: LogLevel = (process.env.LOG_LEVEL as LogLevel) || "info";

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[MIN_LEVEL];
}

function formatError(error: unknown): LogEntry["error"] | undefined {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }
  if (error) {
    return {
      name: "UnknownError",
      message: String(error),
    };
  }
  return undefined;
}

function createLogEntry(
  level: LogLevel,
  message: string,
  context?: LogContext,
  error?: unknown
): LogEntry {
  return {
    timestamp: new Date().toISOString(),
    level,
    message,
    context,
    error: formatError(error),
  };
}

function output(entry: LogEntry): void {
  const isDev = process.env.NODE_ENV !== "production";

  if (isDev) {
    // Pretty print in development
    const prefix = `[${entry.level.toUpperCase()}]`;
    const msg = `${prefix} ${entry.message}`;

    if (entry.level === "error") {
      console.error(msg, entry.context || "", entry.error?.stack || "");
    } else if (entry.level === "warn") {
      console.warn(msg, entry.context || "");
    } else {
      console.log(msg, entry.context || "");
    }
  } else {
    // JSON in production (for log aggregators)
    console.log(JSON.stringify(entry));
  }
}

export const logger = {
  debug(message: string, context?: LogContext): void {
    if (shouldLog("debug")) {
      output(createLogEntry("debug", message, context));
    }
  },

  info(message: string, context?: LogContext): void {
    if (shouldLog("info")) {
      output(createLogEntry("info", message, context));
    }
  },

  warn(message: string, context?: LogContext): void {
    if (shouldLog("warn")) {
      output(createLogEntry("warn", message, context));
    }
  },

  error(message: string, error?: unknown, context?: LogContext): void {
    if (shouldLog("error")) {
      output(createLogEntry("error", message, context, error));
    }
  },
};
