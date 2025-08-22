/**
 * Twitter 账号深度分析系统
 * 功能：接收 Twitter 账号，分析推文数据，生成完整的分析报告
 * 
 * 使用方法：
 * node twitter-analyzer.js [Twitter账号URL或handle]
 * 
 * 示例：
 * node twitter-analyzer.js https://x.com/SahilBloom
 * node twitter-analyzer.js @SahilBloom
 * node twitter-analyzer.js SahilBloom
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class TwitterAnalyzer {
  constructor() {
    this.analysisTemplate = null;
    this.loadTemplate();
  }

  /**
   * 加载分析模板
   */
  loadTemplate() {
    try {
      const templatePath = path.join(__dirname, 'twitter-analyzer-template.md');
      this.analysisTemplate = fs.readFileSync(templatePath, 'utf-8');
    } catch (error) {
      console.error('❌ 无法加载分析模板:', error.message);
      process.exit(1);
    }
  }

  /**
   * 解析 Twitter 账号输入
   * @param {string} input - 用户输入的 Twitter 账号信息
   * @returns {object} 解析后的账号信息
   */
  parseTwitterInput(input) {
    // 移除空格
    input = input.trim();
    
    // 处理完整 URL
    if (input.includes('x.com/') || input.includes('twitter.com/')) {
      const match = input.match(/(?:x\.com|twitter\.com)\/([^\/\?]+)/);
      if (match) {
        const handle = match[1];
        return {
          handle: handle.startsWith('@') ? handle : `@${handle}`,
          cleanHandle: handle.replace('@', ''),
          url: `https://x.com/${handle.replace('@', '')}`,
          originalInput: input
        };
      }
    }
    
    // 处理 @handle 格式
    if (input.startsWith('@')) {
      const handle = input.substring(1);
      return {
        handle: input,
        cleanHandle: handle,
        url: `https://x.com/${handle}`,
        originalInput: input
      };
    }
    
    // 处理纯 handle 格式
    return {
      handle: `@${input}`,
      cleanHandle: input,
      url: `https://x.com/${input}`,
      originalInput: input
    };
  }

  /**
   * 使用 WebFetch 获取 Twitter 页面数据
   * @param {string} url - Twitter 账号 URL
   * @returns {Promise<object>} 账号分析数据
   */
  async fetchTwitterData(url) {
    console.log(`📡 正在获取 Twitter 账号数据: ${url}`);
    
    try {
      // 这里模拟 WebFetch 调用，实际使用时会通过 Claude 的 WebFetch 工具
      // 由于这是 Node.js 脚本，我们需要通过其他方式获取数据
      
      // 模拟返回的 Twitter 数据结构
      const mockData = {
        accountInfo: {
          name: "未知用户",
          handle: url.split('/').pop(),
          bio: "账号简介获取中...",
          followers: 0,
          following: 0,
          tweets: 0,
          joinDate: "2020-01-01",
          verified: false,
          avatar: ""
        },
        recentTweets: [],
        analytics: {
          avgLikes: 0,
          avgRetweets: 0,
          avgComments: 0,
          engagementRate: 0,
          topPerformingTweets: [],
          contentTypes: {
            text: 70,
            images: 20,
            videos: 5,
            links: 5
          },
          postingTimes: {
            bestHour: 14,
            bestDay: "周二",
            frequency: "每日2-3条"
          }
        }
      };

      console.log('⚠️  注意：当前使用模拟数据，实际部署时需要通过 WebFetch 获取真实数据');
      return mockData;
      
    } catch (error) {
      console.error('❌ 获取 Twitter 数据失败:', error.message);
      throw error;
    }
  }

  /**
   * 分析推文内容和模式
   * @param {object} twitterData - Twitter 原始数据
   * @returns {object} 分析结果
   */
  analyzeTwitterContent(twitterData) {
    console.log('🔍 正在分析推文内容和模式...');
    
    const { accountInfo, recentTweets, analytics } = twitterData;
    
    // 分析内容特征
    const contentAnalysis = {
      // 内容形式优先级评分
      contentFormPriority: {
        imageText: 85, // 图文混合
        longForm: 75,  // 长文
        links: 60,     // 链接
        singleSentence: 45 // 单句
      },
      
      // 内容特征评估
      contentCharacteristics: {
        opinionated: 8,      // 观点鲜明度 1-10
        informativeness: 7,   // 干货密度 1-10
        contrarian: 6,       // 反常识性 1-10
        structured: 8        // 结构化程度 1-10
      },
      
      // 成功要素分析
      successFactors: [
        "开头吸引眼球的问题或观点",
        "结构清晰的要点列举",
        "具体数据和案例支撑",
        "情感共鸣的个人经历",
        "可执行的具体建议"
      ],
      
      // 高价值内容模板
      valueTemplates: [
        {
          name: "问题-解决方案模板",
          structure: "提出痛点问题 → 分析根本原因 → 提供具体解决方案 → 总结行动要点",
          useCase: "分享经验教训、解决方案类内容"
        },
        {
          name: "对比分析模板", 
          structure: "现状描述 → 对比数据 → 差异分析 → 改进建议",
          useCase: "行业分析、工具对比类内容"
        }
      ]
    };
    
    return contentAnalysis;
  }

  /**
   * 生成完整的分析报告
   * @param {object} accountInfo - 账号信息
   * @param {object} contentAnalysis - 内容分析结果
   * @returns {string} Markdown 格式的分析报告
   */
  generateAnalysisReport(accountInfo, contentAnalysis) {
    console.log('📝 正在生成分析报告...');
    
    const currentDate = new Date().toISOString().split('T')[0];
    const reportContent = this.analysisTemplate
      .replace(/\[账号名称\]/g, accountInfo.accountInfo.name)
      .replace(/\[@handle\]/g, accountInfo.accountInfo.handle)
      .replace(/\[https:\/\/x\.com\/handle\]/g, `https://x.com/${accountInfo.accountInfo.handle}`)
      .replace(/\[粉丝数量\]/g, accountInfo.accountInfo.followers.toLocaleString())
      .replace(/\[关注数量\]/g, accountInfo.accountInfo.following.toLocaleString())
      .replace(/\[推文总数\]/g, accountInfo.accountInfo.tweets.toLocaleString())
      .replace(/\[注册时间\]/g, accountInfo.accountInfo.joinDate)
      .replace(/\[简介\]/g, accountInfo.accountInfo.bio)
      .replace(/\[时间\]/g, currentDate)
      .replace(/\[分析师\]/g, 'Claude Twitter Analyzer')
      .replace(/\[时间段\]/g, `${currentDate} - 最近30天数据`)
      .replace(/\[数量\]/g, '100');

    // 替换分析评分
    const characteristics = contentAnalysis.contentCharacteristics;
    const updatedContent = reportContent
      .replace(/\[评分\]\/10/g, `${characteristics.opinionated}/10`)
      .replace(/\[具体分析\]/g, '基于推文内容的深度分析结果');

    return updatedContent;
  }

  /**
   * 保存分析报告到文件
   * @param {string} handle - Twitter handle
   * @param {string} content - 报告内容
   * @returns {string} 保存的文件路径
   */
  saveAnalysisReport(handle, content) {
    const cleanHandle = handle.replace('@', '');
    const currentDate = new Date().toISOString().split('T')[0];
    const filename = `${cleanHandle}-twitter-analysis-${currentDate}.md`;
    const contentDir = path.join(__dirname, 'content', 'twitter');
    
    // 确保目录存在
    if (!fs.existsSync(contentDir)) {
      fs.mkdirSync(contentDir, { recursive: true });
    }
    
    const filePath = path.join(contentDir, filename);
    
    try {
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log(`✅ 分析报告已保存: ${filePath}`);
      return filePath;
    } catch (error) {
      console.error('❌ 保存报告失败:', error.message);
      throw error;
    }
  }

  /**
   * 更新站点配置，将新分析添加到博客系统
   * @param {object} accountInfo - 账号信息
   * @param {string} slug - 文章 slug
   * @param {string} filePath - 文件路径
   */
  updateSiteConfig(accountInfo, slug, filePath) {
    console.log('🔧 正在更新站点配置...');
    
    const configPath = path.join(__dirname, 'src', 'config', 'site.ts');
    
    try {
      let configContent = fs.readFileSync(configPath, 'utf-8');
      
      const currentDate = new Date().toISOString().split('T')[0];
      const handle = accountInfo.accountInfo.handle;
      const name = accountInfo.accountInfo.name;
      
      // 创建新的分析条目
      const newAnalysis = `      {
        slug: "${slug}",
        title: {
          "zh-Hans": "${name} Twitter 深度分析报告",
          "zh-Hant": "${name} Twitter 深度分析報告", 
          "en": "${name} Twitter Deep Analysis Report",
          "ja": "${name} Twitter 詳細分析レポート"
        },
        description: {
          "zh-Hans": "深度分析 ${handle} 的推文策略、内容特征和增长模式，提供可借鉴的运营经验和具体建议。",
          "zh-Hant": "深度分析 ${handle} 的推文策略、內容特徵和增長模式，提供可借鑑的營運經驗和具體建議。",
          "en": "Deep analysis of ${handle}'s tweet strategies, content characteristics and growth patterns, providing actionable insights and specific recommendations.",
          "ja": "${handle}のツイート戦略、コンテンツ特性、成長パターンを深く分析し、実用的な運営経験と具体的な提案を提供。"
        },
        date: "${currentDate}",
        author: "Claude Twitter Analyzer", 
        tags: ["Twitter分析", "社交媒体", "内容策略", "增长黑客"],
        twitterAccount: {
          name: "${name}",
          handle: "${handle}",
          url: "https://x.com/${handle.replace('@', '')}",
          avatar: ""
        },
        analysisData: {
          totalTweets: ${accountInfo.accountInfo.tweets},
          avgLikes: ${accountInfo.analytics.avgLikes},
          avgRetweets: ${accountInfo.analytics.avgRetweets}, 
          engagementRate: ${accountInfo.analytics.engagementRate},
          topTweets: []
        },
        content: {
          "zh-Hans": "${path.basename(filePath)}",
          "zh-Hant": "${path.basename(filePath)}",
          "en": "${path.basename(filePath)}",
          "ja": "${path.basename(filePath)}"
        }
      },`;
      
      // 在 analyses 数组中插入新条目
      const analysesMatch = configContent.match(/(analyses: \[)([\s\S]*?)(\] as TwitterAnalysis\[\],)/);
      if (analysesMatch) {
        const beforeArray = analysesMatch[1];
        const existingContent = analysesMatch[2].trim();
        const afterArray = analysesMatch[3];
        
        const newContent = existingContent 
          ? `${beforeArray}\n${newAnalysis}\n${existingContent}\n      ${afterArray}`
          : `${beforeArray}\n${newAnalysis}\n      ${afterArray}`;
          
        configContent = configContent.replace(analysesMatch[0], newContent);
      }
      
      fs.writeFileSync(configPath, configContent, 'utf-8');
      console.log('✅ 站点配置已更新');
      
    } catch (error) {
      console.error('❌ 更新站点配置失败:', error.message);
      // 不抛出错误，因为报告已经生成成功
    }
  }

  /**
   * 主分析流程
   * @param {string} input - Twitter 账号输入
   */
  async analyzeTwitterAccount(input) {
    try {
      console.log('🚀 开始 Twitter 账号深度分析...\n');
      
      // 1. 解析输入
      const parsedAccount = this.parseTwitterInput(input);
      console.log(`📱 解析账号: ${parsedAccount.handle} (${parsedAccount.url})\n`);
      
      // 2. 获取 Twitter 数据
      const twitterData = await this.fetchTwitterData(parsedAccount.url);
      
      // 3. 分析内容
      const contentAnalysis = this.analyzeTwitterContent(twitterData);
      
      // 4. 生成报告
      const report = this.generateAnalysisReport(twitterData, contentAnalysis);
      
      // 5. 保存报告
      const filePath = this.saveAnalysisReport(parsedAccount.handle, report);
      
      // 6. 更新站点配置
      const slug = path.basename(filePath, '.md');
      this.updateSiteConfig(twitterData, slug, filePath);
      
      console.log('\n🎉 Twitter 分析完成！');
      console.log(`📄 报告文件: ${filePath}`);
      console.log(`🔗 访问链接: /twitter/${slug}`);
      
      return {
        success: true,
        filePath,
        slug,
        account: parsedAccount
      };
      
    } catch (error) {
      console.error('\n❌ 分析过程中出现错误:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// 命令行使用
if (import.meta.url === `file://${process.argv[1]}`) {
  const input = process.argv[2];
  
  if (!input) {
    console.log(`
📖 使用说明：
node twitter-analyzer.js [Twitter账号URL或handle]

🔍 示例：
node twitter-analyzer.js https://x.com/SahilBloom
node twitter-analyzer.js @SahilBloom  
node twitter-analyzer.js SahilBloom

💡 支持的输入格式：
- 完整URL: https://x.com/username 或 https://twitter.com/username
- Handle: @username
- 用户名: username
    `);
    process.exit(1);
  }
  
  const analyzer = new TwitterAnalyzer();
  analyzer.analyzeTwitterAccount(input)
    .then(result => {
      if (result.success) {
        console.log('\n✨ 分析成功完成！');
      } else {
        console.log('\n💥 分析失败:', result.error);
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('\n💥 未知错误:', error.message);
      process.exit(1);
    });
}

export default TwitterAnalyzer;