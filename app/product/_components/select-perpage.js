export default function SelectPerpage({ perpage, setPerpage }) {
  return (
    <>
      <div>
        每頁筆數:{' '}
        <select
          value={perpage}
          onChange={(e) => {
            setPerpage(Number(e.target.value))
          }}
          name="perpage"
        >
          <option value="5">5筆/頁</option>
          <option value="10">10筆/頁</option>
          <option value="20">20筆/頁</option>
          <option value="50">50筆/頁</option>
        </select>
      </div>
    </>
  )
}
