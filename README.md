# Consume · 天枢点单顾客端（扫码点餐）

安装包《天枢架构(4)》`apps/h5` 构建产物，UI、路由、文案与源码一致，仅把部署基路径从 `/t/` 调整为 `/Consume/`。

## 入口网址

- 顾客扫码点餐入口（A01 桌）：<https://nanliang9178-ui.github.io/Consume/t/demo>
- 仓库根地址（同样直达 A01 桌点餐页）：<https://nanliang9178-ui.github.io/Consume/>
- 桌码规则：`https://nanliang9178-ui.github.io/Consume/t/<桌位sceneCode>`，后台「桌码管理」里可查看每桌的 sceneCode。
- 未带桌号的根路径在源码里会显示「请扫描桌面上的点单二维码」引导页；本演示为了开箱即用，根路径自动跳到 A01 桌。

## 演示账号

| 角色 | 账号 | 密码 | 说明 |
|---|---|---|---|
| 商户老板 | `demo` | `demo888` | 商户编码 `demo`（登录页已预填，可一键填入） |
| 店员 | `staff` | `staff888` | 商户编码 `demo` |
| 平台运营 | `admin` | `admin888` | 登录页切换到「平台运营」标签 |

## 数据说明

- 页面由安装包 `apps/h5` 源码构建，接口行为由 `assets/t4-shim.js` 在浏览器内模拟，种子数据来自安装包自带 `apps/api/data/app.db` 的真实导出（`assets/t4-seed.js`）。
- 下单、支付（`ALLOW_MOCK_PAY=true` 模拟支付）、订单状态流转均按安装包 `apps/api` 与 `packages/shared` 的实现复刻。
- 订单数据保存在浏览器 localStorage；同一浏览器的多个标签页实时同步，跨设备/跨浏览器通过公开 MQTT 通道同步（安装包实时推送能力的演示版，无需后端）。
- 真实微信小程序码需要注册认证小程序后再生成，本仓库暂不包含。

## 目录

```
index.html          入口（404.html 与之相同，用于 GitHub Pages 深链路 SPA 兜底）
assets/             构建产物 + t4-seed.js（种子数据）+ t4-shim.js（演示数据层）
```


---

source/ 目录为安装包(4)原始工程源码，仅作对照参考，不参与部署。
