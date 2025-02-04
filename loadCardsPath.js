import express from "express";
import multer from "multer";
import { bucket } from "./firebaseConfig"; // Підключаємо Firebase Storage

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const file = bucket.file(`dixit-cards/${req.file.originalname}`);
    const stream = file.createWriteStream({
      metadata: { contentType: req.file.mimetype },
    });

    stream.on("error", err => res.status(500).json({ error: err.message }));
    stream.on("finish", async () => {
      const url = await file.getSignedUrl({
        action: "read",
        expires: "03-09-2025",
      });
      res.json({ url: url[0] });
    });

    stream.end(req.file.buffer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
