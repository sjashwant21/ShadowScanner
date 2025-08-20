
export enum ResultStatus {
  Clean = 'Clean',
  Indeterminate = 'Indeterminate',
  Suspicious = 'Suspicious',
}

export interface AnalysisResult {
  probability: number;
  message: string;
  status: ResultStatus;
}
