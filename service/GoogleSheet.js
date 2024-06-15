const { google } = require('googleapis');
const path = require('path');
const process = require('process');
require('dotenv').config();

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

/**
 * Load or request or authorization to call APIs.
 *
 */
async function authorize() {
    const client = new google.auth.GoogleAuth({
        scopes: SCOPES,
        keyFile: CREDENTIALS_PATH,
    });
    const test = await client.getClient();
    return test;
}

async function getGoogleSheetClient() {
    const auth = await authorize();
    const sheets = google.sheets({version: 'v4', auth});
    return sheets;
}

async function loadUserList() {
    const sheets = await getGoogleSheetClient();
    const res = await sheets.spreadsheets.values.get({
        spreadsheetId: process.env.GOOGLE_SHEET_ID,
        range: `${process.env.GOOGLE_SHEET_TAB_NAME}!${process.env.GOOGLE_SHEET_RANGE}`,
    });
    return res.data.values;
}

async function writeNewData(data) {
    const sheets = await getGoogleSheetClient();
    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: `${process.env.GOOGLE_SHEET_TAB_NAME}!${process.env.GOOGLE_SHEET_RANGE}`,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      resource: {
        "majorDimension": "ROWS",
        "values": data
      },
    });
}

module.exports = {
    loadUserList,
    writeNewData
}