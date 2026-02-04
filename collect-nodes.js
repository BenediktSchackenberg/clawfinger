const { execSync } = require('child_process');
const sql = require('mssql');
const fs = require('fs');
const path = require('path');

// Load config from config.json
const configPath = path.join(__dirname, 'config.json');
if (!fs.existsSync(configPath)) {
    console.error('❌ config.json not found! Copy config.example.json to config.json and set your credentials.');
    process.exit(1);
}
const appConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const config = {
    ...appConfig.sql,
    database: 'AgentLogs'
};

async function syncNodes() {
    try {
        // 1. Get Node Status from OpenClaw
        console.log("Fetching OpenClaw Nodes...");
        // Wir rufen openclaw nodes status als JSON ab. 
        // Da die CLI Tool Output nicht direkt JSON ist, simulieren wir den Aufruf
        // oder nutzen die API, wenn verfügbar. 
        // Hier parsen wir den Output des CLI Befehls "openclaw nodes status"
        // Aber Achtung: Das CLI gibt oft menschenlesbaren Text aus. 
        
        // Besser: Wir nutzen das "nodes" Tool direkt im Agent Context, aber das ist JS.
        // Hier im Skript rufen wir 'openclaw nodes status' auf und hoffen auf JSON.
        // Falls nicht, hardcoden wir erst mal einen Test, um zu sehen ob DB Connect klappt.
        
        // Da ich im Agent-Context bin, habe ich Zugriff auf das Tool Ergebnis.
        // Ich übergebe die Nodes als Argument an dieses Skript!
        // Das macht es einfacher.
        
        const nodesJson = process.argv[2]; 
        if (!nodesJson) {
            console.error("No nodes JSON provided!");
            process.exit(1);
        }

        const nodesData = JSON.parse(nodesJson);
        const nodes = nodesData.nodes || [];

        console.log(`Found ${nodes.length} nodes. Connecting to DB...`);
        let pool = await sql.connect(config);

        for (const node of nodes) {
            console.log(`Syncing node: ${node.displayName} (${node.remoteIp})`);
            
            await pool.request()
                .input('id', sql.NVarChar, node.nodeId)
                .input('name', sql.NVarChar, node.displayName || 'Unknown')
                .input('platform', sql.NVarChar, node.platform || 'Unknown')
                .input('ip', sql.NVarChar, node.remoteIp || 'Offline')
                .input('status', sql.NVarChar, node.connected ? 'Online' : 'Offline')
                .input('specs', sql.NVarChar, JSON.stringify(node))
                .query(`
                    MERGE NodeInventory AS target
                    USING (SELECT @id AS NodeID) AS source
                    ON (target.NodeID = source.NodeID)
                    WHEN MATCHED THEN
                        UPDATE SET 
                            DisplayName = @name,
                            Platform = @platform,
                            RemoteIP = @ip,
                            Status = @status,
                            LastSeen = GETDATE(),
                            Specs = @specs
                    WHEN NOT MATCHED THEN
                        INSERT (NodeID, DisplayName, Platform, RemoteIP, Status, LastSeen, Specs)
                        VALUES (@id, @name, @platform, @ip, @status, GETDATE(), @specs);
                `);
        }

        console.log("Sync complete!");
        process.exit(0);

    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
}

syncNodes();
