---
title: 彩笔教程 · 005 - Matlab入门到入土·信号处理
date: 2026-05-27 14:34:00
tags: [MATLAB, 教程, 信号处理]
categories: [彩笔教程]
description: 数据偏态处理（对数变换）+ FFT频域降噪完整可运行代码。
cover: /images/covers/cover-tut-001-005.png
---

> 信号处理两步走：先看分布是否偏态，再决定要不要频域降噪。

## 五、偏态检测与对数变换

**一句话**：数据偏态严重时（|偏度|>0.5）做对数变换，让分布接近正态。

### 5.1 偏态检测

```matlab
sk = skewness(data(:));          % 偏度：正值=右偏（长尾在高值）
if abs(sk) > 0.5
    disp('数据偏态严重，需要变换');
end

% 偏度<0（左偏/负偏）通常不需要变换处理
% 只有右偏数据才需要log变换
```

### 5.2 对数变换

```matlab
% 正常情况
data_log = log(data);

% 有零或负值时：先平移再取对数
min_val = min(data(:));
if min_val <= 0
    data_log = log(data - min_val + 1);
end

% 有极值时：可先做log10变换再处理
data_log = log10(data + 1);

% Box-Cox变换（自动选最优λ，需Statistics Toolbox）
[data_bc, lambda] = boxcox(data(data>0));
```

### 5.3 归一化到[0,1]

```matlab
data_norm = (data - min(data(:))) / (max(data(:)) - min(data(:)));
```

### 5.4 标准化（Z-score）

```matlab
data_std = (data - mean(data(:))) / std(data(:)));
% → 均值0，标准差1

% MATLAB内置
data_std = zscore(data);
```

### 5.5 NaN处理策略

```matlab
% 去除含NaN的行（用于建模）
valid = ~any(isnan([X y]), 2);
X_clean = X(valid, :);
y_clean = y(valid);

% NaN填充（插值）
data_filled = fillmissing(data, 'linear');   % 线性插值
data_filled = fillmissing(data, 'pchip');   % 三次插值
data_filled = fillmissing(data, 'spline');  % 样条插值
data_filled = inpaint_nans(data, 4);        % NaN插值（需要工具箱）

% 判断是否有NaN
any(isnan(data(:)))                         % true/false
nnz(isnan(data(:)))                         % NaN数量
```

### 5.6 异常值检测

```matlab
% 基于IQR的异常值标记
Q1 = quantile(data(:), 0.25);
Q3 = quantile(data(:), 0.75);
IQR = Q3 - Q1;
lower = Q1 - 1.5 * IQR;
upper = Q3 + 1.5 * IQR;

outlier_idx = data < lower | data > upper;
data_clean = data;
data_clean(outlier_idx) = NaN;              % 异常值→NaN

% 基于Z-score的异常值标记
zscore_data = zscore(data(:));
outlier_idx = abs(zscore_data) > 3;         % |Z|>3 视为异常
```

---

# 水华识别篇


---

## 六、FFT降噪（完整可运行代码）

**一句话**：把时间序列变到频域，扔掉高频分量，再变回来得到平滑信号。

```matlab
function [smoothed, recon_fft] = fft_denoise(A, num_coef)
%% FFT降噪
% 输入：A        — 叶绿素时间序列（列向量）
%       num_coef — 保留的傅里叶系数数量（通常30）
% 输出：smoothed — 去噪后的信号（实部）
%       recon_fft — 重建后的完整FFT（用于调试）

N = length(A);                             % 序列长度

signal_fft = fft(A);                        % FFT → 频域

% 重建：只保留前num_coef和后num_coef个低频系数
recon_fft = signal_fft;
recon_fft(num_coef+1 : N-num_coef+1) = 0;  % 高频→零

% 逆FFT变回时域，取实部（虚部为数值误差）
smoothed = real(ifft(recon_fft));
end
```

**调用**：

```matlab
A = chl_timeseries;                % 原始序列
num_coef = 30;                     % 9年月均数据（506点）通常用30
A_smooth = fft_denoise(A, num_coef);

% 可视化对比
figure;
subplot(2,1,1); plot(A); title('原始');
subplot(2,1,2); plot(A_smooth); title('FFT去噪后');
```

**参数说明**：

| num_coef | 效果 |
|----------|------|
| 5~10 | 极平滑，可能失真 |
| 20~30 | 平衡（9年月均数据推荐） |
| 50~100 | 接近原始信号 |

### 6.1 频谱分析（延伸）

```matlab
% 计算功率谱
N = length(A);
Y = fft(A - mean(A));                     % 去均值后FFT
P2 = abs(Y).^2 / N;                       % 功率谱
P1 = P2(1:N/2+1);                         % 只取正频率
P1(2:end-1) = 2 * P1(2:end-1);            % 单边谱

freq = (0:N/2) / N;                       % 频率轴

figure;
plot(freq, P1, 'b-');
xlabel('频率'); ylabel('功率');
title('功率谱密度');
```

### 6.2 其他滤波方法（延伸）

```matlab
% 滑动平均（简单但会模糊边缘）
window = 5;                                % 窗口大小
A_movmean = movmean(A, window);

% 中值滤波（去除尖峰异常值效果好）
A_medfilt = medfilt1(A, 5);

% Butterworth低通滤波器（频率域设计）
fs = 1;                                    % 采样频率
fc = 0.05;                                 % 截止频率
[b, a] = butter(4, fc/(fs/2));             % 4阶低通
A_butter = filtfilt(b, a, A);             % 零相位滤波

% Savitzky-Golay平滑（保持峰形）
A_sgolay = sgolayfilt(A, 3, 7);           % 3次多项式，窗口7
```

---


---

← [可视化篇](./tutorial-001-004)　　→ [分析方法篇：detect/MHW/随机森林/EOF](./tutorial-001-006)
