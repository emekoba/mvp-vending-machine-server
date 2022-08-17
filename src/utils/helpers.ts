import * as winston from 'winston';
const { combine, label, timestamp, printf } = winston.format;
class toEnumDto {
  enum: any;
  value: string;
}
class fromEnumDto {
  enum: any;
  value: any;
}

export function isEmpty(val: any): boolean {
  return (
    val === undefined ||
    val === null ||
    typeof val !== 'string' ||
    val.match(/^ *$/) !== null
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

export function fromEnum(args: fromEnumDto): any {
  let resolution: string;

  // console.log(args.enum, args.enum[args.value.toString()]);
  resolution = args.value
    ? args.enum[args.value]
    : args.enum[Object.keys(args.enum)[0]];

  return resolution;
}

export function toEnum(args: toEnumDto): any {
  let resolution: string;

  resolution = args.value
    ? args.enum[args.value.toString().toUpperCase()]
    : Object.keys(args.enum)[0];

  return resolution;
}

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

const metaDataKey = Symbol();

export const UseMiddleware =
  (...arg: Array<string>) =>
  (target, propertyValue, props: PropertyDescriptor) => {
    const funcObj = Reflect.getMetadata(metaDataKey, target);
    const middlewares = arg.map((item) => funcObj[item]);
    const temp = props.value;

    props.value = async function (req, resp) {
      for (const index in middlewares) {
        try {
          await middlewares[index].apply(this, [
            req,
            resp,
            () => {
              throw 'exited: ' + Object.keys(funcObj)[index];
            },
          ]);
        } catch (exp) {
          console.log(exp);
          if (!/exited/g.test(exp)) throw exp;
        }
      }
      try {
        await temp.apply(this, [
          req,
          resp,
          () => {
            throw 'exited main route';
          },
        ]);
      } catch (exp) {
        console.log(exp);
        if (!/exited/g.test(exp)) throw exp;
      }
    };
  };

export function Middleware(target, propName, prop: PropertyDescriptor) {
  const funcObj = Reflect.getMetadata(metaDataKey, target) || {};
  Reflect.defineMetadata(
    metaDataKey,
    { ...funcObj, [propName]: prop.value },
    target,
  );
}
