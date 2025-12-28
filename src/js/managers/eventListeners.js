// 事件监听器模块
class EventListeners {
    constructor(dataManager, calculator, uiRenderer, modalManager, app) {
        this.dataManager = dataManager;
        this.calculator = calculator;
        this.uiRenderer = uiRenderer;
        this.modalManager = modalManager;
        this.app = app;
        this.currentTargetRowId = null;
        this.skillBindingModalEventsAdded = false; // 标记是否已添加技能绑定模态框事件监听器
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

    // 初始化学生相关事件监听器
    initCharacterListeners() {
        // 添加学生按钮
        const addCharacterBtn = document.getElementById('add-character-btn');
        if (addCharacterBtn) {
            addCharacterBtn.addEventListener('click', () => this.showAddCharacterModal());
        }

        // 编辑学生按钮（动态添加，使用事件委托）
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

        // 添加学生表单提交
        const addCharacterForm = document.getElementById('addCharacterForm');
        if (addCharacterForm) {
            addCharacterForm.addEventListener('submit', (e) => this.handleAddCharacter(e));
        }

        // 编辑学生表单提交
        const editCharacterForm = document.getElementById('edit-character-form');
        if (editCharacterForm) {
            editCharacterForm.addEventListener('submit', (e) => this.handleEditCharacter(e));
        }
        
        // 添加学生复选框状态变化监听
        const isChargePercentageCheckbox = document.getElementById('isChargePercentage');
        if (isChargePercentageCheckbox) {
            isChargePercentageCheckbox.addEventListener('change', (e) => {
                const costIncreaseInput = document.getElementById('characterChargeIncrease');
                costIncreaseInput.disabled = !e.target.checked;
            });
        }

        // 保存编辑学生按钮
        const saveEditCharacterBtn = document.getElementById('saveEditCharacterBtn');
        if (saveEditCharacterBtn) {
            saveEditCharacterBtn.addEventListener('click', (e) => this.handleEditCharacter(e));
        }
        
        // 监听编辑学生模态框显示事件
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
        
        // 编辑学生模态框百分比复选框事件监听器
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
        
        // 添加附加数据按钮
        const addAdditionalDataBtn = document.getElementById('addAdditionalDataBtn');
        if (addAdditionalDataBtn) {
            addAdditionalDataBtn.addEventListener('click', () => this.showAddAdditionalDataModal());
        }
        
        // 添加附加数据保存按钮
        const saveAdditionalDataBtn = document.getElementById('saveAdditionalDataBtn');
        if (saveAdditionalDataBtn) {
            saveAdditionalDataBtn.addEventListener('click', () => this.saveAdditionalData());
        }
        


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
                
                // 清空学生关联规则
                this.dataManager.rules = [];
                
                // 清空持续回费设置
                this.dataManager.clearContinuousChargeData();
                
                // 重置导出信息
                this.dataManager.exportInfo = {
                    positions: ["", "", "", ""],
                    initialSkills: ["", "", ""],
                    videoAxisLink: ""
                };
                
                this.app.setDataTableInitialized(true);
                
                // 设置初始化时间
                this.dataManager.setInitializationTime(initialTimeSeconds);
                
                // 移除初始费用设定，费用从0开始
                this.dataManager.setCurrentCost(0);
                
                // 获取当前学生列表
                const characters = this.dataManager.getCharacters();
                
                // 初始化后在数据表中生成默认行，时间为初始化时间
                // 直接创建符合格式要求的默认数据项，即使没有学生也生成
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
                this.dataManager.pushDataItem(defaultItem);
                
                // 确保第一个数据项的时间间隔计算正确
                this.calculator.recalculateAllItems();
                
                // 刷新UI，确保所有更改都能正确显示
                this.uiRenderer.refreshAll();
                
                this.modalManager.hideAllModals();
                this.modalManager.showToast(`已成功初始化，初始时间：${initialTimeStr}`, 'success');
            });
        }
    }
    
    // 显示添加附加数据弹窗
    showAddAdditionalDataModal() {
        // 生成目标行选项
        this.generateTargetRowOptions();
        
        // 清空表单
        document.getElementById('additionalNote').value = '';
        document.getElementById('additionalImage').value = '';
        
        // 显示弹窗
        const modal = document.getElementById('addAdditionalDataModal');
        modal.classList.remove('hidden');
        modal.classList.add('show'); // 添加show类以触发CSS显示效果
        modal.style.display = 'flex'; // 确保显示，因为ModalManager会设置display: none
    }
    
    // 生成目标行选项
    generateTargetRowOptions() {
        const select = document.getElementById('targetRowSelect');
        const dataItems = this.dataManager.getDataItems();
        
        // 清空现有选项
        select.innerHTML = '<option value="">请选择要添加附加数据的行</option>';
        
        // 添加数据项选项，排除初始化行
        dataItems.forEach(item => {
            // 排除初始化行
            if (item.action === '初始化') {
                return;
            }
            
            const character = this.dataManager.getCharacterById(item.characterId);
            const characterName = character ? character.name : '未知学生';
            const option = document.createElement('option');
            option.value = item.id;
            try {
                const formattedTime = this.app.utils.format.timeMMSSfff(item.time);
                option.textContent = `${formattedTime} - ${characterName} - ${item.action}`;
                select.appendChild(option);
            } catch (error) {
                option.textContent = `${item.time} - ${characterName} - ${item.action}`;
                select.appendChild(option);
            }
        });
    }
    
    // 上传图片到ImgBB
    async uploadImageToImgBB(file) {
        try {
            // 注意：这里使用示例API密钥，实际使用时需要替换为自己的
            // 请访问 https://imgbb.com/ 注册并获取API密钥
            const API_KEY = '26ba61c466374bf9336a8f4427ed5a9a';
            
            const formData = new FormData();
            formData.append('image', file);
            
            const response = await fetch(`https://api.imgbb.com/1/upload?key=${API_KEY}`, {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            if (data.success) {
                return data.data.url;
            } else {
                throw new Error(data.error.message);
            }
        } catch (error) {
            console.error('图片上传失败:', error);
            this.modalManager.showToast('图片上传失败: ' + error.message, 'error');
            return null;
        }
    }
    
    // 保存附加数据
    async saveAdditionalData() {
        const targetRowId = parseInt(document.getElementById('targetRowSelect').value);
        const note = document.getElementById('additionalNote').value;
        const imageFile = document.getElementById('additionalImage').files[0];
        
        if (!targetRowId) {
            this.modalManager.showToast('请选择目标行', 'warning');
            return;
        }
        
        let imageUrl = '';
        
        // 如果选择了图片，上传到ImgBB
        if (imageFile) {
            imageUrl = await this.uploadImageToImgBB(imageFile);
            if (imageUrl === null) {
                // 图片上传失败，停止保存
                return;
            }
        }
        
        // 更新数据项的附加数据
        const updatedItem = this.dataManager.updateAdditionalData(targetRowId, {
            note: note,
            imageUrl: imageUrl
        });
        
        if (updatedItem) {
            this.modalManager.showToast('附加数据保存成功', 'success');
            
            // 刷新UI
            this.uiRenderer.refreshAll();
            
            // 关闭弹窗
            this.modalManager.hideModal('addAdditionalDataModal');
        } else {
            this.modalManager.showToast('保存失败，目标行不存在', 'error');
        }
    }
    
    // 查看附加数据
    viewAdditionalData(dataItemId) {
        const dataItem = this.dataManager.getDataItemById(dataItemId);
        if (!dataItem || !dataItem.additionalData) {
            this.modalManager.showToast('该数据项没有附加数据', 'info');
            return;
        }
        
        const additionalData = dataItem.additionalData;
        
        // 填充数据到查看窗口
        const noteElement = document.getElementById('viewAdditionalNote');
        const imageElement = document.getElementById('viewAdditionalImage');
        
        // 显示备注
        noteElement.textContent = additionalData.note || '无备注';
        
        // 显示图片
        if (additionalData.imageUrl) {
            imageElement.innerHTML = `<img src="${additionalData.imageUrl}" alt="附加图片" class="max-w-full max-h-60 rounded">`;
        } else {
            imageElement.innerHTML = '<p class="text-gray-500">无图片</p>';
        }
        
        // 显示弹窗
        const modal = document.getElementById('viewAdditionalDataModal');
        modal.classList.remove('hidden');
        modal.classList.add('show'); // 添加show类以触发CSS显示效果
        modal.style.display = 'flex'; // 确保显示，因为ModalManager会设置display: none
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
            exportDataBtn.addEventListener('click', () => this.showImportExportModal('export'));
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
        
        // 数据筛选展开/收起按钮
        const toggleFilterBtn = document.getElementById('toggleFilterBtn');
        if (toggleFilterBtn) {
            toggleFilterBtn.addEventListener('click', () => {
                const filterContent = document.getElementById('filterContent');
                // 使用更通用的选择器，确保始终能找到图标元素
                const icon = toggleFilterBtn.querySelector('i.fas');
                
                if (filterContent.classList.contains('hidden')) {
                    // 展开筛选面板
                    filterContent.classList.remove('hidden');
                    if (icon) {
                        icon.classList.add('rotate-180');
                    }
                } else {
                    // 收起筛选面板
                    filterContent.classList.add('hidden');
                    if (icon) {
                        icon.classList.remove('rotate-180');
                    }
                }
            });
        }
        
        // 添加数据项展开/收起按钮
        const toggleAddItemBtn = document.getElementById('toggleAddItemBtn');
        if (toggleAddItemBtn) {
            toggleAddItemBtn.addEventListener('click', () => {
                const addItemContent = document.getElementById('addItemContent');
                // 使用更通用的选择器，确保始终能找到图标元素
                const icon = toggleAddItemBtn.querySelector('.fa-chevron-up, .fa-chevron-down') || toggleAddItemBtn.querySelector('i.fas');
                
                if (addItemContent.classList.contains('hidden')) {
                    // 展开添加数据项面板
                    addItemContent.classList.remove('hidden');
                    if (icon) {
                        icon.classList.remove('rotate-180');
                        icon.classList.add('fa-chevron-up');
                        icon.classList.remove('fa-chevron-down');
                    }
                } else {
                    // 收起添加数据项面板
                    addItemContent.classList.add('hidden');
                    if (icon) {
                        icon.classList.add('rotate-180');
                        icon.classList.remove('fa-chevron-up');
                        icon.classList.add('fa-chevron-down');
                    }
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
        
        // 前往作者主页按钮
        const authorHomepageBtn = document.getElementById('authorHomepage');
        if (authorHomepageBtn) {
            authorHomepageBtn.addEventListener('click', () => {
                window.open('https://space.bilibili.com/92154003?spm_id_from=333.1007.0.0', '_blank');
            });
        }
        
        // 应用筛选按钮
        const applyFilterBtn = document.getElementById('applyFilterBtn');
        if (applyFilterBtn) {
            applyFilterBtn.addEventListener('click', () => {
                this.applyFilters();
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
               

        
        // 撤销操作按钮
        const undoActionBtn = document.getElementById('undoAction');
        if (undoActionBtn) {
            undoActionBtn.addEventListener('click', () => {
                if (this.dataManager.undo()) {
                    // 重新渲染UI
                    this.uiRenderer.refreshAll();
                    // 更新状态信息
                    if (this.app) {
                        this.app.updateStatusInfo();
                    }
                    // 显示成功提示
                    this.modalManager.showToast('操作已撤销', 'success');
                } else {
                    this.modalManager.showToast('没有可撤销的操作', 'warning');
                }
            });
        }
        
        // 重做操作按钮
        const redoActionBtn = document.getElementById('redoAction');
        if (redoActionBtn) {
            redoActionBtn.addEventListener('click', () => {
                if (this.dataManager.redo()) {
                    // 重新渲染UI
                    this.uiRenderer.refreshAll();
                    // 更新状态信息
                    if (this.app) {
                        this.app.updateStatusInfo();
                    }
                    // 显示成功提示
                    this.modalManager.showToast('操作已重做', 'success');
                } else {
                    this.modalManager.showToast('没有可重做的操作', 'warning');
                }
            });
        }
        
        // 监听状态变化事件，更新撤销/重做按钮状态
        document.addEventListener('stateChanged', (event) => {
            const { canUndo, canRedo } = event.detail;
            
            if (undoActionBtn) {
                undoActionBtn.disabled = !canUndo;
            }
            
            if (redoActionBtn) {
                redoActionBtn.disabled = !canRedo;
            }
        });
        
        // 初始化撤销/重做按钮状态
        if (undoActionBtn) {
            undoActionBtn.disabled = !this.dataManager.canUndo();
        }
        
        if (redoActionBtn) {
            redoActionBtn.disabled = !this.dataManager.canRedo();
        }
        
        // 学生预设按钮
        const characterPresetsBtn = document.getElementById('characterPresets');
        if (characterPresetsBtn) {
            characterPresetsBtn.addEventListener('click', () => {
                this.showCharacterPresetsModal();
            });
        }
        
        // 显示时间轴按钮
        const timelineViewBtn = document.getElementById('timelineViewBtn');
        if (timelineViewBtn) {
            timelineViewBtn.addEventListener('click', () => {
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
                
                // 只在第一次打开模态框时添加事件监听器
                if (!this.skillBindingModalEventsAdded) {
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
                    this.skillBindingModalEventsAdded = true;
                }
            });
        }
        
        // 学生特殊技能按钮
        const specialSkillsBtn = document.getElementById('specialSkillsBtn');
        if (specialSkillsBtn) {
            specialSkillsBtn.addEventListener('click', () => {
                // 显示学生特殊技能模态框
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
        
        // 显示完整数据按钮
        const showCompleteDataBtn = document.getElementById('showCompleteDataBtn');
        if (showCompleteDataBtn) {
            showCompleteDataBtn.addEventListener('click', () => {
                // 切换显示完整数据状态
                const currentState = this.dataManager.getShowCompleteData();
                const newState = !currentState;
                
                // 更新数据管理器状态
                this.dataManager.setShowCompleteData(newState);
                
                // 切换中间数据管理面板中除数据表外的其他元素的显示/隐藏
                const addItemSection = document.getElementById('toggleAddItemBtn').parentElement;
                const ruleSection = document.getElementById('rulesTable').parentElement;
                const filterSection = document.getElementById('toggleFilterBtn').parentElement;
                
                if (newState) {
                    // 隐藏其他元素
                    addItemSection.style.display = 'none';
                    ruleSection.style.display = 'none';
                    filterSection.style.display = 'none';
                    
                    // 更新按钮文本
                    showCompleteDataBtn.innerHTML = '<i class="fas fa-table"></i> 恢复默认视图';
                    this.modalManager.showToast('已显示完整数据', 'success');
                    
                    // 显示游戏模式视图按钮
                    const gameModeBtn = document.getElementById('gameModeViewBtn');
                    if (gameModeBtn) {
                        gameModeBtn.classList.remove('hidden');
                        // 重置游戏模式按钮状态，确保显示正确的文本和样式
                        gameModeBtn.innerHTML = '<i class="fas fa-gamepad"></i> 游戏模式视图';
                        gameModeBtn.classList.remove('bg-primary', 'hover:bg-primary/80', 'text-white');
                        gameModeBtn.classList.add('bg-gray-100', 'hover:bg-gray-200');
                        // 重置游戏模式状态
                        this.isGameModeActive = false;
                        // 确保所有列可见
                        this.restoreAllColumns();
                    }
                } else {
                    // 显示其他元素
                    addItemSection.style.display = 'block';
                    ruleSection.style.display = 'block';
                    filterSection.style.display = 'block';
                    
                    // 更新按钮文本
                    showCompleteDataBtn.innerHTML = '<i class="fas fa-table"></i> 显示完整数据';
                    this.modalManager.showToast('已恢复默认视图', 'success');
                    
                    // 隐藏游戏模式视图按钮
                    const gameModeBtn = document.getElementById('gameModeViewBtn');
                    if (gameModeBtn) {
                        gameModeBtn.classList.add('hidden');
                        // 恢复所有列的可见性
                        this.restoreAllColumns();
                        // 重置游戏模式状态
                        this.isGameModeActive = false;
                    }
                }
                
                // 刷新UI
                this.uiRenderer.refreshAll();
            });
        }
        
        // 游戏模式视图按钮
        const gameModeViewBtn = document.getElementById('gameModeViewBtn');
        if (gameModeViewBtn) {
            // 初始化游戏模式状态
            this.isGameModeActive = false;
            
            gameModeViewBtn.addEventListener('click', () => {
                // 切换游戏模式状态
                this.isGameModeActive = !this.isGameModeActive;
                
                // 控制指定列的可见性
                this.toggleGameModeColumns(this.isGameModeActive);
                
                // 更新按钮样式和文本
                if (this.isGameModeActive) {
                    gameModeViewBtn.innerHTML = '<i class="fas fa-eye-slash"></i> 关闭游戏模式';
                    gameModeViewBtn.classList.remove('bg-gray-100', 'hover:bg-gray-200');
                    gameModeViewBtn.classList.add('bg-primary', 'hover:bg-primary/80', 'text-white');
                } else {
                    gameModeViewBtn.innerHTML = '<i class="fas fa-gamepad"></i> 游戏模式视图';
                    gameModeViewBtn.classList.remove('bg-primary', 'hover:bg-primary/80', 'text-white');
                    gameModeViewBtn.classList.add('bg-gray-100', 'hover:bg-gray-200');
                }
            });
        }
        
        // 导出更多信息按钮
        const toggleExportConfigBtn = document.getElementById('toggleExportConfigBtn');
        if (toggleExportConfigBtn) {
            toggleExportConfigBtn.addEventListener('click', () => {
                const exportConfigInfo = document.getElementById('exportConfigInfo');
                const icon = toggleExportConfigBtn.querySelector('i.fas');
                const textSpan = toggleExportConfigBtn.querySelector('span');
                
                if (exportConfigInfo.classList.contains('hidden')) {
                    // 显示配置信息
                    exportConfigInfo.classList.remove('hidden');
                    if (icon) {
                        icon.classList.remove('fa-plus');
                        icon.classList.add('fa-minus');
                    }
                    if (textSpan) {
                        textSpan.textContent = '隐藏导出信息';
                    }
                } else {
                    // 隐藏配置信息
                    exportConfigInfo.classList.add('hidden');
                    if (icon) {
                        icon.classList.remove('fa-minus');
                        icon.classList.add('fa-plus');
                    }
                    if (textSpan) {
                        textSpan.textContent = '导出更多信息';
                    }
                }
            });
        }
        

        
        // 复制最后一项按钮
        const copyLastItemBtn = document.getElementById('copyLastItemBtn');
        if (copyLastItemBtn) {
            copyLastItemBtn.addEventListener('click', () => {
                // 检查数据表是否已初始化
                if (this.app && !this.app.isDataTableInitialized()) {
                    this.modalManager.showToast('请先初始化数据表', 'error');
                } else if (this.dataManager.characters.length === 0) {
                    this.modalManager.showToast('请先添加学生', 'error');
                } else {
                    const dataItems = this.dataManager.getAllDataItems();
                    if (dataItems.length === 0) {
                        this.modalManager.showToast('没有数据项可复制', 'warning');
                        return;
                    }
                    
                    const lastItem = dataItems[dataItems.length - 1];
                    
                    // 验证触发费用不能超过最大费用10c
                    if (lastItem.cost > 10) {
                        this.modalManager.showToast('触发费用不能超过最大费用10c', 'error');
                        return;
                    }
                    
                    // 验证触发费用不能小于应用减费规则后的费用扣除
                    const character = this.dataManager.getCharacterById(lastItem.characterId);
                    if (character) {
                        // 计算基础费用
                        const baseCost = character.skillCost;
                        // 应用减费规则，计算实际的费用扣除额
                        // 设置isPreAddValidation为true，确保在添加数据项之前能正确计算减费效果
                        const actualCostDeduction = this.calculator.applyRuleCostChanges(lastItem.characterId, baseCost, null, null, null, 1, true);
                        
                        // 确保触发费用不小于实际费用扣除额
                        if (lastItem.cost < actualCostDeduction) {
                            this.modalManager.showToast(`触发费用不能小于应用减费规则后的费用扣除（最小需要${actualCostDeduction}c）`, 'error');
                            return;
                        }
                    }
                    
                    // 检查触发费用是否小于上一行的剩余费用
                    if (dataItems.length > 1) {
                        const secondLastItem = dataItems[dataItems.length - 2];
                        if (lastItem.cost < secondLastItem.remainingCost) {
                            this.modalManager.showToast(`触发费用不能小于上一行的剩余费用（当前剩余费用：${secondLastItem.remainingCost}c）`, 'error');
                            return;
                        }
                    }
                    
                    const newItem = {
                        characterId: lastItem.characterId,
                        cost: lastItem.cost,
                        action: lastItem.action,
                        time: lastItem.time + 1 // 默认时间间隔为1秒
                    };
                    
                    this.dataManager.addDataItem(newItem);
                    
                    // 重新计算所有数据项
                    this.calculator.recalculateAllItems();
                    
                    // 刷新UI
                    this.uiRenderer.refreshAll();
                    
                    // 更新状态信息
                    if (this.app) {
                        this.app.updateStatusInfo();
                    }
                    
                    this.modalManager.showToast('最后一项已复制', 'success');
                }
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

    // 显示添加学生模态框
    showAddCharacterModal() {
        this.modalManager.showModal('addCharacterModal');
        
        // 根据复选框初始状态禁用/启用回费增加百分比输入框
        const checkbox = document.getElementById('isChargePercentage');
        const costIncreaseInput = document.getElementById('characterChargeIncrease');
        costIncreaseInput.disabled = !checkbox.checked;
    }

    // 显示编辑学生模态框
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

    // 处理添加学生
    handleAddCharacter(e) {
        e.preventDefault();

        // 检查学生数量是否已达上限
        if (this.dataManager.getCharacters().length >= 6) {
            this.modalManager.showToast('学生数量已达上限，最多只能添加6个学生', 'error');
            return;
        }

        // 获取复选框状态
        const isChargePercentageChecked = document.getElementById('isChargePercentage').checked;
        
        // 检查是否已有其他学生启用了回费
        const existingChargingCharacter = this.dataManager.getCharacters().find(character => character.isChargePercentage);
        
        // 如果当前学生启用了回费且已有其他学生启用，则显示提示
        if (isChargePercentageChecked && existingChargingCharacter) {
            this.modalManager.showToast(`已有学生"${existingChargingCharacter.name}"启用了回费，只能有一个学生启用此功能`, 'error');
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
            // 添加学生
            const character = this.dataManager.addCharacter(formData);
            
            // 刷新UI
            this.uiRenderer.refreshAll();
            
            // 关闭模态框
            this.modalManager.hideModal('addCharacterModal');
            
            // 显示成功提示
            this.modalManager.showToast('学生添加成功', 'success');
            
            // 如果启用了回费，显示提醒
            if (isChargePercentageChecked) {
                this.modalManager.showToast(
                    `学生 ${character.name} 已设置回费增加：${character.costIncrease}%，` +
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

    // 处理编辑学生
    handleEditCharacter(e) {
        e.preventDefault();

        const characterId = parseInt(document.getElementById('edit-character-id').value);
        
        // 获取复选框状态
        const isChargePercentageChecked = document.getElementById('edit-is-charge-percentage').checked;
        
        // 检查是否已有其他学生启用了回费，且该学生不是当前编辑的学生
        const existingChargingCharacter = this.dataManager.getCharacters().find(character => 
            character.isChargePercentage && character.id !== characterId
        );
        
        // 如果当前学生启用了回费且已有其他学生启用，则显示提示
        if (isChargePercentageChecked && existingChargingCharacter) {
            this.modalManager.showToast(`已有学生"${existingChargingCharacter.name}"启用了回费，只能有一个学生启用此功能`, 'error');
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
            // 更新学生
            const updatedCharacter = this.dataManager.updateCharacter(characterId, formData);
            
            // 刷新UI
            this.uiRenderer.refreshAll();
            
            // 关闭模态框
            this.modalManager.hideModal('editCharacterModal');
            
            // 高亮显示更新后的学生行
            if (updatedCharacter) {
                this.uiRenderer.highlightElement(`character-${updatedCharacter.id}`);
            }
            
            // 显示成功提示
            this.modalManager.showToast('学生更新成功', 'success');
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
    
    // 确认删除学生
    confirmDeleteCharacter(characterId) {
        const character = this.dataManager.getCharacterById(characterId);
        if (!character) return;

        // 检查是否有数据项引用了该学生
        const dataItems = this.dataManager.getAllDataItems();
        const hasReferences = dataItems.some(item => item.characterId === characterId);

        if (hasReferences) {
            // 如果有引用，显示提示信息
            this.modalManager.showToast(
                `学生 "${character.name}" 已被引用，请删除相关数据项后再删除学生，或选择编辑学生属性。`,
                'error'
            );
        } else {
            // 如果没有引用，显示确认删除的模态框
            this.modalManager.showConfirmModal(
                '确认删除',
                `确定要删除学生 "${character.name}" 吗？相关规则也会被删除。`,
                () => {
                    this.dataManager.deleteCharacter(characterId);
                    this.uiRenderer.refreshAll();
                    this.modalManager.showToast('学生删除成功', 'success');
                }
            );
        }
    }
    
    // 显示学生预设模态框
    showCharacterPresetsModal() {
        const modal = document.getElementById('characterPresetsModal');
        const presetsList = document.getElementById('presetsList');
        const presetCount = document.getElementById('presetCount');
        
        // 更新已添加学生数量
        presetCount.textContent = this.dataManager.getCharacters().length;
        
        // 清空现有列表
        presetsList.innerHTML = '';
        
        // 获取预设学生
        const presets = this.dataManager.getPresetCharacters();
        
        // 生成预设学生列表
        if (presets.length > 0) {
            presets.forEach(preset => {
                const isAdded = this.dataManager.isCharacterAdded(preset.name);
                
                const presetItem = document.createElement('div');
                presetItem.className = 'flex justify-between items-center p-3 bg-gray-50 rounded shadow-sm';
                presetItem.innerHTML = `
                    <div class="flex-1">
                        <h5 class="font-medium">${preset.name}</h5>
                        <div class="text-sm text-gray-500 mt-1">
                            <div>回费速度: ${preset.costRecoveryRate.toFixed(2)} c/s</div>
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
            
            // 添加预设学生按钮事件
            const addPresetBtns = presetsList.querySelectorAll('.add-preset-btn');
            addPresetBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const presetName = e.target.closest('.add-preset-btn').dataset.name;
                    this.addPresetCharacter(presetName);
                });
            });
        } else {
            // 预设学生列表为空时显示提示信息
            presetsList.innerHTML = `
                <div class="text-center py-12 bg-gray-50 rounded-lg">
                    <div class="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-clock text-2xl text-blue-600"></i>
                    </div>
                    <h5 class="text-lg font-semibold text-gray-800 mb-2">预设学生功能开发中</h5>
                    <p class="text-gray-500">学生预设功能将在后续版本更新，敬请期待</p>
                </div>
            `;
        }
        
        // 显示模态框
        this.modalManager.showModal('characterPresetsModal');
    }
    
    // 添加预设学生
    addPresetCharacter(presetName) {
        // 检查学生数量是否已达上限
        if (this.dataManager.getCharacters().length >= 6) {
            this.modalManager.showToast('学生数量已达上限，最多只能添加6个学生', 'error');
            return;
        }
        
        // 获取预设学生数据
        const presets = this.dataManager.getPresetCharacters();
        const preset = presets.find(p => p.name === presetName);
        
        if (preset) {
            // 添加学生
            this.dataManager.addCharacter(preset);
            
            // 刷新UI
            this.uiRenderer.refreshAll();
            
            // 更新预设模态框
            this.showCharacterPresetsModal();
            
            // 显示成功提示
            this.modalManager.showToast(`学生 "${preset.name}" 添加成功`, 'success');
        }
    }
    
    // 确认清空所有学生
    confirmClearAllCharacters() {
        this.modalManager.showConfirmModal(
            '确认清空',
            '确定要清空所有学生吗？此操作不可撤销。',
            () => {
                this.dataManager.clearAllCharacters();
                this.uiRenderer.refreshAll();
                this.modalManager.hideModal('characterPresetsModal');
                this.modalManager.showToast('所有学生已清空', 'success');
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
        
        // 获取数据项和对应的学生
        const dataItem = this.dataManager.dataItems.find(item => item.id == selectedRowId);
        if (!dataItem) {
            selectedRowInfoEl.innerHTML = '<p class="text-sm text-red-500">未找到选中的数据项</p>';
            return;
        }
        
        const character = this.dataManager.getCharacterById(dataItem.characterId);
        if (!character) {
            selectedRowInfoEl.innerHTML = '<p class="text-sm text-red-500">未找到对应的学生</p>';
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
        this.dataManager.setContinuousChargeData(continuousChargeData);
        
        // 显示成功提示
        this.modalManager.showToast('持续回费设置已保存', 'success');
        
        // 关闭模态框
        this.modalManager.hideModal('skillBindingModal');
        
        // 重新计算数据项
        this.calculator.recalculateAllItems();
        
        // 清空选中的目标行ID，确保下次操作时需要重新选择目标行
        window.selectedTargetRowId = null;
        
        // 清空表单字段的值，确保下次操作时表单是干净的
        document.getElementById('delayTime').value = '';
        document.getElementById('duration').value = '';
        document.getElementById('recoveryIncrease').value = '';
        
        // 重新为所有目标行单选框添加事件监听，确保重新渲染后仍能正常工作
        setTimeout(() => {
            const radioButtons = document.querySelectorAll('.target-row-radio');
            radioButtons.forEach(radio => {
                radio.addEventListener('change', (e) => {
                    // 保存选中的目标行ID
                    window.selectedTargetRowId = parseInt(e.target.value);

                });
            });
        }, 100);
        
        // 刷新数据表，显示更新后的数据
        this.uiRenderer.refreshAll();
    }
    
    // 验证学生表单
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
        
        // 更新学生选择下拉框
        this.updateRuleCharacterSelectors();
        
        // 添加规则类型切换事件监听器
        const ruleTypeSelect = document.getElementById('ruleType');
        if (ruleTypeSelect) {
            // 移除旧的事件监听器（防止重复绑定）
            ruleTypeSelect.onchange = null;
            
            // 添加新的事件监听器
            ruleTypeSelect.onchange = (e) => this.handleRuleTypeChange(e.target.value);
        }
        
        // 自动读取选中的目标行，并设置触发学生
        // 设置触发学生
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
        
        // 根据选择的规则类型显示/隐藏触发学生字段
        const sourceCharacterContainer = document.getElementById('ruleSourceCharacterContainer');
        if (sourceCharacterContainer) {
            // 减费效果和回费效果不需要触发学生
            if (ruleType === 'costReduction' || ruleType === 'chargeIncrease') {
                sourceCharacterContainer.classList.add('hidden');
                // 禁用触发学生选择
                const select = document.getElementById('ruleSourceCharacter');
                if (select) {
                    select.disabled = true;
                }
            } else {
                sourceCharacterContainer.classList.remove('hidden');
                // 启用触发学生选择
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
                            activationTimeInput.value = parseFloat(this.selectedRowTime).toFixed(3);
                        }
                    }
                    // 生成学生多选选项
                    this.generateChargeIncreaseTargetOptions();
                }
                break;
        }
    }
    
    // 更新规则表单中的学生选择器
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
                    newEmptyOption.textContent = '请选择学生';
                    select.appendChild(newEmptyOption);
                }
                
                // 添加学生选项
                characters.forEach(character => {
                    const option = document.createElement('option');
                    option.value = character.id;
                    option.textContent = character.name;
                    select.appendChild(option);
                });
            }
        });
    }
    
    // 生成回费效果的学生多选选项
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
                
                // 限制最多选择6个学生
                checkbox.addEventListener('change', () => {
                    const checkedCheckboxes = container.querySelectorAll('input[type="checkbox"]:checked');
                    if (checkedCheckboxes.length > 6) {
                        checkbox.checked = false;
                        this.modalManager.showToast('最多可选择6个学生', 'warning');
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

        
        const ruleType = document.getElementById('ruleType').value;
        const ruleSourceCharacterValue = document.getElementById('ruleSourceCharacter').value;
        const characterId = ruleSourceCharacterValue ? parseInt(ruleSourceCharacterValue) : 0;
        

        
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
                    characterId: this.currentTargetRowId, // 存储目标行的ID，而不是触发学生的ID
                    changeValue: changeValue
                };
                break;
            case 'chargeIncrease':
                // 获取选中的学生
                const container = document.getElementById('ciTargetScopeContainer');
                const checkedCheckboxes = container.querySelectorAll('input[type="checkbox"]:checked');
                const targetCharacterIds = Array.from(checkedCheckboxes).map(cb => parseInt(cb.value));
                
                // 检查是否至少选择了一个学生
                if (targetCharacterIds.length === 0) {
                    this.modalManager.showToast('请至少选择一个目标学生', 'error');
                    return;
                }
                
                ruleData = {
                    type: 'chargeIncrease',
                    // 回费效果不需要触发学生
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

                this.modalManager.showToast('请选择规则类型', 'error');
                return;
        }


        
        // 检查每个字段的值


        
        // 根据规则类型打印相关字段信息
        switch (ruleType) {
            case 'costReduction':
                const crTargetCharacter = document.getElementById('crTargetCharacter');
                const crEffectCount = document.getElementById('crEffectCount');
                const crValue = document.getElementById('crValue');



                break;


            case 'costChange':
                const ccValue = document.getElementById('ccValue');
                if (ccValue) {



                }
                break;
            case 'chargeIncrease':
                const ciActivationTime = document.getElementById('ciActivationTime');
                const ciDuration = document.getElementById('ciDuration');
                const ciChargeType = document.getElementById('ciChargeType');
                const ciValue = document.getElementById('ciValue');
                const ciEffectType = document.getElementById('ciEffectType');





                // 直接获取选中的学生ID进行打印，避免变量作用域问题
                const checkedBoxes = document.querySelectorAll('#ciTargetScopeContainer input[type="checkbox"]:checked');
                const selectedCharacterIds = Array.from(checkedBoxes).map(cb => parseInt(cb.value));

                break;
        }
        
        // 验证表单数据
        if (!this.validateRuleForm(ruleData)) {


            this.modalManager.showToast('请填写所有必填字段', 'error');
            return;
        }


        
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
        
        // 对于需要触发学生的规则类型，验证characterId
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
            this.modalManager.showToast('请先添加学生', 'error');
        } else {
            // 读取页面中间表单的输入值
            const characterId = parseInt(document.getElementById('triggerCharacter').value);
            const cost = parseFloat(document.getElementById('triggerCost').value) || 0;
            const action = document.getElementById('action').value || '技能';
            
            // 验证输入
            if (!characterId) {
                this.modalManager.showToast('请选择触发学生', 'error');
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
        this.handleTimeChange = () => {
            this.calculateCostFromTime();
        };
        
        // 费用输入变化时计算时间
        this.handleCostChange = () => {
            this.calculateTimeFromCost();
        };
        
        // 学生变化时重新计算
        this.handleCharacterChange = () => {
            this.calculateCostFromTime();
        };
        
        // 添加事件监听器
        timeInput.addEventListener('input', this.handleTimeChange);
        costInput.addEventListener('input', this.handleCostChange);
        characterSelect.addEventListener('change', this.handleCharacterChange);
    }
    
    // 移除编辑表单实时计算事件监听器
    removeEditFormRealTimeCalculation() {
        const timeInput = document.getElementById('editTime');
        const costInput = document.getElementById('editTriggerCost');
        const characterSelect = document.getElementById('editTriggerCharacter');
        
        // 移除事件监听器
        if (timeInput) timeInput.removeEventListener('input', this.handleTimeChange);
        if (costInput) costInput.removeEventListener('input', this.handleCostChange);
        if (characterSelect) characterSelect.removeEventListener('change', this.handleCharacterChange);
        
        // 清空引用
        this.handleTimeChange = null;
        this.handleCostChange = null;
        this.handleCharacterChange = null;
    }
    
    // 切换游戏模式下的列可见性
    toggleGameModeColumns(isActive) {
        const table = document.getElementById('dataItemsTable');
        if (!table) return;
        
        // 获取表格的表头和所有数据行
        const thead = table.querySelector('thead');
        const tbody = table.querySelector('tbody');
        
        if (!thead || !tbody) return;
        
        // 获取表头行
        const headerRow = thead.querySelector('tr');
        if (!headerRow) return;
        
        // 获取所有表头单元格
        const headerCells = Array.from(headerRow.querySelectorAll('th'));
        
        // 定义要隐藏的列名（根据field名匹配）
        const columnsToHide = ['timeInterval', 'costDeduction', 'remainingCost'];
        
        // 定义要隐藏的列索引
        const columnsToHideIndexes = [];
        
        // 找到要隐藏的列索引
        headerCells.forEach((cell, index) => {
            const field = cell.dataset.field;
            if (columnsToHide.includes(field)) {
                columnsToHideIndexes.push(index);
            }
        });
        
        // 控制表头列的可见性
        columnsToHideIndexes.forEach(index => {
            const headerCell = headerCells[index];
            if (headerCell) {
                headerCell.style.display = isActive ? 'none' : '';
            }
        });
        
        // 控制数据行中对应列的可见性
        const dataRows = tbody.querySelectorAll('tr');
        dataRows.forEach(row => {
            const cells = Array.from(row.querySelectorAll('td'));
            columnsToHideIndexes.forEach(index => {
                const cell = cells[index];
                if (cell) {
                    cell.style.display = isActive ? 'none' : '';
                }
            });
        });
    }
    
    // 恢复所有列的可见性
    restoreAllColumns() {
        const table = document.getElementById('dataItemsTable');
        if (!table) return;
        
        // 获取表格的表头和所有数据行
        const thead = table.querySelector('thead');
        const tbody = table.querySelector('tbody');
        
        if (!thead || !tbody) return;
        
        // 获取表头行
        const headerRow = thead.querySelector('tr');
        if (!headerRow) return;
        
        // 获取所有表头单元格
        const headerCells = Array.from(headerRow.querySelectorAll('th'));
        
        // 定义要恢复的列名
        const columnsToRestore = ['timeInterval', 'costDeduction', 'remainingCost'];
        
        // 定义要恢复的列索引
        const columnsToRestoreIndexes = [];
        
        // 找到要恢复的列索引
        headerCells.forEach((cell, index) => {
            const field = cell.dataset.field;
            if (columnsToRestore.includes(field)) {
                columnsToRestoreIndexes.push(index);
            }
        });
        
        // 恢复表头列的可见性
        columnsToRestoreIndexes.forEach(index => {
            const headerCell = headerCells[index];
            if (headerCell) {
                headerCell.style.display = '';
            }
        });
        
        // 恢复数据行中对应列的可见性
        const dataRows = tbody.querySelectorAll('tr');
        dataRows.forEach(row => {
            const cells = Array.from(row.querySelectorAll('td'));
            columnsToRestoreIndexes.forEach(index => {
                const cell = cells[index];
                if (cell) {
                    cell.style.display = '';
                }
            });
        });
    }
    
    // 从时间计算费用
    calculateCostFromTime() {
        // 获取表单数据
        const itemId = parseInt(document.getElementById('editDataItemId').value);
        const timeStr = document.getElementById('editTime').value;
        const characterId = parseInt(document.getElementById('editTriggerCharacter').value);
        
        // 验证输入
        if (!itemId || !timeStr || !characterId) return;
        
        // 获取所有数据项和原始数据项
        const allItems = this.dataManager.getAllDataItems();
        const originalItem = this.dataManager.getDataItemById(itemId);
        if (!originalItem) return;
        
        // 找到当前数据项在列表中的索引
        const currentIndex = allItems.findIndex(item => item.id === originalItem.id);
        if (currentIndex === -1) return;
        
        // 解析时间为秒数
        const timeInSeconds = this.parseTimeString(timeStr);
        
        // 重置规则计数器
        this.calculator.resetRuleCounters();
        
        // 获取上一个数据项的剩余费用
        let previousRemainingCost = 0;
        if (currentIndex > 0) {
            const previousItem = allItems[currentIndex - 1];
            previousRemainingCost = previousItem.remainingCost;
        }
        
        // 计算新的触发费用：上一个数据项的剩余费用 + 从当前时间到上一个时间的费用恢复
        const previousItemTime = currentIndex > 0 ? allItems[currentIndex - 1].time : timeInSeconds;
        const timeInterval = previousItemTime - timeInSeconds;
        const recoveredCost = this.calculateCostRecoveryFromInterval(timeInterval, previousItemTime);
        
        // 计算新费用（使用精确值，不四舍五入）
        const newCost = previousRemainingCost + recoveredCost;
        const calculatedCost = Math.max(newCost, 0); // 确保费用不小于0
        
        // 更新费用输入框，显示两位小数（仅用于UI显示）
        document.getElementById('editTriggerCost').value = calculatedCost.toFixed(2);
        
        // 同时更新原始数据项的费用，保存精确值
        originalItem.cost = calculatedCost;
    }
    
    // 从费用计算时间
    calculateTimeFromCost() {
        // 获取表单数据
        const itemId = parseInt(document.getElementById('editDataItemId').value);
        const costValue = parseFloat(document.getElementById('editTriggerCost').value);
        const characterId = parseInt(document.getElementById('editTriggerCharacter').value);
        
        // 验证输入
        if (!itemId || isNaN(costValue) || !characterId) return;
        
        // 获取所有数据项和原始数据项
        const allItems = this.dataManager.getAllDataItems();
        const originalItem = this.dataManager.getDataItemById(itemId);
        if (!originalItem) return;
        
        // 找到当前数据项在列表中的索引
        const currentIndex = allItems.findIndex(item => item.id === originalItem.id);
        if (currentIndex === -1) return;
        
        // 重置规则计数器
        this.calculator.resetRuleCounters();
        
        // 获取上一个数据项的剩余费用
        let previousRemainingCost = 0;
        if (currentIndex > 0) {
            const previousItem = allItems[currentIndex - 1];
            previousRemainingCost = previousItem.remainingCost;
        }
        
        // 保存精确的费用值到原始数据项
        originalItem.cost = costValue;
        
        // 计算所需费用差：目标费用 - 上一个数据项的剩余费用
        const requiredCost = costValue - previousRemainingCost;
        if (requiredCost <= 0) {
            // 如果所需费用为负或零，时间为上一个数据项的时间
            const previousItemTime = currentIndex > 0 ? allItems[currentIndex - 1].time : 0;
            document.getElementById('editTime').value = this.formatTime(previousItemTime);
            return;
        }
        
        // 计算所需时间：从所需费用计算时间
        const previousItemTime = currentIndex > 0 ? allItems[currentIndex - 1].time : 0;
        const timeDiff = this.calculateTimeForRequiredCost(requiredCost, previousItemTime);
        
        // 计算新时间
        const newTime = previousItemTime - timeDiff;
        
        // 格式化时间并更新输入框
        document.getElementById('editTime').value = this.formatTime(newTime);
    }
    
    // 解析时间字符串为秒数
    parseTimeString(timeStr) {
        if (!timeStr) return 0;
        
        // 直接解析数字
        if (!isNaN(timeStr)) {
            return parseFloat(parseFloat(timeStr).toFixed(3));
        }
        
        // 标准化时间字符串，确保格式一致
        const normalizedTimeStr = timeStr.trim();
        
        // 解析MM:SS.fff格式或MM:SS格式
        const timeParts = normalizedTimeStr.split(':');
        if (timeParts.length === 2) {
            const minutes = parseInt(timeParts[0]) || 0;
            const secondsPart = timeParts[1];
            
            // 检查是否包含毫秒部分
            if (secondsPart.includes('.')) {
                const secondsParts = secondsPart.split('.');
                const seconds = parseInt(secondsParts[0]) || 0;
                const millisecondsStr = secondsParts[1] || '0';
                // 确保毫秒部分有3位数字
                const milliseconds = parseInt(millisecondsStr.padEnd(3, '0')) || 0;
                return parseFloat((minutes * 60 + seconds + milliseconds / 1000).toFixed(3));
            } else {
                // 没有毫秒部分，直接解析秒数
                const seconds = parseInt(secondsPart) || 0;
                return parseFloat((minutes * 60 + seconds).toFixed(3));
            }
        }
        
        // 解析SS.fff格式或SS格式
        if (normalizedTimeStr.includes('.')) {
            const secondsParts = normalizedTimeStr.split('.');
            const seconds = parseInt(secondsParts[0]) || 0;
            const millisecondsStr = secondsParts[1] || '0';
            // 确保毫秒部分有3位数字
            const milliseconds = parseInt(millisecondsStr.padEnd(3, '0')) || 0;
            return parseFloat((seconds + milliseconds / 1000).toFixed(3));
        } else {
            // 没有毫秒部分，直接解析秒数
            const seconds = parseInt(normalizedTimeStr) || 0;
            return parseFloat(seconds.toFixed(3));
        }
    }
    
    // 格式化秒数为时间字符串 (MM:SS.fff)
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        const secondsInt = Math.floor(remainingSeconds);
        const milliseconds = Math.floor((remainingSeconds - secondsInt) * 1000);
        return `${minutes.toString().padStart(2, '0')}:${secondsInt.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
    }
    
    // 计算费用变化
    calculateCostDifference(timeDiff, originalTime, isTimeIncrease) {
        const timeStep = 0.001; // 毫秒级精度
        const absTimeDiff = Math.abs(timeDiff);
        const totalSteps = Math.floor(absTimeDiff / timeStep);
        const remainingTime = absTimeDiff % timeStep;
        const stepDirection = isTimeIncrease ? 1 : -1;
        
        let costDiff = 0;
        let currentTime = originalTime;
        
        // 模拟费用恢复过程 - 整数步
        for (let i = 0; i < totalSteps; i++) {
            const recoveryRate = this.calculator.calculateTotalRecoveryRate(currentTime);
            const stepRecovery = recoveryRate * timeStep;
            costDiff -= stepRecovery * stepDirection;
            currentTime += timeStep * stepDirection;
        }
        
        // 处理剩余时间
        if (remainingTime > 0.0001) {
            const recoveryRate = this.calculator.calculateTotalRecoveryRate(currentTime);
            const stepRecovery = recoveryRate * remainingTime;
            costDiff -= stepRecovery * stepDirection;
        }
        
        return parseFloat(costDiff.toFixed(3));
    }
    
    // 计算时间变化
    calculateTimeDifference(costDiff, originalTime, isCostIncrease) {
        const timeStep = 0.001; // 毫秒级精度
        const targetCostDiff = Math.abs(costDiff);
        const costDirection = isCostIncrease ? 1 : -1;
        
        let recoveredCost = 0;
        let timeDiff = 0;
        let currentTime = originalTime;
        const maxIterations = 100000; // 防止异常情况下的死循环
        let iterations = 0;
        
        // 模拟费用恢复过程，直到达到所需费用变化
        while (Math.abs(recoveredCost) < targetCostDiff && iterations < maxIterations) {
            iterations++;
            
            const recoveryRate = this.calculator.calculateTotalRecoveryRate(currentTime);
            
            // 防止回费速度为0导致死循环
            if (recoveryRate < 0.001) break;
            
            const stepRecovery = recoveryRate * timeStep;
            const adjustedStepRecovery = stepRecovery * costDirection;
            
            // 检查是否达到目标费用
            if (Math.abs(recoveredCost + adjustedStepRecovery) >= targetCostDiff) {
                // 计算精确时间，使用更精确的计算方式
                const remainingCost = targetCostDiff - Math.abs(recoveredCost);
                const exactTime = remainingCost / recoveryRate;
                timeDiff += exactTime;
                break;
            }
            
            // 累加费用和时间
            recoveredCost += Math.abs(adjustedStepRecovery);
            timeDiff += timeStep;
            currentTime -= timeStep * costDirection;
        }
        
        return parseFloat(timeDiff.toFixed(3));
    }
    
    // 计算指定时间间隔内的费用恢复
    calculateCostRecoveryFromInterval(timeInterval, startTime) {
        const timeStep = 0.001; // 毫秒级精度
        const totalSteps = Math.floor(timeInterval / timeStep);
        const remainingTime = timeInterval % timeStep;
        
        let totalRecoveredCost = 0;
        let currentTime = startTime;
        
        // 模拟费用恢复过程 - 整数步
        for (let i = 0; i < totalSteps; i++) {
            const recoveryRate = this.calculator.calculateTotalRecoveryRate(currentTime);
            const stepRecovery = recoveryRate * timeStep;
            totalRecoveredCost += stepRecovery;
            currentTime -= timeStep;
        }
        
        // 处理剩余时间
        if (remainingTime > 0.0001) {
            const recoveryRate = this.calculator.calculateTotalRecoveryRate(currentTime);
            const stepRecovery = recoveryRate * remainingTime;
            totalRecoveredCost += stepRecovery;
        }
        
        return parseFloat(totalRecoveredCost.toFixed(3));
    }
    
    // 计算达到所需费用需要的时间
    calculateTimeForRequiredCost(requiredCost, startTime) {
        const timeStep = 0.001; // 毫秒级精度
        let recoveredCost = 0;
        let timeDiff = 0;
        let currentTime = startTime;
        const maxIterations = 100000; // 防止异常情况下的死循环
        let iterations = 0;
        
        // 模拟费用恢复过程，直到达到所需费用
        while (recoveredCost < requiredCost && iterations < maxIterations) {
            iterations++;
            
            const recoveryRate = this.calculator.calculateTotalRecoveryRate(currentTime);
            
            // 防止回费速度为0导致死循环
            if (recoveryRate < 0.001) break;
            
            const stepRecovery = recoveryRate * timeStep;
            
            // 检查是否达到目标费用
            if (recoveredCost + stepRecovery >= requiredCost) {
                // 计算精确时间
                const remainingCost = requiredCost - recoveredCost;
                const exactTime = remainingCost / recoveryRate;
                timeDiff += exactTime;
                break;
            }
            
            // 累加费用和时间
            recoveredCost += stepRecovery;
            timeDiff += timeStep;
            currentTime -= timeStep;
        }
        
        return parseFloat(timeDiff.toFixed(3));
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
            // 使用原始数据的精确费用值，而不是从UI输入框获取格式化后的值
            cost: originalItem.cost
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

    // 显示导入导出选择模态框
    showImportExportModal(type) {
        // 设置模态框标题和显示对应的选项
        const modal = document.getElementById('importExportModal');
        const title = document.getElementById('importExportModalTitle');
        const exportOptions = document.getElementById('exportOptions');
        const importOptions = document.getElementById('importOptions');
        
        if (type === 'export') {
            title.textContent = '导出数据';
            exportOptions.classList.remove('hidden');
            importOptions.classList.add('hidden');
            
            // 更新学生下拉菜单选项
            this.updateCharacterSelectsInExportModal();
            
            // 填充当前的导出信息到表单中
            this.fillExportInfoToForm();
        } else {
            title.textContent = '导入数据';
            exportOptions.classList.add('hidden');
            importOptions.classList.remove('hidden');
        }
        
        // 显示模态框
        this.modalManager.showModal('importExportModal');
        
        // 绑定模态框内按钮事件
        this.bindImportExportModalEvents();
    }
    
    // 更新导出模态框中的学生下拉菜单选项
    updateCharacterSelectsInExportModal() {
        // 获取所有学生名称
        const characters = this.dataManager.getCharacters();
        const characterNames = characters.map(char => char.name);
        
        // 生成下拉选项HTML
        const optionsHTML = `<option value="">请选择学生</option>${characterNames.map(name => `<option value="${name}">${name}</option>`).join('')}`;
        
        // 更新所有学生站位下拉菜单
        for (let i = 1; i <= 4; i++) {
            const select = document.getElementById(`position${i}`);
            if (select) {
                select.innerHTML = optionsHTML;
            }
        }
        
        // 更新所有初始技能下拉菜单
        for (let i = 1; i <= 3; i++) {
            const select = document.getElementById(`initialSkill${i}`);
            if (select) {
                select.innerHTML = optionsHTML;
            }
        }
        
        // 添加学生站位唯一性检查
        this.addPositionUniquenessCheck();
        
        // 添加初始技能唯一性检查
        this.addInitialSkillUniquenessCheck();
        
        // 添加视频轴链接解析功能
        this.addVideoAxisLinkParser();
    }
    
    // 填充当前的导出信息到表单中
    fillExportInfoToForm() {
        // 获取当前的导出信息
        const exportInfo = this.dataManager.exportInfo;
        
        // 填充站位信息
        for (let i = 0; i < 4; i++) {
            const select = document.getElementById(`position${i + 1}`);
            const positionValue = exportInfo.positions && exportInfo.positions[i] ? exportInfo.positions[i] : '';
            if (select) {
                select.value = positionValue;
            }
        }
        
        // 填充初始技能信息
        for (let i = 0; i < 3; i++) {
            const select = document.getElementById(`initialSkill${i + 1}`);
            const skillValue = exportInfo.initialSkills && exportInfo.initialSkills[i] ? exportInfo.initialSkills[i] : '';
            if (select) {
                select.value = skillValue;
            }
        }
        
        // 填充视频轴链接
        const videoAxisLinkInput = document.getElementById('videoAxisLink');
        if (videoAxisLinkInput) {
            videoAxisLinkInput.value = exportInfo.videoAxisLink || '';
        }
        
        // 添加提示信息，告诉用户可以替换这些值
        const toggleExportConfigBtn = document.getElementById('toggleExportConfigBtn');
        if (toggleExportConfigBtn) {
            // 移除现有的提示元素
            const existingHint = toggleExportConfigBtn.parentElement.querySelector('.export-info-hint');
            if (existingHint) {
                existingHint.remove();
            }
            
            // 创建新的提示元素
            const hintElement = document.createElement('div');
            hintElement.className = 'export-info-hint text-xs text-gray-600 mt-2';
            hintElement.textContent = '如需更改视频轴、站位、初始技能，请更改导出信息';
            toggleExportConfigBtn.parentElement.appendChild(hintElement);
        }
    }
    
    // 添加学生站位唯一性检查
    addPositionUniquenessCheck() {
        const positionSelects = Array.from({length: 4}, (_, i) => document.getElementById(`position${i + 1}`)).filter(Boolean);
        
        const updatePositionOptions = () => {
            // 获取所有已选择的学生
            const selectedPositions = positionSelects.map(select => select.value).filter(Boolean);
            
            // 更新每个选择框的选项
            positionSelects.forEach(select => {
                const currentValue = select.value;
                // 获取所有学生名称
                const characters = this.dataManager.getCharacters();
                const characterNames = characters.map(char => char.name);
                
                // 生成下拉选项HTML，排除其他选择框已选择的学生
                let optionsHTML = '<option value="">请选择学生</option>';
                characterNames.forEach(name => {
                    // 如果该学生已被其他选择框选中，且不是当前选择框的值，则禁用
                    const isSelectedElsewhere = selectedPositions.includes(name) && name !== currentValue;
                    optionsHTML += `<option value="${name}" ${isSelectedElsewhere ? 'disabled' : ''}>${name}${isSelectedElsewhere ? ' (已选择)' : ''}</option>`;
                });
                
                select.innerHTML = optionsHTML;
                // 恢复当前选择框的值
                select.value = currentValue;
            });
        };
        
        // 为每个选择框添加change事件监听器
        positionSelects.forEach(select => {
            select.addEventListener('change', updatePositionOptions);
        });
    }
    
    // 添加初始技能唯一性检查
    addInitialSkillUniquenessCheck() {
        const skillSelects = Array.from({length: 3}, (_, i) => document.getElementById(`initialSkill${i + 1}`)).filter(Boolean);
        
        const updateSkillOptions = () => {
            // 获取所有已选择的学生
            const selectedSkills = skillSelects.map(select => select.value).filter(Boolean);
            
            // 更新每个选择框的选项
            skillSelects.forEach(select => {
                const currentValue = select.value;
                // 获取所有学生名称
                const characters = this.dataManager.getCharacters();
                const characterNames = characters.map(char => char.name);
                
                // 生成下拉选项HTML，排除其他选择框已选择的学生
                let optionsHTML = '<option value="">请选择学生</option>';
                characterNames.forEach(name => {
                    // 如果该学生已被其他选择框选中，且不是当前选择框的值，则禁用
                    const isSelectedElsewhere = selectedSkills.includes(name) && name !== currentValue;
                    optionsHTML += `<option value="${name}" ${isSelectedElsewhere ? 'disabled' : ''}>${name}${isSelectedElsewhere ? ' (已选择)' : ''}</option>`;
                });
                
                select.innerHTML = optionsHTML;
                // 恢复当前选择框的值
                select.value = currentValue;
            });
        };
        
        // 为每个选择框添加change事件监听器
        skillSelects.forEach(select => {
            select.addEventListener('change', updateSkillOptions);
        });
    }
    
    // 添加视频轴链接解析功能
    addVideoAxisLinkParser() {
        const videoAxisLinkInput = document.getElementById('videoAxisLink');
        if (!videoAxisLinkInput) return;
        
        // 添加input事件监听器，自动解析链接
        videoAxisLinkInput.addEventListener('input', (e) => {
            const inputValue = e.target.value;
            if (!inputValue) return;
            
            // 正则表达式匹配B站视频链接
            const bilibiliRegex = /(https?:\/\/(?:www\.)?bilibili\.com\/video\/[a-zA-Z0-9]+(?:\?[\w\-\.=&%]*))/g;
            const matches = inputValue.match(bilibiliRegex);
            
            if (matches && matches.length > 0) {
                // 如果找到链接，自动填充第一个匹配到的链接
                e.target.value = matches[0];
            }
        });
    }
    
    // 绑定导入导出模态框事件
    bindImportExportModalEvents() {
        // 导出为文件
        const exportByFileBtn = document.getElementById('exportByFileBtn');
        if (exportByFileBtn) {
            exportByFileBtn.onclick = () => {
                this.exportDataByFile();
                this.modalManager.hideModal('importExportModal');
            };
        }
        
        // 生成识别码
        const exportByShareIdBtn = document.getElementById('exportByShareIdBtn');
        if (exportByShareIdBtn) {
            exportByShareIdBtn.onclick = () => {
                this.generateShareId();
            };
        }
        
        // 复制识别码
        const copyShareIdBtn = document.getElementById('copyShareIdBtn');
        if (copyShareIdBtn) {
            copyShareIdBtn.onclick = () => {
                this.copyShareId();
            };
        }
        
        // 点击识别码输入框也能复制
        const generatedShareId = document.getElementById('generatedShareId');
        if (generatedShareId) {
            generatedShareId.onclick = () => {
                this.copyShareId();
            };
        }
        
        // 从文件导入
        const importByFileBtn = document.getElementById('importByFileBtn');
        if (importByFileBtn) {
            importByFileBtn.onclick = () => {
                this.importDataByFile();
                this.modalManager.hideModal('importExportModal');
            };
        }
        
        // 移除了从识别码导入按钮，识别码输入框现在默认显示
        
        // 确认识别码
        const confirmShareIdBtn = document.getElementById('confirmShareIdBtn');
        if (confirmShareIdBtn) {
            confirmShareIdBtn.onclick = () => {
                const shareId = document.getElementById('shareIdInput').value.trim();
                if (shareId) {
                    this.importDataByShareId(shareId);
                    // 不立即关闭模态框，等待导入完成后由importDataByShareId方法处理
                } else {
                    this.modalManager.showToast('请输入有效的识别码', 'error');
                }
            };
        }
    }
    
    // 保存用户输入的导出信息
    saveExportInfo() {
        // 获取学生站位信息
        const positions = [];
        for (let i = 1; i <= 4; i++) {
            const select = document.getElementById(`position${i}`);
            positions.push(select ? select.value : '');
        }
        
        // 获取初始技能信息
        const initialSkills = [];
        for (let i = 1; i <= 3; i++) {
            const select = document.getElementById(`initialSkill${i}`);
            initialSkills.push(select ? select.value : '');
        }
        
        // 获取视频轴链接
        const videoAxisLink = document.getElementById('videoAxisLink')?.value || '';
        
        // 保存到数据管理器
        this.dataManager.exportInfo = {
            positions,
            initialSkills,
            videoAxisLink
        };
    }
    
    // 导出数据为JSON文件
    exportDataByFile() {
        // 保存用户输入的导出信息
        this.saveExportInfo();
        
        const data = this.dataManager.exportData();
        
        // 获取用户输入的文件名
        const customFileName = document.getElementById('exportFileName')?.value?.trim();
        
        // 优先使用用户输入的文件名，否则使用默认文件名
        const fileName = customFileName || data.fileName || `blue-archive-calculator-data-${new Date().toISOString().slice(0, 10)}`;
        
        // 更新数据对象中的文件名
        data.fileName = fileName;
        
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `${fileName}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        this.modalManager.showToast('数据导出成功', 'success');
        
        // 清空文件名输入框
        if (document.getElementById('exportFileName')) {
            document.getElementById('exportFileName').value = '';
        }
    }
    
    // 从文件导入数据
    importDataByFile() {
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
    
    // 生成识别码
    async generateShareId() {
        try {
            // 显示加载指示器
            this.modalManager.showLoadingIndicator('正在生成识别码...');
            
            // 保存用户输入的导出信息
            this.saveExportInfo();
            
            // 获取要导出的数据
            const data = this.dataManager.exportData();
            
            // 获取用户输入的文件名
            const customFileName = document.getElementById('exportFileName')?.value?.trim();
            
            // 优先使用用户输入的文件名，否则使用默认文件名
            const fileName = customFileName || data.fileName || `碧蓝档案轴-识别码-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}`;
            
            // 更新数据对象中的文件名
            data.fileName = fileName;
            
            // 调用API生成识别码
            const shareId = await AppUtils.api.generateShareId(data);
            
            // 隐藏加载指示器
            this.modalManager.hideLoadingIndicator();
            
            // 显示识别码
            const shareIdDisplayGroup = document.getElementById('shareIdDisplayGroup');
            const generatedShareId = document.getElementById('generatedShareId');
            
            if (shareIdDisplayGroup && generatedShareId) {
                generatedShareId.value = shareId;
                shareIdDisplayGroup.classList.remove('hidden');
                
                // 滚动到识别码显示区域
                shareIdDisplayGroup.scrollIntoView({ behavior: 'smooth', block: 'center' });
                
                this.modalManager.showToast('识别码生成成功', 'success');
            }
            
            // 清空文件名输入框
            if (document.getElementById('exportFileName')) {
                document.getElementById('exportFileName').value = '';
            }
        } catch (error) {
            // 隐藏加载指示器
            this.modalManager.hideLoadingIndicator();
            
            console.error('生成识别码失败:', error);
            this.modalManager.showToast('生成识别码失败，请检查API密钥或网络连接', 'error');
        }
    }
    
    // 复制识别码到剪贴板
    copyShareId() {
        const generatedShareId = document.getElementById('generatedShareId');
        if (generatedShareId && generatedShareId.value) {
            generatedShareId.select();
            generatedShareId.setSelectionRange(0, 99999); // 兼容移动端
            
            try {
                document.execCommand('copy');
                this.modalManager.showToast('识别码已复制到剪贴板', 'success');
            } catch (err) {
                // 降级方案
                navigator.clipboard.writeText(generatedShareId.value)
                    .then(() => {
                        this.modalManager.showToast('识别码已复制到剪贴板', 'success');
                    })
                    .catch(() => {
                        this.modalManager.showToast('复制失败，请手动复制', 'error');
                    });
            }
        }
    }
    
    // 从识别码导入数据
    async importDataByShareId(shareId) {
        try {
            // 显示加载指示器
            this.modalManager.showLoadingIndicator('正在从识别码导入数据...');
            
            // 调用API获取共享数据
            const data = await AppUtils.api.getShareData(shareId);
            
            // 隐藏加载指示器
            this.modalManager.hideLoadingIndicator();
            
            // 关闭导入模态框
            this.modalManager.hideModal('importExportModal');
            
            // 获取数据文件名，优先使用数据中的fileName字段，否则使用识别码作为文件名
            const dataFileName = data.fileName || `识别码-${shareId}`;
            
            // 显示确认导入提示
            this.modalManager.showConfirmModal(
                '确认导入',
                `您正在导入的数据文件名为：${dataFileName}，确定要导入此数据吗？导入后当前数据将被覆盖。`,
                () => {
                    // 用户确认导入
                    const success = this.dataManager.importData(data);
                    
                    if (success) {
                        // 设置数据表为已初始化状态
                        if (this.app) {
                            this.app.setDataTableInitialized(true);
                        }
                        
                        // 重新计算所有数据项
                        this.calculator.recalculateAllItems();
                        
                        this.modalManager.showToast('数据导入成功', 'success');
                        // 刷新界面
                        this.uiRenderer.refreshAll();
                    } else {
                        this.modalManager.showToast('数据导入失败，数据格式不正确', 'error');
                    }
                },
                () => {
                    // 用户取消导入
                    this.modalManager.showToast('已取消导入', 'info');
                }
            );
        } catch (error) {
            // 隐藏加载指示器
            this.modalManager.hideLoadingIndicator();
            
            // 关闭模态框
            this.modalManager.hideModal('importExportModal');
            
            console.error('从识别码导入数据失败:', error);
            this.modalManager.showToast('从识别码导入数据失败，请检查识别码是否正确或网络连接', 'error');
        }
    }

    showImportDataModal() {
        // 显示导入选项模态框
        this.showImportExportModal('import');
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
                
                // 获取数据文件名，优先使用数据中的fileName字段，否则使用文件的原始名称
                const dataFileName = data.fileName || file.name.replace('.json', '');
                
                // 显示确认导入提示
                this.modalManager.showConfirmModal(
                    '确认导入',
                    `您正在导入的数据文件名为：${dataFileName}，确定要导入此数据吗？导入后当前数据将被覆盖。`,
                    () => {
                        // 用户确认导入
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
                    },
                    () => {
                        // 用户取消导入
                        this.modalManager.showToast('已取消导入', 'info');
                    }
                );
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
            this.modalManager.showToast('请先添加学生', 'error');
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
