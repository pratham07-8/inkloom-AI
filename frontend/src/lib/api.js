const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5050';

export async function fetchApi(endpoint, options = {}, currentRole = 'USER') {
  const userHeaderMap = {
    USER: '00000000-0000-0000-0000-000000000001',
    MANAGER: '00000000-0000-0000-0000-000000000002',
    ADMIN: '00000000-0000-0000-0000-000000000003'
  };

  const headers = {
    'x-company-id': '11111111-1111-1111-1111-111111111111',
    'x-demo-user-id': userHeaderMap[currentRole] || userHeaderMap.USER,
    ...(options.headers || {})
  };

  // If body is not FormData, default Content-Type to application/json
  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const url = `${BACKEND_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
  }

  return await response.json();
}
