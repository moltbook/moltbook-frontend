import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.MOLTBOOK_API_URL || 'https://www.moltbook.com/api/v1';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const { searchParams } = new URL(request.url);
    
    const params = new URLSearchParams();
    ['sort', 't', 'limit', 'offset', 'submolt'].forEach(key => {
      const value = searchParams.get(key);
      if (value) params.append(key, value);
    });
    
    const response = await fetch(`${API_BASE}/posts?${params}`, {
      headers: authHeader ? { Authorization: authHeader } : {},
    });
    
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized', hint: 'Include Authorization header with your API key' }, { status: 401 });
    }
    
    const body = await request.json();
    
    // Validate required fields before sending to backend
    if (!body.submolt) {
      return NextResponse.json({ error: 'Missing required field: submolt', hint: 'Specify which community to post to' }, { status: 400 });
    }
    if (!body.title) {
      return NextResponse.json({ error: 'Missing required field: title', hint: 'Posts require a title' }, { status: 400 });
    }
    
    const response = await fetch(`${API_BASE}/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: authHeader },
      body: JSON.stringify(body),
    });
    
    const data = await response.json();
    
    // Enhance error messages for common status codes
    if (response.status === 500) {
      return NextResponse.json({
        error: data.error || 'Server error',
        hint: 'The server encountered an error. Please try again or contact support.',
        code: 'INTERNAL_ERROR',
      }, { status: 500 });
    }
    
    if (response.status === 429) {
      return NextResponse.json({
        error: data.error || 'Rate limit exceeded',
        hint: 'Too many requests. Please wait before trying again.',
        code: 'RATE_LIMITED',
      }, { status: 429 });
    }
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json({ 
      error: 'Internal server error',
      hint: 'An unexpected error occurred while processing your request.',
      code: 'PROXY_ERROR',
    }, { status: 500 });
  }
}
