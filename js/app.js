/**
 * AI Poet Lab · 主应用逻辑
 * 处理 UI 交互、诗歌朗读、收藏管理、背景动画
 */

const App = {
    // 当前状态
    currentEmotion: '思乡',
    currentStyle: 'tangshi',
    currentPoem: null,
    
    // 收藏存储键
    STORAGE_KEY: 'ai_poet_lab_collection',

    // ===== 初始化 =====
    init() {
        this.bindEvents();
        this.initBackground();
        this.initSpeech();
        this.renderCollection();
    },

    // ===== 绑定事件 =====
    bindEvents() {
        // 导航切换
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', () => this.switchView(btn.dataset.view));
        });

        // 情感选择
        document.querySelectorAll('.emotion-chips .chip').forEach(chip => {
            chip.addEventListener('click', () => {
                document.querySelectorAll('.emotion-chips .chip').forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                this.currentEmotion = chip.dataset.emotion;
            });
        });

        // 风格选择
        document.querySelectorAll('.style-card').forEach(card => {
            card.addEventListener('click', () => {
                document.querySelectorAll('.style-card').forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                this.currentStyle = card.dataset.style;
            });
        });

        // 生成按钮
        document.getElementById('btnGenerate').addEventListener('click', () => this.generatePoem());

        // 诗歌操作按钮
        document.getElementById('btnRead').addEventListener('click', () => this.readPoem());
        document.getElementById('btnImage').addEventListener('click', () => this.generateImage());
        document.getElementById('btnRegenerate').addEventListener('click', () => this.generatePoem());
        document.getElementById('btnSave').addEventListener('click', () => this.savePoem());
        document.getElementById('btnCopy').addEventListener('click', () => this.copyPoem());
        document.getElementById('btnDownloadImg').addEventListener('click', () => this.downloadImage());
        document.getElementById('btnStopRead').addEventListener('click', () => this.stopReading());

        // 回车生成
        document.getElementById('topicInput').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') this.generatePoem();
        });
    },

    // ===== 视图切换 =====
    switchView(viewName) {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === viewName);
        });
        document.querySelectorAll('.view').forEach(view => {
            view.classList.toggle('active', view.id === 'view-' + viewName);
        });
        
        if (viewName === 'collection') {
            this.renderCollection();
        }
    },

    // ===== 生成诗歌 =====
    generatePoem() {
        const topic = document.getElementById('topicInput').value.trim();
        const btnGenerate = document.getElementById('btnGenerate');
        
        // 添加加载动画
        btnGenerate.classList.add('loading');
        btnGenerate.querySelector('span:last-child').textContent = '创作中...';

        // 模拟AI思考延迟（增强体验）
        setTimeout(() => {
            const poem = PoemEngine.generate(topic, this.currentEmotion, this.currentStyle);
            this.currentPoem = poem;
            this.displayPoem(poem);

            btnGenerate.classList.remove('loading');
            btnGenerate.querySelector('span:last-child').textContent = '开始创作';
        }, 600 + Math.random() * 400);
    },

    // ===== 显示诗歌 =====
    displayPoem(poem) {
        const display = document.getElementById('poemDisplay');
        const meta = document.getElementById('poemMeta');
        const actions = document.getElementById('poemActions');
        
        // 元信息
        meta.textContent = `${poem.styleTag} · ${poem.style} · 情感：${poem.emotion}`;

        // 构建诗歌HTML
        let html = '<div class="poem-content">';
        html += `<div class="poem-title">${this.escapeHtml(poem.title)}</div>`;
        html += '<div class="poem-body">';
        
        poem.lines.forEach((line, i) => {
            html += `<span class="poem-line" style="animation-delay: ${i * 0.15}s">${this.escapeHtml(line)}</span>`;
        });
        
        html += '</div>';
        html += `<span class="poem-style-tag">${poem.styleTag} · ${poem.style}</span>`;
        html += '<div class="poem-seal">诗</div>';
        html += '</div>';

        display.innerHTML = html;
        actions.style.display = 'flex';

        // 隐藏之前的配图
        document.getElementById('imageContainer').style.display = 'none';
    },

    // ===== 诗歌朗读 =====
    initSpeech() {
        this.synthesis = window.speechSynthesis;
        this.currentUtterance = null;
    },

    readPoem() {
        if (!this.currentPoem) {
            this.showToast('请先生成诗歌');
            return;
        }

        // 如果正在朗读，先停止
        if (this.synthesis.speaking) {
            this.synthesis.cancel();
        }

        const text = this.currentPoem.lines.join('，');
        const utterance = new SpeechSynthesisUtterance(text);
        
        // 尝试设置中文语音
        const voices = this.synthesis.getVoices();
        const chineseVoice = voices.find(v => v.lang.startsWith('zh'));
        if (chineseVoice) {
            utterance.voice = chineseVoice;
        }
        
        utterance.lang = 'zh-CN';
        utterance.rate = 0.7;
        utterance.pitch = 0.8;

        // 显示进度条
        const progressContainer = document.getElementById('readingProgress');
        const progressFill = document.getElementById('progressFill');
        progressContainer.style.display = 'flex';
        progressFill.style.width = '0%';

        let lineIndex = 0;
        const totalLines = this.currentPoem.lines.length;

        utterance.onboundary = (event) => {
            if (event.name === 'word' || event.name === 'sentence') {
                const progress = Math.min(((lineIndex + 1) / totalLines) * 100, 100);
                progressFill.style.width = progress + '%';
                lineIndex++;
            }
        };

        utterance.onend = () => {
            progressFill.style.width = '100%';
            setTimeout(() => {
                progressContainer.style.display = 'none';
                progressFill.style.width = '0%';
            }, 500);
        };

        utterance.onerror = () => {
            progressContainer.style.display = 'none';
            this.showToast('朗读功能出错了，请重试');
        };

        this.currentUtterance = utterance;
        this.synthesis.speak(utterance);
    },

    stopReading() {
        if (this.synthesis.speaking) {
            this.synthesis.cancel();
        }
        document.getElementById('readingProgress').style.display = 'none';
    },

    // ===== 生成配图 =====
    generateImage() {
        if (!this.currentPoem) {
            this.showToast('请先生成诗歌');
            return;
        }

        const container = document.getElementById('imageContainer');
        container.style.display = 'block';

        ImageGenerator.init('poemImage');
        ImageGenerator.generate(this.currentPoem);
        
        this.showToast('意境配图已生成');
    },

    downloadImage() {
        if (!this.currentPoem) return;
        ImageGenerator.download(this.currentPoem);
        this.showToast('配图已下载');
    },

    // ===== 收藏管理 =====
    getCollection() {
        try {
            return JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
        } catch {
            return [];
        }
    },

    savePoem() {
        if (!this.currentPoem) {
            this.showToast('请先生成诗歌');
            return;
        }

        const collection = this.getCollection();
        
        // 检查是否已存在
        if (collection.some(p => p.id === this.currentPoem.id)) {
            this.showToast('该作品已收藏');
            return;
        }

        collection.unshift(this.currentPoem);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(collection));
        
        this.showToast('已加入收藏 ⭐');
        this.renderCollection();
    },

    deletePoem(id) {
        let collection = this.getCollection();
        collection = collection.filter(p => p.id !== id);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(collection));
        this.renderCollection();
        this.showToast('已删除');
    },

    renderCollection() {
        const collection = this.getCollection();
        const listEl = document.getElementById('collectionList');
        const statsEl = document.getElementById('collectionStats');

        // 统计
        const tangCount = collection.filter(p => p.styleType === 'tangshi').length;
        const songCount = collection.filter(p => p.styleType === 'songci').length;
        const modernCount = collection.filter(p => p.styleType === 'modern').length;

        statsEl.innerHTML = `
            <div class="stat-item">
                <div class="stat-value">${collection.length}</div>
                <div class="stat-label">总收藏</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${tangCount}</div>
                <div class="stat-label">唐诗</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${songCount}</div>
                <div class="stat-label">宋词</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${modernCount}</div>
                <div class="stat-label">现代诗</div>
            </div>
        `;

        if (collection.length === 0) {
            listEl.innerHTML = `
                <div class="empty-collection">
                    <div class="empty-icon">📦</div>
                    <p>暂无收藏作品</p>
                    <p class="empty-hint">创作诗歌后点击收藏即可保存</p>
                </div>
            `;
            return;
        }

        listEl.innerHTML = collection.map(poem => `
            <div class="collected-poem">
                <div class="poem-title-mini">${this.escapeHtml(poem.title)}</div>
                <div class="poem-text-mini">${this.escapeHtml(poem.lines.join('\n'))}</div>
                <div class="poem-info-mini">
                    <span>${poem.styleTag} · ${poem.emotion}</span>
                    <button class="btn-delete" onclick="App.deletePoem('${poem.id}')">🗑 删除</button>
                </div>
            </div>
        `).join('');
    },

    // ===== 复制诗歌 =====
    async copyPoem() {
        if (!this.currentPoem) {
            this.showToast('请先生成诗歌');
            return;
        }

        const text = `${this.currentPoem.title}\n\n${this.currentPoem.lines.join('\n')}\n\n—— AI Poet Lab`;
        
        try {
            await navigator.clipboard.writeText(text);
            this.showToast('已复制到剪贴板 📋');
        } catch {
            // 降级方案
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            this.showToast('已复制到剪贴板 📋');
        }
    },

    // ===== Toast 提示 =====
    showToast(message) {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.classList.add('show');
        
        clearTimeout(this.toastTimer);
        this.toastTimer = setTimeout(() => {
            toast.classList.remove('show');
        }, 2500);
    },

    // ===== HTML 转义 =====
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    // ===== 背景粒子动画 =====
    initBackground() {
        const canvas = document.getElementById('bgCanvas');
        const ctx = canvas.getContext('2d');
        
        let particles = [];
        let mouseX = 0;
        let mouseY = 0;

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // 创建粒子
        function createParticles() {
            particles = [];
            const count = Math.floor((canvas.width * canvas.height) / 15000);
            for (let i = 0; i < count; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    vx: (Math.random() - 0.5) * 0.3,
                    vy: (Math.random() - 0.5) * 0.3,
                    size: Math.random() * 2 + 0.5,
                    opacity: Math.random() * 0.5 + 0.1,
                    type: Math.random() > 0.7 ? 'star' : 'dot'
                });
            }
        }
        createParticles();

        // 鼠标追踪
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        // 动画循环
        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach(p => {
                // 移动
                p.x += p.vx;
                p.y += p.vy;

                // 边界回弹
                if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

                // 鼠标引力
                const dx = mouseX - p.x;
                const dy = mouseY - p.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 150) {
                    p.x += dx * 0.002;
                    p.y += dy * 0.002;
                }

                // 绘制粒子
                ctx.beginPath();
                if (p.type === 'star') {
                    // 星形粒子
                    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(212, 165, 116, ${p.opacity})`;
                    ctx.fill();
                    
                    // 光晕
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(212, 165, 116, ${p.opacity * 0.1})`;
                    ctx.fill();
                } else {
                    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(245, 240, 230, ${p.opacity * 0.5})`;
                    ctx.fill();
                }
            });

            // 绘制连线
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    
                    if (dist < 100) {
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(212, 165, 116, ${(1 - dist / 100) * 0.1})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }

            requestAnimationFrame(animate);
        }
        animate();
    }
};

// 启动应用
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
