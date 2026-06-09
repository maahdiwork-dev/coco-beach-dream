import { readFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n").filter((l) => l.includes("="))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^"|"$/g, "")]; })
);
const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  db: { schema: "coco_beach" }, auth: { persistSession: false },
});

const r = await supabase
  .from("forfaits")
  .update({ name_fr: "Paillote VIP 1ère Position", name_ar: "Paillote VIP 1ère Position" })
  .eq("slug", "paillote-premiere");
console.log("rename paillote-premiere:", r.error ? r.error.message : "OK");
