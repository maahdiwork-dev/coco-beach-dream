import { chromium } from "playwright";

const URL = process.env.SITE_URL || "https://vipcocobeach.com";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } }); // phone-size
await page.goto(URL, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(3500); // let React render + content load

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

// Helper: read the Forfait <select> options — label + disabled state
async function readForfaits() {
  return await page.evaluate(() => {
    const selects = [...document.getElementById("reserver").querySelectorAll("select")];
    // the forfait select is the one whose options mention "DT"
    const forfaitSel = selects.find((s) => [...s.options].some((o) => /DT/.test(o.text)));
    if (!forfaitSel) return { error: "forfait select not found" };
    return [...forfaitSel.options]
      .filter((o) => o.value !== "")
      .map((o) => `${o.disabled ? "LOCKED  " : "OK      "}${o.text.trim()}`);
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
