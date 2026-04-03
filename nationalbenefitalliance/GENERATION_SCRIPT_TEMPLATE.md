# County Page Generation Script - Data Structure & Configuration

## Overview
This document provides the template structure and data organization needed to programmatically generate county pages for all states.

## Key Findings from Extracted Data

### Generic vs State-Specific Content

**GENERIC (Same across all states/counties):**
- HTML structure and layout
- CSS classes and styling
- Navigation bar
- Breadcrumb navigation pattern
- Sidebar card structure
- Footer brand/logo section
- Hero section layout
- Resource category icons and headers (⚡, 🏠, 🥗, 🏥, 💼, 👴, ♿, 👶, 🤝)
- JavaScript functionality
- Icon emoji set

**STATE-SPECIFIC (Varies by state):**
- State benefits portal name and URL
- Program naming (SNAP vs CalFresh, Medicaid vs Medi-Cal)
- Phone numbers for central intake
- Specific program descriptions and eligibility rules
- Footer state-specific resource links
- Crisis hotlines (211, 988, 311)
- Application windows and processing times
- Benefit amounts
- County-specific organizations and contacts

---

## State Configuration Files

Each state needs a JSON configuration file that feeds into the template generator.

### Florida Configuration Example
```json
{
  "state": "florida",
  "state_name": "Florida",
  "state_slug": "florida",
  "state_tagline": "The Sunshine State",
  "total_counties": 67,

  "state_systems": {
    "primary_portal": "ACCESS Florida",
    "portal_url": "https://www.myflorida.com/accessflorida",
    "primary_agency": "Florida Department of Children and Families (DCF)",
    "unemployment_system": "CONNECT",
    "unemployment_url": "https://connect.myflorida.com"
  },

  "phone_numbers": {
    "snap": "1-866-762-2237",
    "medicaid": "1-800-610-8301",
    "unemployment": "1-833-352-6362",
    "utility_assistance": "1-800-375-4357",
    "general_211": "211"
  },

  "programs": {
    "snap": {
      "name": "Florida SNAP Benefits",
      "name_variant": "food stamps",
      "portal": "ACCESS Florida",
      "portal_url": "https://www.myflorida.com/accessflorida",
      "phone": "1-866-762-2237",
      "application_time": "30 days (7 days expedited)",
      "benefit_average": "$210/month per person",
      "application_method": "Online or DCF ACCESS Service Center",
      "agency": "Florida Department of Children and Families"
    },
    "medicaid": {
      "name": "Florida Medicaid",
      "portal": "ACCESS Florida",
      "portal_url": "https://www.myflorida.com/accessflorida",
      "phone": "1-800-610-8301",
      "application_method": "Online or DCF Service Center"
    },
    "wic": {
      "name": "WIC - Women, Infants & Children",
      "phone": "1-800-447-2229",
      "website": "https://www.floridahealth.gov/programs-and-services/wic/",
      "agency": "Florida Department of Health"
    },
    "childcare": {
      "name": "Florida Child Care Resource & Referral",
      "phone": "1-866-537-2686",
      "website": "https://www.myflorida.com/childcare"
    },
    "liheap": {
      "name": "LIHEAP - Low Income Home Energy Assistance",
      "phone": "1-800-375-4357",
      "website": "https://www.fpl.com/assistance"
    },
    "unemployment": {
      "name": "Florida Reemployment Assistance",
      "system": "CONNECT",
      "portal_url": "https://connect.myflorida.com",
      "phone": "1-833-352-6362"
    }
  },

  "footer_state_links": [
    {
      "title": "All Florida Counties",
      "url": "/florida/"
    },
    {
      "title": "ACCESS Florida (DCF)",
      "url": "https://www.myflorida.com/accessflorida"
    },
    {
      "title": "Reemployment Assistance",
      "url": "https://connect.myflorida.com"
    }
  ],

  "crisis_lines": [
    {
      "name": "General Crisis & Referral",
      "number": "211",
      "description": "Dial 211 for local emergency assistance and referrals"
    }
  ],

  "counties": {
    "orange": {
      "name": "Orange",
      "county_seat": "Orlando",
      "population": "1,429,908",
      "region": "Central Florida",
      "slug": "orange",
      "local_211": "211",
      "county_website": "https://www.orangecountyfl.net",
      "county_programs": [
        {
          "name": "Orange County Community Vital Services",
          "category": "utility",
          "phone": "(407) 835-0900",
          "website": "https://www.orangecountyfl.net/communityenvironment"
        },
        {
          "name": "Orange County Housing Authority",
          "category": "housing",
          "phone": "(407) 894-0014",
          "website": "https://www.ocfl.net/housing"
        }
      ]
    }
  }
}
```

### Texas Configuration Example
```json
{
  "state": "texas",
  "state_name": "Texas",
  "state_slug": "texas",

  "state_systems": {
    "primary_portal": "YourTexasBenefits",
    "portal_url": "https://yourtexasbenefits.com",
    "primary_agency": "Texas HHSC (Health & Human Services Commission)",
    "2_1_1_system": true
  },

  "phone_numbers": {
    "snap": "2-1-1",
    "medicaid": "2-1-1",
    "unemployment": "1-800-939-6631",
    "utility_assistance": "1-877-399-8939",
    "general_211": "211"
  },

  "programs": {
    "snap": {
      "name": "Texas SNAP (Food Assistance)",
      "portal": "YourTexasBenefits",
      "portal_url": "https://yourtexasbenefits.com",
      "phone": "2-1-1",
      "application_time": "30 days (7 days expedited)"
    },
    "medicaid": {
      "name": "Texas Medicaid",
      "portal": "YourTexasBenefits",
      "portal_url": "https://yourtexasbenefits.com",
      "phone": "2-1-1"
    }
  },

  "crisis_lines": [
    {
      "name": "General Crisis & Referral",
      "number": "211",
      "description": "211 Texas"
    },
    {
      "name": "Mental Health Crisis",
      "number": "988"
    },
    {
      "name": "County Information",
      "number": "311"
    }
  ]
}
```

### Illinois Configuration Example
```json
{
  "state": "illinois",
  "state_name": "Illinois",
  "state_slug": "illinois",

  "state_systems": {
    "primary_portal": "ABE (Application for Benefits Eligibility)",
    "portal_url": "https://abe.illinois.gov",
    "primary_agency": "Illinois Department of Human Services (DHS)",
    "unemployment_system": "IDES",
    "unemployment_url": "https://ides.illinois.gov"
  },

  "phone_numbers": {
    "snap": "1-800-843-6154",
    "medicaid": "1-866-468-7543",
    "unemployment": "1-866-IDES-101",
    "utility_assistance": "1-833-711-0374"
  },

  "programs": {
    "snap": {
      "name": "Illinois SNAP / Food Stamps",
      "portal": "ABE",
      "portal_url": "https://abe.illinois.gov",
      "phone": "1-800-843-6154",
      "application_time": "30 days (5 days expedited)"
    },
    "liheap": {
      "name": "Help Illinois Families",
      "phone": "1-833-711-0374",
      "website": "https://helpillinoisfamilies.com",
      "application_window": "November - April (seasonal)"
    }
  },

  "footer_state_links": [
    {
      "title": "All Illinois Counties",
      "url": "/illinois/"
    },
    {
      "title": "ABE Benefits Portal (DHS)",
      "url": "https://abe.illinois.gov"
    },
    {
      "title": "IDES Unemployment",
      "url": "https://ides.illinois.gov"
    }
  ]
}
```

### California Configuration Example
```json
{
  "state": "california",
  "state_name": "California",
  "state_slug": "california",

  "state_systems": {
    "primary_portal": "BenefitsCal",
    "portal_url": "https://www.benefitscal.com",
    "primary_agency": "California Department of Social Services (CDSS)"
  },

  "program_name_variations": {
    "snap": "CalFresh",
    "medicaid": "Medi-Cal"
  },

  "phone_numbers": {
    "calfresh": "1-877-847-3663",
    "medi_cal": "1-800-541-5555",
    "unemployment": "1-888-353-8955"
  },

  "programs": {
    "calfresh": {
      "name": "CalFresh - California Food Assistance (SNAP)",
      "portal": "BenefitsCal",
      "portal_url": "https://www.benefitscal.com",
      "phone": "1-877-847-3663",
      "benefit_average": "$200+/month per person"
    },
    "medi_cal": {
      "name": "Medi-Cal - California Medicaid Health Coverage",
      "portal": "BenefitsCal",
      "portal_url": "https://www.benefitscal.com",
      "phone": "1-800-541-5555"
    }
  }
}
```

### New York Configuration Example
```json
{
  "state": "new_york",
  "state_name": "New York",
  "state_slug": "new-york",

  "state_systems": {
    "primary_portal": "myBenefits.ny.gov",
    "portal_url": "https://mybenefits.ny.gov",
    "primary_agency": "OTDA (Office of Temporary and Disability Assistance)",
    "health_marketplace": "NY State of Health",
    "health_marketplace_url": "https://nystateofhealth.ny.gov"
  },

  "phone_numbers": {
    "general_portal": "myBenefits.ny.gov (portal-driven)",
    "unemployment": "NY Department of Labor"
  },

  "programs": {
    "snap": {
      "name": "NY SNAP (Food Stamps)",
      "portal": "myBenefits.ny.gov",
      "portal_url": "https://mybenefits.ny.gov",
      "benefit_average": "$280/month per person"
    },
    "medicaid": {
      "name": "NY Medicaid",
      "portal": "NY State of Health",
      "portal_url": "https://nystateofhealth.ny.gov"
    }
  },

  "footer_state_links": [
    {
      "title": "myBenefits NY (OTDA)",
      "url": "https://mybenefits.ny.gov"
    },
    {
      "title": "NY Dept of Labor",
      "url": "https://dol.ny.gov"
    }
  ]
}
```

### Ohio Configuration Example
```json
{
  "state": "ohio",
  "state_name": "Ohio",
  "state_slug": "ohio",

  "state_systems": {
    "primary_portal": "benefits.ohio.gov",
    "portal_url": "https://benefits.ohio.gov",
    "primary_agency": "Ohio JFS (Department of Job & Family Services)"
  },

  "phone_numbers": {
    "general_211": "211 (Dial 211 for most services)"
  },

  "programs": {
    "snap": {
      "name": "Ohio SNAP Benefits",
      "portal": "benefits.ohio.gov",
      "portal_url": "https://benefits.ohio.gov",
      "phone": "211"
    },
    "liheap": {
      "name": "LIHEAP - Low Income Home Energy Assistance",
      "phone": "211",
      "website": "https://jfs.ohio.gov/ocomm/HEAP.stm"
    }
  }
}
```

---

## Resource Category Mapping

All states use the same 8-9 resource categories with generic structure:

```
1. ⚡ Utility Assistance
   - LIHEAP (primary - varies by state name)
   - Emergency utility programs
   - 211 referrals

2. 🏠 Housing & Rental Assistance
   - Emergency rental assistance
   - Section 8 housing choice vouchers
   - HUD programs
   - Eviction prevention

3. 🥗 Food Assistance
   - SNAP / CalFresh / Food Stamps (name varies by state)
   - WIC (Women, Infants & Children)
   - Food banks & pantries

4. 🏥 Healthcare & Medicaid
   - Medicaid / Medi-Cal (name varies)
   - Community health centers
   - State health insurance marketplaces

5. 💼 Employment & Unemployment
   - Unemployment insurance (system varies by state)
   - Job training programs
   - American Job Centers

6. 👴 Senior Services
   - Senior-specific programs
   - Older Americans Act programs

7. ♿ Disability Services
   - SSI/SSDI information
   - Disability-specific resources

8. 👶 Child Care & Education
   - Child care assistance
   - Head Start programs

9. 🤝 Community & Crisis Services (Some states)
   - Crisis intervention
   - Emergency assistance
   - Salvation Army, etc.

(Optional state-specific additions):
   - ⚖️ Legal Aid (Texas, some others)
   - 🚌 Transportation (Texas)
```

---

## HTML Template Variables

Replace these variables in the base template with values from the state/county config:

```
Global (per page):
- {{STATE_NAME}} → "Florida", "Texas", etc.
- {{STATE_SLUG}} → "florida", "texas", etc.
- {{COUNTY_NAME}} → "Orange", "Harris", etc.
- {{COUNTY_SLUG}} → "orange", "harris", etc.
- {{COUNTY_SEAT}} → "Orlando", "Houston", etc.
- {{POPULATION}} → "1,429,908"
- {{REGION}} → "Central Florida"

State-Specific:
- {{STATE_PORTAL_NAME}} → "ACCESS Florida", "YourTexasBenefits", etc.
- {{STATE_PORTAL_URL}} → "https://www.myflorida.com/accessflorida", etc.
- {{SNAP_PHONE}} → "1-866-762-2237", "2-1-1", etc.
- {{MEDICAID_PHONE}} → "1-800-610-8301", "2-1-1", etc.
- {{SNAP_PROGRAM_NAME}} → "SNAP", "CalFresh", etc.
- {{MEDICAID_PROGRAM_NAME}} → "Medicaid", "Medi-Cal", etc.

Footer:
- {{FOOTER_STATE_LINKS}} → HTML list of 3-4 state-specific links
- {{FOOTER_SECTION_TITLE}} → "Florida Resources", "Texas Resources", etc.

County-Specific:
- {{COUNTY_WEBSITE}} → "https://www.orangecountyfl.net"
- {{LOCAL_211}} → "Dial 211" or county-specific number
```

---

## Program Details Data Structure (for Enhanced Template)

If implementing the enhanced template with detail blocks:

```json
{
  "program": {
    "id": "utility-liheap",
    "name": "LIHEAP - Low Income Home Energy Assistance",
    "category": "utility",
    "short_description": "Federally funded heating and cooling bill assistance",

    "details": {
      "application_period": {
        "label": "Application Period",
        "value": "November - April (seasonal window)",
        "status_badge": "rolling" // or "open" or "closed"
      },
      "eligibility": {
        "label": "Eligibility",
        "value": "Income at or below 150% of federal poverty level",
        "income_examples": {
          "1_person": "$2,267/month",
          "4_people": "$4,647/month"
        }
      },
      "documents_needed": {
        "label": "Documents Needed",
        "items": [
          "Proof of income (pay stub, benefits letter, tax return)",
          "Proof of residency (utility bill, lease, mortgage)",
          "Proof of citizenship or eligible immigrant status",
          "Social Security numbers"
        ]
      },
      "how_to_apply": {
        "label": "How to Apply",
        "methods": [
          {
            "type": "online",
            "url": "https://helpillinoisfamilies.com",
            "label": "Online Portal"
          },
          {
            "type": "phone",
            "number": "1-833-711-0374",
            "label": "Phone"
          },
          {
            "type": "in_person",
            "location": "Local DHS office",
            "label": "In-Person"
          }
        ]
      }
    },

    "contact": {
      "phone": "1-833-711-0374",
      "website": "https://helpillinoisfamilies.com",
      "agency": "Illinois Department of Human Services"
    }
  }
}
```

---

## Generation Script Pseudocode

```javascript
// Pseudocode for county page generation script

function generateCountyPage(state, county) {
  // 1. Load state config
  const stateConfig = loadStateConfig(state); // e.g., florida.json

  // 2. Load county config
  const countyConfig = loadCountyConfig(state, county);

  // 3. Merge configs (county overrides state defaults)
  const pageData = merge(stateConfig, countyConfig);

  // 4. Load base template
  const template = loadTemplate('county-page-base.html');

  // 5. Replace all template variables
  let html = template;
  html = html.replace(/{{STATE_NAME}}/g, pageData.state_name);
  html = html.replace(/{{COUNTY_NAME}}/g, pageData.county_name);
  html = html.replace(/{{STATE_PORTAL_NAME}}/g, pageData.state_portal);
  html = html.replace(/{{STATE_PORTAL_URL}}/g, pageData.state_portal_url);
  // ... etc for all variables

  // 6. Generate resource category sections
  for (const category of pageData.resource_categories) {
    const categoryHtml = generateResourceCategory(category, pageData);
    html = html.replace(/{{RESOURCE_CATEGORIES}}/g, html + categoryHtml);
  }

  // 7. Generate footer links
  const footerHtml = generateFooter(pageData.footer_state_links);
  html = html.replace(/{{FOOTER_LINKS}}/g, footerHtml);

  // 8. Generate breadcrumb
  const breadcrumbHtml = generateBreadcrumb(state, county);
  html = html.replace(/{{BREADCRUMB}}/g, breadcrumbHtml);

  // 9. Write output file
  const outputPath = `${state}/${county}/index.html`;
  writeFile(outputPath, html);

  // 10. Generate SEO metadata
  const metaDescription = `Free government benefits and assistance programs for ${county} County, ${pageData.state_name}. Find SNAP, Medicaid, housing help, utility assistance, unemployment, and more.`;
  const title = `${county} County ${pageData.state_name} | Free Benefits & Resources – National Benefit Alliance`;

  html = html.replace(/{{META_DESCRIPTION}}/g, metaDescription);
  html = html.replace(/{{PAGE_TITLE}}/g, title);

  return html;
}
```

---

## File Organization

```
/nationalbenefitalliance/
├── /templates/
│   └── county-page-base.html          (Generic template)
│
├── /config/
│   ├── florida.json
│   ├── texas.json
│   ├── new-york.json
│   ├── illinois.json
│   ├── california.json
│   └── ohio.json
│
├── /data/
│   ├── /florida/
│   │   ├── orange.json
│   │   ├── miami-dade.json
│   │   └── ...
│   ├── /texas/
│   │   ├── harris.json
│   │   ├── travis.json
│   │   └── ...
│   └── ...
│
├── /output/
│   ├── /florida/
│   │   ├── /orange/
│   │   │   └── index.html
│   │   └── ...
│   └── ...
│
├── generate.js                         (Main generation script)
└── README.md
```

---

## Key Takeaways

1. **All states share ~90% of HTML/CSS structure** - Only data differs
2. **State portals are critical** - Each state has ONE primary benefits portal (sometimes with variations)
3. **Phone numbers vary by program** - Need lookup table per state
4. **Program names vary** - SNAP vs CalFresh, Medicaid vs Medi-Cal (California is unique)
5. **Footer links are state-specific** - 3-4 key resources per state
6. **Crisis lines vary** - 211 universal, but 988 and 311 added for some states
7. **Enhanced template is additive** - Can be applied to any state without changes
8. **County programs layer on top** - County-specific org details added to standard template

