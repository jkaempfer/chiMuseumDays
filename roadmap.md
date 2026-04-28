https://chimuseumdays.jkaempfer.workers.dev/

<< CHICAGO FREE MUSEUM FINDER: STRATEGIC ROADMAP >>

*** PRIORITY 1: PERSONALIZATION & INTELLIGENCE ***

<< AI CONCIERGE (CHAT) >>: A mini-chat interface powered by Gemini 2.5 Flash.

Function: Handles complex queries like "family of five with an interest in art" or "near the Loop and free today."

Technical Implementation: App sends the full museum context (name, type, neighborhood, kid-friendliness) to the model, which returns structured JSON IDs to filter the UI.

Cost Management: Utilizes Google's Free Tier (approx. 15 requests/min). Scaling beyond this requires a developer-paid API key.

<< WEIGHTED SORTING LOGIC >>: Ensure high-value content appears first to avoid alphabetical oddities (e.g., "Busy Beaver" at the top).

MUST SEE: Institutions with mustSee: TRUE always float to the top (Art Institute, Field, etc.).

FREE STATUS: Today's Free > Conditional Free > Paid.

ALPHABETICAL: Only used as a final tie-breaker.

*** PRIORITY 2: GEOGRAPHIC & LOGIC ACCURACY ***

<< "DOWNTOWN" FILTER >>: Add a quick-toggle to filter museums specifically in The Loop/River North for tourists with limited mobility.

<< "CLOSED NOW" STATUS >>: Implement a check against current time vs. museum hours to prevent visitors from arriving at closed doors.

<< ENHANCED SEARCH >>: Allow search to index neighborhood, description tags, and "vibe" (e.g., searching "architecture").

*** PRIORITY 3: AUDIENCE-SPECIFIC FEATURES ***

<< ELIGIBILITY BADGES >>: Add toggles for specific "always free" groups:

Military/Veterans

Educators (IL Teachers)

Students (University-affiliated)

EBT/WIC cardholders (Museums for All)

<< ILLINOIS RESIDENT TOGGLE >>: A global switch to hide/show non-resident pricing and highlight residency-only free dates.

*** PRIORITY 4: ENGAGEMENT & OUTREACH ***

<< EMAIL/TEXT NOTIFICATIONS >>: Allow users to "Follow" a museum and get a ping when a new free day is added to the CSV.

<< WEEKLY WEEKEND SUGGESTIONS >>: A "What to do this weekend" automated roundup sent every Thursday, highlighting the best value picks.

<< CALENDAR EXPORT >>: A button to add specific "CHECK FREE" dates directly to a user's Google or Apple Calendar.

*** PRIORITY 5: VISUAL & UX UPGRADES ***

<< INTERACTIVE MAP >>: Integrate Mapbox or Google Maps to show color-coded pins (Free vs. Paid today) for easier route planning.

<< PWA SUPPORT >>: Allow users to "Add to Home Screen" to use the site like a native app without an app store download.

<< TRANSIT & NAVIGATION >>: Nearest "L" stop integration and direct "Directions" links that default to public transit.

*** PRIORITY 6: DATA MANAGEMENT ***

<< AUTOMATED REVIEW SCRAPER >>: Update rating and reviewCount weekly via a lightweight script to keep "Popularity" data fresh.

<< OFFICIAL LINK VERIFICATION >>: Automated 404 checking for museum admission pages to ensure "View Site" links never break.

Sort by price