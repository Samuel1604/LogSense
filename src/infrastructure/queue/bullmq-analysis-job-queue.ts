import type { Queue} from "bullmq";

import type { AnalysisJobData } from "../../modules/analyses/queue/analysis-job.js";
import type { AnalysisJobQueue } from "../../modules/analyses/queue/analysis-job-queue.js"


export class BullMqAnalysisJobQueue implements AnalysisJobQueue {
    constructor (
        private readonly queue: Queue<AnalysisJobData>,
    ) {}

    async add(analysisId: string): Promise<void> {
        await this.queue.add(
            "process-analysis",
            {analysisId},
            {
                jobId: analysisId,

            },
        );
    }
}