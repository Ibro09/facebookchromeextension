const puppeteer = require("puppeteer-extra");
const fs = require("fs");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());

(async () => {
   const headfulBrowser = await puppeteer.launch({
    headless: false,
   userDataDir:'./user_data'
  });
  const headful = await headfulBrowser.newPage();

  const links = [];
  try {
    // Log in to Facebook


    // Navigate to the Facebook group
    const groupURL = "https://web.facebook.com/groups/238990561518405";
    await headful.goto(groupURL, { waitUntil: "networkidle2", timeout: 60000 });

    // Wait for the specific class to load
    await headful.waitForSelector("div.x1yztbdb.x1n2onr6.xh8yej3.x1ja2u2z", {
      timeout: 60000,
    });

    const keywords = ["posts"];
    const results = [];

    for (const keyword of keywords) {
      const divContents = await headful.evaluate(async (keyword) => { 
        const results = [];
        const links = [];
        const divs = Array.from(
          document.querySelectorAll("div.x1yztbdb.x1n2onr6.xh8yej3.x1ja2u2z")
        );

        for (const div of divs) {
          if (div.innerText.includes(keyword)) {
            const span = Array.from(
              div.querySelectorAll(
                "span.x193iq5w.xeuugli.x13faqbe.x1vvkbs.x1xmvt09.x1lliihq.x1s928wv.xhkezso.x1gmr53x.x1cpjm7i.x1fgarty.x1943h6x.xudqn12.x3x7a5m.x6prxxf.xvq8zen.x1s688f.xi81zsa"
              )
            ).find((span) => span.innerText.toLowerCase().includes("copy"));

            if (span) {
              span.click(); // Click the span
              results.push({ text: span.innerText, clicked: true });
              //  const copiedText =navigator.clipboard.readText()
              //  links.push(copiedText)
            }
          }
        }

        return results;
      }, keyword);

      results.push(...divContents);

      // Ensure clipboard content for all matches
      for (const content of divContents) {
        if (content.clicked) {
          const copiedText = await headful.evaluate(() =>
            navigator.clipboard.readText()
          );
          links.push(copiedText);
        }
      }
    }
    const uniqueList = [...new Set(links)];
    console.log("Final Results:", results, uniqueList);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await headfulBrowser.close();
  }
})();
