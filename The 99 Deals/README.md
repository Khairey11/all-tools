# The 99 Deals - Setup Instructions

## 📋 Google Sheets Integration

To enable order submissions, you need to set up a Google Sheet to receive orders:

### Step 1: Create Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet named **"The 99 Deals Orders"**
3. In the first row, add these column headers:
   - `Date`
   - `Product`
   - `Price`
   - `Customer Name`
   - `Phone`
   - `Address`

### Step 2: Set Up Google Apps Script

1. In your Google Sheet, click **Extensions** → **Apps Script**
2. Delete any existing code
3. Paste the following code:

```javascript
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);
  
  sheet.appendRow([
    new Date(),
    data.productName,
    data.price,
    data.customerName,
    data.phone,
    data.address
  ]);
  
  return ContentService.createTextOutput(JSON.stringify({ 'result': 'success' }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

4. Click **Save** (💾 icon)

### Step 3: Deploy the Script

1. Click the blue **Deploy** button → **New deployment**
2. Click the gear icon (⚙️) next to "Select type"
3. Choose **Web app**
4. Fill in the settings:
   - **Description**: "Order API"
   - **Execute as**: "Me" (your email)
   - **Who has access**: **Anyone** ⚠️ (This is critical!)
5. Click **Deploy**
6. Click **Authorize access** and grant permissions
7. **Copy the Web app URL** (looks like `https://script.google.com/macros/s/.../exec`)

### Step 4: Update Your Application

1. Open `src/services/googleSheets.ts`
2. Find this line:
   ```typescript
   const GOOGLE_SCRIPT_URL = 'YOUR_GOOGLE_SCRIPT_WEB_APP_URL_HERE';
   ```
3. Replace `'YOUR_GOOGLE_SCRIPT_WEB_APP_URL_HERE'` with your actual URL (keep the quotes)

Example:
```typescript
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby.../exec';
```

### Step 5: Test It!

1. Run your application: `npm run dev`
2. Navigate to a product page
3. Fill in the order form and submit
4. Check your Google Sheet - you should see a new row with the order details!

## 🎉 That's it!

Your e-commerce site now sends orders directly to Google Sheets. Every time a customer places an order, you'll get:
- ✅ Automatic timestamping
- ✅ Product details
- ✅ Customer information
- ✅ Ready to process

---

## 🔧 Troubleshooting

**Orders aren't showing up in Google Sheets?**
- Make sure the Script is deployed with "Who has access" set to **Anyone**
- Check the browser console (F12) for errors
- Verify you copied the **Web app URL** (ends with `/exec`), not the Script URL

**Want to test without setting up Google Sheets?**
- The app will work in "simulation mode" until you add the real URL
- You'll see a success message and console log, but data won't be saved
