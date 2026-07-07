# Changelog

## 1.0.0 — 2026-07-07

### 新增
- 浮動聯絡按鈕：LINE、Messenger、WhatsApp、電話、Email、Telegram、Viber、Zalo、KakaoTalk、WeChat、Snapchat、自訂連結，共 12 種。
- 位置可選左下 / 右下，距離、主按鈕顏色、自訂按鈕圖示皆可調。
- 顯示條件：桌機 / 手機開關、全站 / 指定頁面顯示 / 指定頁面隱藏。
- 標籤文字可選「App 名稱」或「聯絡內容」。
- **NinjaTeam Click to Chat（WP Support All-in-One）一鍵移轉**：初次啟用時自動偵測，
  移轉全部 App 與外觀設定後自動停用舊外掛；未偵測到則直接以預設值啟用。
- **LINE 連結格式相融**：純 ID（`@xxx`）、完整網址（`line.me` / `lin.ee`）皆可，
  並自動修復 NinjaTeam 2.3.6 的雙重網址 bug（`line.me/ti/p/https://line.me/...`）。

### 安全設計
- 所有聯絡方式皆為純 `<a>` 錨點 — 只有使用者點擊才會開啟。
- 不使用 iframe、不做 JS 導向、不預載外部資源，
  根絕 iOS / Apple 裝置「一進頁就跳出開啟 LINE 詢問」的問題。
