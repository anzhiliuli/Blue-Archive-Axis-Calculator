// 碧蓝档案轴计算器 - 核心应用模块
// 负责应用的整体初始化和模块管理

import Navbar from '../components/navbar.js';
import DataTable from '../components/dataTable.js';
import DataManager from '../managers/dataManager.js';
import Calculator from '../managers/calculator.js';
import ModalManager from '../managers/modalManager.js';
import UIRenderer from '../managers/uiRenderer.js';
import EventListeners from '../managers/eventListeners.js';

class App {
    constructor() {
        this.isInitialized = false;
        this.dataTableInitialized = false;
        this.modules = {};
        this.eventListeners = {};
        this.navbar = null;
        this.tables = {};
        this.initializeApp();
    }

    // 初始化应用
    initializeApp() {
        // 确保DOM加载完成
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initModules());
        } else {
            this.initModules();
        }
    }

    // 初始化所有模块
    initModules() {
        try {
            // 加载工具函数
            this.utils = window.AppUtils;
            
            // 初始化数据管理器
            this.dataManager = new DataManager();
            
            // 初始化计算管理器
            this.calculator = new Calculator(this.dataManager);
            
            // 初始化模态框管理器
            this.modalManager = new ModalManager();
            
            // 初始化UI渲染器
            this.uiRenderer = new UIRenderer(this.dataManager, this.calculator, this);
            
            // 初始化事件监听器
            this.eventListeners = new EventListeners(
                this.dataManager, 
                this.calculator, 
                this.uiRenderer, 
                this.modalManager,
                this
            );
            
            // 创建并初始化导航栏组件
            this.navbar = new Navbar();
            
            // 初始化数据表格
            this.initTables();
            
            // 设置应用为已初始化状态
            this.isInitialized = true;
            
            // 将app实例暴露到全局，以便其他组件访问
            window.appInstance = this;
            
            // 刷新所有UI组件
            this.uiRenderer.refreshAll();
            
            console.log('%c 🚀 碧蓝档案轴计算器初始化成功', 'color: #4F46E5; font-weight: bold;');
        } catch (error) {
            console.error('%c ❌ 应用初始化失败', 'color: #DC2626; font-weight: bold;');
            console.error(error);
            if (this.modalManager) {
                this.modalManager.showToast('应用初始化失败', 'error');
            }
        }
    }

    /**
     * 初始化数据表格
     */
    initTables() {
        // 学生表格配置
        this.tables.characters = new DataTable('charactersTable', [
            { field: 'name', title: '学生名', sortable: true },
            { field: 'costRecoveryRate', title: '回费<br>速度', sortable: true },
            { field: 'skillCost', title: '技能<br>费用', sortable: true },
            { field: 'costIncrease', title: '回费<br>增加', sortable: true },
            { field: 'isChargePercentage', title: '启用<br>回费', sortable: true, render: (item) => {
                return item.isChargePercentage ? '<span class="text-success font-bold">√</span>' : '-';
            }}
        ], {
            showActions: false,
            actions: [
                { icon: 'fa-pencil', text: '编辑', className: 'btn-edit', title: '编辑学生', callback: (item) => this.editCharacter(item) },
                { icon: 'fa-trash', text: '删除', className: 'btn-delete', title: '删除学生', callback: (item) => this.deleteCharacter(item) }
            ]
        });

        // 规则列表使用卡片形式，不使用表格组件
        this.tables.rules = null;

        // 数据项表格配置
        this.tables.dataItems = new DataTable('dataItemsTable', [
            { field: 'id', title: '', sortable: false, render: (item) => {
                // 在时间前显示单选框，用于选择目标行
                return `<input type="radio" name="targetRow" value="${item.id}" class="target-row-radio" data-id="${item.id}">`;
            }},
            { field: 'time', title: '时间', sortable: true, render: (item) => {
                // 初始化行特殊格式化
                if (item.action === '初始化') {
                    return this.utils.format.timeMMSSfff(item.time);
                }
                return this.utils.format.timeMMSSfff(item.time);
            }},
            { field: 'action', title: '动作', sortable: true },
            { field: 'characterId', title: '学生', sortable: true, render: (item) => {
                // 初始化行不显示学生
                if (item.action === '初始化') {
                    return '-';
                }
                const character = this.dataManager.getCharacters().find(c => c.id === item.characterId);
                return character ? character.name : '未知学生';
            }},
            { field: 'cost', title: '触发费用', sortable: true, render: (item) => {
                // 初始化行费用为0
                return item.cost.toFixed(2);
            }},
            { field: 'timeInterval', title: '时间间隔', sortable: true, render: (item) => {
                // 时间间隔显示3位小数
                if (item.action === '初始化') {
                    return item.timeInterval.toFixed(3) + ' s';
                }
                return item.timeInterval.toFixed(3);
            }},
            { field: 'costDeduction', title: '费用扣除', sortable: true, render: (item) => {
                // 初始化行特殊格式化
                if (item.action === '初始化') {
                    return item.costDeduction.toFixed(2) + ' c';
                }
                return item.costDeduction.toFixed(2);
            }},
            { field: 'remainingCost', title: '剩余费用', sortable: true, render: (item) => {
                // 初始化行特殊格式化
                if (item.action === '初始化') {
                    return item.remainingCost.toFixed(2) + ' c';
                }
                return item.remainingCost.toFixed(2);
            }}
        ], {
            showActions: false,
            actions: [
                { icon: 'fa-pencil', text: '编辑', className: 'btn-edit', title: '编辑数据项', callback: (item) => this.editDataItem(item) },
                { icon: 'fa-trash', text: '删除', className: 'btn-delete', title: '删除数据项', callback: (item) => this.deleteDataItem(item) }
            ],
            // 添加单选框事件监听
            onRenderComplete: () => {
                // 为所有目标行单选框添加事件监听
                const radioButtons = document.querySelectorAll('.target-row-radio');
                radioButtons.forEach(radio => {
                    radio.addEventListener('change', (e) => {
                        // 保存选中的目标行ID
                        window.selectedTargetRowId = parseInt(e.target.value);
                        
                        // 获取选中的数据项
                        const dataItem = this.dataManager.dataItems.find(item => item.id === window.selectedTargetRowId);
                        if (dataItem) {
                            // 计算当前时间点的回费速度
                            const currentTime = dataItem.time;
                            const totalRecoveryRate = this.calculator.calculateTotalRecoveryRate(currentTime);
                            
                            // 显示回费速度
                            const speedElement = document.getElementById('currentChargeSpeed');
                            if (speedElement) {
                                speedElement.textContent = `${totalRecoveryRate.toFixed(4)} c/s`;
                            }
                        }

                    });
                });
            }
        });
        
        // 数据表格组件创建完成，但数据表尚未初始化
        // 初始化状态将在用户点击"初始化数据表"按钮后设置
    }

    /**
     * 编辑学生
     * @param {Object} character - 学生数据
     */
    editCharacter(character) {
        // 调用模态框管理器显示编辑学生的模态框
        this.modalManager.showModal('editCharacterModal', character);
    }

    /**
     * 删除学生
     * @param {Object} character - 学生数据
     */
    deleteCharacter(character) {
        this.modalManager.showConfirmModal(
            '删除学生',
            `确定要删除学生 "${character.name}" 吗？此操作不可撤销。`,
            () => {
                this.dataManager.deleteCharacter(character.id);
                this.uiRenderer.refreshAll();
                this.modalManager.showToast(`学生 "${character.name}" 已成功删除`, 'success');
            }
        );
    }

    /**
     * 编辑规则
     * @param {Object} rule - 规则数据
     */
    editRule(rule) {
        this.modalManager.showModal('editRuleModal', rule);
    }

    /**
     * 删除规则
     * @param {Object} rule - 规则数据
     */
    deleteRule(rule) {
        this.modalManager.showConfirmModal(
            '删除规则',
            `确定要删除此规则吗？此操作不可撤销。`,
            () => {
                this.dataManager.deleteRule(rule.id);
                this.uiRenderer.renderRuleList();
                this.modalManager.showToast('规则已成功删除', 'success');
            }
        );
    }

    /**
     * 编辑数据项
     * @param {Object} dataItem - 数据项数据
     */
    editDataItem(dataItem) {
        this.modalManager.showModal('editDataItemModal', dataItem);
    }

    /**
     * 删除数据项
     * @param {Object} dataItem - 数据项数据
     */
    deleteDataItem(dataItem) {
        this.modalManager.showConfirmModal(
            '删除数据项',
            `确定要删除此数据项吗？此操作不可撤销。`,
            () => {
                this.dataManager.deleteDataItem(dataItem.id);
                this.uiRenderer.refreshAll();
                this.modalManager.showToast('数据项已成功删除', 'success');
            }
        );
    }

    // 检查应用是否已初始化
    isAppInitialized() {
        return this.isInitialized;
    }

    // 检查数据表是否已初始化
    isDataTableInitialized() {
        return this.dataTableInitialized;
    }

    // 设置数据表初始化状态
    setDataTableInitialized(initialized) {
        this.dataTableInitialized = initialized;
        // 更新UI状态显示
        const initStatusElement = document.getElementById('initStatus');
        if (initStatusElement) {
            initStatusElement.textContent = initialized ? '已初始化' : '未初始化';
            initStatusElement.className = `font-medium ${initialized ? 'text-success' : 'text-danger'}`;
        }
    }

    // 获取指定模块
    getModule(moduleName) {
        return this[moduleName] || null;
    }

    // 更新应用状态信息
    updateStatusInfo() {
        if (this.uiRenderer) {
            this.uiRenderer.updateStatusInfo();
        }
    }

    // 注册自定义模块
    registerModule(moduleName, moduleInstance) {
        this.modules[moduleName] = moduleInstance;
    }
    
    // 查看附加数据
    viewAdditionalData(dataItemId) {
        this.eventListeners.viewAdditionalData(dataItemId);
    }
}

// 导出App类作为默认导出
export default App;