export class ApiAnalysisRepository {

  constructor() {
    this.apiUrl = "http://localhost:7860";
  }

  async analyzeInput(file) {

    const formData = new FormData();
    formData.append("file", file);

    try {

      const response = await fetch(`${this.apiUrl}/predict`, {
        method: "POST",
        body: formData
      });

      if (!response.ok) {

        const errorData = await response.json();
        throw new Error(errorData.detail || "Error analyzing image");

      }

      const data = await response.json();

      return {
        id: Date.now().toString(),
        plantName: data.plantName,
        status: data.status,
        analyzedAt: data.analyzedAt,
        confidence: data.confidence,
        scientificName: data.scientificName,
        type: data.type,
        severity: data.severity,
        symptoms: data.symptoms,
        treatment: data.treatment,
        recovery: data.recovery,
        suggested_products: data.suggested_products
      };

    } catch (error) {

      console.error("API Error:", error);
      throw error;

    }

  }

  async getAnalysisCount() {
    return parseInt(sessionStorage.getItem("analysis_count") || "0");
  }

}