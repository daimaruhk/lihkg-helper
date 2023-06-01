export default class Logger {
  private static readonly namespace = "LIHKG Backup Helper";

  public static error(msg: string) {
    console.error(`${this.namespace} - ${msg}`);
  }
}
