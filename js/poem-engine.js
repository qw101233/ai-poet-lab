/**
 * AI Poet Lab · 诗歌生成引擎
 * 基于意象组合与韵律约束的诗歌生成算法
 * 支持：唐诗（五言/七言绝句）、宋词（词牌长短句）、现代诗（自由体）
 */

const PoemEngine = {
    // ===== 意象库 =====
    // 按情感分类的意象词库
    imagery: {
        思乡: {
            natural: ['明月', '秋风', '暮云', '寒露', '雁字', '霜月', '落日', '远山', '归舟', '晚钟'],
            human: ['故园', '客梦', '乡心', '离愁', '游子', '归路', '家书', '旧忆', '故人', '长亭'],
            emotion: ['望断', '思归', '独怜', '空忆', '堪怜', '遥想', '独倚', '怅望', '魂牵', '梦绕']
        },
        离别: {
            natural: ['柳岸', '斜阳', '残月', '烟波', '孤帆', '落花', '飞絮', '暮雨', '寒江', '断桥'],
            human: ['长亭', '古道', '离歌', '别酒', '行舟', '远客', '征鞍', '别袖', '离恨', '聚散'],
            emotion: ['相送', '执手', '回首', '挥手', '相看', '依依', '惜别', '相望', '断肠', '伤怀']
        },
        壮志: {
            natural: ['苍穹', '怒涛', '长风', '巍峰', '烈日', '星河', '云霄', '雪岭', '雄关', '沧海'],
            human: ['壮志', '长剑', '铁甲', '战旗', '英雄', '豪杰', '伟业', '功名', '凌云', '九霄'],
            emotion: ['欲上', '敢攀', '誓破', '欲揽', '长啸', '纵马', '挥剑', '横戈', '凌云', '破浪']
        },
        爱情: {
            natural: ['春风', '桃花', '月华', '红豆', '鸳鸯', '莲叶', '柳絮', '银河', '七夕', '彩云'],
            human: ['相思', '情深', '红线', '佳期', '良缘', '誓言', '幽梦', '情书', '芳心', '玉容'],
            emotion: ['相恋', '痴等', '凝望', '相守', '相伴', '牵念', '梦寻', '期盼', '倾心', '思念']
        },
        田园: {
            natural: ['炊烟', '稻田', '荷塘', '青山', '溪水', '桑麻', '野花', '竹林', '麦浪', '菜畦'],
            human: ['茅舍', '柴门', '渔翁', '牧童', '农人', '牛背', '篱笆', '田埂', '茅檐', '溪桥'],
            emotion: ['闲看', '静听', '悠然', '闲适', '安享', '归隐', '漫步', '垂钓', '耕读', '憩息']
        },
        咏物: {
            natural: ['青竹', '寒梅', '幽兰', '苍松', '碧莲', '秋菊', '顽石', '清泉', '古藤', '飞瀑'],
            human: ['高洁', '傲骨', '清韵', '孤芳', '雅姿', '冰心', '幽香', '劲节', '虚心', '素心'],
            emotion: ['傲立', '独放', '凌霜', '迎雪', '吐芳', '摇曳', '挺拔', '流泻', '盘旋', '静默']
        },
        感怀: {
            natural: ['秋风', '落叶', '残阳', '暮鼓', '飞雪', '流水', '浮云', '黄昏', '旧梦', '光阴'],
            human: ['往事', '今朝', '世事', '人生', '岁月', '浮生', '尘缘', '旧事', '春秋', '古今'],
            emotion: ['感叹', '追忆', '回首', '惆怅', '沉思', '怅然', '唏嘘', '感悟', '伤怀', '慨叹']
        },
        豪放: {
            natural: ['大江', '长空', '怒潮', '疾风', '烈酒', '明月', '苍山', '星海', '雷电', '云涛'],
            human: ['豪情', '壮志', '英雄', '狂客', '剑客', '壮士', '豪饮', '长歌', '快意', '纵横'],
            emotion: ['醉里', '狂歌', '纵酒', '笑傲', '驰骋', '纵横', '横扫', '长啸', '豪饮', '快哉']
        }
    },

    // ===== 韵脚库（按韵部） =====
    rhymeGroups: {
        'ang': ['长', '乡', '望', '霜', '光', '芳', '凉', '苍', '茫', '狂', '黄', '阳', '堂', '裳', '肠', '翔', '藏', '旁', '伤', '香', '江', '窗', '霜'],
        'ing': ['明', '清', '情', '星', '影', '景', '行', '声', '生', '城', '轻', '惊', '平', '鸣', '宁', '迎', '冰', '萤', '零', '醒'],
        'an': ['山', '关', '寒', '残', '远', '还', '间', '颜', '叹', '看', '闲', '难', '满', '短', '晚', '寒', '栏', '干', '盘', '叹'],
        'ou': ['秋', '愁', '楼', '舟', '流', '头', '游', '留', '休', '求', '悠', '幽', '愁', '眸', '侯', '收', '投', '柔'],
        'i': ['时', '思', '知', '迟', '悲', '飞', '归', '微', '衣', '稀', '依', '晖', '辉', '违', '围', '稀', '题', '啼', '溪', '泥'],
        'u': ['无', '孤', '途', '图', '湖', '炉', '珠', '枯', '初', '书', '居', '虚', '须', '如', '树', '暮', '度', '处', '去', '路'],
        'e': ['月', '雪', '绝', '别', '歇', '灭', '客', '色', '瑟', '夜', '野', '写', '也', '舍', '者', '惹', '落', '阁', '乐', '鹤'],
        'ao': ['高', '老', '好', '草', '道', '早', '宝', '岛', '浩', '涛', '潮', '桥', '遥', '消', '箫', '寥', '骄', '邀', '飘', '渺']
    },

    // ===== 唐诗句式模板 =====
    tangTemplates: {
        five: [
            // 五言绝句模板：主语 + 谓语 + 宾语/补语
            '{natural}生{human}，{emotion}{natural}。{human}{emotion}，{natural}{emotion}。',
            '{emotion}{natural}处，{human}{emotion}时。{natural}{emotion}，{human}{emotion}。',
            '{natural}{emotion}，{human}{emotion}。{emotion}{natural}，{emotion}{human}。',
            '{natural}连{natural}，{human}入{natural}。{emotion}看{natural}，{emotion}忆{human}。',
            '{human}对{natural}，{emotion}问{natural}。{natural}{emotion}，{human}{emotion}。'
        ],
        seven: [
            // 七言绝句模板
            '{natural}{emotion}{natural}，{human}{emotion}{natural}。{emotion}{human}{natural}，{emotion}{natural}{human}。',
            '{emotion}{natural}{human}{emotion}，{natural}{emotion}{human}{emotion}。{human}{emotion}{natural}{emotion}，{natural}{emotion}{human}{emotion}。',
            '{natural}{emotion}{natural}{human}，{human}{emotion}{natural}{human}。{emotion}{natural}{emotion}{human}，{emotion}{human}{emotion}{natural}。',
            '{emotion}{natural}{emotion}{natural}，{human}{emotion}{human}{emotion}。{natural}{natural}{emotion}{emotion}，{human}{human}{emotion}{emotion}。'
        ]
    },

    // ===== 宋词词牌模板 =====
    songciPatterns: {
        // 词牌名：每首词的字数和句式
        '如梦令': {
            lines: [6, 6, 5, 6, 2, 2, 6],
            template: '{emotion}{natural}{human}，{emotion}{natural}{human}。{natural}{emotion}{natural}，{emotion}{natural}{human}。{human}，{human}，{emotion}{natural}{human}。'
        },
        '长相思': {
            lines: [3, 3, 5, 5, 3, 3, 5, 5],
            template: '{natural}，{natural}，{emotion}{human}{natural}，{emotion}{natural}{human}。{human}，{human}，{emotion}{natural}{emotion}，{emotion}{human}{emotion}。'
        },
        '相见欢': {
            lines: [3, 3, 9, 3, 3, 9],
            template: '{natural}{emotion}，{natural}{emotion}，{emotion}{human}{emotion}{natural}。{human}{emotion}，{human}{emotion}，{emotion}{natural}{emotion}{human}。'
        },
        '忆江南': {
            lines: [3, 5, 7, 7, 5],
            template: '{human}{natural}，{emotion}{natural}{emotion}。{natural}{emotion}{natural}{human}，{emotion}{human}{emotion}{natural}。{emotion}{natural}{emotion}。'
        }
    },

    // ===== 现代诗句式模板 =====
    modernTemplates: [
        '{topic}是{natural}的{human}\n在{emotion}的时候\n{natural}{emotion}\n而我{emotion}着{human}',
        '如果{topic}是一首诗\n那{natural}便是它的韵脚\n{human}在{emotion}中醒来\n{natural}在{emotion}中睡去\n我们都是{emotion}的旅人',
        '{topic}\n是{natural}写给{human}的情书\n{emotion}是落款\n{natural}是信封\n打开它\n里面装满了{emotion}与{emotion}',
        '{topic}说\n{natural}是{emotion}的\n{human}是{emotion}的\n而{emotion}\n是唯一的答案',
        '在{topic}的{natural}里\n我看见了{human}\n它{emotion}着\n像{natural}一样{emotion}\n像{human}一样{emotion}\n这是{emotion}的时刻',
        '{natural}从{topic}中升起\n带着{human}的气息\n{emotion}，{emotion}\n世界在{natural}中\n变得{emotion}而{emotion}',
        '{topic}\n不是{natural}的终点\n而是{human}的开始\n{emotion}着{natural}\n{emotion}着{human}\n在{emotion}与{emotion}之间\n我们{emotion}'
    ],

    // ===== 辅助方法 =====

    // 从数组中随机选取
    pick(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    },

    // 从意象库中选取，避免重复
    pickImagery(emotion, type, used) {
        const pool = this.imagery[emotion]?.[type] || this.imagery['感怀'][type];
        let attempts = 0;
        let word;
        do {
            word = this.pick(pool);
            attempts++;
        } while (used.has(word) && attempts < 10);
        used.add(word);
        return word;
    },

    // 获取韵脚
    getRhyme() {
        const groups = Object.keys(this.rhymeGroups);
        const group = this.pick(groups);
        return this.rhymeGroups[group];
    },

    // ===== 唐诗生成 =====
    generateTangShi(emotion, topic) {
        const used = new Set();
        if (topic) used.add(topic);

        // 随机选择五言或七言
        const type = Math.random() > 0.5 ? 'five' : 'seven';
        const templates = this.tangTemplates[type];
        let template = this.pick(templates);
        
        // 获取韵脚
        const rhymes = this.getRhyme();
        
        // 填充模板
        const poem = template.replace(/\{(natural|human|emotion)\}/g, (match, type) => {
            return this.pickImagery(emotion, type, used);
        });

        // 拆分成行
        const lines = poem.split(/[，。]/).filter(s => s.trim());
        
        // 标题生成
        const titleWords = [
            this.pickImagery(emotion, 'natural', new Set(used)),
            this.pickImagery(emotion, 'emotion', new Set(used))
        ];
        const title = (topic || titleWords.join('')) + '·' + this.pick(['咏', '题', '怀', '吟', '望', '忆', '感', '赠']);

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

        // 填充模板
        let text = pattern.template.replace(/\{(natural|human|emotion)\}/g, (match, type) => {
            return this.pickImagery(emotion, type, used);
        });

        // 按标点拆分成行
        let lines = text.split(/[，。！？]/).filter(s => s.trim());

        // 标题
        const title = (topic || this.pickImagery(emotion, 'natural', new Set(used))) + '·' + patternName;

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
        const topicWord = topic || this.pickImagery(emotion, 'natural', new Set());

        let template = this.pick(this.modernTemplates);
        
        // 填充模板
        let text = template.replace(/\{topic\}/g, topicWord);
        text = text.replace(/\{(natural|human|emotion)\}/g, (match, type) => {
            return this.pickImagery(emotion, type, used);
        });

        const lines = text.split('\n').filter(s => s.trim());
        
        // 标题
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
        topic = topic?.trim() || '';
        
        let poem;
        switch (style) {
            case 'tangshi':
                poem = this.generateTangShi(emotion, topic);
                break;
            case 'songci':
                poem = this.generateSongCi(emotion, topic);
                break;
            case 'modern':
                poem = this.generateModern(emotion, topic);
                break;
            default:
                poem = this.generateTangShi(emotion, topic);
        }

        poem.id = 'poem_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
        poem.timestamp = new Date().toISOString();
        poem.topic = topic;
        poem.styleType = style;

        return poem;
    },

    // 获取所有支持的情感
    getEmotions() {
        return Object.keys(this.imagery);
    },

    // 获取所有词牌
    getCiPatterns() {
        return Object.keys(this.songciPatterns);
    }
};
