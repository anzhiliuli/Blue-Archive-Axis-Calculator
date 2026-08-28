// 系统入口文件 - 负责加载和初始化所有模块
// 注意：数据加载与UI刷新统一在 App.initModules() 中完成（单一初始化路径），
// 此处仅负责挂载全局工具与应用实例，避免重复的全量刷新。

// 加载工具函数
import { AppUtils } from './utils/helpers.js';

// 加载核心应用
import App from './core/app.js';

// 初始化全局工具函数
window.AppUtils = AppUtils;

// 创建应用实例并挂载到window对象
// module脚本在DOM解析完成后执行，App构造函数会同步完成初始化（含本地数据加载与首次渲染）
window.App = new App();

// 开发环境提示
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('%c 🚀 碧蓝档案轴计算器 - 开发模式已启用', 'color: #4F46E5; font-weight: bold;');
    console.log('使用 debugApp() 函数查看应用状态');
}
