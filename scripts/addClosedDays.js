import fs from 'fs';

const data = JSON.parse(fs.readFileSync('src/data.json', 'utf8'));

// 2026 Holidays
const holidays = {
  nyd26: "2026-01-01",
  mlk26: "2026-01-19",
  pres26: "2026-02-16",
  stpat26: "2026-03-14",
  easter26: "2026-04-05",
  memorial26: "2026-05-25",
  juneteenth26: "2026-06-19",
  july4: "2026-07-04",
  labor26: "2026-09-07",
  indig26: "2026-10-12",
  vet26: "2026-11-11",
  thanksgiving26: "2026-11-26",
  blackfriday26: "2026-11-27",
  christmaseve26: "2026-12-24",
  christmas26: "2026-12-25",
  nye26: "2026-12-31",
  nyd27: "2027-01-01"
};
const major = [holidays.thanksgiving26, holidays.christmas26, holidays.nyd26, holidays.nyd27];
const allMajor = [holidays.thanksgiving26, holidays.christmas26, holidays.nyd26, holidays.nyd27, holidays.july4, holidays.memorial26, holidays.labor26];

// Helper to generate dates between start and end that fall on specific weekdays excluding certain ranges
function generateDates(start, end, weekdays, excludeRanges) {
  const dates = [];
  let curr = new Date(start);
  const endDate = new Date(end);
  while (curr <= endDate) {
    const day = curr.getDay(); // 0 = Sun, 2 = Tue, 4 = Thu
    if (weekdays.includes(day)) {
      let exclude = false;
      for (const range of excludeRanges) {
        if (curr >= new Date(range.start) && curr <= new Date(range.end)) { exclude = true; break; }
      }
      if (!exclude) {
        const y = curr.getFullYear();
        const m = String(curr.getMonth() + 1).padStart(2, '0');
        const d = String(curr.getDate()).padStart(2, '0');
        dates.push(`${y}-${m}-${d}`);
      }
    }
    curr.setDate(curr.getDate() + 1);
  }
  return dates;
}

const adlerBreaks = [
  { start: "2025-11-24", end: "2025-11-28" },
  { start: "2025-12-22", end: "2026-01-02" },
  { start: "2026-03-23", end: "2026-04-03" },
  { start: "2026-11-23", end: "2026-11-27" },
  { start: "2026-12-21", end: "2027-01-01" },
  { start: "2027-03-22", end: "2027-04-02" },
];
const adlerTuesThurs25_26 = generateDates("2025-10-07", "2026-05-21", [2, 4], adlerBreaks);
const adlerTuesThurs26_27 = generateDates("2026-10-07", "2027-05-21", [2, 4], adlerBreaks);
const adlerSpecific = [holidays.thanksgiving26, holidays.christmas26, "2026-02-25", "2026-09-19"];

const museumData = {
  "aic": { days: major, rec: [] },
  "field": { days: [holidays.thanksgiving26, holidays.christmas26], rec: [] },
  "shedd": { days: [], rec: [] },
  "msi": { days: [holidays.thanksgiving26, holidays.christmas26], rec: [] },
  "adler": { days: [...new Set([...adlerSpecific, ...adlerTuesThurs25_26, ...adlerTuesThurs26_27])].sort(), rec: [] },
  "lpz": { days: [], rec: [] },
  
  "nmma": { days: [holidays.nyd26, holidays.mlk26, holidays.memorial26, holidays.juneteenth26, holidays.july4, holidays.labor26, holidays.indig26, holidays.thanksgiving26, holidays.christmas26], rec: ["Monday"] },
  "mca": { days: major, rec: ["Monday"] },
  "history": { days: major, rec: ["Monday"] },
  "gpc": { days: [holidays.christmas26], rec: ["Monday", "Tuesday"] },
  "smart": { days: allMajor, rec: ["Monday"] },
  "dusable": { days: allMajor, rec: ["Monday"] },
  "nature": { days: [holidays.thanksgiving26, holidays.christmas26], rec: [] },
  "driehaus": { days: [holidays.nyd26, holidays.easter26, holidays.juneteenth26, holidays.july4, holidays.thanksgiving26, holidays.christmaseve26, holidays.christmas26], rec: ["Monday", "Tuesday"] },
  "puerto": { days: allMajor, rec: ["Sunday", "Monday"] },
  "intuit": { days: major, rec: ["Monday", "Tuesday"] },
  
  "luma": { days: allMajor, rec: ["Sunday", "Monday", "Tuesday"] },
  "photog": { days: major, rec: ["Sunday"] },
  "holocaust": { days: [holidays.nyd26, holidays.thanksgiving26, holidays.christmaseve26, holidays.christmas26], rec: [] },
  "writers": { days: major, rec: ["Monday"] },
  "ccc": { days: [holidays.nyd26, holidays.stpat26, holidays.memorial26, holidays.july4, holidays.labor26, holidays.thanksgiving26, holidays.christmas26], rec: [] },
  "poetry": { days: [], rec: ["Sunday", "Monday", "Tuesday"] },
  "chinese": { days: [holidays.thanksgiving26, holidays.christmas26, holidays.nyd26, "2026-01-02", "2026-01-03", "2026-01-04", "2026-01-05"], rec: ["Monday", "Tuesday", "Thursday"] },
  "polish": { days: allMajor, rec: ["Monday", "Wednesday", "Friday"] },
  "swedish": { days: [holidays.nyd26, holidays.easter26, holidays.memorial26, holidays.july4, holidays.labor26, holidays.thanksgiving26, holidays.christmaseve26, holidays.christmas26, holidays.nye26], rec: ["Monday"] },
  "hellenic": { days: [holidays.nyd26, holidays.easter26, holidays.juneteenth26, holidays.july4, holidays.thanksgiving26, holidays.blackfriday26, holidays.christmaseve26, holidays.christmas26, holidays.nye26], rec: ["Monday", "Tuesday", "Wednesday"] },

  "irish": { days: major, rec: ["Monday"] },
  "surgical": { days: [holidays.nye26, holidays.nyd26, holidays.easter26, holidays.memorial26, holidays.july4, holidays.labor26, holidays.thanksgiving26, holidays.christmaseve26, holidays.christmas26], rec: [] },
  "maritime": { days: [holidays.thanksgiving26, holidays.blackfriday26, holidays.christmaseve26, holidays.christmas26, holidays.nye26, holidays.nyd26], rec: ["Monday"] },
  "pritzker": { days: [], rec: ["Sunday", "Monday", "Tuesday", "Wednesday"] },
  "broadcast": { days: major, rec: ["Monday"] },
  "buttons": { days: [], rec: ["Saturday", "Sunday"] },
  "leather": { days: [], rec: ["Monday", "Tuesday", "Wednesday"] },
  "bronzeville": { days: [], rec: ["Sunday", "Monday", "Tuesday"] },
  "kids": { days: major, rec: ["Tuesday"] },
  "brookfield": { days: [holidays.thanksgiving26, holidays.christmas26], rec: [] },

  "botanic": { days: [], rec: [] },
  "morton": { days: [holidays.thanksgiving26, holidays.christmas26], rec: [] },
  "lpc": { days: [], rec: ["Monday", "Tuesday"] },
  "cac": { days: major, rec: [] },
  "robie": { days: [holidays.thanksgiving26, holidays.christmaseve26, holidays.christmas26, holidays.nye26, holidays.nyd26, "2026-01-02"], rec: ["Tuesday", "Wednesday"] },
  "uima": { days: [], rec: ["Monday", "Tuesday"] },
  "depaul": { days: major, rec: ["Monday", "Tuesday"] },
  "wwood": { days: [], rec: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"] },
  "design": { days: [holidays.nyd26, holidays.stpat26, holidays.memorial26, holidays.july4, holidays.labor26, holidays.thanksgiving26, holidays.christmas26], rec: [] },
  "glessner": { days: [holidays.nyd26, holidays.mlk26, holidays.pres26, holidays.easter26, holidays.memorial26, holidays.juneteenth26, holidays.july4, holidays.labor26, holidays.indig26, holidays.vet26, holidays.thanksgiving26, holidays.christmaseve26, holidays.christmas26], rec: ["Sunday", "Monday", "Tuesday", "Thursday"] },

  "jane": { days: [holidays.thanksgiving26, holidays.christmaseve26, holidays.christmas26, holidays.nye26, holidays.nyd26], rec: ["Sunday", "Monday"] },
  "pullman": { days: major, rec: ["Monday", "Tuesday"] },
  "randolph": { days: [], rec: ["Saturday", "Sunday"] },
  "oriental": { days: major, rec: ["Monday"] },
};

data.forEach(m => {
  const d = museumData[m.id];
  m.closedDays = d ? d.days : [];
  m.closedRecurring = d ? d.rec : [];
});

fs.writeFileSync('src/data.json', JSON.stringify(data, null, 2));
console.log("Updated data.json for all 50 museums");
