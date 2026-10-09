const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json({ limit: "2mb" }));

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.json({
    status: "online",
    message: "AI Video Backend is running"
  });
});

app.post("/api/generate-video", async (req, res) => {
  try {
    const {
      script,
      aspectRatio = "9:16"
    } = req.body;

    if (!script) {
      return res.status(400).json({
        success: false,
        error: "Script is required"
      });
    }

    if (!process.env.MAGIC_HOUR_API_KEY) {
      return res.status(500).json({
        success: false,
        error: "MAGIC_HOUR_API_KEY is not configured"
      });
    }

    const response = await fetch(
      "https://api.magichour.ai/v1/text-to-video",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "Authorization":
            `Bearer ${process.env.MAGIC_HOUR_API_KEY}`
        },

        body: JSON.stringify({
          name: "AI Video Generator",
          end_seconds: 3,
          aspect_ratio: aspectRatio,
          model: "ltx-2.5",
          resolution: "480p",
          audio: false,
          style: {
            prompt: script
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

    res.json({
      success: true,
      message: "Video generation started",
      data: data
    });

  } catch (error) {
    console.error("Server Error:", error);

    res.status(500).json({
      success: false,
      error:
        error.message ||
        "Video generation failed"
    });
  }
});

app.listen(PORT, () => {
  console.log(
    `AI Video Backend is running on port ${PORT}`
  );
});
