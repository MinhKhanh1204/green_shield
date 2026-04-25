import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";


import { Header } from "../data/plant-disease/components/Header";
import InputPanel from "../data/plant-disease/components/InputPanel";
import OutputPanel from "../data/plant-disease/components/OutputPanel";
import SuggestedProductsPanel from "../data/plant-disease/components/SuggestedProductsPanel";

import { AnalyzeInputUseCase } from "../data/plant-disease/usecase/AnalyzeInputUseCase";
import { ApiAnalysisRepository } from "../services/ApiAnalysisRepository";

import "./PlantDisease.css";

// Dependency Injection
const repository = new ApiAnalysisRepository();
const analyzeUseCase = new AnalyzeInputUseCase(repository);

export const PlantDiseasePage = () => {

  const navigate = useNavigate();

  const [analysisCount, setAnalysisCount] = useState(0);
  const [result, setResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {

    repository.getAnalysisCount().then((count) => {
      setAnalysisCount(count);
    });

  }, []);

  const handleAnalyze = async (file) => {

    setIsAnalyzing(true);
    setErrorMessage(null);

    try {

      const analysisData = await analyzeUseCase.execute(file);

      setResult(analysisData);

      const currentCount = await repository.getAnalysisCount();
      const newCount = currentCount + 1;

      sessionStorage.setItem("analysis_count", newCount.toString());

      setAnalysisCount(newCount);

    } catch (error) {

      console.error("Analysis failed", error);

      setResult(null);

      setErrorMessage(error.message || "Analysis failed. Please try again.");

    } finally {

      setIsAnalyzing(false);

    }

  };

  return (

    <div className="app-container">

      {/* Header AI */}
      <Header />

      {/* Back button */}
      <div style={{ padding: "10px 24px" }}>
        <button
          className="btn"
          onClick={() => navigate("/")}
        >
          ← Back to Home
        </button>
      </div>

      {/* ROW 1 */}
      <main className="main-content">

        <div className="left-panel">
          <InputPanel
            onAnalyze={handleAnalyze}
            isAnalyzing={isAnalyzing}
          />
        </div>

        <div className="right-panel">
          <OutputPanel
            analysisCount={analysisCount}
            result={result}
            error={errorMessage}
          />
        </div>

      </main>

      {/* ROW 2 */}
      {result && (
        <SuggestedProductsPanel result={result} />
      )}

    </div>

  );

};