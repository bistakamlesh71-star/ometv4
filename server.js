const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

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
    const { script, aspectRatio = "9:16" } = req.body;

    if (!script) {
      return res.status(400).json({
        success: false,
        error: "Script is required"
      });
    }

    if (!process.env.HF_TOKEN) {
      return res.status(500).json({
        success: false,
        error: "HF_TOKEN is not configured"
      });
    }

    const { InferenceClient } = await import("@huggingface/inference");

    const client = new InferenceClient(process.env.HF_TOKEN);

    const video = await client.textToVideo({
      provider: "fal-ai",
      model: "Wan-AI/Wan2.1-T2V-1.3B",
      inputs: script
    });

    const outputDir = path.join(__dirname, "generated");
    fs.mkdirSync(outputDir, { recursive: true });

    const fileName = `video-${Date.now()}.mp4`;
    const filePath = path.join(outputDir, fileName);

    const buffer = Buffer.from(await video.arrayBuffer());

    fs.writeFileSync(filePath, buffer);

    res.json({
      success: true,
      message: "Video generated successfully",
      videoUrl: `/generated/${fileName}`,
      aspectRatio
    });

  } catch (error) {
    console.error("Video generation error:", error);

    res.status(500).json({
      success: false,
      error: error.message || "Video generation failed"
    });
  }
});

app.use("/generated", express.static(path.join(__dirname, "generated")));

app.listen(PORT, () => {
  console.log(`AI Video Backend is running on port ${PORT}`);
});
