#!/usr/bin/env node

// Before using it, copy the 'config.sample.js' file to ~/.peoplehr/ (e.g. C:\Users\yourname\.peoplehr\),
// rename it to 'config.js' and fill the data.

const {Builder, By, until} = require('selenium-webdriver');
const fs = require('fs');
const os = require('os');
const path = require('path');
const url = require('url');
const datadir = path.join(os.homedir(), '.peoplehr');

const configFile = path.join(datadir, 'config.json');

if (!fs.existsSync(configFile)) {
  console.error(`Please create the file '${configFile}'.`);
  return;
}

const {email, password, peoplehr} = require(configFile);

async function registerDate(date) {
  console.log('Adding timesheet assignment for ' + date);
  const driver = await new Builder().forBrowser('firefox').build();


  driver.fillField = async (id, content) => {
    const el = await driver.findElement(By.id(id));
    await el.clear();
    await el.sendKeys(content);
  }


  async function retryClick(element) {
    for (let i = 0; i < 5; i++) {
      await driver.sleep(1000);
      try {
        await element.click();
        break;
      } catch (e) {
        console.log('Click failed!');
      }
    }
  }
  
  try {
    console.log('Authenticating...');
    await driver.get(peoplehr);
    await driver.fillField("txtEmailId" , email);
    await driver.fillField("txtPassword", password);
    await (await driver.findElement(By.id('btnLogin'))).click();
    await driver.wait(until.urlContains("Dashboard.aspx"), 5000);
    console.log('Opening my details...');
    await driver.get(url.resolve(peoplehr, '/Pages/LeftSegment/MyDetails.aspx'));

    var plannerButton = await driver.wait(until.elementLocated(By.id('contentMain_ucEmployeeLink_hlnPlanner')), 50000);
    await retryClick(plannerButton);

    const monthstartdate = date.substr(0, 8) + '01';
    const monthElement = await driver.wait(until.elementLocated(By.css(".accordeon[data-monthstartdate='" + monthstartdate + "']")), 20000);
    const monthClass = await monthElement.getAttribute('class');
    if (monthClass.indexOf("active") === -1)
      await retryClick(monthElement);

    var dateElement = await driver.wait(until.elementLocated(By.css(".sgreen [data-date='" + date + "']")), 20000);
    await driver.wait(until.elementIsVisible(dateElement), 5000);
    var btnClass = await dateElement.getAttribute('class');
    if (btnClass !== 'icn') {
      console.error('This day has already a time assignment');
      return;
    }

    await retryClick(dateElement);
    console.log('Filling out...');
    var addBreakElement = await driver.wait(until.elementLocated(By.css(".addabreak")), 5000);
    await driver.wait(until.elementIsVisible(addBreakElement), 5000);
    await addBreakElement.click();
    await driver.fillField("txtTimeInHH1" , '09');
    await driver.fillField("txtTimeInMM1" , '00');
    await driver.fillField("txtTimeOutHH1", '13');
    await driver.fillField("txtTimeOutMM1", '00');
    await driver.fillField("txtTimeInHH2" , '14');
    await driver.fillField("txtTimeInMM2" , '00');
    await driver.fillField("txtTimeOutHH2", '18');
    await driver.fillField("txtTimeOutMM2", '00');
    const saveBtn = await driver.findElement(By.css('.breaktimesheetsave'));
    console.log('Saving...');
    await saveBtn.click();

    console.log('Opening again the same day...');
    dateElement = await driver.wait(until.elementLocated(By.css(".sgreen .add[data-date='" + date + "']")), 20000);
    await driver.wait(until.elementIsVisible(dateElement), 5000);
    console.log('Taking snapshot...');
    var calendarImage = await driver.takeScreenshot();
    const writeSnapshot = (img, filename) => fs.writeFile(filename, img, 'base64', err => { if (err !== null) console.log(err); });

    writeSnapshot(calendarImage, path.join(datadir, date + '-1.png'));
    await retryClick(dateElement);
    addBreakElement = await driver.wait(until.elementLocated(By.css(".addabreak")), 5000);
    await driver.wait(until.elementIsVisible(addBreakElement), 5000);

    console.log('Taking snapshot...');
    const modalImage = await driver.takeScreenshot();
    writeSnapshot(modalImage, path.join(datadir, date + '-2.png'));
  } finally {
    await driver.quit();
  }
}

const cliArgs = process.argv.slice(2);
const startdate = new Date(cliArgs.length === 0? new Date(): cliArgs[0]);
const enddate = new Date(cliArgs.length <= 1? startdate: cliArgs[1]);
date = startdate;
do  {
  if (date.getDay() !== 0 && date.getDay() !== 6)
    registerDate(date.toISOString().substr(0, 10));
  date.setDate(date.getDate() + 1);
} while (date <= enddate)


