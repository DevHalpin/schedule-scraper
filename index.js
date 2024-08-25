const { chromium } = require("playwright");
require("dotenv").config();
const { handleAllSchedules, handleSchedule } = require("./helpers/processSchedules");

const args = process.argv.slice(2);

(async () => {
  let browser;
  try {
    browser = await chromium.launch({ headless: !args.includes("--gui") });
    const context = await browser.newContext();
    const page = await context.newPage();
    if (!args.includes("--gui")) {
      console.log("Running in headless mode.  Please wait while data is fetched. This may take up to 2 minutes.");
    }
    try {
      await page.goto("https://clock-tower.lighthouselabs.ca/");
    } catch (error) {
      console.error("Failed to navigate to the website:", error);
      throw error; // Re-throw the error after logging
    }

    try {
      await page.click("text=Log In");
      await page.click("text=Sign in with Github");

      await page.fill('input[name="login"]', process.env.GITHUB_USERNAME);
      await page.fill('input[name="password"]', process.env.GITHUB_PASSWORD);
      await page.click(".js-sign-in-button");

      await page.click("text=Schedule");
      await page.waitForTimeout(2000)
    } catch (error) {
      console.error("Failed during login or navigation:", error);
      throw error;
    }

    if (args.includes("--next")) {
      const nextClicks = parseInt(args[args.indexOf("--next") + 1], 10) || 1;
      console.log(`--next argument detected. Navigating ${nextClicks} week(s) forward.`);
      for (let i = 0; i < nextClicks; i++) {
        try {
          await page.click("text=Next")
          await page.waitForTimeout(2000);
        } catch (error) {
          console.error("Failed to click 'Next Week':", error);
          throw error;
        }
      }
    }

    if (args.includes("--all")) {
      handleAllSchedules(page);
    } else {
      handleSchedule(page, args);
    }
  } catch (error) {
    console.error("An error occurred during the script execution:", error);
  }
})();

