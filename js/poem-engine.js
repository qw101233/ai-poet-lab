/**
 * AI Poet Lab · 诗歌生成引擎
 *
 * 核心思想：**定长槽位填充** —— 模板中每个槽位声明所需字数，
 * 意象库按字数分档（1/2/3/4 字）存放候选词，填充时严格匹配字数，
 * 从而保证唐诗绝句「每句 5 字或 7 字」、宋词「按词牌字数」等格律要求。
 *
 * 支持：唐诗（五言/七言绝句）、宋词（4 种词牌长短句）、现代诗（自由体）
 */

const PoemEngine = {
    // ===== 意象库（按字数分档） =====
    // 每个情感包含：n1(1字) n2(2字) n3(3字) n4(4字) 三类槽位
    // natural=自然景物 / human=人文意象 / emotion=情感动词
    imagery: {
        思乡: {
            natural: { n2: ['明月', '秋风', '暮云', '雁字', '霜月', '落日', '远山', '归舟', '晚钟', '寒露'], n3: ['山色远', '月如霜'], n4: ['霜天寥廓'] },
            human: { n2: ['故园', '客梦', '乡心', '离愁', '游子', '归路', '家书', '旧忆', '故人', '长亭'], n3: ['归心似箭'], n4: ['欲寄无书'] },
            emotion: { n2: ['望断', '思归', '独怜', '空忆', '堪怜', '遥想', '独倚', '怅望', '魂牵', '梦绕'], n3: ['梦绕千山'], n4: ['望断天涯'] }
        },
        离别: {
            natural: { n2: ['柳岸', '斜阳', '残月', '烟波', '孤帆', '落花', '飞絮', '暮雨', '寒江', '断桥'], n3: ['暮雨初收', '烟波江上'], n4: ['残照满江'] },
            human: { n2: ['长亭', '古道', '离歌', '别酒', '行舟', '远客', '征鞍', '别袖', '离恨', '聚散'], n3: ['执手相看'], n4: ['各在天涯'] },
            emotion: { n2: ['相送', '执手', '回首', '挥手', '相看', '依依', '惜别', '相望', '断肠', '伤怀'], n3: ['依依难舍'], n4: ['此恨难休'] }
        },
        壮志: {
            natural: { n2: ['苍穹', '怒涛', '长风', '巍峰', '烈日', '星河', '云霄', '雪岭', '雄关', '沧海'], n3: ['云霄万里', '沧海横流'], n4: ['雪岭千重'] },
            human: { n2: ['壮志', '长剑', '铁甲', '战旗', '英雄', '豪杰', '伟业', '功名', '凌云', '九霄'], n3: ['豪杰云集'], n4: ['志在四方'] },
            emotion: { n2: ['欲上', '敢攀', '誓破', '欲揽', '长啸', '纵马', '挥剑', '横戈', '破浪', '长驱'], n3: ['长啸苍穹'], n4: ['誓破长空'] }
        },
        爱情: {
            natural: { n2: ['春风', '桃花', '月华', '红豆', '鸳鸯', '莲叶', '柳絮', '银河', '七夕', '彩云'], n3: ['彩云深处', '月华如练'], n4: ['银河渡口'] },
            human: { n2: ['相思', '情深', '红线', '佳期', '良缘', '誓言', '幽梦', '情书', '芳心', '玉容'], n3: ['良缘初定'], n4: ['此情不移'] },
            emotion: { n2: ['相恋', '痴等', '凝望', '相守', '相伴', '牵念', '梦寻', '期盼', '倾心', '思念'], n3: ['相思入骨'], n4: ['愿偕百年'] }
        },
        田园: {
            natural: { n2: ['炊烟', '稻田', '荷塘', '青山', '溪水', '桑麻', '野花', '竹林', '麦浪', '菜畦'], n3: ['溪水潺潺', '麦浪千重'], n4: ['青山四合'] },
            human: { n2: ['茅舍', '柴门', '渔翁', '牧童', '农人', '牛背', '篱笆', '田埂', '茅檐', '溪桥'], n3: ['牧童归晚'], n4: ['茅舍炊烟'] },
            emotion: { n2: ['闲看', '静听', '悠然', '闲适', '安享', '归隐', '漫步', '垂钓', '耕读', '憩息'], n3: ['悠然自得'], n4: ['闲看白云'] }
        },
        咏物: {
            natural: { n2: ['青竹', '寒梅', '幽兰', '苍松', '碧莲', '秋菊', '顽石', '清泉', '古藤', '飞瀑'], n3: ['寒梅傲雪', '青竹凌云'], n4: ['幽兰空谷'] },
            human: { n2: ['高洁', '傲骨', '清韵', '孤芳', '雅姿', '冰心', '幽香', '劲节', '虚心', '素心'], n3: ['傲骨铮铮'], n4: ['冰心一片'] },
            emotion: { n2: ['傲立', '独放', '凌霜', '迎雪', '吐芳', '摇曳', '挺拔', '流泻', '盘旋', '静默'], n3: ['凌霜傲雪'], n4: ['独守清贞'] }
        },
        感怀: {
            natural: { n2: ['秋风', '落叶', '残阳', '暮鼓', '飞雪', '流水', '浮云', '黄昏', '旧梦', '光阴'], n3: ['浮云过眼', '落花成泥'], n4: ['光阴荏苒'] },
            human: { n2: ['往事', '今朝', '世事', '人生', '岁月', '浮生', '尘缘', '旧事', '春秋', '古今'], n3: ['世事如棋'], n4: ['浮生若梦'] },
            emotion: { n2: ['感叹', '追忆', '回首', '惆怅', '沉思', '怅然', '唏嘘', '感悟', '慨叹', '自省'], n3: ['往事随风'], n4: ['人生如寄'] }
        },
        豪放: {
            natural: { n2: ['大江', '长空', '怒潮', '疾风', '烈酒', '明月', '苍山', '星海', '雷电', '云涛'], n3: ['长空万里', '云涛千层'], n4: ['怒涛拍岸'] },
            human: { n2: ['豪情', '壮志', '英雄', '狂客', '剑客', '壮士', '豪饮', '长歌', '快意', '纵横'], n3: ['快意江湖'], n4: ['豪情万丈'] },
            emotion: { n2: ['醉里', '狂歌', '纵酒', '笑傲', '驰骋', '横扫', '长啸', '豪饮', '快哉', '大笑'], n3: ['长歌当哭'], n4: ['把酒问天'] }
        }
    },

    // ===== 单字意象（用于凑 1 字槽位） =====
    singleChars: {
        natural: ['月', '风', '云', '山', '水', '花', '雪', '霜', '星', '夜', '江', '天', '雨', '霜', '烟', '波'],
        human: ['舟', '人', '心', '梦', '愁', '情', '魂', '影', '思', '心', '泪', '歌', '书', '酒'],
        emotion: ['望', '归', '醉', '寻', '问', '叹', '惜', '恋', '悔', '思']
    },

    // ===== 韵脚库（按传统韵部分组，供后续押韵扩展） =====
    rhymeGroups: {
        'ang': ['长', '乡', '望', '霜', '光', '芳', '凉', '苍', '茫', '狂', '黄', '阳', '堂', '裳', '肠', '翔', '藏', '旁', '伤', '香', '江', '窗'],
        'ing': ['明', '清', '情', '星', '影', '景', '行', '声', '生', '城', '轻', '惊', '平', '鸣', '宁', '迎', '冰', '萤', '零', '醒'],
        'an': ['山', '关', '寒', '残', '远', '还', '间', '颜', '叹', '看', '闲', '难', '满', '短', '晚', '栏', '干', '盘'],
        'ou': ['秋', '愁', '楼', '舟', '流', '头', '游', '留', '休', '求', '悠', '幽', '眸', '侯', '收', '投', '柔'],
        'i': ['时', '思', '知', '迟', '悲', '飞', '归', '微', '衣', '稀', '依', '晖', '辉', '违', '围', '题', '啼', '溪', '泥'],
        'u': ['无', '孤', '途', '图', '湖', '炉', '珠', '枯', '初', '书', '居', '虚', '须', '如', '树', '暮', '度', '处', '去', '路'],
        'e': ['月', '雪', '绝', '别', '歇', '灭', '客', '色', '瑟', '夜', '野', '写', '也', '舍', '者', '惹', '落', '阁', '乐', '鹤'],
        'ao': ['高', '老', '好', '草', '道', '早', '宝', '岛', '浩', '涛', '潮', '桥', '遥', '消', '箫', '寥', '骄', '邀', '飘', '渺']
    },

    // ===== 唐诗模板 =====
    // 槽位语法：[类型:字数]  例如 [n:2] 表示取 2 字自然意象
    // 每句由固定数量的槽位组成，保证总字数恒定
    tangTemplates: {
        // 五言绝句：每句 5 字 = 2+2+1 或 2+1+2 等组合
        five: [
            ['[n:2][n:2][e:1]', '[e:2][n:2][n:1]', '[h:2][e:2][h:1]', '[n:2][e:2][h:1]'],
            ['[e:2][n:2][h:1]', '[n:2][h:2][e:1]', '[h:2][n:2][n:1]', '[e:2][e:2][h:1]'],
            ['[n:2][e:2][h:1]', '[h:2][n:2][e:1]', '[e:2][n:2][n:1]', '[n:2][h:2][h:1]'],
            ['[n:2][h:2][e:1]', '[e:2][n:2][n:1]', '[n:2][n:2][e:1]', '[h:2][e:2][e:1]']
        ],
        // 七言绝句：每句 7 字
        seven: [
            ['[n:2][e:2][n:2][h:1]', '[h:2][e:2][n:2][e:1]', '[e:2][n:2][h:2][n:1]', '[n:2][e:2][h:2][h:1]'],
            ['[e:2][n:2][h:2][e:1]', '[n:2][e:2][n:2][h:1]', '[h:2][e:2][n:2][n:1]', '[e:2][n:2][h:2][e:1]'],
            ['[n:2][n:2][e:2][h:1]', '[e:2][h:2][n:2][e:1]', '[n:2][e:2][h:2][n:1]', '[e:2][n:2][e:2][h:1]']
        ]
    },

    // ===== 宋词词牌模板 =====
    // 每首词的每句字数严格遵循词牌规格
    songciPatterns: {
        '如梦令': {
            lines: [6, 6, 5, 6, 2, 2, 6],
            // 33 字：6,6,5,6,2,2,6
            templates: [
                ['[e:2][n:2][h:2]', '[e:2][n:2][h:2]', '[n:2][e:2][h:1]', '[e:2][n:2][h:2]', '[h:2]', '[e:2]', '[n:2][e:2][h:2]']
            ]
        },
        '长相思': {
            lines: [3, 3, 5, 5, 3, 3, 5, 5],
            // 36 字：3,3,5,5,3,3,5,5
            templates: [
                ['[n:1][e:2]', '[n:1][h:2]', '[e:2][h:2][e:1]', '[n:2][e:2][n:1]', '[h:1][e:2]', '[h:1][n:2]', '[e:2][n:2][e:1]', '[n:2][h:2][n:1]']
            ]
        },
        '相见欢': {
            lines: [3, 3, 9, 3, 3, 9],
            // 36 字：3,3,9,3,3,9
            templates: [
                ['[e:2][n:1]', '[e:2][h:1]', '[e:2][h:2][e:2][n:2][h:1]', '[e:2][n:1]', '[e:2][h:1]', '[e:2][n:2][e:2][h:2][n:1]']
            ]
        },
        '忆江南': {
            lines: [3, 5, 7, 7, 5],
            // 27 字：3,5,7,7,5
            templates: [
                ['[n:1][e:2]', '[n:2][e:2][n:1]', '[n:2][e:2][n:2][h:1]', '[e:2][n:2][h:2][e:1]', '[e:2][n:2][h:1]']
            ]
        }
    },

    // ===== 现代诗句式模板（自由体，不限字数） =====
    modernTemplates: [
        '{topic}是{natural}的{human}\n在{emotion}的时候\n{natural}{emotion}\n而我{emotion}着{human}',
        '如果{topic}是一首诗\n那{natural}便是它的韵脚\n{human}在{emotion}中醒来\n{natural}在{emotion}中睡去\n我们都是{emotion}的旅人',
        '{topic}\n是{natural}写给{human}的情书\n{emotion}是落款\n{natural}是信封\n打开它\n里面装满了{emotion}与{emotion}',
        '{topic}说\n{natural}是{emotion}的\n{human}是{emotion}的\n而{emotion}\n是唯一的答案',
        '在{topic}的{natural}里\n我看见了{human}\n它{emotion}着\n像{natural}一样{emotion}\n像{human}一样{emotion}\n这是{emotion}的时刻',
        '{natural}从{topic}中升起\n带着{human}的气息\n{emotion}，{emotion}\n世界在{natural}中\n变得{emotion}而{emotion}',
        '{topic}\n不是{natural}的终点\n而是{human}的开始\n{emotion}着{natural}\n{emotion}着{human}\n在{emotion}与{emotion}之间\n我们{emotion}',
        '{topic}落在{natural}上\n{human}在灯下等\n{emotion}是夜里最长的部分\n也是最亮的部分'
    ],

    // ===== 辅助方法 =====

    pick(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    },

    /** 按槽位类型与字数取词，保证长度严格匹配 */
    pickSlot(emotion, type, len, used, localUsed) {
        const bank = this.imagery[emotion] || this.imagery['感怀'];

        // 主库：按类型 + 字数
        const typed = bank[type] || bank.natural;
        let pool = typed['n' + len];

        // 回退：字数不匹配时逐级降级
        if (!pool || pool.length === 0) {
            for (let l = len; l >= 1; l--) {
                if (typed['n' + l] && typed['n' + l].length) { pool = typed['n' + l]; break; }
            }
        }
        // 再回退：单字库
        if (!pool || pool.length === 0) {
            const single = this.singleChars[type] || this.singleChars.natural;
            if (len === 1) {
                pool = single;
            } else {
                // 拼接单字凑长度
                const chars = [];
                for (let i = 0; i < len; i++) {
                    let c = this.pick(single);
                    let guard = 0;
                    while ((localUsed && localUsed.has(c)) && guard++ < 6) c = this.pick(single);
                    chars.push(c);
                }
                const s = chars.join('');
                if (localUsed) localUsed.add(s);
                return s;
            }
        }

        // 避免重复：先避让本句已用词，再避让全篇已用词
        let word = '';
        for (let attempt = 0; attempt < 16; attempt++) {
            word = this.pick(pool);
            const dupLocal = localUsed && localUsed.has(word);
            const dupGlobal = used.has(word);
            if (!dupLocal && !dupGlobal) break;
            // 本句内重复是更严重的问题，优先换词
            if (attempt >= 8 && !dupLocal && dupGlobal) break;
        }
        used.add(word);
        if (localUsed) localUsed.add(word);
        return word;
    },

    /** 填充单个槽位串，如 '[n:2][e:2][h:1]' */
    fillSlots(slotStr, emotion, used, localUsed) {
        return slotStr.replace(/\[([neh]):(\d)\]/g, (m, type, len) => {
            return this.pickSlot(emotion, type, parseInt(len, 10), used, localUsed);
        });
    },

    getRhyme() {
        const groups = Object.keys(this.rhymeGroups);
        const group = this.pick(groups);
        return this.rhymeGroups[group];
    },

    // ===== 唐诗生成 =====
    generateTangShi(emotion, topic) {
        const used = new Set();
        if (topic) used.add(topic);

        const type = Math.random() > 0.5 ? 'five' : 'seven';
        const lineSets = this.tangTemplates[type];
        const lineSet = this.pick(lineSets);

        const lines = lineSet.map(slots => {
            const localUsed = new Set();
            return this.fillSlots(slots, emotion, used, localUsed);
        });

        // 标题
        const titleBase = topic || this.pickSlot(emotion, 'natural', 2, new Set(used));
        const title = titleBase + '·' + this.pick(['咏', '题', '怀', '吟', '望', '忆', '感', '赠']);

        return {
            title: title,
            style: type === 'five' ? '五言绝句' : '七言绝句',
            styleTag: '唐诗',
            lines: lines,
            emotion: emotion,
            fullText: lines.join('\n')
        };
    },

    // ===== 宋词生成 =====
    generateSongCi(emotion, topic) {
        const used = new Set();
        if (topic) used.add(topic);

        const patternNames = Object.keys(this.songciPatterns);
        const patternName = this.pick(patternNames);
        const pattern = this.songciPatterns[patternName];
        const lineSet = this.pick(pattern.templates);

        const lines = lineSet.map(slots => {
            const localUsed = new Set();
            return this.fillSlots(slots, emotion, used, localUsed);
        });

        const title = (topic || this.pickSlot(emotion, 'natural', 2, new Set(used))) + '·' + patternName;

        return {
            title: title,
            style: patternName,
            styleTag: '宋词',
            lines: lines,
            emotion: emotion,
            fullText: lines.join('\n')
        };
    },

    // ===== 现代诗生成 =====
    generateModern(emotion, topic) {
        const used = new Set();
        const topicWord = topic || this.pickSlot(emotion, 'natural', 2, new Set());

        let template = this.pick(this.modernTemplates);

        let text = template.replace(/\{topic\}/g, topicWord);
        text = text.replace(/\{(natural|human|emotion)\}/g, (m, type) => {
            return this.pickSlot(emotion, type, 2, used);
        });

        const lines = text.split('\n').filter(s => s.trim());
        const title = '致' + topicWord;

        return {
            title: title,
            style: '自由体',
            styleTag: '现代诗',
            lines: lines,
            emotion: emotion,
            fullText: lines.join('\n')
        };
    },

    // ===== 主生成入口 =====
    generate(topic, emotion, style) {
        topic = (topic || '').trim();
        if (!this.imagery[emotion]) emotion = '感怀';

        let poem;
        switch (style) {
            case 'songci':
                poem = this.generateSongCi(emotion, topic);
                break;
            case 'modern':
                poem = this.generateModern(emotion, topic);
                break;
            case 'tangshi':
            default:
                poem = this.generateTangShi(emotion, topic);
        }

        poem.id = 'poem_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
        poem.timestamp = new Date().toISOString();
        poem.topic = topic;
        poem.styleType = style || 'tangshi';

        return poem;
    },

    getEmotions() {
        return Object.keys(this.imagery);
    },

    getCiPatterns() {
        return Object.keys(this.songciPatterns);
    },

    /** 校验一首诗的格律是否符合规格（供测试与自检使用） */
    validate(poem) {
        const lens = poem.lines.map(l => l.length);
        if (poem.styleType === 'tangshi') {
            const want = poem.style === '五言绝句' ? 5 : 7;
            const ok = lens.length === 4 && lens.every(n => n === want);
            return { ok, expected: `4句×${want}字`, actual: lens.join(',') };
        }
        if (poem.styleType === 'songci') {
            const spec = this.songciPatterns[poem.style];
            const ok = lens.length === spec.lines.length && lens.every((n, i) => n === spec.lines[i]);
            return { ok, expected: spec.lines.join(','), actual: lens.join(',') };
        }
        return { ok: true, expected: '自由体', actual: lens.join(',') };
    }
};
