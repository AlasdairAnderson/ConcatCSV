# Concatination of multiple CSV's into a single CSV.
## Project Decription
This application takes multiple CSV's that you might get from a data dump and joins them up to make a single CSV that can then be improted into a visualisation tool. Specifically this is looking the consolidation of data provided by [data.police.uk](https://data.police.uk/data/).
I desided to use JavaScript to complete this task due to the fact that this is the main language that I am learning at the moment and I wanted to get a better understanding of how to use it's `fs` library to read, compute and write information from one file to another.
I know that a language like Python would probably be more performant for this tasks but the secondary aim of this application was to getter a better understanding of JS.
## Challenges
During the implomentation of this project I faced a few chalanges that I had to firgure out:
### The chuncking of createReadStream creating incomplete lines of data:
To mitigate this issue I had to ensure that I had a buffer of the last line of data that was processed in the chunck. If this last line was had less data than the expected amount of data (derived from the number of headers) of the first line of the next chunck and less data then
the expected amount of data then the application will identify the information that had been missed off using the headers and patch it into the last line of data.
### Preventing empty lines of data making their way to the final CSV.
During the generation of the CSV there where instances of regular empty rows. This was due to the fact that in the readCSV() function there were instances of empty objects being patched into the data array. To prevent this, I implomented a check on the object just before it is patched 
into the data array to ensure that it actually incudes data. If it does not then it will be passed over.
## Requirements
- Node.js (version 12 or higher)
- Access to the file system (read/write permissions)
## Installation
1. Clone the repository or download the script.
2. Navigate to the project directory.
```
npm install
```
## Usage
1. Set the `directoryPath` variable tothe path where your CSV files are located. The script will recursively search through all subdirectoires.
```
const directoryPath = path.join('Your','Directory','Path')
```
2. Run the script uding Node.js
```
node ConcatCSV.js
```
## Functions

### `readCSV(directory)`
Reads a CSV file from the specified directory. It processes the file in chunks, handles incomplete rows, and returns and object containing the headers and values.

**Parameters:**
- `directory` (string): The path to the CSV file.

**Returns:**
- An object with `headers` and `values`.
- 
### `writeCSV(directory, readFile, data)`
Writes the concatenated data into new CSV files. The filename is determined based on the contents of the `readFile` parameter.

**Parameters:**
- `directory` (string): The directory where the new CSV file will be saved.
- `readFile` (string): The original filename to determine the new file's name.
- `data` (object): The data object containing headers and values.
- 
### `CSVConcat(directory)`
Main function that orchestrates the reading and writing of CSV files. It traverses through directories, processes each CSV file, and calls the `readCSV` and `writeCSV` functions.

**Parameters:**
- `directory` (string: The root directory to start processing.

## Error Handling
Error handling is handled throughout all three functions through the use of `try catch` statements. If an error occurs, it is logged to the console.

## Logging
Loggings is used throughout various stages of the process to the console, including:
- Loading chuncks of data
- Setting up headers
- Joining split values
- Processing folders and files
- Completion messages for reading a writing operations

## License
This project is licensed under the MIT License - the **LICENSE** file for details.



