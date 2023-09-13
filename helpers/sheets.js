import fs from "fs/promises";
import path from "path";
import { authenticate } from "@google-cloud/local-auth";
import { google } from "googleapis";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

// Get the current module's file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TOKEN_PATH = path.join(
    __dirname,
    "..",
    "credentials",
    "token.json"
);
const CREDENTIALS_PATH = path.join(
    __dirname,
    "..",
    "credentials",
    "credentials.json"
);
const SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive",
];
const PARENT_FOLDER_ID = execSync(
    "source ~/.zshrc && echo $PARENT_FOLDER_ID",
    {
        encoding: "utf-8",
    }
).trim();

console.log("\n-- PARENT_FOLDER_ID: ", PARENT_FOLDER_ID);
class GoogleSheetsManager {
    constructor() {
        this.sheets = null;
        this.drive = null;
    }
    async loadSavedCredentialsIfExist() {
        try {
            const content = await fs.readFile(TOKEN_PATH);
            const credentials = JSON.parse(content);
            return google.auth.fromJSON(credentials);
        } catch (err) {
            console.log(
                `Error while loading credentials: ${err.message}`
            );
            return null;
        }
    }

    async saveCredentials(client) {
        const content = await fs.readFile(CREDENTIALS_PATH);
        const keys = JSON.parse(content);
        const key = keys.installed || keys.web;
        const payload = JSON.stringify({
            type: "authorized_user",
            client_id: key.client_id,
            client_secret: key.client_secret,
            refresh_token: client.credentials.refresh_token,
        });
        await fs.writeFile(TOKEN_PATH, payload);
    }

    async authorize() {
        let client =
            await this.loadSavedCredentialsIfExist();
        if (client) {
            console.log("\n-- TOKEN FOUND");
            this.sheets = google.sheets({
                version: "v4",
                auth: client,
            });
            this.drive = google.drive({
                version: "v3",
                auth: client,
            });
            return client;
        }
        client = await authenticate({
            scopes: SCOPES,
            keyfilePath: CREDENTIALS_PATH,
        });
        if (!client) {
            throw new Error(
                "Authentication failed. Client is null."
            );
        }
        if (client.credentials) {
            await this.saveCredentials(client);
        }

        this.sheets = google.sheets({
            version: "v4",
            auth: client,
        });
        this.drive = google.drive({
            version: "v3",
            auth: client,
        });

        return client; // Return the client if successful
    }

    async createSpreadsheet(title, folderId) {
        const fileMetadata = {
            name: title,
            mimeType:
                "application/vnd.google-apps.spreadsheet",
            parents: [folderId],
        };

        try {
            const response = await this.drive.files.create({
                resource: fileMetadata,
                fields: "id",
            });
            return response.data.id;
        } catch (error) {
            throw new Error(
                `Error creating spreadsheet: ${error.message}`
            );
        }
    }

    async createTemplate(destinationSpreadsheetId) {
        const sourceSpreadsheetId =
            "15peTabdkOlmvxNQSctq64tvshnL1WfiUtM7NThVsGiw";
        const sheetPages = [
            { sheetId: "606442452", newName: "INF" },
            { sheetId: "319693621", newName: "AHF" },
            { sheetId: "1446901820", newName: "APNP" },
            { sheetId: "412664891", newName: "APP" },
            { sheetId: "84164873", newName: "AGO" },
            {
                sheetId: "452059617",
                newName: "Notas Evolutivas",
            },
            {
                sheetId: "621449929",
                newName:
                    "Historia Clinica (Version Completa)",
            },
        ];

        const createdSheets = {};

        try {
            for (const { sheetId, newName } of sheetPages) {
                const response = await this.duplicateSheet(
                    sourceSpreadsheetId,
                    sheetId,
                    destinationSpreadsheetId
                );

                console.log(
                    "\n-- DUPLICATE SHEET ID: ",
                    response.sheetId
                );
                console.log(
                    "\n-- DUPLICATE SHEET TITLE: ",
                    response.title
                );

                const newSheetId = response.sheetId;
                const newSheetTitle = response.title;

                createdSheets[newName] = newSheetId;

                // Rename the sheet
                await this.renameSheet(
                    destinationSpreadsheetId,
                    newSheetId,
                    newName
                );
            }

            // Delete the first sheet
            const deleteRequest = {
                spreadsheetId: destinationSpreadsheetId,
                resource: {
                    requests: [
                        {
                            deleteSheet: {
                                sheetId: 0, // Assuming the first sheet has ID 0
                            },
                        },
                    ],
                },
            };

            await this.sheets.spreadsheets.batchUpdate(
                deleteRequest
            );

            return {
                message:
                    "Sheets copied, renamed, and first sheet deleted successfully.",
                createdSheets,
            };
        } catch (error) {
            throw new Error(
                `Error copying and renaming sheets: ${error.message}`
            );
        }
    }

    async duplicateSheet(
        spreadsheetId,
        sheetId,
        destinationSpreadsheetId
    ) {
        const request = {
            spreadsheetId,
            sheetId,
            requestBody: {
                destinationSpreadsheetId,
            },
        };

        console.log("\n-- DUPLICATE SHEET ID: ", sheetId);
        console.log(
            "\n-- DUPLICATE SPREADSHEET ID: ",
            spreadsheetId
        );

        try {
            const response =
                await this.sheets.spreadsheets.sheets.copyTo(
                    request
                );
            return response.data;
        } catch (error) {
            throw new Error(
                `Error duplicating sheet: ${error.message}`
            );
        }
    }

    async renameSheet(spreadsheetId, sheetId, title) {
        console.log("\n-- RENAME SHEET ID: ", sheetId);
        console.log(
            "\n-- RENAME SPREADSHEET ID: ",
            spreadsheetId
        );

        const request = {
            spreadsheetId,
            resource: {
                requests: [
                    {
                        updateSheetProperties: {
                            properties: {
                                sheetId,
                                title,
                            },
                            fields: "title",
                        },
                    },
                ],
            },
        };

        try {
            const response =
                await this.sheets.spreadsheets.batchUpdate(
                    request
                );
            return response.data;
        } catch (error) {
            throw new Error(
                `Error renaming sheet: ${error.message}`
            );
        }
    }

    async createFolder(folderName) {
        const fileMetadata = {
            name: folderName,
            mimeType: "application/vnd.google-apps.folder",
            parents: [PARENT_FOLDER_ID],
        };

        try {
            const response = await this.drive.files.create({
                resource: fileMetadata,
                fields: "id",
            });
            return response.data.id;
        } catch (err) {
            throw err;
        }
    }

    async sharePermission(
        fileId,
        type,
        role,
        emailAddress,
        domain = null
    ) {
        const request = {
            fileId: fileId,
            resource: {
                type: type,
                role: role,
            },
        };

        if (type === "user" || type === "group") {
            request.resource.emailAddress = emailAddress;
        } else if (type === "domain") {
            request.resource.domain = domain;
        }

        try {
            const response =
                await this.drive.permissions.create(
                    request
                );
            return response.data.id;
        } catch (error) {
            throw new Error(
                `Error sharing permission: ${error.message}`
            );
        }
    }
}

export default GoogleSheetsManager;
