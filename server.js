// server.js
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import fetch from 'node-fetch'; // Needed for Pexels API calls
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Resolve __dirname when using ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from the public folder
app.use(express.static(path.join(__dirname, 'public')));

// Create an S3 client for Cloudflare R2
const s3 = new S3Client({
  region: process.env.R2_REGION, // Often "auto" for R2
  endpoint: process.env.R2_ENDPOINT, // e.g., https://<account_id>.r2.cloudflarestorage.com
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

// Helper function: list objects from your R2 bucket with a given prefix.
async function listObjects(prefix) {
  const command = new ListObjectsV2Command({
    Bucket: process.env.R2_BUCKET_NAME,
    Prefix: prefix,
  });
  const data = await s3.send(command);
  return data.Contents || [];
}

// ----- Endpoints for Photos -----
// Return water-related photos stored under "photos/water/"
// The URL is built as "https://waterpng.com/" + key.
app.get('/api/photos/search', async (req, res) => {
  try {
    const prefix = 'photos/water/';
    const objects = await listObjects(prefix);
    const photos = objects.map(item => ({
      key: item.Key,
      url: `https://waterpng.com/${item.Key}`,
      lastModified: item.LastModified,
      size: item.Size,
    }));
    // Wrap the photos array with total_results (using photos.length)
    res.json({ total_results: photos.length, photos });
  } catch (error) {
    console.error("Error fetching photos from R2:", error);
    res.status(500).json({ error: 'Error fetching photos' });
  }
});

// Curated photos (for example, images under "photos/water/")
app.get('/api/photos/curated', async (req, res) => {
  try {
    const prefix = 'photos/water/';
    const objects = await listObjects(prefix);
    const photos = objects.map(item => ({
      key: item.Key,
      url: `https://waterpng.com/${item.Key}`,
      lastModified: item.LastModified,
      size: item.Size,
    }));
    res.json({ total_results: photos.length, photos });
  } catch (error) {
    console.error("Error fetching curated photos from R2:", error);
    res.status(500).json({ error: 'Error fetching curated photos' });
  }
});

// Photo detail by ID (assumes the id matches a file name under "photos/water/")
app.get('/api/photos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // Construct the key (assuming the file is stored in photos/water/)
    const key = `photos/water/${id}`;
    // Build the URL using your domain (waterpng.com)
    const imageUrl = `https://waterpng.com/${key}`;

    // Return a photo object with the structure expected by the client.
    res.json({
      avg_color: "#ffffff", // default background color
      height: 600,          // default height
      width: 800,           // default width
      photographer: "Unknown",
      alt: "Water Image",
      src: {
        original: imageUrl,
        large2x: imageUrl,
        // add more sizes if necessary
      }
    });
  } catch (error) {
    console.error("Error fetching photo detail from R2:", error);
    res.status(500).json({ error: 'Error fetching photo detail' });
  }
});

// ----- Endpoints for Videos -----
// These endpoints now proxy requests to Pexels API

// Helper function to proxy requests to the Pexels API.
async function proxyToPexels(url, res) {
  try {
    const response = await fetch(url, {
      headers: {
        Authorization: process.env.PEXELS_API_KEY,
      },
    });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Error fetching from Pexels:", error);
    res.status(500).json({ error: 'Error contacting Pexels API' });
  }
}

// Search videos
app.get('/api/videos/search', (req, res) => {
    if (req.query.query) {
        req.query.query += " water";
      } else {
        req.query.query = "water";
      }
  const queryString = new URLSearchParams(req.query).toString();
  const url = `https://api.pexels.com/videos/search?${queryString}`;
  proxyToPexels(url, res);
});

// Popular videos
app.get('/api/videos/popular', (req, res) => {
    // If a query already exists, append " water", otherwise set it to "water"
    if (req.query.query) {
      req.query.query += " water";
    } else {
      req.query.query = "water";
    }
    const queryString = new URLSearchParams(req.query).toString();
    const url = `https://api.pexels.com/videos/search?${queryString}`;
    console.log(url);
    proxyToPexels(url, res);
  });
  
// Video detail by ID
app.get('/api/videos/videos/:id', (req, res) => {
  const { id } = req.params;
  const url = `https://api.pexels.com/videos/videos/${id}`;
  proxyToPexels(url, res);
});

// ----- Endpoints for Collections -----
// Featured collections (for example, collections stored under "photos/water/")
app.get('/api/collections/featured', async (req, res) => {
  try {
    const prefix = 'photos/water/';
    const objects = await listObjects(prefix);
    const collections = objects.map(item => ({
      key: item.Key,
      url: `https://waterpng.com/${item.Key}`,
      lastModified: item.LastModified,
      size: item.Size,
    }));
    res.json(collections);
  } catch (error) {
    console.error("Error fetching featured collections from R2:", error);
    res.status(500).json({ error: 'Error fetching featured collections' });
  }
});

// Collection detail by ID (assumes the id corresponds to a folder under "photos/water/")
app.get('/api/collections/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const prefix = `photos/water/${id}/`;
    const objects = await listObjects(prefix);
    const items = objects.map(item => ({
      key: item.Key,
      url: `https://waterpng.com/${item.Key}`,
      lastModified: item.LastModified,
      size: item.Size,
    }));
    res.json({ id, items });
  } catch (error) {
    console.error("Error fetching collection detail from R2:", error);
    res.status(500).json({ error: 'Error fetching collection detail' });
  }
});

// ----- Additional Endpoint -----
// The /api/key endpoint is no longer needed for self-hosted images.
app.get('/api/key', (req, res) => {
  res.json({ message: "No API key required for self-hosted images" });
});

// Serve the main HTML file for the root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
