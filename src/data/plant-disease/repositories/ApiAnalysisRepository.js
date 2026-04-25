import { createPlantAnalysisResult } from "../entities/AnalysisResult.js";

export class AnalysisRepository {

  async analyzeInput(file) {
    throw new Error("analyzeInput() must be implemented");
  }

  async getAnalysisCount() {
    throw new Error("getAnalysisCount() must be implemented");
  }

}