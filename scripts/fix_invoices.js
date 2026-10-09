const { google } = require("googleapis");

const credentials = {
  type: "service_account",
  project_id: "directed-gasket-508415-c2",
  private_key_id: "3bdccc6ca6911a14b9d5919d378d54f9b2cec4d1",
  private_key:
    "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQC3jTg3sH9Y3j0l\nqeUOcAzPb/mrE2bi+mpN9s7UivG6tYx+OxL+lbGQravduqe2LKwcTm7nga3vS4Wa\nnhRfsWiyS3ePxcwUBG5toM/n96wIRy1V9NKw87/YVt374vnuyk5uFyJ1wzTgi0+y\nJ94Bku+j9p14KMZ6W9RpAvvitl8dGU0gNM+PgHOLhwDXrY1GIkoEgy6lt2XM4peR\nlJJzh6+sFY4LmujRbifEp8ZUek8pe2JM9M2moNX9OEhpQtOjZ4KtinHOCKUedAPU\n96KQBky7lcV61JEwr3DGK1C/O3d8evIGUIwC2Wkpvm4nOdyaWK3tm9u6NxB8N+GS\nTn2+fIDbAgMBAAECggEAEI549TEC86msO1L9WdWKmkV/8EoCPFQZNaofEvXrgwtw\nPkym1Hb9Os8nkwsMqLaT2cPLZi+A2HZn+T/sF4uhpX+AK+RMGbwil9nrFwH0rxR4\nhunb/WEnO2TuhhN9tufhtjV5AsVWZjC6whetg1fVLOWIY7fN22igGs7NmLAZmT6x\nYacbd3EaHgqWKxmFrPHQXrd7V4j0fK5vVhg/hji3tFoPtJGNsKdeFivgQorvJAv2\nwJ0+hz8raycMUnuNsU4V523SDryJP8UYoBLEciJ58cFNOcIOB6g3CTWjgO9FA7IJ\nWLKCBQ3JwzavchIdX/Ln6MD5sU+oitKMx4RUgHbpxQKBgQDfqtZY0DZVNSyatMRA\npvOcVM2VuTHstDtHHtWRNULOgk6rh5EAbUqaJ0TzUYg94Kew7Nf4ukpQDVSw6Lle\nY3FuY9TT2msG2SoBidbiF/WtTlbEdXnaYgF/MBlG46eJZCBn+1lrU1nngqcp6oWj\n/TISw0HtYwD2Rb3dDJ7Ki3dlHwKBgQDSFdZ1QEWRob0w8wHc+1u+66wRT/ARgPrO\nbCNsyyccOpFg5aNOWEVMoiEtHKkckP2qHk9oAqzNVXESW7YIiaev+GTPRibaj2m8\nFonEQzE//kPrhGZ7Du8hs6mC+tUg6mH8Zv7kQAnJ4tU9lCKQ0wK2ShPX8HnGAZjC\nljlpEb5QxQKBgDN9UZDqhceB0T3gJVm41VYE07sHAi46o3bQ61tdRn7h0ph8Qe42\nOrlYFvBosZOFFzWMoH9a62aYWwnK2XmYLPG7u6/1lTPjZF8sSzKLT3xRD3p0jNOw\nQiX0fa0rFVN0oF0vqLsjWgwIsNDec1t4G0Hkf1XVt8/56CZuFFQOXTMDAoGAFN2A\nYELS5gTnUm5AOB9q3Epx24JR+JsTzd6log+HQeF7QOFt18EimNrdaqqXDTRFTVkX\nT+A8I2SiB02+hZiOZAbKlF+GSlzGBp1Cb5Cw2oc5XbHXr88q5vD+G/kno85Djxr3\no9nMXxW9UhFdYX7jnRE8aU0D+yt7bZAYAZx2h3UCgYAbmMmu5t6X/7x9y9koqobJ\noYrFQ8aobSg8oO2opL1Jz/j6lL7EMhoZZUw2o64MLpzFCloJe5msFJGQWkWTMdca\nQWu3dJ3dOOvcOidkHCPIUVq0gGv1XO/dUDaMkuMSMXgUaiEWwpCKVBk8WEpagKQs\n/F2uf56brlD27094s92GlQ==\n-----END PRIVATE KEY-----\n",
  client_email:
    "service-account@directed-gasket-508415-c2.iam.gserviceaccount.com",
};

const SPREADSHEET_ID = "1KNNXk9Wo_HmnKPZjHEmB7AH_jAOoRdk3a26pa081JQw";

async function main() {
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  const sheets = google.sheets({ version: "v4", auth });

  console.log("Fetching row 1 of Invoices...");
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: "'🧾 Invoices'!A1:Z1",
  });
  
  const row = res.data.values ? res.data.values[0] : [];
  console.log("Row 1 headers:", row);

  // Find duplicates
  const seen = new Set();
  const duplicates = [];
  const newRow = row.map((header, i) => {
    if (seen.has(header)) {
      duplicates.push(header);
      return header + "_dup" + i;
    }
    seen.add(header);
    return header;
  });

  if (duplicates.length > 0) {
    console.log("Found duplicates:", duplicates);
    console.log("New row 1:", newRow);
    
    // Update the row to resolve duplicates
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: "'🧾 Invoices'!A1:Z1",
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [newRow] },
    });
    console.log("Fixed duplicates!");
  } else {
    console.log("No duplicates found in row 1.");
  }
}

main().catch(console.error);
