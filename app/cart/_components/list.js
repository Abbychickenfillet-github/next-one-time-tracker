'use client'

import { useCart } from '@/hooks/use-cart-state'

export default function CartList() {
  // 使用hooks 解出所需的狀態與函式(自context)
  const { cart, items, decrement, increment, removeItem } = useCart()

  return (
    <div>
      <table
        className="table"
        cellPadding="0"
        border="0"
        width="100%"
        cellSpacing="0"
      >
        <thead>
          <tr>
            <th>id</th>
            <th>名稱</th>
            <th>單價</th>
            <th>數量</th>
            <th>小計</th>
            <th>移除</th>
          </tr>
        </thead>
        <tbody>
          {items.map((v) => {
            return (
              <tr key={v.id}>
                <td>{v.id}</td>
                <td>{v.name} </td>
                <td>{v.price}</td>
                <td>
                  <div className="btn-group mr-2" role="group">
                    <button
                      type="button"
                      className="btn btn-light"
                      onClick={() => {
                        decrement(v.id)
                      }}
                    >
                      -
                    </button>
                    <button type="button" className="btn btn-light">
                      {v.quantity}
                    </button>
                    <button
                      type="button"
                      className="btn btn-light"
                      onClick={() => {
                        increment(v.id)
                      }}
                    >
                      +
                    </button>
                  </div>
                </td>
                <td>{v.subtotal}</td>
                <td>
                  <button
                    type="button"
                    className="btn btn-light"
                    onClick={() => {
                      removeItem(v.id)
                    }}
                  >
                    x
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <hr />
      <div>
        items: {cart.totalItems} / total: {cart.totalPrice}
        <br />
        {cart.isEmpty && '購物車為空'}
        <hr />
      </div>
    </div>
  )
}
