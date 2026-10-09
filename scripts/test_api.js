const http = require('http');

async function testEndpoint(endpoint, postData, deleteIdKey) {
  const baseUrl = 'http://localhost:3000';
  console.log(`\n--- Testing ${endpoint} ---`);
  
  try {
    // 1. POST (Insert Data)
    console.log(`[1] Inserting data into ${endpoint}...`);
    const postRes = await fetch(`${baseUrl}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(postData)
    });
    const postJson = await postRes.json();
    console.log(`POST response:`, postJson);
    
    if (!postJson.success) {
      console.error(`❌ Failed to insert data into ${endpoint}`);
      return;
    }

    // 2. GET (Verify Data)
    console.log(`[2] Verifying data in ${endpoint}...`);
    const getRes = await fetch(`${baseUrl}${endpoint}`);
    const getJson = await getRes.json();
    
    // Find our inserted data
    let found = false;
    // APIs usually return { success: true, bookings: [...] } etc. 
    // We will just search the whole JSON string for our unique ID
    const getJsonString = JSON.stringify(getJson);
    if (getJsonString.includes(postData[deleteIdKey] || postData.id)) {
      found = true;
      console.log(`✅ Data successfully found in ${endpoint}!`);
    } else {
      console.error(`❌ Inserted data not found in GET response for ${endpoint}`);
    }

    // 3. DELETE (Cleanup)
    const deleteId = postData[deleteIdKey] || postData.id;
    if (deleteId) {
      console.log(`[3] Cleaning up (Deleting ${deleteId}) from ${endpoint}...`);
      const delUrl = `${baseUrl}${endpoint}${endpoint.includes('?') ? '&' : '?'}id=${deleteId}`;
      const delRes = await fetch(delUrl, { method: 'DELETE' });
      const delJson = await delRes.json();
      console.log(`DELETE response:`, delJson);
    }
  } catch (error) {
    console.error(`❌ Error testing ${endpoint}:`, error);
  }
}

async function runTests() {
  const timestamp = Date.now();
  
  // Wait for server to be ready
  console.log('Waiting for Next.js server on port 3000...');
  let ready = false;
  for (let i = 0; i < 20; i++) {
    try {
      const res = await fetch('http://localhost:3000/api/rooms');
      if (res.ok) {
        ready = true;
        break;
      }
    } catch (e) {
      // ignore
    }
    await new Promise(r => setTimeout(r, 2000));
  }

  if (!ready) {
    console.error('Server did not become ready.');
    return;
  }
  
  console.log('Server is ready! Running tests...');

  // 1. Test Bookings
  await testEndpoint('/api/bookings', {
    id: `TEST-BKG-${timestamp}`,
    guestName: 'Test Guest',
    roomType: 'Standard Room',
    checkIn: '2026-10-10',
    checkOut: '2026-10-12',
    status: 'Confirmed',
    amount: 160
  }, 'id');

  // 2. Test Expenses
  await testEndpoint('/api/expenses', {
    id: `TEST-EXP-${timestamp}`,
    category: 'Test Category',
    description: 'Test Description',
    amount: 50,
    date: '2026-10-09'
  }, 'id');

  // 3. Test Other Revenues
  await testEndpoint('/api/otherRevenues', {
    id: `TEST-REV-${timestamp}`,
    source: 'Test Source',
    description: 'Test Description',
    amount: 100,
    date: '2026-10-09'
  }, 'id');

  // 4. Test Guests
  // Note: /api/guests DELETE uses /api/guests/[id]
  console.log(`\n--- Testing /api/guests ---`);
  try {
    const guestId = `TEST-GST-${timestamp}`;
    const guestRes = await fetch('http://localhost:3000/api/guests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: guestId,
        fullName: 'Test Guest',
        idNumber: '123456789',
        phone: '123456789',
        nationality: 'Test',
        roomAssigned: '101',
        guestCount: 1,
        checkIn: '2026-10-09',
        checkOut: '2026-10-10',
        checkedInAt: '2026-10-09T10:00:00Z'
      })
    });
    console.log('POST Guest:', await guestRes.json());
    
    const getGuests = await fetch('http://localhost:3000/api/guests');
    const getGuestsJson = await getGuests.json();
    if (JSON.stringify(getGuestsJson).includes(guestId)) {
      console.log('✅ Guest successfully found!');
    } else {
      console.error('❌ Guest not found!');
    }

    const delGuest = await fetch(`http://localhost:3000/api/guests/${guestId}`, { method: 'DELETE' });
    console.log('DELETE Guest:', await delGuest.json());
  } catch (e) {
    console.error('Guest test error:', e);
  }

  // 5. Test Invoices
  await testEndpoint('/api/invoices', {
    id: `TEST-INV-${timestamp}`,
    invoice_number: `INV-${timestamp}`,
    issue_date: '2026-10-09',
    due_date: '2026-10-10',
    status: 'ISSUED',
    currency: 'USD',
    customer: { name: 'Test Customer', customer_id: 'CUST-1' },
    items: [],
    summary: { amount_paid: 0, balance_due: 100, grand_total: 100, sub_total: 100, tax_total: 0 },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }, 'id');

  console.log('\n✅ All tests completed!');
  process.exit(0);
}

runTests();
