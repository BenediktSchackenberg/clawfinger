const sql = require('mssql');

const args = process.argv.slice(2);
const type = args[0] || 'Unknown';
const summary = args[1] || 'No summary';
const details = args[2] || '';

const config = {
    user: 'sa',
    password: '05Mainz05',
    server: 'localhost',
    database: 'AgentLogs',
    options: {
        encrypt: true,
        trustServerCertificate: true
    }
};

async function log() {
    try {
        let pool = await sql.connect(config);
        await pool.request()
            .input('type', sql.NVarChar, type)
            .input('summary', sql.NVarChar, summary)
            .input('details', sql.NVarChar, details)
            .query("INSERT INTO ActivityLog (ActionType, Summary, Details) VALUES (@type, @summary, @details)");
        
        console.log("Logged:", summary);
        process.exit(0);
    } catch (err) {
        console.error("Log Error:", err);
        process.exit(1);
    }
}

log();
