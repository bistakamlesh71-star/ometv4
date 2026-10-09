
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json({ limit: "2mb" }));

const PORT = process.env.PORT || 3000;
const MAGIC_HOUR_API_URL =
  "https://api.magichour.ai/v1/text-to-video";

app.get("/", (req, res) => {
  res.json({
    success: true,
    status: "online",
    message: "KABIYA AI Backend is running"
  });
});

app.post("/api/generate-video", async (req, res) => {
  try {
    const {
      script,
      aspectRatio = "9:16",
      duration = 1
    } = req.body;

    if (typeof script !== "string" || !script.trim()) {
      return res.status(400).json({
        success: false,
        error: "Please enter a video prompt."
      });
    }

    const apiKey = process.env.MAGIC_HOUR_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        success: false,
        error: "MAGIC_HOUR_API_KEY is not configured in Render."
      });
    }

    const allowedRatios = ["9:16", "16:9", "1:1"];

    if (!allowedRatios.includes(aspectRatio)) {
      return res.status(400).json({
        success: false,
        error: "Invalid aspect ratio."
      });
    }

    const seconds = Number(duration);

    if (![1, 2, 3].includes(seconds)) {
      return res.status(400).json({
        success: false,
        error: "Duration must be 1, 2, or 3 seconds."
      });
    }

    // Keep resolution at 480p for this configuration.
    const requestBody = {
      name: "KABIYA AI Video",
      end_seconds: seconds,
      aspect_ratio: aspectRatio,
      model: "ltx-2.5",
      resolution: "480p",
      audio: false,
      style: {
        prompt: script.trim()
      }
    };

    const response = await fetch(MAGIC_HOUR_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error("Magic Hour API error:", data);

      const errorMessage =
        typeof data.error === "string"
          ? data.error
          : typeof data.message === "string"
            ? data.message
            : JSON.stringify(data);

      return res.status(response.status).json({
        success: false,
        error: errorMessage || "Magic Hour generation failed.",
        details: data
      });
    }

    return res.status(200).json({
      success: true,
      message: "Video generation request submitted.",
      data: data
    });

  } catch (error) {
    console.error("KABIYA AI server error:", error);

    return res.status(500).json({
      success: false,
      error: error.message || "Video generation request failed."
    });
  }
});

app.listen(PORT, () => {
  console.log(`KABIYA AI Backend running on port ${PORT}`);
});
