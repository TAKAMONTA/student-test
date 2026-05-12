INSERT INTO topics (id, subject_id, slug, name, "order") VALUES (1, 1, 'kokugo-1', '説明文の読み方', 1);
INSERT INTO lessons (topic_id, content_md, estimated_minutes) VALUES (1, '# 説明文の読み方

## 説明文とは？
説明文とは、**事実や情報をわかりやすく伝える文章**です。物語文と違い、筆者の考えや事実を論理的に述べています。

## 読むときのポイント

### 1. 話題（トピック）をつかむ
「この文章は何について書かれているか」を最初に確認しましょう。タイトルや最初の段落にヒントがあることが多いです。

### 2. 段落の役割を考える
各段落には役割があります。
- **序論**：話題の導入
- **本論**：具体的な説明・根拠
- **結論**：まとめ・筆者の主張

### 3. キーワードに注目する
繰り返し出てくる言葉や、「つまり」「なぜなら」「したがって」などの**接続語**に注目しましょう。

### 4. 筆者の主張を見つける
「〜である」「〜と考える」などの表現が筆者の意見のサインです。事実と意見を区別して読むことが大切です。

## まとめ
説明文は**段落構成・接続語・キーワード**の三つに注目して読むと、内容が整理しやすくなります。', 5);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (1, 'multi_choice', '説明文を読むときに、筆者の主張（意見）を見つけるための手がかりとして最も適切なものはどれですか？', '["「〜である」「〜と考える」などの表現","登場人物の会話文","文章のタイトルだけ","文章の長さ"]', '「〜である」「〜と考える」などの表現', '説明文では、「〜である」「〜と考える」「〜べきだ」などの表現が、筆者の意見・主張を示すサインです。事実の説明と区別して読むことが重要です。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (1, 'multi_choice', '次の接続語のうち、前の内容を「理由・根拠」として示すときに使われるものはどれですか？', '["なぜなら","しかし","つまり","たとえば"]', 'なぜなら', '「なぜなら」は直前の内容の理由や根拠を述べるときに使う接続語です。「しかし」は逆接、「つまり」は言い換え・まとめ、「たとえば」は具体例を示すときに使います。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (1, 'multi_choice', '説明文の「結論」の段落にあたるものはどれですか？', '["筆者の主張やまとめが書かれた段落","具体的な例が多く書かれた段落","話題を初めて紹介する段落","登場人物が紹介される段落"]', '筆者の主張やまとめが書かれた段落', '説明文は「序論（導入）→本論（説明・根拠）→結論（まとめ・主張）」の三段構成が基本です。結論には筆者が最も伝えたいことが書かれていることが多いです。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (1, 'short_answer', '説明文において、同じ言葉や表現が文章中に繰り返し出てくるとき、その言葉を何と呼びますか？（漢字3文字で答えてください）', NULL, 'キーワード', '繰り返し登場する言葉を「キーワード（重要語）」と言います。筆者がとくに伝えたい概念や主張に関わる言葉であることが多く、内容を理解する手がかりになります。', 2);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (1, 'short_answer', '次の文の（　）に入る接続語を答えてください。
「この地域では年間を通じて雨が多い。（　）、植物が豊かに育つ。」', NULL, 'したがって', '「したがって」は前の内容を原因・根拠として、結果や結論を導く接続語（順接）です。「雨が多い→植物が豊かに育つ」という因果関係を表しています。「そのため」「ゆえに」も正解として認められます。', 2);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (1, 'numeric', 'ある説明文は全部で15段落あります。序論が2段落、結論が3段落のとき、本論は何段落ですか？', NULL, '10', '本論の段落数＝全体の段落数－序論－結論　で求められます。15－2－3＝10段落です。説明文では本論が最も多くの段落を占め、具体的な説明や根拠が展開されます。', 2);
INSERT INTO topics (id, subject_id, slug, name, "order") VALUES (2, 1, 'kokugo-2', '物語文の読み方', 2);
INSERT INTO lessons (topic_id, content_md, estimated_minutes) VALUES (2, '# 物語文の読み方

## 物語文を読むときの3つのポイント

### 1. 登場人物の「気持ち」を読み取る
物語の中心は**登場人物の心情の変化**です。
- 登場人物がどんな行動をしているか
- どんな言葉を話しているか（セリフ）
- 情景描写（景色・天気など）が気持ちを表していることも！

### 2. 場面の変化をつかむ
物語は「場面」のまとまりで構成されています。
- 時間・場所・登場人物が変わると**場面が変わる**サイン
- 各場面で何が起きているかを整理しましょう

### 3. 主題（テーマ）を読み取る
作者が物語を通して**伝えたいこと**が主題です。
- 登場人物が最終的にどう変わったかに注目
- 「この話を通して何を学べるか」と考えてみよう

> 📝 **読むときのコツ**：線を引きながら読み、「なぜ？」と問いかける習慣をつけましょう！', 5);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (2, 'multi_choice', '物語文を読むとき、登場人物の気持ちを読み取るヒントとして**適切でないもの**はどれですか？', '["登場人物のセリフや言葉づかいに注目する","物語が書かれた年代を調べる","登場人物の行動や様子を手がかりにする","天気や景色などの情景描写に注目する"]', '物語が書かれた年代を調べる', '登場人物の気持ちを読み取るには、セリフ・行動・情景描写などが有効な手がかりです。物語が書かれた年代は背景知識として役立つ場合もありますが、気持ちを直接読み取るヒントにはなりません。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (2, 'multi_choice', '次のうち、物語の「場面が変わった」ことを示すサインとして最も適切なものはどれですか？', '["登場人物の名前が漢字で書かれている","時間・場所・登場人物が変わっている","文章が長くなっている","会話文（セリフ）が増えている"]', '時間・場所・登場人物が変わっている', '場面の転換は「時間」「場所」「登場人物」の変化によって判断します。これらが変わったとき、物語の場面が切り替わったと読み取ることができます。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (2, 'multi_choice', '物語文における「主題（テーマ）」の説明として最も正しいものはどれですか？', '["物語の中で一番長い場面のこと","作者が物語を通して読者に伝えたいこと","登場人物の名前と特徴をまとめたもの","物語の中に登場する難しい言葉の意味"]', '作者が物語を通して読者に伝えたいこと', '主題（テーマ）とは、作者が物語全体を通して読者に伝えようとしているメッセージや考えのことです。登場人物の変化や物語の結末に注目すると読み取りやすくなります。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (2, 'short_answer', '次の文章を読んで、太郎の気持ちを表す言葉を本文中から抜き出しなさい。

「運動会の徒競走でビリになった太郎は、家に帰っても夕飯を食べずに自分の部屋にこもり、枕に顔を埋めた。」', NULL, '悔しい（くやしい）／悲しい', '太郎は徒競走でビリになり、夕飯も食べずに部屋にこもって枕に顔を埋めています。この行動描写から、太郎が「悔しい」「悲しい」気持ちであることが読み取れます。直接「悔しい」という言葉はありませんが、行動から心情を推測することが物語読解の重要なスキルです。', 2);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (2, 'short_answer', '物語文で「情景描写」が使われる目的を、「登場人物の」という書き出しで簡潔に答えなさい。', NULL, '登場人物の気持ち（心情）を表すため', '情景描写（天気・季節・風景など）は、単に場面の背景を説明するだけでなく、登場人物の心情を間接的に表す役割があります。例えば、悲しい場面での雨の描写や、希望に満ちた場面での晴れの描写などがその典型例です。', 2);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (2, 'numeric', 'ある物語文は全部で5つの場面で構成されています。先生が「それぞれの場面につき2つずつ、登場人物の気持ちを表す表現を見つけなさい」という課題を出しました。クラス全員（30人）がこの課題をこなすと、クラス全体で見つけた表現は合計何個になりますか？', NULL, '300', '1つの場面につき2つの表現を見つけるので、1人あたり「5場面 × 2個 = 10個」の表現を見つけます。クラス全員（30人）分を合計すると「10個 × 30人 = 300個」になります。', 2);
INSERT INTO topics (id, subject_id, slug, name, "order") VALUES (3, 2, 'sugaku-1', '正の数・負の数', 1);
INSERT INTO lessons (topic_id, content_md, estimated_minutes) VALUES (3, '# 正の数・負の数

## 正の数と負の数とは？

0より大きい数を**正の数**、0より小さい数を**負の数**といいます。

- 正の数：+1、+2、+3.5 など（＋符号は省略可）
- 負の数：−1、−2、−3.5 など

## 数直線

数直線では、0を基準に右が正の数、左が負の数になります。

```
← −3  −2  −1   0  +1  +2  +3 →
```

## 絶対値

数直線上で、ある数と0との**距離**を**絶対値**といいます。

- |+5| = 5
- |−5| = 5
- |0| = 0

正の数・負の数の大小は、数直線の**右にあるほど大きい**です。

> 例：−1 > −3（−1は−3より右にあるので大きい）

## 加法・減法のポイント

- 同符号の和 → 絶対値の和に共通の符号
- 異符号の和 → 絶対値の差に絶対値が大きい方の符号', 5);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (3, 'multi_choice', '次のうち、負の数はどれですか？', '["+3","0","−7","5"]', '−7', '負の数は0より小さい数です。−7は0より小さいので負の数です。+3と5は正の数、0は正でも負でもありません。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (3, 'multi_choice', '次の数を小さい順に並べたとき、2番目に小さい数はどれですか？
　−4、+2、−1、+5', '["+5","+2","−1","−4"]', '−1', '数直線上で右にあるほど大きい数です。小さい順に並べると −4 < −1 < +2 < +5 となります。2番目に小さいのは −1 です。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (3, 'multi_choice', '|−8| の値として正しいものはどれですか？', '["−8","8","0","1/8"]', '8', '絶対値とは数直線上で0からの距離です。−8は0から8だけ離れているので、|−8| = 8 です。絶対値は必ず0以上になります。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (3, 'short_answer', '次の□にあてはまる不等号（＞または＜）を答えなさい。
　−3 □ −6', NULL, '>', '数直線上で−3は−6より右にあります。右にある数の方が大きいので、−3 > −6 です。負の数は絶対値が大きいほど小さくなることに注意しましょう。', 2);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (3, 'numeric', '次の計算をしなさい。
　(−4) + (−9)', NULL, '-13', '同符号（どちらも負）の数の和は、絶対値の和に共通の符号（−）をつけます。4 + 9 = 13 なので、答えは −13 です。', 2);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (3, 'numeric', '次の計算をしなさい。
　(+7) + (−10)', NULL, '-3', '異符号の数の和は、絶対値の差に絶対値が大きい方の符号をつけます。絶対値は7と10で差は3。絶対値が大きいのは10（負）なので、答えは −3 です。', 2);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (3, 'numeric', '次の計算をしなさい。
　(−5) − (−3)', NULL, '-2', '引き算は、引く数の符号を変えて足し算にします。(−5) − (−3) = (−5) + (+3) となります。異符号の和なので、絶対値の差 5 − 3 = 2 に絶対値が大きい方の符号（−）をつけて −2 です。', 3);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (3, 'numeric', '次の計算をしなさい。
　(−3) × (−4)', NULL, '12', '負の数どうしの積（かけ算）は正の数になります。符号：(−) × (−) = (+)、絶対値：3 × 4 = 12 なので、答えは +12 = 12 です。', 2);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (3, 'numeric', '次の計算をしなさい。
　(−18) ÷ (+6)', NULL, '-3', '異符号の数の商（割り算）は負の数になります。符号：(−) ÷ (+) = (−)、絶対値：18 ÷ 6 = 3 なので、答えは −3 です。', 2);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (3, 'multi_choice', '次の計算の結果として正しいものはどれですか？
　(−2)³', '["8","−8","6","−6"]', '−8', '(−2)³ = (−2) × (−2) × (−2) です。まず (−2) × (−2) = +4、次に (+4) × (−2) = −8 となります。負の数の奇数乗は負になります。', 3);
INSERT INTO topics (id, subject_id, slug, name, "order") VALUES (4, 2, 'sugaku-2', '文字と式', 2);
INSERT INTO lessons (topic_id, content_md, estimated_minutes) VALUES (4, '# 文字と式

## 文字を使う理由
数の代わりに **文字（a, b, x, y など）** を使うと、いろいろな数に共通するきまりを表せます。

## 積の表し方
文字式では、かけ算の記号「×」を省略します。

- $a \times b = ab$
- $a \times 3 = 3a$（数字を文字の前に書く）
- $a \times a = a^2$
- $1 \times a = a$（1は省略する）

## 商の表し方
わり算の記号「÷」は使わず、**分数の形**で表します。

- $a \div 3 = \dfrac{a}{3}$

## 式の値
文字に数を代入すると式の値が求められます。

**例：** $x = 3$ のとき $2x + 1$ の値
$$2 \times 3 + 1 = 7$$

## 項と係数
$3x + 2y - 5$ において、$3x$・$2y$・$-5$ が**項**、$x$ の**係数**は $3$ です。', 5);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (4, 'multi_choice', '次のうち、文字式の表し方として正しいものはどれですか？', '["3a（a×3 を正しく表したもの）","a3（a×3 を表したもの）","a×3（そのまま書いたもの）","1a（a×1 を表したもの）"]', '3a（a×3 を正しく表したもの）', '文字式では「×」を省略し、数字を文字の前に書きます。a×3 は 3a と表します。また、1×a = a のように係数が1のときは1を省略します。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (4, 'multi_choice', '$x \div 5$ を文字式で正しく表しているものはどれですか？', '["x/5","5/x","5x","x÷5"]', 'x/5', '÷を使わずに分数で表します。x÷5 = x/5（x を5で割った分数）となります。5/x は x で5を割った式になるので誤りです。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (4, 'multi_choice', '式 $4x - 3y + 7$ について、$y$ の係数はどれですか？', '["-3","3","4","7"]', '-3', '$4x - 3y + 7$ は $4x + (-3y) + 7$ と考えます。$y$ にかかっている数（係数）はマイナスを含めて $-3$ です。符号を忘れずに読み取りましょう。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (4, 'short_answer', '$a = -2$ のとき、$3a + 5$ の値を求めなさい。', NULL, '-1', '$a = -2$ を代入すると、$3 \times (-2) + 5 = -6 + 5 = -1$ となります。負の数を代入するときは、かっこをつけて計算ミスを防ぎましょう。', 2);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (4, 'short_answer', '次の式を文字式のルールに従って正しく表しなさい。
$x \times x \times y \times (-3)$', NULL, '-3x²y', '数字を先に、次に文字をアルファベット順に並べます。$x \times x = x^2$ なので、$(-3) \times x \times x \times y = -3x^2y$ となります。', 2);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (4, 'numeric', '$x = 4$、$y = -1$ のとき、$2x^2 + 3y$ の値を求めなさい。', NULL, '29', '$x = 4$、$y = -1$ を代入すると、$2 \times 4^2 + 3 \times (-1) = 2 \times 16 + (-3) = 32 - 3 = 29$ となります。累乗の計算を先に行うことがポイントです。', 2);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (4, 'numeric', '1個 $a$ 円のりんごを5個と、1本 $b$ 円のジュースを3本買いました。合計金額を文字式で表したとき、$a = 120$、$b = 80$ のときの合計金額（円）を求めなさい。', NULL, '840', '合計金額は $5a + 3b$ 円です。$a = 120$、$b = 80$ を代入すると、$5 \times 120 + 3 \times 80 = 600 + 240 = 840$（円）となります。文字式で場面を表してから代入する流れを覚えましょう。', 3);
INSERT INTO topics (id, subject_id, slug, name, "order") VALUES (5, 2, 'sugaku-3', '平面図形', 3);
INSERT INTO lessons (topic_id, content_md, estimated_minutes) VALUES (5, '# 平面図形

## 基本の図形

平面図形とは、平らな面上に描かれた図形のことです。

### 直線・線分・半直線
- **直線**：両方向に限りなく伸びる線
- **線分**：2点を結ぶ有限の長さの線
- **半直線**：一方向にだけ限りなく伸びる線

### 角度
角は2本の半直線が交わってできます。
- **直角**：90°
- **平角**：180°
- **鋭角**：0°より大きく90°未満
- **鈍角**：90°より大きく180°未満

### 垂直と平行
- **垂直**：2直線が直角（90°）に交わること。記号は「⊥」
- **平行**：2直線がどこまでいっても交わらないこと。記号は「∥」

### 図形の移動
- **平行移動**：同じ方向に同じ距離だけずらす
- **回転移動**：ある点を中心に一定の角度だけ回す
- **対称移動**：ある直線を軸として折り返す（線対称）

基本の用語と概念をしっかり覚えましょう！', 5);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (5, 'multi_choice', '2本の直線が直角（90°）に交わるとき、この2直線の関係を何といいますか？', '["垂直","平行","対称","合同"]', '垂直', '2本の直線が90°（直角）で交わるとき、この2直線は「垂直」であるといいます。記号は「⊥」を使って表します。例えば、直線ℓと直線mが垂直のとき「ℓ⊥m」と書きます。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (5, 'multi_choice', '次の角度のうち、「鈍角」にあてはまるものはどれですか？', '["120°","90°","45°","180°"]', '120°', '鈍角とは、90°より大きく180°未満の角のことです。120°は90°＜120°＜180°を満たすので鈍角です。90°は直角、45°は鋭角（0°以上90°未満）、180°は平角と呼びます。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (5, 'short_answer', '図形を、ある直線を折り目として折り返したときに重なる移動を何といいますか？漢字4文字で答えなさい。', NULL, '対称移動', 'ある直線（対称の軸）を折り目として図形を折り返す移動を「対称移動」といいます。対称移動では、対応する点は対称の軸からの距離が等しく、軸に対して垂直に位置します。平行移動・回転移動と合わせて3つの基本的な図形の移動として覚えておきましょう。', 2);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (5, 'multi_choice', '直線と線分と半直線について正しく説明しているものはどれですか？', '["線分は両端があり、長さが定まる","直線は一方向だけに限りなく伸びる","半直線は両方向に限りなく伸びる","線分は長さを測ることができない"]', '線分は両端があり、長さが定まる', '線分とは2つの端点A・Bを結んだもので、長さが定まります。直線は両方向に限りなく伸び、半直線は一方の端点から一方向にだけ限りなく伸びます。それぞれの違いをしっかり区別して覚えましょう。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (5, 'numeric', '右の図で、直線ℓ∥直線mのとき、角xの大きさは何度ですか？ただし、平行な2直線に1本の直線が交わるとき、錯角は等しく、同位角も等しいとします。直線に交わる角の一方が70°、錯角の関係にある角がxのとき、xを求めなさい。', NULL, '70', '平行な2直線に1本の直線（横断線）が交わるとき、錯角は等しくなります。問題の角70°とxは錯角の関係にあるため、x＝70°となります。錯角・同位角・同側内角（補角）の関係は中1平面図形の重要事項です。同位角も等しく、同側内角の和は180°になります。', 2);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (5, 'numeric', '1つの円において、円周上の2点A・Bと円の中心Oを結んでできる角AOB（中心角）が120°のとき、残りの部分の中心角は何度ですか？', NULL, '240', '円の中心角の合計は360°です。中心角AOBが120°のとき、残りの部分の中心角は360°－120°＝240°となります。円全体の角度が360°であることは、図形問題を解くうえで基本となる知識です。', 2);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (5, 'short_answer', '平行移動・回転移動・対称移動のいずれの場合も変わらないものを1つ答えなさい。', NULL, '形と大きさ（合同）', '平行移動・回転移動・対称移動はいずれも図形の「形と大きさ」を変えない移動です。つまり、移動前と移動後の図形は合同になります。位置や向きは変わることがありますが、辺の長さや角の大きさは保たれます。', 2);
INSERT INTO topics (id, subject_id, slug, name, "order") VALUES (6, 3, 'eigo-1', 'アルファベット・発音', 1);
INSERT INTO lessons (topic_id, content_md, estimated_minutes) VALUES (6, '# アルファベット・発音

## アルファベットの基本
アルファベットは **26文字** あり、**大文字（A〜Z）** と **小文字（a〜z）** の2種類があります。

## 母音と子音
- **母音（vowel）**：A・E・I・O・U の5文字
- **子音（consonant）**：残りの21文字

## 文字の名前と音の違い
アルファベットには「**文字の名前（letter name）**」と「**実際の音（sound）**」があります。

| 文字 | 名前の読み | 単語中の音の例 |
|------|-----------|---------------|
| A | エイ | apple（ア） |
| B | ビー | ball（ブ） |
| C | スィー | cat（ク） |

## 大文字を使う場面
① 文の最初の文字　② 人名・地名　③ 「I（私）」

> 💡 アルファベットを声に出して練習し、文字の形と音を一緒に覚えましょう！', 5);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (6, 'multi_choice', 'アルファベットの母音（vowel）はどれですか？', '["A・E・I・O・U","A・B・C・D・E","A・I・U・E・O","B・C・D・F・G"]', 'A・E・I・O・U', '英語の母音はA・E・I・O・Uの5文字です。日本語の「ア・イ・ウ・エ・オ」とは並び順が異なる点に注意しましょう。残りの21文字はすべて子音（consonant）と呼ばれます。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (6, 'multi_choice', '次のうち、大文字と小文字の組み合わせが正しいものはどれですか？', '["G と g","G と q","D と b","P と q"]', 'G と g', '大文字Gの小文字はgです。bとdは形が似ており混同しやすく、pとqも左右反転の関係にあるため注意が必要です。それぞれ丁寧に形を確認して覚えましょう。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (6, 'multi_choice', '次の文の中で、大文字の使い方が正しい文はどれですか？', '["I am Ken.","i am ken.","I am ken.","i am Ken."]', 'I am Ken.', '英語では①文の最初の文字、②人名・地名、③「I（私）」は必ず大文字で書きます。「I am Ken.」はすべてのルールが守られており正しい文です。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (6, 'multi_choice', 'アルファベットのBの「文字の名前（読み方）」として正しいものはどれですか？', '["ビー","ブ","ベ","バ"]', 'ビー', 'アルファベットBの名前の読み方は「ビー（bee）」です。単語の中での音は「ブ」という音になります（例：ball）。文字の名前と実際の音は異なる場合があるので注意しましょう。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (6, 'short_answer', '「リンゴ」を意味する英単語 apple の最初の文字を大文字で書いてください。', NULL, 'A', 'appleの最初の文字はaで、その大文字はAです。aは母音の1つです。文の最初に来るときや固有名詞では大文字を使いますが、apple自体は一般名詞なので通常は小文字で書きます。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (6, 'short_answer', '次のアルファベットを正しいアルファベット順に並べてください。「E・C・A・D・B」', NULL, 'A・B・C・D・E', 'アルファベット順はA→B→C→D→E→F…の順番です。英語の辞書や索引はこの順番に並んでいます。26文字すべての順番を確実に覚えることが英語学習の基礎となります。', 2);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (6, 'short_answer', '英語で「私は田中花子です。」と書くとき、( ) に入る適切な語を答えてください。
「( ) am Hanako Tanaka.」', NULL, 'I', '英語で「私」を表す語はIです。Iは単独で使うときは必ず大文字で書きます。文の途中に来ても小文字にしないことが英語のルールです。これはアルファベットの大文字使用の重要なルールの一つです。', 2);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (6, 'numeric', 'アルファベット26文字のうち、母音（A・E・I・O・U）を除いた子音は何文字ありますか？', NULL, '21', 'アルファベットは全部で26文字あります。そのうち母音はA・E・I・O・Uの5文字です。26－5＝21文字が子音となります。子音の例：B・C・D・F・G・H・J・K・L・M・N・P・Q・R・S・T・V・W・X・Y・Z', 2);
INSERT INTO topics (id, subject_id, slug, name, "order") VALUES (7, 3, 'eigo-2', 'be動詞', 2);
INSERT INTO lessons (topic_id, content_md, estimated_minutes) VALUES (7, '# be動詞とは？

be動詞は「～です」「～にいる／ある」を表す動詞です。

## be動詞の種類

主語によって使い分けます。

| 主語 | be動詞 |
|------|--------|
| I | am |
| You | are |
| He / She / It | is |
| We / They | are |

## 基本文型

**肯定文：** `主語 ＋ be動詞 ＋ 〜.`
> I am a student. （私は生徒です。）

**否定文：** be動詞の後に `not` を置く
> He is not tall. （彼は背が高くありません。）

**疑問文：** be動詞を文頭に移動する
> Are you happy? （あなたは幸せですか？）
> — Yes, I am. / No, I am not.

## 短縮形
- I am → I''m
- You are → You''re
- He is → He''s
- is not → isn''t　/ are not → aren''t', 5);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (7, 'multi_choice', '次の文の（　）に入る正しいbe動詞を選びなさい。
「She (　) my friend.」', '["is","am","are","be"]', 'is', '主語が「She（彼女）」のとき、be動詞は「is」を使います。am はI、are はYou・複数形に使います。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (7, 'multi_choice', '次の文の（　）に入る正しいbe動詞を選びなさい。
「We (　) students.」', '["are","is","am","be"]', 'are', '主語が「We（私たちは）」のとき、be動詞は「are」を使います。複数の主語やYouにはareを使います。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (7, 'multi_choice', '次の英文の日本語訳として正しいものを選びなさい。
「Is he a teacher?」', '["彼は先生ですか？","彼は先生です。","彼は先生ではありません。","あなたは先生ですか？"]', '彼は先生ですか？', 'be動詞（Is）が文頭に来ているので疑問文です。主語が「he（彼）」なので「彼は先生ですか？」が正解です。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (7, 'multi_choice', '「I am not hungry.」の短縮形として正しいものを選びなさい。', '["I''m not hungry.","I isn''t hungry.","I aren''t hungry.","Im not hungry."]', 'I''m not hungry.', '「I am」の短縮形は「I''m」（アポストロフィを忘れずに）です。「am not」はamnʼtとは短縮しないため、I''m notと表します。', 2);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (7, 'multi_choice', '次の否定文として正しいものを選びなさい。
「They are busy.」の否定文', '["They are not busy.","They not are busy.","They do not busy.","Not they are busy."]', 'They are not busy.', 'be動詞の否定文は「be動詞＋not」の語順です。be動詞の前にnotを置いたり、do not を使うのは誤りです。', 2);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (7, 'short_answer', '次の日本語を英語にしなさい。
「私はケンジです。」
（ローマ字表記：Kenji）', NULL, 'I am Kenji.', '「私は」→「I」、be動詞はIに対して「am」、「ケンジです」→「Kenji」を続けます。文末はピリオドを忘れずに。短縮形「I''m Kenji.」も正解です。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (7, 'short_answer', '次の文を疑問文に書き換えなさい。
「You are from Japan.」', NULL, 'Are you from Japan?', 'be動詞の疑問文はbe動詞を文頭に移動します。「You are」→「Are you」とし、文末はクエスチョンマーク（?）にします。', 2);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (7, 'short_answer', '次の疑問文に対して、否定の短い答え方（短縮形を使って）を書きなさい。
「Is she a doctor?」', NULL, 'No, she isn''t.', 'Is she ～? への否定の答えは「No, she is not.」または短縮形「No, she isn''t.」です。主語をsheで受け答えることがポイントです。', 2);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (7, 'short_answer', '次の（　）に適切な語を入れて、会話を完成させなさい。
A: Are you happy?
B: Yes, I (　).', NULL, 'am', 'Are you ～? への肯定の答えは「Yes, I am.」です。疑問文のbe動詞がareでも、答えるときは主語Iに合わせてamを使います。', 2);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (7, 'numeric', '次の5つの文のうち、be動詞の使い方が正しい文はいくつありますか？数字で答えなさい。

① I am a student.
② She are kind.
③ We is friends.
④ He is my brother.
⑤ You are tall.', NULL, '3', '①「I am」→ 正しい。②「She are」→ 誤り（She is が正しい）。③「We is」→ 誤り（We are が正しい）。④「He is」→ 正しい。⑤「You are」→ 正しい。よって正しい文は①④⑤の3つです。', 3);
INSERT INTO topics (id, subject_id, slug, name, "order") VALUES (8, 3, 'eigo-3', '一般動詞', 3);
INSERT INTO lessons (topic_id, content_md, estimated_minutes) VALUES (8, '# 一般動詞とは

一般動詞は、**動作や状態**を表す動詞で、be動詞（am / is / are）以外のすべての動詞です。

## よく使う一般動詞の例
| 動詞 | 意味 |
|------|------|
| like | 好きだ |
| have | 持っている |
| play | 遊ぶ・演奏する |
| study | 勉強する |
| eat | 食べる |

## 肯定文の形
> **主語 ＋ 一般動詞 ＋ ....**

例：I **like** soccer. （私はサッカーが好きです。）

## 否定文の形
> **主語 ＋ do not（don''t） ＋ 動詞の原形 ＋ ....**

例：I **don''t like** tennis.

## 疑問文の形
> **Do ＋ 主語 ＋ 動詞の原形 ＋ ....?**

例：**Do** you **like** music? — Yes, I do. / No, I don''t.

ポイント：疑問文・否定文では必ず**動詞を原形**にします！', 5);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (8, 'multi_choice', '次のうち、一般動詞はどれですか？', '["am","play","are","is"]', 'play', 'am・are・isはbe動詞です。一般動詞とはbe動詞以外の動詞で、動作や状態を表します。「play（遊ぶ・演奏する）」が一般動詞です。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (8, 'multi_choice', '「私は音楽が好きです。」を英語にすると？', '["I like music.","I am like music.","Do I like music.","I likes music."]', 'I like music.', '主語（I）＋一般動詞（like）＋目的語（music）の語順が正しい肯定文です。主語がIのとき動詞はlikeをそのまま使います。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (8, 'multi_choice', '「あなたはテニスをしますか？」の正しい英文はどれですか？', '["Do you play tennis?","Are you play tennis?","You do play tennis?","Does you play tennis?"]', 'Do you play tennis?', '一般動詞の疑問文は「Do ＋ 主語 ＋ 動詞の原形 ～？」の形にします。主語がyouのときはDoを使います。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (8, 'multi_choice', '「私はサッカーをしません。」の正しい英文はどれですか？', '["I don''t play soccer.","I not play soccer.","I am not play soccer.","I doesn''t play soccer."]', 'I don''t play soccer.', '一般動詞の否定文は「主語 ＋ don''t（do not）＋ 動詞の原形」です。主語がI・youのときはdon''tを使います。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (8, 'multi_choice', 'Do you have a bike? に対する**否定の答え**として正しいのはどれですか？', '["No, I don''t.","No, I doesn''t.","No, I am not.","No, I not."]', 'No, I don''t.', 'Do you ～? の疑問文に対して、否定で答えるときは「No, I don''t.」と返します。don''tはdo notの短縮形です。', 2);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (8, 'short_answer', '次の文を否定文に書き換えてください。
「I study English every day.」', NULL, 'I don''t study English every day.', '一般動詞の否定文は動詞の前に「don''t（do not）」を入れ、動詞は原形のまま使います。studyはそのまま原形で使います。', 2);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (8, 'short_answer', '次の文を疑問文に書き換えてください。
「You like cats.」', NULL, 'Do you like cats?', '一般動詞の疑問文は文頭に「Do」を置き、「Do ＋ 主語 ＋ 動詞の原形 ～？」の語順にします。likeはそのまま原形で使います。', 2);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (8, 'short_answer', '日本語に合うように（　）に入る語を答えてください。
「私は犬を飼っていません。」
I (　) have a dog.', NULL, 'don''t', '主語がIの一般動詞の否定文では、動詞の前に「don''t（do not）」を置きます。don''tはdo notを短縮した形です。', 2);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (8, 'numeric', '次の5つの英文のうち、一般動詞が使われている正しい文はいくつありますか？

① I play the guitar.
② She am a student.
③ We like soccer.
④ I don''t study math.
⑤ Are you happy?', NULL, '3', '①「play」は一般動詞で正しい文です。③「like」は一般動詞で正しい文です。④「don''t study」は一般動詞の否定文で正しい文です。②はbe動詞（am）の使い方が誤り（She isが正しい）、⑤はbe動詞（are）を使った文なので一般動詞の文ではありません。よって正解は3つです。', 3);
INSERT INTO topics (id, subject_id, slug, name, "order") VALUES (9, 3, 'eigo-4', '疑問文・否定文', 4);
INSERT INTO lessons (topic_id, content_md, estimated_minutes) VALUES (9, '# 疑問文・否定文の作り方

## be動詞の疑問文
be動詞（am / is / are）を**主語の前**に移動します。

- 肯定文：You **are** a student.
- 疑問文：**Are** you a student? → Yes, I am. / No, I''m not.

## be動詞の否定文
be動詞の**後ろに not** を置きます。

- 肯定文：He is busy.
- 否定文：He **is not（isn''t）** busy.

## 一般動詞の疑問文
文の先頭に **Do / Does** を置き、動詞は原形にします。

- 肯定文：She likes music.
- 疑問文：**Does** she like music? → Yes, she does. / No, she doesn''t.

## 一般動詞の否定文
動詞の前に **do not（don''t）/ does not（doesn''t）** を置き、動詞は原形にします。

- 否定文：She **does not（doesn''t）like** music.

> 💡 主語が**he / she / it**などの三人称単数のとき、疑問文・否定文では **does / doesn''t** を使います！', 5);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (9, 'multi_choice', '次の文を疑問文にしたとき、正しいものはどれですか？

「You are from Tokyo.」', '["Are you from Tokyo?","Do you from Tokyo?","You are from Tokyo?","Is you from Tokyo?"]', 'Are you from Tokyo?', 'be動詞（are）を主語（you）の前に移動させます。「Are you from Tokyo?」が正解です。「Do」は一般動詞の疑問文で使うため、be動詞の文には使いません。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (9, 'multi_choice', '次の文の（　）に入る最も適切な語はどれですか？

「She （　） play tennis.」（否定文）', '["doesn''t","don''t","isn''t","not"]', 'doesn''t', '主語が「She」（三人称単数）なので、一般動詞の否定文には「doesn''t（does not）」を使います。「don''t」は I / you / we / they のときに使います。doesn''t の後ろの動詞は原形（play）になります。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (9, 'multi_choice', '次の疑問文に対する答えとして正しいものはどれですか？

「Does your brother like soccer?」', '["Yes, he does.","Yes, he is.","Yes, I do.","Yes, he likes."]', 'Yes, he does.', 'Does を使った疑問文には「Yes, 主語 does.」または「No, 主語 doesn''t.」で答えます。「your brother」は「he」に置き換えて答えます。「Yes, he is.」はbe動詞の答え方なので誤りです。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (9, 'multi_choice', '次の文の空欄に入る正しい組み合わせはどれですか？

「（　）　you　（　）　English every day?」（あなたは毎日英語を勉強しますか？）', '["Do ／ study","Does ／ study","Do ／ studies","Are ／ study"]', 'Do ／ study', '主語が「you」のとき、一般動詞の疑問文は「Do」を使います。Doesは三人称単数（he / she / it など）のときに使います。また、Do / Does の後ろの動詞は必ず原形（study）にします。', 2);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (9, 'short_answer', '次の日本語を英語にしてください。

「彼は医者ではありません。」

※ 短縮形（isn''t）を使って答えてください。', NULL, 'He isn''t a doctor.', '主語「彼は」→ He、be動詞は「is」、否定は「is not → isn''t」、「医者」は「a doctor」。よって「He isn''t a doctor.」となります。「He''s not a doctor.」も正解です。', 2);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (9, 'short_answer', '次の肯定文を疑問文に書き換えてください。

「Ken and Yuki are good friends.」', NULL, 'Are Ken and Yuki good friends?', 'be動詞（are）を主語（Ken and Yuki）の前に出します。文末はクエスチョンマーク（?）をつけます。「Are Ken and Yuki good friends?」が正解です。', 2);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (9, 'short_answer', '次の文を否定文に書き換えてください。

「My father watches TV at night.」

※ 短縮形（doesn''t）を使って答えてください。', NULL, 'My father doesn''t watch TV at night.', '主語「My father」は三人称単数なので「doesn''t（does not）」を使います。また、doesn''t を使うと動詞は原形に戻るため「watches → watch」になります。「My father doesn''t watch TV at night.」が正解です。', 2);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (9, 'numeric', '次の5つの文のうち、文法的に**正しい文**はいくつありますか？　数字で答えてください。

① Are she a nurse?
② He doesn''t have a car.
③ Do they speak Japanese?
④ She don''t like cats.
⑤ Is this your bag?', NULL, '3', '【正しい文】②「He doesn''t have a car.」③「Do they speak Japanese?」⑤「Is this your bag?」の3つ。

【誤りの文】①「Are she」→ she はbe動詞 is を使うので「Is she a nurse?」が正しい。④「She don''t」→ she は三人称単数なので「doesn''t」を使い「She doesn''t like cats.」が正しい。', 3);
INSERT INTO topics (id, subject_id, slug, name, "order") VALUES (10, 4, 'rika-1', '植物のからだ', 1);
INSERT INTO lessons (topic_id, content_md, estimated_minutes) VALUES (10, '# 植物のからだ

## 🌱 植物の器官
植物のからだは**根・茎・葉・花・果実・種子**からできています。それぞれが役割を持っています。

## 🍃 葉のはたらき
- **光合成**：葉緑体で光・水・二酸化炭素を使い、デンプンと酸素を作る
- **蒸散**：気孔から水蒸気を放出する

## 🔬 葉の断面
葉の表皮には**気孔**があり、主に葉の裏側に多い。気孔は**孔辺細胞**2つに囲まれ、開閉して水蒸気・ガスの出入りを調節します。

## 🌿 茎のつくり
茎の中には**維管束**があり、**道管**（水・無機塩類を運ぶ）と**師管**（光合成産物を運ぶ）からなります。
- 双子葉類：維管束が輪状に並ぶ
- 単子葉類：維管束が散在する

## 🌾 根のはたらき
根は水・無機塩類を吸収します。根の先端近くにある**根毛**が吸収面積を広げます。', 5);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (10, 'multi_choice', '葉の気孔について正しい説明はどれですか？', '["2つの孔辺細胞に囲まれており、水蒸気や気体の出入り口になっている","葉の表側にのみ存在し、常に開いている","光合成を直接行う場所であり、葉緑体は含まない","根から吸収した水をためる役割がある"]', '2つの孔辺細胞に囲まれており、水蒸気や気体の出入り口になっている', '気孔は2つの孔辺細胞に囲まれた隙間で、蒸散（水蒸気の放出）や光合成・呼吸に必要な気体（CO₂・O₂）の出入り口です。気孔は主に葉の裏側に多く存在し、孔辺細胞が膨らむと開き、しぼむと閉じます。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (10, 'multi_choice', '維管束の「道管」が運ぶものはどれですか？', '["水と無機塩類","光合成で作られた糖","酸素と二酸化炭素","デンプンとタンパク質"]', '水と無機塩類', '道管は根から吸収した水と無機塩類（ミネラル）を葉などの上方へ運びます。一方、師管は葉の光合成で作られた糖などの有機物を植物全体に運びます。道管と師管をまとめて「維管束」といいます。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (10, 'multi_choice', '双子葉類と単子葉類の茎の違いとして正しいものはどれですか？', '["双子葉類の維管束は輪状に並び、単子葉類の維管束は散在する","単子葉類の維管束は輪状に並び、双子葉類の維管束は散在する","どちらも維管束は輪状に並ぶが、道管と師管の位置が逆である","双子葉類には道管がなく、単子葉類には師管がない"]', '双子葉類の維管束は輪状に並び、単子葉類の維管束は散在する', '茎の断面を観察すると、アブラナやホウセンカなどの双子葉類は維管束が輪のように規則正しく並んでいます。トウモロコシやイネなどの単子葉類は維管束が茎全体に不規則に散らばっています。', 2);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (10, 'short_answer', '光合成の反応に必要な材料（原料）を2つ答えてください。', NULL, '水と二酸化炭素', '光合成は「水＋二酸化炭素 →（光エネルギー・葉緑体）→ デンプン（有機物）＋酸素」という反応です。水は根から道管を通じて運ばれ、二酸化炭素は気孔から取り込まれます。光エネルギーは材料ではなくエネルギー源です。', 2);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (10, 'short_answer', '根の先端付近にある、水の吸収面積を大きくするための構造を何といいますか？', NULL, '根毛', '根毛は根の表皮細胞が細長く伸びた毛のような構造です。根毛があることで表面積が非常に大きくなり、土の中の水や無機塩類を効率よく吸収できます。根毛は根の先端から少し上の部分（成長点の上）に密生しています。', 2);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (10, 'numeric', 'ある植物の葉1枚の気孔の数を調べると、表側に1cm²あたり100個、裏側に1cm²あたり400個ありました。この葉の片面の面積が10cm²のとき、葉1枚の気孔の合計数は何個ですか？', NULL, '5000', '表側の気孔数：100個/cm² × 10cm² ＝ 1000個。裏側の気孔数：400個/cm² × 10cm² ＝ 4000個。合計：1000＋4000＝5000個。このように、多くの植物では気孔は葉の裏側に圧倒的に多く存在します。これは表側に気孔が多いと水分が蒸発しすぎるためと考えられています。', 3);
INSERT INTO topics (id, subject_id, slug, name, "order") VALUES (11, 4, 'rika-2', '物質の性質', 2);
INSERT INTO lessons (topic_id, content_md, estimated_minutes) VALUES (11, '# 物質の性質

## 物質とは？
物質とは、空間を占め、質量をもつものすべてのことです。身の回りのあらゆるものは物質でできています。

## 物質の分類
物質は大きく **純粋な物質（純物質）** と **混合物** に分けられます。

- **純物質**：1種類の物質だけからなるもの（例：水、食塩、鉄）
- **混合物**：2種類以上の物質が混ざり合ったもの（例：食塩水、空気）

## 物質の性質
物質を見分けるために使われる代表的な性質を覚えましょう。

| 性質 | 説明 |
|------|------|
| **密度** | 単位体積あたりの質量（g/cm³） |
| **融点** | 固体が液体になる温度 |
| **沸点** | 液体が気体になる温度 |
| **溶解性** | 水などへの溶けやすさ |

## 密度の計算
$$密度(g/cm³) = \frac{質量(g)}{体積(cm³)}$$

密度は物質ごとに固有の値をもつため、**物質を識別する手がかり**になります。水の密度は **1.0 g/cm³** です。', 5);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (11, 'multi_choice', '次のうち、純粋な物質（純物質）はどれですか？', '["食塩水","空気","エタノール","砂糖水"]', 'エタノール', 'エタノール（C₂H₅OH）は1種類の物質だけからなる純物質です。食塩水・砂糖水は溶質と水の混合物、空気は窒素・酸素などの混合物です。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (11, 'multi_choice', '物質が液体から気体に変化するときの温度を何といいますか？', '["融点","沸点","凝固点","露点"]', '沸点', '液体が気体になる温度を沸点といいます。融点は固体が液体になる温度、凝固点は液体が固体になる温度です。水の沸点は100℃（1気圧）です。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (11, 'multi_choice', '密度が1.0 g/cm³よりも大きい物質を水に入れたとき、どうなりますか？', '["浮く","沈む","溶ける","水面と同じ高さに静止する"]', '沈む', '水の密度は1.0 g/cm³です。それより密度が大きい物質は水より重いため沈みます。密度が小さい物質（例：氷 0.92 g/cm³）は浮きます。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (11, 'short_answer', '物質1 cm³あたりの質量のことを何といいますか？漢字2文字で答えなさい。', NULL, '密度', '密度は「質量÷体積」で求められ、単位はg/cm³（グラム毎立方センチメートル）です。密度は物質に固有の値であるため、物質の種類を調べるときに役立ちます。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (11, 'short_answer', '混合物から純粋な物質を取り出す方法として、液体混合物を加熱して沸点の違いを利用して分ける操作を何といいますか？', NULL, '蒸留', '蒸留は液体を加熱して気化させ、それを冷却して再び液体として集める操作です。沸点の異なる液体の混合物（例：水とエタノール）を分離するときに使われます。', 2);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (11, 'numeric', '質量78 g、体積10 cm³の金属の密度は何g/cm³ですか？', NULL, '7.8', '密度＝質量÷体積 で計算します。78 g ÷ 10 cm³ ＝ 7.8 g/cm³ です。この値は鉄の密度（約7.9 g/cm³）に近く、鉄と考えられます。', 2);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (11, 'numeric', '密度2.7 g/cm³のアルミニウムがあります。体積が20 cm³のとき、質量は何gですか？', NULL, '54', '質量＝密度×体積 で計算します。2.7 g/cm³ × 20 cm³ ＝ 54 g です。密度の公式「密度＝質量÷体積」を変形すると「質量＝密度×体積」になります。', 2);
INSERT INTO topics (id, subject_id, slug, name, "order") VALUES (12, 5, 'shakai-1', '地球のすがた', 1);
INSERT INTO lessons (topic_id, content_md, estimated_minutes) VALUES (12, '## 地球のすがた

### 地球の形と大きさ
地球はほぼ**球形**をしており、赤道の周囲は約**4万km**です。表面積の約**70%**を海洋が占め、残り約30%が陸地です。

### 六大陸と三大洋
陸地は6つの大陸に分けられます。
- **ユーラシア大陸**（最大）・**アフリカ大陸**・**北アメリカ大陸**
- **南アメリカ大陸**・**オーストラリア大陸**・**南極大陸**

海洋は3つの大洋に分けられます。
- **太平洋**（最大）・**大西洋**・**インド洋**

### 緯度と経度
- **緯度**：赤道を0°として南北を各90°に分けた角度。赤道に平行な線を**緯線**といいます。
- **経度**：イギリスのロンドン（旧グリニッジ）を通る**本初子午線**を0°として東西を各180°に分けた角度。
- 経度15°ごとに**1時間**の時差が生じます。

### 日本の位置
日本は北緯約20°〜46°、東経約123°〜154°に位置します。', 5);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (12, 'multi_choice', '世界で最も面積が大きい大陸はどれですか？', '["ユーラシア大陸","アフリカ大陸","北アメリカ大陸","南アメリカ大陸"]', 'ユーラシア大陸', 'ユーラシア大陸はアジアとヨーロッパを合わせた大陸で、六大陸の中で最も面積が大きい大陸です。面積は約5,500万km²で、陸地全体の約37%を占めています。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (12, 'multi_choice', '本初子午線（経度0°）が通るイギリスの都市はどれですか？', '["ロンドン","マンチェスター","エジンバラ","リバプール"]', 'ロンドン', '本初子午線はイギリスのロンドンにある旧グリニッジ天文台を通る経線で、経度の基準（0°）となっています。この線を基準に東側を東経、西側を西経と呼びます。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (12, 'multi_choice', '地球の表面における海洋の割合として最も近いものはどれですか？', '["約70%","約50%","約30%","約80%"]', '約70%', '地球の表面積の約70%は海洋（水）で覆われており、残りの約30%が陸地です。そのため地球は「水の惑星」とも呼ばれます。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (12, 'short_answer', '赤道を0°として、南北それぞれ90°に分けた地球上の位置を表す角度のことを何といいますか？', NULL, '緯度', '緯度は赤道を基準（0°）として、北極点を北緯90°、南極点を南緯90°とする角度です。同じ緯度を結んだ線を緯線といい、赤道に平行に引かれます。', 2);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (12, 'short_answer', '太平洋・大西洋と並ぶ三大洋のひとつで、アフリカ大陸・アジア大陸・オーストラリア大陸に囲まれた海洋の名前を答えなさい。', NULL, 'インド洋', 'インド洋は三大洋のひとつで、太平洋・大西洋に次いで3番目に大きい海洋です。アフリカ大陸・アジア大陸・オーストラリア大陸・南極大陸に囲まれています。', 2);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (12, 'numeric', '経度が15°異なると1時間の時差が生じます。日本（東経135°）とイギリス・ロンドン（経度0°）の時差は何時間ですか？', NULL, '9', '時差は「経度の差 ÷ 15°」で求められます。日本の標準時子午線は東経135°、ロンドンは経度0°なので、経度の差は135°です。135° ÷ 15° = 9 となり、時差は9時間です。日本はロンドンより9時間進んでいます。', 2);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (12, 'multi_choice', '次の大陸のうち、ほぼ全域が南半球に位置するものはどれですか？', '["オーストラリア大陸","ユーラシア大陸","北アメリカ大陸","アフリカ大陸"]', 'オーストラリア大陸', 'オーストラリア大陸はほぼ全体が南半球（赤道より南）に位置しています。アフリカ大陸は赤道をまたいで南北半球にまたがっており、ユーラシア大陸・北アメリカ大陸は主に北半球に位置します。', 3);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (12, 'numeric', '赤道の全周は約40000kmです。赤道上で経度1°あたりの距離は約何kmになりますか？整数で答えなさい。', NULL, '111', '赤道は360°で全周約40000kmなので、1°あたりの距離は 40000 ÷ 360 ≒ 111.1…km となります。よって約111kmです。この計算から、緯度・経度1°の差がどれくらいの距離に相当するかがわかります。', 3);
INSERT INTO topics (id, subject_id, slug, name, "order") VALUES (13, 5, 'shakai-2', '文明のおこり', 2);
INSERT INTO lessons (topic_id, content_md, estimated_minutes) VALUES (13, '# 文明のおこり

## 農耕・牧畜の始まり
今から約1万年前、人々は食料を**採集・狩り**から**農耕・牧畜**へと移行しました。食料を安定して得られるようになり、人口が増加しました。

## 四大文明の発生
農耕が発展すると、大河のほとりに**文明**が生まれました。

| 文明 | 川 | 地域 |
|------|-----|------|
| メソポタミア文明 | チグリス川・ユーフラテス川 | 西アジア |
| エジプト文明 | ナイル川 | アフリカ |
| インダス文明 | インダス川 | 南アジア |
| 中国文明 | 黄河・長江 | 東アジア |

## 文明の共通点
四大文明には共通した特徴があります。
- **文字**の発明（記録・伝達のため）
- **青銅器**の使用（道具・武器）
- **国家**の形成と王による支配
- **宗教**の発達

大河流域は土地が肥えており、農業生産力が高く、多くの人が集まって都市や国家が発展しました。', 5);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (13, 'multi_choice', 'メソポタミア文明が栄えた川はどれですか？', '["チグリス川・ユーフラテス川","ナイル川","インダス川","黄河・長江"]', 'チグリス川・ユーフラテス川', 'メソポタミア文明は現在の西アジア（イラク周辺）のチグリス川とユーフラテス川の流域で発展しました。「メソポタミア」はギリシャ語で「二つの川の間の土地」を意味します。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (13, 'multi_choice', '四大文明に共通してみられる特徴として、正しくないものはどれですか？', '["鉄器の使用","文字の発明","国家の形成","宗教の発達"]', '鉄器の使用', '四大文明が栄えた時代に使用されていたのは青銅器です。鉄器が広まるのはその後の時代になります。文字・国家・宗教はいずれの文明にも共通してみられます。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (13, 'multi_choice', 'エジプト文明で使われた文字はどれですか？', '["象形文字（ヒエログリフ）","くさび形文字","甲骨文字","インダス文字"]', '象形文字（ヒエログリフ）', 'エジプト文明では象形文字（ヒエログリフ）が使われました。メソポタミア文明ではくさび形文字、中国文明では甲骨文字が使われました。', 2);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (13, 'short_answer', '人類が農耕・牧畜を始める以前の生活の仕方を何といいますか？', NULL, '狩猟・採集', '農耕・牧畜が始まる以前、人々は野生の動物を狩ったり、野生の植物の実や根を採集したりして食料を得ていました。これを「狩猟・採集」の生活といいます。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (13, 'short_answer', '四大文明が大河の流域で発生した理由を、「農業」「人口」という語句を使って説明しなさい。', NULL, '大河の流域は土地が肥えて農業に適しており、食料が豊富に得られたため人口が増加し、都市や国家が発展したから。', '大河がもたらす肥沃な土壌と豊富な水は農業生産を高め、安定した食料供給が人口増加を促しました。人口が集中することで都市が形成され、文明が発達しました。', 3);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (13, 'numeric', '文明のおこりは今から約何年前のことですか？数字で答えなさい。（単位：年前）', NULL, '5000', '四大文明は今から約5000年前（紀元前3000年ごろ）に大河の流域で発生したとされています。なお、農耕・牧畜の始まりは約1万年前です。', 2);
