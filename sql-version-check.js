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
const config = appConfig.sql;

// Vollständige Build-Datenbank von https://sqlserverbuilds.blogspot.com/ (Stand: 2026-02-04)
const buildDatabase = {
    '17.0': {
        name: 'SQL Server 2025',
        rtm: '17.0.1000.7',
        builds: [
            { version: '17.0.4006.2', name: 'CU1', date: '2026-01-29', latest: true },
            { version: '17.0.1050.2', name: 'GDR Security', date: '2026-01-13' },
            { version: '17.0.1000.7', name: 'RTM', date: '2025-11-18' }
        ]
    },
    '16.0': {
        name: 'SQL Server 2022',
        rtm: '16.0.1000.6',
        builds: [
            { version: '16.0.4236.2', name: 'CU23', date: '2026-01-29', latest: true },
            { version: '16.0.4230.2', name: 'CU22 Security', date: '2026-01-13' },
            { version: '16.0.4225.2', name: 'CU22', date: '2025-11-13' },
            { version: '16.0.4215.2', name: 'CU21', date: '2025-09-11' },
            { version: '16.0.4205.1', name: 'CU20', date: '2025-07-10' },
            { version: '16.0.4195.2', name: 'CU19', date: '2025-05-15' },
            { version: '16.0.4185.3', name: 'CU18', date: '2025-03-13' },
            { version: '16.0.4175.1', name: 'CU17', date: '2025-01-16' },
            { version: '16.0.4165.4', name: 'CU16', date: '2024-11-14' },
            { version: '16.0.4145.4', name: 'CU15', date: '2024-09-25' },
            { version: '16.0.4135.4', name: 'CU14', date: '2024-07-23' },
            { version: '16.0.4125.3', name: 'CU13', date: '2024-05-16' },
            { version: '16.0.4115.5', name: 'CU12', date: '2024-03-14' },
            { version: '16.0.4105.2', name: 'CU11', date: '2024-01-11' },
            { version: '16.0.4095.4', name: 'CU10', date: '2023-11-16' },
            { version: '16.0.4085.2', name: 'CU9', date: '2023-10-12' },
            { version: '16.0.4075.1', name: 'CU8', date: '2023-09-14' },
            { version: '16.0.4065.3', name: 'CU7', date: '2023-08-10' },
            { version: '16.0.4055.4', name: 'CU6', date: '2023-07-13' },
            { version: '16.0.4045.3', name: 'CU5', date: '2023-06-15' },
            { version: '16.0.4035.4', name: 'CU4', date: '2023-05-11' },
            { version: '16.0.4025.1', name: 'CU3', date: '2023-04-13' },
            { version: '16.0.4015.1', name: 'CU2', date: '2023-03-15' },
            { version: '16.0.4003.1', name: 'CU1', date: '2023-02-16' },
            { version: '16.0.1000.6', name: 'RTM', date: '2022-11-16' }
        ]
    },
    '15.0': {
        name: 'SQL Server 2019',
        rtm: '15.0.2000.5',
        builds: [
            { version: '15.0.4430.1', name: 'CU32', date: '2025-02-27', latest: true },
            { version: '15.0.4420.2', name: 'CU31', date: '2025-02-13' },
            { version: '15.0.4415.2', name: 'CU30', date: '2024-12-12' },
            { version: '15.0.4405.4', name: 'CU29', date: '2024-10-31' },
            { version: '15.0.4385.2', name: 'CU28', date: '2024-08-01' },
            { version: '15.0.4375.4', name: 'CU27', date: '2024-06-13' },
            { version: '15.0.4365.2', name: 'CU26', date: '2024-04-11' },
            { version: '15.0.4355.3', name: 'CU25', date: '2024-02-15' },
            { version: '15.0.4345.5', name: 'CU24', date: '2023-12-14' },
            { version: '15.0.4335.1', name: 'CU23', date: '2023-10-12' },
            { version: '15.0.4322.2', name: 'CU22', date: '2023-08-14' },
            { version: '15.0.4316.3', name: 'CU21', date: '2023-06-15' },
            { version: '15.0.4312.2', name: 'CU20', date: '2023-04-13' },
            { version: '15.0.4298.1', name: 'CU19', date: '2023-02-16' },
            { version: '15.0.4261.1', name: 'CU18', date: '2022-09-28' },
            { version: '15.0.4249.2', name: 'CU17', date: '2022-08-11' },
            { version: '15.0.4223.1', name: 'CU16', date: '2022-04-18' },
            { version: '15.0.2000.5', name: 'RTM', date: '2019-11-04' }
        ]
    },
    '14.0': {
        name: 'SQL Server 2017',
        rtm: '14.0.1000.169',
        builds: [
            { version: '14.0.3456.2', name: 'CU31', date: '2022-09-20', latest: true },
            { version: '14.0.3451.2', name: 'CU30', date: '2022-07-13' },
            { version: '14.0.3436.1', name: 'CU29', date: '2022-03-30' },
            { version: '14.0.3430.2', name: 'CU28', date: '2022-01-13' },
            { version: '14.0.1000.169', name: 'RTM', date: '2017-10-02' }
        ]
    },
    '13.0': {
        name: 'SQL Server 2016',
        rtm: '13.0.1601.5',
        builds: [
            { version: '13.0.6300.2', name: 'SP3', date: 'out-of-support', latest: true },
            { version: '13.0.5026.0', name: 'SP2 + CU17', date: 'out-of-support' },
            { version: '13.0.4001.0', name: 'SP1 + CU15', date: 'out-of-support' },
            { version: '13.0.1601.5', name: 'RTM', date: '2016-06-01' }
        ]
    },
    '12.0': {
        name: 'SQL Server 2014',
        rtm: '12.0.2000.8',
        builds: [
            { version: '12.0.6024.0', name: 'SP3 + CU4', date: 'out-of-support', latest: true },
            { version: '12.0.5000.0', name: 'SP2 + CU18', date: 'out-of-support' },
            { version: '12.0.2000.8', name: 'RTM', date: '2014-04-01' }
        ]
    }
};

function parseVersion(v) {
    return v.split('.').map(n => parseInt(n, 10));
}

function compareVersions(a, b) {
    const partsA = parseVersion(a);
    const partsB = parseVersion(b);
    for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
        const numA = partsA[i] || 0;
        const numB = partsB[i] || 0;
        if (numA > numB) return 1;
        if (numA < numB) return -1;
    }
    return 0;
}

async function checkVersion() {
    try {
        await sql.connect(config);
        const result = await sql.query`SELECT SERVERPROPERTY('ProductVersion') AS version, SERVERPROPERTY('ProductLevel') AS level, @@VERSION as fullText`;
        const currentVersion = result.recordset[0].version;
        const currentLevel = result.recordset[0].level;
        const fullText = result.recordset[0].fullText;
        
        console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        console.log(`   SQL Server Versions-Check`);
        console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
        console.log(`Installierte Version: ${currentVersion} (${currentLevel})`);
        console.log(`\nFull Info:\n${fullText.substring(0, 150)}...\n`);
        
        const majorBase = currentVersion.split('.').slice(0, 2).join('.');
        const buildInfo = buildDatabase[majorBase];
        
        if (!buildInfo) {
            console.log(`❌ Major-Version ${majorBase} ist nicht in der Datenbank hinterlegt.`);
            await sql.close();
            return;
        }
        
        console.log(`Produkt: ${buildInfo.name}`);
        
        const latestBuild = buildInfo.builds.find(b => b.latest);
        if (!latestBuild) {
            console.log(`⚠️ Kein Latest-Build definiert für ${buildInfo.name}`);
            await sql.close();
            return;
        }
        
        console.log(`Aktuellster Build: ${latestBuild.version} (${latestBuild.name}, ${latestBuild.date})`);
        
        const comp = compareVersions(currentVersion, latestBuild.version);
        
        if (comp === 0) {
            console.log(`\n✅ Du bist auf dem absolut neuesten Stand!`);
            console.log(`   ${buildInfo.name} ${latestBuild.name} ist aktuell installiert.\n`);
        } else if (comp > 0) {
            console.log(`\n🚀 Du hast eine NEUERE Version als der offizielle Latest-Build!`);
            console.log(`   (Möglicherweise ein Preview oder Hot-Fix)\n`);
        } else {
            console.log(`\n⚠️  Ein Update ist verfügbar!`);
            console.log(`   Empfehlung: Update auf ${latestBuild.name} durchführen.`);
            console.log(`   Download/Info: https://sqlserverbuilds.blogspot.com/\n`);
            
            // Zeige die Updates zwischen aktueller und neuester Version
            console.log(`Deine Version vs. Latest:`);
            const currentIndex = buildInfo.builds.findIndex(b => compareVersions(b.version, currentVersion) <= 0);
            const latestIndex = buildInfo.builds.findIndex(b => b.latest);
            
            if (currentIndex !== -1 && latestIndex !== -1 && currentIndex > latestIndex) {
                console.log(`Du hast ${currentIndex - latestIndex} Update(s) verpasst:\n`);
                for (let i = latestIndex; i >= currentIndex; i--) {
                    const build = buildInfo.builds[i];
                    const isCurrent = compareVersions(build.version, currentVersion) === 0;
                    console.log(`  ${isCurrent ? '→' : ' '} ${build.version.padEnd(14)} ${build.name.padEnd(20)} (${build.date})`);
                }
            }
        }
        
        console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
        
    } catch (err) {
        console.error('\n❌ Fehler beim Verbinden oder Abfragen:', err.message);
    } finally {
        await sql.close();
    }
}

checkVersion();
