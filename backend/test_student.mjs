import axios from 'axios';

async function test() {
  try {
    const loginRes = await axios.post('http://localhost:4000/api/v1/auth/login', {
      email: 'student@example.com',
      password: 'password123',
      role: 'Student'
    });
    console.log('Login:', loginRes.status);
    const cookie = loginRes.headers['set-cookie'][0].split(';')[0];
    
    // First fetch stats to get project id
    const statsRes = await axios.get('http://localhost:4000/api/v1/student/fetch-dashboard-stats', {
      headers: { Cookie: cookie }
    });
    const projectId = statsRes.data.data.project._id;
    console.log('ProjectId:', projectId);

    const feedbackRes = await axios.get(`http://localhost:4000/api/v1/student/feedback/${projectId}`, {
      headers: { Cookie: cookie }
    });
    console.log('Feedback:', feedbackRes.data);
  } catch (err) {
    console.error('ERROR:', err.response?.data || err.message);
  }
}
test();
