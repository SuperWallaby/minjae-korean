const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const slots = [
  {
    id: "s-1",
    dateKey: "2026-02-10",
    startMin: 9 * 60,
    endMin: 10 * 60,
    capacity: 1,
    bookedCount: 0,
  },
  {
    id: "s-2",
    dateKey: "2026-02-11",
    startMin: 14 * 60,
    endMin: 15 * 60,
    capacity: 1,
    bookedCount: 0,
  },
];

fs.writeFileSync(path.join(DATA_DIR, "slots.json"), JSON.stringify(slots, null, 2), "utf-8");
fs.writeFileSync(path.join(DATA_DIR, "bookings.json"), JSON.stringify([], null, 2), "utf-8");
console.log("Seeded sample data to data/slots.json and data/bookings.json");

