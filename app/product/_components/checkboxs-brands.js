export default function CheckboxsBrands({ brands, brandIds, setBrandIds }) {
  return (
    <>
      <div>
        品牌
        {brands.map((brand) => {
          return (
            <label key={brand.id}>
              <input
                type="checkbox"
                value={brand.id}
                checked={brandIds.includes(brand.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setBrandIds([...brandIds, brand.id])
                  } else {
                    setBrandIds(brandIds.filter((id) => id !== brand.id))
                  }
                }}
              />
              {brand.name}
            </label>
          )
        })}
      </div>
    </>
  )
}
