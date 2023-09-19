import fs from "fs/promises";
import path from "path";
import { authenticate } from "@google-cloud/local-auth";
import { google } from "googleapis";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

// Get the current module's file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TOKEN_PATH = path.join(__dirname, "..", "credentials", "token.json");
const CREDENTIALS_PATH = path.join(
    __dirname,
    "..",
    "credentials",
    "credentials.json"
);
const SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive",
];
const PARENT_FOLDER_ID = execSync("source ~/.zshrc && echo $PARENT_FOLDER_ID", {
    encoding: "utf-8",
}).trim();

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
            console.log(`Error while loading credentials: ${err.message}`);
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
        let client = await this.loadSavedCredentialsIfExist();
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
            throw new Error("Authentication failed. Client is null.");
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
            mimeType: "application/vnd.google-apps.spreadsheet",
            parents: [folderId],
        };

        try {
            const response = await this.drive.files.create({
                resource: fileMetadata,
                fields: "id",
            });
            return response.data.id;
        } catch (error) {
            throw new Error(`Error creating spreadsheet: ${error.message}`);
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
                newName: "Historia Clinica (Version Completa)",
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

            await this.sheets.spreadsheets.batchUpdate(deleteRequest);

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

    async duplicateSheet(spreadsheetId, sheetId, destinationSpreadsheetId) {
        const request = {
            spreadsheetId,
            sheetId,
            requestBody: {
                destinationSpreadsheetId,
            },
        };

        try {
            const response = await this.sheets.spreadsheets.sheets.copyTo(
                request
            );
            return response.data;
        } catch (error) {
            throw new Error(`Error duplicating sheet: ${error.message}`);
        }
    }

    async renameSheet(spreadsheetId, sheetId, title) {
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
            const response = await this.sheets.spreadsheets.batchUpdate(
                request
            );
            return response.data;
        } catch (error) {
            throw new Error(`Error renaming sheet: ${error.message}`);
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

    async sharePermission(fileId, type, role, emailAddress, domain = null) {
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
            const response = await this.drive.permissions.create(request);
            return response.data.id;
        } catch (error) {
            throw new Error(`Error sharing permission: ${error.message}`);
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

            await this.renameSheet(spreadsheetId, response.sheetId, "INF");

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
                phone_number: {
                    range: "D10",
                    value: patientData.phone_number,
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
                                startRowIndex: Number(range.match(/\d+/g)) - 1,
                                endRowIndex: Number(range.match(/\d+/g)),
                                startColumnIndex: range.charCodeAt(0) - 65,
                                endColumnIndex: range.charCodeAt(0) - 64,
                            },
                            cell: {
                                userEnteredValue: {
                                    stringValue: formattedValue,
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

            await this.sheets.spreadsheets.batchUpdate(deleteRequest);

            const batchUpdateRequest = {
                spreadsheetId,
                resource: {
                    requests,
                },
            };

            const updateResponse = await this.sheets.spreadsheets.batchUpdate(
                batchUpdateRequest
            );

            return updateResponse.data;
        } catch (error) {
            throw new Error(
                `Error creating INF sheet and writing data: ${error.message}`
            );
        }
    }

    async create_category_sheets(spreadsheetId, backgrounds) {
        try {
            for (const [category, data] of Object.entries(backgrounds)) {
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

                const requests = Object.entries(sheetData).map(
                    ([key, value], index) => {
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
                    }
                );

                // Insert values from the data dictionary
                Object.values(sheetData).forEach((value, index) => {
                    requests.push({
                        repeatCell: {
                            range: {
                                sheetId: response.sheetId,
                                startRowIndex: 4 + index,
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
                });

                // Batch update for category data
                const batchUpdateRequest = {
                    spreadsheetId,
                    resource: {
                        requests,
                    },
                };

                await this.sheets.spreadsheets.batchUpdate(batchUpdateRequest);
            }

            return "Category sheets created and data inserted successfully.";
        } catch (error) {
            throw new Error(
                `Error creating category sheets and writing data: ${error.message}`
            );
        }
    }

    async create_soap_sheet(spreadsheetId, soapData) {
        console.log("\n-- SOAP DETECTED: ", soapData);
        try {
            const sourceSpreadsheetId =
                "15peTabdkOlmvxNQSctq64tvshnL1WfiUtM7NThVsGiw";
            const response = await this.duplicateSheet(
                sourceSpreadsheetId,
                "452059617", // Notas Evolutivas sheet ID
                spreadsheetId
            );

            console.log(soapData.Subjetivo);

            await this.renameSheet(
                spreadsheetId,
                response.sheetId,
                "Notas Evolutivas"
            );

            const data = {
                Subjetivo: {
                    range: "D4",
                    value: soapData.Subjetivo,
                },
                Objetivo: {
                    range: "D6",
                    value: soapData.Objetivo,
                },
                Análisis: {
                    range: "D8",
                    value: soapData.Análisis,
                },
                Plan: {
                    range: "D10",
                    value: soapData.Plan,
                },
            };

            const requests = Object.entries(data).map(
                ([key, { range, value }], index) => {
                    return {
                        repeatCell: {
                            range: {
                                sheetId: response.sheetId,
                                startRowIndex: Number(range.match(/\d+/g)) - 1,

                                endRowIndex: Number(range.match(/\d+/g)),
                                startColumnIndex: 3, // Column D
                                endColumnIndex: 4, // Column D
                            },
                            cell: {
                                userEnteredValue: {
                                    stringValue: value,
                                },
                            },
                            fields: "userEnteredValue",
                        },
                    };
                }
            );

            const batchUpdateRequest = {
                spreadsheetId,
                resource: { requests },
            };

            await this.sheets.spreadsheets.batchUpdate(batchUpdateRequest);

            return "Notas Evolutivas sheet created and data inserted successfully.";
        } catch (error) {
            throw new Error(
                `Error creating Notas Evolutivas sheet and writing data: ${error.message}`
            );
        }
    }

    async create_complete_consult_sheet(spreadsheetId, consult_json) {
        try {
            const sourceSpreadsheetId =
                "15peTabdkOlmvxNQSctq64tvshnL1WfiUtM7NThVsGiw"; // Replace with the actual source spreadsheet ID

            // Step 1: Copy the sheet from "Historia Clinica (Version Completa)"
            const response = await this.duplicateSheet(
                sourceSpreadsheetId,
                "621449929", // Sheet ID for "Historia Clinica (Version Completa)"
                spreadsheetId
            );

            // Step 2: Rename the sheet
            await this.renameSheet(
                spreadsheetId,
                response.sheetId,
                "Historia Clinica (Version Completa)"
            );

            // Define the patient data and formatting logic
            const data = {
                INF: {
                    range: "D4",
                    value: consult_json.INF,
                },
                AHF: {
                    range: "C13",
                    value: consult_json.AHF,
                },
                APNP: {
                    range: "C20",
                    value: consult_json.APNP,
                },
                APP: {
                    range: "C28",
                    value: consult_json.APP,
                },
                SOAP: {
                    range: "D36",
                    value: consult_json.SOAP
                }
            };

            const infData = {
                Nombre: {
                    range: "D4",
                    value: consult_json.INF.Nombre,
                },
                "Fecha de nacimiento": {
                    range: "D5",
                    value: consult_json.INF["Fecha de nacimiento"],
                },
                Sexo: {
                    range: "F5",
                    value: consult_json.INF.Sexo,
                },
                "Estado Civil": {
                    range: "D6",
                    value: consult_json.INF["Estado Civil"],
                },
                Ocupación: {
                    range: "F6",
                    value: consult_json.INF.Ocupación,
                },
                Escolaridad: {
                    range: "D7",
                    value: consult_json.INF.Escolaridad,
                },
                Religión: {
                    range: "F7",
                    value: consult_json.INF.Religión,
                },
                "Lugar de Origen": {
                    range: "D8",
                    value: consult_json.INF["Lugar de Origen"],
                },
                "Lugar de Residencia": {
                    range: "D9",
                    value: consult_json.INF["Lugar de Residencia"],
                },
                Telefono: {
                    range: "D10",
                    value: consult_json.INF.Telefono,
                },
            };

            const requests = [];
            // const rangesToDelete = [];

            Object.entries(data).map(([key, { range, value }]) => {
                console.log("\n-- CURRENT KEY: ", key);
                if (key === "INF") {
                    // Add logic to handle INF data
                    Object.entries(infData).forEach(
                        ([infoKey, infoValue], index) => {
                            requests.push({
                                repeatCell: {
                                    range: {
                                        sheetId: response.sheetId,
                                        startRowIndex:
                                            Number(
                                                infoValue.range.match(/\d+/g)
                                            ) - 1,
                                        endRowIndex: Number(
                                            infoValue.range.match(/\d+/g)
                                        ),
                                        startColumnIndex:
                                            infoValue.range.charCodeAt(0) - 65,
                                        endColumnIndex:
                                            infoValue.range.charCodeAt(0) - 64,
                                    },
                                    cell: {
                                        userEnteredValue: {
                                            stringValue: infoValue.value,
                                        },
                                    },
                                    fields: "userEnteredValue",
                                },
                            });
                        }
                    );
                } else if (
                    (key === "AHF" || key === "APNP" || key === "APP") &&
                    value &&
                    Object.keys(value).length > 0
                ) {
                    console.log("\n-- KEY: ", key);
                    console.log("\n-- KEY_RANGE: ", range);

                    // Insert the key (category) in column C and value in column D
                    Object.entries(value).forEach(
                        ([category, categoryValue], index) => {
                            console.log("\n-- CATEGORY: ", category);
                            console.log("\n-- CAT_VALUE: ", categoryValue);
                            console.log("\n-- CAT_RANGE: ", range);
                            console.log("\n-- INDEX_TEST: ", index);
                            requests.push(
                                {
                                    repeatCell: {
                                        range: {
                                            sheetId: response.sheetId,
                                            startRowIndex:
                                                Number(range.match(/\d+/g)) - 1 + index,
                                            endRowIndex: Number(
                                                range.match(/\d+/g)
                                            ) + index,
                                            startColumnIndex: 2, // Column C
                                            endColumnIndex: 3, // Column D
                                        },
                                        cell: {
                                            userEnteredValue: {
                                                stringValue: category,
                                            },
                                        },
                                        fields: "userEnteredValue",
                                    },
                                },
                                {
                                    repeatCell: {
                                        range: {
                                            sheetId: response.sheetId,
                                            startRowIndex:
                                                Number(range.match(/\d+/g)) - 1 + index,
                                            endRowIndex: Number(
                                                range.match(/\d+/g)
                                            ) + index,
                                            startColumnIndex: 3, // Column D
                                            endColumnIndex: 4, // Column E
                                        },
                                        cell: {
                                            userEnteredValue: {
                                                stringValue: categoryValue,
                                            },
                                        },
                                        fields: "userEnteredValue",
                                    },
                                }
                            );
                        }
                    );

                    // else {
                    //     rangesToDelete.push({
                    //         startRow: startRow,
                    //         endRow: endRow,
                    //     });
                    // }
                } else if (key === "SOAP") {
                    console.log("\n-- TAMO EN EL SOAP: ", key);
                    console.log("\n-- KEY_RANGE: ", range);

                    // Insert the key (category) in column C and value in column D
                    Object.entries(value).forEach(
                        ([category, categoryValue], index) => {
                            console.log("\n-- CATEGORY: ", category);
                            console.log("\n-- CAT_VALUE: ", categoryValue);
                            console.log("\n-- INDEX_TEST: ", index);
                            console.log("\n-- CAT_RANGE: ", Number(range.match(/\d+/g)) - 1 + index,);
                            requests.push(
                                {
                                    repeatCell: {
                                        range: {
                                            sheetId: response.sheetId,
                                            startRowIndex:
                                                Number(range.match(/\d+/g)) - 1 + index*2,
                                            endRowIndex: Number(
                                                range.match(/\d+/g)
                                            ) + index*2,
                                            startColumnIndex: 3, // Column D
                                            endColumnIndex: 4, // Column E
                                        },
                                        cell: {
                                            userEnteredValue: {
                                                stringValue: categoryValue,
                                            },
                                        },
                                        fields: "userEnteredValue",
                                    },
                                }
                            );
                        }
                    );
                }
                // else {
                //     // Add logic for other categories here if needed
                // }
            });

            // rangesToDelete.forEach((range) => {
            //     requests.push({
            //         deleteRange: {
            //             range: {
            //                 sheetId: response.sheetId,
            //                 startRowIndex: range.startRow,
            //                 endRowIndex: range.endRow,
            //                 startColumnIndex: 0,
            //                 endColumnIndex: 50,
            //             },
            //             shiftDimension: "ROWS",
            //         },
            //     });
            // });

            // console.log("\n-- REQUESTS TO DELETE: ", JSON.stringify(requests));

            const batchUpdateRequest = {
                spreadsheetId,
                resource: {
                    requests,
                },
            };

            const updateResponse = await this.sheets.spreadsheets.batchUpdate(
                batchUpdateRequest
            );

            return updateResponse.data;
        } catch (error) {
            throw new Error(
                `Error creating complete consult sheet and writing data: ${error.message}`
            );
        }
    }
}

export default GoogleSheetsManager;
