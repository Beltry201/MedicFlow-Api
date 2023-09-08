import fs from "fs/promises";
import path from "path";
import process from "process";
import { authenticate } from "@google-cloud/local-auth";
import { google } from "googleapis";
// If modifying these scopes, delete token.json.
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = path.join(process.cwd(), "helpers/token.json");;
const CREDENTIALS_PATH = path.join(process.cwd(), "helpers/credentials.json");
const credentials_json = {
    installed: {
        client_id:
            "254079760725-ercu82k0vftrg29sonl2f9bd7md3ppbc.apps.googleusercontent.com",
        project_id: "medicflow-sheets",
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url:
            "https://www.googleapis.com/oauth2/v1/certs",
        client_secret: "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",
        redirect_uris: ["http://localhost"],
    },
};

/**
 * Reads previously authorized credentials from the save file.
 *
 * @return {Promise<OAuth2Client|null>}
 */
export async function loadSavedCredentialsIfExist() {
    try {
        const content = await fs.readFile(TOKEN_PATH);
        const credentials = JSON.parse(content);
        return google.auth.fromJSON(credentials);
    } catch (err) {
        return null;
    }
}

/**
 * Serializes credentials to a file comptible with GoogleAUth.fromJSON.
 *
 * @param {OAuth2Client} client
 * @return {Promise<void>}
 */
export async function saveCredentials(client) {
    const keys = credentials_json;
    const key = keys.installed || keys.web;
    const payload = JSON.stringify({
        type: "authorized_user",
        client_id: key.client_id,
        client_secret: key.client_secret,
        refresh_token: client.credentials.refresh_token,
    });
    console.log("\n-- PAYLOAD: ", payload);
    await fs.writeFile(TOKEN_PATH, payload);
}

/**
 * Load or request or authorization to call APIs.
 *
 */
export async function authorize() {
    console.log("\n-- CREDENTIALS_PATH: ", CREDENTIALS_PATH)
    let client = await loadSavedCredentialsIfExist();
    if (client) {
        return client;
    }
    client = await authenticate({
        scopes: SCOPES,
        keyfilePath: CREDENTIALS_PATH,
    });
    if (client.credentials) {
        await saveCredentials(client);
    }
    console.log("\n-- AUTHORIZE: ", client);
    return client;
}

// /**
//  * Prints the names and majors of students in a sample spreadsheet:
//  * @see https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
//  * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
//  */
export async function listMajors(auth) {
    console.log("\n-- AUTH: ", auth);
    const sheets = google.sheets({ version: "v4", auth });
    const res = await sheets.spreadsheets.values.get({
        spreadsheetId: "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
        range: "Class Data!A2:E",
    });
    const rows = res.data.values;
    if (!rows || rows.length === 0) {
        console.log("No data found.");
        return;
    }
    console.log("Name, Major:");
    rows.forEach((row) => {
        // Print columns A and E, which correspond to indices 0 and 4.
        console.log(`${row[0]}, ${row[4]}`);
    });
}

/**
 * Create a google spreadsheet
 * @param {string} title Spreadsheets title
 * @return {string} Created spreadsheets ID
 */
export async function create(title) {
    const { GoogleAuth } = require("google-auth-library");
    const { google } = require("googleapis");

    const auth = new GoogleAuth({
        scopes: "https://www.googleapis.com/auth/spreadsheets",
    });

    const service = google.sheets({ version: "v4", auth });
    const resource = {
        properties: {
            title,
        },
    };
    try {
        const spreadsheet = await service.spreadsheets.create({
            resource,
            fields: "spreadsheetId",
        });
        console.log(`Spreadsheet ID: ${spreadsheet.data.spreadsheetId}`);
        return spreadsheet.data.spreadsheetId;
    } catch (err) {
        // TODO (developer) - Handle exception
        throw err;
    }
}

// authorize().then(listMajors).catch(console.error);
// authorize().then(create).catch(console.error);
