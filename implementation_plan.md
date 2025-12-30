# Risk Management Tool - Implementation Plan

## Overview

This implementation plan outlines the development of a web-based Risk Management Tool that meets all assignment requirements. The tool will be a single-page application (SPA) with modular JavaScript architecture, client-side data persistence, and professional export capabilities.

---

## User Review Required

> [!IMPORTANT]
> **Student Name Placeholder**: The project proposal contains a placeholder for student name(s). Please update section 2 of `project_proposal.md` with your actual name(s) before submission.

> [!NOTE]
> **Technology Stack**: This implementation uses vanilla JavaScript with LocalStorage for simplicity and to meet the "no unnecessary extras" requirement. The tool will be fully functional without requiring a backend server or database setup.

---

## Proposed Changes

### Web Application Structure

The application will be organized as follows:

```
galactic-kepler/
├── index.html              # Main application page
├── css/
│   └── styles.css          # All styling and design system
├── js/
│   ├── app.js              # Main application controller
│   ├── assetManager.js     # Asset inventory module
│   ├── threatManager.js    # Threat/vulnerability mapping
│   ├── riskCalculator.js   # Likelihood × Impact scoring
│   ├── riskMatrix.js       # Risk classification and visualization
│   ├── treatmentManager.js # Risk treatment tracking
│   ├── exportManager.js    # PDF/Excel export functionality
│   └── dataStore.js        # LocalStorage wrapper
├── lib/
│   ├── jspdf.min.js        # PDF generation library
│   ├── jspdf.plugin.autotable.min.js  # PDF tables
│   └── xlsx.full.min.js    # Excel export library
└── data/
    └── sample-data.json    # Demo data for presentation
```

---

### Component Implementation Details

#### [NEW] [index.html](file:///c:/Users/NV/.gemini/antigravity/playground/galactic-kepler/index.html)

**Purpose**: Main application structure and UI layout

**Key Features**:
- Responsive navigation with 5 main sections:
  1. Dashboard (Overview)
  2. Assets (Inventory Management)
  3. Threats & Vulnerabilities
  4. Risk Assessment
  5. Treatment Tracking
- Modal dialogs for adding/editing data
- Risk matrix visualization area
- Export buttons (PDF/Excel)

**Implementation Details**:
- Semantic HTML5 structure
- Unique IDs for all interactive elements
- Accessibility attributes (ARIA labels)
- Form validation attributes

---

#### [NEW] [css/styles.css](file:///c:/Users/NV/.gemini/antigravity/playground/galactic-kepler/css/styles.css)

**Purpose**: Modern, professional styling with premium aesthetics

**Design System**:
- **Color Palette**:
  - Primary: Deep blue (#1e3a8a)
  - Success/Low Risk: Green (#10b981)
  - Warning/Medium Risk: Amber (#f59e0b)
  - Danger/High Risk: Red (#ef4444)
  - Background: Light gray (#f9fafb)
  - Dark mode support

- **Typography**:
  - Google Fonts: 'Inter' for UI, 'Roboto Mono' for data
  - Responsive font sizing
  - Clear hierarchy

- **Components**:
  - Card-based layouts with subtle shadows
  - Smooth transitions and hover effects
  - Glassmorphism for modals
  - Gradient accents
  - Responsive grid system

**Risk Matrix Styling**:
- 5×5 grid with color-coded cells
- Interactive hover states
- Clear labels for Likelihood and Impact axes

---

#### [NEW] [js/dataStore.js](file:///c:/Users/NV/.gemini/antigravity/playground/galactic-kepler/js/dataStore.js)

**Purpose**: Centralized data management using LocalStorage

**Data Structure**:
```javascript
{
  assets: [
    {
      id: "uuid",
      name: "string",
      type: "Hardware|Software|Data|Personnel|Facilities",
      value: "number (1-5)",
      criticality: "Low|Medium|High|Critical",
      description: "string"
    }
  ],
  threats: [
    {
      id: "uuid",
      name: "string",
      category: "Malware|Phishing|DDoS|Insider|Physical|Other",
      description: "string"
    }
  ],
  vulnerabilities: [
    {
      id: "uuid",
      assetId: "uuid",
      threatId: "uuid",
      description: "string",
      likelihood: "number (1-5)",
      impact: "number (1-5)",
      riskScore: "number (calculated)",
      riskLevel: "Low|Medium|High"
    }
  ],
  treatments: [
    {
      id: "uuid",
      vulnerabilityId: "uuid",
      strategy: "Mitigate|Accept|Transfer|Avoid",
      status: "Planned|In Progress|Completed",
      responsible: "string",
      dueDate: "date",
      notes: "string"
    }
  ]
}
```

**Methods**:
- `getData(key)`: Retrieve data array
- `saveData(key, data)`: Persist data array
- `addItem(key, item)`: Add new item
- `updateItem(key, id, updates)`: Update existing item
- `deleteItem(key, id)`: Remove item
- `clearAll()`: Reset all data

---

#### [NEW] [js/assetManager.js](file:///c:/Users/NV/.gemini/antigravity/playground/galactic-kepler/js/assetManager.js)

**Purpose**: Asset Inventory Module

**Features**:
- Display asset table with sorting and filtering
- Add new assets via modal form
- Edit existing assets
- Delete assets (with confirmation)
- Asset type categorization
- Value and criticality assignment
- Search functionality

**Key Functions**:
- `renderAssetTable()`: Display all assets
- `showAddAssetModal()`: Open add form
- `saveAsset(assetData)`: Validate and save
- `deleteAsset(id)`: Remove asset and cascade to vulnerabilities
- `filterAssets(criteria)`: Search/filter

---

#### [NEW] [js/threatManager.js](file:///c:/Users/NV/.gemini/antigravity/playground/galactic-kepler/js/threatManager.js)

**Purpose**: Threat/Vulnerability Mapping Module

**Pre-loaded Threat Library**:
- Malware (Ransomware, Trojans, Viruses)
- Phishing (Email, SMS, Voice)
- DDoS Attacks
- Insider Threats (Malicious, Negligent)
- Physical Security Breaches
- Data Breaches
- Supply Chain Attacks
- Zero-Day Exploits

**Features**:
- Threat library management
- Vulnerability creation linking threats to assets
- Likelihood and impact input forms
- Threat-asset relationship visualization
- Bulk threat import

**Key Functions**:
- `renderThreatLibrary()`: Display available threats
- `createVulnerability(assetId, threatId)`: Link threat to asset
- `setLikelihoodImpact(vulnId, likelihood, impact)`: Set risk parameters
- `getAssetVulnerabilities(assetId)`: Retrieve all vulnerabilities for an asset

---

#### [NEW] [js/riskCalculator.js](file:///c:/Users/NV/.gemini/antigravity/playground/galactic-kepler/js/riskCalculator.js)

**Purpose**: Likelihood × Impact Scoring Engine

**Scoring Scales**:

**Likelihood (1-5)**:
1. Rare: May occur only in exceptional circumstances
2. Unlikely: Could occur at some time
3. Possible: Might occur at some time
4. Likely: Will probably occur in most circumstances
5. Almost Certain: Expected to occur in most circumstances

**Impact (1-5)**:
1. Insignificant: Minimal impact, easily managed
2. Minor: Some impact, manageable with routine procedures
3. Moderate: Moderate impact, requires management attention
4. Major: Significant impact, requires senior management intervention
5. Catastrophic: Severe impact, threatens organizational viability

**Risk Score Calculation**:
```
Risk Score = Likelihood × Impact
```

**Risk Level Classification**:
- **Low (1-6)**: Green - Acceptable risk, routine monitoring
- **Medium (8-12)**: Yellow - Requires management attention and mitigation planning
- **High (15-25)**: Red - Immediate action required, senior management involvement

**Key Functions**:
- `calculateRiskScore(likelihood, impact)`: Compute score
- `classifyRisk(score)`: Determine risk level
- `getRiskColor(level)`: Return color code
- `recalculateAllRisks()`: Update all vulnerability scores

---

#### [NEW] [js/riskMatrix.js](file:///c:/Users/NV/.gemini/antigravity/playground/galactic-kepler/js/riskMatrix.js)

**Purpose**: Automated Risk Classification and Visualization

**Risk Matrix Display**:
- 5×5 grid (Likelihood vs Impact)
- Color-coded cells based on risk level
- Interactive cells showing vulnerability count
- Click to view vulnerabilities in each cell
- Legend explaining risk levels

**Features**:
- Real-time matrix updates as vulnerabilities change
- Vulnerability distribution visualization
- Risk summary statistics:
  - Total vulnerabilities
  - Count by risk level
  - Highest risk items
  - Treatment status overview

**Key Functions**:
- `renderRiskMatrix()`: Generate 5×5 grid
- `populateMatrixCells()`: Fill with vulnerability data
- `getMatrixCellVulnerabilities(likelihood, impact)`: Retrieve vulnerabilities for cell
- `updateMatrixStatistics()`: Calculate summary metrics

---

#### [NEW] [js/treatmentManager.js](file:///c:/Users/NV/.gemini/antigravity/playground/galactic-kepler/js/treatmentManager.js)

**Purpose**: Risk Treatment Tracking Dashboard

**Treatment Strategies**:
1. **Mitigate**: Implement controls to reduce likelihood or impact
2. **Accept**: Acknowledge risk and accept consequences
3. **Transfer**: Shift risk to third party (insurance, outsourcing)
4. **Avoid**: Eliminate the activity causing the risk

**Features**:
- Treatment plan creation for each vulnerability
- Status tracking (Planned → In Progress → Completed)
- Responsible party assignment
- Due date management
- Treatment effectiveness notes
- Dashboard with filters by strategy and status

**Key Functions**:
- `createTreatmentPlan(vulnerabilityId, strategy)`: Initialize plan
- `updateTreatmentStatus(id, status)`: Change status
- `renderTreatmentDashboard()`: Display all treatments
- `filterByStrategy(strategy)`: Filter view
- `getTreatmentMetrics()`: Calculate completion rates

---

#### [NEW] [js/exportManager.js](file:///c:/Users/NV/.gemini/antigravity/playground/galactic-kepler/js/exportManager.js)

**Purpose**: Exportable Final Report Generation

**PDF Export Features**:
- **Cover Page**: Title, date, organization
- **Executive Summary**:
  - Total assets
  - Total vulnerabilities
  - Risk distribution (Low/Medium/High)
  - Key recommendations
- **Asset Inventory Table**: All assets with details
- **Risk Matrix Visualization**: Color-coded 5×5 grid
- **Detailed Risk Analysis**: All vulnerabilities with scores
- **Treatment Plan Summary**: All planned/ongoing treatments
- **Appendix**: Methodology and scoring criteria

**Excel Export Features**:
- **Assets Sheet**: Complete asset inventory
- **Threats Sheet**: Threat library
- **Vulnerabilities Sheet**: All vulnerabilities with calculated scores
- **Treatments Sheet**: Treatment plans and status
- **Summary Sheet**: Statistics and metrics

**Key Functions**:
- `generatePDFReport()`: Create comprehensive PDF
- `generateExcelReport()`: Create multi-sheet Excel file
- `downloadFile(blob, filename)`: Trigger browser download

---

#### [NEW] [data/sample-data.json](file:///c:/Users/NV/.gemini/antigravity/playground/galactic-kepler/data/sample-data.json)

**Purpose**: Demo data for presentation and testing

**Contents**:
- 10-15 sample assets across all types
- 8-10 common threats
- 15-20 vulnerabilities with varied risk levels
- 10-12 treatment plans in different statuses

This provides realistic data for demonstrating all features during the presentation.

---

#### [NEW] [js/app.js](file:///c:/Users/NV/.gemini/antigravity/playground/galactic-kepler/js/app.js)

**Purpose**: Main application controller and initialization

**Responsibilities**:
- Initialize all modules
- Handle navigation between sections
- Coordinate data flow between modules
- Load sample data on first run
- Event listener setup
- Global state management

**Key Functions**:
- `init()`: Application startup
- `navigateToSection(sectionId)`: Handle navigation
- `loadSampleData()`: Import demo data
- `refreshAllViews()`: Update all displays

---

## Verification Plan

### Manual Testing

#### Test 1: Asset Inventory Module
**Steps**:
1. Open `index.html` in a web browser
2. Navigate to "Assets" section
3. Click "Add Asset" button
4. Fill in form with:
   - Name: "Web Server"
   - Type: "Hardware"
   - Value: 4
   - Criticality: "High"
   - Description: "Production web server"
5. Click "Save"
6. Verify asset appears in table
7. Click "Edit" on the asset
8. Change criticality to "Critical"
9. Verify update is reflected
10. Click "Delete" and confirm
11. Verify asset is removed

**Expected Result**: All CRUD operations work correctly, data persists after page reload

---

#### Test 2: Threat/Vulnerability Mapping
**Steps**:
1. Ensure at least one asset exists
2. Navigate to "Threats & Vulnerabilities" section
3. Click "Add Vulnerability"
4. Select an asset from dropdown
5. Select a threat (e.g., "Malware - Ransomware")
6. Set Likelihood: 4 (Likely)
7. Set Impact: 5 (Catastrophic)
8. Add description
9. Click "Save"
10. Verify vulnerability appears in list
11. Check that Risk Score shows "20"
12. Check that Risk Level shows "High" in red

**Expected Result**: Vulnerability is created with correct risk calculation

---

#### Test 3: Risk Matrix Visualization
**Steps**:
1. Create vulnerabilities with different likelihood/impact combinations:
   - Likelihood 1, Impact 2 (Low)
   - Likelihood 3, Impact 3 (Medium)
   - Likelihood 5, Impact 5 (High)
2. Navigate to "Risk Assessment" section
3. Verify risk matrix displays 5×5 grid
4. Verify cells are color-coded correctly:
   - Green for low risk cells
   - Yellow for medium risk cells
   - Red for high risk cells
5. Verify vulnerability counts appear in appropriate cells
6. Click on a cell with vulnerabilities
7. Verify popup shows vulnerabilities in that cell

**Expected Result**: Matrix accurately reflects all vulnerabilities with correct color coding

---

#### Test 4: Risk Treatment Tracking
**Steps**:
1. Ensure vulnerabilities exist
2. Navigate to "Treatment Tracking" section
3. Click "Add Treatment Plan" for a high-risk vulnerability
4. Select strategy: "Mitigate"
5. Set status: "Planned"
6. Assign responsible party: "IT Security Team"
7. Set due date: 30 days from now
8. Add notes: "Implement firewall rules"
9. Click "Save"
10. Verify treatment appears in dashboard
11. Update status to "In Progress"
12. Verify status change is reflected
13. Filter by strategy "Mitigate"
14. Verify only mitigation treatments are shown

**Expected Result**: Treatment plans are created, updated, and filtered correctly

---

#### Test 5: PDF Export
**Steps**:
1. Ensure system has sample data loaded (assets, vulnerabilities, treatments)
2. Click "Export PDF" button
3. Wait for PDF generation
4. Verify PDF downloads automatically
5. Open PDF and verify it contains:
   - Cover page with title and date
   - Executive summary with statistics
   - Asset inventory table
   - Risk matrix visualization
   - Detailed vulnerability list with scores
   - Treatment plan summary
6. Verify all data is accurate and matches the application

**Expected Result**: Professional PDF report is generated with all required sections

---

#### Test 6: Excel Export
**Steps**:
1. Click "Export Excel" button
2. Verify Excel file downloads
3. Open Excel file and verify it contains sheets:
   - Assets
   - Threats
   - Vulnerabilities
   - Treatments
   - Summary
4. Verify each sheet has appropriate headers
5. Verify data matches the application
6. Verify Summary sheet has calculated statistics

**Expected Result**: Multi-sheet Excel file with complete data export

---

#### Test 7: Data Persistence
**Steps**:
1. Add several assets, vulnerabilities, and treatments
2. Close the browser tab
3. Reopen `index.html`
4. Navigate through all sections
5. Verify all previously entered data is still present
6. Verify risk calculations are still correct

**Expected Result**: All data persists across browser sessions using LocalStorage

---

#### Test 8: Automated Risk Classification
**Steps**:
1. Create a vulnerability with Likelihood 2, Impact 3 (Score: 6, Level: Low)
2. Verify it shows green/low risk
3. Edit the vulnerability to Likelihood 4, Impact 3 (Score: 12, Level: Medium)
4. Verify risk level automatically updates to yellow/medium
5. Edit again to Likelihood 5, Impact 5 (Score: 25, Level: High)
6. Verify risk level automatically updates to red/high
7. Check risk matrix updates in real-time

**Expected Result**: Risk levels automatically recalculate and update throughout the application

---

### Automated Validation

While this is a client-side application without a traditional test suite, we will implement:

#### Browser Console Validation
**File**: `js/app.js` (includes validation mode)

**Validation Functions**:
```javascript
// Run in browser console after loading sample data
validateRiskCalculations(); // Checks all risk scores are correct
validateDataIntegrity();    // Checks referential integrity
validateExportFunctions();  // Tests export generation
```

**Steps to Run**:
1. Open `index.html` in browser
2. Open Developer Tools (F12)
3. Go to Console tab
4. Type `validateRiskCalculations()` and press Enter
5. Verify output shows "All risk calculations valid ✓"
6. Type `validateDataIntegrity()` and press Enter
7. Verify output shows "Data integrity check passed ✓"

**Expected Result**: All validation functions pass without errors

---

## Implementation Sequence

1. **Setup** (Day 1):
   - Create project structure
   - Download required libraries (jsPDF, SheetJS)
   - Set up HTML skeleton

2. **Core Data Layer** (Day 1-2):
   - Implement `dataStore.js`
   - Create sample data
   - Test data persistence

3. **Asset Module** (Day 2-3):
   - Build `assetManager.js`
   - Create asset UI and forms
   - Test CRUD operations

4. **Threat/Vulnerability Module** (Day 3-4):
   - Build `threatManager.js`
   - Implement threat library
   - Create vulnerability mapping UI

5. **Risk Calculation** (Day 4-5):
   - Build `riskCalculator.js`
   - Implement scoring logic
   - Test classification accuracy

6. **Risk Matrix** (Day 5-6):
   - Build `riskMatrix.js`
   - Create visual matrix
   - Implement interactivity

7. **Treatment Tracking** (Day 6-7):
   - Build `treatmentManager.js`
   - Create treatment dashboard
   - Implement filtering

8. **Export Functionality** (Day 7-8):
   - Build `exportManager.js`
   - Implement PDF generation
   - Implement Excel export
   - Test report quality

9. **Styling & Polish** (Day 8-9):
   - Complete `styles.css`
   - Implement responsive design
   - Add animations and transitions

10. **Testing & Documentation** (Day 9-10):
    - Run all manual tests
    - Fix bugs
    - Prepare demo data
    - Create documentation

---

## Risk Mitigation

**Potential Issues**:

1. **Browser Compatibility**: 
   - Mitigation: Test on Chrome, Firefox, Edge
   - Use standard ES6 features with broad support

2. **LocalStorage Limits**:
   - Mitigation: Implement data size monitoring
   - Typical limit is 5-10MB, sufficient for this use case

3. **PDF Generation Performance**:
   - Mitigation: Show loading indicator
   - Optimize table rendering

4. **Export Library Loading**:
   - Mitigation: Include libraries locally in `lib/` folder
   - Provide CDN fallback

---

## Future Enhancements
*(Not included in current scope)*

- Cloud storage integration
- Multi-user collaboration
- API integration with threat intelligence feeds
- Advanced analytics and trending
- Mobile app version
- Compliance framework mapping (ISO 27001, NIST CSF)

---

*End of Implementation Plan*
