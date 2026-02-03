const sql = require('mssql');

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

async function setupInventory() {
    try {
        let pool = await sql.connect(config);
        
        console.log("Creating/Updating Table NodeInventory...");
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='NodeInventory' AND xtype='U')
            CREATE TABLE NodeInventory (
                NodeID NVARCHAR(100) PRIMARY KEY,
                DisplayName NVARCHAR(100),
                Platform NVARCHAR(50),
                RemoteIP NVARCHAR(50),
                Status NVARCHAR(20),
                LastSeen DATETIME DEFAULT GETDATE(),
                Specs NVARCHAR(MAX) -- Optional: Full specs as JSON
            )
        `);
        
        console.log("NodeInventory Table Ready!");
        process.exit(0);
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
}

setupInventory();
