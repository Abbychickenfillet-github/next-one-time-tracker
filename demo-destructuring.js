// 演示解構賦值的工作原理
console.log('=== 解構賦值演示 ===')

// 模擬 requestPayment 函數
function requestPayment(amount, options = {}) {
  console.log('1. 接收到的 options:', options)

  // 解構賦值
  const { orderId, currency = 'TWD', packages } = options
  console.log('2. 解構後的結果:')
  console.log('   orderId:', orderId)
  console.log('   currency:', currency)
  console.log('   packages:', packages)

  // 使用解構出來的值
  const finalOrderId = orderId || `ORDER-${Date.now()}-abc123`
  const finalCurrency = currency
  const finalPackages = packages || [{ name: '預設商品' }]

  console.log('3. 最終使用的值:')
  console.log('   finalOrderId:', finalOrderId)
  console.log('   finalCurrency:', finalCurrency)
  console.log('   finalPackages:', finalPackages)

  return { finalOrderId, finalCurrency, finalPackages }
}

console.log('\n--- 測試1: 不傳 options ---')
requestPayment(100)

console.log('\n--- 測試2: 傳空物件 ---')
requestPayment(100, {})

console.log('\n--- 測試3: 傳部分參數 ---')
requestPayment(100, { orderId: 'CUSTOM-123' })

console.log('\n--- 測試4: 傳完整參數 ---')
requestPayment(100, {
  orderId: 'CUSTOM-123',
  currency: 'USD',
  packages: [{ name: '自訂商品' }],
})
