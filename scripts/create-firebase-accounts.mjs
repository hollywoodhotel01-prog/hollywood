// Script to create staff accounts in Firebase Authentication
// Run: node scripts/create-firebase-accounts.mjs

const API_KEY = "AIzaSyCAYwjc-BRkW7oq4L0iOwO4MRP1rDPO3Wk";
const SIGN_UP_URL = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`;

const accounts = [
  { email: "admin@hollywoodhotel.rw",      password: "Admin@2050",   displayName: "Victor Adonis (Admin)" },
  { email: "cashier@hollywoodhotel.rw",    password: "Cashier@2050", displayName: "Sandra Mbeki (Cashier)" },
  { email: "reception@hollywoodhotel.rw",  password: "Recept@2050",  displayName: "James Osei (Receptionist)" },
  { email: "accounts@hollywoodhotel.rw",   password: "Account@2050", displayName: "Grace Mutua (Accountant)" },
];

async function createAccount(account) {
  const res = await fetch(SIGN_UP_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: account.email,
      password: account.password,
      displayName: account.displayName,
      returnSecureToken: true,
    }),
  });

  const data = await res.json();

  if (data.error) {
    if (data.error.message === "EMAIL_EXISTS") {
      console.log(`⚠️  Already exists: ${account.email}`);
    } else {
      console.error(`❌ Failed: ${account.email} — ${data.error.message}`);
    }
  } else {
    console.log(`✅ Created: ${account.email} (uid: ${data.localId})`);
  }
}

console.log("🏨 Creating Hollywood Hotel staff accounts in Firebase Auth...\n");
for (const account of accounts) {
  await createAccount(account);
}
console.log("\n✨ Done! All accounts processed.");
