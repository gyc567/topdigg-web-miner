> 译文来源：Tev 项目 GitHub 仓库 <https://github.com/tev-agent/tev-agent.github.io> 中的 `README.md`（项目主页 <https://tev-agent.github.io/>）。以下为中文翻译，链接与路径保持原样。

# Tev 项目主页

**Tev: Scaling Long-Horizon Agentic Environments with Dense Progress Rewards**（用稠密进度奖励扩展长跨度智能体环境）
的项目官方网站。
作者：Wenbo Hu、Shraman Pramanick、Krishna Kumar Singh、Nanyun Peng、Kai-Wei Chang、Yong Jae Lee；
Adobe Research 与 UCLA。

线上地址：<https://tev-agent.github.io/>（GitHub Pages，从 `tev-agent/tev-agent.github.io` 的 `main` 分支提供）。

一个没有任何构建步骤的静态页面：`index.html`、`static/css/style.css`、`static/js/main.js`。
数学公式使用 KaTeX 渲染，字体来自 Google Fonts，两者均通过 CDN 加载。

## 本地预览

```bash
python3 -m http.server 8000   # 然后打开 http://localhost:8000
```

## 内容说明

| 路径 | 说明 |
|---|---|
| `static/images/teaser.*`、`pipeline.*` | 论文插图，以 216 dpi 渲染（显示为 WebP，点击后切换为 PNG） |
| `static/images/traces.svg` | 进度势能曲线图，由论文的 TikZ 源码重新编译生成 |
| `static/images/tb4_ranking.*` | 图 2（TB 4.0-CM 排名），由 `figures/tb4_ranking/fig_tb4_ranking.pdf` 以 324 dpi 渲染 |
| `videos/tev_launch_v6.mp4` | 发布视频，在页面最前面播放；由 `launch/video/out/tev_launch_v6.mp4`（H.264 CRF 20）重新编码，以保持在 GitHub 的 100 MB 文件大小限制之内 |
| `videos/tev_academic.mp4` | 论文视频，在摘要之后播放；是 `launch/tev_academic.mp4` 的一份副本 |
| `static/images/*_poster.webp` | 两个视频的封面帧 |
| `static/tev_paper.pdf` | 论文本身，是 `Tev_arXiv` 仓库中 `main_red.pdf`（红色主题构建版）的一份副本；页面已不再链接到它 |

表格中的每一个数字都抄自论文的 LaTeX 源码（`main.tex`）。如果论文发生变化，请同步更新这里的表格以保持一致。

"The Paper" 按钮链接到 arXiv PDF：<https://arxiv.org/pdf/2610.18868>，arXiv 按钮链接到摘要页：
<https://arxiv.org/abs/2610.18868>。两个 Hugging Face 按钮分别链接到模型权重
<https://huggingface.co/gordonhu/Tev-27B> 与 <https://huggingface.co/gordonhu/Tev-320B>，X 按钮链接到发布推文。
代码与数据按钮标注为 "soon"（即将推出）；待真实链接可用后请替换进去。
