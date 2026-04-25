import React, { useState, useRef, useEffect, useCallback } from "react";

export default function InputPanel({ onAnalyze, isAnalyzing }) {

  const [activeTab, setActiveTab] = useState("video");
  const [mediaUrl, setMediaUrl] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const [isHovering, setIsHovering] = useState(false);

  const fileInputRef = useRef(null);

  const videoStreamRef = useRef(null);
  const mediaStreamRef = useRef(null);

  const [cameraError, setCameraError] = useState(null);
  const [cameraSnapshot, setCameraSnapshot] = useState(null);
  const [currentFile, setCurrentFile] = useState(null);
  const [facingMode, setFacingMode] = useState("environment");

  const startCamera = useCallback(async () => {

    setCameraError(null);

    try {

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facingMode }
      });

      mediaStreamRef.current = mediaStream;

      if (videoStreamRef.current) {
        videoStreamRef.current.srcObject = mediaStream;
      }

    } catch (err) {

      console.error("Camera error:", err);
      setCameraError("Unable to access camera");

    }

  }, [facingMode]);

  const stopCamera = useCallback(() => {

    if (mediaStreamRef.current) {

      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;

    }

    if (videoStreamRef.current) {
      videoStreamRef.current.srcObject = null;
    }

  }, []);

  useEffect(() => {

    if (activeTab === "camera") {

      if (!cameraSnapshot) startCamera();

    } else {

      stopCamera();
      setCameraSnapshot(null);

    }

    return () => stopCamera();

  }, [activeTab, cameraSnapshot, stopCamera, startCamera]);

  const handleSnapshotAndAnalyze = () => {

    if (!videoStreamRef.current) return;

    const canvas = document.createElement("canvas");

    canvas.width = videoStreamRef.current.videoWidth;
    canvas.height = videoStreamRef.current.videoHeight;

    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    ctx.drawImage(videoStreamRef.current, 0, 0);

    canvas.toBlob(blob => {

      if (!blob) return;

      const file = new File([blob], "snapshot.jpg", { type: "image/jpeg" });

      const dataUrl = canvas.toDataURL("image/jpeg");

      setCameraSnapshot(dataUrl);
      setCurrentFile(file);

      stopCamera();

      onAnalyze(file);

    });

  };

  const handleClearCamera = () => {

    setCameraSnapshot(null);
    startCamera();

  };

  const handleFile = (file) => {

    if (!file) return;

    if (file.type.startsWith("video/")) setMediaType("video");
    else if (file.type.startsWith("image/")) setMediaType("image");
    else return alert("Unsupported format");

    setCurrentFile(file);

    const url = URL.createObjectURL(file);

    setMediaUrl(url);

  };

  const handleFileSelect = (event) => {

    const file = event.target.files?.[0];

    if (file) handleFile(file);

  };

  const handleDragOver = (e) => {

    e.preventDefault();
    setIsHovering(true);

  };

  const handleDragLeave = (e) => {

    e.preventDefault();
    setIsHovering(false);

  };

  const handleDrop = (e) => {

    e.preventDefault();
    setIsHovering(false);

    const file = e.dataTransfer.files?.[0];

    if (file) handleFile(file);

  };

  const handleClear = () => {

    if (mediaUrl) URL.revokeObjectURL(mediaUrl);

    setMediaUrl(null);
    setMediaType(null);
    setCurrentFile(null);

    if (fileInputRef.current) fileInputRef.current.value = "";

  };

  return (

    <div className="left-panel">

      <div className="glass-panel">

        <div className="panel-header">
          📹 {activeTab} Upload & Analysis
        </div>

        <div className="tabs">

          <button
            className={`tab ${activeTab === "image" ? "active" : ""}`}
            onClick={() => { setActiveTab("image"); handleClear(); }}
          >
            Image
          </button>

          <button
            className={`tab ${activeTab === "video" ? "active" : ""}`}
            onClick={() => { setActiveTab("video"); handleClear(); }}
          >
            Video
          </button>

          <button
            className={`tab ${activeTab === "camera" ? "active" : ""}`}
            onClick={() => { setActiveTab("camera"); handleClear(); }}
          >
            Camera
          </button>

        </div>

        {!mediaUrl && activeTab !== "camera" && (

          <div
            className="upload-area"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >

            <p>Click or Drag File</p>

            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleFileSelect}
              accept={activeTab === "video" ? "video/*" : "image/*"}
            />

          </div>

        )}

        {mediaUrl && (

          <div className="media-preview-container">

            {mediaType === "video" ? (
              <video src={mediaUrl} controls />
            ) : (
              <img src={mediaUrl} alt="preview" />
            )}

          </div>

        )}

        <div className="action-buttons">

          <button
            className="btn btn-primary"
            onClick={() => currentFile && onAnalyze(currentFile)}
            disabled={!currentFile || isAnalyzing}
          >
            Analyze
          </button>

          <button
            className="btn btn-danger"
            onClick={handleClear}
          >
            Clear
          </button>

        </div>

      </div>

    </div>

  );

}