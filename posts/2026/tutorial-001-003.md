---
title: 彩笔教程 · 003 - Matlab入门到入土·数据IO
date: 2026-05-27 14:32:00
tags: [MATLAB, 教程, 数据IO]
categories: [彩笔教程]
description: Read_MatrixData完整函数 + 数据写入导出（TIFF/CSV/NetCDF）+ 常用数据插值方法。
cover: /images/covers/cover-tut-001-003.png
---

> 数据是分析的起点。本章覆盖从文件读取、格式转换到插值填补的完整数据处理流程。

## 二、数据读取完整函数（Read_MatrixData.m）

**一句话**：根据数据类型和月份，从固定目录读取.mat文件，返回矩阵+经纬度。

```matlab
function [matrix_data, lat, lon] = Read_MatrixData(data_type, month)
%% 从各数据目录读取 .mat 文件
% 输入：data_type — 'chl'|'par'|'sss'|'sst'|'sstgrd'|'tp'|'wd'
%       month    — 11 或 12
% 输出：matrix_data (38×76×10)，lat, lon

% 参数校验
valid_types = {'chl', 'par', 'sss', 'sst', 'sstgrd', 'tp', 'wd'};
if ~ismember(data_type, valid_types)
    error('不支持的类型，可用：%s', strjoin(valid_types, ', '));
end
if ~ismember(month, [11, 12])
    error('月份必须是 11 或 12');
end

% 根据类型构造文件路径
switch data_type
    case 'chl'
        data_file = sprintf('data/chl/chl%d_interpolated.mat', month);
        lat_file  = 'data/chl/chl_lat.mat';
        lon_file  = 'data/chl/chl_lon.mat';
    case 'par'
        data_file = sprintf('data/par/par_interpolated_%d.mat', month);
        lat_file  = sprintf('data/par/new_lat_%d.mat', month);
        lon_file  = sprintf('data/par/new_lon_%d.mat', month);
    case 'sss'
        data_file = sprintf('data/sss/s_%d_interpolated.mat', month);
        lat_file  = sprintf('data/sss/s_lat_%d.mat', month);
        lon_file  = sprintf('data/sss/s_lon_%d.mat', month);
    case 'sst'
        data_file = sprintf('data/sst/sst_interpolated_%d.mat', month);
        lat_file  = sprintf('data/sst/sst_lat_%d.mat', month);
        lon_file  = sprintf('data/sst/sst_lon_%d.mat', month);
    case 'sstgrd'
        data_file = sprintf('data/sstgrd/sst_interpolated_gradient_magnitude_%d.mat', month);
        lat_file  = sprintf('data/sstgrd/sst_lat_gradient_magnitude_%d.mat', month);
        lon_file  = sprintf('data/sstgrd/sst_lon_gradient_magnitude_%d.mat', month);
    case 'tp'
        data_file = sprintf('data/tp/tp_interpolated_%d.mat', month);
        lat_file  = sprintf('data/tp/tp_lat_%d.mat', month);
        lon_file  = sprintf('data/tp/tp_lon_%d.mat', month);
    case 'wd'
        data_file = sprintf('data/wd/P_interpolated_%d.mat', month);
        lat_file  = sprintf('data/wd/P_lat_%d.mat', month);
        lon_file  = sprintf('data/wd/P_lon_%d.mat', month);
end

% 读取并提取变量
data   = load(data_file);
lat_d  = load(lat_file);
lon_d  = load(lon_file);

vars   = fieldnames(data);
matrix_data = data.(vars{1});          % 第一个字段即数据矩阵

lat_vars = fieldnames(lat_d);
lon_vars = fieldnames(lon_d);
lat = lat_d.(lat_vars{1});
lon = lon_d.(lon_vars{1});

% 打印基本信息
fprintf('类型: %s  月份: %d  尺寸: %s\n', data_type, month, mat2str(size(matrix_data)));
fprintf('范围: lat[%.2f, %.2f]  lon[%.2f, %.2f]\n', ...
    min(lat(:)), max(lat(:)), min(lon(:)), max(lon(:)));
end
```

**使用示例**：

```matlab
% 读取叶绿素 2012-2021年11月数据
[chl, lat, lon] = Read_MatrixData('chl', 11);
size(chl)  % → [38, 76, 10]，第三维=年份（2012起）

% 取某一年的二维场
chl_2021 = chl(:, :, 10);        % 2021年
imagesc(lon, lat, chl_2021);      % 画填色图
colorbar;
```

---


---

## 三、数据写入和导出

### 3.1 TIFF/GeoTIFF（遥感栅格数据）

```matlab
% 基本TIFF（无地理信息）
imwrite(uint16(data), 'output.tif');

% GeoTIFF（含地理坐标，WGS84）
R = georasterref('RasterSize', size(data), ...
    'Latlim', [min(lat(:)), max(lat(:))], ...
    'Lonlim', [min(lon(:)), max(lon(:))]);
geotiffwrite('output.tif', data, R, 'CoordRefSysCode', 4326);

% 读取时保持类型
data = imread('output.tif');     % 默认读成对应类型（uint8/uint16）
data = double(imread('output.tif'));  % 通常转double再处理
```

### 3.2 CSV/表格

```matlab
% 结构数组写入CSV
writetable(array2table(data, 'VariableNames', {'A', 'B', 'C'}), 'data.csv');

% CSV读回
T = readtable('data.csv');

% 带分隔符的文本
writematrix(data, 'data.txt', 'Delimiter', '\t');
```

### 3.3 MAT文件

```matlab
% 保存单个变量
save('chl.mat', 'chl');

% 保存多个变量
save('analysis.mat', 'chl', 'lat', 'lon', 'results');

% 读取
load('chl.mat');

% 判断是否已加载
if ~exist('chl', 'var')
    load('chl.mat');
end
```

### 3.4 批量tif转GeoTIFF

```matlab
data_types = {'chl', 'par', 'sss', 'sst', 'sstgrd', 'tp', 'wd'};
years = 2012:2021;
months = [11, 12];
output_dir = 'output_tiff';

for i = 1:length(data_types)
    data_type = data_types{i};
    type_dir = fullfile(output_dir, data_type);
    if ~exist(type_dir, 'dir'); mkdir(type_dir); end

    for month = months
        [matrix_data, lat, lon] = Read_MatrixData(data_type, month);

        for yi = 1:length(years)
            year = years(yi);
            data = double(squeeze(matrix_data(:, :, yi)));
            R = georasterref('RasterSize', size(data), ...
                'Latlim', [min(lat(:)), max(lat(:))], ...
                'Lonlim', [min(lon(:)), max(lon(:))]);
            filename = sprintf('%s_%d_%02d.tif', data_type, year, month);
            geotiffwrite(fullfile(type_dir, filename), data, R, ...
                'CoordRefSysCode', 4326);
        end
    end
end
```

---


---

### 十五、数据插值

## 十五、数据插值

```matlab
% 线性插值（填补缺失值）
data_filled = interp2(lon, lat, data.', xi, yi, 'linear');

% 三次样条插值
data_filled = interp2(lon, lat, data.', xi, yi, 'spline');

% 网格化（不规则散点→规则网格）
F = scatteredInterpolant(lon(:), lat(:), data(:));
[x_grid, y_grid] = meshgrid(lon, lat);
data_grid = F(x_grid, y_grid);

% 年际数据：每年独立插值
for yi = 1:length(years)
    data_year = data(:, :, yi);
    data_filled(:, :, yi) = interp2(lon, lat, data_year.', xi, yi, 'linear');
end
```

---


---

← [基础入门篇](./tutorial-001-002)　　→ [可视化篇：绘图、峰谷、水华](./tutorial-001-004)
