---
title: 彩笔教程 · 006 - Matlab入门到入土·分析方法
date: 2026-05-27 14:35:00
tags: [MATLAB, 教程, 分析方法]
categories: [彩笔教程]
description: detect.m完整函数 + MHW分类标准 + 随机森林回归 + EOF分解 + 气候指数计算。
cover: /images/covers/cover-tut-001-006.png
---

> 核心分析方法：事件检测、机器学习建模、时空分解。

## 九、detect.m 完整函数

**一句话**：用气候态百分位阈值检测海温异常事件，返回事件表+逐日二值场。

**所在文件**：`聂文龙数据/oisst-1982-2022/detect.m`（直接调用，不用自己写）

```matlab
[MHW, mclim, m90, mhw_ts] = detect(temp, time, ...
    datenum(1982,1,1), datenum(2010,12,31), ...   % 气候态时段
    datenum(2011,1,1), datenum(2020,12,31), ...   % 检测时段
    'Event', 'MHW', ...                           % 'MHW'或'MCS'
    'Threshold', 0.9, ...                          % 百分位（热浪0.9，冷浪0.1）
    'MinDuration', 5, ...                          % 最小持续天数
    'MaxGap', 2, ...                              % 允许合并的最大间隔天数
    'WindowHalfWidth', 5, ...                     % 滑动窗口半宽（默认5天）
    'SmoothPercentileWidth', 31);                 % 百分位平滑窗口（默认31天）
```

### 9.1 输入输出详解

**输入参数**：

| 参数 | 说明 | 默认值 |
|------|------|--------|
| temp | m×n×t 海温三维场 | 必需 |
| time | 对应的时间向量（datenum） | 必需 |
| cli_start / cli_end | 气候态计算时段起止 | 必需 |
| mhw_start / mhw_end | 事件检测时段起止 | 必需 |
| 'Event' | 'MHW' 或 'MCS' | 'MHW' |
| 'Threshold' | 百分位（0~1） | 0.9 |
| 'MinDuration' | 最小持续天数 | 5 |
| 'MaxGap' | 允许合并的最大间隔 | 2 |
| 'WindowHalfWidth' | 气候态计算滑动窗口半宽 | 5 |
| 'SmoothPercentileWidth' | 百分位平滑窗口 | 31 |

**输出**：

| 输出 | 尺寸 | 说明 |
|------|------|------|
| MHW | 事件数×9表格 | 每行一个事件 |
| mclim | m×n×366 | 逐日气候态均值 |
| m90 | m×n×366 | 逐日百分位阈值 |
| mhw_ts | m×n×t检测时段 | 逐日二值场（1=事件中，NaN=陆地） |

**MHW表格字段**：

| 字段 | 说明 |
|------|------|
| mhw_onset | 事件开始日期（YYYYMMDD） |
| mhw_end | 事件结束日期 |
| mhw_dur | 持续天数 |
| int_max | 最大强度（距平值） |
| int_mean | 平均强度 |
| int_var | 强度方差 |
| int_cum | 累计强度（距平积分） |
| xloc, yloc | 事件位置（行列索引） |

### 9.2 气候态计算原理

```
cli_start-window  ← 滑动窗口半宽，向前扩展
cli_end+window   ← 向后扩展
```

对每一天DOY（1~366），在 clim 时段内找所有同一DOY±window内的天，参与统计：

```matlab
% 对第i天DOY：收集 clim 中所有满足 DOY∈[i-window, i+window] 的日子
ind_fake(fake_doy == i & ~ismember(datenum(date_true), cli_start:cli_end)) = nan;
% 排除cli_start~cli_end之外的日子（不在 climatology 时段内的日子）

m90(:,:,i) = quantile(temp_clim(:,:,...), vThreshold, 3);  % 百分位阈值
mclim(:,:,i) = mean(temp_clim(:,:,...), 3, 'omitnan');     % 气候态均值
```

然后对366天做31天滑动平均平滑（`smoothdata(..., 'movmean', 31)`），避免逐日阈值突变。

### 9.3 事件检测逻辑（逐像元）

```matlab
% 对每个空间格点，找连续超过阈值≥MinDuration的天
maysum(temp >= m90(i,j,indextocal)) = 1;   % 每天是否超阈值

% 扫描：trigger=0时遇到1→start，trigger=1时遇到0→end
% → 得到初步事件表 potential_event [start, end]

% 合并间隔≤MaxGap的事件（允许事件间有短间隔）
while min(gaps) <= vmaxGap
    potential_event(gaps <= vmaxGap, 2) = potential_event(gaps <= vmaxGap+1, 2);
    potential_event(gaps <= vmaxGap+1, :) = [];
    gaps = ...
end

% 只保留持续≥MinDuration的事件
potential_event = potential_event(potential_event(:,2)-potential_event(:,1)+1 >= vminDuration, :);
```

### 9.4 完整调用示例

```matlab
% 读取SST数据（外挂硬盘）
sst = load('/media/rsegordon/新加卷/聂文龙数据/oisst-1982-2022/sst.mat');
time = load('/media/rsegordon/新加卷/聂文龙数据/oisst-1982-2022/time.mat');

% 检测热浪
[MHW, mclim, m90, mhw_ts] = detect(sst, time, ...
    datenum(1982,1,1), datenum(2010,12,31), ...
    datenum(2011,1,1), datenum(2020,12,31), ...
    'Event', 'MHW', 'Threshold', 0.9, 'MinDuration', 5);

% 检测冷浪（用10th百分位）
[MCS, ~, ~, mcs_ts] = detect(sst, time, ...
    datenum(1982,1,1), datenum(2010,12,31), ...
    datenum(2011,1,1), datenum(2020,12,31), ...
    'Event', 'MCS', 'Threshold', 0.1, 'MinDuration', 5);

% 画某一像元的时间序列+阈值+事件
figure;
plot(time, sst(i,j,:), 'b-'); hold on;
plot(time, squeeze(m90(i,j,:)), 'r--');
plot(time, squeeze(mclim(i,j,:)), 'k-');
% 高亮MHW区间
for k = 1:height(MHW_i)
    [tf, loc] = ismember(MHW_i.mhw_onset(k), round(time));
    if tf
        hold on;
        patch([MHW_i.mhw_onset(k), MHW_i.mhw_end(k), ...
            MHW_i.mhw_end(k), MHW_i.mhw_onset(k)], ...
            [0, 0, max(sst(i,j,:)), max(sst(i,j,:))], ...
            'r', 'FaceAlpha', 0.2);
    end
end
```

---


---

## 十、MHW分类标准（延伸）

**一句话**：Hobday et al. (2018) 按强度把MHW分成四级，超过气候态90th百分位2°C以上的才算严重事件。

| 等级 | 名称 | 强度定义 | 颜色 |
|------|------|----------|------|
| 1级 | Moderate | 90th < T′ ≤ 2×IQR* | 浅红 |
| 2级 | Strong | 2×IQR < T′ ≤ 4×IQR | 橙红 |
| 3级 | Severe | 4×IQR < T′ ≤ 8×IQR | 深红 |
| 4级 | Extreme | T′ > 8×IQR | 深紫 |

```matlab
% 计算各级阈值
iqr = quantile(mhw_ts, 0.75) - quantile(mhw_ts, 0.25);  % IQR

% 每级事件计数
n_moderate = sum(MHW.int_mean > prctile(mhw_ts, 90) & ...
                   MHW.int_mean <= 2*iqr);
n_severe   = sum(MHW.int_mean > 4*iqr);
```

### 10.1 返回周期分析

```matlab
% 各像元事件频率
event_count = sum(mhw_ts > 0, 3);            % 每年平均事件数
event_freq = event_count / length(years);

% 10年一遇事件：找10年中只出现1次的事件
long_events = MHW(MHW.mhw_dur > 365, :);     % 持续超过1年的事件
```

### 10.2 趋势分析

```matlab
% Sen's斜率估计（非参方法）
for i = 1:m
    for j = 1:n
        ts_i = squeeze(mhw_ts(i,j,:));
        event_intensity_annual = [];
        for y = 1:length(years)
            year_events = MHW(MHW.xloc==i & MHW.yloc==j & ...
                MHW.mhw_onset >= datenum(years(y),1,1) & ...
                MHW.mhw_end <= datenum(years(y),12,31), :);
            event_intensity_annual(y) = mean(year_events.int_mean);
        end
        [slope(i,j), ~] = senslope(event_intensity_annual);  % 需工具箱
    end
end
```

---

# 模型分析篇


---

## 十一、随机森林回归（完整代码）

**一句话**：用一堆决策树联合预测，同时算出每个变量的重要程度。

### 11.1 完整建模流程

```matlab
% 数据准备
env_vars = {'par', 'sss', 'sst', 'sstgrd', 'tp', 'wd'};
X = []; y = [];

for year = 2012:2021
    for month = [11, 12]
        chl_file = fullfile('output_tiff', 'chl', sprintf('chl_%d_%02d.tif', year, month));
        chl_data = double(imread(chl_file));

        env_data = [];
        for v = 1:length(env_vars)
            var_file = fullfile('output_tiff', env_vars{v}, sprintf('%s_%d_%02d.tif', env_vars{v}, year, month));
            var_data = double(imread(var_file));
            env_data = [env_data, var_data(:)];
        end

        X = [X; env_data];
        y = [y; chl_data(:)];
    end
end

% 预处理
valid_idx = ~any(isnan([X y]), 2);
X = X(valid_idx, :); y = y(valid_idx);

for i = 1:size(X, 2)
    if abs(skewness(X(:,i))) > 0.5
        minv = min(X(:,i));
        X(:,i) = log(X(:,i) - minv + 1);
    end
end
if skewness(y) > 0.5
    miny = min(y); y = log(y - miny + 1);
end

X = normalize(X, 'range');
y = normalize(y, 'range');

% 训练随机森林
model = TreeBagger(100, X, y, ...
    'Method', 'regression', ...
    'OOBPredictorImportance', 'on', ...
    'NumPredictorsToSample', round(sqrt(size(X, 2))));

% 预测
predictions = predict(model, X);
predictions = double(predictions);
```

### 11.2 参数说明

| 参数 | 说明 | 推荐值 |
|------|------|--------|
| nTrees（第一个参数） | 树的数量 | 50~200（越多越稳定） |
| 'Method' | 'regression'（回归）或 'classification'（分类） | — |
| 'OOBPredictorImportance' | 'on'时计算袋外重要性 | 必须开 |
| 'NumPredictorsToSample' | 每次分裂随机选的变量数 | √(n_vars)（默认） |
| 'MinLeafSize' | 叶子最小样本数 | 5~20 |
| 'SplitCriterion' | 分裂准则 | 'MSE'（均方误差） |

### 11.3 模型性能评估

```matlab
% R²（决定系数）
r2 = 1 - sum((y - predictions).^2) / sum((y - mean(y)).^2);

% RMSE（均方根误差）
rmse = sqrt(mean((y - predictions).^2));

% MAE（平均绝对误差）
mae = mean(abs(y - predictions));

% MSE（均方误差）
mse = mean((y - predictions).^2);

% 相关系数
r = corrcoef(y, predictions); r = r(1,2);

% 验证集评估（重要！）
% 把数据分成训练集和测试集
n = length(y);
idx = randperm(n);
train_idx = idx(1:round(0.8*n));
test_idx = idx(round(0.8*n)+1:end);

model_test = TreeBagger(100, X(train_idx,:), y(train_idx), ...
    'OOBPredictorImportance', 'on');
pred_test = predict(model_test, X(test_idx,:));
pred_test = double(pred_test);
r2_test = 1 - sum((y(test_idx) - pred_test).^2) / sum((y(test_idx) - mean(y(test_idx))).^2);
```

### 11.4 变量重要性

```matlab
importance = model.OOBPermutedPredictorDeltaError;   % 袋外置换重要性
weights = importance / sum(importance);             % 归一化为权重

[sorted_w, idx] = sort(weights, 'descend');
var_names = env_vars(idx);

% 画柱状图
figure;
bar(sorted_w);
set(gca, 'XTickLabel', var_names);
xtickangle(45);
xlabel('环境变量'); ylabel('归一化权重');
title('变量重要性');

% 打印具体数值
for i = 1:length(var_names)
    fprintf('%s: %.4f\n', var_names{i}, sorted_w(i));
end
```

### 11.5 部分依赖图（calculate_partial_dependence 完整代码）

```matlab
function pd_values = calculate_partial_dependence(model, X, feature_idx, grid_points)
%% 计算单个变量的部分依赖
% 输入：model — 训练好的TreeBagger模型
%       X     — 环境变量矩阵（原始或标准化后均可）
%       feature_idx — 要分析的变量序号（1~n）
%       grid_points — 在变量范围内取的网格点数
% 输出：pd_values — [grid_points × 2]，[变量值, 预测均值]

x_min = min(X(:, feature_idx));
x_max = max(X(:, feature_idx));
x_grid = linspace(x_min, x_max, grid_points);   % 取50个代表性值

pd_values = zeros(grid_points, 2);
for i = 1:grid_points
    X_temp = X;
    X_temp(:, feature_idx) = x_grid(i);         % 所有样本该变量设为同一值
    pred = predict(model, X_temp);             % 预测

    if iscell(pred)
        pred = cellfun(@str2double, pred);
    else
        pred = double(pred);
    end

    pd_values(i, :) = [x_grid(i), mean(pred, 'omitnan')];
end
fprintf('特征 %d 范围: %.4f ~ %.4f，响应范围: %.4f ~ %.4f\n', ...
    feature_idx, min(pd_values(:,1)), max(pd_values(:,1)), ...
    min(pd_values(:,2)), max(pd_values(:,2)));
end
```

**画图（含数据分布）**：

```matlab
figure('Position', [100, 100, 800, 600]);
yyaxis right;
histogram(X(:, i), 20, 'Normalization', 'probability', ...
    'FaceAlpha', 0.3, 'FaceColor', [0.5 0.5 0.5]);
ylabel('数据分布');
xlabel(sprintf('%s（标准化）', env_vars{i}));

yyaxis left;
pd_result = calculate_partial_dependence(model, X, i, 50);
plot(pd_result(:,1), pd_result(:,2), 'b-', 'LineWidth', 2);
ylabel('叶绿素预测值');
title(sprintf('%s 部分依赖图', env_vars{i}));
grid on;
```

**怎么读**：
- 曲线上走 = 该变量增加时，叶绿素倾向增加
- 曲线下走 = 该变量增加时，叶绿素倾向减少
- 曲线有拐点 = 不是简单线性关系（可能是阈值效应）
- 曲线平台 = 该范围变化对叶绿素影响不大

### 11.6 延伸：其他模型比较

```matlab
% 梯度提升回归（GBM，通常比随机森林更强但更慢）
template = templateTree('MaxNumSplits', 20);
mdl_gbm = fitrensemble(X, y, 'Method', 'LSBoost', ...
    'NumLearningCycles', 100, 'Learners', template);
pred_gbm = predict(mdl_gbm, X);

% 支持向量机回归（SVR，RBF核）
mdl_svr = fitrkernel(X, y, 'KernelFunction', 'rbf');
pred_svr = predict(mdl_svr, X);

% 线性回归（基准）
mdl_lr = fitlm(X, y);
pred_lr = predict(mdl_lr, X);

% 比较所有模型
models = {'RF', 'GBM', 'SVR', 'LR'};
preds = {predictions, pred_gbm, pred_svr, pred_lr};
for k = 1:length(models)
    rmse_k = sqrt(mean((y - preds{k}).^2));
    r_k = corrcoef(y, preds{k}); r_k = r_k(1,2);
    fprintf('%s: RMSE=%.4f, R=%.4f\n', models{k}, rmse_k, r_k);
end
```

### 11.7 延伸：超参数调优

```matlab
% 网格搜索找最优树数
results = [];
for nTrees = [50, 100, 200, 500]
    mdl = TreeBagger(nTrees, X, y, 'OOBPredictorImportance', 'on');
    pred = predict(mdl, X);
    rmse = sqrt(mean((y - double(pred)).^2));
    results = [results; nTrees, rmse];
    fprintf('nTrees=%d, RMSE=%.4f\n', nTrees, rmse);
end

% 找最优分裂变量数（mtry）
for mtry = 2:2:size(X,2)
    mdl = TreeBagger(100, X, y, 'NumPredictorsToSample', mtry);
    pred = predict(mdl, X);
    rmse = sqrt(mean((y - double(pred)).^2));
    fprintf('mtry=%d, RMSE=%.4f\n', mtry, rmse);
end
```

---

# EOF分解篇


---

## 十二、EOF分解（完整代码）

**一句话**：把场的时间变化分解成空间模态（EOF）×时间系数（PC），找最主要的变化形态。

```matlab
function [eof_spatial, eof_ts, variance_explained] = eof_decompose(data, n_modes)
%% EOF分解
% 输入：data    — m×n×t 三维场
%       n_modes — 要提取的模态数（通常3~5）
% 输出：eof_spatial — m×n×n_modes 空间型
%       eof_ts      — t×n_modes   时间系数
%       variance_explained — 各模态解释方差比例

[m, n, t] = size(data);

% 展平：三维→二维，每行一个时间点
data_2d = reshape(data, m*n, t).';          % t × (m*n)
data_2d = data_2d - mean(data_2d, 1);       % 去除时间维均值（去趋势/距平）

% SVD分解
[U, S, V] = svd(data_2d, 'econ');          % 经济模式（只保留min(t,m*n)个）

% 前n_modes个模态
eof_ts = U(:, 1:n_modes) * S(1:n_modes, 1:n_modes);  % t × n_modes
eof_spatial = V(:, 1:n_modes);                        % (m*n) × n_modes

% 展成三维空间场
eof_spatial = reshape(eof_spatial, m, n, n_modes);    % m × n × n_modes

% 计算解释方差
total_var = sum(S(:));                              % 总方差
variance_explained = diag(S(1:n_modes, 1:n_modes)).^2 / total_var;

fprintf('前%d个模态累计解释方差: %.2f%%\n', ...
    n_modes, sum(variance_explained)*100);
end
```

**使用示例**：

```matlab
% 读取SST场并做EOF
sst = load('sst.mat');                              % m×n×t
[eof_spatial, eof_ts, var_exp] = eof_decompose(sst, 3);

% 画EOF1空间型
figure;
pcolor(lon, lat, eof_spatial(:, :, 1).');         % 注意转置
shading flat;
colorbar;
title(sprintf('EOF 1 (解释方差: %.1f%%)', var_exp(1)*100));

% 画PC1时间序列
figure;
plot(time, eof_ts(:, 1), 'b-');
xlabel('时间'); ylabel('PC1');
title('EOF 1 时间系数');
```

### 12.1 North检验（延伸，判断模态是否可分）

```matlab
% 每个模态的标准误差（需计算相邻模态间的耦合误差）
lambda = diag(S(1:n_modes, 1:n_modes)).^2;   % 各模态特征值（方差）

% 抽样误差（Bootstrap或解析近似）
n = size(data_2d, 1);                       % 时间长度
sigma = sqrt(2/n) * lambda;                  % 解析近似误差

% 画特征值柱状图+误差棒
figure;
errorbar(1:n_modes, lambda(1:n_modes), sigma(1:n_modes), 'ko');
hold on;
errorbar(2:n_modes, lambda(2:n_modes), sigma(2:n_modes), 'ks');
% 如果相邻两个误差棒有重叠，说明这两个模态难以区分
```

### 12.2 旋转EOF（延伸，解决EOF不旋转时的类间耦合问题）

```matlab
% Varimax旋转（常用）
% 先做EOF，再对空间型做旋转，使每个格点只受少数几个模态主导
[EOFs_rot, PC_rot] = rotatefactors(eof_spatial_2d, 'Method', 'varimax');

% 旋转后各模态物理意义更清晰，但解释方差不再集中在前几个模态
```

### 12.3 MCA（延伸，两个场的耦合分析）

```matlab
% MCA：两个场同时做EOF，分析它们的耦合模态
% 用于分析SST和Chl的协同变化
[U1, S1, V1] = svd(cov_SST, 'econ');        % 场1协方差阵
[U2, S2, V2] = svd(cov_Chl, 'econ');        % 场2协方差阵

% 交叉协方差矩阵
C = (sst_ts * chl_ts') / (n-1);             % t×t 交叉协方差
[U, S, V] = svd(C, 'econ');

% 左右奇异向量即两场的耦合模态
ssta_coupled = U(:, 1);                      % SST场模态
chla_coupled = V(:, 1);                      % Chl场模态
```

---

# 气候指数篇


---

## 十三、气候指数计算

**一句话**：选关键区 → 区域平均 → 时间序列 → 标准化 → 得指数。

### 13.1 关键区定义

| 指数 | 区域 | 说明 |
|------|------|------|
| ENSO (Nino3.4) | 5°S~5°N, 170°W~120°W | 赤道太平洋海温 |
| PDO | 北太平洋 20°N 以北 | 太平洋年代际振荡 |
| AMO | 大西洋 0°~60°N | 大西洋年代际振荡 |
| NAO | 北大西洋 30°~65°N 气压差 | 北极涛动 |
| IOD | 印度洋西部vs东部 SST 差 | 印度洋偶极子 |
| SAM | 南极涛动（55°S~SST vs 40°S~SST） | 南极涛动 |

### 13.2 ENSO指数完整计算

```matlab
% Nino3.4区索引
nino34_mask = zeros(size(sst));
nino34_mask(lon >= -170 & lon <= -120 & ...
            lat >= -5   & lat <= 5) = 1;

% 区域平均（只对海洋格点）
sst_region = sst .* nino34_mask;
nino34_ts = nanmean(sst_region(:));           % 得到一维时间序列

% 距平
clim_period = (years >= 1982 & years <= 2010);
nino34_clim = mean(nino34_ts(clim_period));
nino34_anom = nino34_ts - nino34_clim;

% 标准化（可选）
nino34_std = std(nino34_ts(clim_period));
nino34_norm = nino34_anom / nino34_std;

% 判断事件
el_nino = nino34_anom > 0.5;                % El Niño（距平>0.5°C）
la_nina  = nino34_anom < -0.5;              % La Niña（距平<-0.5°C）
```

### 13.3 PDO指数

```matlab
% PDO关键区：北太平洋（20°N以北）
pdo_mask = (lon >= 110 & lon <= 260) & (lat >= 20);

% PDO = EOF1 of 北太平洋SST距平（需先做EOF）
% 这里简化用区域平均近似
sst_pdo = sst .* pdo_mask;
pdo_ts = nanmean(sst_pdo(:));
pdo_anom = pdo_ts - mean(pdo_ts);
```

### 13.4 热含量计算

```matlab
rho = 1025;    % 海水密度 kg/m³
Cp = 4186;    % 定压比热容 J/(kg·°C)

% temp: m×n×t×z（第四维是深度）
HC = sum(temp .* rho .* Cp, 4);            % 沿深度积分

% 热含量距平
HC_clim = mean(HC(:, :, clim_idx, :), 3);  % 气候态
HC_anom = HC - HC_clim;                     % 距平

% 200m积分深度（上层海洋热量）
depths = [0, 10, 20, 30, 50, 75, 100, 125, 150, 200];  % 单位m
dz = diff([0, depths]);                             % 各层厚度
HC_200 = sum(sst(:, :, :, 1:length(dz)) .* rho .* Cp .* dz, 4);
```

---

# 辅助功能篇


---

← [信号处理篇](./tutorial-001-005)　　→ [通用模板篇：复合事件到趋势分析](./tutorial-001-007)
