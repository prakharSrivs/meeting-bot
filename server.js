import { launch } from 'puppeteer';
import dotenv from 'dotenv'
dotenv.config()  
let browser;

const joinMeeting = async (meetingId, meetingPassCode, joineeName)=>{
    console.log("Bot Intialized");
    browser = await launch({
        headless: "new",
        args:[
            '--no-sandbox',
            '--disable-gpu',
            '--enable-webgl',
            '--window-size=800,800',
            '--disable-setuid-sandbox'
        ],
        ignoreDefaultArgs: ['--disable-extensions']
    }); 
    console.log("Browser Launched");
    const page = await browser.newPage();
    page.setDefaultTimeout(60000);  
    const ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36";
    await page.setUserAgent(ua);
    await page.goto("https://app.zoom.us/wc/join");
    const meetingInput = await page.waitForSelector('input[type="text"]');
    await meetingInput.type(meetingId);
    const joinButton = await page.waitForSelector('.btn-join');
    await joinButton.click();
    await page.waitForFunction(`
        document.querySelector("#webclient")
          .contentDocument.querySelector("#input-for-pwd")
      `);
    const f = await page.waitForSelector("#webclient");
    const frame = await f.contentFrame();
    await frame.type("#input-for-pwd", meetingPassCode);
    await frame.type("#input-for-name", joineeName);
    await frame.$$eval("button", els =>
        els.find(el => el.textContent.trim() === "Join").click()
      );
    await frame.waitForSelector(".join-dialog");
    await frame.$$eval("button", els =>
        els.find( el => el.textContent.trim() === "Join Audio by Computer" ).click()
    )
    console.log("Meeting Joined");
    await frame.$$eval("span",els => {
        els.find( el => el.textContent.trim() === "Leave" ).click();
    })
    await frame.$$eval("button", el =>
        el.find( el => el.textContent.trim() === "Leave Meeting" ).click()
    )
    console.log("Meeting Exited");
}

joinMeeting(process.env.meetingId, process.env.meetingPasscode, process.env.joineeName)
.catch( e => console.log(e))
.finally( () => browser?.close() )