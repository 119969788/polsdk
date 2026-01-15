type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private level: LogLevel;

  constructor(level: LogLevel = 'info') {
    this.level = level;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    return levels.indexOf(level) >= levels.indexOf(this.level);
  }

  private formatMessage(level: LogLevel, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    
    if (data) {
      return `${prefix} ${message}\n${JSON.stringify(data, null, 2)}`;
    }
    return `${prefix} ${message}`;
  }

  debug(message: string, data?: any): void {
    if (this.shouldLog('debug')) {
      console.log(this.formatMessage('debug', message, data));
    }
  }

  info(message: string, data?: any): void {
    if (this.shouldLog('info')) {
      console.log(this.formatMessage('info', message, data));
    }
  }

  warn(message: string, data?: any): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, data));
    }
  }

  error(message: string, error?: any): void {
    if (this.shouldLog('error')) {
      // 改进错误对象的格式化
      let formattedError = error;
      if (error && typeof error === 'object') {
        try {
          // 尝试创建一个可序列化的错误对象
          const errorObj: any = {};
          if (error.message) errorObj.message = error.message;
          if (error.name) errorObj.name = error.name;
          if (error.stack) errorObj.stack = error.stack;
          if (error.code) errorObj.code = error.code;
          
          // 尝试获取所有属性
          const keys = Object.keys(error);
          if (keys.length > 0) {
            errorObj.keys = keys;
            // 尝试获取每个属性的值
            keys.forEach(key => {
              try {
                const value = error[key];
                if (value !== undefined && value !== null) {
                  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
                    errorObj[key] = value;
                  } else if (typeof value === 'object') {
                    errorObj[key] = typeof value.toString === 'function' ? value.toString() : '[Object]';
                  }
                }
              } catch (e) {
                // 忽略无法访问的属性
              }
            });
          }
          
          // 如果仍然为空，添加错误对象的字符串表示
          if (Object.keys(errorObj).length === 0) {
            errorObj.rawError = String(error);
            errorObj.type = typeof error;
            if (error.constructor) {
              errorObj.constructor = error.constructor.name;
            }
          }
          
          formattedError = errorObj;
        } catch (e) {
          formattedError = {
            rawError: String(error),
            type: typeof error,
            stringifyError: String(e)
          };
        }
      }
      console.error(this.formatMessage('error', message, formattedError));
    }
  }
}

export const logger = new Logger((process.env.LOG_LEVEL as LogLevel) || 'info');
