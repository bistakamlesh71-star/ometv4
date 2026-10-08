const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    status: "online",
    message: "AI Video Backend is running"
  });
});

app.post("/api/generate-video", async (req, res) => {
  try {
    const { script, scenes, aspectRatio } = req.body;

    if (!script) {
      return res.status(400).json({
        success: false,
        error: "Script is required"
      });
    }

    console.log("Script:", script);
    console.log("Scenes:", scenes);
    console.log("Aspect Ratio:", aspectRatio);

    return res.json({
      success: true,
      message: "Script received successfully",
      status: "AI video generation endpoint is ready"
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`AI Video Backend is running on port ${PORT}`);
});
