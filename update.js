const fs = require("fs");
const https = require("https");

const API_URL = "https://api.tradingeconomics.com/calendar/country/united%20states?client=guest:guest";



function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve(JSON.parse(data)));
    }).on("error", reject);
  });
}

function buildRSS(events) {
  const items = events
    .map((e) => {
      return `
      <item>
        <title><![CDATA[${e.title}]]></title>
        <description><![CDATA[
          Time: ${e.date}
          Impact: ${e.impact}
          Actual: ${e.actual || "N/A"}
          Forecast: ${e.forecast || "N/A"}
          Previous: ${e.previous || "N/A"}
        ]]></description>
        <pubDate>${new Date(e.date).toUTCString()}</pubDate>
        <guid>${e.id}</guid>
      </item>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
  <rss version="2.0">
    <channel>
      <title>US Economic Calendar</title>
      <description>Real-time US economic events (Low, Medium, High impact)</description>
      <link>https://github.com</link>
      <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
      ${items}
    </channel>
  </rss>`;
}

async function main() {
  try {
    const data = await fetchJSON(API_URL);

    console.log("API returned:", data);   // <-- ADD THIS LINE

    const rss = buildRSS(data);
    fs.writeFileSync("feed.xml", rss);
    console.log("feed.xml updated successfully");
  } catch (err) {
    console.error("Error updating feed:", err);
  }
}

main();
