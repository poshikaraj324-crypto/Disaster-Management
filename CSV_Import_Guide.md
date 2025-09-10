# CSV Import Guide for Disaster Management System

## Required Fields

The CSV file must contain these **required** columns:

1. **title** - Alert title (string)
2. **type** - Alert type: `flood`, `landslide`, `severe_weather`, `evacuation`, or `other`
3. **severity** - Alert severity: `low`, `medium`, `high`, or `critical`
4. **latitude** - Latitude coordinate (number)
5. **longitude** - Longitude coordinate (number)

## Optional Fields

These fields are optional but recommended:

- **description** - Detailed alert description
- **address** - Street address
- **city** - City name
- **state** - State/Province name
- **country** - Country name (defaults to "India")
- **radius** - Alert radius in kilometers (defaults to 25)
- **tags** - Comma-separated tags

## CSV Format Requirements

1. **Header Row**: First row must contain column names
2. **Encoding**: Use UTF-8 encoding
3. **Delimiter**: Comma (,) separated
4. **Quotes**: Use double quotes around text fields that contain commas
5. **Coordinates**: Use decimal format (e.g., 19.0760, not 19°04'33.6")

## Example CSV Content

```csv
title,description,type,severity,latitude,longitude,address,city,state,country,radius,tags
"Flood Alert - Mumbai","Heavy rainfall causing urban flooding","flood","high",19.0760,72.8777,"Mumbai","Mumbai","Maharashtra","India",25,"flood,mumbai,urban"
"Landslide Warning","Continuous heavy rainfall increasing risk","landslide","critical",9.9312,76.2711,"Idukki District","Idukki","Kerala","India",30,"landslide,kerala,rainfall"
```

## Common Issues

1. **Missing Required Fields**: Ensure all required columns are present
2. **Invalid Coordinates**: Use proper decimal latitude/longitude format
3. **Invalid Type/Severity**: Use only allowed values
4. **Empty Rows**: Remove completely empty rows
5. **Special Characters**: Escape commas in text fields with quotes

## Validation Rules

- **Type**: Must be one of: flood, landslide, severe_weather, evacuation, other
- **Severity**: Must be one of: low, medium, high, critical
- **Latitude**: Must be between -90 and 90
- **Longitude**: Must be between -180 and 180
- **Radius**: Must be a positive number (defaults to 25 if not provided)

## Tips for Success

1. Use the provided template as a starting point
2. Test with a small file first (2-3 rows)
3. Check coordinates using Google Maps or similar
4. Validate type and severity values match exactly
5. Save as CSV (UTF-8) format
