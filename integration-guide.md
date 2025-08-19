# Diet Tracker Integration Guide
## Complete Setup Instructions for TheDietPlanner.com

### Overview
This Diet Tracker is a comprehensive, mobile-first nutrition tracking application designed specifically for Indian food tracking. It includes a built-in database of 40+ common Indian foods, multiple export formats, charts, and offline functionality.

---

## 1. Embedding in Hostinger

### Method A: Custom Code Block (Recommended)
1. **Login to Hostinger** and open your Website Builder
2. **Navigate to the page** where you want to embed the Diet Tracker
3. **Open "Add Elements"** panel on the left
4. **Drag and drop "Embed Code"** element to desired location
5. **Click "Enter Code"** and paste:

```html
<iframe 
    src="[APP_URL]" 
    width="100%" 
    height="800px" 
    frameborder="0" 
    scrolling="auto" 
    title="Diet Tracker App">
</iframe>
<script>
    // Responsive iframe height adjustment
    function adjustIframeHeight() {
        const iframe = document.querySelector('iframe[title="Diet Tracker App"]');
        if (iframe) {
            const minHeight = Math.max(window.innerHeight * 0.8, 600);
            iframe.style.height = minHeight + 'px';
        }
    }
    window.addEventListener('resize', adjustIframeHeight);
    adjustIframeHeight();
</script>
```

6. **Click "Embed Code"**
7. **Update your website** to publish changes

### Method B: Direct File Upload
1. **Upload files** (index.html, style.css, app.js) to your Hostinger file manager
2. **Create a subdirectory** like `/diet-tracker/`
3. **Link to the app** from your main site navigation

---

## 2. Theming & Customization

### CSS Variables for Brand Colors
Add this to your site's main CSS or in the Diet Tracker's `style.css`:

```css
:root {
  /* Primary Brand Colors */
  --brand: #your-brand-color;        /* Main brand color */
  --accent: #your-accent-color;      /* Secondary/accent color */
  
  /* Background & Surface Colors */
  --bg: #your-bg-color;              /* Main background */
  --surface: #your-surface-color;    /* Card/surface background */
  
  /* Text Colors */
  --text: #your-text-color;          /* Primary text */
  --text-secondary: #your-muted-color; /* Secondary text */
  --muted: #your-muted-color;        /* Muted text/borders */
  
  /* Status Colors (Optional) */
  --success: #10b981;                /* Success/positive */
  --warning: #f59e0b;                /* Warning */
  --danger: #ef4444;                 /* Error/danger */
}
```

### Sample Brand Integration
```css
/* Example for TheDietPlanner.com theme */
:root {
  --brand: #2563eb;          /* Blue primary */
  --accent: #059669;         /* Green accent */
  --bg: #f8fafc;            /* Light gray background */
  --surface: #ffffff;        /* White surface */
  --text: #1e293b;          /* Dark text */
  --text-secondary: #64748b; /* Gray text */
  --muted: #cbd5e1;         /* Light gray borders */
}

/* Dark mode variant */
[data-theme="dark"] {
  --bg: #0f172a;
  --surface: #1e293b;
  --text: #f1f5f9;
  --text-secondary: #94a3b8;
  --muted: #475569;
}
```

---

## 3. Export Functionality Setup

### Download Permissions
Ensure your Hostinger hosting allows:
- **JavaScript file downloads** (CSV, Excel, PDF generation)
- **Blob URL creation** for file downloads
- **Client-side file access** (no server configuration needed)

### Dependencies Included
The app automatically loads these libraries when needed:
- **SheetJS (XLSX)** v0.18.5 - Excel export
- **html2pdf.js** v0.10.1 - PDF generation  
- **Chart.js** latest - Charts and visualizations

**Note**: Libraries are lazy-loaded only when export features are used to maintain performance.

---

## 4. Google Sheets Template

### Creating the Template
1. **Create a new Google Sheet** with these columns:
   - Date | Meal Time | Food Name | Serving Size | Calories | Protein (g) | Carbs (g) | Fat (g) | Fiber (g) | Notes | Water (ml)

2. **Add sample data** (use provided sample data)

3. **Set up sharing**:
   - Click "Share" → "Anyone with the link" → "Viewer"
   - Copy the URL

4. **Create template link**:
   - Replace `/edit` with `/copy` in the URL
   - Example: `https://docs.google.com/spreadsheets/d/[ID]/copy`

### Template URL for Users
Include this in your app's help section or documentation:

**Google Sheets Template**: `https://docs.google.com/spreadsheets/d/[YOUR_SHEET_ID]/copy`

*Users click this link to create their own copy of the Diet Tracker template.*

---

## 5. Accessibility Features

### Built-in Accessibility
The app includes:
- **Semantic HTML** with proper heading structure
- **ARIA labels** for screen readers
- **Keyboard navigation** support
- **Focus indicators** for all interactive elements
- **High contrast colors** meeting WCAG AA standards
- **Responsive touch targets** (44px minimum)

### Screen Reader Support
```html
<!-- Examples of included ARIA labels -->
<button aria-label="Add new food entry">Add Entry</button>
<div role="progressbar" aria-valuenow="75" aria-valuemin="0" aria-valuemax="100">
<table role="table" aria-label="Food entries for today">
```

---

## 6. Testing Checklist

### ✅ Functional Tests
- [ ] **Add Entry**: Add food → reflected in totals
- [ ] **Edit Entry**: Click entry → modify → saves correctly
- [ ] **Delete Entry**: Remove entry → updates totals
- [ ] **Food Search**: Type food name → shows suggestions
- [ ] **Daily View**: Shows today's entries correctly
- [ ] **Weekly View**: Displays 7-day grid properly
- [ ] **Profile Settings**: Save targets → persists on reload
- [ ] **LocalStorage**: Data persists between sessions
- [ ] **Charts**: Load and display nutrition data
- [ ] **Water Tracking**: Add water → updates daily total

### ✅ Export Tests
- [ ] **CSV Export**: Downloads and opens in Excel/Sheets
- [ ] **XLSX Export**: Downloads and opens in Excel
- [ ] **PDF Export**: Generates clean printable report
- [ ] **Google Sheets**: Template link creates copy successfully

### ✅ UI/UX Tests
- [ ] **Mobile Responsive**: Works on phone screens (320px+)
- [ ] **Tablet View**: Adapts to tablet sizes
- [ ] **Desktop View**: Full functionality on desktop
- [ ] **Theme Toggle**: Dark/light mode switches correctly
- [ ] **Touch Targets**: All buttons easily tappable on mobile
- [ ] **Loading States**: Shows loading during heavy operations
- [ ] **Error Handling**: Displays helpful error messages

### ✅ Performance Tests
- [ ] **Initial Load**: App loads within 3 seconds
- [ ] **Chart Loading**: Charts render within 2 seconds
- [ ] **Export Speed**: Files generate within 5 seconds
- [ ] **Memory Usage**: No memory leaks during extended use
- [ ] **Offline Functionality**: Works without internet for stored data

---

## 7. Dependencies & Licenses

### External Libraries
1. **Chart.js** - MIT License
   - Purpose: Data visualization and charts
   - Size: ~60KB gzipped
   - Load: Lazy-loaded when charts viewed

2. **SheetJS (XLSX)** - Apache License 2.0
   - Purpose: Excel file generation
   - Size: ~400KB gzipped
   - Load: Lazy-loaded when exporting to Excel

3. **html2pdf.js** - MIT License
   - Purpose: PDF generation from HTML
   - Size: ~200KB gzipped  
   - Load: Lazy-loaded when generating PDFs

### Browser Compatibility
- **Chrome** 70+ ✅
- **Firefox** 65+ ✅
- **Safari** 12+ ✅
- **Edge** 79+ ✅
- **Mobile browsers** ✅ (iOS Safari, Chrome Mobile, Samsung Internet)

---

## 8. Security & Privacy

### Data Privacy
- **Local Storage Only**: No data sent to external servers
- **No Tracking**: No analytics or tracking scripts
- **No Cookies**: Uses localStorage exclusively
- **Secure**: All processing happens client-side

### Content Security Policy
If using CSP, allow:
```
script-src 'self' 'unsafe-inline' cdn.jsdelivr.net cdnjs.cloudflare.com;
style-src 'self' 'unsafe-inline';
connect-src 'self';
```

---

## 9. Sample Files Provided

### 1. diet_tracker_export.csv
Standard CSV format with columns:
- date, meal_time, food_name, serving_size, calories, protein, carbs, fat, fiber, notes, water_intake

### 2. diet_tracker_export.xlsx  
Excel file with two sheets:
- **Food Entries**: All individual food entries
- **Daily Summary**: Aggregated daily nutrition totals

### 3. diet_tracker_report.html
Clean HTML report template for PDF generation with:
- Header with logo and date
- Nutrition summary grid
- Detailed food entries table
- Professional styling for printing

---

## 10. Support & Maintenance

### Common Issues & Solutions

**Issue**: App not loading in iframe
**Solution**: Check for X-Frame-Options header blocking embedding

**Issue**: Export functions not working  
**Solution**: Ensure JavaScript is enabled and libraries can load from CDN

**Issue**: Data not persisting
**Solution**: Check if localStorage is enabled in browser settings

**Issue**: Mobile layout issues
**Solution**: Verify viewport meta tag is present

### Updates
The app is built to be self-contained and requires no server-side maintenance. All updates can be made by replacing the static files.

### Customization Support
For additional customization beyond CSS theming, modify:
- `app.js` - Add new features or modify functionality
- `style.css` - Adjust styling and layout
- `indianFoods` array in app.js - Add/modify food database

---

## 11. Advanced Integration

### Custom Food Database
To add more Indian foods, edit the `indianFoods` array in `app.js`:

```javascript
// Add new food items
{
  "name": "Samosa (1 piece)", 
  "calories": 150, 
  "protein": 4, 
  "carbs": 18, 
  "fat": 7, 
  "fiber": 2, 
  "category": "snacks"
}
```

### API Integration (Optional)
For server integration, modify the `saveToStorage()` and `loadFromStorage()` methods to:
- Send data to your backend API
- Sync across multiple devices
- Backup user data to cloud storage

### Whitelabel Customization
Replace branding elements:
- Update `<title>` tag in index.html
- Change logo text in header
- Modify footer credits
- Adjust color scheme via CSS variables

---

## 12. Production Deployment

### Pre-deployment Checklist
- [ ] Test all export functions
- [ ] Verify mobile responsiveness
- [ ] Check all form validations
- [ ] Test accessibility with screen reader
- [ ] Validate HTML and CSS
- [ ] Optimize images and assets
- [ ] Test on multiple devices and browsers

### File Structure for Upload
```
diet-tracker/
├── index.html          # Main application file
├── style.css           # Styles and theming
├── app.js             # JavaScript functionality
└── assets/            # Any additional assets (optional)
```

### Go Live Steps
1. Upload all files to your Hostinger directory
2. Test the direct URL access
3. Embed using iframe method described above
4. Add to your site navigation menu
5. Submit for search engine indexing (optional)

---

**Questions or Issues?** 
Contact: support@thedietplanner.com

**Live Demo**: [APP_URL]

**Last Updated**: August 15, 2025