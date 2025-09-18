import 'server-only' // 限制只能在伺服器端使用

import nodemailer from 'nodemailer'
import { serverConfig, isDev } from '../config/server.config.js'

// 取得config檔案中的smtp設定
const { host, user, pass, provider } = serverConfig.smtp[serverConfig.smtp.type]

// 使用gmail寄送
const gmail = {
  host,
  port: 465,
  secure: true, // use TLS
  //在專案的 .env 檔案中定義關於寄送郵件的 process.env 變數
  auth: {
    user,
    pass,
  },
  tls: {
    servername: 'smtp.gmail.com',
    rejectUnauthorized: false,
  },
}

// 使用 https://ethereal.email/
const ethereal = {
  host,
  port: 587,
  auth: {
    user,
    pass,
  },
}

// 定義所有email的寄送伺服器位置
const transport = provider === 'gmail' ? gmail : ethereal

// 圖片(logo)的路徑，開發環境不使用
const image = isDev
  ? ''
  : `<img src="${serverConfig.nextUrl}/kawaii_next.png" alt="Company Logo" width="150"> `

const otpMailHtml = (otpToken, secret) => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>重設網站登入密碼要求的一次性驗証碼 OTP Verification</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f6f6f6;
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background-color: #007BFF; /* Corporate color */
            padding: 20px;
            text-align: center;
        }
        .header img {
            max-width: 150px;
        }
        .content {
            padding: 20px;
        }
        .otp-code {
            font-size: 24px;
            font-weight: bold;
            color: #333333;
            margin: 20px 0;
        }
        .footer {
            text-align: center;
            padding: 10px;
            font-size: 12px;
            color: #777777;
        }
    </style>
</head>
<body>

    <div class="container">
        <div class="header">
           ${image}
            <h1 style="color: #ffffff;">重設登入密碼的一次性驗証碼(OTP)</h1>
        </div>
        <div class="content">
            <p>親愛的網站會員 您好，</p>
            <p>您的一次性驗証碼(OTP code)如下:</p>
            <div class="otp-code">${otpToken}</div>
            <p>請在您目前的重設登入密碼頁面中的"一次性驗証碼"輸入框進行輸入。或是從以下的連結連入頁面:</p>
            <p><a href="${serverConfig.nextUrl}/user/forget-password-2p/reset?secret=${secret}" target="_blank">重設登入密碼頁面連結</a></p>
            <p>請注意驗証碼將於寄送後5分鐘後到期，如有任何問題請洽網站客服人員。</p>
        </div>
        <div class="footer">
            <p>&copy; 2024 台灣 NextJS Inc. 網站.</p>
        </div>
    </div>

</body>
</html>
`
// 電子郵件文字訊息樣版
const otpMailText = (otpToken, secret) => `親愛的網站會員 您好，
通知重設密碼所需要的驗証碼，
請輸入以下的6位數字，重設密碼頁面的"電子郵件驗証碼"欄位中。
    
${otpToken}

或是點選以下連結:

<http://localhost:3001/user/forget-password-2p/reset?secret=${secret}>
    
請注意驗証碼將於寄送後5分鐘後到期，如有任何問題請洽網站客服人員:

敬上

台灣 NextJS Inc. 網站`

// 一般寄送
export const sendOtpMail = async (to, otpToken, secret = '') => {
  if (isDev) console.log(otpToken)
  // 寄送email
  const mailOptions = {
    // 這裡要改寄送人
    from: user, // sender address
    to: to, // list of receivers
    subject: '重設登入密碼的一次性驗証碼(OTP)',
    text: otpMailText(otpToken, secret),
    html: otpMailHtml(otpToken, secret),
  }

  // 呼叫transport函式
  const transporter = nodemailer.createTransport(transport)

  // 寄送email
  try {
    const info = await transporter.sendMail(mailOptions)
    if (isDev) console.log('email已寄送: ', info.messageId)
  } catch (err) {
    console.log(err)
    throw new Error('無法寄送email')
  }
}
