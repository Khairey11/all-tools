
# Google Sheets Backend Setup

To save orders directly to your Google Sheet, follow these steps:

1.  **Create a New Google Sheet**:
    -   Go to [sheets.google.com](https://sheets.google.com) and create a new blank spreadsheet.
    -   Name it "The 99 Deals Orders".
    -   In the first row, add these headers: `Date`, `Product`, `Price`, `Customer Name`, `Phone`, `Address`.

2.  **Open Apps Script**:
    -   Click on `Extensions` > `Apps Script` in the menu.

3.  **Paste the Code**:
    -   Delete any code in the editor and paste the following:

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

4.  **Deploy as Web App**:
    -   Click the blue **Deploy** button > **New deployment**.
    -   Select type: **Web app**.
    -   Description: "Order API".
    -   **Execute as**: "Me" (your email).
    -   **Who has access**: **Anyone** (This is important for the form to work without login).
    -   Click **Deploy**.

5.  **Copy the URL**:
    -   Copy the "Web app URL" (it looks like `https://script.google.com/macros/s/.../exec`).
    -   You will need to paste this URL into the application code (I will show you where).

> **Note**: If you change the code later, you must create a *New deployment* generic version for changes to take effect.
