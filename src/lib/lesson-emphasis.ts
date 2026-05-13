const IMPORTANT_TERMS = [
  "ユーラシア大陸",
  "北アメリカ",
  "南アメリカ",
  "オーストラリア",
  "本初子午線",
  "チグリス川・ユーフラテス川",
  "象形文字（ヒエログリフ）",
  "大仙古墳（仁徳天皇陵）",
  "十七条の憲法",
  "冠位十二階",
  "日本アルプス",
  "リアス海岸",
  "アマゾン川",
  "ヒマラヤ山脈",
  "アンデス山脈",
  "アルプス山脈",
  "二酸化炭素",
  "アンモニア",
  "下方置換法",
  "上方置換法",
  "水上置換法",
  "光合成",
  "被子植物",
  "裸子植物",
  "単子葉類",
  "双子葉類",
  "孔辺細胞",
  "維管束",
  "沸点",
  "融点",
  "密度",
  "溶質",
  "溶媒",
  "溶液",
  "正の数",
  "負の数",
  "絶対値",
  "素因数分解",
  "分配法則",
  "方程式",
  "比例",
  "反比例",
  "比例定数",
  "平行移動",
  "回転移動",
  "対称移動",
  "錯角",
  "同位角",
  "中心角",
  "文字式",
  "係数",
  "代入",
  "be動詞",
  "一般動詞",
  "疑問文",
  "否定文",
  "主語",
  "代名詞",
  "名詞",
  "所有格",
  "母音字",
  "子音字",
  "大文字",
  "小文字",
  "説明文",
  "物語文",
  "接続語",
  "指示語",
  "キーワード",
  "筆者の主張",
  "具体例",
  "心情",
  "情景描写",
  "場面",
  "主題",
  "類義語",
  "対義語",
  "部首",
  "音読み",
  "訓読み",
  "品詞",
  "形容詞",
  "形容動詞",
  "接続詞",
  "副詞",
  "感動詞",
  "三段構成",
  "直喩",
  "隠喩",
  "擬人法",
  "体言止め",
  "太平洋",
  "大西洋",
  "インド洋",
  "六大陸",
  "三大洋",
  "緯度",
  "経度",
  "赤道",
  "時差",
  "縄文時代",
  "弥生時代",
  "卑弥呼",
  "大和政権",
  "聖徳太子",
] as const;

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const TERM_PATTERN = new RegExp(
  IMPORTANT_TERMS
    .slice()
    .sort((a, b) => b.length - a.length)
    .map(escapeRegex)
    .join("|"),
  "g",
);

export function emphasizeLessonTerms(markdown: string): string {
  const protectedSegments: string[] = [];
  const protect = (segment: string) => {
    const token = `@@PROTECTED_${protectedSegments.length}@@`;
    protectedSegments.push(segment);
    return token;
  };

  const restored = markdown
    .replace(/```[\s\S]*?```/g, protect)
    .replace(/`[^`\n]+`/g, protect)
    .replace(/\*\*[^*\n]+\*\*/g, protect)
    .split("\n")
    .map((line) => {
      if (/^\s{0,3}#{1,6}\s/.test(line)) return line;
      if (/^\s{0,3}>/.test(line)) return line;
      return line.replace(TERM_PATTERN, (term) => `**${term}**`);
    })
    .join("\n");

  return protectedSegments.reduce(
    (text, segment, index) => text.replace(`@@PROTECTED_${index}@@`, segment),
    restored,
  );
}
