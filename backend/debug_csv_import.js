const fs = require('fs');
const csv = require('csv-parser');

// Test CSV parsing
function testCSVParsing(filePath) {
  console.log('Testing CSV parsing...');
  const alerts = [];
  const errors = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        console.log('Parsed row:', row);
        
        // Check required fields
        if (!row.title || !row.type || !row.severity || !row.latitude || !row.longitude) {
          const error = `Row ${alerts.length + 1}: Missing required fields - title: ${!!row.title}, type: ${!!row.type}, severity: ${!!row.severity}, latitude: ${!!row.latitude}, longitude: ${!!row.longitude}`;
          console.log('ERROR:', error);
          errors.push(error);
          return;
        }

        // Validate coordinates
        const lat = parseFloat(row.latitude);
        const lng = parseFloat(row.longitude);
        
        if (isNaN(lat) || isNaN(lng)) {
          const error = `Row ${alerts.length + 1}: Invalid coordinates - lat: ${row.latitude}, lng: ${row.longitude}`;
          console.log('ERROR:', error);
          errors.push(error);
          return;
        }

        // Validate type
        const validTypes = ['flood', 'landslide', 'severe_weather', 'evacuation', 'other'];
        if (!validTypes.includes(row.type.toLowerCase())) {
          const error = `Row ${alerts.length + 1}: Invalid type - ${row.type}. Must be one of: ${validTypes.join(', ')}`;
          console.log('ERROR:', error);
          errors.push(error);
          return;
        }

        // Validate severity
        const validSeverities = ['low', 'medium', 'high', 'critical'];
        if (!validSeverities.includes(row.severity.toLowerCase())) {
          const error = `Row ${alerts.length + 1}: Invalid severity - ${row.severity}. Must be one of: ${validSeverities.join(', ')}`;
          console.log('ERROR:', error);
          errors.push(error);
          return;
        }

        const alert = {
          title: row.title,
          description: row.description || '',
          type: row.type.toLowerCase(),
          severity: row.severity.toLowerCase(),
          location: {
            type: 'Point',
            coordinates: [lng, lat],
            address: row.address || '',
            city: row.city || '',
            state: row.state || '',
            country: row.country || 'India',
            radius: parseFloat(row.radius) || 25
          }
        };

        console.log('Valid alert created:', alert);
        alerts.push(alert);
      })
      .on('end', () => {
        console.log('\n=== CSV PARSING RESULTS ===');
        console.log(`Total rows processed: ${alerts.length + errors.length}`);
        console.log(`Valid alerts: ${alerts.length}`);
        console.log(`Errors: ${errors.length}`);
        
        if (errors.length > 0) {
          console.log('\nERRORS:');
          errors.forEach(error => console.log(`- ${error}`));
        }
        
        if (alerts.length === 0) {
          console.log('\n❌ NO VALID ALERTS FOUND - This is why import fails!');
        } else {
          console.log('\n✅ CSV is valid and ready for import!');
        }
        
        resolve({ alerts, errors });
      })
      .on('error', (error) => {
        console.log('CSV parsing error:', error);
        reject(error);
      });
  });
}

// Run the test
if (require.main === module) {
  const csvFile = process.argv[2] || 'test_import.csv';
  console.log(`Testing CSV file: ${csvFile}`);
  
  testCSVParsing(csvFile)
    .then(() => {
      console.log('\nTest completed!');
      process.exit(0);
    })
    .catch(error => {
      console.error('Test failed:', error);
      process.exit(1);
    });
}

module.exports = { testCSVParsing };
