# State Program Data Extraction - Complete Index

**Date:** 2026-04-03
**Purpose:** Comprehensive extraction of state-specific program data for county page generation script development

---

## Documents Generated

### 1. STATE_PROGRAM_DATA_EXTRACTION.json
**Purpose:** Raw extraction of all state-specific program data, footers, and resource categories

**Contents:**
- State portal names and URLs for all 6 states
- Phone numbers for SNAP, Medicaid, Unemployment by state
- Key programs with descriptions, eligibility, and contact info
- State-specific footer links
- Crisis hotline variations by state
- Generic vs state-specific content comparison

**File Size:** ~50 KB

**Key Data Points Extracted:**
```
Florida:
- Portal: ACCESS Florida (myflorida.com/accessflorida)
- SNAP Phone: 1-866-762-2237
- Medicaid Phone: 1-800-610-8301
- 6 resource categories: Utilities, Housing, Food, Healthcare, Employment, Seniors, Disability, Childcare, Community

Texas:
- Portal: YourTexasBenefits (yourtexasbenefits.com)
- SNAP Phone: 2-1-1
- Medicaid Phone: 2-1-1
- 9 resource categories (includes Legal Aid, Transportation)

New York:
- Portal: myBenefits.ny.gov
- SNAP Benefit Average: $280/month (higher than other states)
- Benefit names: SNAP, NY Medicaid

Illinois:
- Portal: ABE - Application for Benefits Eligibility (abe.illinois.gov)
- SNAP Phone: 1-800-843-6154
- Medicaid Phone: 1-866-468-7543
- LIHEAP Program: "Help Illinois Families" (seasonal: Nov-Apr)

California:
- Portal: BenefitsCal (benefitscal.com)
- UNIQUE: SNAP renamed to "CalFresh", Medicaid renamed to "Medi-Cal"
- CalFresh Phone: 1-877-847-3663
- Medi-Cal Phone: 1-800-541-5555

Ohio:
- Portal: benefits.ohio.gov
- 211-centric (most services available via dial 211)
- Simpler structure - fewer detailed programs listed
```

**Files Analyzed:**
- florida/orange/index.html
- texas/harris/index.html
- new-york/kings/index.html
- illinois/cook/index.html
- california/los-angeles/index.html
- ohio/cuyahoga/index.html

---

### 2. ENHANCED_TEMPLATE_ANALYSIS.json
**Purpose:** Detailed breakdown of the enhanced Cook County prototype template

**Contents:**
- Comparison of standard vs enhanced template structure
- New HTML elements (detail-toggle, detail-blocks, status-badges)
- CSS enhancements for responsive accordion behavior
- JavaScript functionality (accordions, mobile pill tracking)
- Accessibility features (ARIA attributes, keyboard navigation)
- Mobile quick-access pill bar implementation
- Browser compatibility notes
- Testing checklist

**File Size:** ~35 KB

**Key Enhancements:**
1. **Accordion System**
   - `.detail-toggle` button created dynamically
   - Click expands/collapses `.resource-item__detail`
   - Mobile: Collapsed by default, Desktop: Expanded by default

2. **Detail Block Structure**
   - `.resource-item__detail-grid` - Multi-column container
   - `.resource-item__detail-block` - Individual field container
   - `.resource-item__detail-label` - Field label
   - `.resource-item__detail-value` - Field value
   - `.resource-item__detail-divider` - Visual separator

3. **Status Badges**
   - `.status-badge--rolling` (🔄) - Application ongoing
   - `.status-badge--open` (✅) - Currently open
   - `.status-badge--closed` (🔒) - Waitlist closed

4. **Mobile Quick Access Pill Bar**
   - `.mobile-qa-pill` - Category shortcuts (⚡, 🏠, 🥗, etc.)
   - Active state tracking on scroll
   - Smooth scroll-to-section on click

5. **JavaScript**
   - ~200 lines of vanilla JS
   - No dependencies
   - Accordion initialization on DOMContentLoaded
   - Scroll event listener for active pill tracking

**File Analyzed:**
- prototype/cook-enhanced/index.html (24 KB HTML)

---

### 3. GENERATION_SCRIPT_TEMPLATE.md
**Purpose:** Complete guide for implementing a county page generation script

**Contents:**
- State configuration file examples (JSON) for all 6 states
- County data structure template
- Resource category mapping (8-9 categories across all states)
- HTML template variables to replace
- Program details data structure
- Generation script pseudocode
- Recommended file organization
- Key takeaways and implementation notes

**File Size:** ~25 KB

**Critical Configurations Included:**
```
Florida Config Structure:
- state_systems (portal name, URL, agencies)
- phone_numbers (SNAP, Medicaid, Unemployment, Utility)
- programs (expanded details for each program type)
- footer_state_links (state-specific footer content)
- crisis_lines
- counties (per-county data like county seat, population, local programs)

Same structure repeated for TX, NY, IL, CA, OH with state-specific values
```

**Template Variables Identified:**
- {{STATE_NAME}}, {{STATE_SLUG}}, {{COUNTY_NAME}}, {{COUNTY_SLUG}}
- {{STATE_PORTAL_NAME}}, {{STATE_PORTAL_URL}}
- {{SNAP_PHONE}}, {{MEDICAID_PHONE}}, {{UNEMPLOYMENT_PHONE}}
- {{SNAP_PROGRAM_NAME}} (SNAP vs CalFresh)
- {{MEDICAID_PROGRAM_NAME}} (Medicaid vs Medi-Cal)
- {{FOOTER_STATE_LINKS}}, {{CRISIS_LINES}}
- {{COUNTY_WEBSITE}}, {{POPULATION}}, {{COUNTY_SEAT}}

---

### 4. DATA_EXTRACTION_INDEX.md (this file)
**Purpose:** Guide to all extracted documents and key findings

---

## Key Findings Summary

### State Portal Landscape

| State | Portal Name | Portal URL | SMS Support | Notes |
|-------|------------|-----------|------------|-------|
| Florida | ACCESS Florida | myflorida.com/accessflorida | Yes (text & phone) | DCF-managed |
| Texas | YourTexasBenefits | yourtexasbenefits.com | Yes | HHSC system, uses 2-1-1 heavily |
| New York | myBenefits.ny.gov | mybenefits.ny.gov | Yes | OTDA portal, Medicaid via separate NY State of Health |
| Illinois | ABE | abe.illinois.gov | Yes | DHS system, most centralized |
| California | BenefitsCal | benefitscal.com | Yes | Most modern UI, unique naming (CalFresh/Medi-Cal) |
| Ohio | benefits.ohio.gov | benefits.ohio.gov | Via 211 | 211 is primary contact method |

### Program Naming Variations

**SNAP Nomenclature:**
- Florida, Texas, NY, Illinois, Ohio: "SNAP" or "SNAP/Food Stamps"
- California: "CalFresh"

**Medicaid Nomenclature:**
- Florida, Texas, NY, Illinois, Ohio: "Medicaid"
- California: "Medi-Cal"

**LIHEAP Nomenclature:**
- Florida: "LIHEAP"
- Texas: "LIHEAP"
- New York: "LIHEAP"
- Illinois: "Help Illinois Families" (LIHEAP)
- California: "LIHEAP"
- Ohio: "LIHEAP"

### Benefit Amounts (where listed)

- New York SNAP: $280/month per person (highest)
- Florida SNAP: $210/month per person
- Texas SNAP: $210/month per person
- California CalFresh: $200+/month per person

### Crisis Hotlines

- **Universal:** 211 (present in all states)
- **Mental Health:** 988 (Texas, some others)
- **County Info:** 311 (Texas Harris County specific)

### Application Processing Times

| State | Standard | Expedited |
|-------|----------|-----------|
| Florida | 30 days | 7 days |
| Texas | 30 days | 7 days |
| New York | Not specified | Not specified |
| Illinois | 30 days | 5 days |
| California | Not specified | Not specified |
| Ohio | Not specified | Not specified |

---

## Generic Structure Identified

### HTML Elements (Reusable)
```
- Navigation bar (same across all pages)
- Hero section with county info card
- Breadcrumb navigation
- Sidebar with quick-access cards
- Resource section containers
- Resource category headers with emojis
- Footer grid (3-column layout)
- Access gate modal for PDF gating
```

### CSS Classes (Reusable)
```
- .nav, .nav__inner, .nav__links, .nav__logo
- .county-hero, .county-hero__left, .county-hero__card
- .resource-section, .resource-category, .resource-item
- .sidebar, .sidebar-card
- .footer, .footer__grid, .footer__brand
- .badge, .btn, .btn--primary, .btn--outline
```

### JavaScript Functionality (Reusable)
```
- Access code checking (local storage, password prompt)
- Mobile pill bar tracking (scroll-based active state)
- Accordion toggles (detail blocks on mobile)
- Smooth scroll to sections
- Event listeners for interactive elements
```

---

## State-Specific Content Identified

### Must-Vary by State
1. Portal name and URL
2. SNAP/food program phone number
3. Medicaid phone number
4. Unemployment system name and URL
5. LIHEAP program name and contact
6. Program naming conventions (SNAP vs CalFresh)
7. Footer state links (3-4 per state)
8. Crisis hotline numbers
9. Agency names and abbreviations

### Can-Vary by County
1. County seat city name
2. Population and region
3. County-specific organizations (housing authorities, food banks)
4. County website URLs
5. Local 211 hotline (if different from state)
6. County-specific programs or initiatives

---

## Recommended Implementation Approach

### Phase 1: Data Architecture
1. Create state config files (6 files: florida.json, texas.json, etc.)
2. Create county data templates
3. Define schema for state and county objects
4. Test with 2-3 counties per state

### Phase 2: Template Development
1. Extract generic template from orange (Florida)
2. Identify all state-specific variables
3. Create template with {{VARIABLE}} placeholders
4. Support both standard and enhanced (accordion) templates

### Phase 3: Script Development
1. Build loader for state/county configs
2. Implement template variable replacement
3. Add resource category generation logic
4. Add footer and breadcrumb generation

### Phase 4: Enhanced Features
1. Port enhanced template features (accordions, pill bar)
2. Test responsive behavior
3. Add detail block generation for programs
4. Implement status badge logic

### Phase 5: Quality Assurance
1. Generate all 6 states × sample counties
2. Test mobile responsiveness
3. Validate SEO metadata (title, description)
4. Verify all portal links and phone numbers
5. Compare generated HTML to manually-created pages

---

## File Organization Recommendation

```
/nationalbenefitalliance/
├── /scripts/
│   ├── generate.js                    (Main generator)
│   ├── config-loader.js               (Load state/county configs)
│   └── template-engine.js             (Variable replacement)
│
├── /config/
│   ├── florida.json                   (State-level config)
│   ├── texas.json
│   ├── new-york.json
│   ├── illinois.json
│   ├── california.json
│   └── ohio.json
│
├── /data/counties/
│   ├── /florida/
│   │   ├── orange.json                (County-level data)
│   │   ├── miami-dade.json
│   │   └── ...67 counties
│   ├── /texas/
│   │   ├── harris.json
│   │   ├── travis.json
│   │   └── ...254 counties
│   └── ...
│
├── /templates/
│   ├── county-page-base.html          (Generic template with variables)
│   ├── county-page-enhanced.html      (With accordion support)
│   └── components/
│       ├── hero.html
│       ├── sidebar.html
│       ├── footer.html
│       └── resource-category.html
│
├── /output/
│   └── [Generated files matching current structure]
│
├── GENERATION_SCRIPT_TEMPLATE.md      (This guide)
├── STATE_PROGRAM_DATA_EXTRACTION.json (Raw data)
└── ENHANCED_TEMPLATE_ANALYSIS.json    (Template details)
```

---

## Next Steps

1. **Review** these three documents with stakeholders
2. **Validate** state configurations against live portals
3. **Create** initial state config files
4. **Extract** county-specific data for 2-3 states
5. **Build** generation script prototype
6. **Test** with 5-10 counties
7. **Iterate** on template based on test results
8. **Scale** to full implementation

---

## Document Cross-References

- **For state-specific data details:** See STATE_PROGRAM_DATA_EXTRACTION.json
- **For template structure and interactivity:** See ENHANCED_TEMPLATE_ANALYSIS.json
- **For implementation guide:** See GENERATION_SCRIPT_TEMPLATE.md

---

## Questions to Clarify

1. Should enhanced template (accordions) be default or opt-in per state?
2. Are all 67 Florida counties, 254 Texas counties, etc. needed immediately, or start with pilot?
3. Should county-specific programs be manually entered or scraped from county websites?
4. Should PDF generation be part of this script or separate system?
5. Update frequency - how often should county data be refreshed?
6. Version control strategy for configs - Git, database, or hybrid?

