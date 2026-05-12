DELETE FROM attempts
WHERE question_id IN (SELECT id FROM questions WHERE topic_id IN (1, 2, 3, 6, 7, 10, 12, 14));
DELETE FROM mock_exam_items
WHERE question_id IN (SELECT id FROM questions WHERE topic_id IN (1, 2, 3, 6, 7, 10, 12, 14));
DELETE FROM questions WHERE topic_id IN (1, 2, 3, 6, 7, 10, 12, 14);
DELETE FROM lessons WHERE topic_id IN (1, 2, 3, 6, 7, 10, 12, 14);
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
