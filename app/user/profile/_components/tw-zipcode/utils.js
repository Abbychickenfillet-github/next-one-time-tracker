import { countries, townships, postcodes } from './data-townships'

// postcode is string
// return a object ex: `{ country: '新竹市', township: '新竹市' }`
export const getCountryAndTownshipFromPostcode = (postcode = '') => {
  // 新竹市 300
  if (postcode === '300') return { country: '新竹市', township: '新竹市' }

  // 嘉義市 600
  if (postcode === '600') return { country: '嘉義市', township: '嘉義市' }

  // 屏東市 600 屏東巿
  if (postcode === '900') return { country: '屏東巿', township: '屏東巿' }

  // 頭份市
  if (postcode === '351') return { country: '頭份市', township: '頭份市' }

  let country = ''

  for (let i = 0; i < countries.length; i++) {
    country = countries[i]
    for (let j = 0; j < postcodes[i].length; j++) {
      if (postcodes[i][j] === postcode) {
        // break all loop
        return { country, township: townships[i][j] }
      }
    }
  }

  return { country: '', township: '' }
}

// postcode is string
// return a string ex: '300' or ''
export const getPostcodeFromAddress = (address = '') => {
  // 新竹市 300
  if (address.includes('新竹市')) return '300'

  // 嘉義市 600
  if (address.includes('嘉義市')) return '600'

  // 屏東市 600 屏東巿
  if (address.includes('屏東巿')) return '900'

  // ...no word to say
  if (address.includes('頭份巿')) return '351'
  if (address.includes('頭份市')) return '351'

  const countriesIndex = countries.findIndex((v) => address.includes(v))

  if (countriesIndex === -1) return ''

  const townshipIndex = townships[countriesIndex].findIndex((v) =>
    address.includes(v)
  )

  // default is ''
  const postcode = postcodes[countriesIndex][townshipIndex]
    ? postcodes[countriesIndex][townshipIndex]
    : ''

  //if (!postcode) console.log(township, townshipIndex)

  return postcode
}

// postcode is string
// return a string ex: '300' or ''
export default function getPostcodeFromTownship(country = '', township = '') {
  // 新竹市 300
  if (township === '新竹市') return '300'

  // 嘉義市 600
  if (township === '嘉義市') return '600'

  // 屏東市 600 屏東巿
  if (township === '屏東巿') return '900'

  // ...no word to say
  if (township === '頭份巿') return '351'
  if (township === '頭份市') return '351'

  const countriesIndex = countries.findIndex((v) => v === country)

  const townshipIndex = townships[countriesIndex].findIndex(
    (v) => v === township
  )

  // default 0
  const postcode = postcodes[countriesIndex][townshipIndex]
    ? postcodes[countriesIndex][townshipIndex]
    : 0

  //if (!postcode) console.log(township, townshipIndex)

  return postcode
}
