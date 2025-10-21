'use client'

import { useState } from 'react'
// for learning how to use scrollbar
export default function Scrollbartrial() {
  const [selectedStyle, setSelectedStyle] = useState('basic')

  // 不同滾動條樣式
  const scrollbarStyles = {
    basic: {
      name: '基本滾動條',
      css: `
        .scroll-container {
          height: 200px;
          overflow-y: auto;
          border: 1px solid #ccc;
          padding: 10px;
        }
      `,
    },
    custom: {
      name: '自定義滾動條',
      css: `
        .scroll-container {
          height: 200px;
          overflow-y: auto;
          border: 1px solid #ccc;
          padding: 10px;
        }

        .scroll-container::-webkit-scrollbar {
          width: 12px;
        }

        .scroll-container::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 6px;
        }

        .scroll-container::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 6px;
        }

        .scroll-container::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `,
    },
    colorful: {
      name: '彩色滾動條',
      css: `
        .scroll-container {
          height: 200px;
          overflow-y: auto;
          border: 1px solid #ccc;
          padding: 10px;
        }

        .scroll-container::-webkit-scrollbar {
          width: 16px;
        }

        .scroll-container::-webkit-scrollbar-track {
          background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
          border-radius: 8px;
        }

        .scroll-container::-webkit-scrollbar-thumb {
          background: linear-gradient(45deg, #667eea, #764ba2);
          border-radius: 8px;
          border: 2px solid #fff;
        }

        .scroll-container::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(45deg, #5a67d8, #6b46c1);
        }
      `,
    },
    hidden: {
      name: '隱藏滾動條',
      css: `
        .scroll-container {
          height: 200px;
          overflow-y: auto;
          border: 1px solid #ccc;
          padding: 10px;
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* IE/Edge */
        }

        .scroll-container::-webkit-scrollbar {
          display: none; /* Chrome/Safari */
        }
      `,
    },
    thin: {
      name: '細滾動條',
      css: `
        .scroll-container {
          height: 200px;
          overflow-y: auto;
          border: 1px solid #ccc;
          padding: 10px;
        }

        .scroll-container::-webkit-scrollbar {
          width: 4px;
        }

        .scroll-container::-webkit-scrollbar-track {
          background: transparent;
        }

        .scroll-container::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.3);
          border-radius: 2px;
        }

        .scroll-container::-webkit-scrollbar-thumb:hover {
          background: rgba(0,0,0,0.5);
        }
      `,
    },
  }

  // 生成測試內容
  const generateContent = () => {
    // 將類陣列變成陣列的方法
    return Array.from({ length: 20 }, (_, i) => (
      <div key={i} style={{ padding: '8px', borderBottom: '1px solid #eee' }}>
        <strong>項目 {i + 1}</strong>
        <p>這是第 {i + 1} 個測試項目，用來展示滾動條效果。</p>
        <small>時間: {new Date().toLocaleTimeString()}</small>
      </div>
    ))
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>🎨 滾動條樣式學習頁面</h1>

      {/* 樣式選擇器 */}
      <div style={{ marginBottom: '20px' }}>
        <h3>選擇滾動條樣式：</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {Object.entries(scrollbarStyles).map(([key, style]) => (
            <button
              key={key}
              onClick={() => setSelectedStyle(key)}
              style={{
                padding: '8px 16px',
                border:
                  selectedStyle === key
                    ? '2px solid #007bff'
                    : '1px solid #ccc',
                borderRadius: '4px',
                background: selectedStyle === key ? '#e3f2fd' : 'white',
                cursor: 'pointer',
              }}
            >
              {style.name}
            </button>
          ))}
        </div>
      </div>

      {/* 當前樣式說明 */}
      <div
        style={{
          marginBottom: '20px',
          padding: '15px',
          background: '#f8f9fa',
          borderRadius: '8px',
        }}
      >
        <h3>當前樣式：{scrollbarStyles[selectedStyle].name}</h3>
        <pre
          style={{
            background: '#fff',
            padding: '10px',
            borderRadius: '4px',
            overflow: 'auto',
          }}
        >
          <code>{scrollbarStyles[selectedStyle].css}</code>
        </pre>
      </div>

      {/* 滾動條演示區域 */}
      <div
        style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}
      >
        {/* 左側：基本演示 */}
        <div>
          <h3>📋 基本演示</h3>
          <div
            className="scroll-container"
            style={{
              height: '200px',
              overflowY: 'auto',
              border: '1px solid #ccc',
              padding: '10px',
              ...(selectedStyle === 'custom' && {
                '--scrollbar-width': '12px',
              }),
            }}
          >
            {generateContent()}
          </div>
        </div>

        {/* 右側：對比演示 */}
        <div>
          <h3>🔄 對比演示</h3>
          <div
            className="scroll-container"
            style={{
              height: '200px',
              overflowY: 'auto',
              border: '1px solid #ccc',
              padding: '10px',
              background: '#f0f0f0',
            }}
          >
            {generateContent()}
          </div>
        </div>
      </div>

      {/* 實用範例 */}
      <div style={{ marginTop: '30px' }}>
        <h3>💡 實用範例</h3>

        {/* 聊天室樣式 */}
        <div style={{ marginBottom: '20px' }}>
          <h4>💬 聊天室樣式</h4>
          <div
            style={{
              height: '150px',
              overflowY: 'auto',
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '10px',
              background: '#fafafa',
            }}
            className="chat-scroll"
          >
            {Array.from({ length: 10 }, (_, i) => (
              <div
                key={i}
                style={{
                  marginBottom: '8px',
                  padding: '8px',
                  background: '#e3f2fd',
                  borderRadius: '4px',
                }}
              >
                <strong>用戶 {i + 1}:</strong> 這是第 {i + 1} 條訊息
              </div>
            ))}
          </div>
        </div>

        {/* 表格樣式 */}
        <div style={{ marginBottom: '20px' }}>
          <h4>📊 表格樣式</h4>
          <div
            style={{
              height: '200px',
              overflowY: 'auto',
              border: '1px solid #ddd',
              borderRadius: '8px',
            }}
            className="table-scroll"
          >
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead
                style={{ background: '#f8f9fa', position: 'sticky', top: 0 }}
              >
                <tr>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>
                    ID
                  </th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>
                    名稱
                  </th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>
                    狀態
                  </th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 15 }, (_, i) => (
                  <tr key={i}>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                      {i + 1}
                    </td>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                      項目 {i + 1}
                    </td>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: '4px',
                          background: i % 2 === 0 ? '#d4edda' : '#f8d7da',
                          color: i % 2 === 0 ? '#155724' : '#721c24',
                        }}
                      >
                        {i % 2 === 0 ? '完成' : '進行中'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* CSS 樣式注入 */}
      <style jsx>{`
        /* 基本滾動條 */
        .scroll-container::-webkit-scrollbar {
          width: 8px;
        }

        .scroll-container::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }

        .scroll-container::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 4px;
        }

        .scroll-container::-webkit-scrollbar-thumb:hover {
          background: #555;
        }

        /* 自定義滾動條 */
        ${selectedStyle === 'custom' &&
        `
          .scroll-container::-webkit-scrollbar {
            width: 12px;
          }

          .scroll-container::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 6px;
          }

          .scroll-container::-webkit-scrollbar-thumb {
            background: #888;
            border-radius: 6px;
          }

          .scroll-container::-webkit-scrollbar-thumb:hover {
            background: #555;
          }
        `}

        /* 彩色滾動條 */
        ${selectedStyle === 'colorful' &&
        `
          .scroll-container::-webkit-scrollbar {
            width: 16px;
          }

          .scroll-container::-webkit-scrollbar-track {
            background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
            border-radius: 8px;
          }

          .scroll-container::-webkit-scrollbar-thumb {
            background: linear-gradient(45deg, #667eea, #764ba2);
            border-radius: 8px;
            border: 2px solid #fff;
          }

          .scroll-container::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(45deg, #5a67d8, #6b46c1);
          }
        `}

        /* 隱藏滾動條 */
        ${selectedStyle === 'hidden' &&
        `
          .scroll-container::-webkit-scrollbar {
            display: none;
          }
        `}

        /* 細滾動條 */
        ${selectedStyle === 'thin' &&
        `
          .scroll-container::-webkit-scrollbar {
            width: 4px;
          }

          .scroll-container::-webkit-scrollbar-track {
            background: transparent;
          }

          .scroll-container::-webkit-scrollbar-thumb {
            background: rgba(0,0,0,0.3);
            border-radius: 2px;
          }

          .scroll-container::-webkit-scrollbar-thumb:hover {
            background: rgba(0,0,0,0.5);
          }
        `}

        /* 聊天室滾動條 */
        .chat-scroll::-webkit-scrollbar {
          width: 6px;
        }

        .chat-scroll::-webkit-scrollbar-track {
          background: #f0f0f0;
          border-radius: 3px;
        }

        .chat-scroll::-webkit-scrollbar-thumb {
          background: #007bff;
          border-radius: 3px;
        }

        .chat-scroll::-webkit-scrollbar-thumb:hover {
          background: #0056b3;
        }

        /* 表格滾動條 */
        .table-scroll::-webkit-scrollbar {
          width: 8px;
        }

        .table-scroll::-webkit-scrollbar-track {
          background: #f8f9fa;
          border-radius: 4px;
        }

        .table-scroll::-webkit-scrollbar-thumb {
          background: #6c757d;
          border-radius: 4px;
        }

        .table-scroll::-webkit-scrollbar-thumb:hover {
          background: #495057;
        }
      `}</style>
    </div>
  )
}
