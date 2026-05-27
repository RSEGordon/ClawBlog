---
title: 彩笔教程 · 001-004 - 绘图基础、峰谷识别与水华检测
date: 2026-05-27
tags: [MATLAB, 教程, 可视化]
categories: [彩笔教程]
description: MATLAB绘图基础（pcolor/imagesc/colorbar）+ 峰谷识别boom_recog.m + 按季节分段水华识别recog.m。
cover: /images/cover-tut-001-004.png
---

> 画图是数据分析的门面，峰谷识别和水华检测是典型的应用场景。

## 四、绘图基础

**一句话**：MATLAB的图都是分层叠加的，先建坐标系再叠加元素。

### 4.1 填色图

```matlab
figure;                              % 新建窗口
pcolor(lon, lat, data(:, :, 1).');    % 注意转置
shading flat;                         % 去掉格子线（默认有格子）
shading interp;                      % 插值平滑（更常用）
colorbar;
caxis([vmin, vmax]);                  % 固定色标范围
xlabel('经度'); ylabel('纬度');
title('SST');
```

### 4.2 等值线图

```matlab
figure;
contourf(lon, lat, data, 20, 'LineStyle', 'none');  % 20层填色等值线
hold on;
contour(lon, lat, data, 'k', 'LineWidth', 0.5);     % 加等值线
caxis([vmin, vmax]);
colorbar;
```

### 4.3 散点图（不规则网格）

```matlab
% 当数据不是规则经纬度网格时，用散点图画
scatter(lon(:), lat(:), 10, data(:), 'filled');
colorbar;
```

### 4.4 线图（时间序列）

```matlab
plot(time, ts, 'b-', 'LineWidth', 1.5);
hold on;
plot(time, ts_smooth, 'r--', 'LineWidth', 2);
xlabel('时间'); ylabel('叶绿素');
legend('原始', '去噪');
grid on;
xtickangle(45);
```

### 4.5 子图

```matlab
figure;
for i = 1:6
    subplot(2, 3, i);                 % 2行3列，第i个
    pcolor(lon, lat, data(:, :, i).');
    shading flat;
    colorbar;
    title(sprintf('年: %d', 2010+i));
end
sgtitle('多年叶绿素分布');            % 总标题
```

### 4.6 陆地掩膜

```matlab
% 方案1：乘以mask（陆地变NaN）
data_masked = data .* mask;           % mask: 海洋=1, 陆地=0

% 方案2：用NaN替代
data_masked = data;
data_masked(mask == 0) = NaN;

% 方案3：m_map工具箱（推荐，可叠加海岸线）
m_proj('mercator', 'long', [118, 127], 'lat', [30, 38]);
m_pcolor(lon, lat, data.');           % 注意m_map通常用转置
m_gshhs('lc1', 'patch', [0.8 0.8 0.8], 'edgecolor', 'k');
m_grid('box','on','xtick',118:3:127,'ytick',30:2:42);
```

### 4.7 保存图片

```matlab
% 保存为高清矢量（科研首选）
print('-dpdf', '-r300', 'figure.pdf');   % PDF矢量
print('-depsc', '-r300', 'figure.eps');   % EPS矢量

% 保存为位图
saveas(gcf, 'figure.png');               % 当前图窗
print('-dpng', '-r600', 'figure.png');    % 600dpi位图

% 直接生成图片文件
frame = getframe(gcf);
imwrite(frame.cdata, 'figure.png');
```

---

# 预处理篇


---

## 七、峰谷识别（boom_recog.m 完整代码）

**一句话**：用 `findpeaks` 同时找峰和谷，谷就是把信号取负再找峰。

```matlab
function [FT, nt, st, ploc, peak] = boom_recog(A)
%% 基于ROC法的水华识别（核心函数）
% 输入：A — 叶绿素去噪后时间序列
% 输出：FT   — 二值水华标记向量（1=水华，0=非水华）
%       nt   — 各水华开始时间索引向量
%       st   — 各水华结束时间索引向量
%       ploc — 峰位置索引
%       peak — 峰值

% ===== 第1步：FFT降噪 =====
N = length(A);
signal_fft = fft(A);
signal_fft(31:N-30) = 0;                   % 保留30个低频系数
recon = real(ifft(signal_fft));            % 去噪后信号

% ===== 第2步：找峰和谷 =====
[pea, peak_locs] = findpeaks(recon);       % 峰：值和位置
[~, valley_locs] = findpeaks(-recon);      % 谷：把信号取负再找

% ===== 第3步：合并极值点并排序 =====
extrema_locs = sort([peak_locs(:); valley_locs(:)]);

% ===== 第4步：ROC拐点法找NT和ST =====
% 峰-谷段：找变化率最大点 → 该段结束位置 ST
ST = [];
for i = 1:2:length(extrema_locs)-1
    seg = recon(extrema_locs(i):extrema_locs(i+1));
    [~, max_idx] = max(abs(diff(seg)));
    ST = [ST, max_idx + extrema_locs(i) - 1];
end

% 谷-峰段：找变化率最大点 → 该段开始位置 NT
NT = [];
for i = 2:2:length(extrema_locs)-1
    seg = recon(extrema_locs(i):extrema_locs(i+1));
    [~, max_idx] = max(abs(diff(seg)));
    NT = [NT, max_idx + extrema_locs(i) - 1];
end

% ===== 第5步：纠正峰谷优先顺序（关键！）=====
% 如果第一个是谷而非峰，NT和ST需要对调
if peak_locs(1) > valley_locs(1)
    tmp = ST;
    ST = NT;
    NT = tmp;
end

% ===== 第6步：清理首尾不配对事件 =====
% 去掉第一个ST<NT的情况（没有对应的开始）
if st(1) < nt(1)
    st(1) = []; peak_locs(1) = []; pea(1) = [];
end
% 去掉最后一个NT>ST的情况
if nt(end) > st(end)
    nt(end) = []; peak_locs(end) = []; pea(end) = [];
end

% ===== 第7步：生成二值标记向量 =====
FT = zeros(1, N);
nt = NT; st = ST; ploc = peak_locs; peak = pea;

if length(nt) ~= length(st)
    error('水华起止点数量不匹配');
end

for i = 1:length(nt)
    if nt(i) <= st(i)
        FT(nt(i):st(i)) = 1;             % 从开始到结束区间=1
    end
end
end
```

**使用示例**：

```matlab
chl_point = squeeze(chl_a(lat_idx, lon_idx, :));  % 某像元时间序列
[FT, nt, st, ploc, peak] = boom_recog(chl_point);

% 画图验证
figure;
plot(chl_point, 'b-'); hold on;
stem(ploc, chl_point(ploc), 'r^');          % 峰
stem(nt, zeros(size(nt)), 'gv');            % 开始
stem(st, zeros(size(st)), 'kv');             % 结束
plot(FT .* max(chl_point) * 0.8, 'k-');    % 水华区间
```

### 7.1 findpeaks参数详解（延伸）

```matlab
[peaks, locs] = findpeaks(data, ...
    'MinPeakProminence', 0.5, ...    % 最小峰凸起（相对高度）
    'MinPeakDistance', 5, ...       % 两峰间最小索引距离
    'MinPeakHeight', 1.0, ...       % 最小绝对高度
    'Threshold', 0.1);             % 最小相邻差异

% Prominence是最有用的参数：山峰到周围山谷的落差
% 比MinPeakHeight更抗噪声，不受绝对值影响
```

### 7.2 年度分段处理（延伸）

```matlab
% 一年46个点（9年=506点），每年分开处理
for year = 2011:2019
    yearop = (year - 2010) * 46 + 1;    % 该年起始索引
    yeared = (year - 2009) * 46;       % 该年结束索引

    chl_year = chl_point(yearop:yeared);  % 当年数据
    [FT_year, ~] = boom_recog(chl_year);
    % ...
end

% 调试：画年度分割线
hold on;
for yi = 46:46:length(chl_point)
    xline(yi, 'k--');
end
```

---


---

## 八、按季节分段的水华识别（recog.m 逻辑）

**一句话**：先把全年分成春/秋/夏/冬四个季节段，再在每段里判断有没有水华、计算起止时间、最大值、持续天数。

### 8.1 水华季节划分逻辑

```matlab
% 判断这一年是哪种水华模式
% conum：春季+秋季峰集中区间（46*i-4 到 46*i+4）
% honum：夏季+冬季峰集中区间（46*i+18 到 46*i+30）
conum = []; honum = [];
for i = 1:11
    conum = [conum, (46*i-4):(46*i+4)];
    honum = [honum, (46*i+18):(46*i+30)];
end

num1 = intersect(ploc, conum);     % 峰落在春秋区间的数量
num2 = intersect(ploc, honum);     % 峰落在夏冬区间的数量

if length(num1) > round(length(ploc)/2)
    mode = 2;      % 夏季水华为主（峰大多在夏冬段）
elseif length(num1) > 5
    mode = 3;      % 混合型
else
    mode = 1;      % 春秋水华为主
end
```

### 8.2 三种模式的水华起止计算

```matlab
% mode=1（春秋水华）：分别处理春季和秋季
if mode == 1
    springop = (year - 2010) * 46 + 1;
    springed = springop + 22;
    % 从nt/st中筛选属于春季范围的点
    spring_nts = nt(nt >= springop & nt <= springed);
    spring_sts = st(st >= springop & st <= springed);
    spring_points = union(spring_nts, spring_sts);

    % 再细分为：3点（完整）、2点、1点、无，4种情况处理
    if length(spring_points) == 3 && spring_points(1) == spring_sts(1)
        % 完整水华：开始、峰值、结束都找到
        sop = spring_nts;
        sed = spring_sts(2);
        smax = ploc(ploc >= sop & ploc <= sed);
        sdur = sed - sop + 1;
    elseif length(spring_points) == 0
        % 无春季水华
        sop = nan; sed = nan; smax = nan; sdur = nan;
    end

    % 秋季同理……（代码省略，逻辑相同）
end

% mode=2（夏季水华）：一年有4个极值点（冬→夏→秋→冬）
if mode == 2
    % 检查是否真的存在夏季水华（4个点且第2个是NT）
    if length(ntsts) >= 4 && ntsts(2) == nts(1)
        hop = ntsts(2); hed = ntsts(3);  % 夏季水华起止
        wop = ntsts(4); wed = ntsts(1);  % 冬季水华起止
    end
end
```

### 8.3 全像元批量处理模板

```matlab
% 输出预分配
sop_all  = nan(144, 132, 9);
sed_all  = nan(144, 132, 9);
smax_all = nan(144, 132, 9);
sdur_all = nan(144, 132, 9);

for lat = 1:144
    for lon = 1:132
        chl_point = squeeze(chl_a(lat, lon, :));

        if isnan(chl_point(1)); continue; end

        [FT, nt, st, ploc, peak] = boom_recog(chl_point);

        for ye = 2011:2019
            % 计算该年的sop, sed, smax, sdur
            % （按上述逻辑填充）

            sop_all(lat, lon, ye-2010) = sop;
            sed_all(lat, lon, ye-2010) = sed;
            smax_all(lat, lon, ye-2010) = smax;
            sdur_all(lat, lon, ye-2010) = sdur;
        end
    end
    fprintf('完成纬度: %d\n', lat);
end

save('bloom_results.mat', 'sop_all', 'sed_all', 'smax_all', 'sdur_all');
```

---

# MHW/MCS检测篇


---

← [数据IO篇](./tutorial-001-003)　　→ [信号处理篇：偏态检测与FFT](./tutorial-001-005)
