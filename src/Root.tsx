import React from "react";
import { Composition, registerRoot } from "remotion";
import { DailyExplainer } from "./compositions/DailyExplainer";
import type { ExplainerContent } from "./compositions/DailyExplainer";
import { ToolTutorial } from "./compositions/ToolTutorial";
import type { TutorialContent } from "./compositions/ToolTutorial";
import { QuoteCard } from "./compositions/QuoteCard";
import type { QuoteContent } from "./compositions/QuoteCard";

// ══════════════════════════════════════════════════════════════════
//  Default sample content for Studio preview
// ══════════════════════════════════════════════════════════════════

const SAMPLE_EXPLAINER: ExplainerContent = {
  style: "explainer",
  title: "企业做AI，第一步别贪大",
  subtitle: "先跑通一个最小闭环",
  hook: "很多企业上来就想全员培训、全流程改造",
  problemItems: [
    "全员培训，课上兴奋课后照旧",
    "全流程改造，范围太大难定位",
    "全岗位覆盖，效果好坏说不清",
  ],
  methodTitle: "最小闭环三步走",
  methodItems: [
    { title: "工具体验", desc: "让员工知道AI能干什么" },
    { title: "流程试点", desc: "选一个流程先改造" },
    { title: "指标闭环", desc: "盯一个指标看效果" },
  ],
  caseIntro: "销售AI试点 · 五步法",
  caseSteps: [
    "边界缩到最小：只处理官网咨询",
    "整理标准输入：客户信息清洗",
    "AI自动三件事：判意向·提问题·出提纲",
    "人工审核：销售检查+主管抽查",
    "盯一个指标：48小时跟进率",
  ],
  summary: "先小到能看见，才有机会大到能复制",
  cta: "先跑通一个最小闭环，再谈复制和放大",
};

const SAMPLE_TUTORIAL: TutorialContent = {
  style: "tutorial",
  title: "用AI写销售跟进邮件",
  subtitle: "3步搞定，效率提升10倍",
  hook: "还在手动写跟进邮件？效率低，效果差",
  problemText: "销售每天花2小时写跟进邮件，格式不一、遗漏信息、跟进不及时",
  toolName: "AI邮件助手",
  steps: [
    { title: "导入模板", desc: "上传最佳邮件模板供AI学习" },
    { title: "输入客户信息", desc: "粘贴客户资料或录入关键字段" },
    { title: "AI生成+微调", desc: "一键生成初稿，5分钟完成审核" },
  ],
  tipTitle: "使用技巧",
  tipItems: [
    "模板越多效果越好，建议至少5个",
    "审核时重点改语气和称呼",
    "记录常用修改，AI会越用越准",
  ],
  cta: "关注我，每天学一个AI提效技巧",
};

const SAMPLE_QUOTE: QuoteContent = {
  style: "quote",
  title: "关于AI落地的3个真相",
  quotes: [
    { text: "AI的价值不在于取代人，而在于放大人的判断力", author: "陈皓" },
    { text: "先小到能看见，才有机会大到能复制", author: "最小闭环原则" },
    { text: "工具很多，闭环很少——大部分企业只停留在体验阶段", author: "观察" },
  ],
  insightTitle: "核心洞察",
  insightItems: [
    "选一个最小的业务动作",
    "用AI完成它并量化效果",
    "验证可行再横向复制",
  ],
  reflection: "你的团队有没有一个可以先用AI试起来的动作？",
  source: "陈皓AI实验室",
};

// ══════════════════════════════════════════════════════════════════
//  Root — register 3 compositions for 3 video styles
// ══════════════════════════════════════════════════════════════════

const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Explainer"
        component={DailyExplainer}
        durationInFrames={1800}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ content: SAMPLE_EXPLAINER }}
      />
      <Composition
        id="Tutorial"
        component={ToolTutorial}
        durationInFrames={1800}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ content: SAMPLE_TUTORIAL }}
      />
      <Composition
        id="Quote"
        component={QuoteCard}
        durationInFrames={1800}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ content: SAMPLE_QUOTE }}
      />
    </>
  );
};

registerRoot(RemotionRoot);
