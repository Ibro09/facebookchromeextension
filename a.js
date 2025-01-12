const puppeteer = require("puppeteer-extra");
const fs = require("fs");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());

(async () => {
  // Launch Puppeteer
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto("https://web.facebook.com/", {
    waitUntil: "domcontentloaded",
  });
  // Set viewport for consistent content loading
  await page.setViewport({ width: 1280, height: 20720 });

  try {
    // Log in to Facebook
    await page.goto("https://www.facebook.com", { 
      waitUntil: "domcontentloaded",
    });

    // Replace with your credentials
    await page.type("#email", "ibsalam24@gmail.com");
    await page.type("#pass", "Password24@");
    await page.click('[name="login"]');

    // Wait for the page to load after login
    await page.waitForNavigation({ waitUntil: "networkidle2" });

    // Navigate to the Facebook group
    const groupURL = "https://web.facebook.com/groups/238990561518405"; // Replace with your group URL
    await page.goto(groupURL, {
      waitUntil: "networkidle2",
      timeout: 60000,
    });

    // Wait for the specific class to load
    await page.waitForSelector("div.x1yztbdb.x1n2onr6.xh8yej3.x1ja2u2z", {
      timeout: 600000000,
    });
    // Enhance your house's
    const divContents = await page.evaluate(() => {
      // Locate all target divs
      const divs = Array.from(
        document.querySelectorAll("div.x1yztbdb.x1n2onr6.xh8yej3.x1ja2u2z")
      );

      // Iterate through divs to find the target
      for (const div of divs) {
        if (div.innerText.includes("a")) {
          // Locate the span with the text "copy"
          const span = Array.from(
            div.querySelectorAll(
              "span.x193iq5w.xeuugli.x13faqbe.x1vvkbs.x1xmvt09.x1lliihq.x1s928wv.xhkezso.x1gmr53x.x1cpjm7i.x1fgarty.x1943h6x.xudqn12.x3x7a5m.x6prxxf.xvq8zen.x1s688f.xi81zsa"
            )
          ).find((span) => span.innerText.toLowerCase().includes("copy"));

          if (span) {
            span.click(); // Click the span
            return { text: span.innerText, clicked: true };
          }
        }
      }
      //web.facebook.com/share/p/19nTB7v4rn/
      https: return { clicked: false }; // No matching element found
    });

    console.log("Result:", divContents);

    // Ensure clipboard content by explicitly copying the text
    if (divContents.clicked) {
      const copiedText = await page.evaluate(() =>
        navigator.clipboard.readText()
      );
      console.log("Copied text:", copiedText);
    } else {
      console.log("No span with 'copy' text found or clicked.");
    }
  } catch (error) {
    console.error("Error:", error);
    // please allow extension to copy text and retry
  } finally {
    // Close the browser
    await browser.close();
  }
})();
