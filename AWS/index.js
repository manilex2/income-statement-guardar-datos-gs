require('dotenv').config();
const mysql = require('mysql2');
const { database } = require('./keys');
const { google } = require('googleapis');
const auth = new google.auth.GoogleAuth({
    keyFile: 'credentials.json',
    scopes: 'https://www.googleapis.com/auth/spreadsheets'
});
const spreadsheetId = process.env.SPREADSHEET_ID;

exports.handler = async function (event) {
    const promise = new Promise(async function() {
        const conexion = mysql.createConnection({
            host: database.host,
            user: database.user,
            password: database.password,
            port: database.port,
            database: database.database
        });
        const client = await auth.getClient();
        const googleSheet = google.sheets({ version: 'v4', auth: client });
        try {
            var sql = `SELECT date,
            symbol,
            reportedCurrency, 
            cik,
            fillingDate,
            acceptedDate,
            calendarYear,
            period,
            revenue,
            costOfRevenue,
            grossProfit,
            grossProfitRatio,
            researchAndDevelopmentExpenses,
            generalAndAdministrativeExpenses,
            sellingAndMarketingExpenses,
            sellingGeneralAndAdministrativeExpenses,
            otherExpenses,
            operatingExpenses,
            costAndExpenses,
            interestIncome,
            interestExpense,
            depreciationAndAmortization,
            ebitda,
            ebitdaratio,
            operatingIncome,
            operatingIncomeRatio,
            totalOtherIncomeExpensesNet,
            incomeBeforeTax,
            incomeBeforeTaxRatio,
            incomeTaxExpense,
            netIncome,
            netIncomeRatio,
            eps,
            epsdiluted,
            weightedAverageShsOut,
            weightedAverageShsOutDil,
            link,
            finalLink FROM ${process.env.TABLE_INCOME_STATEMENT}`;
            conexion.query(sql, function (err, resultado) {
                if (err) throw err;
                JSON.stringify(resultado);
                trasladarIncomeStatement(resultado);
            });
        } catch (error) {
            console.error(error);
        }
        async function trasladarIncomeStatement(resultado){
            try {
                await googleSheet.spreadsheets.values.clear({
                    auth,
                    spreadsheetId,
                    range: `${process.env.ID_HOJA_RANGO}`
                })
                var datos = [];
                for (let i = 0; i < resultado.length; i++) {
                    datos.push([
                        resultado[i].date,
                        resultado[i].symbol,
                        resultado[i].reportedCurrency,
                        resultado[i].cik,
                        resultado[i].fillingDate,
                        resultado[i].acceptedDate,
                        resultado[i].calendarYear,
                        resultado[i].period,
                        resultado[i].revenue,
                        resultado[i].costOfRevenue,
                        resultado[i].grossProfit,
                        resultado[i].grossProfitRatio,
                        resultado[i].researchAndDevelopmentExpenses,
                        resultado[i].generalAndAdministrativeExpenses,
                        resultado[i].sellingAndMarketingExpenses,
                        resultado[i].sellingGeneralAndAdministrativeExpenses,
                        resultado[i].otherExpenses,
                        resultado[i].operatingExpenses,
                        resultado[i].costAndExpenses,
                        resultado[i].interestIncome,
                        resultado[i].interestExpense,
                        resultado[i].depreciationAndAmortization,
                        resultado[i].ebitda,
                        resultado[i].ebitdaratio,
                        resultado[i].operatingIncome,
                        resultado[i].operatingIncomeRatio,
                        resultado[i].totalOtherIncomeExpensesNet,
                        resultado[i].incomeBeforeTax,
                        resultado[i].incomeBeforeTaxRatio,
                        resultado[i].incomeTaxExpense,
                        resultado[i].netIncome,
                        resultado[i].netIncomeRatio,
                        resultado[i].eps,
                        resultado[i].epsdiluted,
                        resultado[i].weightedAverageShsOut,
                        resultado[i].weightedAverageShsOutDil,
                        resultado[i].link,
                        resultado[i].finalLink
                    ]);
                }
                await googleSheet.spreadsheets.values.append({
                    auth,
                    spreadsheetId,
                    range: `${process.env.ID_HOJA_RANGO}`,
                    valueInputOption: "USER_ENTERED",
                    requestBody: {
                        "range": `${process.env.ID_HOJA_RANGO}`,
                        "values": datos
                    }
                });
                console.log('Datos agregados correctamente.');
            } catch (error) {
                console.error(error);
            }
            await finalizarEjecucion();
        };
        async function finalizarEjecucion() {
            conexion.end()
        }
    });
    return promise;
};