import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
export const maxDuration = 300 // 5 minutes

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    const { path } = await params
    return handleRequest(request, path, 'GET')
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    const { path } = await params
    return handleRequest(request, path, 'POST')
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    const { path } = await params
    return handleRequest(request, path, 'PUT')
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    const { path } = await params
    return handleRequest(request, path, 'DELETE')
}

async function handleRequest(request: NextRequest, pathArray: string[], method: string) {
    const path = pathArray.join('/')
    const url = new URL(`${process.env.NEXT_PUBLIC_API_BASE_URL}/${path}`)

    // Copy query parameters
    request.nextUrl.searchParams.forEach((value, key) => {
        url.searchParams.set(key, value)
    })

    const cookieStore = await cookies()
    const token = cookieStore.get('userToken')?.value

    if (!token) {
        return NextResponse.json(
            { message: 'No authentication token found' },
            { status: 401 }
        )
    }

    const headers = new Headers()
    const contentType = request.headers.get('content-type')
    if (contentType) {
        // If it's multipart, we don't set it explicitly to let fetch set the boundary
        if (!contentType.includes('multipart/form-data')) {
            headers.set('Content-Type', contentType)
        }
    }
    headers.set('Authorization', `Bearer ${token}`)

    let body: BodyInit | undefined = undefined
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
        if (contentType?.includes('application/json')) {
            try {
                body = JSON.stringify(await request.json())
            } catch (e) {
                // Handle empty body
            }
        } else if (contentType?.includes('multipart/form-data')) {
            body = await request.formData()
        } else {
            body = await request.blob()
        }
    }

    try {
        const response = await fetch(url.toString(), {
            method,
            headers,
            body,
        })

        // If it's a streaming response (like chat), pipe it directly
        if (response.body && (response.headers.get('content-type')?.includes('text/event-stream') || path.includes('stream'))) {
            const responseHeaders = new Headers({
                'Content-Type': response.headers.get('content-type') || 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            });

            // Pass through session ID header if present
            const sessionId = response.headers.get('X-Session-ID');
            if (sessionId) {
                responseHeaders.set('X-Session-ID', sessionId);
            }

            return new NextResponse(response.body, {
                status: response.status,
                headers: responseHeaders,
            })
        }

        const data = await response.json()
        return NextResponse.json(data, { status: response.status })
    } catch (error) {
        console.error(`Proxy error for ${path}:`, error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}
