// 工具函数模块
const AppUtils = {
    // 数据验证函数
    validate: {
        // 检查是否为数字
        isNumber: (value) => {
            return typeof value === 'number' && !isNaN(value);
        },

        // 检查是否为有效数字字符串
        isNumberString: (value) => {
            return typeof value === 'string' && !isNaN(parseFloat(value)) && isFinite(value);
        },

        // 检查是否为字符串
        isString: (value) => {
            return typeof value === 'string';
        },

        // 检查是否为非空字符串
        isNonEmptyString: (value) => {
            return typeof value === 'string' && value.trim().length > 0;
        },

        // 检查是否为对象
        isObject: (value) => {
            return value !== null && typeof value === 'object' && Array.isArray(value) === false;
        },

        // 检查是否为数组
        isArray: (value) => {
            return Array.isArray(value);
        },

        // 检查数组是否为空
        isEmptyArray: (value) => {
            return Array.isArray(value) && value.length === 0;
        },

        // 检查对象是否为空
        isEmptyObject: (value) => {
            return AppUtils.validate.isObject(value) && Object.keys(value).length === 0;
        },

        // 检查是否为布尔值
        isBoolean: (value) => {
            return typeof value === 'boolean';
        },

        // 检查是否为函数
        isFunction: (value) => {
            return typeof value === 'function';
        },

        // 检查是否为有效的ID（正数）
        isValidId: (value) => {
            return AppUtils.validate.isNumber(value) && value > 0;
        }
    },

    // 格式化函数
    format: {
        // 格式化数字为指定小数位数
        number: (value, decimals = 2) => {
            const num = parseFloat(value);
            return isNaN(num) ? '0' : num.toFixed(decimals);
        },

        // 格式化百分比
        percentage: (value, decimals = 1) => {
            const num = parseFloat(value);
            return isNaN(num) ? '0%' : (num * 100).toFixed(decimals) + '%';
        },

        // 格式化时间（秒）
        time: (seconds) => {
            const num = parseFloat(seconds);
            if (isNaN(num)) return '0.0s';
            return num.toFixed(1) + 's';
        },

        // 格式化时间为MM:SS.fff格式（支持负数时间）
        timeMMSSfff: (seconds) => {
            const num = parseFloat(seconds);
            if (isNaN(num)) return '00:00.000';

            const sign = num < 0 ? '-' : '';
            const absNum = Math.abs(num);
            const totalSeconds = Math.floor(absNum);
            const milliseconds = Math.floor((absNum - totalSeconds) * 1000);
            const minutes = Math.floor(totalSeconds / 60);
            const secs = totalSeconds % 60;

            return `${sign}${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(milliseconds).padStart(3, '0')}`;
        },

        // 格式化日期
        date: (date, format = 'YYYY-MM-DD') => {
            const d = new Date(date);
            if (isNaN(d.getTime())) return '';

            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            const hours = String(d.getHours()).padStart(2, '0');
            const minutes = String(d.getMinutes()).padStart(2, '0');
            const seconds = String(d.getSeconds()).padStart(2, '0');

            return format
                .replace('YYYY', year)
                .replace('MM', month)
                .replace('DD', day)
                .replace('HH', hours)
                .replace('mm', minutes)
                .replace('ss', seconds);
        },

        // 格式化文件大小
        fileSize: (bytes) => {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        }
    },

    // API集成
    api: {
        // jsonbin.io配置
        jsonbin: {
            baseUrl: 'https://api.jsonbin.io/v3',
            // 使用用户提供的X-MASTER-KEY
            apiKey: '$2a$10$BfUJi/KfceOKTukyQz7cIe4KlbXEaqR8ZJp4UPbCRAwq8sIXSGaNW',
            binId: null
        },
        
        // 通用请求方法
        request: async (url, options = {}) => {
            try {
                const response = await fetch(url, {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Master-Key': AppUtils.api.jsonbin.apiKey,
                        ...options.headers
                    },
                    ...options
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                return await response.json();
            } catch (error) {
                console.error('API请求错误:', error);
                throw error;
            }
        },
        
        // 生成识别码（将数据存储到jsonbin.io）
        generateShareId: async (data) => {
            try {
                const url = `${AppUtils.api.jsonbin.baseUrl}/b`;
                const response = await AppUtils.api.request(url, {
                    method: 'POST',
                    body: JSON.stringify(data)
                });
                
                // 返回生成的bin ID作为识别码
                return response.metadata.id;
            } catch (error) {
                console.error('生成识别码失败:', error);
                throw error;
            }
        },
        
        // 从识别码获取数据
        getShareData: async (shareId) => {
            try {
                const url = `${AppUtils.api.jsonbin.baseUrl}/b/${shareId}/latest`;
                const response = await AppUtils.api.request(url, {
                    method: 'GET'
                });
                
                return response.record;
            } catch (error) {
                console.error('获取共享数据失败:', error);
                throw error;
            }
        }
    },

    // DOM操作辅助函数
    dom: {
        // 创建DOM元素
        createElement: (tagName, attributes = {}, children = []) => {
            const element = document.createElement(tagName);

            // 设置属性
            Object.keys(attributes).forEach(key => {
                if (key === 'className') {
                    element.className = attributes[key];
                } else if (key === 'innerHTML') {
                    element.innerHTML = attributes[key];
                } else if (key === 'textContent') {
                    element.textContent = attributes[key];
                } else {
                    element.setAttribute(key, attributes[key]);
                }
            });

            // 添加子元素
            children.forEach(child => {
                if (typeof child === 'string' || typeof child === 'number') {
                    element.appendChild(document.createTextNode(child));
                } else if (child instanceof Node) {
                    element.appendChild(child);
                }
            });

            return element;
        },

        // 获取元素
        get: (selector, parent = document) => {
            return parent.querySelector(selector);
        },

        // 获取多个元素
        getAll: (selector, parent = document) => {
            return Array.from(parent.querySelectorAll(selector));
        },

        // 添加事件监听器
        on: (element, event, handler, options = {}) => {
            element.addEventListener(event, handler, options);
        },

        // 移除事件监听器
        off: (element, event, handler, options = {}) => {
            element.removeEventListener(event, handler, options);
        },

        // 显示元素
        show: (element) => {
            element.style.display = '';
        },

        // 隐藏元素
        hide: (element) => {
            element.style.display = 'none';
        },

        // 切换元素显示/隐藏
        toggle: (element) => {
            if (element.style.display === 'none') {
                AppUtils.dom.show(element);
            } else {
                AppUtils.dom.hide(element);
            }
        },

        // 添加类
        addClass: (element, className) => {
            element.classList.add(className);
        },

        // 移除类
        removeClass: (element, className) => {
            element.classList.remove(className);
        },

        // 切换类
        toggleClass: (element, className) => {
            element.classList.toggle(className);
        },

        // 检查元素是否有类
        hasClass: (element, className) => {
            return element.classList.contains(className);
        },

        // 设置元素样式
        setStyle: (element, styles) => {
            Object.assign(element.style, styles);
        },

        // 获取元素样式
        getStyle: (element, property) => {
            return window.getComputedStyle(element).getPropertyValue(property);
        }
    },

    // 数组处理函数
    array: {
        // 打乱数组
        shuffle: (array) => {
            const newArray = [...array];
            for (let i = newArray.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
            }
            return newArray;
        },

        // 去重
        unique: (array) => {
            return [...new Set(array)];
        },

        // 查找最大值
        max: (array) => {
            return Math.max(...array);
        },

        // 查找最小值
        min: (array) => {
            return Math.min(...array);
        },

        // 计算平均值
        average: (array) => {
            if (array.length === 0) return 0;
            const sum = array.reduce((acc, val) => acc + val, 0);
            return sum / array.length;
        },

        // 根据属性排序
        sortByProperty: (array, property, order = 'asc') => {
            return [...array].sort((a, b) => {
                if (order === 'asc') {
                    return a[property] > b[property] ? 1 : -1;
                } else {
                    return a[property] < b[property] ? 1 : -1;
                }
            });
        }
    },

    // 对象处理函数
    object: {
        // 深度克隆对象
        deepClone: (obj) => {
            if (obj === null || typeof obj !== 'object') return obj;
            if (obj instanceof Date) return new Date(obj.getTime());
            if (Array.isArray(obj)) return obj.map(item => AppUtils.object.deepClone(item));
            const clonedObj = {};
            for (const key in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, key)) {
                    clonedObj[key] = AppUtils.object.deepClone(obj[key]);
                }
            }
            return clonedObj;
        },

        // 合并对象
        merge: (target, ...sources) => {
            return Object.assign(target, ...sources);
        },

        // 检查对象是否包含所有指定属性
        hasAllProperties: (obj, properties) => {
            return properties.every(prop => obj.hasOwnProperty(prop));
        }
    },

    // 安全处理函数（防XSS）
    security: {
        // HTML转义：将用户输入/导入数据安全地嵌入 innerHTML 前必须调用
        escapeHtml: (value) => {
            if (value === null || value === undefined) return '';
            return String(value)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
        },

        // 校验URL是否安全（仅允许 http/https/相对路径，阻止 javascript: 等注入）
        isSafeUrl: (url) => {
            if (typeof url !== 'string' || !url.trim()) return false;
            const normalized = url.trim().toLowerCase().replace(/[\s\u0000-\u001F]/g, '');
            if (normalized.startsWith('javascript:') || normalized.startsWith('data:') || normalized.startsWith('vbscript:')) {
                return false;
            }
            return /^(https?:\/\/|\/|\.\/|\.\.\/|#)/.test(normalized) || !/:/.test(normalized);
        }
    },

    // 字符串处理函数
    string: {
        // 生成随机字符串
        random: (length = 8) => {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            let result = '';
            for (let i = 0; i < length; i++) {
                result += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return result;
        },

        // 首字母大写
        capitalize: (str) => {
            return str.charAt(0).toUpperCase() + str.slice(1);
        },

        // 驼峰式命名转换为短横线分隔
        camelToKebab: (str) => {
            return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
        },

        // 短横线分隔转换为驼峰式命名
        kebabToCamel: (str) => {
            return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
        }
    },

    // 时间处理函数
    time: {
        // 延迟执行
        delay: (ms) => {
            return new Promise(resolve => setTimeout(resolve, ms));
        },

        // 防抖函数
        debounce: (func, wait) => {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        },

        // 节流函数
        throttle: (func, limit) => {
            let inThrottle;
            return function() {
                const args = arguments;
                const context = this;
                if (!inThrottle) {
                    func.apply(context, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            };
        }
    },

    // 存储函数
    storage: {
        // 设置本地存储
        setLocal: (key, value) => {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (error) {
                console.error('设置本地存储失败:', error);
                return false;
            }
        },

        // 获取本地存储
        getLocal: (key) => {
            try {
                const value = localStorage.getItem(key);
                return value ? JSON.parse(value) : null;
            } catch (error) {
                console.error('获取本地存储失败:', error);
                return null;
            }
        },

        // 删除本地存储
        removeLocal: (key) => {
            try {
                localStorage.removeItem(key);
                return true;
            } catch (error) {
                console.error('删除本地存储失败:', error);
                return false;
            }
        },

        // 清空本地存储
        clearLocal: () => {
            try {
                localStorage.clear();
                return true;
            } catch (error) {
                console.error('清空本地存储失败:', error);
                return false;
            }
        }
    },

    // 颜色函数
    color: {
        // 生成随机颜色
        random: () => {
            const letters = '0123456789ABCDEF';
            let color = '#';
            for (let i = 0; i < 6; i++) {
                color += letters[Math.floor(Math.random() * 16)];
            }
            return color;
        },

        // 十六进制颜色转RGB
        hexToRgb: (hex) => {
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : null;
        },

        // RGB颜色转十六进制
        rgbToHex: (r, g, b) => {
            return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
        }
    }
};

// 导出工具函数
export { AppUtils };

// 同时挂载到window对象（用于全局访问）
window.AppUtils = AppUtils;
