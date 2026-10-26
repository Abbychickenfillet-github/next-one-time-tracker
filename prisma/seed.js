// prisma client file
import prisma from '../lib/prisma.js'
import fs from 'fs'
import path from 'path'
import { readFile } from 'fs/promises'
// 需要額外安裝 csvtojson 套件
import csv from 'csvtojson'
// 需要額外安裝  bcrypt 套件
import bcrypt from 'bcrypt'
import { convertToCamelCase } from '../lib/utils.js'

// 定義表關聯在這裡，目的是按正確順序的匯入種子資料，否則會出現外鍵約束錯誤或無法匯入的問題
// 外鍵都是置於後面的資料表(外鍵來源表:外鍵所在目標表)
// foreignKey is in the second table
// const oneToOne = ['User:Profile'] // 已註解掉，因為移除了 Profile 表
// foreignKey is in the second table
const oneToMany = [
  'User:TimeLog',
  'User:Step',
  'TimeLog:Step',
  'User:PaymentOrder',
  'User:FeaturedShare',
  'TimeLog:FeaturedShare',
]
// foreignKey is in the third table
const manyToMany = [] // 目前沒有多對多關聯

// seed檔案種類(副檔名) seed files extension (csv| json)
const fileExtension = 'json'
// seed檔案存放目錄(相對於專案根目錄) seed files folder path (relative to project root)
const seedsFolder = 'seeds'
// 需要先轉換為bcrypt編碼的欄位名稱 create bcrypt password hash
const bcryptFields = ['password']
// 需要先轉換為日期的欄位名稱 date format fields
const dateFields = ['birthdate'] // 改為 birthdate，因為 User 表中的欄位名稱

// 安全模式：只處理實際存在的 seed 檔案，不會根據關聯自動生成檔案列表
// 這樣可以確保只有你明確建立的 seed 檔案才會被處理
const SAFE_MODE = true // 設為 true 時，只處理 seeds/ 資料夾中實際存在的檔案
// 啟動類型檔案，會自動載入環境變數
async function main() {
  // seed 檔案存放路徑(相對於專案根目錄)
  const seedsPath = path.join(process.cwd(), seedsFolder)
  const filenames = await fs.promises.readdir(seedsPath)
  const relations = [...oneToMany, ...manyToMany] // 移除 oneToOne，因為已註解掉 Profile 表

  let relationFileList = []

  // 建立關聯檔案名稱陣列
  for (const relation of relations) {
    const tmp = relation.split(':')
    for (let i = 0; i < tmp.length; i++) {
      relationFileList.push(`${tmp[i]}.${fileExtension}`)
    }
  }

  // console.log(relationFileList)
  // sort relationFileList with oneToOne, oneToMany, manyToMany table sequence
  // 依照關聯表順序排序種子檔案，以避免外鍵約束問題
  relationFileList.sort(function (a, b) {
    for (let i = 0; i < relations.length; i++) {
      const tmp = relations[i].split(':')
      console.log(
        `🔍 關聯 ${i}: "${relations[i]}" 分割後:`,
        tmp,
        `長度: ${tmp.length}`
      )
      // oneToOne, oneToMany
      if (tmp.length === 2 && a.includes(tmp[0]) && b.includes(tmp[1])) {
        return -1
      }

      // manyToMany
      if (tmp.length === 3 && a.includes(tmp[0]) && b.includes(tmp[2])) {
        return -1
      }

      // manyToMany
      if (tmp.length === 3 && a.includes(tmp[1]) && b.includes(tmp[2])) {
        return -1
      }
    }

    // others
    return 0
  })

  // 去除重覆檔案 remove duplicate
  relationFileList = [...new Set(relationFileList)]

  let restFileList = []

  // 比對出原本加入的剩餘檔案
  for (let i = 0; i < filenames.length; i++) {
    // macos maybe has .DS_Store file and ignore it
    if (filenames[i] === '.DS_Store') {
      continue
    }

    if (
      !relationFileList.includes(filenames[i]) &&
      filenames[i].includes(fileExtension)
    ) {
      restFileList.push(filenames[i])
    }
  }

  //  重建seed檔案 re-structure seeders
  const seedFileList = [...restFileList, ...relationFileList]

  // console.log(seedFileList)

  // 安全模式：只處理實際存在的檔案
  const finalSeedFileList = SAFE_MODE
    ? filenames.filter((f) => f.includes(fileExtension) && f !== '.DS_Store')
    : seedFileList

  console.log(
    `📋 Seed 模式: ${SAFE_MODE ? '安全模式（只處理實際存在的檔案）' : '標準模式（包含關聯檔案）'}`
  )
  console.log(`📁 將處理的檔案: ${finalSeedFileList.join(', ')}`)

  // 逐一讀取種子檔案，並匯入資料 json or csv
  for (const filename of finalSeedFileList) {
    // 檢查檔案是否存在
    const filePath = path.join(process.cwd(), `./${seedsFolder}/${filename}`)
    try {
      await fs.promises.access(filePath)
    } catch {
      console.log(`⚠️  跳過不存在的檔案: ${filename}`)
      continue
    }

    let data = []

    // json file
    if (fileExtension === 'json') {
      const jsonData = await readFile(filePath)
      // allData is an array of objects
      const allData = JSON.parse(jsonData)

      // 檢查資料是否為空陣列
      if (!Array.isArray(allData) || allData.length === 0) {
        console.log(
          `⚠️  跳過空資料檔案: ${filename} (資料為空陣列，不會影響現有資料)`
        )
        continue
      }

      for (let i = 0; i < allData.length; i++) {
        const newItem = JSON.parse(JSON.stringify(allData[i]))

        for (const [key, value] of Object.entries(newItem)) {
          // bcrypt password
          if (bcryptFields.includes(key)) {
            newItem[key] = await bcrypt.hash(value, 10)
          }

          // date format
          if (dateFields.includes(key)) {
            newItem[key] = new Date(value)
          }
        }

        data.push(newItem)
      }
    }

    // csv file
    if (fileExtension === 'csv') {
      const allData = await csv().fromFile(
        path.join(process.cwd(), `./${seedsFolder}/${filename}`)
      )

      // 檢查資料是否為空陣列
      if (!Array.isArray(allData) || allData.length === 0) {
        console.log(
          `⚠️  跳過空資料檔案: ${filename} (資料為空陣列，不會影響現有資料)`
        )
        continue
      }

      // transform to correct object data type
      for (let i = 0; i < allData.length; i++) {
        const newItem = JSON.parse(JSON.stringify(allData[i]))

        for (const [key, value] of Object.entries(newItem)) {
          // string to null
          if (value === 'Null' || value === 'null' || value === 'NULL') {
            newItem[key] = null
          }

          // string to boolean
          if (value === 'True' || value === 'true' || value === 'TRUE') {
            newItem[key] = true
          }
          // string to boolean
          if (value === 'False' || value === 'false' || value === 'FALSE') {
            newItem[key] = false
          }

          // bcrypt password
          if (bcryptFields.includes(key)) {
            newItem[key] = await bcrypt.hash(value, 10)
          }

          // date format
          if (dateFields.includes(key)) {
            newItem[key] = new Date(value)
          }

          // string to number
          if (
            !isNaN(value) &&
            value !== '' &&
            value !== null &&
            typeof value !== 'boolean' &&
            !bcryptFields.includes(key)
          ) {
            // maybe string start with 0 like '09123123456' should be string
            if (value.startsWith('0') && value.length > 1) {
              newItem[key] = value
            } else {
              newItem[key] = Number(value)
            }
          }
        }
        // to data object array
        data.push(newItem)
      }
    }

    const model = filename.split('.')[0]
    const prop = convertToCamelCase(model)

    // 如果沒有資料，跳過（雙重檢查）
    if (!data || data.length === 0) {
      console.log(
        `⚠️  跳過空資料檔案: ${filename} (處理後資料為空，不會影響現有資料)`
      )
      continue
    }

    // TODO: this maybe anti typescript type check
    // 執行 Prisma createMany 方法，將資料匯入資料庫
    // ⚠️ 重要：createMany 只會新增資料，不會覆蓋或刪除現有資料
    // skipDuplicates: true 表示如果資料違反唯一約束（如 email），會跳過該筆資料，不會報錯
    // 這確保了用戶輸入的真實資料不會被覆蓋
    const result = await prisma[prop].createMany({
      data,
      skipDuplicates: true, // 跳過重複資料（基於唯一約束），不會覆蓋現有資料
    })

    // 顯示匯入結果
    const skippedCount = data.length - result.count
    console.log(
      `✅ Created ${result.count} seeds for "${model}" Model.` +
        (skippedCount > 0 ? ` (跳過 ${skippedCount} 筆重複資料)` : '')
    )
    if (result.count === 0 && data.length > 0) {
      console.log(
        `   ℹ️  所有資料都已存在（可能是唯一約束衝突），現有資料保持不變`
      )
    }
  }
}

main()
  .then(async () => {
    // 關閉 Prisma 連線
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    // 關閉 Prisma 連線
    await prisma.$disconnect()
    // 結束 Node.js 程式
    process.exit(1)
  })
