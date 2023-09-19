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
                HiperTension: "Hipertension por colesterol alto",
            },
            APNP: {
                Tabaquismo: "Fuma",
            },
        };

        const consult_json = {
            INF: {
                Nombre: "David",
                "Fecha de nacimiento": "10-02-2003",
                "Estado Civil": "Soltero",
                Ocupación: "Estudiante en maestría",
                Escolaridad: "Maestría",
                Religión: "",
                "Lugar de Origen": "México",
                "Lugar de Residencia": "Colombia",
                Telefono: "8128865799",
            },
            AHF: {
                Madre: "Problemas de vesícula",
            },
            APNP: {},
            APP: {},
            SOAP: {
                Subjetivo:
                    "Juan Pérez presenta dolor abdominal que se intensifica después de las comidas, se extiende hacia su espalda, acompañado de náuseas y pérdida de apetito.",
                Objetivo:
                    "Durante el examen físico, se detecta sensibilidad leve en el hipocondrio derecho, pero el resto de los hallazgos se mantienen dentro de los parámetros normales.",
                Análisis:
                    "Juan Pérez, de 35 años, estudiante en maestría, de México, soltero, acude a la consulta con quejas de dolor abdominal que ha experimentado durante las últimas dos semanas. Afirma que el dolor tiende a intensificarse después de las comidas y se extiende hacia su espalda. Acompañando a este malestar, Juan menciona náuseas y una pérdida de apetito reciente.",
                Plan: "Se solicitan análisis de sangre que incluyen un hemograma y perfiles hepáticos y pancreáticos. Además, se programa una ecografía abdominal. Los resultados indican la presencia de cálculos en la vesícula biliar, sugiriendo una colelitiasis. El tratamiento inicial consiste en una dieta baja en grasas y distribuida en varias comidas al día. Se recetan analgésicos para el control del dolor en caso necesario. Se instruye al paciente a monitorear sus síntomas y a acudir inmediatamente si se presentan fiebre o signos de emergencia. Se fija una próxima cita para el 20 de septiembre de 2023, donde se revisarán los resultados de los estudios y se evaluará la necesidad de intervención quirúrgica en caso de persistir los síntomas.",
            },
        };
        const inf = await manager.create_inf_sheet(spreadsheet, patient);
        console.log("\n-- INF: ", inf);

        const backgrounds = await manager.create_category_sheets(
            spreadsheet,
            background
        );
        console.log("\n-- BACKGROUND SHEET: ", backgrounds);

        const soap_sheet = await manager.create_soap_sheet(
            spreadsheet,
            consult_json.SOAP
        );
        console.log("\n-- SOAP SHEET: ", soap_sheet);

        const complete_sheet = await manager.create_complete_consult_sheet(
            spreadsheet,
            consult_json
        );

        console.log("\n-- COMPLETE SHEET: ", complete_sheet);
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
