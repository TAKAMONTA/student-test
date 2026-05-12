INSERT INTO topics (id, subject_id, slug, name, "order") VALUES (14, 1, 'kokugo-3', '漢字・語句', 3);
INSERT INTO lessons (topic_id, content_md, estimated_minutes) VALUES (14, '# 漢字・語句の学習

## 漢字の読み書き
漢字には**音読み**と**訓読み**があります。
- **音読み**：中国から伝わった読み方（例：山→サン）
- **訓読み**：日本語の読み方（例：山→やま）

## 熟語の構成
二字熟語には意味のパターンがあります。
- **似た意味の組み合わせ**：読書（読む＋書く）
- **反対の意味の組み合わせ**：上下（上＋下）
- **上が下を修飾する**：国語（国の語）

## 語句の意味
文脈の中で語句の意味を正確に理解することが大切です。**同音異義語**（同じ読みで違う意味の漢字）や**多義語**（一つの語に複数の意味がある語）に注意しましょう。

語彙を豊かにすることで、文章の読解力と表現力が向上します。', 5);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (14, 'multi_choice', '「読書」という熟語の構成として正しいものはどれですか？', '["似た意味の漢字の組み合わせ","反対の意味の漢字の組み合わせ","上の漢字が下の漢字を修飾する"]', '似た意味の漢字の組み合わせ', '「読む」と「書く」はどちらも文字に関わる行為で、似た意味の漢字を組み合わせた熟語です。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (14, 'multi_choice', '「山」の音読みはどれですか？', '["サン","やま","もり"]', 'サン', '「山」の音読みは「サン」（例：登山・火山）、訓読みは「やま」です。音読みは中国から伝わった読み方です。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (14, 'multi_choice', '次の漢字の中で、部首が「さんずい（氵）」のものはどれですか？', '["海","林","岩"]', '海', '「海」の左側にある「氵（さんずい）」は水に関係する部首です。「林」は「木へん」、「岩」は「山」が部首です。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (14, 'multi_choice', '「彼は試合に**のぞむ**」の「のぞむ」を漢字で書いたとき、正しいものはどれですか？', '["臨む","望む","挑む"]', '臨む', '「臨む（のぞむ）」は「その場に向かう・直面する」という意味です。「望む」は「願う」、「挑む」は「チャレンジする」という意味になります。', 2);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (14, 'multi_choice', '「上下」という熟語の構成として正しいものはどれですか？', '["反対の意味の漢字の組み合わせ","似た意味の漢字の組み合わせ","上の漢字が下の漢字を修飾する"]', '反対の意味の漢字の組み合わせ', '「上」と「下」は反対の意味を持つ漢字を組み合わせた熟語です。他にも「左右」「明暗」「強弱」などが同じパターンです。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (14, 'multi_choice', '「友人と意見が**相違**する」の「相違」の読み方として正しいものはどれですか？', '["そうい","あいちがい","そうちがい"]', 'そうい', '「相違（そうい）」は「違いがあること・異なること」という意味の熟語です。「相」も「違」も音読みで読みます。', 2);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (14, 'multi_choice', '次の文の（　）に入る最も適切な語句はどれですか？「彼女は（　）な性格で、誰とでも仲良くなれる。」', '["社交的","内向的","批判的"]', '社交的', '「誰とでも仲良くなれる」という文脈から、「社交的（人付き合いが得意なこと）」が最も適切です。「内向的」は人見知りな様子、「批判的」は否定的な態度を表します。', 2);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (14, 'multi_choice', '「木」を部首に持つ漢字はどれですか？', '["植","晴","空"]', '植', '「植（うえる）」の左側にある「木へん（木）」が部首です。「晴」は「日へん」、「空」は「穴かんむり」が部首になります。', 1);
INSERT INTO topics (id, subject_id, slug, name, "order") VALUES (15, 1, 'kokugo-4', '文法（品詞）', 4);
INSERT INTO lessons (topic_id, content_md, estimated_minutes) VALUES (15, '# 品詞とは

言葉（単語）は、その性質やはたらきによって**10種類の品詞**に分けられます。

## 主な品詞

- **名詞**：物事の名前を表す（例：山、学校、友達）
- **動詞**：動作や存在を表す。活用する（例：走る、食べる、ある）
- **形容詞**：物の様子・性質を表す。「い」で終わる（例：美しい、楽しい）
- **形容動詞**：様子を表す。「だ・です」で終わる（例：静かだ、元気だ）
- **副詞**：主に用言を修飾する（例：とても、ゆっくり）
- **連体詞**：体言（名詞）だけを修飾する（例：この、ある、大きな）
- **接続詞**：文や語をつなぐ（例：しかし、だから）
- **感動詞**：感動・呼びかけを表す（例：ああ、はい）
- **助詞**・**助動詞**：付属語で意味を添える

## ポイント

品詞を見分けるには、**活用があるかどうか**と**文中でのはたらき**に注目しましょう。', 5);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (15, 'multi_choice', '「美しい」はどの品詞ですか？', '["形容詞","形容動詞","副詞"]', '形容詞', '「美しい」は物の様子・性質を表し、語尾が「い」で終わる形容詞です。形容動詞は「静かだ」のように「だ・です」で終わります。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (15, 'multi_choice', '「走る」はどの品詞ですか？', '["名詞","動詞","形容詞"]', '動詞', '「走る」は動作を表し、「走ら・走り・走る」のように活用する動詞です。名詞は活用せず物事の名前を表します。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (15, 'multi_choice', '「しかし」はどの品詞ですか？', '["副詞","感動詞","接続詞"]', '接続詞', '「しかし」は前後の文や語をつなぐ役割をもつ接続詞です。逆接の意味を表します。「だから」「そして」なども接続詞です。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (15, 'multi_choice', '「この本は面白い」の「この」はどの品詞ですか？', '["連体詞","副詞","代名詞"]', '連体詞', '「この」は名詞（体言）の「本」だけを修飾し、活用しない連体詞です。副詞は主に動詞・形容詞を修飾します。', 2);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (15, 'multi_choice', '「静かだ」はどの品詞ですか？', '["形容詞","形容動詞","名詞"]', '形容動詞', '「静かだ」は様子を表し、「静かだ・静かに・静かな」のように活用する形容動詞です。語幹は「静か」で、「だ」が語尾です。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (15, 'multi_choice', '「とても速く走った」の「とても」はどの品詞ですか？', '["形容詞","連体詞","副詞"]', '副詞', '「とても」は「速く」という形容詞を修飾しており、活用しない副詞です。副詞は主に用言（動詞・形容詞・形容動詞）を修飾します。', 2);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (15, 'multi_choice', '次のうち**名詞**はどれですか？', '["学校","楽しい","走る"]', '学校', '「学校」は物事の名前を表す名詞（体言）です。「楽しい」は形容詞、「走る」は動詞で、どちらも活用する用言です。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (15, 'multi_choice', '「ああ、きれいな花だ」の「ああ」はどの品詞ですか？', '["副詞","感動詞","接続詞"]', '感動詞', '「ああ」は感動・驚きを表す感動詞です。感動詞は文の最初に独立して使われ、他の語を修飾したりつないだりしません。', 2);
INSERT INTO topics (id, subject_id, slug, name, "order") VALUES (16, 1, 'kokugo-5', '作文・表現', 5);
INSERT INTO lessons (topic_id, content_md, estimated_minutes) VALUES (16, '# 作文・表現の基本

## 文章を書く前に考えること

作文を書くときは、まず**構成（こうせい）**を考えることが大切です。

- **はじめ**：話題の提示・問題提起
- **なか**：具体的なエピソードや理由
- **おわり**：まとめ・自分の考え

## 表現を豊かにする工夫

**比喩（ひゆ）**を使うと、読み手に伝わりやすくなります。

- **直喩（ちょくゆ）**：「〜のような」「〜みたいな」を使う表現
- **隠喩（いんゆ）**：「〜は〜だ」と直接言い換える表現

## 読み手を意識する

作文では**誰に向けて書くか**を常に意識しましょう。

- 丁寧な言葉遣い（敬体：「です・ます」調）
- 話し言葉と書き言葉の区別
- 一文を短くして読みやすくする

これらの基本を身につけることで、伝わる文章が書けるようになります。', 5);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (16, 'multi_choice', '作文の「三段構成」の正しい順番はどれですか？', '["はじめ・なか・おわり","なか・はじめ・おわり","おわり・なか・はじめ"]', 'はじめ・なか・おわり', '作文の基本的な構成は「はじめ（話題の提示）→なか（具体的な内容）→おわり（まとめ）」の順番です。この流れで書くと、読み手に伝わりやすい文章になります。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (16, 'multi_choice', '「彼女の笑顔は太陽のようだ」という表現は何という比喩ですか？', '["直喩","隠喩","擬人法"]', '直喩', '「〜のような」「〜みたいな」という言葉を使って、二つのものを直接比べる表現を「直喩（ちょくゆ）」といいます。隠喩は「〜は〜だ」と言い換える表現です。', 2);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (16, 'multi_choice', '「春の風が私にそっと語りかけた」という表現は何という技法ですか？', '["擬人法","直喩","倒置法"]', '擬人法', '人間ではないものを人間のように表現する技法を「擬人法（ぎじんほう）」といいます。この文では「風が語りかけた」と、風を人のように表現しています。', 2);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (16, 'multi_choice', '「です・ます」調で統一された文体を何といいますか？', '["敬体","常体","口語体"]', '敬体', '「です・ます」で文を終える文体を「敬体（けいたい）」といいます。一方、「だ・である」で終える文体は「常体（じょうたい）」といいます。一つの文章の中では、どちらかに統一することが大切です。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (16, 'multi_choice', '作文で使うべき「書き言葉」として適切なものはどれですか？', '["しかし","でも","だって"]', 'しかし', '「でも」「だって」は話し言葉（口語）です。作文などの書き言葉では「しかし」「ところが」「けれども」などの接続詞を使うのが適切です。', 2);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (16, 'multi_choice', '「山が、空が、川が輝いていた」のように同じ形を繰り返す技法を何といいますか？', '["列挙法（反復法）","倒置法","体言止め"]', '列挙法（反復法）', '同じ言葉や文型を繰り返すことでリズムを生み、印象を強める技法を「列挙法」または「反復法」といいます。読み手に強い印象を与える効果があります。', 3);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (16, 'multi_choice', '「夕焼け。静かな時間。」のように、文末を名詞で終える技法を何といいますか？', '["体言止め","直喩","擬声語"]', '体言止め', '文末を名詞（体言）で止める技法を「体言止め（たいげんどめ）」といいます。余韻（よいん）を残したり、印象を強めたりする効果があります。', 2);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (16, 'multi_choice', '作文で段落を変えるときに正しいのはどれですか？', '["話題が変わるときに段落を変える","5文ごとに必ず段落を変える","段落は変えなくてよい"]', '話題が変わるときに段落を変える', '段落は、話題や内容が変わるタイミングで変えます。一つの段落には一つの話題をまとめるのが基本です。文章の数で機械的に決めるのではなく、内容のまとまりを意識しましょう。', 1);
INSERT INTO topics (id, subject_id, slug, name, "order") VALUES (17, 2, 'sugaku-3', '方程式', 3);
INSERT INTO lessons (topic_id, content_md, estimated_minutes) VALUES (17, '# 方程式とは？

## 方程式の基本
**方程式**とは、文字（xなど）を使った等式で、特定の値のときだけ成り立つものです。

その文字の値を**解**といい、解を求めることを**方程式を解く**といいます。

## 等式の性質（移項のルール）
方程式を解くときは次の性質を使います。

- 両辺に同じ数を**足しても**等式は成り立つ
- 両辺から同じ数を**引いても**等式は成り立つ
- 両辺に同じ数を**かけても**等式は成り立つ
- 両辺を同じ数（0以外）で**割っても**等式は成り立つ

## 移項とは？
等式の一方の辺にある項を、**符号を変えて**反対側の辺に移すことを**移項**といいます。

例：`x + 3 = 7` → `x = 7 - 3` → `x = 4`

## 解き方の手順
1. 文字の項を左辺、数の項を右辺に集める
2. 計算して `x = ○` の形にする
3. 答えを元の式に代入して確認する', 5);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (17, 'multi_choice', 'x + 5 = 12 を解くと、x はいくつですか？', '["x = 7","x = 17","x = 5"]', 'x = 7', '両辺から5を引くと、x = 12 - 5 = 7 となります。移項すると符号が変わることに注意しましょう。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (17, 'multi_choice', 'x - 4 = 9 を解くと、x はいくつですか？', '["x = 5","x = 13","x = 4"]', 'x = 13', '両辺に4を足すと、x = 9 + 4 = 13 となります。-4 を移項すると +4 になります。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (17, 'multi_choice', '3x = 18 を解くと、x はいくつですか？', '["x = 15","x = 54","x = 6"]', 'x = 6', '両辺を3で割ると、x = 18 ÷ 3 = 6 となります。係数で両辺を割って x の係数を1にします。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (17, 'multi_choice', '2x + 3 = 11 を解くと、x はいくつですか？', '["x = 4","x = 7","x = 3"]', 'x = 4', 'まず3を移項して 2x = 11 - 3 = 8、次に両辺を2で割って x = 8 ÷ 2 = 4 となります。', 2);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (17, 'multi_choice', '5x - 2 = 3x + 8 を解くと、x はいくつですか？', '["x = 3","x = 5","x = 6"]', 'x = 5', '文字の項を左辺、数の項を右辺に移項して、5x - 3x = 8 + 2 → 2x = 10 → x = 5 となります。', 2);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (17, 'multi_choice', '方程式 4x = -20 の解はどれですか？', '["x = -5","x = 5","x = -16"]', 'x = -5', '両辺を4で割ると、x = -20 ÷ 4 = -5 となります。負の数の割り算に注意しましょう。', 2);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (17, 'multi_choice', 'ある数 x に3をかけて7を足すと28になります。この方程式を正しく表しているのはどれですか？', '["3x + 7 = 28","3(x + 7) = 28","x + 3 × 7 = 28"]', '3x + 7 = 28', '「x に3をかけて」→ 3x、「7を足すと」→ + 7、「28になる」→ = 28 と順番に式にすると 3x + 7 = 28 となります。', 2);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (17, 'multi_choice', '3x + 7 = 28 を解くと、x はいくつですか？', '["x = 6","x = 7","x = 9"]', 'x = 7', '7を移項して 3x = 28 - 7 = 21、両辺を3で割って x = 21 ÷ 3 = 7 となります。確認：3×7+7=28 ✓', 2);
INSERT INTO topics (id, subject_id, slug, name, "order") VALUES (18, 2, 'sugaku-4', '比例と反比例', 4);
INSERT INTO lessons (topic_id, content_md, estimated_minutes) VALUES (18, '# 比例と反比例

## 比例とは
ともなって変わる2つの量 x と y があるとき、**x が2倍・3倍になると y も2倍・3倍になる**関係を「比例」といいます。

式で表すと **y = ax**（a は比例定数）となります。

- グラフは**原点を通る直線**になります
- a > 0 なら右上がり、a < 0 なら右下がり

## 反比例とは
x が2倍・3倍になると y が **1/2・1/3 になる**関係を「反比例」といいます。

式で表すと **y = a/x**（a は比例定数）となります。

- グラフは**双曲線**と呼ばれる曲線になります
- x と y の積は常に一定（xy = a）

## まとめ
| 種類 | 式 | グラフ |
|------|----|---------|
| 比例 | y = ax | 原点を通る直線 |
| 反比例 | y = a/x | 双曲線 |', 5);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (18, 'multi_choice', 'y が x に比例するとき、x = 2 のとき y = 6 です。比例定数 a はいくつですか？', '["3","4","12"]', '3', 'y = ax に x = 2、y = 6 を代入すると 6 = 2a となり、a = 3 です。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (18, 'multi_choice', 'y = 2x のグラフはどれですか？', '["原点を通る右上がりの直線","原点を通る右下がりの直線","双曲線"]', '原点を通る右上がりの直線', 'y = ax で a = 2 > 0 なので、比例のグラフは原点を通る右上がりの直線になります。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (18, 'multi_choice', 'y が x に反比例し、x = 3 のとき y = 4 です。比例定数 a はいくつですか？', '["12","7","3"]', '12', 'y = a/x に x = 3、y = 4 を代入すると 4 = a/3 となり、a = 12 です。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (18, 'multi_choice', '次のうち、反比例の式はどれですか？', '["y = 6/x","y = 6x","y = x + 6"]', 'y = 6/x', '反比例の式は y = a/x の形です。y = 6x は比例、y = x + 6 は1次関数です。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (18, 'multi_choice', 'y = -3x について、x = 4 のときの y の値はいくつですか？', '["-12","12","-7"]', '-12', 'y = -3x に x = 4 を代入すると y = -3 × 4 = -12 になります。', 2);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (18, 'multi_choice', 'y が x に反比例し、y = 12/x と表されます。x = -3 のとき y はいくつですか？', '["-4","4","-36"]', '-4', 'y = 12/x に x = -3 を代入すると y = 12 ÷ (-3) = -4 になります。', 2);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (18, 'multi_choice', '比例 y = ax のグラフが点 (−2, 8) を通るとき、a の値はいくつですか？', '["-4","4","-16"]', '-4', 'y = ax に x = -2、y = 8 を代入すると 8 = -2a となり、a = -4 です。', 2);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (18, 'multi_choice', 'y が x に反比例するとき、x と y の積 xy はどうなりますか？', '["常に一定である","x が増えると増える","x によって変化する"]', '常に一定である', 'y = a/x の両辺に x をかけると xy = a となり、積 xy は比例定数 a に等しく常に一定です。', 2);
INSERT INTO topics (id, subject_id, slug, name, "order") VALUES (19, 3, 'eigo-5', '名詞・代名詞', 5);
INSERT INTO lessons (topic_id, content_md, estimated_minutes) VALUES (19, '# 名詞・代名詞

## 名詞とは
**名詞**は人・もの・場所などの名前を表す言葉です。
- 人: student（生徒）、teacher（先生）
- もの: book（本）、pen（ペン）
- 場所: school（学校）、park（公園）

## 代名詞とは
**代名詞**は名詞の代わりに使う言葉です。同じ名詞を繰り返さないために使います。

## 人称代名詞の変化
| 主格（〜は） | 所有格（〜の） | 目的格（〜を/に） |
|---|---|---|
| I（私） | my | me |
| you（あなた） | your | you |
| he（彼） | his | him |
| she（彼女） | her | her |
| we（私たち） | our | us |
| they（彼ら） | their | them |

## ポイント
- 主語には**主格**を使う: **He** is my friend.
- 名詞を修飾するには**所有格**を使う: This is **my** book.
- 動詞・前置詞の後には**目的格**を使う: I like **him**.', 5);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (19, 'multi_choice', '「私は学生です。」を英語にするとき、「私は」にあたる正しい語はどれですか？', '["I","My","Me"]', 'I', '主語（〜は）には主格を使います。「私は」は主格の "I" です。"My" は「私の」、"Me" は「私を・私に」という意味です。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (19, 'multi_choice', '（　）is a good teacher. 空欄に入る正しい語はどれですか？（「彼女は」という意味）', '["She","Her","Hers"]', 'She', '文の主語（〜は）には主格を使います。「彼女は」は主格の "She" です。"Her" は「彼女の・彼女を」、"Hers" は「彼女のもの」です。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (19, 'multi_choice', 'This is （　） bag. 空欄に入る正しい語はどれですか？（「彼の」という意味）', '["his","he","him"]', 'his', '名詞（bag）を修飾するときは所有格を使います。「彼の」は所有格の "his" です。"he" は主格、"him" は目的格です。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (19, 'multi_choice', 'I know （　） very well. 空欄に入る正しい語はどれですか？（「彼女を」という意味）', '["her","she","hers"]', 'her', '動詞（know）の後の目的語には目的格を使います。「彼女を」は目的格の "her" です。"she" は主格、"hers" は「彼女のもの」です。', 2);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (19, 'multi_choice', '次のうち、「もの」を表す名詞はどれですか？', '["desk","run","happy"]', 'desk', '"desk"（机）は「もの」を表す名詞です。"run" は「走る」という動詞、"happy" は「幸せな」という形容詞です。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (19, 'multi_choice', '（　） are my friends. 空欄に入る正しい語はどれですか？（「彼らは」という意味）', '["They","Their","Them"]', 'They', '主語（〜は）には主格を使います。「彼らは」は主格の "They" です。"Their" は「彼らの」、"Them" は「彼らを・彼らに」です。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (19, 'multi_choice', 'Please help （　）. 空欄に入る正しい語はどれですか？（「私たちを」という意味）', '["us","we","our"]', 'us', '動詞（help）の後の目的語には目的格を使います。「私たちを」は目的格の "us" です。"we" は主格、"our" は「私たちの」という所有格です。', 2);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (19, 'multi_choice', '次の文の下線部 "book" の代わりに使える代名詞はどれですか？「The book is new.」', '["It","He","She"]', 'It', '人以外のもの（book など）を指す代名詞は "It" を使います。"He" は男性の人、"She" は女性の人を指すときに使います。', 2);
INSERT INTO topics (id, subject_id, slug, name, "order") VALUES (20, 4, 'rika-2', '動物の分類', 2);
INSERT INTO lessons (topic_id, content_md, estimated_minutes) VALUES (20, '# 動物の分類

動物は体のつくりや特徴によってグループに分けることができます。

## 脊椎動物と無脊椎動物

- **脊椎動物**：背骨（脊椎）をもつ動物。魚類・両生類・は虫類・鳥類・哺乳類の5グループに分類されます。
- **無脊椎動物**：背骨をもたない動物。昆虫類・甲殻類・軟体動物などが含まれます。

## 脊椎動物5グループの特徴

| グループ | 体表 | 呼吸 | 生まれ方 |
|------|------|------|------|
| 魚類 | うろこ | えら | 卵生 |
| 両生類 | 湿った皮膚 | えら→肺・皮膚 | 卵生 |
| は虫類 | うろこ | 肺 | 卵生 |
| 鳥類 | 羽毛 | 肺 | 卵生 |
| 哺乳類 | 毛 | 肺 | 胎生 |

**胎生**は子どもを母体内で育ててから産む生まれ方で、哺乳類の大きな特徴です。', 5);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (20, 'multi_choice', '背骨をもつ動物をまとめて何といいますか？', '["脊椎動物","無脊椎動物","節足動物"]', '脊椎動物', '背骨（脊椎）をもつ動物を脊椎動物といいます。魚類・両生類・は虫類・鳥類・哺乳類の5グループが含まれます。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (20, 'multi_choice', '次のうち、哺乳類はどれですか？', '["イルカ","ペンギン","カメ"]', 'イルカ', 'イルカは水中で生活しますが、肺で呼吸し、胎生で子を産む哺乳類です。ペンギンは鳥類、カメはは虫類です。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (20, 'multi_choice', '両生類の体表の特徴として正しいのはどれですか？', '["湿った皮膚でおおわれている","うろこでおおわれている","羽毛でおおわれている"]', '湿った皮膚でおおわれている', '両生類（カエル・イモリなど）は湿った皮膚をもち、皮膚でも呼吸します。うろこは魚類・は虫類、羽毛は鳥類の特徴です。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (20, 'multi_choice', '母体内で子を育ててから産む生まれ方を何といいますか？', '["胎生","卵生","分裂生殖"]', '胎生', '胎生とは、母体内で子どもをある程度育ててから産む生まれ方です。哺乳類に見られる大きな特徴の一つです。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (20, 'multi_choice', 'は虫類の呼吸の仕方として正しいのはどれですか？', '["肺で呼吸する","えらで呼吸する","皮膚だけで呼吸する"]', '肺で呼吸する', 'は虫類（トカゲ・ヘビ・カメなど）は一生を通じて肺で呼吸します。えら呼吸は魚類、皮膚呼吸を主に行うのは両生類の特徴です。', 2);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (20, 'multi_choice', '次のうち、無脊椎動物はどれですか？', '["バッタ","サンショウウオ","スズメ"]', 'バッタ', 'バッタは昆虫類に属する節足動物で、背骨をもたない無脊椎動物です。サンショウウオは両生類、スズメは鳥類で、どちらも脊椎動物です。', 2);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (20, 'multi_choice', '鳥類とは虫類に共通する特徴はどれですか？', '["卵を産む（卵生）","体表が羽毛でおおわれている","肺と皮膚で呼吸する"]', '卵を産む（卵生）', '鳥類とは虫類はどちらも卵生です。羽毛は鳥類だけの特徴で、は虫類はうろこをもちます。皮膚でも呼吸するのは両生類の特徴です。', 2);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (20, 'multi_choice', '次の動物のうち、魚類はどれですか？', '["タツノオトシゴ","クジラ","ウミガメ"]', 'タツノオトシゴ', 'タツノオトシゴはえらで呼吸し、うろこをもつ魚類です。クジラは肺で呼吸し胎生の哺乳類、ウミガメは肺で呼吸し卵を産むは虫類です。', 3);
INSERT INTO topics (id, subject_id, slug, name, "order") VALUES (21, 4, 'rika-4', '光・音・力', 4);
INSERT INTO lessons (topic_id, content_md, estimated_minutes) VALUES (21, '# 光・音・力

## 光の性質
光は**直進**する性質をもち、鏡などで**反射**します。反射の法則では「入射角＝反射角」が成り立ちます。また、光が水やガラスに入るとき、境界面で**屈折**します。

## 音の性質
音は物体の**振動**によって生じ、空気などの**媒質**を伝わります。音の速さは約**340 m/s**（空気中）で、光より遅いです。振動数が大きいほど**高い音**、振幅が大きいほど**大きい音**になります。

## 力の性質
力には①**物体の形を変える**②**物体の運動状態を変える**③**物体を支える**の3つのはたらきがあります。力の単位は**N（ニュートン）**です。
- 重力：地球が物体を引く力
- 弾性力：変形した物体が元に戻ろうとする力
- 摩擦力：物体の動きを妨げる力

ばねの伸びは加えた力に**比例**します（フックの法則）。', 5);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (21, 'multi_choice', '光が鏡で反射するとき、入射角と反射角の関係はどれか。', '["入射角＝反射角","入射角＞反射角","入射角＜反射角"]', '入射角＝反射角', '反射の法則により、入射角と反射角は常に等しくなります。どちらも鏡の面に垂直な線（法線）からの角度で測ります。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (21, 'multi_choice', '光が空気中から水中へ進むとき、境界面でどうなるか。', '["屈折して進む","そのまま直進する","完全に反射して戻る"]', '屈折して進む', '光は異なる物質の境界面で屈折します。空気から水へ進む場合、光は法線に近づく向きに折れ曲がります。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (21, 'multi_choice', '音が伝わる速さとして最も正しいものはどれか（空気中・常温）。', '["約340 m/s","約3400 m/s","約34 m/s"]', '約340 m/s', '空気中での音速は約340 m/sです。光の速さ（約30万 km/s）に比べてはるかに遅く、雷で光が見えてから音が遅れて聞こえるのはこのためです。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (21, 'multi_choice', '振動数が大きくなると音はどのように変化するか。', '["高い音になる","大きい音になる","遅い音になる"]', '高い音になる', '振動数（1秒間に振動する回数）が大きいほど音の高さが高くなります。音の大きさは振幅の大きさで決まります。', 2);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (21, 'multi_choice', '力の単位として正しいものはどれか。', '["N（ニュートン）","J（ジュール）","W（ワット）"]', 'N（ニュートン）', '力の単位はN（ニュートン）です。Jはエネルギー・仕事の単位、Wは電力の単位です。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (21, 'multi_choice', 'ばねに加える力を2倍にすると、ばねの伸びはどうなるか。', '["2倍になる","4倍になる","変わらない"]', '2倍になる', 'フックの法則により、ばねの伸びは加えた力に比例します。力を2倍にすれば伸びも2倍になります。', 2);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (21, 'multi_choice', '地球が物体を引きつける力を何というか。', '["重力","弾性力","摩擦力"]', '重力', '地球が物体を地球の中心方向へ引きつける力を重力といいます。弾性力は変形した物体が元に戻ろうとする力、摩擦力は運動を妨げる力です。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (21, 'multi_choice', '力のはたらきとして正しくないものはどれか。', '["物体の色を変える","物体の形を変える","物体の運動状態を変える"]', '物体の色を変える', '力のはたらきは①物体の形を変える②物体の運動状態を変える③物体を支える、の3つです。色を変えることは力のはたらきには含まれません。', 2);
INSERT INTO topics (id, subject_id, slug, name, "order") VALUES (22, 4, 'rika-5', '気体の性質', 5);
INSERT INTO lessons (topic_id, content_md, estimated_minutes) VALUES (22, '# 気体の性質

## 代表的な気体の特徴

理科では、さまざまな気体の性質を学びます。

### 酸素
- **無色・無臭**の気体
- ものを**燃やすはたらき（助燃性）**がある
- 空気より少し**重い**
- 水に**溶けにくい** → 水上置換法で集める

### 二酸化炭素
- **無色・無臭**の気体
- **石灰水を白く濁らせる**性質がある
- 空気より**重い**
- 水に少し溶け、**酸性**を示す

### 水素
- **無色・無臭**で、気体の中で最も**軽い**
- 火をつけると**爆発的に燃える**
- 水に溶けにくい → 水上置換法で集める

### アンモニア
- **無色で刺激臭**がある
- 空気より**軽い**
- 水に非常に**よく溶ける** → 上方置換法で集める
- 水溶液は**アルカリ性**

## 気体の集め方
| 方法 | 特徴 |
|------|------|
| **水上置換法** | 水に溶けにくい気体 |
| **上方置換法** | 空気より軽く水に溶けやすい気体 |
| **下方置換法** | 空気より重く水に溶けやすい気体 |', 5);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (22, 'multi_choice', '酸素を発生させる実験として正しい組み合わせはどれですか？', '["二酸化マンガンにうすい過酸化水素水を加える","石灰石にうすい塩酸を加える","亜鉛にうすい塩酸を加える"]', '二酸化マンガンにうすい過酸化水素水を加える', '酸素は二酸化マンガン（触媒）にうすい過酸化水素水（オキシドール）を加えることで発生します。石灰石に塩酸を加えると二酸化炭素、亜鉛に塩酸を加えると水素が発生します。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (22, 'multi_choice', '石灰水を白く濁らせる気体はどれですか？', '["二酸化炭素","酸素","水素"]', '二酸化炭素', '二酸化炭素は石灰水（水酸化カルシウム水溶液）と反応して炭酸カルシウムという白い沈殿を生じさせます。これが二酸化炭素の検出方法として使われます。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (22, 'multi_choice', 'アンモニアの正しい集め方はどれですか？', '["上方置換法","下方置換法","水上置換法"]', '上方置換法', 'アンモニアは空気より軽く（分子量17）、水に非常によく溶けるため、水上置換法は使えません。空気より軽いので、上方（容器の上）から空気を追い出す上方置換法で集めます。', 2);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (22, 'multi_choice', '気体の中で最も軽いのはどれですか？', '["水素","ヘリウム","アンモニア"]', '水素', '水素（H₂）は分子量が2で、すべての気体の中で最も軽い気体です。ただしヘリウムも非常に軽い（原子量4）ですが、水素のほうが軽いです。中学理科では「最も軽い気体は水素」と覚えましょう。', 2);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (22, 'multi_choice', '二酸化炭素の正しい集め方はどれですか？', '["下方置換法","上方置換法","水上置換法"]', '下方置換法', '二酸化炭素は空気より重く（分子量44）、水に少し溶けるため水上置換法には向きません。空気より重いので、下方（容器の下）から空気を追い出す下方置換法が適しています。', 2);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (22, 'multi_choice', '刺激臭があり、水溶液がアルカリ性を示す気体はどれですか？', '["アンモニア","塩化水素","二酸化硫黄"]', 'アンモニア', 'アンモニア（NH₃）は独特の刺激臭を持ち、水に溶けるとアンモニア水（アルカリ性）になります。塩化水素や二酸化硫黄も刺激臭がありますが、水に溶けると酸性を示します。', 2);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (22, 'multi_choice', 'ものを燃やすはたらき（助燃性）がある気体はどれですか？', '["酸素","窒素","二酸化炭素"]', '酸素', '酸素には助燃性があり、火のついた線香を酸素の中に入れると激しく燃えます。窒素は燃焼を助けず、二酸化炭素は逆に炎を消す性質（消火に利用）があります。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (22, 'multi_choice', '水上置換法で集めるのに最も適した気体はどれですか？', '["水素","アンモニア","塩化水素"]', '水素', '水上置換法は水に溶けにくい気体を集めるのに適しています。水素は水にほとんど溶けないため水上置換法が使えます。アンモニアや塩化水素は水に非常によく溶けるため、水上置換法では気体が水に溶けてしまい集められません。', 3);
INSERT INTO topics (id, subject_id, slug, name, "order") VALUES (23, 5, 'shakai-2', '日本の地形', 2);
INSERT INTO lessons (topic_id, content_md, estimated_minutes) VALUES (23, '# 日本の地形

## 日本の位置と国土
日本は**ユーラシア大陸の東側**に位置する島国です。北海道・本州・四国・九州の**四つの大きな島**と、約6,800の島々からなります。

## 山地・山脈
日本の国土の約**4分の3**は山地や丘陵地です。本州中央部には「**日本の屋根**」とよばれる**飛騨山脈・木曽山脈・赤石山脈**（日本アルプス）がそびえます。最高峰は**富士山（3,776m）**です。

## 平野と川
平野は国土の約4分の1を占め、**関東平野**は日本最大の平野です。日本の川は**長さが短く、流れが急**という特徴があります。最も長い川は**信濃川**です。

## 海岸と海流
日本の海岸線は複雑で、**リアス海岸**のように出入りの多い地形も見られます。周辺を流れる海流には**暖流（黒潮・対馬海流）**と**寒流（親潮・リマン海流）**があります。', 5);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (23, 'multi_choice', '日本の国土の約4分の3を占めている地形はどれですか？', '["山地や丘陵地","平野や低地","湖や湿原"]', '山地や丘陵地', '日本の国土の約4分の3は山地や丘陵地で占められており、平野は約4分の1にすぎません。そのため農業や居住に使える土地が限られています。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (23, 'multi_choice', '日本で最も高い山はどれですか？', '["富士山","北岳","穂高岳"]', '富士山', '富士山は標高3,776mで日本最高峰です。静岡県と山梨県の境に位置し、火山でもあります。2013年には世界文化遺産に登録されました。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (23, 'multi_choice', '「日本の屋根」とよばれる、本州中央部に連なる三つの山脈をまとめて何といいますか？', '["日本アルプス","奥羽山脈","中国山地"]', '日本アルプス', '飛騨山脈・木曽山脈・赤石山脈の三つを合わせて「日本アルプス」とよびます。3,000m級の山々が連なり、「日本の屋根」ともよばれています。', 2);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (23, 'multi_choice', '日本で最も長い川はどれですか？', '["信濃川","利根川","石狩川"]', '信濃川', '信濃川は全長約367kmで日本最長の川です。長野県から新潟県を流れ日本海に注ぎます。なお、流域面積が最大なのは利根川です。', 2);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (23, 'multi_choice', '日本最大の平野はどれですか？', '["関東平野","濃尾平野","石狩平野"]', '関東平野', '関東平野は面積約17,000km²で日本最大の平野です。東京・埼玉・千葉・茨城・栃木・群馬・神奈川の1都6県にまたがっています。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (23, 'multi_choice', '湾や入り江が複雑に入り組んだ海岸地形を何といいますか？', '["リアス海岸","砂浜海岸","断崖海岸"]', 'リアス海岸', 'リアス海岸は山地が海に沈んでできた、入り江や半島が複雑に入り組んだ海岸地形です。三陸海岸や志摩半島などが代表例で、天然の良港が多い一方、津波の被害を受けやすい特徴もあります。', 2);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (23, 'multi_choice', '日本の太平洋側を北から南へ流れる暖流はどれですか？', '["黒潮（日本海流）","親潮（千島海流）","対馬海流"]', '黒潮（日本海流）', '黒潮（日本海流）は太平洋側を北上する暖流です。水温が高く魚が多く集まります。一方、太平洋側を南下する寒流は親潮（千島海流）です。対馬海流は日本海側を流れる暖流です。', 3);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (23, 'multi_choice', '日本の川の特徴として正しいものはどれですか？', '["長さが短く流れが急である","長さが長く流れがゆるやかである","長さが短く流れがゆるやかである"]', '長さが短く流れが急である', '日本は山地が多く、海岸線までの距離が短いため、川の長さは短く、傾斜が急で流れが速いという特徴があります。ヨーロッパなどの大陸の川と比べると大きな違いがあります。', 2);
INSERT INTO topics (id, subject_id, slug, name, "order") VALUES (24, 5, 'shakai-3', '世界の地形', 3);
INSERT INTO lessons (topic_id, content_md, estimated_minutes) VALUES (24, '# 世界の地形

## 陸地と海洋
地球の表面の約**71%**は海洋で、残りの約**29%**が陸地です。陸地は6つの大陸（ユーラシア・アフリカ・北アメリカ・南アメリカ・オーストラリア・南極）に分かれています。

## 主な山脈と山
- **ヒマラヤ山脈**：アジアにあり、世界最高峰エベレスト（約8849m）を含む
- **アンデス山脈**：南アメリカ大陸西部に連なる長大な山脈
- **アルプス山脈**：ヨーロッパ中部に位置する

## 主な川と平野
- **アマゾン川**：南アメリカを流れる世界最大流域の川
- **ナイル川**：アフリカを流れる世界最長クラスの川
- 大きな川の流域には広大な**平野**が広がり、農業や文明の発展に役立ってきた

## 海洋の名称
世界の三大洋は**太平洋・大西洋・インド洋**です。太平洋は最も広い海洋です。', 5);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (24, 'multi_choice', '地球の表面に占める海洋の割合として正しいものはどれですか？', '["約71%","約50%","約29%"]', '約71%', '地球の表面の約71%は海洋で、陸地は約29%です。地球は「水の惑星」とも呼ばれるほど海洋が広い割合を占めています。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (24, 'multi_choice', '世界の大陸は全部でいくつありますか？', '["6つ","5つ","7つ"]', '6つ', '世界の大陸はユーラシア・アフリカ・北アメリカ・南アメリカ・オーストラリア・南極の6つです。7大陸と数える場合はユーラシアをヨーロッパとアジアに分けますが、中学では6大陸が基本です。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (24, 'multi_choice', '世界最高峰のエベレストが属する山脈はどれですか？', '["ヒマラヤ山脈","アンデス山脈","アルプス山脈"]', 'ヒマラヤ山脈', 'エベレスト（標高約8849m）はアジアのヒマラヤ山脈にあります。ヒマラヤ山脈はインドプレートとユーラシアプレートの衝突によって形成されました。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (24, 'multi_choice', '南アメリカ大陸の西部に連なる長大な山脈はどれですか？', '["アンデス山脈","ロッキー山脈","アトラス山脈"]', 'アンデス山脈', 'アンデス山脈は南アメリカ大陸の太平洋側（西部）を南北に走る世界最長の山脈です。ロッキー山脈は北アメリカ、アトラス山脈はアフリカ北部にあります。', 2);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (24, 'multi_choice', '世界で最も流域面積が広い川はどれですか？', '["アマゾン川","ナイル川","ミシシッピ川"]', 'アマゾン川', 'アマゾン川は南アメリカを流れ、流域面積は世界最大です。流量も世界最大で、広大な熱帯雨林（アマゾン）を流れます。ナイル川は長さが世界最長クラスです。', 2);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (24, 'multi_choice', '世界の三大洋のうち、最も面積が広い海洋はどれですか？', '["太平洋","大西洋","インド洋"]', '太平洋', '太平洋は世界で最も広い海洋で、地球の表面積の約3分の1を占めます。日本も太平洋に面しています。三大洋の広さの順は太平洋＞大西洋＞インド洋です。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (24, 'multi_choice', 'アフリカ大陸を流れる世界最長クラスの川はどれですか？', '["ナイル川","コンゴ川","ザンベジ川"]', 'ナイル川', 'ナイル川はアフリカ北部を流れ、地中海に注ぐ世界最長クラスの川です。古代エジプト文明はナイル川流域で栄えました。コンゴ川・ザンベジ川もアフリカの川ですが、長さはナイル川に及びません。', 2);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (24, 'multi_choice', 'ヨーロッパ中部に位置する山脈はどれですか？', '["アルプス山脈","ウラル山脈","カフカス山脈"]', 'アルプス山脈', 'アルプス山脈はスイス・フランス・イタリアなどにまたがるヨーロッパ中部の山脈です。ウラル山脈はロシアのヨーロッパ・アジア境界、カフカス山脈は黒海とカスピ海の間に位置します。', 3);
INSERT INTO topics (id, subject_id, slug, name, "order") VALUES (25, 5, 'shakai-5', '古代日本', 5);
INSERT INTO lessons (topic_id, content_md, estimated_minutes) VALUES (25, '# 古代日本

## 縄文・弥生時代
- **縄文時代**：約1万年前〜、土器や打製石器を使用、狩猟・採集の生活
- **弥生時代**：稲作が大陸から伝わり、貧富の差・身分の差が生まれた

## 邪馬台国と卑弥呼
- **卑弥呼**が邪馬台国を治め、3世紀に中国の魏に使いを送った
- 魏の皇帝から「**親魏倭王**」の称号と金印を授けられた

## 大和政権と古墳時代
- 3〜4世紀ごろ、近畿地方を中心に**大和政権**が成立
- 各地に**古墳**が造られ、大阪の**大仙古墳（仁徳天皇陵）**は世界最大級
- 渡来人が**漢字・仏教・儒学**などを日本に伝えた

## 飛鳥時代
- **聖徳太子**が推古天皇の摂政として政治改革を行う
- **十七条の憲法**・**冠位十二階**を制定し、天皇中心の国づくりをめざした', 5);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (25, 'multi_choice', '縄文時代の人々の主な生活の様子として正しいものはどれですか？', '["狩猟・採集を中心とした生活","稲作を中心とした農耕生活","鉄器を使った大規模な農業"]', '狩猟・採集を中心とした生活', '縄文時代の人々は農耕をほとんど行わず、動物を狩ったり、木の実や魚を採集したりして暮らしていました。稲作が始まるのは弥生時代です。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (25, 'multi_choice', '弥生時代に大陸から日本に伝わった農業の技術は何ですか？', '["稲作","綿花栽培","小麦の栽培"]', '稲作', '弥生時代に中国大陸や朝鮮半島から稲作が伝わりました。これにより食料の安定供給が可能になりましたが、同時に土地や食料をめぐる争いや貧富の差が生まれました。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (25, 'multi_choice', '3世紀ごろ、邪馬台国を治めていた女王は誰ですか？', '["卑弥呼","推古天皇","持統天皇"]', '卑弥呼', '卑弥呼は3世紀ごろ邪馬台国を治めた女王です。中国の魏に使いを送り、魏の皇帝から「親魏倭王」の称号と金印を授けられたことが、中国の歴史書「魏志倭人伝」に記されています。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (25, 'multi_choice', '古墳時代に大阪に造られた日本最大の古墳の名称はどれですか？', '["大仙古墳（仁徳天皇陵）","高松塚古墳","箸墓古墳"]', '大仙古墳（仁徳天皇陵）', '大仙古墳（仁徳天皇陵）は大阪府堺市にある前方後円墳で、全長約486mと世界最大級の墳墓です。2019年にはユネスコの世界文化遺産に登録されました。', 2);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (25, 'multi_choice', '渡来人が日本に伝えたものとして正しいものはどれですか？', '["漢字・仏教・儒学","イスラム教・アラビア数字","キリスト教・活版印刷"]', '漢字・仏教・儒学', '朝鮮半島や中国大陸からやってきた渡来人は、漢字・仏教・儒学のほか、機織りや須恵器の製法など多くの技術や文化を日本に伝えました。', 2);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (25, 'multi_choice', '聖徳太子が推古天皇の摂政として定めた、役人の心構えを示すものは何ですか？', '["十七条の憲法","大宝律令","御成敗式目"]', '十七条の憲法', '聖徳太子は604年に十七条の憲法を定め、「和を以て貴しとなす」など役人が守るべき心構えを示しました。仏教や儒学の考え方をもとに、天皇中心の政治をめざしました。', 2);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (25, 'multi_choice', '聖徳太子が制定した、家柄ではなく能力や功績によって役人を取り立てる制度は何ですか？', '["冠位十二階","班田収授法","墾田永年私財法"]', '冠位十二階', '冠位十二階は603年に聖徳太子が定めた制度で、家柄に関係なく、才能や功績のある人物を役人に取り立てることを目的としていました。冠の色でその地位を区別しました。', 2);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (25, 'multi_choice', '大和政権が3〜4世紀ごろに成立した地域はどこですか？', '["近畿地方","関東地方","九州地方"]', '近畿地方', '大和政権（ヤマト王権）は現在の奈良県を中心とする近畿地方で成立しました。その後、各地の豪族を従えながら勢力を広げ、やがて日本列島の広い範囲を支配するようになりました。', 1);
