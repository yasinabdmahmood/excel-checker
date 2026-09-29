# Excel Duplicate Finder (مكتشف السجلات المكررة)

## About the Project
Excel Duplicate Finder is a lightweight, frontend-only web application built with Angular. It is designed to quickly parse Excel spreadsheets (`.xlsx` or `.xls`) directly in the browser and identify duplicate records based on dynamic, user-selected criteria. The interface is fully optimized for Right-to-Left (RTL) languages, making it an ideal tool for processing Arabic datasets.

## The Problem
Managing large datasets, such as student registries, employee attendance, or inventory lists, often involves dealing with duplicate entries. Finding these duplicates manually in Excel can be tedious and highly error-prone. Furthermore, a record might not be a 100% exact match across *all* columns (e.g., a student might have two different phone numbers listed), but they are still the same person based on a primary identifier like an ID Number ("المعرف") or Name ("اسم الطالب"). 

## The Solution
This application solves the problem by providing a flexible, visual interface for duplicate detection:
1. **Dynamic Criteria:** Instead of rigidly checking the whole row, it allows the user to select specific columns as the "matching criteria." 
2. **Local Processing:** By utilizing the SheetJS library, the app parses all data entirely on the client side (in the browser). No data is ever uploaded to a server, ensuring complete data privacy and fast execution.
3. **Smart Persistence:** The app remembers the user's selected criteria using local storage, saving time on repetitive tasks across multiple sessions.

## Key Features
* **100% Client-Side:** Secure and fast processing with zero server uploads.
* **Dynamic Checkboxes:** Automatically extracts column headers from the uploaded file to generate selectable criteria.
* **Visual Grouping:** Groups duplicate records together and displays exactly how many times a specific entry was repeated.
* **Data Preview:** Displays a quick snapshot of the first 5 rows to verify the file was parsed correctly.
* **Persistent Settings:** Remembers your selected columns for future visits.

## How to Use the App

### 1. Upload your Data
Drag and drop your Excel file (`.xlsx`) into the upload zone at the top of the page, or click the zone to open your file browser.

### 2. Verify the Preview
Once uploaded, the app will instantly read the file and display a preview table containing your column headers and the first 5 records. Verify that your data looks correct.

### 3. Select Criteria
Under the **"اختر معايير التكرار"** (Choose Duplication Criteria) section, click on the column names you want to use to find duplicates. 
* *Example:* If you want to find students who were registered twice, select the "المعرف" (ID) or "اسم الطالب" (Student Name) column.
* You can select multiple columns to find exact matches across a combination of data points.

### 4. View Results
Scroll down to the **"السجلات المكررة"** (Duplicate Records) section. The app will automatically calculate and display any records that share the exact same values in the columns you selected. They will be neatly grouped by the matching value, showing you exactly which rows require your attention.

## Local Development Setup
If you wish to run this project locally on your machine:

1. Clone the repository:
   ```bash
   git clone <your-repository-url>
   ```
2. Navigate to the project directory:
   ```bash
   cd excel-checker
   ```
3. Install the required dependencies (Angular and SheetJS):
   ```bash
   npm install
   npm install xlsx
   ```
4. Start the development server:
   ```bash
   ng serve
   ```
5. Open your browser and navigate to `http://localhost:4200/`.