# JavaScript Catch Parameter Guide: When to Use and When to Omit

## Overview

This document explains when to include the error parameter in JavaScript `catch` blocks and when it can be safely omitted. Understanding this concept helps write cleaner, more intentional code and avoids unnecessary ESLint warnings.

## The Problem

In JavaScript, you can write catch blocks in two ways:

```javascript
// With error parameter
try {
  // some code
} catch (error) {
  // handle error
}

// Without error parameter
try {
  // some code
} catch {
  // handle error
}
```

The question is: when should you use which approach?

## When to Include the Error Parameter

### 1. Need Error Details

When you need to access error information:

```javascript
try {
  await fs.promises.access(filePath)
} catch (error) {
  console.error('File access failed:', error.message)
  console.error('Error code:', error.code)
  console.error('Stack trace:', error.stack)
}
```

### 2. Conditional Error Handling

When you need to handle different error types differently:

```javascript
try {
  await databaseOperation()
} catch (error) {
  if (error.code === 'ENOENT') {
    console.log('File not found')
  } else if (error.code === 'EACCES') {
    console.log('Permission denied')
  } else if (error.code === 'ENOTDIR') {
    console.log('Not a directory')
  } else {
    console.log('Unknown error:', error.message)
  }
}
```

### 3. Error Transformation

When you need to convert or wrap the error:

```javascript
try {
  await apiCall()
} catch (error) {
  throw new CustomError('API call failed', error)
}
```

### 4. Error Re-throwing

When you need to log and re-throw:

```javascript
try {
  await riskyOperation()
} catch (error) {
  console.error('Operation failed:', error.message)
  throw error // Re-throw the original error
}
```

### 5. Error Logging for Debugging

When you need detailed error information for debugging:

```javascript
try {
  await complexOperation()
} catch (error) {
  logger.error('Complex operation failed', {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
  })
}
```

## When to Omit the Error Parameter

### 1. Simple Error Handling

When you only need to know an error occurred, not the details:

```javascript
try {
  await fs.promises.access(filePath)
} catch {
  console.log(`⚠️ Skipping non-existent file: ${filename}`)
  continue
}
```

### 2. Silent Error Handling

When you want to handle errors silently:

```javascript
try {
  await optionalOperation()
} catch {
  // Silently ignore errors for optional operations
  return false
}
```

### 3. Generic Error Response

When you always return the same response regardless of error type:

```javascript
try {
  await userOperation()
} catch {
  return { success: false, message: 'Operation failed' }
}
```

### 4. Cleanup Operations

When performing cleanup regardless of error details:

```javascript
try {
  await mainOperation()
} catch {
  // Always clean up resources
  await cleanup()
  throw new Error('Main operation failed')
}
```

## Real-World Example: Prisma Seed File

### Before (with unused parameter)

```javascript
try {
  await fs.promises.access(filePath)
} catch (error) {  // ❌ 'error' is defined but never used
  console.log(`⚠️ Skipping non-existent file: ${filename}`)
  continue
}
```

### After (without parameter)

```javascript
try {
  await fs.promises.access(filePath)
} catch {  // ✅ Clean and intentional
  console.log(`⚠️ Skipping non-existent file: ${filename}`)
  continue
}
```

## Best Practices

### 1. Be Intentional

- If you're not using the error parameter, omit it
- This makes your code more readable and intentional

### 2. Consider Future Needs

- If you might need error details later, include the parameter
- It's easier to add error handling than to refactor later

### 3. Follow ESLint Rules

- Most ESLint configurations warn about unused variables
- Omitting unused parameters prevents these warnings

### 4. Document Complex Error Handling

- When you do use error parameters, document why
- Explain what error conditions you're handling

## Common Patterns

### Pattern 1: Log and Continue

```javascript
try {
  await processItem(item)
} catch (error) {
  console.error(`Failed to process item ${item.id}:`, error.message)
  // Continue processing other items
}
```

### Pattern 2: Fallback Value

```javascript
let result
try {
  result = await getValue()
} catch {
  result = defaultValue
}
```

### Pattern 3: Retry Logic

```javascript
let attempts = 0
while (attempts < 3) {
  try {
    await operation()
    break
  } catch (error) {
    attempts++
    if (attempts === 3) {
      throw new Error(
        `Operation failed after ${attempts} attempts: ${error.message}`
      )
    }
  }
}
```

## ESLint Configuration

To enforce this pattern, you can configure ESLint:

```javascript
// .eslintrc.js
module.exports = {
  rules: {
    'no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      },
    ],
  },
}
```

This allows you to prefix unused parameters with `_` if you must keep them:

```javascript
try {
  await operation()
} catch (_error) {
  // Prefixed with _ to indicate intentionally unused
  // handle error
}
```

## Summary

- **Include error parameter** when you need error details, conditional handling, or error transformation
- **Omit error parameter** when you only need to know an error occurred
- **Be intentional** about your error handling approach
- **Follow ESLint rules** to maintain code quality
- **Document complex error handling** for future maintainers

The key is to write code that clearly communicates your intent: if you're not using the error information, don't declare it.
