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

    async create_inf_sheet(spreadsheetId, patientData) {
        try {
            // Code for copying the "INF" sheet
            const sourceSpreadsheetId =
                "15peTabdkOlmvxNQSctq64tvshnL1WfiUtM7NThVsGiw"; // Replace with the actual source spreadsheet ID
            const response = await this.duplicateSheet(
                sourceSpreadsheetId,
                "606442452", // Sheet ID for "INF"
                spreadsheetId
            );

            await this.renameSheet(
                spreadsheetId,
                response.sheetId,
                "INF"
            );

            // Define the patient data and formatting logic
            const data = {
                name: {
                    range: "D4",
                    value: patientData.name,
                },
                birth_date: {
                    range: "D5",
                    value: patientData.birth_date,
                },
                sex: {
                    range: "F5",
                    value: patientData.sex,
                },
                civil_state: {
                    range: "D6",
                    value: patientData.civil_state,
                },
                occupation: {
                    range: "F6",
                    value: patientData.occupation,
                },
                scholarship: {
                    range: "D7",
                    value: patientData.scholarship,
                },
                religion: {
                    range: "F7",
                    value: patientData.religion,
                },
                origin: {
                    range: "D8",
                    value: patientData.origin,
                },
                residence: {
                    range: "D9",
                    value: patientData.residence,
                },
            };

            const requests = Object.entries(data).map(
                ([key, { range, value }]) => {
                    let formattedValue = value || "Na.";
                    let textFormat = {
                        foregroundColor: {
                            red: 0.878,
                            green: 0.878,
                            blue: 0.878,
                        }, // Light grey color
                        bold: true,
                    };

                    if (value) {
                        formattedValue = value;
                        textFormat = {
                            foregroundColor: {
                                red: 0,
                                green: 0,
                                blue: 0,
                            },
                        }; // Black color
                    }

                    return {
                        repeatCell: {
                            range: {
                                sheetId: response.sheetId,
                                startRowIndex:
                                    Number(range[1]) - 1,
                                endRowIndex: Number(
                                    range[1]
                                ),
                                startColumnIndex:
                                    range.charCodeAt(0) -
                                    65,
                                endColumnIndex:
                                    range.charCodeAt(0) -
                                    64,
                            },
                            cell: {
                                userEnteredValue: {
                                    stringValue:
                                        formattedValue,
                                },
                                userEnteredFormat: {
                                    textFormat,
                                },
                            },
                            fields: "userEnteredValue,userEnteredFormat.textFormat",
                        },
                    };
                }
            );

            if (patientData.phone_number) {
                requests.push({
                    repeatCell: {
                        range: {
                            sheetId: response.sheetId,
                            startRowIndex: 9, // Row index 9 for D10
                            endRowIndex: 10, // Row index 10 for D10
                            startColumnIndex: 3, // Column index 3 for column D
                            endColumnIndex: 4, // Column index 4 for column D
                        },
                        cell: {
                            userEnteredValue: {
                                stringValue:
                                    patientData.phone_number,
                            },
                            userEnteredFormat: {
                                textFormat: {
                                    foregroundColor: {
                                        red: 0,
                                        green: 0,
                                        blue: 0,
                                    },
                                },
                            }, // Black color
                        },
                        fields: "userEnteredValue,userEnteredFormat.textFormat",
                    },
                });
            }

            // Delete the default "Sheet1" sheet
            const deleteRequest = {
                spreadsheetId,
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

            const batchUpdateRequest = {
                spreadsheetId,
                resource: {
                    requests,
                },
            };

            const updateResponse =
                await this.sheets.spreadsheets.batchUpdate(
                    batchUpdateRequest
                );

            return updateResponse.data;
        } catch (error) {
            throw new Error(
                `Error creating INF sheet and writing data: ${error.message}`
            );
        }
    }

    async create_category_sheets(
        spreadsheetId,
        backgrounds
    ) {
        try {
            for (const [category, data] of Object.entries(
                backgrounds
            )) {
                if (Object.keys(data).length === 0) {
                    continue; // Skip empty categories
                }
                const sourceSpreadsheetId =
                "15peTabdkOlmvxNQSctq64tvshnL1WfiUtM7NThVsGiw"; // Replace with the actual source spreadsheet ID
                // Create a new sheet and rename it to the category
                const response = await this.duplicateSheet(
                    sourceSpreadsheetId,
                    category === "AHF"
                        ? "319693621" // AHF sheet ID
                        : category === "APNP"
                        ? "1446901820" // APNP sheet ID
                        : category === "APP"
                        ? "412664891" // APP sheet ID
                        : "", // Add more conditions for other categories if needed
                    spreadsheetId
                );

                await this.renameSheet(
                    spreadsheetId,
                    response.sheetId,
                    category
                );

                // Define the patient data and formatting logic
                const sheetData = {
                    ...data,
                };

                const requests = Object.entries(
                    sheetData
                ).map(([key, value], index) => {
                    return {
                        repeatCell: {
                            range: {
                                sheetId: response.sheetId,
                                startRowIndex: 4 + index,
                                endRowIndex: 5 + index,
                                startColumnIndex: 2,
                                endColumnIndex: 4,
                            },
                            cell: {
                                userEnteredValue: {
                                    stringValue: key,
                                },
                            },
                            fields: "userEnteredValue",
                        },
                    };
                });

                // Insert values from the data dictionary
                Object.values(sheetData).forEach(
                    (value, index) => {
                        requests.push({
                            repeatCell: {
                                range: {
                                    sheetId:
                                        response.sheetId,
                                    startRowIndex:
                                        4 + index,
                                    endRowIndex: 5 + index,
                                    startColumnIndex: 3,
                                    endColumnIndex: 4,
                                },
                                cell: {
                                    userEnteredValue: {
                                        stringValue: value,
                                    },
                                },
                                fields: "userEnteredValue",
                            },
                        });
                    }
                );

                // Batch update for category data
                const batchUpdateRequest = {
                    spreadsheetId,
                    resource: {
                        requests,
                    },
                };

                await this.sheets.spreadsheets.batchUpdate(
                    batchUpdateRequest
                );
            }

            return "Category sheets created and data inserted successfully.";
        } catch (error) {
            throw new Error(
                `Error creating category sheets and writing data: ${error.message}`
            );
        }
    }
}

export default GoogleSheetsManager;
