> 译文来源：论文 "Tev: Scaling Long-Horizon Agentic Environments with Dense Progress Rewards"（arXiv:2610.18868，<https://arxiv.org/abs/2610.18868>）的第 5 节"相关工作"与第 6 节"结论"。以下为中文翻译，公式与引用标记保留原样。

## 5 相关工作

**面向编码与终端 agent 的合成语料。** 近期的语料通常从代码仓库中挖掘 issue 与测试，或使用语言模型生成诸如"注入 bug 的仓库"和"重建的终端会话"这类任务（[Jimenez et al., 2024](#bib.bib1); [Yang et al., 2025a](#bib.bib31); [Ivison et al., 2026](#bib.bib29); [Lin et al., 2026](#bib.bib41)）。另一些工作则扩展可执行的工具使用环境及其成功判据（[Cai et al., 2025](#bib.bib70); [Fang et al., 2025](#bib.bib57)），不过只有当难度得到控制时扩展才有帮助（[Zhu et al., 2026b](#bib.bib60)）。相比之下，我们的环境包含横跨数学与科学、机器学习、编码与系统的长链条多阶段工作流；它们由带种子的生成器代码实例化，而非由语言模型直接撰写；并且为每个任务提供稠密的进度信号。

**反向构造。** 从已知解出发推导任务是一类成熟的方法：去噪、受控错误注入、代码变异、环境回溯（rewinding）、指令回译（back-translation）以及程序化谜题生成，都在损坏或反转某个真值已知的单一制品（[Lewis et al., 2020](#bib.bib43); [Arocena et al., 2015](#bib.bib63); [Tran et al., 2013](#bib.bib64); [Yang et al., 2025a](#bib.bib31); [Hariharan et al., 2025](#bib.bib36); [Lin et al., 2026](#bib.bib41); [Li et al., 2023](#bib.bib44); [Wu et al., 2024](#bib.bib45); [Stojanovski et al., 2025](#bib.bib46); [Chen et al., 2025a](#bib.bib47); [Liu et al., 2025](#bib.bib48); [Li et al., 2025](#bib.bib49)）。
我们改为损坏整个潜在世界的一份渲染结果，因此任务、验证器与进度信号全都是同一个世界的函数，而不是各自独立生成、可能彼此漂移的若干因子（[Zeng et al., 2026a](#bib.bib66); [Ivanov and Rana, 2026](#bib.bib72)）。

**agentic RL 中的稀疏奖励与稠密信号。** 现有方法通过过滤相同奖励、挑选接近 policy 当前能力的任务，或添加专家前缀，来避免无信息量的 rollout 组（[Yu et al., 2025](#bib.bib3); [Florensa et al., 2018](#bib.bib76); [Zhang et al., 2025c](#bib.bib10)）。
另一些路线则通过学习得到的评委（[Cui et al., 2025](#bib.bib14); [Choudhury, 2025](#bib.bib13)）或诸如测试通过率之类的代理信号（[Du et al., 2025](#bib.bib22); [Shen et al., 2026](#bib.bib23); [Yang et al., 2026](#bib.bib24)）来提供更稠密的反馈，但这些方法需要额外的模型，或者只能捕捉终止结果。
我们的势能 $\Phi$ 则在每一个工作流阶段上，针对潜在世界度量精确的进展与回退，既不需要 critic，也不需要语言模型评委。
完整的相关工作请参见附录 [D](#A4)。

## 6 结论

我们提出了一种"潜在世界优先"的方法，用于扩展可验证的长跨度 agent 训练。每个任务都从一个已知正确的潜在世界反向构建：世界被渲染为相互关联的文件，经过受控的损坏修改，然后被复用于精确验证与稠密的进度奖励。我们在 Tev-Gym 中实例化了这一方法——一个横跨七个领域、包含 1,170 个已验证环境的集合——并表明训练能同时提升 9B 与 27B 开放模型在 ALE-CM 上的表现，且这些收益可迁移到跨度不同的 Terminal-Bench 任务以及一个 320B base model 上。
我们当前研究的一个局限在于聚焦于合成的终端环境，在最难的基准上，我们的模型与领先的前沿 agent 之间仍存在差距。支撑新的工作流还需要撰写并验证额外的环境组件。未来的工作可以简化这一流程、扩展领域覆盖，并把由此得到的数据与更强的开放模型结合，从而让更多专业工作流可以在无需人工步骤标注或语言模型评委的前提下，用于可复现的 RL。
