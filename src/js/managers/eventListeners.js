// 事件监听器模块
class EventListeners {
    constructor(dataManager, calculator, uiRenderer, modalManager, app) {
        this.dataManager = dataManager;
        this.calculator = calculator;
        this.uiRenderer = uiRenderer;
        this.modalManager = modalManager;
        this.app = app;
        this.currentTargetRowId = null;
        this.initAllListeners();
    }

    // 初始化所有事件监听器
    initAllListeners() {
        // 直接初始化监听器，因为App类已经确保DOM加载完成
        this.initCharacterListeners();
        this.initRuleListeners();
        this.initDataItemListeners();
        this.initGeneralListeners();
    }

    // 初始化角色相关事件监听器
    initCharacterListeners() {
        // 添加角色按钮
        const addCharacterBtn = document.getElementById('add-character-btn');
        if (addCharacterBtn) {
            addCharacterBtn.addEventListener('click', () => this.showAddCharacterModal());
        }

        // 编辑角色按钮（动态添加，使用事件委托）
        const characterList = document.getElementById('charactersTable');
        if (characterList) {
            characterList.addEventListener('click', (e) => {
                if (e.target.closest('.edit-character')) {
                    const btn = e.target.closest('.edit-character');
                    const characterId = parseInt(btn.dataset.id);
                    this.showEditCharacterModal(characterId);
                } else if (e.target.closest('.delete-character')) {
                    const btn = e.target.closest('.delete-character');
                    const characterId = parseInt(btn.dataset.id);
                    this.confirmDeleteCharacter(characterId);
                }
            });
        }

        // 添加角色表单提交
        const addCharacterForm = document.getElementById('addCharacterForm');
        if (addCharacterForm) {
            addCharacterForm.addEventListener('submit', (e) => this.handleAddCharacter(e));
        }

        // 编辑角色表单提交
        const editCharacterForm = document.getElementById('edit-character-form');
        if (editCharacterForm) {
            editCharacterForm.addEventListener('submit', (e) => this.handleEditCharacter(e));
        }
        
        // 添加角色复选框状态变化监听
        const isChargePercentageCheckbox = document.getElementById('isChargePercentage');
        if (isChargePercentageCheckbox) {
            isChargePercentageCheckbox.addEventListener('change', (e) => {
                const costIncreaseInput = document.getElementById('characterChargeIncrease');
                costIncreaseInput.disabled = !e.target.checked;
            });
        }

        // 保存编辑角色按钮
        const saveEditCharacterBtn = document.getElementById('saveEditCharacterBtn');
        if (saveEditCharacterBtn) {
            saveEditCharacterBtn.addEventListener('click', (e) => this.handleEditCharacter(e));
        }
        
        // 监听编辑角色模态框显示事件
        const editModal = document.getElementById('editCharacterModal');
        if (editModal) {
            editModal.addEventListener('modal-shown', (e) => {
                const character = e.detail.data;
                if (character) {
                    // 填充表单数据
                    document.getElementById('edit-character-id').value = character.id;
                    document.getElementById('edit-character-name').value = character.name;
                    document.getElementById('edit-character-cost-recovery-rate').value = character.costRecoveryRate;
                    document.getElementById('edit-character-skill-cost').value = character.skillCost;
                    document.getElementById('edit-character-cost-increase').value = character.costIncrease;
                    document.getElementById('edit-is-charge-percentage').checked = character.isChargePercentage;
                    
                    // 根据复选框状态启用/禁用输入框
                    const costIncreaseInput = document.getElementById('edit-character-cost-increase');
                    costIncreaseInput.disabled = !character.isChargePercentage;
                }
            });
        }
        
        // 编辑角色模态框百分比复选框事件监听器
        const editIsChargePercentage = document.getElementById('edit-is-charge-percentage');
        if (editIsChargePercentage) {
            editIsChargePercentage.addEventListener('change', (e) => {
                const costIncreaseInput = document.getElementById('edit-character-cost-increase');
                if (e.target.checked) {
                    // 勾选时启用输入框
                    costIncreaseInput.disabled = false;
                } else {
                    // 取消勾选时清空并禁用输入框
                    costIncreaseInput.value = '';
                    costIncreaseInput.disabled = true;
                }
            });
        }
        
        // 添加顶部菜单按钮事件
        const fileMenuBtn = document.getElementById('fileMenuBtn');
        if (fileMenuBtn) {
            fileMenuBtn.addEventListener('click', () => {
                const fileMenu = document.getElementById('fileMenu');
                if (fileMenu) {
                    fileMenu.classList.toggle('hidden');
                }
            });
        }
        
        const editMenuBtn = document.getElementById('editMenuBtn');
        if (editMenuBtn) {
            editMenuBtn.addEventListener('click', () => {
                const editMenu = document.getElementById('editMenu');
                if (editMenu) {
                    editMenu.classList.toggle('hidden');
                }
            });
        }
        
        const toolsMenuBtn = document.getElementById('toolsMenuBtn');
        if (toolsMenuBtn) {
            toolsMenuBtn.addEventListener('click', () => {
                const toolsMenu = document.getElementById('toolsMenu');
                if (toolsMenu) {
                    toolsMenu.classList.toggle('hidden');
                }
            });
        }
        
        const helpMenuBtn = document.getElementById('helpMenuBtn');
        if (helpMenuBtn) {
            helpMenuBtn.addEventListener('click', () => {
                const helpMenu = document.getElementById('helpMenu');
                if (helpMenu) {
                    helpMenu.classList.toggle('hidden');
                }
            });
        }
        
        // 添加初始化按钮事件
        const initializeBtn = document.getElementById('initializeBtn');
        if (initializeBtn) {
            initializeBtn.addEventListener('click', () => {
                this.modalManager.showModal('initializeModal');
            });
        }
    }

    // 初始化规则相关事件监听器
    initRuleListeners() {
        // 添加规则按钮
        const addRuleBtn = document.getElementById('add-rule-btn');
        if (addRuleBtn) {
            addRuleBtn.addEventListener('click', () => this.showAddRuleModal());
        }

        // 编辑规则按钮（动态添加，使用事件委托）
        const ruleList = document.getElementById('rulesTable');
        if (ruleList) {
            ruleList.addEventListener('click', (e) => {
                if (e.target.closest('.edit-rule')) {
                    const btn = e.target.closest('.edit-rule');
                    const ruleId = parseInt(btn.dataset.id);
                    this.showEditRuleModal(ruleId);
                } else if (e.target.closest('.delete-rule')) {
                    const btn = e.target.closest('.delete-rule');
                    const ruleId = parseInt(btn.dataset.id);
                    this.confirmDeleteRule(ruleId);
                }
            });
        }

        // 添加规则表单提交
        const addRuleForm = document.getElementById('addRuleForm');
        if (addRuleForm) {
            addRuleForm.addEventListener('submit', (e) => this.handleAddRule(e));
        }

        // 编辑规则表单提交
        const editRuleForm = document.getElementById('edit-rule-form');
        if (editRuleForm) {
            editRuleForm.addEventListener('submit', (e) => this.handleEditRule(e));
        }
    }

    // 初始化数据项相关事件监听器
    initDataItemListeners() {
        // 添加数据项按钮
        const addDataItemBtn = document.getElementById('add-data-item-btn');
        if (addDataItemBtn) {
            addDataItemBtn.addEventListener('click', () => this.addDefaultDataItem());
        }

        // 编辑数据项按钮（动态添加，使用事件委托）
        const dataItemList = document.getElementById('dataItemsTable');
        if (dataItemList) {
            dataItemList.addEventListener('click', (e) => {
                if (e.target.closest('.edit-data-item')) {
                    const btn = e.target.closest('.edit-data-item');
                    const itemId = parseInt(btn.dataset.id);
                    this.showEditDataItemModal(itemId);
                } else if (e.target.closest('.delete-data-item')) {
                    const btn = e.target.closest('.delete-data-item');
                    const itemId = parseInt(btn.dataset.id);
                    this.confirmDeleteDataItem(itemId);
                }
            });
        }

        // 批量删除数据项按钮 (当前HTML中未实现)
        // const bulkDeleteBtn = document.getElementById('bulk-delete-btn');
        // if (bulkDeleteBtn) {
        //     bulkDeleteBtn.addEventListener('click', () => this.bulkDeleteDataItems());
        // }

        // 编辑数据项表单提交
        const editDataItemForm = document.getElementById('editDataItemForm');
        if (editDataItemForm) {
            editDataItemForm.addEventListener('submit', (e) => this.handleEditDataItem(e));
        }
        
        // 编辑数据项模态框显示事件
        const editDataItemModal = document.getElementById('editDataItemModal');
        if (editDataItemModal) {
            editDataItemModal.addEventListener('modal-shown', (e) => {
                const dataItem = e.detail.data;
                if (dataItem) {
                    // 填充表单数据
                    document.getElementById('editDataItemId').value = dataItem.id;
                    document.getElementById('editTriggerCharacter').value = dataItem.characterId;
                    document.getElementById('editAction').value = dataItem.action;
                    document.getElementById('editTriggerCost').value = dataItem.cost.toFixed(2);
                    
                    // 格式化时间为 00:00.000 格式
                    const formatTime = (seconds) => {
                        const minutes = Math.floor(seconds / 60);
                        const remainingSeconds = seconds % 60;
                        const milliseconds = Math.floor((remainingSeconds % 1) * 1000);
                        return `${minutes.toString().padStart(2, '0')}:${Math.floor(remainingSeconds).toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
                    };
                    
                    document.getElementById('editTime').value = formatTime(dataItem.time);
                    
                    // 添加实时计算事件监听器
                    this.addEditFormRealTimeCalculation();
                }
            });
            
            // 模态框隐藏时移除事件监听器
            editDataItemModal.addEventListener('hidden', () => {
                this.removeEditFormRealTimeCalculation();
            });
        }
        
        // 初始化表单提交
        const initializeForm = document.getElementById('initializeForm');
        if (initializeForm) {
            initializeForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                // 处理初始化逻辑 - 获取初始时间
                const initialTimeStr = document.getElementById('initialTime').value;
                
                // 将时间格式转换为秒数，支持多种输入格式：
                // - MM:SS.fff (完整格式)
                // - MM:SS (无毫秒)
                // - SS.fff (无分钟)
                // - SS (仅秒数)
                // - 纯数字 (直接作为秒数)
                let initialTimeSeconds = 0;
                if (initialTimeStr) {
                    // 尝试直接解析为数字
                    if (!isNaN(initialTimeStr)) {
                        initialTimeSeconds = parseFloat(initialTimeStr);
                    } else {
                        const timeParts = initialTimeStr.split(':');
                        if (timeParts.length === 2) {
                            // MM:SS.fff 或 MM:SS
                            const minutes = parseInt(timeParts[0]) || 0;
                            const secondsParts = timeParts[1].split('.');
                            const seconds = parseInt(secondsParts[0]) || 0;
                            const milliseconds = parseInt(secondsParts[1]) || 0;
                            initialTimeSeconds = minutes * 60 + seconds + milliseconds / 1000;
                        } else if (timeParts.length === 1) {
                            // SS.fff 或 SS
                            const secondsParts = timeParts[0].split('.');
                            const seconds = parseInt(secondsParts[0]) || 0;
                            const milliseconds = parseInt(secondsParts[1]) || 0;
                            initialTimeSeconds = seconds + milliseconds / 1000;
                        }
                    }
                }
                
                // 清空现有数据项并设置初始化状态
                this.dataManager.clearDataItems();
                this.app.setDataTableInitialized(true);
                
                // 设置初始化时间
                this.dataManager.setInitializationTime(initialTimeSeconds);
                
                // 移除初始费用设定，费用从0开始
                this.dataManager.currentCost = 0;
                
                // 获取当前角色列表
                const characters = this.dataManager.getCharacters();
                
                // 初始化后在数据表中生成默认行，时间为初始化时间
                // 直接创建符合格式要求的默认数据项，即使没有角色也生成
                const defaultItem = {
                    id: `item_${Date.now()}`,
                    characterId: characters.length > 0 ? characters[0].id : 0,
                    cost: 0,
                    action: '初始化',
                    time: initialTimeSeconds,
                    timeInterval: 0,
                    costDeduction: 0,
                    remainingCost: 0 // 初始剩余费用为0
                };
                
                // 添加到数据管理器
                this.dataManager.dataItems.push(defaultItem);
                
                // 确保第一个数据项的时间间隔计算正确
                this.calculator.recalculateAllItems();
                
                this.modalManager.hideAllModals();
                this.modalManager.showToast(`已成功初始化，初始时间：${initialTimeStr}`, 'success');
                this.uiRenderer.refreshAll();
            });
        }
    }

    // 初始化通用事件监听器
    initGeneralListeners() {
        // 保存数据按钮
        const saveDataBtn = document.getElementById('saveProject');
        if (saveDataBtn) {
            saveDataBtn.addEventListener('click', () => this.saveData());
        }

        // 加载数据按钮
        const loadDataBtn = document.getElementById('loadProject');
        if (loadDataBtn) {
            loadDataBtn.addEventListener('click', () => this.loadData());
        }

        // 导出数据按钮
        const exportDataBtn = document.getElementById('exportBtn');
        if (exportDataBtn) {
            exportDataBtn.addEventListener('click', () => this.exportData());
        }

        // 导入数据按钮
        const importDataBtn = document.getElementById('importBtn');
        if (importDataBtn) {
            importDataBtn.addEventListener('click', () => this.showImportDataModal());
        }

        // 清空数据按钮
        const clearDataBtn = document.getElementById('clearFilterBtn');
        if (clearDataBtn) {
            clearDataBtn.addEventListener('click', () => this.clearAllFilters());
        }

        // 添加角色按钮
        const addCharacterBtn = document.getElementById('addCharacter');
        if (addCharacterBtn) {
            addCharacterBtn.addEventListener('click', () => this.showAddCharacterModal());
        }
        
        // 数据筛选展开/收起按钮
        const toggleFilterBtn = document.getElementById('toggleFilterBtn');
        if (toggleFilterBtn) {
            toggleFilterBtn.addEventListener('click', () => {
                const filterContent = document.getElementById('filterContent');
                const icon = toggleFilterBtn.querySelector('i.fas.fa-chevron-down');
                
                if (filterContent.classList.contains('hidden')) {
                    // 展开筛选面板
                    filterContent.classList.remove('hidden');
                    icon.classList.add('rotate-180');
                } else {
                    // 收起筛选面板
                    filterContent.classList.add('hidden');
                    icon.classList.remove('rotate-180');
                }
            });
        }
        
        // 添加数据项展开/收起按钮
        const toggleAddItemBtn = document.getElementById('toggleAddItemBtn');
        if (toggleAddItemBtn) {
            toggleAddItemBtn.addEventListener('click', () => {
                const addItemContent = document.getElementById('addItemContent');
                const icon = toggleAddItemBtn.querySelector('i.fas.fa-chevron-up');
                
                if (addItemContent.classList.contains('hidden')) {
                    // 展开添加数据项面板
                    addItemContent.classList.remove('hidden');
                    icon.classList.remove('rotate-180');
                    icon.classList.add('fa-chevron-up');
                    icon.classList.remove('fa-chevron-down');
                } else {
                    // 收起添加数据项面板
                    addItemContent.classList.add('hidden');
                    icon.classList.add('rotate-180');
                    icon.classList.remove('fa-chevron-up');
                    icon.classList.add('fa-chevron-down');
                }
            });
        }

        

        // 用户手册按钮
        const userManualBtn = document.getElementById('userManual');
        if (userManualBtn) {
            userManualBtn.addEventListener('click', () => {
                this.modalManager.showModal('manualModal');
            });
        }

        // 关于应用按钮
        const aboutAppBtn = document.getElementById('aboutApp');
        if (aboutAppBtn) {
            aboutAppBtn.addEventListener('click', () => {
                this.modalManager.showModal('aboutModal');
            });
        }
        
        // 应用筛选按钮
        const applyFilterBtn = document.getElementById('applyFilterBtn');
        if (applyFilterBtn) {
            applyFilterBtn.addEventListener('click', () => {
                this.applyFilters();
            });
        }
        
        // 刷新按钮
        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.uiRenderer.refreshAll();
                this.modalManager.showToast('数据表已刷新', 'success');
            });
        }
        
        // 隐藏/显示特殊行按钮
        const toggleSpecialRowsBtn = document.getElementById('toggleSpecialRowsBtn');
        if (toggleSpecialRowsBtn) {
            toggleSpecialRowsBtn.addEventListener('click', () => {
                // 切换隐藏状态
                const currentState = this.dataManager.getHideSpecialRows();
                const newState = !currentState;
                
                // 更新数据管理器状态
                this.dataManager.setHideSpecialRows(newState);
                
                // 更新按钮文本和图标
                const icon = toggleSpecialRowsBtn.querySelector('i');
                if (newState) {
                    toggleSpecialRowsBtn.innerHTML = '<i class="fas fa-eye"></i> 显示特殊行';
                    this.modalManager.showToast('特殊行已隐藏', 'success');
                } else {
                    toggleSpecialRowsBtn.innerHTML = '<i class="fas fa-eye-slash"></i> 隐藏特殊行';
                    this.modalManager.showToast('特殊行已显示', 'success');
                }
                
                // 刷新UI
                this.uiRenderer.refreshAll();
            });
        }
        
        // 分页按钮事件处理
        this.setupPaginationListeners();
        
        // 新建项目按钮
        const newProjectBtn = document.getElementById('newProject');
        if (newProjectBtn) {
            newProjectBtn.addEventListener('click', () => {
                this.modalManager.showConfirmModal(
                    '新建项目',
                    '确定要新建项目吗？当前未保存的数据将丢失。',
                    () => {
                        this.dataManager.clearAllData();
                        this.uiRenderer.refreshAll();
                        this.modalManager.showToast('新项目已创建', 'success');
                    }
                );
            });
        }
        
        // 退出应用按钮
        const exitAppBtn = document.getElementById('exitApp');
        if (exitAppBtn) {
            exitAppBtn.addEventListener('click', () => {
                this.modalManager.showConfirmModal(
                    '退出应用',
                    '确定要退出应用吗？当前未保存的数据将丢失。',
                    () => {
                        // 这里只是模拟退出，实际应用中可能需要更复杂的逻辑
                        this.modalManager.showToast('感谢使用！', 'success');
                    }
                );
            });
        }
        
        // 撤销操作按钮
        const undoActionBtn = document.getElementById('undoAction');
        if (undoActionBtn) {
            undoActionBtn.addEventListener('click', () => {
                this.modalManager.showToast('撤销功能开发中', 'info');
            });
        }
        
        // 重做操作按钮
        const redoActionBtn = document.getElementById('redoAction');
        if (redoActionBtn) {
            redoActionBtn.addEventListener('click', () => {
                this.modalManager.showToast('重做功能开发中', 'info');
            });
        }
        
        // 角色预设按钮
        const characterPresetsBtn = document.getElementById('characterPresets');
        if (characterPresetsBtn) {
            characterPresetsBtn.addEventListener('click', () => {
                this.showCharacterPresetsModal();
            });
        }
        

        
        // 显示时间线按钮
        const showTimelineBtn = document.getElementById('showTimeline');
        if (showTimelineBtn) {
            showTimelineBtn.addEventListener('click', () => {
                // 显示时间轴模态框
                this.modalManager.showModal('timelineModal');
                // 初始化时间轴视图
                this.uiRenderer.initTimelineView();
            });
        }
        
        // 持续回费功能按钮
        const skillBindingBtn = document.getElementById('skillBindingBtn');
        if (skillBindingBtn) {
            skillBindingBtn.addEventListener('click', () => {
                // 检查是否已选择目标行
                if (!window.selectedTargetRowId) {
                    this.modalManager.showToast('请先在数据表中选择一行作为目标行', 'error');
                    return;
                }
                
                // 显示持续回费功能模态框
                this.modalManager.showModal('skillBindingModal');
                
                // 更新选中目标行信息
                this.updateSelectedTargetRowInfo();
                
                // 为关闭按钮添加事件监听器
                setTimeout(() => {
                    // 关闭按钮
                    const closeBtn = document.querySelector('#skillBindingModal .closeModal');
                    if (closeBtn) {
                        closeBtn.addEventListener('click', () => {
                            this.modalManager.hideModal('skillBindingModal');
                        });
                    }
                    
                    // 取消按钮
                    const cancelBtn = document.getElementById('cancelBindingBtn');
                    if (cancelBtn) {
                        cancelBtn.addEventListener('click', () => {
                            this.modalManager.hideModal('skillBindingModal');
                        });
                    }
                    
                    // 保存按钮
                    const saveBtn = document.getElementById('saveBindingBtn');
                    if (saveBtn) {
                        saveBtn.addEventListener('click', (e) => {
                            e.preventDefault();
                            this.handleContinuousChargeSave();
                        });
                    }
                    
                    // 表单提交
                    const form = document.getElementById('continuousChargeForm');
                    if (form) {
                        form.addEventListener('submit', (e) => {
                            e.preventDefault();
                            this.handleContinuousChargeSave();
                        });
                    }
                }, 100);
            });
        }
        
        // 角色特殊技能按钮
        const specialSkillsBtn = document.getElementById('specialSkillsBtn');
        if (specialSkillsBtn) {
            specialSkillsBtn.addEventListener('click', () => {
                // 显示角色特殊技能模态框
                this.modalManager.showModal('specialSkillsModal');
                // 渲染技能卡片
                this.uiRenderer.renderSpecialSkills();
                
                // 为关闭按钮添加事件监听器
                setTimeout(() => {
                    const closeBtn = document.querySelector('#specialSkillsModal .close-button');
                    if (closeBtn) {
                        // 移除之前的事件监听器，防止重复绑定
                        closeBtn.removeEventListener('click', this.closeSpecialSkillsModal);
                        // 绑定新的事件监听器
                        closeBtn.addEventListener('click', () => {
                            this.modalManager.hideModal('specialSkillsModal');
                        });
                    }
                }, 100);
            });
        }
        
        // 手册按钮
        const manualBtn = document.getElementById('manualBtn');
        if (manualBtn) {
            manualBtn.addEventListener('click', () => {
                this.modalManager.showModal('manualModal');
            });
        }
        
        // 刷新表格按钮
        const refreshTableBtn = document.getElementById('refreshTableBtn');
        if (refreshTableBtn) {
            refreshTableBtn.addEventListener('click', () => {
                this.uiRenderer.refreshAll();
                this.modalManager.showToast('表格已刷新', 'success');
            });
        }
        

        
        // 复制最后一项按钮
        const copyLastItemBtn = document.getElementById('copyLastItemBtn');
        if (copyLastItemBtn) {
            copyLastItemBtn.addEventListener('click', () => {
                const dataItems = this.dataManager.getDataItems();
                if (dataItems.length === 0) {
                    this.modalManager.showToast('没有数据项可复制', 'warning');
                    return;
                }
                
                const lastItem = dataItems[dataItems.length - 1];
                const newItem = {
                    ...lastItem,
                    id: Date.now(),
                    name: `${lastItem.name} (副本)`,
                    startTime: lastItem.startTime + 5 // 默认延迟5秒
                };
                
                this.dataManager.addDataItem(newItem);
                this.uiRenderer.renderDataItemList();
                this.modalManager.showToast('最后一项已复制', 'success');
            });
        }
        

        
        // 关闭模态框按钮（通用）
        const closeModalBtns = document.querySelectorAll('.closeModal');
        closeModalBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.modalManager.hideAllModals();
            });
        });
        
        // 取消确认按钮
        const cancelConfirmBtn = document.getElementById('cancelConfirmBtn');
        if (cancelConfirmBtn) {
            cancelConfirmBtn.addEventListener('click', () => {
                this.modalManager.hideAllModals();
            });
        }
        
        // 确认按钮（通用）
        const acceptConfirmBtn = document.getElementById('acceptConfirmBtn');
        if (acceptConfirmBtn) {
            acceptConfirmBtn.addEventListener('click', () => {
                this.modalManager.hideAllModals();
            });
        }
        

    }

    // 显示添加角色模态框
    showAddCharacterModal() {
        this.modalManager.showModal('addCharacterModal');
        
        // 根据复选框初始状态禁用/启用回费增加百分比输入框
        const checkbox = document.getElementById('isChargePercentage');
        const costIncreaseInput = document.getElementById('characterChargeIncrease');
        costIncreaseInput.disabled = !checkbox.checked;
    }

    // 显示编辑角色模态框
    showEditCharacterModal(characterId) {
        const character = this.dataManager.getCharacterById(characterId);
        if (!character) return;

        // 填充表单数据
        document.getElementById('edit-character-id').value = character.id;
        document.getElementById('edit-character-name').value = character.name;
        document.getElementById('edit-character-cost-recovery-rate').value = character.costRecoveryRate;
        document.getElementById('edit-character-skill-cost').value = character.skillCost;
        document.getElementById('edit-character-cost-increase').value = character.costIncrease;
        document.getElementById('edit-is-charge-percentage').checked = character.isChargePercentage;
        
        // 根据复选框状态启用/禁用输入框
        const costIncreaseInput = document.getElementById('edit-character-cost-increase');
        costIncreaseInput.disabled = !character.isChargePercentage;

        // 显示模态框
        this.modalManager.showModal('editCharacterModal');
    }

    // 处理添加角色
    handleAddCharacter(e) {
        e.preventDefault();

        // 检查角色数量是否已达上限
        if (this.dataManager.getCharacters().length >= 6) {
            this.modalManager.showToast('角色数量已达上限，最多只能添加6个角色', 'error');
            return;
        }

        // 获取复选框状态
        const isChargePercentageChecked = document.getElementById('isChargePercentage').checked;
        
        // 检查是否已有其他角色启用了回费
        const existingChargingCharacter = this.dataManager.getCharacters().find(character => character.isChargePercentage);
        
        // 如果当前角色启用了回费且已有其他角色启用，则显示提示
        if (isChargePercentageChecked && existingChargingCharacter) {
            this.modalManager.showToast(`已有角色"${existingChargingCharacter.name}"启用了回费，只能有一个角色启用此功能`, 'error');
            return;
        }

        const formData = {
            name: document.getElementById('characterName').value,
            costRecoveryRate: document.getElementById('characterChargeSpeed').value,
            skillCost: document.getElementById('characterSkillCost').value,
            costIncrease: document.getElementById('characterChargeIncrease').value,
            isChargePercentage: isChargePercentageChecked
        };

        // 验证表单数据
        if (!this.validateCharacterForm(formData)) {
            // 如果启用了回费但未填写回费增加，显示特定提示
            if (isChargePercentageChecked && (formData.costIncrease === '' || isNaN(formData.costIncrease))) {
                this.modalManager.showToast('启用回费时必须填写回费增加', 'error');
            } else {
                this.modalManager.showToast('请填写所有必填字段', 'error');
            }
            return;
        }

        try {
            // 添加角色
            const character = this.dataManager.addCharacter(formData);
            
            // 刷新UI
            this.uiRenderer.refreshAll();
            
            // 关闭模态框
            this.modalManager.hideModal('addCharacterModal');
            
            // 显示成功提示
            this.modalManager.showToast('角色添加成功', 'success');
            
            // 如果启用了回费，显示提醒
            if (isChargePercentageChecked) {
                this.modalManager.showToast(
                    `角色 ${character.name} 已设置回费增加：${character.costIncrease}%，` +
                    `每次技能释放后将增加额外的回费效率。`,
                    'info'
                );
            }
            
            // 重置表单
            e.target.reset();
            // 重置复选框
            document.getElementById('isChargePercentage').checked = false;
        } catch (error) {
            // 显示错误提示
            this.modalManager.showToast(error.message, 'error');
        }
    }

    // 处理编辑角色
    handleEditCharacter(e) {
        e.preventDefault();

        const characterId = parseInt(document.getElementById('edit-character-id').value);
        
        // 获取复选框状态
        const isChargePercentageChecked = document.getElementById('edit-is-charge-percentage').checked;
        
        // 检查是否已有其他角色启用了回费，且该角色不是当前编辑的角色
        const existingChargingCharacter = this.dataManager.getCharacters().find(character => 
            character.isChargePercentage && character.id !== characterId
        );
        
        // 如果当前角色启用了回费且已有其他角色启用，则显示提示
        if (isChargePercentageChecked && existingChargingCharacter) {
            this.modalManager.showToast(`已有角色"${existingChargingCharacter.name}"启用了回费，只能有一个角色启用此功能`, 'error');
            return;
        }
        
        const formData = {
            name: document.getElementById('edit-character-name').value,
            costRecoveryRate: parseFloat(document.getElementById('edit-character-cost-recovery-rate').value),
            skillCost: parseFloat(document.getElementById('edit-character-skill-cost').value),
            costIncrease: parseFloat(document.getElementById('edit-character-cost-increase').value),
            isChargePercentage: isChargePercentageChecked
        };

        // 验证表单数据
        if (!this.validateCharacterForm(formData)) {
            // 如果启用了回费但未填写回费增加，显示特定提示
            if (isChargePercentageChecked && (formData.costIncrease === '' || isNaN(formData.costIncrease))) {
                this.modalManager.showToast('启用回费时必须填写回费增加', 'error');
            } else {
                this.modalManager.showToast('请填写所有必填字段', 'error');
            }
            return;
        }

        try {
            // 更新角色
            const updatedCharacter = this.dataManager.updateCharacter(characterId, formData);
            
            // 刷新UI
            this.uiRenderer.refreshAll();
            
            // 关闭模态框
            this.modalManager.hideModal('editCharacterModal');
            
            // 高亮显示更新后的角色行
            if (updatedCharacter) {
                this.uiRenderer.highlightElement(`character-${updatedCharacter.id}`);
            }
            
            // 显示成功提示
            this.modalManager.showToast('角色更新成功', 'success');
        } catch (error) {
            // 显示错误提示
            this.modalManager.showToast(error.message, 'error');
        }
    }

    // 确认删除数据项
    confirmDeleteDataItem(itemId) {
        this.modalManager.showConfirmModal(
            '确认删除',
            '确定要删除这个数据项吗？',
            () => {
                this.deleteDataItem(itemId);
            }
        );
    }
    
    // 设置分页按钮事件监听器
    setupPaginationListeners() {
        // 使用事件委托监听分页按钮点击事件
        document.addEventListener('click', (e) => {
            // 首页按钮
            if (e.target.closest('#firstPageBtn')) {
                this.dataManager.setCurrentPage(1);
                this.uiRenderer.refreshAll();
            }
            // 上一页按钮
            else if (e.target.closest('#prevPageBtn')) {
                const currentPage = this.dataManager.getCurrentPage();
                if (currentPage > 1) {
                    this.dataManager.setCurrentPage(currentPage - 1);
                    this.uiRenderer.refreshAll();
                }
            }
            // 下一页按钮
            else if (e.target.closest('#nextPageBtn')) {
                const currentPage = this.dataManager.getCurrentPage();
                const totalPages = this.dataManager.getTotalPages();
                if (currentPage < totalPages) {
                    this.dataManager.setCurrentPage(currentPage + 1);
                    this.uiRenderer.refreshAll();
                }
            }
            // 末页按钮
            else if (e.target.closest('#lastPageBtn')) {
                const totalPages = this.dataManager.getTotalPages();
                this.dataManager.setCurrentPage(totalPages);
                this.uiRenderer.refreshAll();
            }
        });
    }
    
    // 确认删除角色
    confirmDeleteCharacter(characterId) {
        const character = this.dataManager.getCharacterById(characterId);
        if (!character) return;

        // 检查是否有数据项引用了该角色
        const dataItems = this.dataManager.getAllDataItems();
        const hasReferences = dataItems.some(item => item.characterId === characterId);

        if (hasReferences) {
            // 如果有引用，显示提示信息
            this.modalManager.showToast(
                `角色 "${character.name}" 已被引用，请删除相关数据项后再删除角色，或选择编辑角色属性。`,
                'error'
            );
        } else {
            // 如果没有引用，显示确认删除的模态框
            this.modalManager.showConfirmModal(
                '确认删除',
                `确定要删除角色 "${character.name}" 吗？相关规则也会被删除。`,
                () => {
                    this.dataManager.deleteCharacter(characterId);
                    this.uiRenderer.refreshAll();
                    this.modalManager.showToast('角色删除成功', 'success');
                }
            );
        }
    }
    
    // 显示角色预设模态框
    showCharacterPresetsModal() {
        const modal = document.getElementById('characterPresetsModal');
        const presetsList = document.getElementById('presetsList');
        const presetCount = document.getElementById('presetCount');
        
        // 更新已添加角色数量
        presetCount.textContent = this.dataManager.getCharacters().length;
        
        // 清空现有列表
        presetsList.innerHTML = '';
        
        // 获取预设角色
        const presets = this.dataManager.getPresetCharacters();
        
        // 生成预设角色列表
        presets.forEach(preset => {
            const isAdded = this.dataManager.isCharacterAdded(preset.name);
            
            const presetItem = document.createElement('div');
            presetItem.className = 'flex justify-between items-center p-3 bg-gray-50 rounded shadow-sm';
            presetItem.innerHTML = `
                <div class="flex-1">
                    <h5 class="font-medium">${preset.name}</h5>
                    <div class="text-sm text-gray-500 mt-1">
                        <div>回复速度: ${preset.costRecoveryRate.toFixed(2)} c/s</div>
                        <div>技能费用: ${preset.skillCost.toFixed(2)} c</div>
                        <div>回费增加: ${preset.costIncrease.toFixed(2)}%</div>
                    </div>
                </div>
                <div class="ml-4">
                    <button 
                        class="add-preset-btn btn ${isAdded ? 'btn-outline' : 'btn-primary'}" 
                        ${isAdded ? 'disabled' : ''}
                        data-name="${preset.name}"
                    >
                        ${isAdded ? '<i class="fas fa-check"></i> 已添加' : '<i class="fas fa-plus"></i> 添加'}
                    </button>
                </div>
            `;
            
            presetsList.appendChild(presetItem);
        });
        
        // 添加预设角色按钮事件
        const addPresetBtns = presetsList.querySelectorAll('.add-preset-btn');
        addPresetBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const presetName = e.target.closest('.add-preset-btn').dataset.name;
                this.addPresetCharacter(presetName);
            });
        });
        
        // 显示模态框
        this.modalManager.showModal('characterPresetsModal');
    }
    
    // 添加预设角色
    addPresetCharacter(presetName) {
        // 检查角色数量是否已达上限
        if (this.dataManager.getCharacters().length >= 6) {
            this.modalManager.showToast('角色数量已达上限，最多只能添加6个角色', 'error');
            return;
        }
        
        // 获取预设角色数据
        const presets = this.dataManager.getPresetCharacters();
        const preset = presets.find(p => p.name === presetName);
        
        if (preset) {
            // 添加角色
            this.dataManager.addCharacter(preset);
            
            // 刷新UI
            this.uiRenderer.refreshAll();
            
            // 更新预设模态框
            this.showCharacterPresetsModal();
            
            // 显示成功提示
            this.modalManager.showToast(`角色 "${preset.name}" 添加成功`, 'success');
        }
    }
    
    // 确认清空所有角色
    confirmClearAllCharacters() {
        this.modalManager.showConfirmModal(
            '确认清空',
            '确定要清空所有角色吗？此操作不可撤销。',
            () => {
                this.dataManager.clearAllCharacters();
                this.uiRenderer.refreshAll();
                this.modalManager.hideModal('characterPresetsModal');
                this.modalManager.showToast('所有角色已清空', 'success');
            }
        );
    }

    // 更新选中目标行信息
    updateSelectedTargetRowInfo() {
        const selectedRowInfoEl = document.getElementById('selectedTargetRowInfo');
        if (!selectedRowInfoEl) return;
        
        // 获取选中的目标行ID
        const selectedRowId = window.selectedTargetRowId;
        if (!selectedRowId) {
            selectedRowInfoEl.innerHTML = '<p class="text-sm text-gray-500">请先在数据表中选择一行作为目标行</p>';
            return;
        }
        
        // 获取数据项和对应的角色
        const dataItem = this.dataManager.dataItems.find(item => item.id == selectedRowId);
        if (!dataItem) {
            selectedRowInfoEl.innerHTML = '<p class="text-sm text-red-500">未找到选中的数据项</p>';
            return;
        }
        
        const character = this.dataManager.getCharacterById(dataItem.characterId);
        if (!character) {
            selectedRowInfoEl.innerHTML = '<p class="text-sm text-red-500">未找到对应的角色</p>';
            return;
        }
        
        // 更新选中行信息
        selectedRowInfoEl.innerHTML = `
            <p class="text-sm font-medium">${dataItem.time} - ${character.name} (${dataItem.action})</p>
            <p class="text-xs text-gray-500 mt-1">触发费用: ${dataItem.cost}c | 费用扣除: ${dataItem.costDeduction}c | 剩余费用: ${dataItem.remainingCost}c</p>
        `;
    }
    
    // 处理持续回费功能保存
    handleContinuousChargeSave() {
        // 获取表单数据
        const delayTime = parseFloat(document.getElementById('delayTime').value);
        const duration = parseFloat(document.getElementById('duration').value);
        const recoveryIncrease = parseFloat(document.getElementById('recoveryIncrease').value);
        
        // 获取选中的目标行ID
        const targetRowId = window.selectedTargetRowId;
        
        // 验证表单数据
        if (!targetRowId || isNaN(delayTime) || isNaN(duration) || isNaN(recoveryIncrease)) {
            this.modalManager.showToast('请填写所有必填字段', 'error');
            return;
        }
        
        // 验证数值范围
        if (delayTime < 0 || duration < 0 || recoveryIncrease < 0) {
            this.modalManager.showToast('数值不能为负数', 'error');
            return;
        }
        
        // 保存持续回费设置
        const continuousChargeData = {
            targetRowId: targetRowId,
            delayTime: delayTime,
            duration: duration,
            recoveryIncrease: recoveryIncrease
        };
        
        // 保存到数据管理器
        this.dataManager.continuousChargeData = continuousChargeData;
        
        // 显示成功提示
        this.modalManager.showToast('持续回费设置已保存', 'success');
        
        // 关闭模态框
        this.modalManager.hideModal('skillBindingModal');
        
        // 重新计算数据项
        this.calculator.recalculateAllItems();
        
        // 清空选中的目标行ID，确保下次操作时需要重新选择目标行
        window.selectedTargetRowId = null;
    }
    
    // 验证角色表单
    validateCharacterForm(formData) {
        // 检查必填字段
        if (!formData.name || isNaN(formData.costRecoveryRate) || isNaN(formData.skillCost)) {
            return false;
        }
        
        // 如果启用了回费，检查回费增加是否已填写且为数字
        if (formData.isChargePercentage) {
            if (formData.costIncrease === '' || isNaN(formData.costIncrease)) {
                return false;
            }
            // 检查回费增加是否在合理范围内（0-100%）
            if (parseFloat(formData.costIncrease) < 0 || parseFloat(formData.costIncrease) > 100) {
                return false;
            }
        }
        
        return true;
    }

    // 显示添加规则模态框
    showAddRuleModal() {
        // 检查是否选择了目标行
        if (!window.selectedTargetRowId) {
            // 显示提示信息
            this.modalManager.showToast('请先在数据表中选择目标行', 'warning');
            return;
        }
        
        // 获取选中的目标行数据
        const selectedItem = this.dataManager.getDataItemById(window.selectedTargetRowId);
        if (!selectedItem) {
            // 显示提示信息
            this.modalManager.showToast('选中的目标行不存在', 'error');
            return;
        }
        
        // 保存目标行ID到全局变量，用于后续保存规则时使用
        this.currentTargetRowId = window.selectedTargetRowId;
        // 保存选中行的时间，用于自动填充生效时间
        this.selectedRowTime = selectedItem.time;
        
        // 显示模态框
        this.modalManager.showModal('addRuleModal');
        
        // 更新角色选择下拉框
        this.updateRuleCharacterSelectors();
        
        // 添加规则类型切换事件监听器
        const ruleTypeSelect = document.getElementById('ruleType');
        if (ruleTypeSelect) {
            // 移除旧的事件监听器（防止重复绑定）
            ruleTypeSelect.onchange = null;
            
            // 添加新的事件监听器
            ruleTypeSelect.onchange = (e) => this.handleRuleTypeChange(e.target.value);
        }
        
        // 自动读取选中的目标行，并设置触发角色
        // 设置触发角色
        const ruleSourceCharacter = document.getElementById('ruleSourceCharacter');
        if (ruleSourceCharacter) {
            ruleSourceCharacter.value = selectedItem.characterId;
        }
        
        // 重置规则类型为默认值
        if (ruleTypeSelect) {
            ruleTypeSelect.value = '';
        }
        
        // 确保费用效果字段默认隐藏
        const chargeIncreaseField = document.getElementById('chargeIncreaseFields');
        if (chargeIncreaseField) {
            chargeIncreaseField.classList.add('hidden');
        }
    }
    
    // 处理规则类型切换
    handleRuleTypeChange(ruleType) {
        // 所有规则类型字段的ID
        const fieldIds = [
            'costReductionFields',
            'costChangeFields',
            'chargeIncreaseFields'
        ];
        
        // 隐藏所有规则类型的字段，并禁用其中的输入控件
        fieldIds.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.classList.add('hidden');
                // 禁用字段中的所有输入控件
                const inputs = field.querySelectorAll('input, select, textarea');
                inputs.forEach(input => {
                    input.disabled = true;
                });
            }
        });
        
        // 根据选择的规则类型显示/隐藏触发角色字段
        const sourceCharacterContainer = document.getElementById('ruleSourceCharacterContainer');
        if (sourceCharacterContainer) {
            // 减费效果和回费效果不需要触发角色
            if (ruleType === 'costReduction' || ruleType === 'chargeIncrease') {
                sourceCharacterContainer.classList.add('hidden');
                // 禁用触发角色选择
                const select = document.getElementById('ruleSourceCharacter');
                if (select) {
                    select.disabled = true;
                }
            } else {
                sourceCharacterContainer.classList.remove('hidden');
                // 启用触发角色选择
                const select = document.getElementById('ruleSourceCharacter');
                if (select) {
                    select.disabled = false;
                }
            }
        }
        
        // 根据选择的规则类型显示对应的字段，并启用其中的输入控件
        switch (ruleType) {
            case 'costReduction':
                const costReductionField = document.getElementById('costReductionFields');
                if (costReductionField) {
                    costReductionField.classList.remove('hidden');
                    // 启用字段中的所有输入控件
                    const inputs = costReductionField.querySelectorAll('input, select, textarea');
                    inputs.forEach(input => {
                        input.disabled = false;
                    });
                }
                break;


            case 'costChange':
                const costChangeField = document.getElementById('costChangeFields');
                if (costChangeField) {
                    costChangeField.classList.remove('hidden');
                    // 启用字段中的所有输入控件
                    const inputs = costChangeField.querySelectorAll('input, select, textarea');
                    inputs.forEach(input => {
                        input.disabled = false;
                    });
                }
                break;
            case 'chargeIncrease':
                const chargeIncreaseField = document.getElementById('chargeIncreaseFields');
                if (chargeIncreaseField) {
                    chargeIncreaseField.classList.remove('hidden');
                    // 启用字段中的所有输入控件
                    const inputs = chargeIncreaseField.querySelectorAll('input, select, textarea');
                    inputs.forEach(input => {
                        input.disabled = false;
                    });
                    // 自动填充生效时间为选中行的时间，四舍五入到2位小数
                    if (this.selectedRowTime) {
                        const activationTimeInput = document.getElementById('ciActivationTime');
                        if (activationTimeInput) {
                            activationTimeInput.value = parseFloat(this.selectedRowTime).toFixed(2);
                        }
                    }
                    // 生成角色多选选项
                    this.generateChargeIncreaseTargetOptions();
                }
                break;
        }
    }
    
    // 更新规则表单中的角色选择器
    updateRuleCharacterSelectors() {
        const characters = this.dataManager.getCharacters();
        const selectors = [
            'ruleSourceCharacter',
            'crTargetCharacter'
        ];
        
        selectors.forEach(selectorId => {
            const select = document.getElementById(selectorId);
            if (select) {
                // 保留第一个空选项
                const emptyOption = select.querySelector('option[value=""]');
                select.innerHTML = '';
                if (emptyOption) {
                    select.appendChild(emptyOption);
                } else {
                    const newEmptyOption = document.createElement('option');
                    newEmptyOption.value = '';
                    newEmptyOption.textContent = '请选择角色';
                    select.appendChild(newEmptyOption);
                }
                
                // 添加角色选项
                characters.forEach(character => {
                    const option = document.createElement('option');
                    option.value = character.id;
                    option.textContent = character.name;
                    select.appendChild(option);
                });
            }
        });
    }
    
    // 生成回费效果的角色多选选项
    generateChargeIncreaseTargetOptions() {
        const characters = this.dataManager.getCharacters();
        const container = document.getElementById('ciTargetScopeContainer');
        
        if (container) {
            container.innerHTML = '';
            container.className = 'flex flex-wrap gap-3';
            
            characters.forEach(character => {
                const checkboxWrapper = document.createElement('div');
                checkboxWrapper.className = 'flex items-center bg-gray-100 hover:bg-gray-200 p-2 rounded-md cursor-pointer transition-colors duration-200';
                
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.id = `ciTarget-${character.id}`;
                checkbox.value = character.id;
                checkbox.className = 'mr-2 accent-blue-500';
                
                // 限制最多选择6个角色
                checkbox.addEventListener('change', () => {
                    const checkedCheckboxes = container.querySelectorAll('input[type="checkbox"]:checked');
                    if (checkedCheckboxes.length > 6) {
                        checkbox.checked = false;
                        this.modalManager.showToast('最多可选择6个角色', 'warning');
                    }
                    
                    // 更新选中状态的样式
                    if (checkbox.checked) {
                        checkboxWrapper.classList.add('bg-blue-100', 'border', 'border-blue-300');
                    } else {
                        checkboxWrapper.classList.remove('bg-blue-100', 'border', 'border-blue-300');
                    }
                });
                
                // 点击整个包裹元素也能切换复选框状态
                checkboxWrapper.addEventListener('click', (e) => {
                    if (e.target !== checkbox) {
                        checkbox.checked = !checkbox.checked;
                        checkbox.dispatchEvent(new Event('change'));
                    }
                });
                
                const label = document.createElement('label');
                label.htmlFor = `ciTarget-${character.id}`;
                label.textContent = character.name;
                label.className = 'cursor-pointer';
                
                checkboxWrapper.appendChild(checkbox);
                checkboxWrapper.appendChild(label);
                container.appendChild(checkboxWrapper);
            });
        }
    }

    // 显示编辑规则模态框
    showEditRuleModal(ruleId) {
        const rule = this.dataManager.getRuleById(ruleId);
        if (!rule) return;

        // 填充表单数据
        // 注意：这里的表单ID可能需要根据实际HTML结构调整
        /*
        document.getElementById('edit-rule-id').value = rule.id;
        document.getElementById('edit-rule-character').value = rule.characterId;
        document.getElementById('edit-rule-linked-character').value = rule.linkedCharacterId;
        document.getElementById('edit-rule-cost-change').value = rule.costChange;
        document.getElementById('edit-rule-description').value = rule.description;
        */
        this.modalManager.showToast('编辑规则功能开发中', 'info');
        // this.modalManager.showModal('edit-rule-modal');
    }

    // 处理添加规则
    handleAddRule(e) {
        e.preventDefault();
        
        // 添加调试信息
        console.log('点击了保存按钮，开始处理添加规则');
        
        const ruleType = document.getElementById('ruleType').value;
        const ruleSourceCharacterValue = document.getElementById('ruleSourceCharacter').value;
        const characterId = ruleSourceCharacterValue ? parseInt(ruleSourceCharacterValue) : 0;
        
        console.log('规则类型:', ruleType, '触发角色ID:', characterId);
        
        let ruleData;
        
        switch (ruleType) {
            case 'costReduction':
                ruleData = {
                    type: 'costReduction',
                    characterId: this.currentTargetRowId, // 存储目标行的ID，用于显示触发行时间
                    targetCharacterId: parseInt(document.getElementById('crTargetCharacter').value) || 0,
                    effectCount: parseInt(document.getElementById('crEffectCount').value) || 1,
                    reductionValue: parseFloat(document.getElementById('crValue').value) || 0
                };
                break;


            case 'costChange':
                // 获取更改数值
                const changeValue = parseFloat(document.getElementById('ccValue').value) || 0;
                
                // 获取目标行数据
                const targetItem = this.dataManager.getDataItemById(this.currentTargetRowId);
                if (targetItem && changeValue > targetItem.cost) {
                    // 显示错误提示
                    this.modalManager.showToast('更改扣除不能高于目标行的触发费用', 'error');
                    return;
                }
                
                ruleData = {
                    type: 'costChange',
                    characterId: this.currentTargetRowId, // 存储目标行的ID，而不是触发角色的ID
                    changeValue: changeValue
                };
                break;
            case 'chargeIncrease':
                // 获取选中的角色
                const container = document.getElementById('ciTargetScopeContainer');
                const checkedCheckboxes = container.querySelectorAll('input[type="checkbox"]:checked');
                const targetCharacterIds = Array.from(checkedCheckboxes).map(cb => parseInt(cb.value));
                
                // 检查是否至少选择了一个角色
                if (targetCharacterIds.length === 0) {
                    this.modalManager.showToast('请至少选择一个目标角色', 'error');
                    return;
                }
                
                ruleData = {
                    type: 'chargeIncrease',
                    // 回费效果不需要触发角色
                    characterId: null,
                    activationTime: parseFloat(document.getElementById('ciActivationTime').value) || 0,
                    duration: parseFloat(document.getElementById('ciDuration').value) || 0,
                    chargeType: document.getElementById('ciChargeType').value || 'percentage',
                    chargeValue: parseFloat(document.getElementById('ciValue').value) || 0,
                    effectType: document.getElementById('ciEffectType').value || 'increase',
                    targetCharacterIds: targetCharacterIds
                };
                break;
            default:
                console.log('未选择规则类型');
                this.modalManager.showToast('请选择规则类型', 'error');
                return;
        }

        console.log('规则数据:', ruleData);
        
        // 检查每个字段的值
        console.log('characterId:', characterId);
        console.log('ruleType:', ruleType);
        
        // 根据规则类型打印相关字段信息
        switch (ruleType) {
            case 'costReduction':
                const crTargetCharacter = document.getElementById('crTargetCharacter');
                const crEffectCount = document.getElementById('crEffectCount');
                const crValue = document.getElementById('crValue');
                if (crTargetCharacter) console.log('crTargetCharacter:', crTargetCharacter.value);
                if (crEffectCount) console.log('crEffectCount:', crEffectCount.value);
                if (crValue) console.log('crValue:', crValue.value);
                break;


            case 'costChange':
                const ccValue = document.getElementById('ccValue');
                if (ccValue) {
                    console.log('ccValue:', ccValue.value);
                    console.log('ccValue类型:', typeof ccValue.value);
                    console.log('changeValue:', parseFloat(ccValue.value));
                }
                break;
            case 'chargeIncrease':
                const ciActivationTime = document.getElementById('ciActivationTime');
                const ciDuration = document.getElementById('ciDuration');
                const ciChargeType = document.getElementById('ciChargeType');
                const ciValue = document.getElementById('ciValue');
                const ciEffectType = document.getElementById('ciEffectType');
                if (ciActivationTime) console.log('ciActivationTime:', ciActivationTime.value);
                if (ciDuration) console.log('ciDuration:', ciDuration.value);
                if (ciChargeType) console.log('ciChargeType:', ciChargeType.value);
                if (ciValue) console.log('ciValue:', ciValue.value);
                if (ciEffectType) console.log('ciEffectType:', ciEffectType.value);
                // 直接获取选中的角色ID进行打印，避免变量作用域问题
                const checkedBoxes = document.querySelectorAll('#ciTargetScopeContainer input[type="checkbox"]:checked');
                const selectedCharacterIds = Array.from(checkedBoxes).map(cb => parseInt(cb.value));
                console.log('targetCharacterIds:', selectedCharacterIds);
                break;
        }
        
        // 验证表单数据
        if (!this.validateRuleForm(ruleData)) {
            console.log('表单验证失败');
            console.log('验证失败的规则数据:', ruleData);
            this.modalManager.showToast('请填写所有必填字段', 'error');
            return;
        }

        console.log('表单验证通过，开始添加规则');
        
        // 添加规则
        this.dataManager.addRule(ruleData);
        
        // 刷新UI
        this.uiRenderer.refreshAll();
        
        // 关闭模态框
        this.modalManager.hideModal('addRuleModal');
        
        // 显示成功提示
        this.modalManager.showToast('规则添加成功', 'success');
        
        // 重置表单
        e.target.reset();
        
        // 清空选中的目标行ID，确保下次添加规则时需要重新选择目标行
        window.selectedTargetRowId = null;
        this.currentTargetRowId = null;
        
        console.log('规则添加成功');
        console.log('已清空选中的目标行ID，下次添加规则需要重新选择');
        console.log('window.selectedTargetRowId:', window.selectedTargetRowId);
        console.log('this.currentTargetRowId:', this.currentTargetRowId);
    }

    // 处理编辑规则
    handleEditRule(e) {
        e.preventDefault();

        const ruleId = parseInt(document.getElementById('edit-rule-id').value);
        const formData = {
            characterId: parseInt(document.getElementById('edit-rule-character').value),
            linkedCharacterId: parseInt(document.getElementById('edit-rule-linked-character').value),
            costChange: document.getElementById('edit-rule-cost-change').value,
            description: document.getElementById('edit-rule-description').value
        };

        // 验证表单数据
        if (!this.validateRuleForm(formData)) {
            this.modalManager.showToast('请填写所有必填字段', 'error');
            return;
        }

        // 更新规则
        this.dataManager.updateRule(ruleId, formData);
        
        // 刷新UI
        this.uiRenderer.refreshAll();
        
        // 关闭模态框
        // this.modalManager.hideModal('edit-rule-modal');
        
        // 显示成功提示
        this.modalManager.showToast('规则更新成功', 'success');
    }

    // 确认删除规则
    confirmDeleteRule(ruleId) {
        this.modalManager.showConfirmModal(
            '确认删除',
            '确定要删除这个关联规则吗？',
            () => {
                this.dataManager.deleteRule(ruleId);
                this.uiRenderer.refreshAll();
                this.modalManager.showToast('规则删除成功', 'success');
            }
        );
    }

    // 验证规则表单
    validateRuleForm(formData) {
        // 基本验证：必须选择规则类型
        if (!formData.type) {
            return false;
        }
        
        // 对于需要触发角色的规则类型，验证characterId
        const needCharacterId = formData.type !== 'costReduction' && formData.type !== 'chargeIncrease';
        if (needCharacterId && (formData.characterId === null || formData.characterId === undefined || isNaN(parseInt(formData.characterId)))) {
            return false;
        }
        
        switch (formData.type) {
            case 'costReduction':
                return !isNaN(formData.targetCharacterId) && 
                       !isNaN(formData.effectCount) && 
                       !isNaN(formData.reductionValue);
            case 'costChange':
                return !isNaN(formData.changeValue);
            case 'chargeIncrease':
                return !isNaN(formData.activationTime) && 
                       !isNaN(formData.duration) && 
                       formData.chargeType && 
                       !isNaN(formData.chargeValue) && 
                       formData.effectType &&
                       Array.isArray(formData.targetCharacterIds) && 
                       formData.targetCharacterIds.length > 0;
            default:
                return false;
        }
    }

    // 直接添加默认数据项
    addDefaultDataItem() {
        // 检查数据表是否已初始化
        if (this.app && !this.app.isDataTableInitialized()) {
            this.modalManager.showToast('请先初始化数据表', 'error');
        } else if (this.dataManager.characters.length === 0) {
            this.modalManager.showToast('请先添加角色', 'error');
        } else {
            // 读取页面中间表单的输入值
            const characterId = parseInt(document.getElementById('triggerCharacter').value);
            const cost = parseFloat(document.getElementById('triggerCost').value) || 0;
            const action = document.getElementById('action').value || '技能';
            
            // 验证输入
            if (!characterId) {
                this.modalManager.showToast('请选择触发角色', 'error');
                return;
            }
            
            // 验证触发费用不能超过最大费用10c
            if (cost > 10) {
                this.modalManager.showToast('触发费用不能超过最大费用10c', 'error');
                return;
            }
            
            // 验证触发费用不能小于应用减费规则后的费用扣除
            const character = this.dataManager.getCharacterById(characterId);
            if (character) {
                // 计算基础费用
                const baseCost = character.skillCost;
                // 应用减费规则，计算实际的费用扣除额
                // 设置isPreAddValidation为true，确保在添加数据项之前能正确计算减费效果
                const actualCostDeduction = this.calculator.applyRuleCostChanges(characterId, baseCost, null, null, null, 1, true);
                
                // 确保触发费用不小于实际费用扣除额
                if (cost < actualCostDeduction) {
                    this.modalManager.showToast(`触发费用不能小于应用减费规则后的费用扣除（最小需要${actualCostDeduction}c）`, 'error');
                    return;
                }
            }
            
            // 检查触发费用是否小于上一行的剩余费用
            const dataItems = this.dataManager.getDataItems();
            if (dataItems.length > 0) {
                const lastItem = dataItems[dataItems.length - 1];
                if (cost < lastItem.remainingCost) {
                    this.modalManager.showToast(`触发费用不能小于上一行的剩余费用（当前剩余费用：${lastItem.remainingCost}c）`, 'error');
                    return;
                }
            }
            
            // 获取最后一个数据项的时间，并添加一个默认的时间间隔（1秒）
            const lastItemTime = this.dataManager.getLastItemTime();
            const newItemTime = lastItemTime + 1; // 默认时间间隔为1秒
            
            // 添加数据项
            const newItem = this.dataManager.addDataItem({
                characterId: characterId,
                cost: cost,
                action: action,
                time: newItemTime
            });
            
            // 重新计算所有数据项
            this.calculator.recalculateAllItems();
            
            // 刷新UI
            this.uiRenderer.refreshAll();
            
            // 更新状态信息
            if (this.app) {
                this.app.updateStatusInfo();
            }
            
            // 显示成功提示
            this.modalManager.showToast('数据项已添加', 'success');
        }
    }

    // 显示编辑数据项模态框
    showEditDataItemModal(itemId) {
        const item = this.dataManager.getDataItemById(itemId);
        if (!item) return;

        // 填充表单数据
        document.getElementById('editDataItemId').value = item.id;
        document.getElementById('editTriggerCharacter').value = item.characterId;
        document.getElementById('editAction').value = item.action;
        document.getElementById('editTime').value = item.time;
        document.getElementById('editTriggerCost').value = item.cost.toFixed(2);
        
        // 在编辑界面时间字段添加提示信息
        const timeField = document.getElementById('editTime');
        timeField.title = '时间修改将自动计算触发费用，确保时间大于上一个数据项';
        
        this.modalManager.showModal('editDataItemModal');
    }

    // 添加编辑表单实时计算事件监听器
    addEditFormRealTimeCalculation() {
        const timeInput = document.getElementById('editTime');
        const costInput = document.getElementById('editTriggerCost');
        const characterSelect = document.getElementById('editTriggerCharacter');
        
        // 时间输入变化时计算费用
        this.realTimeCalculateCost = (e) => {
            this.calculateCostFromTime();
        };
        
        // 费用输入变化时计算时间
        this.realTimeCalculateTime = (e) => {
            this.calculateTimeFromCost();
        };
        
        // 角色变化时重新计算
        this.realTimeRecalculateOnCharacterChange = (e) => {
            // 检查当前是时间还是费用驱动的计算
            const timeStr = timeInput.value;
            const costValue = parseFloat(costInput.value);
            
            if (!isNaN(costValue) && costValue > 0) {
                // 如果费用有值，重新计算时间
                this.calculateTimeFromCost();
            } else {
                // 否则重新计算费用
                this.calculateCostFromTime();
            }
        };
        
        // 添加事件监听器
        timeInput.addEventListener('input', this.realTimeCalculateCost);
        costInput.addEventListener('input', this.realTimeCalculateTime);
        characterSelect.addEventListener('change', this.realTimeRecalculateOnCharacterChange);
    }
    
    // 移除编辑表单实时计算事件监听器
    removeEditFormRealTimeCalculation() {
        const timeInput = document.getElementById('editTime');
        const costInput = document.getElementById('editTriggerCost');
        const characterSelect = document.getElementById('editTriggerCharacter');
        
        // 移除事件监听器
        if (timeInput) timeInput.removeEventListener('input', this.realTimeCalculateCost);
        if (costInput) costInput.removeEventListener('input', this.realTimeCalculateTime);
        if (characterSelect) characterSelect.removeEventListener('change', this.realTimeRecalculateOnCharacterChange);
        
        // 清空引用
        this.realTimeCalculateCost = null;
        this.realTimeCalculateTime = null;
        this.realTimeRecalculateOnCharacterChange = null;
    }
    
    // 从时间计算费用
    calculateCostFromTime() {
        const itemId = parseInt(document.getElementById('editDataItemId').value);
        const timeStr = document.getElementById('editTime').value;
        const characterId = parseInt(document.getElementById('editTriggerCharacter').value);
        
        if (!itemId || !timeStr || !characterId) return;
        
        // 获取原始数据项
        const originalItem = this.dataManager.getDataItemById(itemId);
        if (!originalItem) return;
        
        // 解析时间格式
        let timeInSeconds = 0;
        if (timeStr) {
            if (!isNaN(timeStr)) {
                timeInSeconds = parseFloat(timeStr);
            } else {
                const timeParts = timeStr.split(':');
                if (timeParts.length === 2) {
                    const minutes = parseInt(timeParts[0]) || 0;
                    const secondsParts = timeParts[1].split('.');
                    const seconds = parseInt(secondsParts[0]) || 0;
                    const milliseconds = parseInt(secondsParts[1]) || 0;
                    timeInSeconds = minutes * 60 + seconds + milliseconds / 1000;
                } else if (timeParts.length === 1) {
                    const secondsParts = timeParts[0].split('.');
                    const seconds = parseInt(secondsParts[0]) || 0;
                    const milliseconds = parseInt(secondsParts[1]) || 0;
                    timeInSeconds = seconds + milliseconds / 1000;
                }
            }
        }
        
        const character = this.dataManager.getCharacterById(characterId);
        if (character) {
            // 计算时间变化量
            const timeDiff = timeInSeconds - originalItem.time;
            // 根据时间变化量计算费用变化量（时间增加，费用减少；时间减少，费用增加）
            const costDiff = -timeDiff * character.costRecoveryRate;
            // 计算新费用
            const newCost = originalItem.cost + costDiff;
            // 确保费用不小于0
            const calculatedCost = Math.max(newCost, 0);
            
            // 更新费用输入框
            document.getElementById('editTriggerCost').value = calculatedCost.toFixed(2);
        }
    }
    
    // 从费用计算时间
    calculateTimeFromCost() {
        const itemId = parseInt(document.getElementById('editDataItemId').value);
        const costValue = parseFloat(document.getElementById('editTriggerCost').value);
        const characterId = parseInt(document.getElementById('editTriggerCharacter').value);
        
        if (!itemId || isNaN(costValue) || !characterId) return;
        
        // 获取原始数据项
        const originalItem = this.dataManager.getDataItemById(itemId);
        if (!originalItem) return;
        
        const character = this.dataManager.getCharacterById(characterId);
        if (character) {
            // 计算费用变化量
            const costDiff = costValue - originalItem.cost;
            // 根据费用变化量计算时间变化量（费用增加，时间减少；费用减少，时间增加）
            const timeDiff = costDiff / character.costRecoveryRate;
            // 计算新时间
            const newTime = originalItem.time - timeDiff;
            
            // 格式化时间为 00:00.000 格式
            const formatTime = (seconds) => {
                const minutes = Math.floor(seconds / 60);
                const remainingSeconds = seconds % 60;
                const milliseconds = Math.floor((remainingSeconds % 1) * 1000);
                return `${minutes.toString().padStart(2, '0')}:${Math.floor(remainingSeconds).toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
            };
            
            // 更新时间输入框
            document.getElementById('editTime').value = formatTime(newTime);
        }
    }
    
    // 处理编辑数据项
    handleEditDataItem(e) {
        e.preventDefault();

        const itemId = parseInt(document.getElementById('editDataItemId').value);
        
        // 获取原始数据项
        const originalItem = this.dataManager.getDataItemById(itemId);
        if (!originalItem) return;
        
        // 获取表单数据
        const characterId = parseInt(document.getElementById('editTriggerCharacter').value);
        let action = document.getElementById('editAction').value;
        const inputCost = parseFloat(document.getElementById('editTriggerCost').value);
        
        // 解析时间格式，支持 MM:SS.fff 格式
        const timeStr = document.getElementById('editTime').value;
        let timeInSeconds = 0;
        if (timeStr) {
            if (!isNaN(timeStr)) {
                timeInSeconds = parseFloat(timeStr);
            } else {
                const timeParts = timeStr.split(':');
                if (timeParts.length === 2) {
                    const minutes = parseInt(timeParts[0]) || 0;
                    const secondsParts = timeParts[1].split('.');
                    const seconds = parseInt(secondsParts[0]) || 0;
                    const milliseconds = parseInt(secondsParts[1]) || 0;
                    timeInSeconds = minutes * 60 + seconds + milliseconds / 1000;
                } else if (timeParts.length === 1) {
                    const secondsParts = timeParts[0].split('.');
                    const seconds = parseInt(secondsParts[0]) || 0;
                    const milliseconds = parseInt(secondsParts[1]) || 0;
                    timeInSeconds = seconds + milliseconds / 1000;
                }
            }
        }
        
        // 动作如果为空则默认技能
        if (!action || action.trim() === '') {
            action = '技能';
        }
        
        // 初始化表单数据
        const formData = {
            characterId: characterId,
            action: action,
            time: timeInSeconds,
            cost: inputCost
        };

        // 验证表单数据
        if (!this.validateDataItemForm(formData)) {
            this.modalManager.showToast('请填写所有必填字段', 'error');
            return;
        }

        // 确保费用为正数
        formData.cost = Math.max(formData.cost, 0);

        // 更新数据项
        this.dataManager.updateDataItem(itemId, formData);
        
        // 重新计算所有数据项
        this.calculator.recalculateAllItems();
        
        // 刷新UI
        this.uiRenderer.refreshAll();
        
        // 关闭模态框
        this.modalManager.hideModal('editDataItemModal');
        
        // 显示成功提示
        this.modalManager.showToast('数据项更新成功', 'success');
    }

    // 删除数据项
    deleteDataItem(itemId) {
        this.dataManager.deleteDataItem(itemId);
        
        // 重新计算所有数据项
        this.calculator.recalculateAllItems();
        
        // 刷新UI
        this.uiRenderer.refreshAll();
        
        // 显示成功提示
        this.modalManager.showToast('数据项删除成功', 'success');
    }

    // 批量删除数据项
    bulkDeleteDataItems() {
        const checkboxes = document.querySelectorAll('.data-item-checkbox:checked');
        if (checkboxes.length === 0) {
            this.modalManager.showToast('请选择要删除的数据项', 'warning');
            return;
        }

        this.modalManager.showConfirmModal(
            '确认批量删除',
            `确定要删除选中的 ${checkboxes.length} 个数据项吗？`,
            () => {
                const ids = Array.from(checkboxes).map(cb => parseInt(cb.dataset.id));
                this.dataManager.deleteDataItems(ids);
                
                // 重新计算所有数据项
                this.calculator.recalculateAllItems();
                
                // 刷新UI
                this.uiRenderer.refreshAll();
                
                // 显示成功提示
                this.modalManager.showToast('数据项批量删除成功', 'success');
            }
        );
    }

    // 验证数据项表单
    validateDataItemForm(formData) {
        // 验证所有必填字段
        if (isNaN(formData.characterId) || isNaN(formData.time) || !formData.action || formData.action.trim() === '' || isNaN(formData.cost)) {
            return false;
        }
        
        // 验证时间必须为正数
        if (formData.time <= 0) {
            return false;
        }
        
        // 检查触发费用是否小于上一行的剩余费用
        const dataItems = this.dataManager.getDataItems();
        if (dataItems.length > 0) {
            const lastItem = dataItems[dataItems.length - 1];
            if (formData.cost < lastItem.remainingCost) {
                this.modalManager.showToast(`触发费用不能小于上一行的剩余费用（当前剩余费用：${lastItem.remainingCost}c）`, 'error');
                return false;
            }
        }
        
        return true;
    }

    // 保存数据到本地存储
    saveData() {
        const success = this.dataManager.saveToLocalStorage();
        if (success) {
            this.modalManager.showToast('数据保存成功', 'success');
        } else {
            this.modalManager.showToast('数据保存失败', 'error');
        }
    }

    // 从本地存储加载数据
    loadData() {
        this.modalManager.showConfirmModal(
            '确认加载',
            '确定要加载本地存储的数据吗？当前数据将被覆盖。',
            () => {
                const success = this.dataManager.loadFromLocalStorage();
                if (success) {
                    // 重新计算所有数据项
                    this.calculator.recalculateAllItems();
                    
                    // 刷新UI
                    this.uiRenderer.refreshAll();
                    
                    this.modalManager.showToast('数据加载成功', 'success');
                } else {
                    this.modalManager.showToast('数据加载失败', 'error');
                }
            }
        );
    }

    // 导出数据为JSON文件
    exportData() {
        const data = this.dataManager.exportData();
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `blue-archive-calculator-data-${new Date().toISOString().slice(0, 10)}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        this.modalManager.showToast('数据导出成功', 'success');
    }

    showImportDataModal() {
        // 直接触发文件选择
        const importFileInput = document.getElementById('importFileInput');
        if (importFileInput) {
            // 确保已存在的元素也绑定了事件监听器
            importFileInput.onchange = (e) => {
                this.handleImportData(e);
            };
            importFileInput.click();
        } else {
            const newFileInput = document.createElement('input');
            newFileInput.type = 'file';
            newFileInput.id = 'importFileInput';
            newFileInput.accept = '.json';
            newFileInput.style.display = 'none';
            document.body.appendChild(newFileInput);
            
            // 添加文件选择事件监听器
            newFileInput.onchange = (e) => {
                this.handleImportData(e);
            };
            
            // 触发点击
            newFileInput.click();
        }
    }

    // 处理导入数据
    handleImportData(e) {
        // e.preventDefault();
        
        const fileInput = document.getElementById('importFileInput');
        if (!fileInput.files.length) {
            this.modalManager.showToast('请选择要导入的文件', 'error');
            return;
        }
        
        const file = fileInput.files[0];
        const reader = new FileReader();
        
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                const success = this.dataManager.importData(data);
                
                if (success) {
                    // 设置数据表为已初始化状态
                    if (this.app) {
                        this.app.setDataTableInitialized(true);
                    }
                    
                    // 重新计算所有数据项
                    this.calculator.recalculateAllItems();
                    
                    // 刷新UI
                    this.uiRenderer.refreshAll();
                    
                    // 显示成功提示
                    this.modalManager.showToast('数据导入成功', 'success');
                } else {
                    this.modalManager.showToast('数据导入失败', 'error');
                }
            } catch (error) {
                console.error('数据解析失败:', error);
                this.modalManager.showToast('数据文件格式错误', 'error');
            }
        };
          
        reader.readAsText(file);
    }
    
    // 清空所有筛选条件
    clearAllFilters() {
        // 清空筛选表单
        document.getElementById('filterCharacter').value = '';
        document.getElementById('filterStartTime').value = '';
        document.getElementById('filterEndTime').value = '';
        
        // 恢复原始数据
        if (this.app.tables.dataItems) {
            const allItems = this.dataManager.getDataItems();
            this.app.tables.dataItems.setData(allItems);
        } else {
            // 刷新所有UI
            this.uiRenderer.refreshAll();
        }
        
        // 显示提示
        this.modalManager.showToast('筛选条件已清空', 'success');
    }
    
    // 应用筛选条件
    applyFilters() {
        // 获取筛选条件
        const characterId = document.getElementById('filterCharacter').value;
        const startTimeStr = document.getElementById('filterStartTime').value;
        const endTimeStr = document.getElementById('filterEndTime').value;
        
        // 解析时间字符串为秒数
        const parseTime = (timeStr) => {
            if (!timeStr) return null;
            // 假设时间格式为 MM:SS.fff
            const parts = timeStr.split(':');
            if (parts.length !== 2) return null;
            const minutes = parseInt(parts[0]);
            const secondsParts = parts[1].split('.');
            const seconds = parseInt(secondsParts[0]);
            const milliseconds = parseInt(secondsParts[1] || 0);
            return minutes * 60 + seconds + milliseconds / 1000;
        };
        
        const startTime = parseTime(startTimeStr);
        const endTime = parseTime(endTimeStr);
        
        // 应用筛选
        const allItems = this.dataManager.getDataItems();
        let filteredData = allItems;
        
        // 筛选逻辑
        filteredData = filteredData.filter(item => {
            let match = true;
            if (characterId) match = match && item.characterId === parseInt(characterId);
            if (startTime !== null) {
                // 解析item.time为秒数进行比较
                const itemTime = parseTime(item.time);
                match = match && itemTime >= startTime;
            }
            if (endTime !== null) {
                // 解析item.time为秒数进行比较
                const itemTime = parseTime(item.time);
                match = match && itemTime <= endTime;
            }
            return match;
        });
        
        // 更新表格数据
        if (this.app.tables.dataItems) {
            this.app.tables.dataItems.setData(filteredData);
        } else {
            // 否则刷新所有UI
            this.uiRenderer.refreshAll();
        }
        
        // 显示筛选结果提示
        this.modalManager.showToast(`筛选完成，共显示 ${filteredData.length} 条数据`, 'success');
    }

    // 确认清空所有数据
    confirmClearAllData() {
        this.modalManager.showConfirmModal(
            '确认清空所有数据',
            '确定要清空所有数据吗？此操作不可恢复。',
            () => {
                this.dataManager.clearAllData();
                this.uiRenderer.refreshAll();
                this.modalManager.showToast('所有数据已清空', 'success');
            }
        );
    }

    // 运行模拟计算
    runSimulation() {
        const duration = parseInt(document.getElementById('simulation-duration').value) || 30;
        const characters = this.dataManager.getCharacters();
        
        if (characters.length === 0) {
            this.modalManager.showToast('请先添加角色', 'error');
            return;
        }
        
        // 显示加载状态
        this.uiRenderer.showLoading('正在进行模拟计算...');
        
        // 运行模拟
        setTimeout(() => {
            const results = this.calculator.calculateOptimalSkillOrder(characters, duration);
            
            // 显示模拟结果
            this.showSimulationResults(results);
            
            // 隐藏加载状态
            this.uiRenderer.hideLoading();
        }, 500);
    }

    // 显示模拟结果
    showSimulationResults(results) {
        const resultContainer = document.getElementById('simulation-results');
        if (!resultContainer) return;
        
        if (results.length === 0) {
            resultContainer.innerHTML = '<p class="text-center py-4 text-muted">模拟计算未找到可执行的技能</p>';
            return;
        }
        
        resultContainer.innerHTML = `
            <h5 class="mb-3">模拟结果 (${results.length} 个技能释放)</h5>
            <div class="simulation-results-list">
                ${results.map(result => `
                    <div class="simulation-result-item">
                        <span class="time">${result.time}s:</span>
                        <span class="character">${result.characterName}</span>
                        <span class="action">${result.action}</span>
                        <span class="cost">
                            ${result.costBefore} → 
                            <span class="cost-used">-${result.costUsed}</span> → 
                            ${result.costAfter}
                        </span>
                    </div>
                `).join('')}
            </div>
        `;
        
        // 滚动到结果区域
        this.uiRenderer.scrollToElement('simulation-results');
    }
}

// 导出EventListeners类作为默认导出
export default EventListeners;
