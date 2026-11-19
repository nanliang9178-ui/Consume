# 天枢点单 · 顾客扫码点餐（Consume 客户端）

> 天枢点单（多商户扫码点单 SaaS 白标系统）的**顾客端入口**静态演示。顾客扫桌上的桌码 → 打开网页 → 自动识别桌号 → 点餐、下单、支付（演示）、查看出餐进度。

## 入口网址

| 用途 | 网址 |
| --- | --- |
| **顾客扫码点餐入口**（演示桌台 A01 / `scene=demo`） | https://nanliang9178-ui.github.io/Consume/ |
| 该桌的显式桌码地址 | https://nanliang9178-ui.github.io/Consume/demo |
| 其他桌（大厅 A02–A08、包间 B01–B03、靠窗 C01–C04） | https://nanliang9178-ui.github.io/Consume/scenea02 、`/Consume/sceneb01` 、`/Consume/scenec01` … |

打开 `https://nanliang9178-ui.github.io/Consume/` 会自动进入 A01 桌（`/Consume/demo`）的点餐页。
真实门店中，每张桌上的桌码里写的就是这种网址——把桌位换成对应 `scene` 即可（老板端「桌位管理」里可以直接下载每桌的桌码 PNG）。

> 微信**小程序码**需要先把点餐端注册并认证成微信小程序、再调用微信接口生成，这属于后续工作；本次交付的是可直接访问的网页入口（普通二维码 / 网址）。

## 没有服务器也能演示

- 安装包里的真实后端是 NestJS + Prisma + 微信支付 v3，需要服务器与数据库。本仓库用预构建前端 + 浏览器内 Mock 模拟 `/api/*`（`assets/mock-core.js`、`assets/mock-h5.js`），数据存在浏览器 localStorage，操作可真实生效。
- 跨设备实时同步：`assets/live-sync.js` 通过公开 MQTT（`broker.emqx.io`）共享订单状态——手机扫码下单后，老板端（`boss` 仓库）会**立即**收到新单提示；断网时自动退化为本机轮询模式。
- 桌码图片在 `assets/qr/`（圆点 + 「天枢」logo 样式，如 `table-demo.png`），内容即 `https://nanliang9178-ui.github.io/Consume/<scene>`。

## 和老板端的关系

- 老板端 / 商户后台：https://nanliang9178-ui.github.io/boss/ （仓库 `boss`）
- 老板端「桌位管理」展示、下载的桌码指向本仓库的 `/Consume/<scene>`；两个仓库都部署在同一个 GitHub Pages 站点下，所以图片可直接引用。
- 顾客端下单 → 老板端实时接单/出餐 → 顾客端订单状态同步更新，一条完整链路可演示。
