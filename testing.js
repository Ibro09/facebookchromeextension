const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  // Set the local storage data
  const localStorageData = {
    authToken: "your-auth-token",
    userId: "12345",
    // Add other necessary keys and values
  };

  await page.goto("https://facebook.com", { waitUntil: "domcontentloaded" });

  // Set the local storage in the browser
  await page
    .evaluate((data) => {
      for (const [key, value] of Object.entries(data)) {
        localStorage.setItem(key, value);
      }
    }, localStorageData)
    .then(async () => {
      await page.goto("https://web.facebook.com/groups/238990561518405", {
        waitUntil: "networkidle2",
      });
      // Replace with your credentials
    //   await page.type("#email", "ibsalam24@gmail.com");
    //   await page.type("#pass", "Password24@");
    //   await page.click('[name="login"]');
    });


  // Perform actions as needed
  console.log(await page.title());

  //   await browser.close();
})();
