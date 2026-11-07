/**
 * AI Poet Lab · 意境配图生成器
 * 根据诗歌内容和情感，用 Canvas 生成水墨风格意境画
 */

const ImageGenerator = {
    canvas: null,
    ctx: null,

    init(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        return this.canvas;
    },

    // 主生成函数
    generate(poem) {
        if (!this.canvas || !this.ctx) {
            this.init('poemImage');
        }

        const w = this.canvas.width;
        const h = this.canvas.height;
        const ctx = this.ctx;

        // 根据情感选择色调
        const palette = this.getPalette(poem.emotion);

        // 绘制背景渐变
        this.drawBackground(w, h, palette);

        // 根据情感绘制不同的意境元素
        this.drawScene(poem.emotion, w, h, palette);

        // 绘制诗歌标题水印
        this.drawWatermark(poem, w, h, palette);

        // 绘制印章
        this.drawSeal(w, h, palette);
    },

    // 根据情感获取配色
    getPalette(emotion) {
        const palettes = {
            思乡: { sky: '#1a1a3e', mountain: '#2a3a5e', accent: '#d4a574', moon: '#f5e6c8' },
            离别: { sky: '#2d1f3e', mountain: '#3e2f5e', accent: '#c0392b', moon: '#e8e0d0' },
            壮志: { sky: '#0d1a2e', mountain: '#1a2a4e', accent: '#d4a574', moon: '#fff8e0' },
            爱情: { sky: '#2e1a2e', mountain: '#3e2a3e', accent: '#e74c3c', moon: '#fce8e0' },
            田园: { sky: '#1a2e1a', mountain: '#2e4e2e', accent: '#7ec850', moon: '#f0f8e0' },
            咏物: { sky: '#1e2e2e', mountain: '#2e4e4e', accent: '#a0d4d0', moon: '#e8f0e8' },
            感怀: { sky: '#1e1a2e', mountain: '#2e2a4e', accent: '#b8a090', moon: '#d8d0c0' },
            豪放: { sky: '#0a0a2e', mountain: '#1a1a4e', accent: '#d4a574', moon: '#ffd700' }
        };
        return palettes[emotion] || palettes['感怀'];
    },

    // 绘制背景
    drawBackground(w, h, palette) {
        const ctx = this.ctx;
        const gradient = ctx.createLinearGradient(0, 0, 0, h);
        gradient.addColorStop(0, palette.sky);
        gradient.addColorStop(0.7, palette.mountain);
        gradient.addColorStop(1, '#0a0a1a');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);
    },

    // 根据情感绘制场景
    drawScene(emotion, w, h, palette) {
        switch (emotion) {
            case '思乡':
                this.drawMoonScene(w, h, palette);
                this.drawMountains(w, h, palette, 0.6);
                break;
            case '离别':
                this.drawSunsetScene(w, h, palette);
                this.drawRiverScene(w, h, palette);
                break;
            case '壮志':
                this.drawStarScene(w, h, palette);
                this.drawPeaksScene(w, h, palette);
                break;
            case '爱情':
                this.drawPetalScene(w, h, palette);
                this.drawMoonScene(w, h, palette);
                break;
            case '田园':
                this.drawFieldScene(w, h, palette);
                break;
            case '咏物':
                this.drawBambooScene(w, h, palette);
                break;
            case '感怀':
                this.drawCloudScene(w, h, palette);
                this.drawMountains(w, h, palette, 0.5);
                break;
            case '豪放':
                this.drawWaveScene(w, h, palette);
                this.drawStarScene(w, h, palette);
                break;
            default:
                this.drawMoonScene(w, h, palette);
                this.drawMountains(w, h, palette, 0.6);
        }
    },

    // 绘制月亮
    drawMoonScene(w, h, palette) {
        const ctx = this.ctx;
        const moonX = w * 0.75;
        const moonY = h * 0.3;
        const moonR = Math.min(w, h) * 0.12;

        // 月晕
        for (let i = 3; i > 0; i--) {
            ctx.beginPath();
            ctx.arc(moonX, moonY, moonR + i * 15, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(245, 230, 200, ${0.05 * i})`;
            ctx.fill();
        }

        // 月亮本体
        ctx.beginPath();
        ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
        ctx.fillStyle = palette.moon;
        ctx.fill();

        // 月亮阴影（增加立体感）
        ctx.beginPath();
        ctx.arc(moonX - moonR * 0.2, moonY - moonR * 0.2, moonR * 0.7, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(245, 230, 200, 0.3)`;
        ctx.fill();
    },

    // 绘制远山
    drawMountains(w, h, palette, opacity) {
        const ctx = this.ctx;
        const layers = 3;
        
        for (let layer = 0; layer < layers; layer++) {
            const baseY = h * (0.5 + layer * 0.15);
            const peakHeight = (60 - layer * 15) + Math.random() * 20;
            
            ctx.beginPath();
            ctx.moveTo(0, h);
            ctx.lineTo(0, baseY);
            
            const segments = 8;
            for (let i = 0; i <= segments; i++) {
                const x = (w / segments) * i;
                const y = baseY - peakHeight * Math.sin((i / segments) * Math.PI) * (0.5 + Math.random() * 0.5);
                ctx.lineTo(x, y);
            }
            
            ctx.lineTo(w, h);
            ctx.closePath();
            ctx.fillStyle = `rgba(30, 40, 70, ${opacity - layer * 0.15})`;
            ctx.fill();
        }
    },

    // 绘制日落
    drawSunsetScene(w, h, palette) {
        const ctx = this.ctx;
        const sunX = w * 0.5;
        const sunY = h * 0.6;
        const sunR = Math.min(w, h) * 0.1;

        // 日落光晕
        const gradient = ctx.createRadialGradient(sunX, sunY, sunR, sunX, sunY, sunR * 4);
        gradient.addColorStop(0, 'rgba(192, 57, 43, 0.8)');
        gradient.addColorStop(0.5, 'rgba(212, 165, 116, 0.3)');
        gradient.addColorStop(1, 'rgba(212, 165, 116, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);

        // 太阳
        ctx.beginPath();
        ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
        ctx.fillStyle = palette.accent;
        ctx.fill();
    },

    // 绘制河流
    drawRiverScene(w, h, palette) {
        const ctx = this.ctx;
        ctx.strokeStyle = `rgba(212, 165, 116, 0.2)`;
        ctx.lineWidth = 1;

        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            const startY = h * 0.65 + i * 8;
            ctx.moveTo(0, startY);
            for (let x = 0; x <= w; x += 10) {
                const y = startY + Math.sin(x * 0.02 + i) * 3;
                ctx.lineTo(x, y);
            }
            ctx.stroke();
        }

        // 小舟
        ctx.fillStyle = `rgba(30, 30, 40, 0.6)`;
        ctx.beginPath();
        ctx.ellipse(w * 0.3, h * 0.7, 15, 4, 0, 0, Math.PI * 2);
        ctx.fill();
    },

    // 绘制星空
    drawStarScene(w, h, palette) {
        const ctx = this.ctx;
        for (let i = 0; i < 50; i++) {
            const x = Math.random() * w;
            const y = Math.random() * h * 0.6;
            const r = Math.random() * 2 + 0.5;
            const opacity = Math.random() * 0.8 + 0.2;

            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 240, 200, ${opacity})`;
            ctx.fill();

            // 大星星加光晕
            if (r > 1.5) {
                ctx.beginPath();
                ctx.arc(x, y, r * 3, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 240, 200, ${opacity * 0.1})`;
                ctx.fill();
            }
        }
    },

    // 绘制山峰
    drawPeaksScene(w, h, palette) {
        const ctx = this.ctx;
        const peaks = 3;
        
        for (let p = 0; p < peaks; p++) {
            const peakX = w * (0.2 + p * 0.3);
            const peakY = h * (0.8 - p * 0.1);
            const peakW = w * 0.25;

            ctx.beginPath();
            ctx.moveTo(peakX - peakW / 2, h);
            ctx.lineTo(peakX, peakY);
            ctx.lineTo(peakX + peakW / 2, h);
            ctx.closePath();
            ctx.fillStyle = `rgba(20, 25, 45, ${0.8 - p * 0.2})`;
            ctx.fill();

            // 雪顶
            ctx.beginPath();
            ctx.moveTo(peakX - peakW * 0.1, peakY + 15);
            ctx.lineTo(peakX, peakY);
            ctx.lineTo(peakX + peakW * 0.1, peakY + 15);
            ctx.fillStyle = `rgba(245, 240, 230, ${0.3 - p * 0.08})`;
            ctx.fill();
        }
    },

    // 绘制花瓣飘落
    drawPetalScene(w, h, palette) {
        const ctx = this.ctx;
        for (let i = 0; i < 20; i++) {
            const x = Math.random() * w;
            const y = Math.random() * h;
            const size = Math.random() * 8 + 4;
            const rotation = Math.random() * Math.PI;

            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(rotation);
            ctx.beginPath();
            ctx.ellipse(0, 0, size, size * 0.5, 0, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(231, 76, 60, ${Math.random() * 0.4 + 0.1})`;
            ctx.fill();
            ctx.restore();
        }
    },

    // 绘制田园
    drawFieldScene(w, h, palette) {
        const ctx = this.ctx;
        
        // 田地
        const gradient = ctx.createLinearGradient(0, h * 0.5, 0, h);
        gradient.addColorStop(0, 'rgba(45, 80, 22, 0.3)');
        gradient.addColorStop(1, 'rgba(20, 40, 10, 0.6)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, h * 0.5, w, h * 0.5);

        // 远山
        this.drawMountains(w, h, palette, 0.4);

        // 炊烟
        for (let i = 0; i < 3; i++) {
            const smokeX = w * (0.2 + i * 0.3);
            const smokeY = h * 0.55;
            
            for (let j = 0; j < 8; j++) {
                ctx.beginPath();
                ctx.arc(smokeX + Math.sin(j) * 10, smokeY - j * 12, 6 + j * 2, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(200, 200, 200, ${0.15 - j * 0.015})`;
                ctx.fill();
            }
        }
    },

    // 绘制竹子
    drawBambooScene(w, h, palette) {
        const ctx = this.ctx;
        const stalks = 4;

        for (let i = 0; i < stalks; i++) {
            const x = w * (0.15 + i * 0.2);
            const baseY = h;
            const topY = h * (0.1 + Math.random() * 0.2);

            // 竹竿
            ctx.strokeStyle = `rgba(45, 80, 22, ${0.6 - i * 0.1})`;
            ctx.lineWidth = 6 - i;
            ctx.beginPath();
            ctx.moveTo(x, baseY);
            
            // 稍微弯曲
            for (let y = baseY; y >= topY; y -= 5) {
                const curveOffset = Math.sin((baseY - y) / baseY * Math.PI) * 10;
                ctx.lineTo(x + curveOffset, y);
            }
            ctx.stroke();

            // 竹节
            const segments = Math.floor((baseY - topY) / 40);
            for (let s = 1; s < segments; s++) {
                const segY = baseY - s * 40;
                const curveOffset = Math.sin((baseY - segY) / baseY * Math.PI) * 10;
                ctx.beginPath();
                ctx.arc(x + curveOffset, segY, 4, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(30, 50, 15, ${0.5})`;
                ctx.fill();
            }

            // 竹叶
            const leafCount = 5 + Math.floor(Math.random() * 5);
            for (let l = 0; l < leafCount; l++) {
                const leafY = topY + Math.random() * (baseY - topY) * 0.5;
                const curveOffset = Math.sin((baseY - leafY) / baseY * Math.PI) * 10;
                
                ctx.save();
                ctx.translate(x + curveOffset, leafY);
                ctx.rotate((Math.random() - 0.5) * Math.PI);
                
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.quadraticCurveTo(15, -5, 30, -2);
                ctx.quadraticCurveTo(15, 3, 0, 0);
                ctx.fillStyle = `rgba(45, 80, 22, ${0.4 + Math.random() * 0.3})`;
                ctx.fill();
                ctx.restore();
            }
        }
    },

    // 绘制云
    drawCloudScene(w, h, palette) {
        const ctx = this.ctx;
        for (let i = 0; i < 5; i++) {
            const x = Math.random() * w;
            const y = h * (0.2 + Math.random() * 0.3);
            const size = Math.random() * 40 + 30;

            for (let j = 0; j < 4; j++) {
                ctx.beginPath();
                ctx.arc(x + j * size * 0.3, y + Math.sin(j) * 5, size * (0.6 + j * 0.1), 0, Math.PI * 2);
                ctx.fillStyle = `rgba(180, 170, 160, ${0.08 + Math.random() * 0.05})`;
                ctx.fill();
            }
        }
    },

    // 绘制波浪
    drawWaveScene(w, h, palette) {
        const ctx = this.ctx;
        for (let i = 0; i < 8; i++) {
            const baseY = h * 0.4 + i * 20;
            ctx.beginPath();
            ctx.moveTo(0, baseY);
            for (let x = 0; x <= w; x += 5) {
                const y = baseY + Math.sin(x * 0.03 + i * 0.5) * (10 + i * 2);
                ctx.lineTo(x, y);
            }
            ctx.strokeStyle = `rgba(212, 165, 116, ${0.15 - i * 0.01})`;
            ctx.lineWidth = 1 + i * 0.3;
            ctx.stroke();
        }
    },

    // 绘制水印标题
    drawWatermark(poem, w, h, palette) {
        const ctx = this.ctx;
        ctx.save();
        
        // 竖排标题
        const title = poem.title.length > 8 ? poem.title.substring(0, 8) : poem.title;
        ctx.font = '14px "STKaiti", "KaiTi", serif';
        ctx.fillStyle = `rgba(245, 240, 230, 0.4)`;
        ctx.textAlign = 'left';
        
        for (let i = 0; i < title.length; i++) {
            ctx.fillText(title[i], 20, 30 + i * 20);
        }

        // 风格标签
        ctx.font = '10px "Microsoft YaHei", sans-serif';
        ctx.fillStyle = `rgba(212, 165, 116, 0.5)`;
        ctx.fillText(poem.styleTag + '·' + poem.style, 20, h - 15);
        
        ctx.restore();
    },

    // 绘制印章
    drawSeal(w, h, palette) {
        const ctx = this.ctx;
        const sealSize = 35;
        const sealX = w - sealSize - 15;
        const sealY = h - sealSize - 15;

        ctx.save();
        ctx.translate(sealX + sealSize / 2, sealY + sealSize / 2);
        ctx.rotate(-0.05);

        // 印章背景
        ctx.fillStyle = 'rgba(192, 57, 43, 0.8)';
        ctx.fillRect(-sealSize / 2, -sealSize / 2, sealSize, sealSize);

        // 印章边框
        ctx.strokeStyle = 'rgba(245, 240, 230, 0.6)';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(-sealSize / 2 + 3, -sealSize / 2 + 3, sealSize - 6, sealSize - 6);

        // 印章文字
        ctx.font = 'bold 16px "STKaiti", "KaiTi", serif';
        ctx.fillStyle = 'rgba(245, 240, 230, 0.9)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('诗', 0, 0);

        ctx.restore();
    },

    // 下载图片
    download(poem) {
        if (!this.canvas) return;
        
        const link = document.createElement('a');
        link.download = poem.title + '_意境配图.png';
        link.href = this.canvas.toDataURL('image/png');
        link.click();
    }
};
