export default function CheckboxsCategories({
  mainCategories,
  subCategories,
  categoryIds,
  setCategoryIds,
}) {
  return (
    <div>
      <p>分類</p>
      {mainCategories.map((v) => {
        return (
          <div
            key={v.id}
            style={{
              borderWidth: '1px',
              borderColor: 'gray',
              borderStyle: 'solid',
              padding: '5px',
            }}
          >
            {v.name}
            {subCategories
              .filter((sub) => sub.parentId === v.id)
              .map((sub) => {
                return (
                  <label key={sub.id}>
                    <input
                      type="checkbox"
                      value={sub.id}
                      checked={categoryIds.includes(sub.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setCategoryIds([...categoryIds, sub.id])
                        } else {
                          setCategoryIds(
                            categoryIds.filter((id) => sub.id !== id)
                          )
                        }
                      }}
                    />
                    {sub.name}
                  </label>
                )
              })}
          </div>
        )
      })}
    </div>
  )
}
