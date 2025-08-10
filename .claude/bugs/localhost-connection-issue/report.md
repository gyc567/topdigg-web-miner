# Bug Report: localhost Connection Issue

## Bug Summary
**Title:** localhost拒绝连接请求
**Severity:** High - Blocks development testing
**Status:** New
**Reporter:** User

## Bug Description
开发服务器启动后，用户无法通过浏览器访问 `http://localhost:8080/`，浏览器显示错误信息：
> "无法访问此网站，localhost 拒绝了我们的连接请求"

## Environment
- **OS:** macOS (Darwin 23.6.0)
- **Node.js:** v22.13.0
- **Project:** TopDigg Web Miner
- **Port:** 8080
- **Command:** `npm run dev`

## Steps to Reproduce
1. 在项目根目录运行 `npm run dev`
2. 等待开发服务器启动完成
3. 打开浏览器访问 `http://localhost:8080/`
4. 观察到连接被拒绝的错误

## Expected Behavior
浏览器应该正常加载开发环境页面，显示React应用内容

## Actual Behavior
浏览器显示连接被拒绝的错误页面

## Server Logs
```
> vite_react_shadcn_ts@0.0.0 dev
> vite

Re-optimizing dependencies because lockfile has changed

  VITE v5.4.19  ready in 1087 ms

  ➜  Local:   http://localhost:8080/
  ➜  Network: http://192.168.31.135:8080/
```

## Additional Context
- 构建过程(`npm run build`)成功完成
- 服务器日志显示服务已正常启动
- 网络地址(http://192.168.31.135:8080/)也显示相同问题
- 项目使用Vite作为构建工具，端口8080已配置

## Priority
**High** - 影响本地开发测试流程

## Next Steps
需要检查端口占用、防火墙设置、以及开发服务器配置