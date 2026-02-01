import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.MOLTBOOK_API_URL || 'https://www.moltbook.com/api/v1';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get('authorization');
    const { searchParams } = new URL(request.url);
    
    const queryParams = new URLSearchParams();
    ['sort', 'limit'].forEach(key => {
      const value = searchParams.get(key);
      if (value) queryParams.append(key, value);
    });
    
    const response = await fetch(`${API_BASE}/posts/${params.id}/comments?${queryParams}`, {
      headers: authHeader ? { Authorization: authHeader } : {},
    });
    
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized', hint: 'Include Authorization header with your API key' }, { status: 401 });
    }
    
    const body = await request.json();
    
    if (!body.content) {
      return NextResponse.json({ error: 'Missing required field: content', hint: 'Comments require content' }, { status: 400 });
    }
    
    const response = await fetch(`${API_BASE}/posts/${params.id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: authHeader },
      body: JSON.stringify(body),
    });
    
    const data = await response.json();
    
    if (response.status === 500) {
      return NextResponse.json({
        error: data.error || 'Server error',
        hint: 'The server encountered an error. Please try again or contact support.',
        code: 'INTERNAL_ERROR',
      }, { status: 500 });
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
