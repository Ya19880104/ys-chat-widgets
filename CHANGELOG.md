# Changelog

## 1.1.3 — 2026-07-07

### 調整
- 後台選單改為獨立頂層選單「SUPPORT CHAT」（原掛在 YS Plugin 子選單下）。

## 1.1.2 — 2026-07-07

### 修正
- 自訂按鈕圖示的尺寸規則改以 inline style 輸出（優先級最高），
  避免 CDN（如 Cloudflare）快取殘留舊版 CSS 造成圖示顯示錯誤。

## 1.1.1 — 2026-07-07

### 修正
- 自訂按鈕圖示新增「顯示方式」：**置中縮放（contain，預設）** — 保留按鈕底色、
  圖縮 60% 置中（適合去背 icon）；**佔滿整圓（cover）** — 適合完整圓形圖片。
  v1.1.0 一律 cover，去背白色 icon 會撐滿整圓導致底色被蓋掉。
- 移轉對應：NinjaTeam `wpsaio_button_image`（contain / cover）自動轉為對應顯示方式。

## 1.1.0 — 2026-07-07

### 新增
- **點擊雙模式**：
  - 直接開啟（redirect，預設）— 點擊 App 直接開啟連結。
  - **QR Code 卡片（popup）** — 桌機點擊彈出 QR Code 卡片（App 品牌色 header、
    掃碼提示、聯絡內容、「直接開啟」按鈕）；手機點擊仍直接開啟。
- QR Code 由**本地 JS 生成**（qrcode-generator，MIT）：零 iframe、零外部請求，
  與 NinjaTeam「iframe 嵌 line.me 顯示 QR」的做法不同，不會在 Apple 裝置誤觸發。
  每一種 App（含電話 tel: / Email mailto:）都能出 QR。
- 移轉對應：NinjaTeam `wpsaio_style`（redirect / popup）自動轉為本外掛的點擊模式。

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
