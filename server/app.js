import express from "express";
import cors from "cors";
import { createReadStream, statSync } from "fs";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Enable CORS for all routes
app.use(cors());

// Serve static files in the "public" directory
app.use(express.static(`${__dirname}/public/mini-swing-01`));

app.get("/", (req, res) => {
    res.send("Hello World");
});

// Route to handle streaming of .ts segments (HLS video chunks)
app.get("/public/:fileName", (req, res) => {
    const filePath = `${__dirname}/public/mini-swing-01/${req.params.fileName}`;
    const stat = statSync(filePath); // Get file stats
    const fileSize = stat.size; // File size in bytes
    const range = req.headers.range;

    if (!range) {
        return res.status(400).send("Requires Range header");
    }

    const chunkSize = 10 ** 6; // 1MB per chunk
    const start = Number(range.replace(/\D/g, ""));
    const end = Math.min(start + chunkSize, fileSize - 1);

    const contentLength = end - start + 1;
    const headers = {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": contentLength,
        "Content-Type": "video/mp2t", // MPEG-TS content type
    };

    res.writeHead(206, headers);

    const fileStream = createReadStream(filePath, { start, end });
    fileStream.pipe(res);
});

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});
