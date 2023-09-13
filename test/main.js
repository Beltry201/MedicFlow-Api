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

        const spreadsheet = await manager.createSpreadsheet("Paciente 1", "1Vla2U3kfs834GEbFKSRZB1mYBcYq8uxp")
        console.log("\n-- SPREADSHEET ID: ", spreadsheet);

        const consult = await manager.createTemplate(spreadsheet)
        console.log("\n-- CONSULT: ", consult);

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
