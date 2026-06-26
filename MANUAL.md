# Claude Usage Overlay — 操作手冊

一張**永遠最上層、半透明、釘在螢幕角落**的小卡片,顯示 `claude.ai/settings/usage`
的用量(Current session / Weekly / Sonnet / Daily routine runs)。

原理:背後有個**隱藏的 claude.ai 視窗**保持登入,每隔 N 秒把頁面上的數字刮出來
(讀進度條的 `aria-valuenow`,不是讀 CSS),再畫成自己的迷你卡片。不是把整頁塞進來。

---

## 1. 檔案在哪裡

| 東西 | 路徑 |
|---|---|
| **程式本體** | `~/claude-usage-overlay/` |
| 設定檔(你會改的) | `~/claude-usage-overlay/config.json` |
| 登入 session + 視窗狀態 | `~/.config/claude-usage-overlay/` |

程式檔說明:
- `main.js` — 主程式(視窗、快捷鍵、刮取排程、角落定位)
- `scraper.js` — 真正在 claude.ai 頁面裡跑的刮取函式
- `hud.html` — 那張半透明卡片的外觀
- `preload.js` — HUD 與主程式的橋接
- `config.json` — 所有可調參數
- `overlayctl` — 命令列控制(Wayland / 腳本用)
- `MANUAL.md` / `README.md` — 說明

---

## 2. 啟動 / 關閉

```bash
cd ~/claude-usage-overlay
npm start                 # 啟動(已內建 --no-sandbox)
```

關閉:按 `Ctrl+Alt+Q`,或在另一個終端機 `~/claude-usage-overlay/overlayctl quit`。

> 啟動後就算把卡片隱藏(`Ctrl+Alt+U`),程式仍在背景跑,按一下又出來。
> 真的要結束才用 `Ctrl+Alt+Q`。

### 第一次使用(登入)
第一次跑會彈出一個 claude.ai 視窗 → **登入一次** → 之後就記住。
登入完那個視窗會自己縮到背景,你看到的就只剩那張小卡片。
之後若卡片顯示「Not logged in」,按 `Ctrl+Alt+L` 叫出登入視窗重新登入。

---

## 3. 快捷鍵(X11 直接可用)

| 快捷鍵 | 動作 |
|---|---|
| `Ctrl+Alt+U` | 顯示 / 隱藏卡片 |
| `Ctrl+Alt+C` | 換到下一個角落(右上 → 右下 → 左下 → 左上) |
| `Ctrl+Alt+]` | 更不透明(opacity ↑) |
| `Ctrl+Alt+[` | 更透明(opacity ↓) |
| `Ctrl+Alt+L` | 開登入視窗 |
| `Ctrl+Alt+R` | 立刻重新刮一次 |
| `Ctrl+Alt+Q` | 結束程式 |

也可以用滑鼠**拖卡片最上方那條**來自由移動。視窗邊緣可拖拉縮放。
位置、大小、透明度都會自動記住(存在 `overlay-state.json`)。

---

## 4. 調設定(`config.json`)

改完存檔,重啟 `npm start` 生效。

```jsonc
{
  "url": "https://claude.ai/settings/usage", // 來源頁
  "refreshSeconds": 45,        // 多久刮一次(別調太小,免得一直打 claude.ai)
  "opacity": 0.92,             // 整個視窗(含文字)的不透明度;快捷鍵 [ ] 調的就是這個
  "minOpacity": 0.3,           // opacity 快捷鍵能調到的最低值
  "opacityStep": 0.05,         // 每次按調多少
  "panelOpacity": 0.85,        // 卡片「底色」的不透明度(文字維持清晰);1=完全實心,越低越透
  "width": 300, "height": 260, // 卡片大小
  "margin": 14,                // 離螢幕邊緣的間距
  "corner": "top-right",       // 預設角落:top-right / bottom-right / bottom-left / top-left
  "hotkeys": { ... }           // 想換快捷鍵就改這裡
}
```

進度條顏色:< 70% 橘、≥ 70% 黃、≥ 90% 紅。

---

## 5. 開機自動啟動(選用)

建立 `~/.config/autostart/claude-usage-overlay.desktop`:

```ini
[Desktop Entry]
Type=Application
Name=Claude Usage Overlay
Exec=sh -c "cd /home/tbduser/claude-usage-overlay && npm start"
X-GNOME-Autostart-enabled=true
```

---

## 6. 疑難排解

| 症狀 | 處理 |
|---|---|
| `FATAL ... chrome-sandbox ... SIGTRAP` | 已用 `--no-sandbox` 解掉。若想保留 sandbox:`sudo chown root:root` + `sudo chmod 4755` 那支 `node_modules/electron/dist/chrome-sandbox`,再 `npm run start:sandboxed`。 |
| 開起來卡 loading / 空白 | 第一次要等 claude.ai 載入+渲染才刮得到;按 `Ctrl+Alt+R` 立刻重刮。 |
| 一直顯示 Not logged in | `Ctrl+Alt+L` 重新登入。 |
| 改了 `config.json` 沒反應 | 要 `Ctrl+Alt+Q` 結束後重新 `npm start`。 |
| 刷新把我拖好的視窗大小重置 | 已修正:手動拖過一次後就改用你的尺寸、不再自動貼合,跨重啟也記住。想恢復「自動貼合內容」就刪 `~/.config/claude-usage-overlay/overlay-state.json`。 |
| `LevelDB LOCK: File currently in use` | 上次沒乾淨關閉留下的鎖。正常用 `Ctrl+Alt+Q` 關就不會有;真的卡住就 `pkill -f claude-usage-overlay/node_modules/electron`。 |
| 想完全登出 / 重置 | 刪 `~/.config/claude-usage-overlay/Partitions/` 即清掉登入;刪整個 `~/.config/claude-usage-overlay/` 連狀態一起重置。 |
| 快捷鍵沒反應(Wayland) | 見下方 overlayctl。 |

---

## 7. Wayland / 用桌面自訂快捷鍵(備案)

你現在是 X11,全域快捷鍵直接可用。若換到 Wayland 註冊不到,改用 `overlayctl`:

```
GNOME 設定 → 鍵盤 → 自訂快捷鍵,指令填:
  node /home/tbduser/claude-usage-overlay/overlayctl toggle
  node /home/tbduser/claude-usage-overlay/overlayctl cycle
  node /home/tbduser/claude-usage-overlay/overlayctl op+
```

`overlayctl` 指令:`toggle | cycle | op+ | op- | login | refresh | quit`

---

## 8. 解除安裝

```bash
rm -rf ~/claude-usage-overlay ~/.config/claude-usage-overlay
# 若有設開機自啟:rm ~/.config/autostart/claude-usage-overlay.desktop
```

---

## 已知限制

- 目前是**單一卡片**,裡面含所有用量列。想要「右上 + 右下」同時釘兩塊,
  架構支援但要小改 `main.js`(加第二個 HUD 視窗),需要的話再說。
- Usage credits 那段主要是金額/開關,有些 label 可能空白;卡片以用量條為主。
- 走的是「讀已登入頁面 DOM」,不是官方 API;若 claude.ai 大改版面,
  可能要調 `scraper.js`(關鍵錨點 `role="progressbar"` + `aria-valuenow` 算穩)。
```
