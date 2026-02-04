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
    database: 'AdventureWorks',
    options: {
        ...appConfig.sql.options,
        requestTimeout: 60000
    },
    pool: {
        max: 20,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

const queries = [
    "SELECT * FROM Sales.SalesOrderDetail WHERE CarrierTrackingNumber LIKE '%4E%'",
    "SELECT ProductID, SUM(LineTotal) FROM Sales.SalesOrderDetail GROUP BY ProductID ORDER BY SUM(LineTotal) DESC",
    "SELECT TOP 1000 * FROM Sales.SalesOrderHeader h JOIN Sales.SalesOrderDetail d ON h.SalesOrderID = d.SalesOrderID JOIN Production.Product p ON d.ProductID = p.ProductID",
    "WAITFOR DELAY '00:00:00.200'",
    "SELECT COUNT(*) FROM Person.Person WHERE LastName LIKE '%a%' AND FirstName LIKE '%b%'"
];

const DURATION_SECONDS = 60;
const WORKERS = 10;

async function worker(id) {
    const pool = await sql.connect(config);
    const start = Date.now();
    let count = 0;
    while ((Date.now() - start) < DURATION_SECONDS * 1000) {
        const q = queries[Math.floor(Math.random() * queries.length)];
        try {
            await pool.request().query(q);
            count++;
        } catch (err) {
            console.error(`Worker ${id} error:`, err.message);
        }
    }
    await pool.close();
    return count;
}

async function run() {
    console.log(`Starting ${WORKERS} workers for ${DURATION_SECONDS}s...`);
    const start = Date.now();
    const results = await Promise.all(Array.from({ length: WORKERS }, (_, i) => worker(i + 1)));
    const elapsed = (Date.now() - start) / 1000;
    const total = results.reduce((a, b) => a + b, 0);
    console.log(`Completed: ${total} queries in ${elapsed.toFixed(1)}s (${(total / elapsed).toFixed(1)} qps)`);
}

run();
