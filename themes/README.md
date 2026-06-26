# 主題包 (Theme Packs)

`themes/` 資料夾裡每個 `*.js` 檔就是一個主題。App 啟動時會**自動掃描**這個資料夾載入全部主題,
切換按鈕(footer 那顆)會依 `order` 順序輪迴切換,並顯示各主題的 `emoji` 當圖示。
新增主題 = 在這裡丟一個新的 `.js` 檔,**不用改任何其他程式**,重開即可。

## 契約

每個檔案以 ES module 載入(各自獨立作用域,變數不會互相污染),並呼叫一次全域 `registerTheme`:

```js
// themes/mytheme.js

// 每個主題自己的狀態放在 module 作用域(各檔獨立)
let things = []

// 引擎會在 seed/draw 時把繪圖環境傳進來;這個 B() 把它綁到區域變數方便畫圖
let ctx, W, H, rnd, pick
function B (e) { ctx = e.ctx; W = e.W; H = e.H; rnd = e.rnd; pick = e.pick }

function seed (env) {            // 視窗尺寸變化時呼叫一次,用來初始化/重生內容
  B(env)
  things = Array.from({ length: 10 }, () => ({ x: rnd(0, W), y: rnd(0, H) }))
}

function draw (env, t, dt) {      // 每幀呼叫;t = 秒數, dt = 距上幀秒數
  B(env)
  for (const o of things) { /* 用 ctx 畫圖 */ }
}

registerTheme({
  key: 'mytheme',     // 唯一識別字(存檔記住用)
  emoji: '🌸',         // 切換按鈕的圖示  ← 一定要填,按鈕靠它顯示
  title: 'My Theme',  // 滑鼠提示文字
  order: 4,           // 切換順序(數字小的先;aquarium=1, sky=2, jungle=3)
  seed,               // 可省略(沒有就不初始化)
  draw                // 必填
})
```

### `env` 提供的工具
| 名稱 | 說明 |
|------|------|
| `ctx`  | Canvas 2D context(已套好 devicePixelRatio,直接用 CSS px 座標畫) |
| `W` `H` | 卡片目前的寬高(px);會隨視窗縮放改變 |
| `rnd(a, b)` | 回傳 `[a, b)` 區間隨機數 |
| `pick(arr)` | 從陣列隨機取一個 |

### 注意
- 畫布在所有文字**底下**(z-index),所以畫什麼都不會擋到 usage 數字。
- 動作用 `Math.sin/cos` 配 `t` 算,不要用 `Date.now()`。
- 想暫時關閉某主題:把該 `.js` 檔移出資料夾(或改副檔名)即可。
- 內建一個 `Off`(⬛)場景會自動排在最後,用來完全關閉動畫。
