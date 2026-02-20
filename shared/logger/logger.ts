import { createLogger, format, transports, Logger } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import path from "path";

const LOG_LEVEL = "info";
const LOG_DIR = path.join(process.cwd(), "logs");

const commonFormat = format.combine(
  format.timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }),
  format.errors({ stack: true }),
  format.metadata({ fillExcept: ["message", "level", "timestamp", "label"] }),
);

const productionFormat = format.combine(commonFormat, format.json());

const devFormat = format.combine(
  commonFormat,
  format.colorize(),
  format.printf((info) => {
    const meta = Object.keys(info.metadata || {}).length
      ? ` ${JSON.stringify(info.metadata)}`
      : "";
    return `${info.timestamp} ${info.level.padEnd(7).toUpperCase()} [${info.service || "app"}]: ${info.message}${meta}`;
  }),
);

const getFormat = () =>
  process.env.NODE_ENV === "production" ? productionFormat : devFormat;

export function createServiceLogger(serviceName: string): Logger {
  const safeServiceName = serviceName.toLowerCase().replace(/[^a-z0-9-]/g, "-");

  const logger = createLogger({
    level: LOG_LEVEL,
    defaultMeta: { service: serviceName },
    format: getFormat(),
    transports: [
      new transports.Console(),
      new DailyRotateFile({
        dirname: path.join(LOG_DIR, safeServiceName),
        filename: `${safeServiceName}-error-%DATE%.log`,
        datePattern: "YYYY-MM-DD",
        zippedArchive: true,
        maxSize: "10m",
        maxFiles: "20d",
        level: "error",
      }),
    ],
    exitOnError: false,
  });

  return logger;
}
