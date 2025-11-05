# Next.js Route Handler Request Parameter Guide

## Overview

This document explains when to include the `request` parameter in Next.js Route Handlers and clarifies common misconceptions about request handling.

## The Request Parameter in Next.js Route Handlers

In Next.js App Router, Route Handlers receive HTTP requests automatically. The `request` parameter is **optional** - it's only needed when you want to access request data (body, URL, headers, etc.).

### Important: Request Still Comes In Even Without the Parameter!

Even if you remove the `request` parameter from your function signature, **the HTTP request still arrives normally**. Next.js automatically handles incoming requests. The `request` parameter is just a way to **access** the request data.

## When to Include the Request Parameter

### 1. Reading Request Body (POST, PUT, PATCH)

When you need to read JSON data from the request body:

```javascript
// ✅ Need request parameter
export async function POST(request) {
  const body = await request.json()
  const { featuredShareId } = body
  // ... use the data
}

// ❌ This will cause an error if you try to use request.json()
export async function POST() {
  const body = await request.json() // ❌ ReferenceError: request is not defined
}
```

### 2. Reading Query Parameters (GET, DELETE)

When you need to read query parameters from the URL:

```javascript
// ✅ Need request parameter
export async function DELETE(request) {
  const { searchParams } = new URL(request.url)
  const featuredShareId = searchParams.get('featuredShareId')
  // ... use the parameter
}

// ❌ This will cause an error if you try to use request.url
export async function DELETE() {
  const { searchParams } = new URL(request.url) // ❌ ReferenceError: request is not defined
}
```

### 3. Reading Request Headers

When you need to read custom headers:

```javascript
// ✅ Need request parameter
export async function GET(request) {
  const customHeader = request.headers.get('X-Custom-Header')
  // ... use the header
}
```

## When to Omit the Request Parameter

### 1. Cookie-Based Authentication (GET)

When you only need to read cookies and don't need request body/URL:

```javascript
// ✅ Don't need request parameter
export async function GET() {
  // Cookies are read via cookies() helper, not from request
  const cookie = (await cookies()).get('ACCESS_TOKEN')?.value
  // ... process with cookie
}
```

### 2. Simple Responses

When you return a simple response without reading request data:

```javascript
// ✅ Don't need request parameter
export async function GET() {
  return NextResponse.json({ message: 'Hello World' })
}
```

## Real-World Examples from This Codebase

### Example 1: `/api/favorites` GET Route

```javascript
// ✅ Correct: No request parameter needed
export async function GET() {
  // Only reads from cookies, doesn't need request body or URL
  const cookie = (await cookies()).get('ACCESS_TOKEN')?.value
  // ... rest of the code
}
```

**Why?** This route only reads cookies (via `cookies()` helper) and doesn't need to read request body or query parameters.

### Example 2: `/api/favorites` POST Route

```javascript
// ✅ Correct: Request parameter needed
export async function POST(request) {
  // Need to read request body
  const body = await request.json()
  const { featuredShareId } = body
  // ... rest of the code
}
```

**Why?** This route needs to read `featuredShareId` from the request body.

### Example 3: `/api/favorites` DELETE Route

```javascript
// ✅ Correct: Request parameter needed
export async function DELETE(request) {
  // Need to read query parameters from URL
  const { searchParams } = new URL(request.url)
  const featuredShareId = searchParams.get('featuredShareId')
  // ... rest of the code
}
```

**Why?** This route needs to read `featuredShareId` from the query string.

### Example 4: `/api/featured-shares` GET Route

```javascript
// ✅ Correct: Request parameter needed
export async function GET(request) {
  // Need to read query parameters
  const { searchParams } = new URL(request.url)
  const userIdParam = searchParams.get('userId')
  // ... rest of the code
}
```

**Why?** This route needs to read optional `userId` query parameter.

## Common Misconception: "Removing request Parameter Prevents Requests"

### ❌ Wrong Understanding

Some developers think:

> "If I remove the `request` parameter, the request won't come in."

### ✅ Correct Understanding

The truth is:

- **Requests always come in** - Next.js handles HTTP requests automatically
- The `request` parameter is just a **tool to access** request data
- Removing it doesn't prevent requests; it just prevents you from reading request data

### What Happens When You Remove `request`?

1. **If you don't use request data**: ✅ Works fine

   ```javascript
   export async function GET() {
     return NextResponse.json({ message: 'OK' })
   }
   ```

2. **If you try to use request data without the parameter**: ❌ Error
   ```javascript
   export async function POST() {
     const body = await request.json() // ❌ ReferenceError!
   }
   ```

## Best Practices

### 1. Only Include What You Need

- Include `request` parameter **only** when you need to read request data
- Omit it when you don't need request data (makes code cleaner)

### 2. Use ESLint to Catch Unused Parameters

ESLint will warn you about unused parameters:

```
'request' is defined but never used.
```

This means you can safely remove it (if you're not using it).

### 3. Document Why You Need Request

When you do include `request`, consider adding a comment:

```javascript
export async function POST(request) {
  // Need request parameter to read featuredShareId from body
  const body = await request.json()
  // ...
}
```

## Common Misconception: "Write/Delete Operations Don't Need Request"

### ❌ Wrong Understanding

Some developers think:

> "If I'm only doing write (POST) or delete (DELETE) operations, I don't need the `request` parameter."

### ✅ Correct Understanding

The truth is:

- **POST operations** usually need `request` because they need to read data from the request body
- **DELETE operations** usually need `request` because they need to read data from the URL (query parameters or path)
- The need for `request` depends on **whether you need to read request data**, not on the HTTP method type

### Example: `/api/favorites` Routes

```javascript
// GET - No request needed ✅
export async function GET() {
  // Only reads cookies, doesn't need request data
  const cookie = (await cookies()).get('ACCESS_TOKEN')?.value
}

// POST - Request needed ✅
export async function POST(request) {
  // MUST read from request body to get featuredShareId
  const body = await request.json() // ← Needs request!
  const { featuredShareId } = body
}

// DELETE - Request needed ✅
export async function DELETE(request) {
  // MUST read from URL to get featuredShareId
  const { searchParams } = new URL(request.url) // ← Needs request!
  const featuredShareId = searchParams.get('featuredShareId')
}
```

**Key Point**: POST and DELETE operations **still need `request`** because they need to read data from the request (body or URL), not because they're write/delete operations.

## Summary

| Situation                            | Include `request`? | Reason                              |
| ------------------------------------ | ------------------ | ----------------------------------- |
| Read request body (`request.json()`) | ✅ Yes             | Need to access body                 |
| Read query params (`request.url`)    | ✅ Yes             | Need to access URL                  |
| Read headers (`request.headers`)     | ✅ Yes             | Need to access headers              |
| Only read cookies (`cookies()`)      | ❌ No              | Cookies helper doesn't need request |
| Simple response, no data needed      | ❌ No              | Don't need request data             |

**Key Takeaway**: The `request` parameter is **optional**. Including it doesn't make requests come in (they come in anyway), and removing it doesn't prevent requests (they still come in). It's just a way to access request data when needed.

**Important**: Even if you're doing write (POST) or delete (DELETE) operations, you **still need `request`** if you need to read data from the request body or URL. The need for `request` depends on **whether you need to read request data**, not on the HTTP method type.
