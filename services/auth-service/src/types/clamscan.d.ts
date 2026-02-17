declare module "clamscan" {
  interface ClamScanOptions {
    removeInfected?: boolean;
    quarantineInfected?: string | false;
    scanLog?: string;
    debugMode?: boolean;
    clamdscan?: {
      host?: string;
      port?: number;
      timeout?: number;
      localFallback?: boolean;
    };
  }

  interface ScanResult {
    isInfected: boolean;
    viruses: string[];
    file: string;
  }

  interface ClamScanInstance {
    isInfected(file: string): Promise<ScanResult>;
    scanFile(file: string): Promise<ScanResult>;
    scanDir(path: string): Promise<any>;
  }

  export default class NodeClam {
    constructor(options?: ClamScanOptions);
    init(options?: ClamScanOptions): Promise<ClamScanInstance>;
  }
}
