import GoogleSheetsManager from "../helpers/sheets.js";

async function main() {
    const manager = new GoogleSheetsManager();
    await manager.authorize();

    const folderName = "Dr David Beltran";

    try {
        // const folderId = await manager.createFolder(
        //     folderName
        // );
        // console.log("\n-- DOCTORS FOLDER ID: ", folderId);

        // const permission = await manager.sharePermission(folderId, "user", "reader", "beltrangonzalezdavid@gmail.com")
        // console.log("\n-- PERMISSIONS: ", permission);

        const spreadsheet = await manager.createSpreadsheet(
            "Paciente 1",
            "1ja6J4sAFCpLOcSqYdIGY69ZmV5zWZjyV"
        );
        console.log("\n-- SPREADSHEET ID: ", spreadsheet);

        const patient = {
            name: "David",
            birth_date: "10-02-2003",
            sex: "male",
            civil_state: "single",
            occupation: "developer",
            scholarship: "minor",
            religion: "",
            origin: "Bogotá",
            phone_number: "8128865799",
        };

        const background = {
            AHF: {
                "Diabete mellitus": "Por parte de la madre",
            },
            APP: {
                "HiperTension": "Hipertension por colesterol alto"
            },
            APNP: {
                "Tabaquismo" : "Fuma"
            },
        };
        const inf = await manager.create_inf_sheet(
            spreadsheet,
            patient
        );
        console.log("\n-- INF: ", inf);

        const backgrounds = await manager.create_category_sheets(
            spreadsheet,
            background
        );
        console.log("\n-- BACKGROUND: ", backgrounds);

        // const consult = await manager.createTemplate(spreadsheet)
        // console.log("\n-- CONSULT: ", consult);

        // console.log(`Folder "${folderName}" created with ID: ${folderId}`);
        //     const folderName = 'My Parent Folder';
        //     const folderId = await manager.createFolder(manager.sheets.auth, folderName);
        //     console.log(`Folder "${folderName}" created with ID: ${folderId}`);

        //     const spreadsheetTitle = 'My Spreadsheet';
        //     const spreadsheetId = await manager.createSpreadsheetInFolder(folderId, spreadsheetTitle);
        //     console.log(`Spreadsheet "${spreadsheetTitle}" created inside folder with ID: ${folderId}`);

        //     const template = await manager.copyAndRenameSheets();
        //     console.log('Sheets copied and renamed successfully.');
        //     console.log('Created sheets:', template.createdSheets);

        console.log("Operations completed successfully.");
    } catch (error) {
        console.error(error.message);
    }
}

main();
