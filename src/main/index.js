import { app, shell, BrowserWindow, ipcMain, Tray } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import axios from 'axios'
import { timeout } from 'puppeteer'

const express = require('express');
const puppeteer = require('puppeteer');
const crwalerApp = express();
const port = 4000;

crwalerApp.get('/price', async (req, res) => {


  const models = req.query.models;
  const set = new Set(models);
  const uniqModels = [...set];

  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36');

  const priceArry = [];

  for (const model of uniqModels) {

    const price = {
      model: "-",
      name: "-"
    };

    price.model = model;


    const targetList = [
      {
        name: "kream",
        url: "https://kream.co.kr/search?keyword=" + model,
        nameSelector: 'xpath///*[@id="__layout"]/div/div[2]/div[1]/div[6]/div/div[1]/div/div[1]/div[1]/div/div/a/div[2]/div[1]/div/p[2]',
        priceSelector: 'xpath///*[@id="__layout"]/div/div[2]/div[1]/div[6]/div/div[1]/div/div[1]/div[1]/div/div/a/div[3]/p[1]/text()',
        // priceSelector: '#__layout > div > div.layout__main.search-container > div.content-container > div.content > div > div.shop-content > div > div.search_result.md > div.search_result_list > div > div > a > div.price.price_area > p.amount' 
      },
      {
        name: "soldout",
        url: "https://www.soldout.co.kr/search/product/list?keyword=" + model,
        nameSelector: 'xpath///*[@id="__layout"]/div/div[2]/div/div[2]/div[2]/ul/div/a/div[2]/p[1]',
        priceSelector: 'xpath///*[@id="__layout"]/div/div[2]/div/div[2]/div[2]/ul/div/a/div[2]/p[2]'
      },
      // {
      //   name: "poizon",
      //   url: "https://www.poizon.com/search?keyword=" + model,
      //   nameSelector: "-",
      //   priceSelector: "#__next > div > section > div > div > div:nth-child(1) > div.GoodsFilterList_content__tl5FA > div.GoodsFilterList_right__8kWIb > div.GoodsList_goodsList__hPoCW > a > div.GoodsItem_priceWrap__Ikha8 > div"
      // },
      {
        name: "nike",
        url: "https://www.nike.com/kr/w?q=" + model,
        nameSelector: '-',
        priceSelector: 'xpath///*[@id="skip-to-products"]/div[1]/div/figure/div/div[3]/div/div/div/div'
      },
      {
        name: "adidas",
        url: "https://www.adidas.co.kr/search?q=" + model,
        nameSelector: 'xpath///*[@id="main-content"]/div[2]/div[2]/div[1]/h1/span',
        priceSelector: 'xpath///*[@id="main-content"]/div[2]/div[2]/div[1]/div[2]/div/div/div/div'
      },
      {
        name: "moosinsa",
        url: "https://www.musinsa.com/search/goods?keyword=" + model,
        nameSelector: 'xpath///*[@id="commonLayoutContents"]/div/div[3]/div/div/div/div/div/div/div/div[2]/div/div[1]/a[2]/span',
        priceSelector: 'xpath///*[@id="commonLayoutContents"]/div/div[3]/div/div/div/div/div/div/div/div[2]/div/div[1]/div/span[2]'
      },
      {
        name: "folder",
        url: "https://folderstyle.com/shop/search?searchText=" + model,
        nameSelector: 'xpath///*[@id="devListContents"]/li/a[2]/div/span[2]',
        priceSelector: 'xpath///*[@id="devListContents"]/li/a[2]/div/div/span'
      }

    ];

    for (const target of targetList) {

      await page.goto(target.url);

      // Get name
      try {
        if (price.name === "-") {

          await page.waitForSelector(target.nameSelector, { timeout: 500 });

          const nameData = await page.$eval(
            target.nameSelector, element => {
              return element.textContent;
            });


          price.name = nameData;
        }

      } catch (error) {
        console.log("Failed to get " + target.name + " name");
      }

      // Get price
      try {

        await page.waitForSelector(target.priceSelector, { timeout: 500 });

        // Filter nike
        if (target.name === "nike") {
          const aHref = await page.$eval("#skip-to-products > div:nth-child(1) > div > figure > a.product-card__img-link-overlay", a => a.getAttribute('href'));
          const hrefSlice = aHref.split("/");
          if (hrefSlice[hrefSlice.length - 1] !== model) throw new Error();
        }

        const priceData = await page.$eval(
          target.priceSelector, element => {
            return element.textContent;
          });


        price[target.name] = commaString2Int(priceData?.split(' ').join('').slice(0, -1)).toLocaleString()

      } catch (error) {
        console.log('Failed to get ' + target.name + ' price');
      }
    }


    priceArry.push(price);

  }

  await browser.close();
  res.send(JSON.stringify(priceArry));

});


crwalerApp.listen(port, () => {
  console.log(`Crawler app listening on port ${port}`)
});

function commaString2Int(stringNumber) {
  return parseInt(stringNumber.replace(/,/g, ''));
}



function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })




  ipcMain.on('fetch-data', async (event, args) => {
    try {

      const response = await axios.get('http://localhost:4000/price',
        {
          params: { models: args.models }
        }
      );

      event.reply('fetch-data-response', response.data);
    } catch (error) {
      console.error(error);
    }
  });






  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
