const fs = require('fs');
const csv = require('csv-parser');

function csvToJson(csvFilePath, jsonFilePath) {
    const results = [];

    fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => {
            fs.writeFileSync(jsonFilePath, JSON.stringify(results, null, 2), 'utf-8');
            console.log(`CSV file successfully processed and converted to ${jsonFilePath}`);
        });
}

// Example usage
const csvFilePath = '/Users/faridagiwa/Desktop/csv/stops.csv';
const jsonFilePath = '/Users/faridagiwa/Desktop/stops.json';

csvToJson(csvFilePath, jsonFilePath);
