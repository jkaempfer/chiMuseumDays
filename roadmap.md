<< CHICAGO FREE MUSEUM FINDER: STRATEGIC ROADMAP >>

*** PRIORITY 1: PERSONALIZATION & INTELLIGENCE ***

<< AI CONCIERGE (CHAT) >>: A mini-chat interface powered by Gemini 2.5 Flash.

Function: Handles complex queries like "family of five with an interest in art" or "near the Loop and free today."

Technical Implementation: App sends the full museum context (name, type, neighborhood, kid-friendliness) to the model, which returns structured JSON IDs to filter the UI.

Cost Management: Utilizes Google's Free Tier (approx. 15 requests/min). Scaling beyond this requires a developer-paid API key.

<< WEIGHTED SORTING LOGIC >>: Move away from simple alphabetical sorting to a "Relevance Score":

MUST SEE: Institutions with mustSee: TRUE always float to the top.

FREE STATUS: Today's Free > Conditional Free > Paid.

ALPHABETICAL: Only used as a final tie-breaker.

*** PRIORITY 2: GEOGRAPHIC & LOGIC ACCURACY ***

<< "DOWNTOWN" FILTER >>: Add a quick-toggle to filter museums specifically in The Loop/River North.

<< "CLOSED NOW" STATUS >>: Implement a check against current time vs. museum hours (requires new openingHours column in CSV).

<< ENHANCED SEARCH >>: Allow search to index neighborhood and description tags.

*** PRIORITY 3: AUDIENCE-SPECIFIC FEATURES ***

<< ELIGIBILITY BADGES >>: Add toggles for specific "always free" groups:

Military/Veterans

Educators (IL Teachers)

Students (UChicago, DePaul, etc.)

EBT/WIC cardholders (Museums for All)

<< ILLINOIS RESIDENT TOGGLE >>: A global switch to hide/show non-resident pricing.

*** PRIORITY 4: VISUAL & UX UPGRADES ***

<< INTERACTIVE MAP >>: Integrate Mapbox or Google Maps to show color-coded pins (Free vs. Paid today).

<< PWA SUPPORT >>: Allow users to "Add to Home Screen" to use the site like a native app.

<< TRANSIT & NAVIGATION >>: Nearest "L" stop and direct "Directions" links that default to public transit.

*** PRIORITY 5: DATA MANAGEMENT ***

<< AUTOMATED REVIEW SCRAPER >>: Update rating and reviewCount weekly via a lightweight script.

<< OFFICIAL LINK VERIFICATION >>: Automated 404 checking for museum admission pages.