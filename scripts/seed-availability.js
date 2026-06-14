/**
 * seed-availability.js
 * -------------------
 * One-shot seeder: populates `available` for any doctor whose schedule is
 * empty, using a default Mon-Fri 09-15 + Sat 09-11 schedule. Sun closed.
 *
 *   $ node scripts/seed-availability.js
 *
 * Idempotent: skips doctors that already have a non-empty `available`.
 */

const mongoose = require("mongoose");
const { Doctor } = require("../db/models/doctor");
const connectDB = require("../db/index");
const config = require("../config/prod.json");

const DEFAULT_AVAILABILITY = {
  Mon: ["09:00", "10:00", "11:00", "14:00", "15:00"],
  Tue: ["09:00", "10:00", "11:00", "14:00", "15:00"],
  Wed: ["09:00", "10:00", "11:00", "14:00", "15:00"],
  Thu: ["09:00", "10:00", "11:00", "14:00", "15:00"],
  Fri: ["09:00", "10:00", "11:00", "14:00", "15:00"],
  Sat: ["09:00", "10:00", "11:00"],
  Sun: []
};

const hasAnySlots = (available) => {
  if (!available || typeof available !== "object") return false;
  return Object.values(available).some(
    (slots) => Array.isArray(slots) && slots.length > 0
  );
};

const run = async () => {
  await connectDB();
  const doctors = await Doctor.find({ isDeleted: false });
  let seeded = 0;
  let skipped = 0;
  for (const d of doctors) {
    if (hasAnySlots(d.available)) {
      skipped += 1;
      continue;
    }
    d.available = { ...DEFAULT_AVAILABILITY };
    await d.save();
    seeded += 1;
  }
  // eslint-disable-next-line no-console
  console.log(
    `seed-availability: total=${doctors.length} seeded=${seeded} skipped=${skipped}`
  );
  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("seed-availability failed:", err);
  process.exit(1);
});
