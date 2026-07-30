# Plant Disease Module

The module sends a `multipart/form-data` request with a `file` field to `POST /predict`.

Set either environment variable when the AI service is hosted on another origin:

```env
VITE_PLANT_DISEASE_API_BASE=http://localhost:7860
```

`VITE_PY_API_BASE` remains supported for compatibility. Without either variable, local development uses `http://localhost:7860`; production calls `/predict` on the current origin.

Supported inputs:

- JPG, PNG and WebP images up to 10 MB.
- MP4, WebM and MOV videos up to 50 MB.
