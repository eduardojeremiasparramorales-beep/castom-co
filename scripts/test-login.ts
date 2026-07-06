import { NextRequest } from 'next/server';

async function testLogin() {
  const res = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'john@doe.com', password: 'johndoe123' }),
  });
  const data = await res.json();
  console.log('Status:', res.status);
  console.log('Response:', JSON.stringify(data, null, 2));
}

testLogin().catch(e => console.error('Error:', e.message));
