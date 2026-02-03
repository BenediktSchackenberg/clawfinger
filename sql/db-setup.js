const sql = require('mssql');

const config = {
    user: 'sa',
    password: '05Mainz05',
    server: 'localhost',
    database: 'master',
    options: {
        encrypt: true,
        trustServerCertificate: true
    }
};

async function setup() {
    try {
        let pool = await sql.connect(config);
        
        // Check if DB exists
        let result = await pool.request().query("SELECT name FROM master.dbo.sysdatabases WHERE name = 'AgentLogs'");
        
        if (result.recordset.length === 0) {
            console.log("Creating Database AgentLogs...");
            await pool.request().query("CREATE DATABASE AgentLogs");
        } else {
            console.log("Database AgentLogs already exists.");
        }

        // Switch to AgentLogs and create Table
        await pool.close();
        config.database = 'AgentLogs';
        pool = await sql.connect(config);

        console.log("Creating Table ActivityLog...");
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='ActivityLog' AND xtype='U')
            CREATE TABLE ActivityLog (
                LogID INT IDENTITY(1,1) PRIMARY KEY,
                Timestamp DATETIME DEFAULT GETDATE(),
                ActionType NVARCHAR(50),
                Summary NVARCHAR(255),
                Details NVARCHAR(MAX)
            )
        `);
        
        console.log("Setup complete!");
        process.exit(0);
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
}

setup();
