export default function SelectSort({ sort, order, setSort, setOrder }) {
  return (
    <div>
      排序{' '}
      <select
        value={sort + ',' + order}
        onChange={(e) => {
          const [sort, order] = e.target.value.split(',')
          setOrder(order)
          setSort(sort)
        }}
      >
        <option value="id,asc">依照ID由小至大</option>
        <option value="id,desc">依照ID由大至小</option>
        <option value="price,asc">依照價格由低至高</option>
        <option value="price,desc">依照價格由高至低</option>
      </select>
    </div>
  )
}
