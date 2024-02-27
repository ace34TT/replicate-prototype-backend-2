export class ProcessTimer {
  private _startTime: any;
  private _diffTime: any;
  //   constructor() {
  //     this._startTime = process.hrtime();
  //   }
  public start(): void {
    this._startTime = process.hrtime();
  }
  public stop(): void {
    this._diffTime = process.hrtime(this._startTime);
  }

  public getTime(): number {
    return this._diffTime[0] * 1e9 + this._diffTime[1] / 1e9;
  }
}
