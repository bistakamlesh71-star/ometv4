
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json({ limit: "2mb" }));

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.json({
    status: "online",
    message: "KABIYA AI Backend is running"
  });
});

app.post("/api/generate-video", async (req, res) => {
  try {
    const {
      script,
      aspectRatio = "9:16",
      duration = 1,
      resolution = "480p"
    } = req.body;

    if (typeof script !== "string" || !script.trim()) {
      return res.status(400).json({
        success: false,
        error: "Script is required"
      });
    }

    const apiKey = process.env.MAGIC_HOUR_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        success: false,
        error: "MAGIC_HOUR_API_KEY is not configured"
      });
    }

    const allowedRatios = ["9:16", "16:9", "1:1"];
    const allowedResolutions = ["480p", "720p", "1080p"];
    const allowedDurations = [1, 2, 3];

    if (!allowedRatios.includes(aspectRatio)) {
      return res.status(400).json({
        success: false,
        error: "Invalid aspect ratio"
      });
    }

    if (!allowedResolutions.includes(resolution)) {
      return res.status(400).json({
        success: false,
        error: "Invalid resolution"
      });
    }

    if (!allowedDurations.includes(Number(duration))) {
      return res.status(400).json({
        success: false,
        error: "Choose 1, 2, or 3 seconds"
      });
    }

    const response = await fetch(
      "https://api.magichour.ai/v1/text-to-video",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          name: "KABIYA AI Video",
          end_seconds: Number(duration),
          aspect_ratio: aspectRatio,
          model: "ltx-2.5",
          resolution,
          audio: false,
          style: {
            prompt: script.trim()
          }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Magic Hour Error:", data);

      return res.status(response.status).json({
        success: false,
        error:
          data.error ||
          data.message ||
          "Magic Hour generation failed"
      });
    }

    return res.json({
      success: true,
      message: "Video generation request submitted",
      data
    });

  } catch (error) {
    console.error("Server Error:", error);

    return res.status(500).json({
      success: false,
      error: error.message || "Video generation failed"
    });
  }
});

app.listen(PORT, () => {
  console.log(`KABIYA AI Backend running on port ${PORT}`);
});
