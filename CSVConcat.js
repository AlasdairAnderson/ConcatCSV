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

async function writeCSV(readFile, data) { 
    const { headers, values } = data;
    let fileName = ''; 
    readFile.includes('street') ? fileName = 'AllStreet.csv' : fileName = 'AllStopAndSearch.csv';
    try {
        await fsPromises.access(`${directoryPath}\\${fileName}`, fs.constants.W_OK);
        console.log(`${fileName} found...`);
        const writeStream = fs.createWriteStream(`${directoryPath}\\${fileName}`, { encoding: 'utf8', flags: 'a'})
        for (const value of values) {
            const valueString = Object.values(value).toString();
            const overWatermark = writeStream.write(`\n${valueString}`);
            if (!overWatermark) {
                await new Promise((resolve) => writeStream.once('drain', resolve));
            }
        }
        writeStream.end();
        console.log(`Appending file ${fileName} Complete...`)
    } catch (error) {
        if(error.message.includes('no such file or directory')){
            const writeStream = fs.createWriteStream(`${directoryPath}\\${fileName}`, { encoding: 'utf8', flags: 'a'})
            writeStream.write(headers.join(','))
            for (const value of values) {
                const valueString = Object.values(value).toString();
                const overWatermark = writeStream.write(`\n${valueString}`);
                if (!overWatermark) {
                    await new Promise((resolve) => writeStream.once('drain', resolve));
                }
            }
            writeStream.end();
            console.log(`Writing file ${fileName} Complete...`)
        } else {
            console.error(`Failed to append file: ${error}`)
            return;
        }
    } 
}

async function CSVConcat() {
    try{
        const folders = fs.readdirSync(directoryPath);
        for (const folder in folders) {
            console.log(folders[folder]);
            const files = fs.readdirSync(`${directoryPath}\\${folders[folder]}`)
            for (const file in files) {
                console.log(`   ${files[file]}`);
                const filePath = `${directoryPath}\\${folders[folder]}\\${files[file]}`;
                console.log('Reading File...');
                const data = await readCSV(filePath);
                console.log('Writing File...');
                await writeCSV(files[file], data);
                console.log('File Complete...');
            }
        }
    } catch (error) {
        console.error(`unable to scan directory: ${error.message}`)
    }    
}

CSVConcat();