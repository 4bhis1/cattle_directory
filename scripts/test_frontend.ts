const API_URL = 'http://localhost:3000/api/cattle';

async function testFrontend() {
    try {
        console.log('Fetching from Frontend API...');
        const res = await fetch(API_URL);
        const data = await res.json();

        console.log('Response status:', res.status);
        if (data.success) {
            console.log('Success! Data count:', data.data.length);
            console.log('Sample data:', data.data.slice(0, 1));
        } else {
            console.error('Failed:', data);
        }

    } catch (error) {
        console.error('Test Failed:', error);
    }
}

testFrontend();
