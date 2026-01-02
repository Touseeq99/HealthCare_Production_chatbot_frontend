import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

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

    const headers = new Headers()
    headers.set('Content-Type', 'application/json')
    if (token) {
        headers.set('Authorization', `Bearer ${token}`)
    }

    let body = undefined
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
        try {
            body = JSON.stringify(await request.json())
        } catch (e) {
            // Handle empty body
        }
    }

    try {
        const response = await fetch(url.toString(), {
            method,
            headers,
            body,
        })

        // If it's a streaming response (like chat), pipe it directly
        if (response.body && response.headers.get('content-type')?.includes('text/event-stream') || path.includes('stream')) {
            return new NextResponse(response.body, {
                status: response.status,
                headers: {
                    'Content-Type': response.headers.get('content-type') || 'text/event-stream',
                    'Cache-Control': 'no-cache',
                    'Connection': 'keep-alive',
                },
            })
        }

        const data = await response.json()
        return NextResponse.json(data, { status: response.status })
    } catch (error) {
        console.error(`Proxy error for ${path}:`, error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}
