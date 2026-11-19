# Consume · 顾客端点单

天枢点单系统的**顾客端**：顾客扫桌面二维码 → 手机浏览器直接打开点单页 → 选菜下单。

## 入口网址

| 入口 | 网址 | 用途 |
| --- | --- | --- |
| 顾客端主页 | https://nanliang9178-ui.github.io/Consume/ | 扫码引导页（无桌号时显示） |
| 指定桌位点单页 | `https://nanliang9178-ui.github.io/Consume/t/{桌位scene}` | 真正的点单页，`{桌位scene}` 由商户后台生成 |

> 目前是**静态托管**（GitHub Pages），只能看到界面，下单、支付、订单查询都需要后端 API，
> 后端代码在 `boss` 仓库的 `apps/api`。等部署好服务端后，把 `src/lib/api.ts` 里的 `BASE`
> 指向线上地址即可完整跑通。

## 二维码说明

顾客端不需要小程序也能用：桌码就是一个**普通网址二维码**，内容是
`{域名}/Consume/t/{桌位scene}`。
微信小程序码要等小程序注册认证后才能生成，属于后续步骤，不影响现在的网页版点单。

## 目录结构

```
Consume/
├─ apps/
│  ├─ h5/           # 网页点单页（React 19 + Vite + Tailwind）
│  └─ miniprogram/  # 微信原生小程序（可选，需已认证小程序）
├─ docs/            # 已构建的静态站点，GitHub Pages 从这里发布
└─ package.json
```

## 本地开发

```bash
npm install
npm run dev        # 打开 http://localhost:5174
```

开发时 `/api` 会被代理到 `http://localhost:3000`，所以需要同时把 `boss` 仓库的后端跑起来。

## 重新构建（改了代码之后）

```bash
npm run build      # 产物在 apps/h5/dist
# 然后把 apps/h5/dist 的内容覆盖到 docs/，提交推送即可
```

## 页面路由

| 路径 | 页面 |
| --- | --- |
| `/` | 扫码引导（提示请扫描桌面二维码） |
| `/t/:scene` | 点单页（按桌号展示菜单） |
| `/t/:scene/checkout` | 结算页 |
| `/t/:scene/orders` | 我的订单 |
| `/t/:scene/result/:orderId` | 下单结果 |
