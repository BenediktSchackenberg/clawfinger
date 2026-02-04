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

const imagePath = process.argv[2];
const description = process.argv[3];
const tags = process.argv[4];

async function saveImage() {
    if (!imagePath || !fs.existsSync(imagePath)) {
        console.error("Image file not found!");
        process.exit(1);
    }

    try {
        const pool = await sql.connect(config);

        // 1. Create Table if not exists
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='ImageGallery' AND xtype='U')
            CREATE TABLE ImageGallery (
                ImageID INT IDENTITY(1,1) PRIMARY KEY,
                Filename NVARCHAR(255),
                ImageData VARBINARY(MAX),
                UploadDate DATETIME DEFAULT GETDATE(),
                Description NVARCHAR(500),
                Tags NVARCHAR(500)
            )
        `);

        // 2. Read image as binary
        const imageBuffer = fs.readFileSync(imagePath);
        const filename = path.basename(imagePath);

        // 3. Insert into DB
        await pool.request()
            .input('filename', sql.NVarChar, filename)
            .input('data', sql.VarBinary, imageBuffer)
            .input('desc', sql.NVarChar, description || '')
            .input('tags', sql.NVarChar, tags || '')
            .query(`
                INSERT INTO ImageGallery (Filename, ImageData, Description, Tags)
                VALUES (@filename, @data, @desc, @tags)
            `);

        console.log(`✅ Image saved: ${filename} (${imageBuffer.length} bytes)`);
        await pool.close();

    } catch (err) {
        console.error('❌ Error saving image:', err.message);
    }
}

saveImage();
