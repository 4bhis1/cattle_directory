const API_URL = 'http://localhost:3000/api';

async function testFullFlow() {
    try {
        console.log('1. Creating Cattle via Frontend...');
        const cattleRes = await fetch(`${API_URL}/cattle`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                cattleId: `FRONT-${Date.now()}`,
                name: 'Frontend Cow',
                category: 'cow',
                gender: 'female',
                breed: 'Jersey',
                dateOfBirth: '2020-01-01',
                dateOfAcquisition: '2022-01-01',
                acquisitionType: 'purchased',
                weight: { current: 400, history: [] },
                status: 'active'
            })
        });

        const cattleData = await cattleRes.json();

        if (!cattleData.success) {
            console.error('Create Cattle Response:', cattleData);
            throw new Error('Create Cattle Failed');
        }
        console.log('Cattle Created ID:', cattleData.data._id);

        console.log('2. Fetching Cattle List...');
        const listRes = await fetch(`${API_URL}/cattle`);
        const listData = await listRes.json();
        console.log('Cattle Count:', listData.data.length);

        // Find our cow
        const myCow = listData.data.find((c: any) => c._id === cattleData.data._id);
        if (myCow) {
            console.log('Verified: Created cow found in list.');
        } else {
            console.error('Error: Created cow NOT found in list.');
        }

        console.log('3. Creating Milk Record...');
        const milkRes = await fetch(`${API_URL}/milk`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                cattleId: cattleData.data._id, // Use string ID as per schema
                milkingSession: 'morning',
                date: new Date().toISOString(),
                quantity: 15,
                soldTo: 'dairy',
                pricePerLiter: 40,
                totalAmount: 600
            })
        });
        const milkData = await milkRes.json();
        if (!milkData.success) {
            console.error('Create Milk Response:', milkData);
            throw new Error('Create Milk Failed');
        }
        console.log('Milk Created ID:', milkData.data._id);

        console.log('SUCCESS: Frontend-Backend Integration Verified!');
    } catch (error) {
        console.error('FAILED:', error);
    }
}

testFullFlow();
