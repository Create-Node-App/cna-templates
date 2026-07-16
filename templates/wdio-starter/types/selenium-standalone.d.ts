declare module 'selenium-standalone' {
  interface DriverOptions {
    version?: string;
    arch?: string;
    baseURL?: string;
    onlyDriverArgs?: string[];
  }

  interface InstallOptions {
    version?: string;
    baseURL?: string;
    drivers?: Record<string, DriverOptions>;
    ignoreExtraDrivers?: boolean;
    basePath?: string;
    logger?: (message: string) => void;
    requestOpts?: Record<string, any>;
    progressCb?: (totalLength: number, progressLength: number, chunkLength: number) => void;
    onlyDriver?: string;
  }

  interface StartOptions {
    version?: string;
    baseURL?: string;
    drivers?: Record<string, DriverOptions>;
    ignoreExtraDrivers?: boolean;
    basePath?: string;
    spawnOptions?: Record<string, any>;
    javaArgs?: string[];
    seleniumArgs?: string[];
    javaPath?: string;
    requestOpts?: Record<string, any>;
    onlyDriver?: string;
  }

  export function install(opts?: InstallOptions): Promise<void>;
  export function start(opts?: StartOptions): Promise<import('child_process').ChildProcess>;
}
