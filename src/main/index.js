import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import axios from 'axios'

const express = require('express');
const puppeteer = require('puppeteer');
const crwalerApp = express();
const port = 4000;

crwalerApp.get('/price', async (req, res) => {
  

    const models = req.query.models;

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36');

    const priceArry = [];

    for (const model of models) {

        const price = {
            model: "-",
            name: "-",
            kream: 0,
            nike: 0
        };

        const kreamUrl = "https://kream.co.kr/search?keyword=" + model;
        await page.goto(kreamUrl);

        const kreamPriceSelector = "#__layout > div > div.layout__main.search-container > div.content-container > div.content > div > div.shop-content > div > div.search_result.md > div.search_result_list > div > div > a > div.price.price_area > p.amount";
        
        try {

            await page.waitForSelector(kreamPriceSelector, { timeout: 3000 });
            const kreamPriceData = await page.$eval(
                kreamPriceSelector, element => {
                    return element.textContent;
                });
            price.kream = commaString2Int(kreamPriceData?.split(' ').join('').slice(0, -1)).toLocaleString();

        } catch (error) {
            console.log('Failed');
        }

        try {

            const kreamNameSelector = "#__layout > div > div.layout__main.search-container > div.content-container > div.content > div > div.shop-content > div > div.search_result.md > div.search_result_list > div > div > a > div.product_info_area > div.title > div > p.translated_name";
            await page.waitForSelector(kreamNameSelector, { timeout: 3000 });
            
            const kreamNameData = await page.$eval(
                kreamNameSelector, element => {
                    return element.textContent;
            });

            price.name = kreamNameData;


        } catch (error) {
            console.log('Failed');
        }

        price.model = model;

        // https://www.nike.com/kr/w?q=BQ4422-161

        const nikeUrl = "https://www.nike.com/kr/w?q=" + model;
        await page.goto(nikeUrl);

        try {
            const nikeSelector = "#skip-to-products > div > div > figure > div > div.product-card__animation_wrapper > div > div > div > div";
            await page.waitForSelector(nikeSelector, { timeout: 3000 });
            const nikeData = await page.$eval(
                nikeSelector, element => {

                    return element.textContent;
                });
            price.nike = commaString2Int(nikeData?.split(' ').join('').slice(0, -1)).toLocaleString();

        } catch (error) {
            console.log('Failed');
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
          params: {models: args.models}
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
