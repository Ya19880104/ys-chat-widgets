# YS CHAT Widgets

浮動聯絡按鈕外掛 — LINE、Messenger、WhatsApp、電話、Email 等 12 種聯絡方式，
可控制左下 / 右下位置，點擊展開。

## 特色

- **不會誤觸發 App**：所有聯絡方式皆為純 `<a>` 錨點，不使用 iframe、不做 JS 導向。
  只有訪客主動點擊才會開啟 LINE / 撥號 / 郵件，iOS / Apple 裝置不會再莫名跳出
  「要開啟 LINE 嗎？」。
- **LINE 連結怎麼填都可以**：純 ID（`@your-id`）、官方帳號連結（`https://line.me/R/ti/p/@your-id`）、
  短網址（`https://lin.ee/xxxx`）三種格式相融，自動輸出正確連結。
- **點擊雙模式**：「直接開啟」或「QR Code 卡片」。QR 卡片模式下，桌機點擊會彈出
  **本地生成**的 QR Code（手機掃碼直接加好友 / 撥號），手機點擊仍直接開啟。
  QR 不依賴任何外部服務、不嵌任何 iframe。
- **NinjaTeam Click to Chat 一鍵移轉**：初次啟用時自動偵測 WP Support All-in-One
  （support-chat），自動移轉全部 App 與外觀設定（含 redirect / popup 點擊模式）、
  修正 LINE 連結格式、停用舊外掛。沒安裝的話就直接以預設值啟用，不做任何多餘動作。

## 支援的聯絡方式

LINE / Messenger / WhatsApp / 電話 / Email / Telegram / Viber / Zalo /
KakaoTalk / WeChat / Snapchat / 自訂連結

## 系統需求

- WordPress 6.0+
- PHP 8.0+

## 安裝

1. 上傳 `ys-chat-widgets.zip` 至「外掛 → 安裝外掛 → 上傳」。
2. 啟用後至「YS CHAT Widgets」設定頁挑選聯絡方式即可。

## 版本紀錄

見 [CHANGELOG.md](CHANGELOG.md)。

---

© YANGSHEEP DESIGN — https://yangsheep.com.tw
