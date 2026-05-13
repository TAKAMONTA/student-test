-- Complete content seed for 中1テストキット.
-- Replaces lessons/questions/topics while preserving users and purchases.

DELETE FROM attempts;
DELETE FROM topic_progress;
DELETE FROM ai_chats;
DELETE FROM mock_exam_items;
DELETE FROM mock_exams;
DELETE FROM questions;
DELETE FROM lessons;
DELETE FROM topics;

INSERT OR IGNORE INTO subjects (id, slug, name, "order") VALUES (1, 'kokugo', '国語', 1);
INSERT OR IGNORE INTO subjects (id, slug, name, "order") VALUES (2, 'sugaku', '数学', 2);
INSERT OR IGNORE INTO subjects (id, slug, name, "order") VALUES (3, 'eigo', '英語', 3);
INSERT OR IGNORE INTO subjects (id, slug, name, "order") VALUES (4, 'rika', '理科', 4);
INSERT OR IGNORE INTO subjects (id, slug, name, "order") VALUES (5, 'shakai', '社会', 5);

INSERT INTO topics (id, subject_id, slug, name, "order") VALUES (1, 1, 'kokugo-1', '説明文の読み方', 1);
INSERT INTO topics (id, subject_id, slug, name, "order") VALUES (2, 1, 'kokugo-2', '物語文の読み方', 2);
INSERT INTO topics (id, subject_id, slug, name, "order") VALUES (3, 2, 'sugaku-1', '正の数・負の数', 1);
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
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (4, 'multi_choice', '次のうち、文字式の表し方として正しいものはどれですか？', '["a3（a×3 を表したもの）","a×3（そのまま書いたもの）","3a（a×3 を正しく表したもの）"]', '3a（a×3 を正しく表したもの）', '文字式では「×」を省略し、数字を文字の前に書きます。a×3 は 3a と表します。また、1×a = a のように係数が1のときは1を省略します。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (4, 'multi_choice', '$x \div 5$ を文字式で正しく表しているものはどれですか？', '["x/5","5x","5/x"]', 'x/5', '÷を使わずに分数で表します。x÷5 = x/5（x を5で割った分数）となります。5/x は x で5を割った式になるので誤りです。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (4, 'multi_choice', '式 $4x - 3y + 7$ について、$y$ の係数はどれですか？', '["4","3","-3"]', '-3', '$4x - 3y + 7$ は $4x + (-3y) + 7$ と考えます。$y$ にかかっている数（係数）はマイナスを含めて $-3$ です。符号を忘れずに読み取りましょう。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (4, 'multi_choice', '$a = -2$ のとき、$3a + 5$ の値を求めなさい。', '["1","11","-1"]', '-1', '$a = -2$ を代入すると、$3 \times (-2) + 5 = -6 + 5 = -1$ となります。負の数を代入するときは、かっこをつけて計算ミスを防ぎましょう。', 2);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (4, 'multi_choice', '次の式を文字式のルールに従って正しく表しなさい。
$x \times x \times y \times (-3)$', '["-3xy²","-3x²y","3x²y"]', '-3x²y', '数字を先に、次に文字をアルファベット順に並べます。$x \times x = x^2$ なので、$(-3) \times x \times x \times y = -3x^2y$ となります。', 2);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (4, 'multi_choice', '$x = 4$、$y = -1$ のとき、$2x^2 + 3y$ の値を求めなさい。', '["29","35","13"]', '29', '$x = 4$、$y = -1$ を代入すると、$2 \times 4^2 + 3 \times (-1) = 2 \times 16 + (-3) = 32 - 3 = 29$ となります。累乗の計算を先に行うことがポイントです。', 2);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (4, 'multi_choice', '1個 $a$ 円のりんごを5個と、1本 $b$ 円のジュースを3本買いました。合計金額を文字式で表したとき、$a = 120$、$b = 80$ のときの合計金額（円）を求めなさい。', '["960","800","840"]', '840', '合計金額は $5a + 3b$ 円です。$a = 120$、$b = 80$ を代入すると、$5 \times 120 + 3 \times 80 = 600 + 240 = 840$（円）となります。文字式で場面を表してから代入する流れを覚えましょう。', 3);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (4, 'multi_choice', '縦が $x$ cm、横が $y$ cm の長方形の周の長さを文字式で表すとどれですか？', '["2x + 2y","xy","x + y"]', '2x + 2y', '長方形の周の長さは、縦2本と横2本の合計です。したがって $x + x + y + y = 2x + 2y$ となります。面積を表す $xy$ と混同しないようにしましょう。', 2);
INSERT INTO topics (id, subject_id, slug, name, "order") VALUES (5, 2, 'sugaku-5', '平面図形', 5);
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
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (5, 'multi_choice', '2本の直線が直角（90°）に交わるとき、この2直線の関係を何といいますか？', '["対称","平行","垂直"]', '垂直', '2本の直線が90°（直角）で交わるとき、この2直線は「垂直」であるといいます。記号は「⊥」を使って表します。例えば、直線ℓと直線mが垂直のとき「ℓ⊥m」と書きます。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (5, 'multi_choice', '次の角度のうち、「鈍角」にあてはまるものはどれですか？', '["45°","120°","90°"]', '120°', '鈍角とは、90°より大きく180°未満の角のことです。120°は90°＜120°＜180°を満たすので鈍角です。90°は直角、45°は鋭角（0°以上90°未満）、180°は平角と呼びます。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (5, 'multi_choice', '図形を、ある直線を折り目として折り返したときに重なる移動を何といいますか？漢字4文字で答えなさい。', '["対称移動","線対移動","反転移動"]', '対称移動', 'ある直線（対称の軸）を折り目として図形を折り返す移動を「対称移動」といいます。対称移動では、対応する点は対称の軸からの距離が等しく、軸に対して垂直に位置します。平行移動・回転移動と合わせて3つの基本的な図形の移動として覚えておきましょう。', 2);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (5, 'multi_choice', '直線と線分と半直線について正しく説明しているものはどれですか？', '["半直線は両方向に限りなく伸びる","線分は両端があり、長さが定まる","直線は一方向だけに限りなく伸びる"]', '線分は両端があり、長さが定まる', '線分とは2つの端点A・Bを結んだもので、長さが定まります。直線は両方向に限りなく伸び、半直線は一方の端点から一方向にだけ限りなく伸びます。それぞれの違いをしっかり区別して覚えましょう。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (5, 'multi_choice', '右の図で、直線ℓ∥直線mのとき、角xの大きさは何度ですか？ただし、平行な2直線に1本の直線が交わるとき、錯角は等しく、同位角も等しいとします。直線に交わる角の一方が70°、錯角の関係にある角がxのとき、xを求めなさい。', '["110","180","70"]', '70', '平行な2直線に1本の直線（横断線）が交わるとき、錯角は等しくなります。問題の角70°とxは錯角の関係にあるため、x＝70°となります。錯角・同位角・同側内角（補角）の関係は中1平面図形の重要事項です。同位角も等しく、同側内角の和は180°になります。', 2);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (5, 'multi_choice', '1つの円において、円周上の2点A・Bと円の中心Oを結んでできる角AOB（中心角）が120°のとき、残りの部分の中心角は何度ですか？', '["240","180","120"]', '240', '円の中心角の合計は360°です。中心角AOBが120°のとき、残りの部分の中心角は360°－120°＝240°となります。円全体の角度が360°であることは、図形問題を解くうえで基本となる知識です。', 2);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (5, 'multi_choice', '平行移動・回転移動・対称移動のいずれの場合も変わらないものを1つ答えなさい。', '["向きと位置","形と大きさ（合同）","位置と大きさ"]', '形と大きさ（合同）', '平行移動・回転移動・対称移動はいずれも図形の「形と大きさ」を変えない移動です。つまり、移動前と移動後の図形は合同になります。位置や向きは変わることがありますが、辺の長さや角の大きさは保たれます。', 2);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (5, 'multi_choice', '点Oを中心として図形を90°回したときの移動を何といいますか？', '["回転移動","平行移動","対称移動"]', '回転移動', '1つの点を中心にして図形を一定の角度だけ回す移動を回転移動といいます。中心となる点を回転の中心といい、90°や180°などの角度で表します。', 1);
INSERT INTO topics (id, subject_id, slug, name, "order") VALUES (6, 3, 'eigo-1', 'アルファベット・発音', 1);
INSERT INTO topics (id, subject_id, slug, name, "order") VALUES (7, 3, 'eigo-2', 'be動詞', 2);
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
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (8, 'multi_choice', '次のうち、一般動詞はどれですか？', '["am","are","play"]', 'play', 'am・are・isはbe動詞です。一般動詞とはbe動詞以外の動詞で、動作や状態を表します。「play（遊ぶ・演奏する）」が一般動詞です。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (8, 'multi_choice', '「私は音楽が好きです。」を英語にすると？', '["I am like music.","I like music.","Do I like music."]', 'I like music.', '主語（I）＋一般動詞（like）＋目的語（music）の語順が正しい肯定文です。主語がIのとき動詞はlikeをそのまま使います。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (8, 'multi_choice', '「あなたはテニスをしますか？」の正しい英文はどれですか？', '["You do play tennis?","Do you play tennis?","Are you play tennis?"]', 'Do you play tennis?', '一般動詞の疑問文は「Do ＋ 主語 ＋ 動詞の原形 ～？」の形にします。主語がyouのときはDoを使います。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (8, 'multi_choice', '「私はサッカーをしません。」の正しい英文はどれですか？', '["I am not play soccer.","I not play soccer.","I don''t play soccer."]', 'I don''t play soccer.', '一般動詞の否定文は「主語 ＋ don''t（do not）＋ 動詞の原形」です。主語がI・youのときはdon''tを使います。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (8, 'multi_choice', 'Do you have a bike? に対する**否定の答え**として正しいのはどれですか？', '["No, I doesn''t.","No, I don''t.","No, I am not."]', 'No, I don''t.', 'Do you ～? の疑問文に対して、否定で答えるときは「No, I don''t.」と返します。don''tはdo notの短縮形です。', 2);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (8, 'multi_choice', '次の文を否定文に書き換えてください。
「I study English every day.」', '["I don''t study English every day.","I don''t studied English every day.","I doesn''t study English every day."]', 'I don''t study English every day.', '一般動詞の否定文は動詞の前に「don''t（do not）」を入れ、動詞は原形のまま使います。studyはそのまま原形で使います。', 2);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (8, 'multi_choice', '次の文を疑問文に書き換えてください。
「You like cats.」', '["Do you like cats?","Are you like cats?","Do you likes cats?"]', 'Do you like cats?', '一般動詞の疑問文は文頭に「Do」を置き、「Do ＋ 主語 ＋ 動詞の原形 ～？」の語順にします。likeはそのまま原形で使います。', 2);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (8, 'multi_choice', '日本語に合うように（　）に入る語を答えてください。
「私は犬を飼っていません。」
I (　) have a dog.', '["doesn''t","not","don''t"]', 'don''t', '主語がIの一般動詞の否定文では、動詞の前に「don''t（do not）」を置きます。don''tはdo notを短縮した形です。', 2);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (8, 'multi_choice', '次の5つの英文のうち、一般動詞が使われている正しい文はいくつありますか？

① I play the guitar.
② She am a student.
③ We like soccer.
④ I don''t study math.
⑤ Are you happy?', '["2","3","4"]', '3', '①「play」は一般動詞で正しい文です。③「like」は一般動詞で正しい文です。④「don''t study」は一般動詞の否定文で正しい文です。②はbe動詞（am）の使い方が誤り（She isが正しい）、⑤はbe動詞（are）を使った文なので一般動詞の文ではありません。よって正解は3つです。', 3);
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

「You are from Tokyo.」', '["You are from Tokyo?","Are you from Tokyo?","Do you from Tokyo?"]', 'Are you from Tokyo?', 'be動詞（are）を主語（you）の前に移動させます。「Are you from Tokyo?」が正解です。「Do」は一般動詞の疑問文で使うため、be動詞の文には使いません。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (9, 'multi_choice', '次の文の（　）に入る最も適切な語はどれですか？

「She （　） play tennis.」（否定文）', '["isn''t","don''t","doesn''t"]', 'doesn''t', '主語が「She」（三人称単数）なので、一般動詞の否定文には「doesn''t（does not）」を使います。「don''t」は I / you / we / they のときに使います。doesn''t の後ろの動詞は原形（play）になります。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (9, 'multi_choice', '次の疑問文に対する答えとして正しいものはどれですか？

「Does your brother like soccer?」', '["Yes, he does.","Yes, I do.","Yes, he is."]', 'Yes, he does.', 'Does を使った疑問文には「Yes, 主語 does.」または「No, 主語 doesn''t.」で答えます。「your brother」は「he」に置き換えて答えます。「Yes, he is.」はbe動詞の答え方なので誤りです。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (9, 'multi_choice', '次の文の空欄に入る正しい組み合わせはどれですか？

「（　）　you　（　）　English every day?」（あなたは毎日英語を勉強しますか？）', '["Do ／ studies","Do ／ study","Does ／ study"]', 'Do ／ study', '主語が「you」のとき、一般動詞の疑問文は「Do」を使います。Doesは三人称単数（he / she / it など）のときに使います。また、Do / Does の後ろの動詞は必ず原形（study）にします。', 2);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (9, 'multi_choice', '次の日本語を英語にしてください。

「彼は医者ではありません。」

※ 短縮形（isn''t）を使って答えてください。', '["He isn''t a doctor.","He isn''t doctor.","He aren''t a doctor."]', 'He isn''t a doctor.', '主語「彼は」→ He、be動詞は「is」、否定は「is not → isn''t」、「医者」は「a doctor」。よって「He isn''t a doctor.」となります。「He''s not a doctor.」も正解です。', 2);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (9, 'multi_choice', '次の肯定文を疑問文に書き換えてください。

「Ken and Yuki are good friends.」', '["Are Ken and Yuki good friend?","Are Ken and Yuki good friends?","Is Ken and Yuki good friends?"]', 'Are Ken and Yuki good friends?', 'be動詞（are）を主語（Ken and Yuki）の前に出します。文末はクエスチョンマーク（?）をつけます。「Are Ken and Yuki good friends?」が正解です。', 2);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (9, 'multi_choice', '次の文を否定文に書き換えてください。

「My father watches TV at night.」

※ 短縮形（doesn''t）を使って答えてください。', '["My father doesn''t watches TV at night.","My father don''t watch TV at night.","My father doesn''t watch TV at night."]', 'My father doesn''t watch TV at night.', '主語「My father」は三人称単数なので「doesn''t（does not）」を使います。また、doesn''t を使うと動詞は原形に戻るため「watches → watch」になります。「My father doesn''t watch TV at night.」が正解です。', 2);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (9, 'multi_choice', '次の5つの文のうち、文法的に**正しい文**はいくつありますか？　数字で答えてください。

① Are she a nurse?
② He doesn''t have a car.
③ Do they speak Japanese?
④ She don''t like cats.
⑤ Is this your bag?', '["3","2","4"]', '3', '【正しい文】②「He doesn''t have a car.」③「Do they speak Japanese?」⑤「Is this your bag?」の3つ。

【誤りの文】①「Are she」→ she はbe動詞 is を使うので「Is she a nurse?」が正しい。④「She don''t」→ she は三人称単数なので「doesn''t」を使い「She doesn''t like cats.」が正しい。', 3);
INSERT INTO topics (id, subject_id, slug, name, "order") VALUES (10, 4, 'rika-1', '植物のからだ', 1);
INSERT INTO topics (id, subject_id, slug, name, "order") VALUES (11, 4, 'rika-3', '物質の性質', 3);
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
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (11, 'multi_choice', '次のうち、純粋な物質（純物質）はどれですか？', '["空気","エタノール","食塩水"]', 'エタノール', 'エタノール（C₂H₅OH）は1種類の物質だけからなる純物質です。食塩水・砂糖水は溶質と水の混合物、空気は窒素・酸素などの混合物です。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (11, 'multi_choice', '物質が液体から気体に変化するときの温度を何といいますか？', '["融点","凝固点","沸点"]', '沸点', '液体が気体になる温度を沸点といいます。融点は固体が液体になる温度、凝固点は液体が固体になる温度です。水の沸点は100℃（1気圧）です。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (11, 'multi_choice', '密度が1.0 g/cm³よりも大きい物質を水に入れたとき、どうなりますか？', '["溶ける","浮く","沈む"]', '沈む', '水の密度は1.0 g/cm³です。それより密度が大きい物質は水より重いため沈みます。密度が小さい物質（例：氷 0.92 g/cm³）は浮きます。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (11, 'multi_choice', '物質1 cm³あたりの質量のことを何といいますか？漢字2文字で答えなさい。', '["密度","濃度","重度"]', '密度', '密度は「質量÷体積」で求められ、単位はg/cm³（グラム毎立方センチメートル）です。密度は物質に固有の値であるため、物質の種類を調べるときに役立ちます。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (11, 'multi_choice', '混合物から純粋な物質を取り出す方法として、液体混合物を加熱して沸点の違いを利用して分ける操作を何といいますか？', '["蒸留","分留","蒸発"]', '蒸留', '蒸留は液体を加熱して気化させ、それを冷却して再び液体として集める操作です。沸点の異なる液体の混合物（例：水とエタノール）を分離するときに使われます。', 2);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (11, 'multi_choice', '質量78 g、体積10 cm³の金属の密度は何g/cm³ですか？', '["0.78","7.8","780"]', '7.8', '密度＝質量÷体積 で計算します。78 g ÷ 10 cm³ ＝ 7.8 g/cm³ です。この値は鉄の密度（約7.9 g/cm³）に近く、鉄と考えられます。', 2);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (11, 'multi_choice', '密度2.7 g/cm³のアルミニウムがあります。体積が20 cm³のとき、質量は何gですか？', '["7.4","54","54.7"]', '54', '質量＝密度×体積 で計算します。2.7 g/cm³ × 20 cm³ ＝ 54 g です。密度の公式「密度＝質量÷体積」を変形すると「質量＝密度×体積」になります。', 2);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (11, 'multi_choice', '砂糖を水にとかしたとき、砂糖のようにとかされる物質を何といいますか？', '["溶質","溶媒","溶液"]', '溶質', '水溶液では、とけている物質を溶質、とかしている液体を溶媒、溶質が溶媒にとけた全体を溶液といいます。砂糖水では砂糖が溶質、水が溶媒です。', 1);
INSERT INTO topics (id, subject_id, slug, name, "order") VALUES (12, 5, 'shakai-1', '地球のすがた', 1);
INSERT INTO topics (id, subject_id, slug, name, "order") VALUES (13, 5, 'shakai-4', '文明のおこり', 4);
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
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (13, 'multi_choice', 'メソポタミア文明が栄えた川はどれですか？', '["チグリス川・ユーフラテス川","ナイル川","インダス川"]', 'チグリス川・ユーフラテス川', 'メソポタミア文明は現在の西アジア（イラク周辺）のチグリス川とユーフラテス川の流域で発展しました。「メソポタミア」はギリシャ語で「二つの川の間の土地」を意味します。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (13, 'multi_choice', '四大文明に共通してみられる特徴として、正しくないものはどれですか？', '["国家の形成","文字の発明","鉄器の使用"]', '鉄器の使用', '四大文明が栄えた時代に使用されていたのは青銅器です。鉄器が広まるのはその後の時代になります。文字・国家・宗教はいずれの文明にも共通してみられます。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (13, 'multi_choice', 'エジプト文明で使われた文字はどれですか？', '["甲骨文字","くさび形文字","象形文字（ヒエログリフ）"]', '象形文字（ヒエログリフ）', 'エジプト文明では象形文字（ヒエログリフ）が使われました。メソポタミア文明ではくさび形文字、中国文明では甲骨文字が使われました。', 2);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (13, 'multi_choice', '人類が農耕・牧畜を始める以前の生活の仕方を何といいますか？', '["狩猟・採集","狩猟・栽培","漁労・採集"]', '狩猟・採集', '農耕・牧畜が始まる以前、人々は野生の動物を狩ったり、野生の植物の実や根を採集したりして食料を得ていました。これを「狩猟・採集」の生活といいます。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (13, 'multi_choice', '四大文明が大河の流域で発生した理由を、「農業」「人口」という語句を使って説明しなさい。', '["大河の流域は土地が肥えて農業に適しており、食料が豊富に得られたため人口が増加し、都市や国家が発展したから。","大河の流域は農業に必要な水が豊富で作物が育ちやすく、食料を求めて各地から人口が集まり、交易や文化が生まれたから。","大河の流域では農業用の水を確保するために人口が協力して働く必要があり、その組織的な活動をまとめる指導者が現れたから。"]', '大河の流域は土地が肥えて農業に適しており、食料が豊富に得られたため人口が増加し、都市や国家が発展したから。', '大河がもたらす肥沃な土壌と豊富な水は農業生産を高め、安定した食料供給が人口増加を促しました。人口が集中することで都市が形成され、文明が発達しました。', 3);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (13, 'multi_choice', '文明のおこりは今から約何年前のことですか？数字で答えなさい。（単位：年前）', '["10000","3000","5000"]', '5000', '四大文明は今から約5000年前（紀元前3000年ごろ）に大河の流域で発生したとされています。なお、農耕・牧畜の始まりは約1万年前です。', 2);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (13, 'multi_choice', 'ナイル川の流域で発展した文明はどれですか？', '["エジプト文明","インダス文明","中国文明"]', 'エジプト文明', 'エジプト文明はナイル川の流域で発展しました。ナイル川の定期的な氾濫によって肥えた土がもたらされ、農業が発達しました。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (13, 'multi_choice', '中国文明で使われた、亀の甲や動物の骨に刻まれた文字はどれですか？', '["甲骨文字","くさび形文字","象形文字"]', '甲骨文字', '中国文明では、占いの結果などを亀の甲や動物の骨に刻んだ甲骨文字が使われました。くさび形文字はメソポタミア文明、象形文字はエジプト文明の代表的な文字です。', 2);
INSERT INTO topics (id, subject_id, slug, name, "order") VALUES (14, 1, 'kokugo-3', '漢字・語句', 3);
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

UPDATE topics SET midterm_scope = CASE WHEN id IN (1, 2, 3, 6, 7, 10, 12, 14) THEN 1 ELSE 0 END;
INSERT INTO lessons (topic_id, content_md, estimated_minutes) VALUES (1, '# 説明文の読み方

## まず「何について」の文章かをつかむ
説明文は、筆者が事実や考えを筋道立てて伝える文章です。最初の段落では話題、最後の段落ではまとめや主張が示されることが多くあります。

## 指示語と接続語を見る
「これ・それ・その」は直前の語句や内容を指します。「しかし」は逆接、「そのため」は原因と結果、「つまり」はまとめを表します。設問では、前後の関係を必ず確認しましょう。

## 具体例と主張を分ける
「たとえば」の後は具体例です。具体例だけを答えにせず、筆者が最終的に何を言いたいのかを探すことが大切です。', 5);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (1, 'multi_choice', '次の文の（　）に入る接続語として最も適切なものを選びなさい。「朝から強い雨が降り続いた。（　）、運動会は来週に延期された。」', '["しかし","そのため","ところで"]', 'そのため', '強い雨が原因で運動会が延期されたという原因と結果の関係です。順接の「そのため」が適切です。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (1, 'multi_choice', '次の文章の「それ」が指す内容として最も適切なものを選びなさい。「学校の池に小さなメダカが泳いでいた。理科係はそれを観察ノートに記録した。」', '["学校の池","小さなメダカ","理科係"]', '小さなメダカ', '「観察ノートに記録した」対象は直前の「小さなメダカ」です。指示語は直前の内容に戻って確認します。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (1, 'multi_choice', '説明文で「たとえば」から始まる段落の役割として最も適切なものを選びなさい。', '["前の内容を具体例でわかりやすく示す","筆者の主張と反対の意見だけを示す","文章全体の題名を説明する"]', '前の内容を具体例でわかりやすく示す', '「たとえば」は具体例を導く接続語です。前の抽象的な説明を、例によって読み手にわかりやすくします。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (1, 'multi_choice', '次の漢字の読みとして正しいものを選びなさい。「要旨」', '["ようし","ようじ","かなめむね"]', 'ようし', '「要旨」は文章の中心となる内容や筆者の言いたいことです。「旨」は音読みで「シ」と読みます。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (1, 'multi_choice', '次の文の（　）に入る接続語として最も適切なものを選びなさい。「この方法は便利である。（　）、費用が高いという欠点もある。」', '["しかし","だから","さらに"]', 'しかし', '便利というよい点の後に、費用が高いという反対方向の内容が続くので、逆接の「しかし」が適切です。', 2);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (1, 'multi_choice', '次の文章の要旨として最も適切なものを選びなさい。「紙の使用量を減らすことは、森林を守るだけでなく、ごみを減らすことにもつながる。必要なものだけ印刷する意識を持つことが大切である。」', '["紙はすべて使ってはいけない","必要な印刷にしぼる意識が環境を守ることにつながる","森林を守るにはごみを増やすべきだ"]', '必要な印刷にしぼる意識が環境を守ることにつながる', '最後の文に筆者の主張があります。紙をまったく使わない話ではなく、必要なものだけ印刷する意識が大切だと述べています。', 2);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (1, 'multi_choice', '次の三段落構成で、第二段落の役割として最も適切なものを選びなさい。第一段落「地域の祭りには多くの役割がある。」第二段落「祭りでは、子どもから高齢者までが準備に参加し、世代をこえて交流する。」第三段落「このように、祭りは地域のつながりを強めている。」', '["第一段落の内容を具体的に説明している","第三段落の主張を否定している","新しい別の話題に切りかえている"]', '第一段落の内容を具体的に説明している', '第二段落は「多くの役割」の一つとして世代間交流を説明しています。第三段落の結論につながる具体説明です。', 2);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (1, 'multi_choice', '次の文章の構成として最も適切なものを選びなさい。「川は山から海へ流れる間に、土や石を運ぶ。大雨の後には流れが強くなり、川岸を削ることもある。つまり、川は長い時間をかけて地形を変えるはたらきを持っている。」', '["具体的な説明から結論へ進む構成","反対意見を並べて終わる構成","登場人物の気持ちを中心にした構成"]', '具体的な説明から結論へ進む構成', '前半で川のはたらきを具体的に説明し、「つまり」の後で結論をまとめています。説明文の典型的な流れです。', 3);
INSERT INTO lessons (topic_id, content_md, estimated_minutes) VALUES (2, '# 物語文の読み方

## 出来事と心情の変化を追う
物語文では、主人公に何が起こり、その結果として気持ちがどう変わったかを読むことが中心です。行動、会話、表情、沈黙などに心情の手がかりがあります。

## 情景描写にも注目
天気や風景は、登場人物の気持ちを映すことがあります。雨や暗い空は不安、明るい光は安心や希望を表すことがあります。

## 場面の変化を見つける
時間、場所、登場人物が変わると場面が変わります。場面ごとに「だれが」「何をしたか」「どう感じたか」を整理しましょう。', 5);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (2, 'multi_choice', '次の文章の「それ」が指す内容として最も適切なものを選びなさい。「美咲は机の上に置いた手紙を見つめた。それを読む勇気が出ず、しばらく窓の外を見ていた。」', '["手紙","机","窓の外"]', '手紙', '「読む」ことができるものは手紙です。直前の名詞と後の動作を合わせて考えます。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (2, 'multi_choice', '次の文の（　）に入る接続語として最も適切なものを選びなさい。「太郎は何度も失敗した。（　）、最後まであきらめなかった。」', '["しかし","だから","そして"]', 'しかし', '失敗したのにあきらめなかった、という予想と反対の内容が続くため、逆接の「しかし」が合います。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (2, 'multi_choice', '次の漢字の読みとして正しいものを選びなさい。「緊張」', '["きんちょう","きんじょう","けいちょう"]', 'きんちょう', '「緊張」は心や体がかたくなることです。物語文では登場人物の心情を表す語としてよく使われます。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (2, 'multi_choice', '次の文章で、健の気持ちとして最も適切なものを選びなさい。「発表の順番が近づくにつれ、健は何度も原稿を読み返した。手のひらには汗がにじんでいた。」', '["楽しみで落ち着かない気持ち","不安で緊張している気持ち","怒って相手を責めたい気持ち"]', '不安で緊張している気持ち', '何度も原稿を読み返す、手に汗がにじむ、という行動や様子から緊張や不安が読み取れます。', 2);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (2, 'multi_choice', '「雨が窓を細かくたたき、教室はいつもより暗く感じられた。」という情景描写が表しやすい心情として最も適切なものを選びなさい。', '["明るくはしゃいだ気持ち","不安で重い気持ち","安心して眠い気持ち"]', '不安で重い気持ち', '雨や暗さは、不安・さびしさ・重苦しさを表す情景描写として使われることがあります。', 2);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (2, 'multi_choice', '次の文章で、場面が変わったと判断できる手がかりとして最も適切なものを選びなさい。「朝、家を出るとき、里奈は母に小さくうなずいた。昼休み、教室で弁当を開いたとき、里奈はその言葉を思い出した。」', '["時間と場所が変わっている","登場人物の名前が同じである","文が二つに分かれている"]', '時間と場所が変わっている', '「朝、家」から「昼休み、教室」へ変わっています。時間や場所の変化は場面転換の重要な手がかりです。', 2);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (2, 'multi_choice', '次の文章で、主人公の気持ちの変化として最も適切なものを選びなさい。「最初、結衣は新しい班に入るのが不安だった。しかし、班の友人が笑顔で役割を教えてくれたので、結衣は少し肩の力が抜けた。」', '["不安から安心へ変わった","安心から怒りへ変わった","期待から退屈へ変わった"]', '不安から安心へ変わった', '初めは「不安」と明示されています。友人の笑顔と説明によって「肩の力が抜けた」ので、安心した方向へ変化しています。', 2);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (2, 'multi_choice', '次の文章の主題として最も適切なものを選びなさい。「転校したばかりの直人は、失敗を恐れて誰にも話しかけられなかった。けれど、係の仕事で困っていた友人を手伝ったことをきっかけに、少しずつ会話が増えていった。直人は、自分から一歩踏み出すことの大切さを知った。」', '["一歩踏み出すことで人との関係は変わり始める","係の仕事は必ず一人でするべきだ","転校したら友人を作る必要はない"]', '一歩踏み出すことで人との関係は変わり始める', '最後の文に主題が表れています。主人公は手伝う行動を通して、人間関係を変えるきっかけを得ています。', 3);
INSERT INTO lessons (topic_id, content_md, estimated_minutes) VALUES (14, '# 漢字・語句

## 漢字は「読み」と「意味」を一緒に覚える
漢字問題では、読みだけでなく文の中での意味も問われます。「克服」は困難に打ち勝つこと、「慎重」は注意深いことのように、意味まで確認しましょう。

## 語句の関係を見る
類義語は似た意味の言葉、対義語は反対の意味の言葉です。接頭語や接尾語、熟語の組み立ても中1の定期テストでよく出ます。

## 文脈で選ぶ
同じ読みでも意味が違う語があります。前後の文を読んで、場面に合う語句を選ぶ練習をしましょう。', 5);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (14, 'multi_choice', '次の漢字の読みとして正しいものを選びなさい。「克服」', '["こくふく","こうふく","こくぶく"]', 'こくふく', '「克服」は困難や弱点に打ち勝つことです。「克」はコク、「服」はフクと読みます。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (14, 'multi_choice', '次の漢字の読みとして正しいものを選びなさい。「慎重」', '["しんちょう","じんちょう","しんじゅう"]', 'しんちょう', '「慎重」は注意深く軽はずみに行動しないことです。テスト頻出の心情・態度を表す語です。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (14, 'multi_choice', '「始める」の対義語として最も適切なものを選びなさい。', '["続ける","終える","進める"]', '終える', '「始める」は物事を開始することです。反対の意味は、物事を終わりにする「終える」です。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (14, 'multi_choice', '「静か」の類義語として最も適切なものを選びなさい。', '["穏やか","激しい","新しい"]', '穏やか', '「静か」と「穏やか」は、落ち着いている様子を表す近い意味の言葉です。「激しい」は反対に近い意味です。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (14, 'multi_choice', '次の文の（　）に入る語句として最も適切なものを選びなさい。「大事な試合なので、作戦を（　）に確認した。」', '["慎重","新鮮","単純"]', '慎重', '大事な試合では、注意深く確認する必要があります。文脈に合うのは「慎重」です。', 2);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (14, 'multi_choice', '「未完成」の「未」と同じ意味で使われているものを選びなさい。', '["未来","不足","無言"]', '未来', '「未」は「まだ〜でない」という意味です。「未完成」はまだ完成していない、「未来」はまだ来ていない時を表します。', 2);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (14, 'multi_choice', '次の熟語の組み立てとして「反対の意味の漢字を組み合わせたもの」を選びなさい。', '["上下","読書","登校"]', '上下', '「上」と「下」は反対の意味です。「読書」は読む対象、「登校」は学校へ行く意味で、反対語の組み合わせではありません。', 2);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (14, 'multi_choice', '次の文で「的確」の意味として最も適切なものを選びなさい。「先生は、私たちの発表に的確な助言をくださった。」', '["目的に合っていて、ずれがないこと","とても長くて細かいこと","相手を強くしかること"]', '目的に合っていて、ずれがないこと', '「的確」は、要点を外さず、目的にぴったり合っていることです。助言の内容が適切だったという意味になります。', 3);
INSERT INTO lessons (topic_id, content_md, estimated_minutes) VALUES (3, '# 正の数・負の数

## 数の向きと絶対値
0より大きい数を正の数、0より小さい数を負の数といいます。絶対値は数直線上で0からの距離です。負の数どうしでは、絶対値が大きいほど小さい数になります。

## 計算の基本
減法は「引く数の符号を変えて加える」と考えます。乗法・除法では、負の数が偶数個なら正、奇数個なら負です。

## 累乗と計算順序
累乗、かっこ、乗除、加減の順に計算します。(-3)^2 と -3^2 は意味が違うので、かっこの有無に注意しましょう。', 5);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (3, 'multi_choice', '次の数を小さい順に並べたとき、2番目にくる数を選びなさい。 -5, -2, +1', '["-5","-2","+1"]', '-2', '小さい順は -5, -2, +1 です。負の数では絶対値が大きいほど小さくなります。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (3, 'multi_choice', '|-9| と |+4| の大小関係として正しいものを選びなさい。', '["|-9| > |+4|","|-9| < |+4|","|-9| = |+4|"]', '|-9| > |+4|', '絶対値は0からの距離です。|-9|=9、|+4|=4 なので、|-9| の方が大きいです。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (3, 'multi_choice', '次の計算をしなさい。(-12) - (-5) + (-3)', '["-10","-20","+10"]', '-10', '引き算を加法に直すと、(-12)+(+5)+(-3) です。-12+5-3=-10 となります。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (3, 'multi_choice', '標高 +120m の地点から 180m 下がりました。到着した地点の標高を選びなさい。', '["-60m","+60m","-300m"]', '-60m', '+120 から 180 下がるので、120-180=-60 です。基準より下を負の数で表します。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (3, 'multi_choice', '次の計算をしなさい。(-6) × (+5) ÷ (-10)', '["+3","-3","+30"]', '+3', '負の数は -6 と -10 の2個なので答えの符号は正です。6×5÷10=3 なので +3 です。', 2);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (3, 'multi_choice', '次の計算をしなさい。(-4)^2 - 3 × (-2)', '["22","10","-22"]', '22', '先に累乗と乗法を計算します。(-4)^2=16、3×(-2)=-6。16-(-6)=22 です。', 2);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (3, 'multi_choice', '90 を素因数分解したものとして正しいものを選びなさい。', '["2 × 3^2 × 5","2^2 × 3 × 5","2 × 3 × 15"]', '2 × 3^2 × 5', '90=9×10=3^2×2×5 なので、素数だけの積で 2×3^2×5 と表せます。', 2);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (3, 'multi_choice', '次の計算をしなさい。(-2)^3 × 3 + (-18) ÷ (-3)^2', '["-26","-22","26"]', '-26', '(-2)^3=-8 なので (-8)×3=-24。(-3)^2=9 なので (-18)÷9=-2。よって -24+(-2)=-26 です。', 3);
INSERT INTO lessons (topic_id, content_md, estimated_minutes) VALUES (6, '# アルファベット・発音

## 大文字・小文字を正しく使う
英語では文の最初、人名、曜日、月名、そして I は大文字で書きます。小文字との形の違いも正確に覚えましょう。

## 母音と子音
英語の母音字は A, E, I, O, U の5つです。それ以外は子音字です。読み方と文字名を区別して覚えることが大切です。

## 語順と符号
名前を書くとき、文を書くとき、疑問文を書くときは、文字の順序やピリオド・クエスチョンマークにも注意します。', 5);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (6, 'multi_choice', '英語の母音字として正しい組み合わせを選びなさい。', '["A, E, I, O, U","A, B, C, D, E","A, I, U, E, O"]', 'A, E, I, O, U', '英語の母音字は A, E, I, O, U の5つです。日本語の「あいうえお」の順とは違います。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (6, 'multi_choice', '次のうち、大文字と小文字の組み合わせが正しいものを選びなさい。', '["B - b","D - b","P - q"]', 'B - b', '大文字 B の小文字は b です。形が似ている d, p, q と混同しないようにしましょう。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (6, 'multi_choice', 'アルファベット順で、G の直後にくる文字を選びなさい。', '["F","H","I"]', 'H', 'アルファベットは ... F, G, H, I ... の順です。G の直後は H です。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (6, 'multi_choice', '次の文で、大文字の使い方が正しいものを選びなさい。', '["I am Ken.","i am Ken.","I am ken."]', 'I am Ken.', '英語では I と人名の最初の文字は大文字にします。文の最初も大文字です。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (6, 'multi_choice', '次の名前を英語で書くとき、最も適切なものを選びなさい。「ゆい」', '["Yui","yui","YUIだけが正しい"]', 'Yui', '人名は最初の文字を大文字にし、残りを小文字で書くのが基本です。', 2);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (6, 'multi_choice', '次のうち、文として最も正しく書けているものを選びなさい。', '["This is my pen.","this is my pen","This is my pen?"]', 'This is my pen.', '肯定文は文頭を大文字にし、最後にピリオドをつけます。疑問文ではないので ? は使いません。', 2);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (6, 'multi_choice', '次のうち、子音字だけでできている組み合わせを選びなさい。', '["B, C, D","A, B, C","E, F, G"]', 'B, C, D', 'A, E は母音字です。B, C, D はすべて母音字以外なので子音字です。', 2);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (6, 'multi_choice', '辞書で次の3語をアルファベット順に並べるとき、最初にくるものを選びなさい。cat, cap, cake', '["cake","cap","cat"]', 'cake', '3語とも ca で始まるので3文字目を比べます。cake は k、cap は p、cat は t なので、k が最も早く cake が最初です。', 3);
INSERT INTO lessons (topic_id, content_md, estimated_minutes) VALUES (7, '# be動詞

## be動詞は主語に合わせる
I には am、you や複数には are、he/she/it/this などには is を使います。主語と be動詞の組み合わせをセットで覚えましょう。

## 否定文と疑問文
否定文は be動詞の後に not を置きます。疑問文は be動詞を文の先頭に出します。答えるときは、主語に合わせて Yes, I am. / No, it is not. のようにします。

## 語順を大切に
This is my book. と Is this my book? では語順と記号が違います。日本語訳だけでなく形にも注目しましょう。', 5);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (7, 'multi_choice', '次の文の（　）に入る語として最も適切なものを選びなさい。I （　） a student.', '["am","is","are"]', 'am', '主語が I のとき、be動詞は am を使います。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (7, 'multi_choice', '次の文の（　）に入る語として最も適切なものを選びなさい。This （　） my bag.', '["am","is","are"]', 'is', 'This は「これは」という意味で、be動詞は is を使います。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (7, 'multi_choice', '次の日本文に合う英文を選びなさい。「あなたは私の友だちです。」', '["You are my friend.","You is my friend.","Are you my friend."]', 'You are my friend.', '主語 You には are を使います。肯定文なので You are ... の語順です。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (7, 'multi_choice', '次の英文を否定文にしたものとして正しいものを選びなさい。I am from Osaka.', '["I am not from Osaka.","I not am from Osaka.","Am I not from Osaka."]', 'I am not from Osaka.', 'be動詞の否定文は、be動詞の後に not を置きます。I am not ... が正しい語順です。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (7, 'multi_choice', '次の日本文に合う英文を選びなさい。「これは新しいノートです。」', '["This is a new notebook.","This new is a notebook.","Is this a new notebook."]', 'This is a new notebook.', '肯定文は This is ... の語順です。「新しい」は notebook を説明するので new notebook とします。', 2);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (7, 'multi_choice', '次の疑問文への答えとして最も適切なものを選びなさい。Are you from Tokyo?', '["Yes, I am.","Yes, you are.","Yes, it is."]', 'Yes, I am.', 'Are you ...? と聞かれたら、自分のことなので I を使って Yes, I am. と答えます。', 2);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (7, 'multi_choice', '次の語を正しい順番に並べた英文を選びなさい。「これは私の机ではありません。」', '["This is not my desk.","This not is my desk.","Is this not my desk."]', 'This is not my desk.', '否定文は be動詞 is の後に not を置きます。疑問文ではないので Is this ...? にはしません。', 2);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (7, 'multi_choice', '次の会話の（　）に入る最も適切な英文を選びなさい。A: Is this your pencil? B: （　） It is my brother''s.', '["No, it is not.","Yes, it is.","No, I am not."]', 'No, it is not.', '後の文で「兄弟のものです」と言っているので、自分の鉛筆ではありません。Is this ...? には it を使って No, it is not. と答えます。', 3);
INSERT INTO lessons (topic_id, content_md, estimated_minutes) VALUES (10, '# 植物のからだ

## 観察器具の使い方
ルーペは目に近づけて持ち、観察するものを前後に動かしてピントを合わせます。顕微鏡では低倍率から始め、反射鏡やしぼりで明るさを調節します。

## 花のつくり
花には、めしべ・おしべ・花弁・がくがあります。おしべのやくでは花粉がつくられ、めしべの子房の中には胚珠があります。受粉後、胚珠は種子に、子房は果実になります。

## 植物の分類
被子植物は胚珠が子房に包まれ、裸子植物は胚珠がむき出しです。単子葉類と双子葉類は葉脈や根の形で見分けます。', 5);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (10, 'multi_choice', 'ルーペで小さな花を観察するときの正しい使い方を選びなさい。', '["ルーペを目に近づけ、花を前後に動かす","ルーペを花に押しつけて見る","ルーペを遠くに持ち、目を細める"]', 'ルーペを目に近づけ、花を前後に動かす', 'ルーペは目に近づけて固定し、観察するものを動かしてピントを合わせます。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (10, 'multi_choice', '花粉をつくる部分として正しいものを選びなさい。', '["やく","子房","胚珠"]', 'やく', 'おしべの先端にある「やく」で花粉がつくられます。子房や胚珠はめしべ側のつくりです。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (10, 'multi_choice', '受粉後に種子になる部分を選びなさい。', '["胚珠","子房","花弁"]', '胚珠', '受粉後、胚珠は種子になります。子房は果実になります。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (10, 'multi_choice', '次のうち、裸子植物を選びなさい。', '["マツ","アサガオ","サクラ"]', 'マツ', 'マツは胚珠が子房に包まれていない裸子植物です。アサガオやサクラは被子植物です。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (10, 'multi_choice', '被子植物の説明として正しいものを選びなさい。', '["胚珠が子房に包まれている植物","胚珠がむき出しの植物","花粉をつくらない植物"]', '胚珠が子房に包まれている植物', '被子植物の「被」はおおわれているという意味です。胚珠が子房に包まれています。', 2);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (10, 'multi_choice', '単子葉類の特徴として最も適切なものを選びなさい。', '["葉脈が平行に通り、ひげ根である","葉脈が網目状で、主根と側根がある","胚珠がむき出しである"]', '葉脈が平行に通り、ひげ根である', '単子葉類は平行脈、ひげ根が特徴です。網状脈と主根・側根は双子葉類の特徴です。', 2);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (10, 'multi_choice', '顕微鏡で観察を始めるとき、低倍率から始める理由として最も適切なものを選びなさい。', '["見える範囲が広く、観察したいものを見つけやすいから","高倍率より必ず大きく見えるから","接眼レンズを使わなくてよいから"]', '見える範囲が広く、観察したいものを見つけやすいから', '低倍率では視野が広いため、観察対象を探しやすいです。見つけてから倍率を上げます。', 2);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (10, 'multi_choice', '「花弁が目立たず、胚珠がむき出しで、種子がまつかさにつく」植物として最も適切なものを選びなさい。', '["マツ","タンポポ","アブラナ"]', 'マツ', '胚珠がむき出しで、まつかさに種子ができるのは裸子植物のマツです。タンポポやアブラナは被子植物です。', 3);
INSERT INTO lessons (topic_id, content_md, estimated_minutes) VALUES (12, '# 地球のすがた

## 六大陸と三大洋
地球の陸地は、ユーラシア・アフリカ・北アメリカ・南アメリカ・オーストラリア・南極の六大陸に分けられます。海洋は太平洋・大西洋・インド洋の三大洋が基本です。

## 緯度と経度
緯度は赤道を0度として南北の位置を表します。経度は本初子午線を0度として東西の位置を表します。赤道と本初子午線を混同しないようにしましょう。

## 時差の考え方
地球は24時間で360度回るので、経度15度で1時間の時差が生まれます。東にある地域ほど時刻が進んでいます。', 5);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (12, 'multi_choice', '六大陸のうち、最も面積が大きい大陸を選びなさい。', '["ユーラシア大陸","アフリカ大陸","南極大陸"]', 'ユーラシア大陸', 'ヨーロッパとアジアを含むユーラシア大陸が最大です。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (12, 'multi_choice', '三大洋のうち、最も面積が広い海洋を選びなさい。', '["太平洋","大西洋","インド洋"]', '太平洋', '太平洋は三大洋の中で最も広い海洋です。日本の東側にも広がっています。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (12, 'multi_choice', '緯度0度の線を何といいますか。', '["赤道","本初子午線","日付変更線"]', '赤道', '緯度0度は赤道です。本初子午線は経度0度の線です。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (12, 'multi_choice', '経度0度の線を何といいますか。', '["本初子午線","赤道","北回帰線"]', '本初子午線', '経度0度は本初子午線です。イギリスの旧グリニッジ天文台付近を通ります。', 1);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (12, 'multi_choice', '緯度の説明として正しいものを選びなさい。', '["赤道を基準に南北の位置を表す","本初子午線を基準に東西の位置を表す","海の深さを表す"]', '赤道を基準に南北の位置を表す', '緯度は赤道から北または南へどれだけ離れているかを角度で表します。', 2);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (12, 'multi_choice', '世界の6つの州のうち、日本が属する州を選びなさい。', '["アジア州","ヨーロッパ州","オセアニア州"]', 'アジア州', '日本はユーラシア大陸の東側に位置し、世界の地域区分ではアジア州に属します。', 2);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (12, 'multi_choice', '地図上で、経線の特徴として正しいものを選びなさい。', '["北極と南極を結ぶ線","赤道と平行に引かれる線","海岸線だけを表す線"]', '北極と南極を結ぶ線', '経線は北極と南極を結ぶ線です。赤道と平行な線は緯線です。', 2);
INSERT INTO questions (topic_id, type, question_text, choices, answer, explanation, difficulty) VALUES (12, 'multi_choice', '東京（東経135度）が午前9時のとき、ロンドン（経度0度）は何時ですか。時差は経度15度で1時間とします。', '["午前0時","午後6時","午前6時"]', '午前0時', '経度差は135度なので 135÷15=9時間です。東京はロンドンより東にあり9時間進んでいるため、ロンドンは午前9時の9時間前、午前0時です。', 3);
