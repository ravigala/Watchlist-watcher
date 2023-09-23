const puppeteer = require('puppeteer');
require('dotenv').config();

const tradingViewUrl = process.env.TRADINGVIEW_URL;
const scriptUrl = process.env.SCRIPT_URL;

async function scrapeData() {
  const browser = await puppeteer.launch({headless: 'new'});
  const page = await browser.newPage();
  await page.goto(tradingViewUrl);
 
  await page
    .waitForFunction(
      () => document.querySelectorAll('.symbolWrap-kn8jy56Z a').length >= 10,
      { timeout: 10000 }
    )
    .catch((err) => {
      runningStatus = false;
      console.log('Error in waitForFunction: ', err);
      //return response;
    });

  await page
    .waitForFunction(
      () => document.querySelectorAll('.symbolWrap-kn8jy56Z span').length >= 10,
      { timeout: 10000 }
    )
    .catch((err) => {
      runningStatus = false;
      console.log('Error in waitForFunction: ', err);
      //return response;
    });


  const nseSymbols = await page.evaluate(() => {
    const symbolElements = document.querySelectorAll('.symbolWrap-kn8jy56Z a');
    const symbols = [];
    for (const element of symbolElements) {
      symbols.push(element.textContent);
    }
    console.log('NSE Symbols:', symbols);
    return symbols;
  });

  const names = await page.evaluate(() => {
    const nameElements = document.querySelectorAll('.description-kn8jy56Z');
    const names = [];
    for (const element of nameElements) {
      names.push(element.textContent);
    }
    console.log('Names:', names);
    return names;
  });

  console.log(nseSymbols);
  console.log(names);

  await browser.close();
  await submitData(names, nseSymbols);

}

async function submitData(names, symbols) {

  const formData = {
    names,
    symbols
  };

  try {
    const response = await fetch(scriptUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: JSON.stringify(formData),
      mode: "cors", // no-cors, *cors, same-origin
      cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    });

    const data = await response.json()

    if (data.status === "success") {
      console.log("data submitted successfully");
      console.log(data)

    } else {
      console.log("data not submitted");
    }
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

scrapeData();
