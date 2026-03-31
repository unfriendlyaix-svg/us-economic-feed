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
  console.log(">>> Using updated buildRSS()");  

  const items = events.map(ev => {
    const title = ev.Event || "No title";
    const pubDate = new Date(ev.Date).toUTCString();
    const guid = ev.CalendarId || ev.URL || Math.random().toString();

    const description = `
      Time: ${ev.Date}
      Category: ${ev.Category}
      Impact: ${ev.Importance}
      Actual: ${ev.Actual || "N/A"}
      Forecast: ${ev.Forecast || "N/A"}
      Previous: ${ev.Previous || "N/A"}
    `.trim();

    return `
      <item>
        <title><![CDATA[ ${title} ]]></title>
        <description><![CDATA[ ${description} ]]></description>
        <pubDate>${pubDate}</pubDate>
        <guid>${guid}</guid>
      </item>
    `;
  }).join("\n");

 return `<?xml version="1.0"?>
<rss version="2.0">
  <channel>
    <title>US Economic Calendar</title>
    <description>Real-time US economic events (Low, Medium, High impact)</description>
    <link>https://github.com</link>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${items}
  </channel>
</rss>
`;
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
