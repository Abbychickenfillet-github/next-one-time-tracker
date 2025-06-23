'use client'

import React, { useState, useContext, createContext, useEffect } from 'react'
import {
  init,
  addOne,
  findOneById,
  updateOne,
  removeOne,
  incrementOne,
  decrementOne,
  generateCartState,
} from './cart-reducer-state'
import useLocalStorage from '@/hooks/use-localstorage'

const CartContext = createContext(null)

// cartItem = {
//   id: '',
//   quantity: 0,
//   name: '',
//   price: 0,
// }

// cartState = {
//   items: cartItems,
//   isEmpty: true,
//   totalItems: 0,
//   cartTotal: 0,
// }

export const CartProvider = ({
  children,
  initialCartItems = [], //初始化購物車的加入項目
  localStorageKey = 'cart', //初始化localStorage的鍵名
}) => {
  // localStorage中只儲存 items。如果localStorage有此鍵中的值，則套入使用作為初始items。
  let items = initialCartItems

  if (!items.length) {
    try {
      // 修正nextjs中window is undefined的問題
      if (typeof window !== 'undefined') {
        const item = window.localStorage.getItem(localStorageKey)
        // 剖析存儲的json，如果沒有則返回初始值
        items = item ? JSON.parse(item) : []
      }
    } catch (error) {
      items = []
      console.log(error)
    }
  }

  // 初始化 cartItems, cartState
  const [cartItems, setCartItems] = useState(items)
  const [cartState, setCartState] = useState(init(initialCartItems))

  // 初始化 setValue(localStoage), setValue用於存入localStorage中
  const [storedValue, setValue] = useLocalStorage(localStorageKey, items)

  // 當 cartItems 更動時 -> 更動 localStorage 中的值 -> 更動 cartState
  useEffect(() => {
    // 使用字串比較
    if (JSON.stringify(cartItems) !== storedValue) {
      setValue(cartItems)
    }
    // 有更動時，重新設定cartState
    setCartState(generateCartState(cartState, cartItems))

    // eslint-disable-next-line
  }, [cartItems])

  /**
   * 加入新項目，重覆項目 quantity: quantity + 1
   */
  const addItem = (item) => {
    setCartItems(addOne(cartItems, item))
  }
  /**
   * 給定一id值，將這商品移出陣列中
   */
  const removeItem = (id) => {
    setCartItems(removeOne(cartItems, id))
  }
  /**
   * 給定一item物件，更新其中的屬性值(依照id為準)
   */
  const updateItem = (item) => {
    setCartItems(updateOne(cartItems, item))
  }
  /**
   * 給定一id與quantity，更新某個項目的數量
   */
  const updateItemQty = (id, quantity) => {
    const item = findOneById(cartItems, id)
    // 如果沒有id，則不更新
    if (!item.id) return
    // 更新項目
    const updateItem = { ...item, quantity }
    setCartItems(updateOne(cartItems, updateItem))
  }
  /**
   * 清空整個購物車
   */
  const clearCart = () => {
    setCartItems([])
  }
  /**
   * 給定一id值，回傳是否存在於購物車中
   */
  const isInCart = (id) => {
    return cartItems.some((item) => item.id === id)
  }
  /**
   * 給定一id值，有尋找到商品時，設定quantity: quantity + 1
   */
  const increment = (id) => {
    setCartItems(incrementOne(cartItems, id))
  }
  /**
   * 給定一id值，有尋找到商品時，設定quantity: quantity - 1，但 quantity 最小值為1
   */
  const decrement = (id) => {
    setCartItems(decrementOne(cartItems, id))
  }

  return (
    <CartContext.Provider
      value={{
        cart: cartState,
        items: cartState.items, //items與cartState.items差了一個subtoal屬性
        addItem,
        removeItem,
        updateItem,
        updateItemQty,
        clearCart,
        isInCart,
        increment,
        decrement,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
