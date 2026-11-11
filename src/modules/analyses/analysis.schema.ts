import { z } from "zod";

export const analysisIdParamsSchema = z.object({
  id: z.uuid(),
});
