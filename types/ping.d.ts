declare module 'ping' {
  interface PingResponse {
    host: string;
    numeric_host: string;
    alive: boolean;
    output: string;
    time: number;
    min: string;
    max: string;
    avg: string;
    stddev: string;
  }

  interface PingConfig {
    numeric?: boolean;
    timeout?: number;
    min_reply?: number;
    extra?: string[];
  }

  export namespace promise {
    function probe(addr: string, config?: PingConfig): Promise<PingResponse>;
  }

  export namespace sys {
    function probe(addr: string, cb: (isAlive: boolean, error: any) => void, config?: PingConfig): void;
  }
}
