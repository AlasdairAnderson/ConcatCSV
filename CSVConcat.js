const fs = require('fs');
const fsPromises = require('node:fs/promises');

const directoryPath = 'Exampledirectory';

async function readCSV(directory) {
    const readStream = fs.createReadStream(directory, { encoding: 'utf8'});
    try{
        let headers = [];
        let hasHeaders = false;
        let data = [];
        let lastObject = [];
        for await (const chunk of readStream) {
            console.log('   loading chunck...');
            let incompleteData = false;
            
            const rows = chunk.split('\r\n');
            if(hasHeaders === false){
                headers = rows[0].split(',');
                lastObject = rows[0].split(',');
                console.log('       setting up headers...');
            }

            // If first row is is incomplete map it to last object in data:
            if (rows[0].split(',').length < headers.length || lastObject.length < headers.length){
                console.log('           joining split values...');
                const incompleteRow = rows[0].split(',');
                const missedOffHeaders = headers.slice(headers.length - rows[0].split(',').length);
                for (const missedHeader in missedOffHeaders) {
                    const header = missedOffHeaders[missedHeader]
                    if(!data[data.length - 1][header]){
                        data[data.length - 1][header] = incompleteRow[missedHeader]; 
                    } else {
                        data[data.length - 1][header] = `${data[data.length - 1][header]}${incompleteRow[missedHeader]}`;
                    }
                }
                incompleteData = true;
                console.log('           joining split values complete...');
            }

            rows.slice(hasHeaders === false || incompleteData === true ? 1 : 0).map(row => {
                const val = row.split(',');
                const object = {}
                for (const h in headers) {
                    object[headers[h]] = val[h]
                }
                lastObject = Object.values(object).filter((item) => {if(item){return item}});
                data.push(object);                
            });

            if(headers.length !== 0) {
                hasHeaders = true;
            }
        }

        console.log('Reading File Complete...')
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
    const { headers, values } = data;
    let fileName = readFile.includes('street') ? 'AllStreet.csv' : 'AllStopAndSearch.csv';
    const filePath = path.join(directory,fileName);

    try {

        let fileExists = false;
        try {
            await fsPromises.access(filePath, fs.constants.F_OK);
            console.log(`${fileName} found...`);
            fileExists = true;
        } catch {}
        
        const writeStream = fs.createWriteStream(filePath, { flags: 'a'});
        writeStream.on('error', (error) => {
            console.log(`Error writing to file ${fileName}: ${error.message}`);
        })

        if (!fileExists){
            writeStream.write(`${headers.join(',')}\n`);
        }

        for (const value of values) {
            const valueString = headers.map((header) => value[header]).join(',');
            writeStream.write(`${valueString}\n`);
        }
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
                            await writeCSV(file, data);
                            console.log(`   Processing ${file} complete...`);
                        }
                        
                    }
                }
            }
        }
    } catch (error) {
        console.error(`Error processing directories: ${error.message}`)
    }    
}

CSVConcat(directoryPath);
