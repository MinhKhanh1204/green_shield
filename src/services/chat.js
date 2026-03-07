// Lightweight chat API client for Chatbox Greenshield Mekong
// Endpoints (Spring Boot):
// - GET    /api/v1/chat/topics           -> Map<String, String>
// - POST   /api/v1/chat/select-topic     -> text (ack string)
// - POST   /api/v1/chat/message          -> text (AI reply)

// Dev: rỗng = dùng Vite proxy. Prod: set VITE_API_BASE
const DEFAULT_BASE = import.meta.env.VITE_API_BASE || '';
const base = (DEFAULT_BASE).replace(/\/$/, '');

async function http(url, options = {}) {
	const method = (options.method || 'GET').toUpperCase();
	// Only set JSON content-type for write requests; avoid adding it to GET to keep it a simple request (no preflight)
	const defaultHeaders = (method === 'POST' || method === 'PUT' || method === 'PATCH')
		? { 'Content-Type': 'application/json' }
		: {};

	const res = await fetch(url, {
		// Backend relies on HttpSession cookies — include credentialsnp
		credentials: 'include',
		headers: {
			...defaultHeaders,
			...(options.headers || {}),
		},
		...options,
	});

	// Try JSON first, fall back to text
	const contentType = res.headers.get('content-type') || '';
	const body = contentType.includes('application/json') ? await res.json() : await res.text();
	if (!res.ok) {
		const msg = typeof body === 'string' ? body : JSON.stringify(body);
		throw new Error(msg || `Request failed: ${res.status}`);
	}
	return body;
}

export async function getTopics() {
	return http(`${base}/api/v1/chat/topics`, { method: 'GET' });
}

export async function selectTopic(topicKey) {
	if (!topicKey) throw new Error('topic is required');
	return http(`${base}/api/v1/chat/select-topic`, {
		method: 'POST',
		body: JSON.stringify({ topic: String(topicKey) }),
	});
}

export async function sendMessage(message) {
	if (!message || !message.trim()) throw new Error('message is required');
	return http(`${base}/api/v1/chat/message`, {
		method: 'POST',
		body: JSON.stringify({ message }),
	});
}

export const CHAT_API_BASE = base;

