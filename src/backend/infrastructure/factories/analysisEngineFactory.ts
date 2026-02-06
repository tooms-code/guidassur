import { AnalysisEngine } from "@/backend/application/engine/AnalysisEngine";
import { registry } from "@/backend/infrastructure/strategies";

// Factory: Infrastructure layer creates engine with concrete registry
// This keeps Application layer free from Infrastructure dependencies
export const analysisEngine = new AnalysisEngine(registry);
