import React from "react";

export default function OutputPanel({ analysisCount, result, error }) {

  return (
    <div className="right-panel">

      <div className="stats-box">
        <div className="stats-number">{analysisCount}</div>
        <div className="stats-label">Plants Analyzed</div>
      </div>

      {result && (

        <div className="disease-card">

          <div className="disease-card-header">

            <div className="disease-card-title">

              <h3>
                <span>🌿</span> {result.plantName}
              </h3>

              <span
                className={`tag ${
                  result.status === "DISEASED"
                    ? "tag-danger"
                    : "tag-success"
                }`}
              >
                {result.status}
              </span>

            </div>

          </div>

          <div className="info-row">
            <span className="info-label">📅 Analyzed:</span>
            <span className="info-value">
              {new Date(result.analyzedAt).toLocaleString()}
            </span>
          </div>

          <div
            className="info-row"
            style={{ background: "rgba(255,255,255,0.05)" }}
          >
            <span className="info-label">🎯 Confidence:</span>
            <span className="info-value">
              {(result.confidence * 100).toFixed(2)}%
            </span>
          </div>

          <div className="section-box">

            <div className="section-box-title">
              🦠 Disease Details
            </div>

            <table className="data-table">
              <tbody>

                <tr>
                  <td>Scientific:</td>
                  <td>
                    <i>{result.scientificName}</i>
                  </td>
                </tr>

                <tr>
                  <td>Type:</td>
                  <td>{result.type}</td>
                </tr>

                <tr>
                  <td>Severity:</td>
                  <td
                    className={
                      result.severity?.includes("Cao")
                        ? "val-danger"
                        : "val-warning"
                    }
                  >
                    {result.severity}
                  </td>
                </tr>

              </tbody>
            </table>

          </div>

          <div
            className="section-box"
            style={{
              marginTop: "1.5rem",
              borderColor: "rgba(255,255,255,0.1)",
              background: "rgba(255,255,255,0.02)"
            }}
          >

            <div
              className="section-box-title"
              style={{ color: "var(--text-main)", fontSize: "0.9rem" }}
            >
              📔 Symptoms:
            </div>

            <ul className="symptoms-list">

              {result.symptoms?.map((sym, idx) => (
                <li key={idx}>• {sym}</li>
              ))}

            </ul>

          </div>

          <div className="prognosis-box">

            <div className="prognosis-title">
              💊 Treatment & Recovery
            </div>

            <div className="prog-item" style={{ marginBottom: "1rem" }}>

              <strong>📋 Treatment:</strong>

              <ul
                className="symptoms-list"
                style={{ marginTop: "0.5rem" }}
              >

                {result.treatment?.map((t, idx) => (
                  <li key={idx}>{t}</li>
                ))}

              </ul>

            </div>

            <div className="summary-box">

              <strong>⏱️ Recovery: </strong>
              {result.recovery}

            </div>

          </div>

        </div>

      )}

      {error && !result && (

        <div
          className="disease-card"
          style={{
            border: "1px solid var(--danger)",
            background: "rgba(239, 68, 68, 0.05)"
          }}
        >

          <div className="section-box-title">
            ⚠️ Không Thể Phân Tích Loại Lá Này
          </div>

          <p
            style={{
              fontSize: "0.9rem",
              color: "var(--text-main)",
              lineHeight: "1.5"
            }}
          >
            {error}
          </p>

          <div
            style={{
              marginTop: "1rem",
              fontSize: "0.8rem",
              color: "var(--text-muted)"
            }}
          >
            Vui lòng thử lại với một bức ảnh khác rõ nét hơn.
          </div>

        </div>

      )}

      {!result && !error && (

        <div
          className="disease-card"
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            color: "var(--text-muted)",
            textAlign: "center",
            padding: "40px 20px"
          }}
        >

          <p>No analysis results yet. Upload an image to start.</p>

        </div>

      )}

    </div>
  );
}