class toEnumDto {
  enum: any;
  value: string;
}

export function isEmpty(str: any) {
  return (
    str === undefined ||
    str === null ||
    typeof str !== 'string' ||
    str.match(/^ *$/) !== null
  );
}

export function generateRandomHash(length: number): string {
  if (!length) {
    length = 20;
  }

  let result: string = '';
  const characters: string =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength: number = characters.length;

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}

export function toEnum(args: toEnumDto): any {
  let resolution: string;

  resolution = args.value
    ? args.enum[args.value.toString()]
    : Object.keys(args.enum)[0];

  return resolution;
}

import * as winston from 'winston';
const { combine, label, timestamp, printf } = winston.format;

class Logger {
  private readonly LOG_FILE = {
    ERROR: 'logs/error.log',
    WARN: 'logs/warn.log',
    VERBOSE: 'logs/verbose.log',
    DEBUG: 'logs/debug.log',
    INFO: 'logs/info.log',
    ALL: 'logs/all.log',
  };

  private logger: winston.Logger = null;

  constructor() {
    const logFormat = printf(({ level, message, label, timestamp }) => {
      return `${timestamp} [${label}] ${level}:  ${message}`;
    });

    this.logger = winston.createLogger({
      format: combine(
        label({ label: '---- Teesas logs ----' }),
        timestamp(),
        logFormat,
      ),
      transports: [
        new winston.transports.File({
          filename: this.LOG_FILE.ERROR,
          level: 'error',
        }),
        new winston.transports.File({
          filename: this.LOG_FILE.WARN,
          level: 'warn',
        }),
        new winston.transports.File({
          filename: this.LOG_FILE.ALL,
        }),
        new winston.transports.File({
          filename: this.LOG_FILE.DEBUG,
          level: 'debug',
        }),
        new winston.transports.File({
          filename: this.LOG_FILE.INFO,
          level: 'info',
        }),
        new winston.transports.File({
          filename: this.LOG_FILE.VERBOSE,
          level: 'verbose',
        }),
      ],
    });
  }

  error(data) {
    this.logger.error(typeof data === 'object' ? JSON.stringify(data) : data);
    return { console: (arg?: any) => console.error(arg || data) };
  }
  log(data) {
    this.logger.log(typeof data === 'object' ? JSON.stringify(data) : data);
    return { console: (arg?: any) => console.log(arg || data) };
  }
  warn(data) {
    this.logger.warn(typeof data === 'object' ? JSON.stringify(data) : data);
    return { console: (arg?: any) => console.error(arg || data) };
  }
  debug(data) {
    this.logger.debug(typeof data === 'object' ? JSON.stringify(data) : data);
    return { console: (arg?: any) => console.debug(arg || data) };
  }
  info(data) {
    this.logger.debug(typeof data === 'object' ? JSON.stringify(data) : data);
    return { console: (arg?: any) => console.info(arg || data) };
  }
  verbose(data) {
    this.logger.verbose(typeof data === 'object' ? JSON.stringify(data) : data);
    return { console: (arg?: any) => console.log(arg || data) };
  }
}

export default new Logger();
