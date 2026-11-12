export interface AnalysisStorage {
    deleteFile(path: string): Promise<void>;
}