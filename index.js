const express = require('express');
const puppeteer = require('puppeteer');
const bodyParser = require('body-parser');
const app = express();

app.use(express.json());
app.use(bodyParser.text({ type: 'text/html' }));

async function handler(html) {
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    await page.emulateMediaType('screen');

    const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
    });

    await browser.close();

    return pdfBuffer;
};

app.post('/get_pdf', async (req, res) => {
    try {
        const html = req.body;
        if (typeof html === 'string' && html.length > 0) {
            const response = await handler(html);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename=download.pdf');
            res.send(response);
        } else {
            res.send({ error: 'Please provide HTML content' });
        }
    } catch (error) {
        res.send({ error: error.message });
    }
})

app.listen(3000, () => console.log('Server running on port 3000'));


