import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // API Proxy for Universities (with fallback for network resilience)
  const FALLBACK_UNIVERSITIES = [
    { name: "Harvard University", country: "United States", web_pages: ["https://www.harvard.edu"] },
    { name: "University of Oxford", country: "United Kingdom", web_pages: ["https://www.ox.ac.uk"] },
    { name: "Stanford University", country: "United States", web_pages: ["https://www.stanford.edu"] },
    { name: "Massachusetts Institute of Technology (MIT)", country: "United States", web_pages: ["https://web.mit.edu"] },
    { name: "University of Cambridge", country: "United Kingdom", web_pages: ["https://www.cam.ac.uk"] },
    { name: "ETH Zurich", country: "Switzerland", web_pages: ["https://ethz.ch"] },
    { name: "University of Toronto", country: "Canada", web_pages: ["https://www.utoronto.ca"] },
    { name: "National University of Singapore (NUS)", country: "Singapore", web_pages: ["https://www.nus.edu.sg"] },
    { name: "Imperial College London", country: "United Kingdom", web_pages: ["https://www.imperial.ac.uk"] },
    { name: "Tsinghua University", country: "China", web_pages: ["https://www.tsinghua.edu.cn"] },
    { name: "Melbourne University", country: "Australia", web_pages: ["https://www.unimelb.edu.au"] },
    { name: "Technical University of Munich", country: "Germany", web_pages: ["https://www.tum.de"] }
  ];

  app.get("/api/universities", async (req, res) => {
    const { name, country } = req.query;
    if (!name && !country) {
      return res.status(400).json({ error: "Missing name or country parameter" });
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // Shorter 5s timeout

      let url = `https://universities.hipolabs.com/search?`;
      if (name) url += `name=${encodeURIComponent(name as string)}&`;
      if (country) url += `country=${encodeURIComponent(country as string)}`;

      const response = await fetch(url, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) throw new Error(`Upstream returned ${response.status}`);
      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      // Silently handle restricted network - return fallback matches
      const searchStr = (name as string || "").toLowerCase();
      const countryStr = (country as string || "").toLowerCase();

      const filteredFallback = FALLBACK_UNIVERSITIES.filter(uni => {
        const nameMatch = name ? uni.name.toLowerCase().includes(searchStr) : true;
        const countryMatch = country ? uni.country.toLowerCase().includes(countryStr) : true;
        return nameMatch && countryMatch;
      });

      res.json(filteredFallback.length > 0 ? filteredFallback : FALLBACK_UNIVERSITIES.slice(0, 8));
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
