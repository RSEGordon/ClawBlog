---
title: 彩笔教程 · 001-002 - MATLAB基本操作与文件路径
date: 2026-05-27
tags: [MATLAB, 教程, 基础]
categories: [彩笔教程]
description: MATLAB以矩阵为基本单位，所有数据都是n维数组。配合文件路径与批量处理完整函数。
cover: /images/cover-tut-001-002.png
---

> 本章介绍MATLAB基本操作和文件路径管理，配套完整可运行代码。后续分析均建立在此基础上。

## 一、MATLAB基本操作

**一句话**：MATLAB以矩阵为基本单位，所有数据都是n维数组。

### 1.1 创建向量和矩阵

```matlab
% 行向量
row = [1, 2, 3];          % [1 2 3]

% 列向量（分号=换行）
col = [1; 2; 3];           % 3×1 列向量

% 序列
vec = 1:3;                % [1 2 3]，步长默认1
vec = 1:2:10;             % [1 3 5 7 9]，步长2
vec = linspace(0, 10, 5);  % [0 2.5 5 7.5 10]，线性等分

% 创建常数矩阵
zeros(3);                 % 3×3 全零
ones(3, 4);               % 3×4 全1
nan(3, 4);                % 3×4 全NaN
rand(3, 4);               % 3×4 [0,1]均匀随机
randn(3, 4);              % 3×4 标准正态随机
eye(3);                   % 3×3 单位阵
diag([1,2,3]);            % 对角阵
```

### 1.2 索引和切片

```matlab
A = reshape(1:12, 3, 4);  % 创建 3×4 矩阵，元素1~12

A(2, 3);                   % 第2行第3列的元素 → 8
A(:, 2);                   % 第2列所有行 → 列向量
A(3, :);                   % 第3行所有列 → 行向量
A(1:2, 2:4);              % 第1-2行，第2-4列 → 2×3 子矩阵

% 逻辑索引（找满足条件的元素）
A(A > 5);                  % A中大于5的所有元素
A(A > 5) = 0;             % A中大于5的元素全部设为0

% find：返回满足条件的索引
idx = find(A > 5);        % 返回索引向量
[row, col] = find(A > 5); % 返回行列索引
```

### 1.3 维度操作

```matlab
A = rand(3, 4, 10);       % 3×4×10 三维数组

squeeze(A);               % 去掉维度为1的维度
reshape(A, 12, 10);       % 重塑为 12×10
transpose(A);              % 转置（仅最前两维）
A.';                       % 非共轭转置
' ;                        % 共轭转置（复数用）

% 拼接
[1, 2, 3; 4, 5, 6];      % 2×3 矩阵
cat(3, A, B);             % 在第3维拼接A和B
horzcat(A, B);             % 水平拼接（列数相同）
vertcat(A, B);             % 垂直拼接（行数相同）
```

### 1.4 常用统计函数

```matlab
x = [1, 2, nan, 4, 5];

nanmean(x);               % 忽略NaN的均值
nanstd(x);                % 忽略NaN的标准差
nanmin(x); nanmax(x);     % 忽略NaN的极值
nansum(x);                % 忽略NaN求和
nanmedian(x);             % 忽略NaN的中位数

mean(x);                  % 含NaN会返回NaN
mean(x, 'omitnan');       % 等价于nanmean

skewness(x);              % 偏度
kurtosis(x);              % 峰度
corrcoef(x, y);           % 相关系数矩阵

quantile(x, 0.9);         % 90th百分位
prctile(x, 90);           % 同上（另一种写法）
```

### 1.5 日期处理

```matlab
% datenum：日期转数字（天数，MATLAB内部格式）
datenum(2023, 1, 15);     % 2023年1月15日 → 数字
datenum('2023-01-15');    % 字符串格式也可以

% datestr：数字转字符串
datestr(datenum(2023,1,15), 'yyyy-mm-dd');  % '2023-01-15'
datestr(datenum(2023,1,15), 'yyyymmdd');    % '20230115'

% datetime：日期对象（现代MATLAB推荐）
dt = datetime(2023, 1, 15);
dt = datetime('2023-01-15');

% 提取年月日
year(dt); month(dt); day(dt);              % 2023, 1, 15
day(dt, 'dayofyear');                       % 年的第几天

% 日期运算
dt + 30;                                   % 加30天
diff([dt1, dt2]);                          % 两日期相差天数

% datenum转datetime
dt = datetime(datenum(2023, 1, 15));
```

### 1.6 字符串处理

```matlab
str = '海洋数据';

sprintf('%s_%04d_%02d', 'chl', 2023, 1);  % 'chl_2023_01'
fullfile('data', 'chl', 'chl.mat');        % 跨平台路径拼接

% 判断是否存在
exist('data.mat', 'file');                % 2=存在文件

% 批量构造文件名
for year = 2012:2021
    fname = sprintf('chl_%d_11.tif', year);
    disp(fname);
end
```

---


---

## 十四、文件路径与批量处理

```matlab
% 文件是否存在检查
if ~exist('data/chl.mat', 'file')
    error('数据文件不存在');
end

% 递归扫描某目录下的所有文件
file_list = dir(fullfile(data_path, '**', '*.mat'));
file_list = file_list(~[file_list.isdir]);

% 批量读取某目录下所有tif
files = dir(fullfile(data_dir, '*.tif'));
for k = 1:length(files)
    data = imread(fullfile(data_dir, files(k).name));
    % ...
end
```

### 14.1 并行计算加速

```matlab
% 逐像元循环非常慢，用parfor加速
parfor lat = 1:144
    for lon = 1:132
        % ……
    end
end

% 多核启动
parpool(4);                                 % 启动4核
delete(gcp('nocreate'));                    % 关闭
```

### 14.2 数据路径检查

```matlab
dataPath = fullfile(pwd, 'data');
folders = dir(dataPath);
folders = folders([folders.isdir]);
folders = folders(~ismember({folders.name}, {'.', '..'}));

for i = 1:length(folders)
    folderPath = fullfile(dataPath, folders(i).name);
    files = dir(fullfile(folderPath, '*.*'));
    files = files(~[files.isdir]);
    fprintf('\n%s: %d 个文件\n', folders(i).name, length(files));
    for j = 1:min(5, length(files))
        fprintf('  %s\n', files(j).name);
    end
end
```

---


---

← [返回学习路线总览](./tutorial-001-001)　　→ [数据IO篇：数据读取与写入](./tutorial-001-003)
