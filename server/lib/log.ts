/**
 * Logger JSON đơn giản. Không log nội dung trang, HTML, token, số điện thoại/email.
 * Log lỗi chỉ log name/message/code — message từ crawler không chứa nội dung trang.
 */
export type LogFields = Record<string, unknown>;

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface Logger {
  debug(message: string, fields?: LogFields): void;
  info(message: string, fields?: LogFields): void;
  warn(message: string, fields?: LogFields): void;
  error(message: string, fields?: LogFields): void;
  child(fields: LogFields): Logger;
}

const SENSITIVE_KEY = /^(phone|email|name|fullname|ip|address|content|html|body|text|token|authorization|cookie|secret|payload|lead|password|webhook)$/i;
const SENSITIVE_INLINE = /(token=)[^&\s]+/gi;

export function redactFields(fields: LogFields): LogFields {
  const out: LogFields = {};
  for (const [key, value] of Object.entries(fields)) {
    if (SENSITIVE_KEY.test(key)) {
      out[key] = "[redacted]";
      continue;
    }
    if (typeof value === "string") {
      out[key] = value.replace(SENSITIVE_INLINE, "$1[redacted]");
      continue;
    }
    if (value && typeof value === "object") {
      out[key] = "[object]";
      continue;
    }
    out[key] = value;
  }
  return out;
}

const LEVEL_WEIGHT: Record<LogLevel, number> = { debug: 10, info: 20, warn: 30, error: 40 };

export interface LoggerOptions {
  level?: LogLevel;
  sink?: (line: string) => void;
  base?: LogFields;
}

export function createLogger(options: LoggerOptions = {}): Logger {
  const level = options.level ?? "info";
  const sink = options.sink ?? ((line: string) => process.stdout.write(`${line}\n`));
  const base = options.base ?? {};
  const min = LEVEL_WEIGHT[level];

  const emit = (lvl: LogLevel, message: string, fields?: LogFields) => {
    if (LEVEL_WEIGHT[lvl] < min) return;
    const payload = {
      ts: new Date().toISOString(),
      level: lvl,
      msg: message,
      ...redactFields(base),
      ...(fields ? redactFields(fields) : {}),
    };
    sink(JSON.stringify(payload));
  };

  return {
    debug: (m, f) => emit("debug", m, f),
    info: (m, f) => emit("info", m, f),
    warn: (m, f) => emit("warn", m, f),
    error: (m, f) => emit("error", m, f),
    child: (fields) => createLogger({ level, sink, base: { ...base, ...fields } }),
  };
}

export function createNoopLogger(): Logger {
  const noop = () => undefined;
  return { debug: noop, info: noop, warn: noop, error: noop, child: () => createNoopLogger() };
}
