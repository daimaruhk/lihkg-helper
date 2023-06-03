export class Logger {
  private static readonly namespace = "LIHKG Backup Helper";

  public static error(...msg: any[]) {
    console.error(`${this.namespace}:`, ...msg);
  }

  public static info(...msg: any[]) {
    console.info(`${this.namespace}:`, ...msg);
  }
}
