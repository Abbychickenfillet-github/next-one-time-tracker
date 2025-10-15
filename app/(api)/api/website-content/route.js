import { NextResponse as res } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    const websiteContent = {
      // 讀取 package.json
      packageInfo: await readPackageJson(),

      // 讀取 README.md
      readme: await readReadme(),

      // 讀取主要組件
      components: await readComponents(),

      // 讀取 API 路由
      apiRoutes: await readApiRoutes(),

      // 讀取頁面結構
      pages: await readPages(),

      // 讀取樣式文件
      styles: await readStyles(),

      // 讀取配置文件
      configs: await readConfigs(),
    }

    return res.json({
      status: 'success',
      data: websiteContent,
      message: '網站內容讀取成功',
    })
  } catch (error) {
    console.error('讀取網站內容失敗:', error)
    return res.json(
      {
        status: 'error',
        message: '讀取網站內容失敗',
        error: error.message,
      },
      { status: 500 }
    )
  }
}

async function readPackageJson() {
  try {
    const packagePath = path.join(process.cwd(), 'package.json')
    const packageContent = fs.readFileSync(packagePath, 'utf8')
    const packageJson = JSON.parse(packageContent)

    return {
      name: packageJson.name,
      version: packageJson.version,
      description: packageJson.description,
      dependencies: packageJson.dependencies,
      scripts: packageJson.scripts,
    }
  } catch {
    return { error: '無法讀取 package.json' }
  }
}

async function readReadme() {
  try {
    const readmePath = path.join(process.cwd(), 'README.md')
    const readmeContent = fs.readFileSync(readmePath, 'utf8')
    return readmeContent.substring(0, 2000) // 限制長度
  } catch {
    return '無法讀取 README.md'
  }
}

async function readComponents() {
  try {
    const componentsPath = path.join(process.cwd(), 'components')
    const components = []

    if (fs.existsSync(componentsPath)) {
      const files = fs.readdirSync(componentsPath, { recursive: true })

      for (const file of files) {
        if (
          typeof file === 'string' &&
          (file.endsWith('.js') ||
            file.endsWith('.jsx') ||
            file.endsWith('.ts') ||
            file.endsWith('.tsx'))
        ) {
          try {
            const filePath = path.join(componentsPath, file)
            const content = fs.readFileSync(filePath, 'utf8')
            components.push({
              name: file,
              path: filePath,
              content: content.substring(0, 1000), // 限制長度
            })
          } catch {
            // 跳過無法讀取的文件
          }
        }
      }
    }

    return components
  } catch {
    return []
  }
}

async function readApiRoutes() {
  try {
    const apiPath = path.join(process.cwd(), 'app', '(api)', 'api')
    const routes = []

    if (fs.existsSync(apiPath)) {
      const files = fs.readdirSync(apiPath, { recursive: true })

      for (const file of files) {
        if (typeof file === 'string' && file.endsWith('route.js')) {
          try {
            const filePath = path.join(apiPath, file)
            const content = fs.readFileSync(filePath, 'utf8')
            routes.push({
              name: file,
              path: filePath,
              content: content.substring(0, 1000), // 限制長度
            })
          } catch {
            // 跳過無法讀取的文件
          }
        }
      }
    }

    return routes
  } catch {
    return []
  }
}

async function readPages() {
  try {
    const pagesPath = path.join(process.cwd(), 'app')
    const pages = []

    if (fs.existsSync(pagesPath)) {
      const files = fs.readdirSync(pagesPath, { recursive: true })

      for (const file of files) {
        if (
          typeof file === 'string' &&
          (file.endsWith('page.js') ||
            file.endsWith('page.jsx') ||
            file.endsWith('page.ts') ||
            file.endsWith('page.tsx'))
        ) {
          try {
            const filePath = path.join(pagesPath, file)
            const content = fs.readFileSync(filePath, 'utf8')
            pages.push({
              name: file,
              path: filePath,
              content: content.substring(0, 1000), // 限制長度
            })
          } catch {
            // 跳過無法讀取的文件
          }
        }
      }
    }

    return pages
  } catch {
    return []
  }
}

async function readStyles() {
  try {
    const stylesPath = path.join(process.cwd(), 'styles')
    const styles = []

    if (fs.existsSync(stylesPath)) {
      const files = fs.readdirSync(stylesPath)

      for (const file of files) {
        if (
          file.endsWith('.css') ||
          file.endsWith('.scss') ||
          file.endsWith('.sass')
        ) {
          try {
            const filePath = path.join(stylesPath, file)
            const content = fs.readFileSync(filePath, 'utf8')
            styles.push({
              name: file,
              path: filePath,
              content: content.substring(0, 1000), // 限制長度
            })
          } catch {
            // 跳過無法讀取的文件
          }
        }
      }
    }

    return styles
  } catch {
    return []
  }
}

async function readConfigs() {
  try {
    const configs = []
    const configFiles = [
      'next.config.js',
      'tsconfig.json',
      'jsconfig.json',
      'prisma/schema.prisma',
    ]

    for (const configFile of configFiles) {
      try {
        const filePath = path.join(process.cwd(), configFile)
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf8')
          configs.push({
            name: configFile,
            path: filePath,
            content: content.substring(0, 1000), // 限制長度
          })
        }
        // eslint-disable-next-line no-unused-vars
      } catch (error) {
        // 跳過無法讀取的文件
      }
    }

    return configs
  } catch {
    return []
  }
}
