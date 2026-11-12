export interface AnalysisJobQueue {
    add(analysisId: string): Promise<void>;
}