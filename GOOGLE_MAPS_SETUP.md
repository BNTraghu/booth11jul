# Google Maps Integration Setup

## Prerequisites

1. **Google Cloud Console Account**: You need a Google Cloud Console account
2. **Google Maps API Key**: You need to enable the Google Maps JavaScript API and get an API key

## Setup Steps

### 1. Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Geocoding API
   - Places API
4. Go to "Credentials" and create an API key
5. Restrict the API key to your domain for security

### 2. Environment Variables

Create a `.env` file in your project root and add:

```env
VITE_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

**Important:** Make sure to restart your development server after adding the environment variable.

### 3. Features Included

The Google Maps integration includes:

- **Interactive Map**: Click to set location
- **Draggable Marker**: Drag to adjust position
- **Address Autocomplete**: Automatically fills address fields
- **Geocoding**: Converts coordinates to human-readable addresses
- **Form Integration**: Updates all address-related fields automatically

### 4. Usage

1. **Setting Location**: Click anywhere on the map to set the event location
2. **Adjusting Position**: Drag the red marker to fine-tune the location
3. **Address Auto-fill**: The system automatically fills:
   - Address Line 1
   - Standard Address Format
   - City
   - Latitude/Longitude coordinates

### 5. Security Notes

- Always restrict your API key to your domain
- Monitor API usage in Google Cloud Console
- Consider implementing rate limiting for production use

### 6. Troubleshooting

If the map doesn't load:
1. Check if your API key is correct
2. Verify that the Maps JavaScript API is enabled
3. Check browser console for any error messages
4. Ensure your domain is allowed in API key restrictions 