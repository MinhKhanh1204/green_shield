export class AnalyzeInputUseCase {

  constructor(analysisRepository) {
    this.analysisRepository = analysisRepository;
  }

  async execute(file) {

    if (!file) {
      throw new Error("File input is required for analysis");
    }

    return await this.analysisRepository.analyzeInput(file);

  }

}