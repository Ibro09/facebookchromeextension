const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");
const puppeteer = require("puppeteer-extra");
const fs = require("fs");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
require("dotenv").config();
puppeteer.use(StealthPlugin());
const app = express();
const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: [
      "https://facebookextension.vercel.app", // Your hosted client app
      "chrome-extension://kpajpkajnfgohgbkbhkpmoembnlepheb", // Replace with your extension ID
    ],
    methods: ["GET", "POST"],
    credentials: true, // Allow cookies or headers if needed
  },
});
const path = require("path");

// Get the parent directory
const parentDir = path.resolve(__dirname, ".");

// Read files and directories in the parent directory
// fs.readdir(parentDir, (err, files) => {
//   if (err) {
//     console.error("Error reading directory:", err);
//     return;
//   }

//   console.log("Files in the parent directory:");
//   files.forEach((file) => {
//     console.log(file);
//   });
// });
fs.readdir(path.resolve(__dirname, "../../../render"), (err, files) => {
  if (err) {
    console.error("Error reading directory:", err);
    return;
  }

  console.log("Files in the parent parent directory:");
  files.forEach((file) => {
    console.log(file);
  });
});
fs.readdir(path.resolve(__dirname, "../../../render/.cache"), (err, files) => {
  if (err) {
    console.error("Error reading directory:", err);
    return;
  }

  console.log("Files in the parent parent directory:");
  files.forEach((file) => {
    console.log(file);
  });
});


// Replace with the directory you want to list

// Print the default cache path
const cachePath = require('path').resolve(require('os').homedir(), '.cache', 'puppeteer');
console.log('Puppeteer Cache Path:', cachePath);
const stripe = require("stripe")(process.env.STRIPE);

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
const mongoURI = process.env.MONGODB_URI; // Replace with your MongoDB URI
mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Error connecting to MongoDB:", err));

// Define a Schema and Model
const DataSchema = new mongoose.Schema({
  userId: String,
  premium: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const DataModel = mongoose.model("Data", DataSchema);

io.on("connection", (socket) => {
  console.log("New client connected");
  socket.on("message", (data) => {
    console.log("Received message from client:", data);
    socket.emit("response", { message: "Hello from the server!" });
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// Routes
app.get("/", (req, res) => {
  console.log("a");
  res.send("done");
});

// POST Route - Add data
app.post("/api/data", async (req, res) => {
  try {
    const { userId } = req.body;
    console.log(userId);
    const data = await DataModel.find({ userId });
    console.log(data);
    if (data.length != 0) {
      console.log(data);
      return res.status(200).json(data);
    } else {
      const newData = new DataModel({ userId });
      const savedData = await newData.save();
      const browser = await puppeteer.launch({
        headless: true,
        args: ["--remote-debugging-port=9222"],
        userDataDir: "./user_data",
      });
      const page = await browser.newPage();
      await page.goto("https://www.facebook.com", {
        waitUntil: "domcontentloaded",
      });
      await page.setViewport({ width: 1280, height: 20720 });

      // Replace with your credentials
      await page.type("#email", "ibsalam24@gmail.com");
      await page.type("#pass", "Password24@");
      setTimeout(async () => {
        await page.click('[name="login"]');
      }, 9000);
      await page.waitForNavigation({
        waitUntil: "networkidle2",
        timeout: 60000,
      });
      await browser.close();

      return res.status(201).json(savedData);
    }
  } catch (error) {
    res.status(500).json({ message: "Error saving data", error });
  }
});

// GET Route - Fetch user  data
app.get("/api/data/user", async (req, res) => {
  const { userId } = req.body;
  try {
    const data = await DataModel.find({ userId });
    res.status(200).json({ data });
  } catch (error) {
    res.status(500).json({ message: "Error fetching data", error });
  }
});

// POST Route - Add data
app.post("/api/keywords", async (req, res) => {
  const { keyword, group } = req.body;
  console.log(keyword, group);
  try {
    // res.status(200).json({keyword,group})
    (async () => {
      const headfulBrowser = await puppeteer.launch({
        headless: false,
        userDataDir: "./user_data",
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
        ], // Required for some environments
        ignoreDefaultArgs: ["--disable-extensions"],
      });
      const headful = await headfulBrowser.newPage();

      const links = [];
      try {
        // Navigate to the Facebook group
        await headful.goto(group, {
          waitUntil: "networkidle2",
          timeout: 60000,
        });

        // Wait for the specific class to load
        await headful.waitForSelector(
          "div.x1yztbdb.x1n2onr6.xh8yej3.x1ja2u2z",
          {
            timeout: 60000,
          }
        );

        const keywords = ["posts"];
        const results = [];

        for (const word of keyword) {
          const divContents = await headful.evaluate(async (word) => {
            const results = [];
            const links = [];
            const divs = Array.from(
              document.querySelectorAll(
                "div.x1yztbdb.x1n2onr6.xh8yej3.x1ja2u2z"
              )
            );

            for (const div of divs) {
              if (div.innerText.includes(word)) {
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
          }, word);

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
        res.status(200).json({ links: uniqueList });
      } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: "Error saving data", error });
      } finally {
        setInterval(async () => {
          try {
            await headful.bringToFront(); // Ensure the page is in focus.
            await headful.evaluate(() => {
              document.body.focus();
            });
            await headful.reload({ waitUntil: "networkidle2" });
            // Wait for the specific class to load
            await headful.waitForSelector(
              "div.x1yztbdb.x1n2onr6.xh8yej3.x1ja2u2z",
              {
                timeout: 60000,
              }
            );

            const keywords = ["posts"];
            const results = [];

            for (const word of keyword) {
              const divContents = await headful.evaluate(async (word) => {
                const results = [];
                const links = [];
                const divs = Array.from(
                  document.querySelectorAll(
                    "div.x1yztbdb.x1n2onr6.xh8yej3.x1ja2u2z"
                  )
                );

                for (const div of divs) {
                  if (div.innerText.includes(word)) {
                    const span = Array.from(
                      div.querySelectorAll(
                        "span.x193iq5w.xeuugli.x13faqbe.x1vvkbs.x1xmvt09.x1lliihq.x1s928wv.xhkezso.x1gmr53x.x1cpjm7i.x1fgarty.x1943h6x.xudqn12.x3x7a5m.x6prxxf.xvq8zen.x1s688f.xi81zsa"
                      )
                    ).find((span) =>
                      span.innerText.toLowerCase().includes("copy")
                    );

                    if (span) {
                      span.click(); // Click the span
                      results.push({ text: span.innerText, clicked: true });
                    }
                  }
                }

                return results;
              }, word);

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
            io.emit("results", { uniqueList });
          } catch (error) {
            console.log(error);
            await headful.close();
          }
        }, 60000);
      }
    })();
  } catch (error) {
    res.status(500).json({ message: "Error saving data", error });
  }
});

// GET Route - Fetch all data
app.get("/api/data", async (req, res) => {
  try {
    const data = await DataModel.find();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: "Error fetching data", error });
  }
});

app.post("/create-checkout-session", async (req, res) => {
  const { amount, userId } = req.body;
  try {
    console.log(amount);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"], // Accept card payments
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "facebook Chrome Extension", // Name displayed on the checkout page
            },
            unit_amount: amount, // Price in cents ($10.00)
          },
          quantity: 1,
        },
      ],
      success_url: `https://stripe-payment-main.vercel.app/success?id=${userId}`, // Redirect after successful payment
      cancel_url: "https://stripe-payment-main.vercel.app/cancelled", // Redirect after canceled payment
    });

    console.log(session);
    // res.json({ url: session.url }); // Return the correct session URL

    // Return the Checkout session URL to the client
    res.json({ url: session });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/premium", async (req, res) => {
  const { id } = req.body;
  console.log(id);

  try {
    const data = await DataModel.findOneAndUpdate(
      { userId: id },
      {
        $set: { premium: true },
      }
    );
    res.status(200).json({ data });
  } catch (error) {
    res.status(500).json({ message: "Error fetching data", error });
  }
});
// Start Server
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
