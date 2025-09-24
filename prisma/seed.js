// prisma client file
import prisma from '../lib/prisma.js'
import fs from 'fs'
import path from 'path'
import { readFile } from 'fs/promises'
// 需要額外安裝 csvtojson 套件
import csv from 'csvtojson'
// 需要額外安裝  bcrypt 套件
import bcrypt from 'bcrypt'
import { isDev, convertToCamelCase } from '../lib/utils.js'

// 定義表關聯在這裡，目的是按正確順序的匯入種子資料，否則會出現外鍵約束錯誤或無法匯入的問題
// 外鍵都是置於後面的資料表(外鍵來源表:外鍵所在目標表)
// foreignKey is in the second table
// const oneToOne = ['User:Profile'] // 已註解掉，因為移除了 Profile 表
// foreignKey is in the second table
const oneToMany = ['Category:Product', 'Brand:Product', 'TimeLog:Step']
// foreignKey is in the third table
const manyToMany = ['User:Product:Favorite']

// seed檔案種類(副檔名) seed files extension (csv| json)
const fileExtension = 'json'
// seed檔案存放目錄(相對於專案根目錄) seed files folder path (relative to project root)
const seedsFolder = 'seeds'
// 需要先轉換為bcrypt編碼的欄位名稱 create bcrypt password hash
const bcryptFields = ['password']
// 需要先轉換為日期的欄位名稱 date format fields
const dateFields = ['birthdate'] // 改為 birthdate，因為 User 表中的欄位名稱
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
  // 依照關聯表順序排序種子檔案
  relationFileList.sort(function (a, b) {
    for (let i = 0; i < relations.length; i++) {
      const tmp = relations[i].split(':')
      console.log(`🔍 關聯 ${i}: "${relations[i]}" 分割後:`, tmp, `長度: ${tmp.length}`);
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

  // 逐一讀取種子檔案，並匯入資料 json or csv
  for (const filename of seedFileList) {
    let data = []

    // json file
    if (fileExtension === 'json') {
      const jsonData = await readFile(
        path.join(process.cwd(), `./${seedsFolder}/${filename}`)
      )
      // allData is an array of objects
      const allData = JSON.parse(jsonData)

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

    // console.log('prop', prop, 'data', data)

    // TODO: this maybe anti typescript type check
    // 執行 Prisma createMany 方法，將資料匯入資料庫
    const result = await prisma[prop].createMany({
      data,
      skipDuplicates: true,
    })

    // 如果是開發環境，顯示訊息
    if (isDev)
      console.log(`Created ${result.count} seeds for "${model}" Model.`)
  }
}

main()
  .then(async () => {
    // 關閉 Prisma 連線
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    // 如果是開發環境，顯示錯誤訊息
    if (isDev) console.log(e)
    // 關閉 Prisma 連線
    await prisma.$disconnect()
    // 結束 Node.js 程式
    process.exit(1)
  })
