const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');

async function readCSV(directory) {
    const readStream = fs.createReadStream(directory, { encoding: 'utf8'});
    try{
        let headers = [];
        let data = [];
        let buffer = '';
        for await (const chunk of readStream) {
            console.log('   loading chunck...');
            buffer += chunk;
            let rows = buffer.split('\r\n')
            buffer = rows.pop();
            
            if(!headers.length){
                headers = rows.shift().split(',');
                console.log('       setting up headers...');
            }

                for (const row of rows) {
                    const values = row.split(',');
                    if (values.length === headers.length) {
                        const object = Object.fromEntries(headers.map((h, i) => [h, values[i]]));
                        if (Object.values(object).some(val => val !== undefined)) {
                            data.push(object);
                        }
                    }
                }

            if (buffer) {
                const values = buffer.split(',');
                if (values.length === headers.length) {
                    const object = Object.fromEntries(headers.map((h,i) => [h, values[i]]));
                    if (Object.values(object).some(val => val !== undefined)) {
                        data.push(object);
                    }
                }
            }
        }      

        console.log('   Reading File Complete...')
        return {
            values: data,
            headers: headers
        }
    } catch (err) {
        console.error(`Error reading csv: ${err.message}`)
        return;
    }
}

async function writeCSV(directory, readFile, data) { 
    console.log('       writing file...')
    const { headers, values } = data;
    let fileName = readFile.includes('street') ? 'AllStreet.csv' : 'AllStopAndSearch.csv';
    const filePath = path.join(directory,fileName);
    try {

        const fileExists = await fsPromises.access(filePath, fs.constants.F_OK).then(() => true).catch(() => false);
        
        const writeStream = fs.createWriteStream(filePath, { flags: 'a'});
        writeStream.on('error', (error) => {
            console.log(`Error writing to file ${fileName}: ${error.message}`);
        })

        if (!fileExists){
            writeStream.write(`${headers.join(',')}\n`);
        }

        for (const value of values) {
            const valueString = headers.map((header) => value[header] || '').join(',');
            if (valueString.trim()) {
                writeStream.write(`${valueString}\n`);
                console.log('Writing to ')
            }   
        }

        await new Promise((resolve, reject) => {
            writeStream.end(err => {
                if (err) reject(err);
                else resolve();
            })
        })
        writeStream.end();
        console.log(`Finnished writing to ${fileName}`)
    } catch (error) {
            console.error(`Failed to write CSV file: ${error.message}`);
    } 
}

async function CSVConcat(directory) {
    try{
        const folders = await fsPromises.readdir(directory);
        for (const folder of folders) {
            const folderPath = path.join(directory, folder);
            const stat = await fsPromises.stat(folderPath);
            if (stat.isDirectory()){
                console.log(`Processing folder: ${folder}`);
                const files = await fsPromises.readdir(folderPath);
                for (const file of files) {
                    const filePath = path.join(folderPath, file);
                    if (path.extname(file).toLowerCase() === '.csv'){
                        console.log(`   Processing file: ${file}`);
                        const data = await readCSV(filePath);
                        if (data) {
                            await writeCSV(directory, file, data);
                            console.log(`Processing ${file} complete...`);
                        }
                    }
                }
            }
        }
    } catch (error) {
        console.error(`Error processing directories: ${error.message}`)
    }    
}

const directoryPath =  path.join('A:', 'PI-56', '07_Topics', '22_Power BI', '07_Internal and External Incident', 'PoliceUKData','AllForces');

CSVConcat(directoryPath);
