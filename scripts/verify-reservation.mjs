import { chromium } from "playwright";

const URL = process.env.SITE_URL || "https://vipcocobeach.com";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } }); // phone-size
await page.goto(URL, { waitUntil: "networkidle" });

// Scroll the reservation form into view
await page.evaluate(() => document.getElementById("reserver")?.scrollIntoView());
await page.waitForTimeout(800);

// Helper: set the adults <select> (the one that has an option value "15")
async function setAdults(n) {
  await page.evaluate((val) => {
    const selects = [...document.getElementById("reserver").querySelectorAll("select")];
    const adultsSel = selects.find((s) => [...s.options].some((o) => o.value === "15"));
    const setter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, "value").set;
    setter.call(adultsSel, String(val));
    adultsSel.dispatchEvent(new Event("change", { bubbles: true }));
  }, n);
  await page.waitForTimeout(400);
}

// Helper: read forfait cards — name + whether locked (lock reason text present)
async function readForfaits() {
  return await page.evaluate(() => {
    const names = ["Parasol", "Cabane Sable", "Paillote VIP 1ère Position", "Paillote"];
    const region = document.getElementById("reserver");
    const text = region.innerText;
    // crude per-card detection: find each name's line and look for a lock reason nearby
    const out = {};
    const lockPhrases = ["À partir de", "Jusqu'à"];
    // walk elements containing exactly a forfait name
    const cards = [...region.querySelectorAll("button, div, label")].filter((el) => {
      const t = (el.innerText || "").trim();
      return names.some((n) => t.includes(n)) && t.length < 120;
    });
    for (const n of names) {
      const card = cards.find((c) => c.innerText.includes(n));
      if (!card) { out[n] = "NOT FOUND"; continue; }
      const t = card.innerText.replace(/\n/g, " ");
      const locked = lockPhrases.some((p) => t.includes(p)) ||
        card.getAttribute("aria-disabled") === "true" ||
        getComputedStyle(card).pointerEvents === "none" ||
        parseFloat(getComputedStyle(card).opacity) < 0.7;
      out[n] = locked ? `LOCKED — "${t}"` : `available — "${t}"`;
    }
    return out;
  });
}

console.log("=== adults = 2 (expect only Parasol available) ===");
await setAdults(2);
console.log(await readForfaits());

console.log("\n=== adults = 4 (expect Parasol + Cabane Sable) ===");
await setAdults(4);
console.log(await readForfaits());

console.log("\n=== adults = 5 (expect Cabane + Paillote + Paillote VIP; Parasol locked) ===");
await setAdults(5);
console.log(await readForfaits());

await page.screenshot({ path: "scripts/reservation-5adults.png", fullPage: false });
console.log("\nscreenshot → scripts/reservation-5adults.png");

await browser.close();
