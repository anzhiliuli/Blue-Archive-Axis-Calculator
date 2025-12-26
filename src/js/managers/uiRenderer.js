// UI渲染器模块
class UIRenderer {
    constructor(dataManager, calculator, app) {
        this.dataManager = dataManager;
        this.calculator = calculator;
        this.app = app;
        this.initEventListeners();
    }

    // 初始化事件监听器
    initEventListeners() {

    }



    // 渲染学生列表
    renderCharacterList() {
        const characters = this.dataManager.getCharacters();
        
        // 使用数据表格组件渲染学生列表
        if (this.app.tables.characters) {
            this.app.tables.characters.setData(characters);
        } else {
            // 降级处理：如果表格组件不可用，使用传统渲染方式
            const characterList = document.getElementById('character-list');
            if (!characterList) return;

            if (characters.length === 0) {
                characterList.innerHTML = `
                    <tr>
                        <td colspan="5" class="text-center py-4 text-muted">
                            暂无学生数据
                            <button id="add-character-btn" class="btn btn-primary btn-sm ml-2">
                                <i class="fas fa-plus"></i> 添加学生
                            </button>
                        </td>
                    </tr>
                `;
                return;
            }

            characterList.innerHTML = characters.map(character => `
                <tr id="character-${character.id}">
                    <td>${character.name}</td>
                    <td>${character.costRecoveryRate.toFixed(2)}</td>
                    <td>${character.skillCost.toFixed(2)}</td>
                    <td>${character.costIncrease.toFixed(2)}</td>
                    <td>${character.isChargePercentage ? '<span class="text-success font-bold">√</span>' : '-'}</td>
                </tr>
            `).join('');
        }
    }

    // 格式化时间为 00:00.000 格式
    formatTime(seconds) {
        if (typeof seconds !== 'number') {
            return seconds; // 如果不是数字，直接返回原始值
        }
        
        // 处理负数时间
        const isNegative = seconds < 0;
        const absSeconds = Math.abs(seconds);
        
        const minutes = Math.floor(absSeconds / 60);
        const remainingSeconds = absSeconds % 60;
        const milliseconds = Math.floor((remainingSeconds % 1) * 1000);
        
        // 格式化时间字符串，负数前面加负号
        const timeStr = `${minutes.toString().padStart(2, '0')}:${Math.floor(remainingSeconds).toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
        return isNegative ? `-${timeStr}` : timeStr;
    }
    
    // 渲染关联规则列表（卡片形式）
    renderRuleList() {
        const rules = this.dataManager.getRules();
        const ruleContainer = document.getElementById('rulesTable');
        if (!ruleContainer) return;

        const characters = this.dataManager.getCharacters();
        
        if (rules.length === 0) {
            ruleContainer.innerHTML = `
                <div class="text-center py-8 text-muted">
                    <i class="fas fa-info-circle text-4xl mb-4"></i>
                    <p>暂无关联规则</p>
                </div>
            `;
        } else {
            let cardsHTML = '';
            rules.forEach(rule => {
                // 处理触发学生（减费效果和回费效果不需要触发学生）
                let sourceCharacterText = '';
                if (rule.characterId) {
                   const sourceCharacterText = characters.find(c => c.id === rule.characterId)?.name || '未知学生';
                }
                
                // 根据规则类型生成显示内容
                let ruleTypeText = '';
                let targetText = '';
                let paramsHTML = '';
                let triggerTime = '';
                
                switch(rule.type) {
                    case 'costReduction':
                        ruleTypeText = '减费效果';
                        // 处理目标学生（使用统一的targetCharacterIds数组）
                        if (Array.isArray(rule.targetCharacterIds)) {
                            const targetNames = rule.targetCharacterIds
                                .map(id => characters.find(c => c.id === id)?.name || '未知学生')
                                .join(', ');
                            targetText = targetNames;
                        } else {
                            targetText = '未知学生';
                        }
                        // 查找对应的触发行数据
                        const crDataItems = this.dataManager.getDataItems();
                        const crTriggerItem = crDataItems.find(item => item.id === rule.characterId);
                        triggerTime = crTriggerItem ? this.formatTime(crTriggerItem.time) : '未知时间';
                        paramsHTML = `
                            <div class="mb-1"><strong>触发时间:</strong> ${triggerTime}</div>
                            <div class="mb-1"><strong>生效次数:</strong> ${rule.effectCount}</div>
                            <div class="mb-1"><strong>减费数值:</strong> ${rule.reductionValue}</div>
                        `;
                        break;
                    case 'instantCharge':
                        ruleTypeText = '瞬间回费';
                        targetText = sourceCharacterText;
                        paramsHTML = `
                            <div class="mb-1"><strong>时间点:</strong> ${this.formatTime(rule.time)}</div>
                            <div class="mb-1"><strong>回费数值:</strong> ${rule.chargeValue}</div>
                        `;
                        break;
                    case 'costChange':
                        ruleTypeText = '更改扣除';
                        // 查找对应的触发行数据
                        const dataItems = this.dataManager.getDataItems();
                        const triggerItem = dataItems.find(item => item.id === rule.characterId);
                        triggerTime = triggerItem ? this.formatTime(triggerItem.time) : '未知时间';
                        
                        // 从触发行数据中获取触发学生名称
                        let triggerCharacterText = '';
                        if (triggerItem) {
                            const triggerCharacter = characters.find(c => c.id === triggerItem.characterId);
                            triggerCharacterText = triggerCharacter ? triggerCharacter.name : '未知学生';
                        }
                        
                        paramsHTML = `
                            <div class="mb-1"><strong>触发时间:</strong> ${triggerTime}</div>
                            <div class="mb-1"><strong>触发学生:</strong> ${triggerCharacterText}</div>
                            <div class="mb-1"><strong>更改数值:</strong> ${rule.changeValue}</div>
                        `;
                        break;
                    case 'chargeIncrease':
                        ruleTypeText = '费用效果';
                        // 处理目标学生（多选）
                        if (Array.isArray(rule.targetCharacterIds)) {
                            const targetNames = rule.targetCharacterIds
                                .map(id => characters.find(c => c.id === id)?.name || '未知学生')
                                .join(', ');
                            targetText = targetNames;
                        } else {
                            targetText = '未知学生';
                        }
                        
                        // 处理效果类型（增加/减少）
                        const effectTypeText = rule.effectType === 'increase' ? '增加' : '减少';
                        
                        // 处理费用类型和数值
                        const chargeTypeText = rule.chargeType === 'percentage' ? '百分比' : '固定数值';
                        
                        paramsHTML = `
                            <div class="mb-1"><strong>生效时间点:</strong> ${this.formatTime(rule.activationTime)}</div>
                            <div class="mb-1"><strong>生效时间段:</strong> ${this.formatTime(rule.activationTime - rule.duration)} - ${this.formatTime(rule.activationTime)} (持续 ${rule.duration}s)</div>
                            <div class="mb-1"><strong>费用类型:</strong> ${chargeTypeText}</div>
                            <div class="mb-1"><strong>费用数值:</strong> ${rule.chargeValue}</div>
                            <div class="mb-1"><strong>效果类型:</strong> ${effectTypeText}</div>
                        `;
                        break;
                    default:
                        ruleTypeText = '未知规则';
                }
                
                cardsHTML += `
                    <div id="rule-${rule.id}" class="bg-white rounded-lg shadow-md p-4 mb-4 border border-gray-100">
                        <div class="flex justify-between items-start mb-3">
                            <div>
                                <h3 class="text-lg font-semibold text-gray-800">${ruleTypeText}</h3>
                                <p class="text-sm text-gray-500 mt-1">
                                    ${rule.type === 'costChange' ? 
                                            `<strong>触发时间:</strong> ${triggerTime}` : 
                                            rule.type === 'costReduction' ?
                                            `<strong>触发时间:</strong> ${triggerTime} | <strong>目标学生:</strong> ${targetText}` : 
                                            rule.type === 'chargeIncrease' ?
                                            `<strong>作用范围:</strong> ${targetText}` :
                                            `<strong>触发学生:</strong> ${sourceCharacterText || '-'} | <strong>目标学生:</strong> ${targetText}`
                                        }
                                </p>
                            </div>
                            <div class="flex gap-2">
                                <button class="delete-rule p-2 rounded-full hover:bg-red-100 text-red-600 transition-colors duration-200" data-id="${rule.id}" title="删除">
                                    <i class="fas fa-trash text-sm"></i>
                                </button>
                            </div>
                        </div>
                        <div class="bg-gray-50 rounded p-3">
                            ${paramsHTML}
                        </div>
                    </div>
                `;
            });
            
            ruleContainer.innerHTML = cardsHTML;
        }
    }

    // 渲染数据项列表
    renderDataItemList() {
        // 获取分页数据
        const paginatedItems = this.dataManager.getPaginatedDataItems();
        const totalItems = this.dataManager.getDataItems().length;
        
        // 使用数据表格组件渲染数据项列表
        if (this.app.tables.dataItems) {
            this.app.tables.dataItems.setData(paginatedItems);
        } else {
            // 降级处理：如果表格组件不可用，使用传统渲染方式
            const dataItemList = document.getElementById('data-item-list');
            if (!dataItemList) return;

            const characters = this.dataManager.getCharacters();
            
            if (totalItems === 0) {
                dataItemList.innerHTML = `
                    <tr>
                        <td colspan="8" class="text-center py-4 text-muted">
                            暂无数据项
                            <button id="add-data-item-btn" class="btn btn-primary btn-sm ml-2">
                                <i class="fas fa-plus"></i> 添加数据项
                            </button>
                        </td>
                    </tr>
                `;
                return;
            }

            // 渲染普通数据项
            const rows = paginatedItems.map(item => {
                // 为初始化类型的默认行应用特殊格式
                if (item.action === '初始化') {
                    return `
                        <tr id="data-item-${item.id}">
                            <td>
                                <input type="checkbox" class="data-item-checkbox" data-id="${item.id}">
                            </td>
                            <td>-</td>
                            <td>${item.action}</td>
                            <td>${item.time.toFixed(2)} c</td>
                            <td>${item.cost.toFixed(2)} c</td>
                            <td>${item.timeInterval.toFixed(3)} s</td>
                            <td>${item.costDeduction.toFixed(2)} c</td>
                            <td>${item.remainingCost.toFixed(2)} c</td>
                        </tr>
                    `;
                }
                
                // 为回费类型的特殊行应用特殊样式
                if (item.action === '回费') {
                    const character = characters.find(c => c.id === item.characterId)?.name || '未知学生';
                    const costChange = item.costDeduction > 0 ? '-' : '';
                    
                    return `
                        <tr id="data-item-${item.id}" class="bg-white border-2 border-blue-400 font-medium shadow-sm">
                            <td>
                                <input type="checkbox" class="data-item-checkbox" data-id="${item.id}">
                            </td>
                            <td>${character}</td>
                            <td>${item.action}</td>
                            <td>${item.time.toFixed(2)}</td>
                            <td>${item.cost.toFixed(2)}</td>
                            <td>${item.timeInterval.toFixed(2)}</td>
                            <td>${costChange}${item.costDeduction.toFixed(2)}</td>
                            <td>${item.remainingCost.toFixed(2)}</td>
                        </tr>
                    `;
                }
                
                // 普通数据项的渲染
                const character = characters.find(c => c.id === item.characterId)?.name || '未知学生';
                const costChange = item.costDeduction > 0 ? '-' : '';
                
                return `
                    <tr id="data-item-${item.id}">
                        <td>
                            <input type="checkbox" class="data-item-checkbox" data-id="${item.id}">
                        </td>
                        <td>${character}</td>
                        <td>${item.action}</td>
                        <td>${item.time.toFixed(2)}</td>
                        <td>${item.cost.toFixed(2)}</td>
                        <td>${item.timeInterval.toFixed(2)}</td>
                        <td>${costChange}${item.costDeduction.toFixed(2)}</td>
                        <td>${item.remainingCost.toFixed(2)}</td>
                    </tr>
                `;
            });
            
            // 添加特殊样式的行
            rows.push(`
                <tr id="special-data-row" class="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 font-medium">
                    <td colspan="9" class="text-center py-4 px-6">
                        <div class="flex items-center justify-center gap-2">
                            <i class="fas fa-star text-blue-600"></i>
                            <span class="text-blue-800">特殊数据行 - 用于后续功能扩展</span>
                        </div>
                    </td>
                </tr>
            `);
            
            dataItemList.innerHTML = rows.join('');
        }
        
        // 渲染分页控件
        this.renderPagination();
    }
    
    // 渲染分页控件
    renderPagination() {
        const totalItems = this.dataManager.getDataItems().length;
        const currentPage = this.dataManager.getCurrentPage();
        const totalPages = this.dataManager.getTotalPages();
        const showCompleteData = this.dataManager.getShowCompleteData();
        
        // 获取分页容器
        let paginationContainer = document.getElementById('dataItemsPagination');
        
        // 如果显示完整数据，移除分页控件并返回
        if (showCompleteData) {
            if (paginationContainer) {
                paginationContainer.remove();
            }
            return;
        }
        
        // 如果只有一页数据，移除分页控件并返回
        if (totalPages <= 1) {
            if (paginationContainer) {
                paginationContainer.remove();
            }
            return;
        }
        
        // 如果没有分页容器，创建一个
        if (!paginationContainer) {
            // 创建分页容器
            paginationContainer = document.createElement('div');
            paginationContainer.id = 'dataItemsPagination';
            paginationContainer.className = 'flex items-center justify-center gap-1 mt-2';
            
            // 找到数据表容器，将分页控件添加到其后面
            const dataTableContainer = document.querySelector('.overflow-x-auto');
            if (dataTableContainer) {
                dataTableContainer.parentNode.insertBefore(paginationContainer, dataTableContainer.nextSibling);
            }
        }
        
        // 生成分页HTML
        let paginationHTML = `
            <div class="flex items-center gap-2 text-sm">
                <span class="text-gray-600">共 ${totalItems} 项，${totalPages} 页</span>
                <button id="firstPageBtn" class="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 transition-colors duration-200 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}">
                    <i class="fas fa-angle-double-left"></i>
                </button>
                <button id="prevPageBtn" class="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 transition-colors duration-200 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}">
                    <i class="fas fa-angle-left"></i>
                </button>
                <span class="px-3 py-1 bg-blue-100 text-blue-800 rounded">${currentPage}/${totalPages}</span>
                <button id="nextPageBtn" class="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 transition-colors duration-200 ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}">
                    <i class="fas fa-angle-right"></i>
                </button>
                <button id="lastPageBtn" class="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 transition-colors duration-200 ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}">
                    <i class="fas fa-angle-double-right"></i>
                </button>
            </div>
        `;
        
        paginationContainer.innerHTML = paginationHTML;
    }

    // 更新状态信息
    updateStatusInfo() {
        // 更新初始化状态（已在app.js中实现）
        
        // 更新学生数量
        const characterCountElement = document.getElementById('characterCount');
        if (characterCountElement) {
            const characters = this.dataManager.getCharacters();
            characterCountElement.textContent = `${characters.length}/6`;
        }
        
        // 更新数据项数量
        const dataItemCountElement = document.getElementById('dataItemCount');
        if (dataItemCountElement) {
            const items = this.dataManager.getDataItems();
            dataItemCountElement.textContent = items.length;
        }
        
        // 更新关联规则数量
        const ruleCountElement = document.getElementById('ruleCount');
        if (ruleCountElement) {
            const rules = this.dataManager.getRules();
            ruleCountElement.textContent = rules.length;
        }
        
        // 更新当前时间
        const currentTimeElement = document.getElementById('currentTime');
        if (currentTimeElement) {
            // 从最后一个数据项获取当前时间
            const items = this.dataManager.getDataItems();
            if (items.length > 0) {
                const lastItem = items[items.length - 1];
                currentTimeElement.textContent = this.formatTime(lastItem.time);
            } else {
                currentTimeElement.textContent = '--:--.---';
            }
        }
        
        // 保持原有的status-info容器更新，确保兼容性
        const statusInfo = document.getElementById('status-info');
        if (statusInfo) {
            const characters = this.dataManager.getCharacters();
            const rules = this.dataManager.getRules();
            const items = this.dataManager.getDataItems();
            const currentCost = this.dataManager.currentCost;
            const totalCost = this.dataManager.totalCost;
            const totalEfficiency = this.calculator.calculateTotalCostEfficiency(characters);
            
            statusInfo.innerHTML = `
                <div class="status-item">
                    <span class="status-label">学生数量:</span>
                    <span class="status-value">${characters.length}</span>
                </div>
                <div class="status-item">
                    <span class="status-label">规则数量:</span>
                    <span class="status-value">${rules.length}</span>
                </div>
                <div class="status-item">
                    <span class="status-label">数据项数量:</span>
                    <span class="status-value">${items.length}</span>
                </div>
                <div class="status-item">
                    <span class="status-label">总费用效率:</span>
                    <span class="status-value">${totalEfficiency.toFixed(2)}/秒</span>
                </div>
            `;
        }
    }


    // 更新学生选择下拉框
    updateCharacterSelects() {
        const characterSelects = document.querySelectorAll('.character-select');
        if (!characterSelects.length) return;
        
        const characters = this.dataManager.getCharacters();
        
        characterSelects.forEach(select => {
            // 保存当前选中值
            const currentValue = select.value;
            
            // 清空并重新添加选项
            select.innerHTML = '<option value="">选择学生</option>';
            characters.forEach(character => {
                const option = document.createElement('option');
                option.value = character.id;
                option.textContent = character.name;
                option.selected = (option.value === currentValue);
                select.appendChild(option);
            });
        });
    }

    // 格式化时间为00:00.000格式
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        const intSeconds = Math.floor(remainingSeconds);
        const milliseconds = Math.floor((remainingSeconds - intSeconds) * 1000);
        
        return `${minutes.toString().padStart(2, '0')}:${intSeconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
    }
    
    // 更新状态栏
    updateStatusBar() {
        const statusBarContent = document.getElementById('statusBarContent');
        if (!statusBarContent) return;
        
        // 获取已应用的特殊技能（从数据项中提取）
        const dataItems = this.dataManager.getAllDataItems();
        
        // 查找所有action为"回费"或"减费"的数据项，这些是已应用的特殊技能
        const appliedSkills = dataItems.filter(item => item.action === '回费' || item.action === '减费');
        
        // 获取学生列表
        const characters = this.dataManager.getCharacters();
        
        // 预设技能描述映射
        const skillDescriptions = {
            '瞬': {
                skill: '开局回费',
                description: '在开局入场后直接增加费用'
            },
            '水白': {
                skill: '开局buff',
                description: '开局入场后持续一分钟对友方增加暴击值buff和除水白外所有学生减少1c技能费用'
            }
        };
        
        if (appliedSkills.length === 0) {
            statusBarContent.innerHTML = '<p class="status-bar-empty">暂未应用任何特殊技能</p>';
            return;
        }
        
        // 生成状态项HTML
        const statusItemsHTML = appliedSkills.map(item => {
            const character = characters.find(c => c.id === item.characterId);
            if (!character) return '';
            
            const skillInfo = skillDescriptions[character.name] || {
                skill: '特殊技能',
                description: '已应用特殊技能'
            };
            
            // 格式化触发时间为00:00.000格式
            const triggerTime = this.formatTime(item.time);
            
            return `
                <div class="status-item">
                    <div class="status-item-header">
                        <div>
                            <div class="status-item-character">
                                <i class="fas fa-user"></i>
                                ${character.name}
                            </div>
                            <div class="status-item-skill">${skillInfo.skill}</div>
                        </div>
                        <div class="status-item-duration">
                            ${triggerTime}
                        </div>
                    </div>
                    <div class="status-item-description">
                        ${skillInfo.description}
                    </div>
                </div>
            `;
        }).join('');
        
        statusBarContent.innerHTML = statusItemsHTML;
    }
    
    // 渲染学生特殊技能卡片
    renderSpecialSkills() {
        const container = document.getElementById('specialSkillsContainer');
        if (!container) return;
        
        // 更新状态栏
        this.updateStatusBar();
        
        // 获取学生列表
        const characters = this.dataManager.getCharacters();
        
        // 预设技能数据
        const skillData = [
            {
                id: '1',
                name: '瞬',
                skill: '开局回费',
                description: '在开局入场后 直接增加费用'
            },
            {
                id: '2',
                name: '水白',
                skill: '开局buff',
                description: '开局入场后持续一分钟对友方增加暴击值buff和除水白外所有学生减少1c技能费用'
            }
        ];
        
        // 清空容器
        container.innerHTML = '';
        
        // 渲染技能卡片
        skillData.forEach(skill => {
            const card = document.createElement('div');
            card.className = 'skill-card';
            card.dataset.skillId = skill.id;
            // 根据学生名或ID设置标签
            let primaryTag = '特殊技能';
            if (skill.name === '瞬' || skill.id === '1') {
                primaryTag = '回费技能';
            } else if (skill.name === '水白' || skill.id === '2') {
                primaryTag = '减费技能';
            }
            card.innerHTML = `
                <div class="skill-card-header">
                    <h4 class="skill-card-title">
                        <i class="fas fa-star"></i>
                        ${skill.name}
                    </h4>
                    <p class="skill-card-subtitle">${skill.skill}</p>
                </div>
                <div class="skill-card-content">
                    <p class="skill-card-description">${skill.description}</p>
                    <div class="skill-card-tags">
                        <span class="skill-card-tag">${primaryTag}</span>
                        <span class="skill-card-tag">被动技能</span>
                    </div>
                </div>
                <div class="skill-card-actions">
                    <button class="skill-card-confirm-btn">
                        <i class="fas fa-check"></i>
                        确认
                    </button>
                </div>
                <div class="skill-card-status"></div>
            `;
            
            // 添加点击事件
            card.addEventListener('click', (e) => {
                // 防止冒泡影响按钮点击
                if (e.target.closest('.skill-card-confirm-btn')) return;
                
                // 检查学生是否存在
                const characterExists = characters.some(c => c.name === skill.name);
                if (!characterExists) {
                    this.app.modalManager.showToast(`学生列表中不存在${skill.name}，无法选择该技能`, 'error');
                    return;
                }
                
                // 检查是否已经选择了其他卡片
                const selectedCards = container.querySelectorAll('.skill-card.selected');
                if (selectedCards.length > 0 && !card.classList.contains('selected')) {
                    this.app.modalManager.showToast('一次只能选择一个技能，请先确认当前选择', 'warning');
                    return;
                }
                
                // 切换选中状态
                card.classList.toggle('selected');
            });
            
            // 添加确认按钮事件
            const confirmBtn = card.querySelector('.skill-card-confirm-btn');
            confirmBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // 阻止冒泡到卡片
                
                // 检查是否选中了卡片
                if (!card.classList.contains('selected')) {
                    this.app.modalManager.showToast('请先选择技能卡片，然后再点击确认', 'warning');
                    return;
                }
                
                // 创建入场时间输入模态框
                const modalContent = `
                    <div class="modal-header">
                        <h3 class="text-lg font-semibold">设置入场时间</h3>
                        <button class="close-modal-btn text-gray-500 hover:text-gray-700">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="mb-4">
                            <label for="entryTimeInput" class="block text-sm font-medium mb-2">入场时间</label>
                            <input type="text" id="entryTimeInput" class="input-field w-full" placeholder="例如：3:58.000">
                            <p class="text-xs text-gray-500 mt-1">时间格式：支持M:SS.fff</p>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button id="cancelEntryTimeBtn" class="btn-outline close-modal-btn">取消</button>
                        <button id="confirmEntryTimeBtn" class="btn-primary">确认</button>
                    </div>
                `;
                
                // 创建并显示模态框
                const entryTimeModal = document.createElement('div');
                entryTimeModal.id = 'entryTimeModal';
                entryTimeModal.className = 'fixed inset-0 z-50 flex items-center justify-center modal-backdrop show';
                entryTimeModal.innerHTML = `
                    <div class="modal-content">
                        ${modalContent}
                    </div>
                `;
                
                document.body.appendChild(entryTimeModal);
                
                // 时间格式转换函数：将00:00.000或0:00.000格式转换为秒数
                const parseTimeToSeconds = (timeStr) => {
                    // 验证格式：支持MM:SS.fff或M:SS.fff格式
                    const timeRegex = /^(\d{1,2}):(\d{2})\.(\d{3})$/;
                    const match = timeStr.match(timeRegex);
                    
                    if (!match) {
                        return null;
                    }
                    
                    const minutes = parseInt(match[1]);
                    const seconds = parseInt(match[2]);
                    const milliseconds = parseInt(match[3]);
                    
                    // 计算总秒数
                    const totalSeconds = minutes * 60 + seconds + milliseconds / 1000;
                    return totalSeconds;
                };
                
                // 确认按钮事件
                const confirmEntryTimeBtn = entryTimeModal.querySelector('#confirmEntryTimeBtn');
                confirmEntryTimeBtn.addEventListener('click', () => {
                    const entryTimeInput = entryTimeModal.querySelector('#entryTimeInput');
                    const entryTimeStr = entryTimeInput.value;
                    
                    // 验证时间格式
                    if (!entryTimeStr) {
                        this.app.modalManager.showToast('请输入入场时间', 'error');
                        return;
                    }
                    
                    // 尝试解析时间格式
                    const seconds = parseTimeToSeconds(entryTimeStr);
                    if (seconds === null) {
                        this.app.modalManager.showToast('请输入有效的时间格式：00:00.000', 'error');
                        return;
                    }
                    
                    // 显示确认动画
                    confirmBtn.classList.add('confirming');
                    confirmBtn.innerHTML = '<i class="fas fa-check-double"></i> 已确认';
                    
                    // 恢复按钮状态
                    setTimeout(() => {
                        confirmBtn.classList.remove('confirming');
                        confirmBtn.innerHTML = '<i class="fas fa-check"></i> 确认';
                    }, 1000);
                    
                    // 在数据表中添加特殊行
                    // 获取当前卡片的学生信息
                    const character = characters.find(c => c.name === skill.name);
                    if (character) {
                        // 创建特殊数据项
                        let action = '特殊技能'; // 默认动作
                        // 根据学生设置不同的动作
                        if (skill.name === '瞬' || skill.id === '1') {
                            action = '回费'; // 瞬卡片的动作为回费
                        } else if (skill.name === '水白' || skill.id === '2') {
                            action = '减费'; // 水白卡片的动作为减费
                        }
                        
                        const specialItem = {
                            id: `special_${Date.now()}`,
                            characterId: character.id,
                            action: action, // 根据学生设置不同的动作
                            time: seconds,
                            cost: 0, // 触发费用根据入场时间自动计算，这里先设为0，后续会被calculator重新计算
                            timeInterval: 0, // 时间间隔会被calculator重新计算
                            costDeduction: 0, // 费用扣除为0，因为是被动技能
                            remainingCost: 0 // 剩余费用会被calculator重新计算
                        };
                        
                        // 添加数据项到数据管理器
                        this.dataManager.addDataItem(specialItem);
                        
                        // 重新计算所有数据项，更新费用和时间间隔
                        this.calculator.recalculateAllItems();
                        
                        // 刷新UI，显示新添加的特殊行
                        this.refreshAll();
                        
                        // 显示提示消息
                        this.app.modalManager.showToast(`${skill.name}的特殊技能已确认，入场时间：${entryTimeStr}，特殊行已添加到数据表`, 'success');
                        
                        // 更新状态栏
                        this.updateStatusBar();
                    }
                    
                    // 移除模态框
                    entryTimeModal.remove();
                });
                
                // 取消按钮事件
                const cancelEntryTimeBtn = entryTimeModal.querySelector('#cancelEntryTimeBtn');
                cancelEntryTimeBtn.addEventListener('click', () => {
                    entryTimeModal.remove();
                });
                
                // 关闭按钮事件
                const closeModalBtn = entryTimeModal.querySelector('.close-modal-btn');
                closeModalBtn.addEventListener('click', () => {
                    entryTimeModal.remove();
                });
            });
            
            container.appendChild(card);
        });
    }
    
    // 刷新所有UI组件
    refreshAll() {
        // 重新计算所有数据项
        this.calculator.recalculateAllItems();
        
        // 更新所有UI组件
        this.renderCharacterList();
        this.renderRuleList();
        this.renderDataItemList();
        this.updateStatusInfo();
        this.updateCharacterSelects();
        this.renderImportInfo(); // 添加导入信息渲染
        
        // 如果时间轴模态框当前显示，更新时间轴视图
        const timelineModal = document.getElementById('timelineModal');
        if (timelineModal && !timelineModal.classList.contains('hidden')) {
            this.initTimelineView();
        }
    }
    
    /**
     * 初始化时间轴视图
     */
    initTimelineView() {
        // 获取数据项和学生
        const items = this.dataManager.getDataItems();
        const characters = this.dataManager.getCharacters();
        
        // 更新数据概览卡片
        this.updateTimelineStats(items);
        
        // 渲染时间轴事件
        this.renderTimelineEvents(items, characters);
        
        // 初始化费用变化曲线
        this.initCostChart(items);
        
        // 添加交互功能
        this.initTimelineInteractions(items, characters);
    }
    
    /**
     * 更新时间轴统计信息
     * @param {Array} items - 数据项数组
     */
    updateTimelineStats(items) {
        // 过滤有效数据项：排除初始化、undefined项和无效对象
        const validItems = items.filter(item => {
            if (!item || typeof item !== 'object') return false;
            if (item.action === '初始化') return false;
            return typeof item.cost === 'number';
        });
        
        // 计算技能释放次数
        const totalActions = validItems.length;
        
        // 计算总触发费用
        const totalCost = validItems.reduce((sum, item) => sum + item.cost, 0);
        
        // 计算平均费用
        const averageCost = totalActions > 0 ? totalCost / totalActions : 0;
        
        // 更新DOM元素
        const totalActionsEl = document.getElementById('timelineTotalActions');
        const totalCostEl = document.getElementById('timelineTotalCost');
        const averageCostEl = document.getElementById('timelineAverageCost');
        
        if (totalActionsEl) {
            totalActionsEl.textContent = totalActions;
        }
        
        if (totalCostEl) {
            totalCostEl.textContent = `${totalCost.toFixed(2)}c`;
        }
        
        if (averageCostEl) {
            averageCostEl.textContent = `${averageCost.toFixed(2)}c`;
        }
    }
    
    /**
     * 渲染时间轴事件卡片
     * @param {Array} items - 数据项数组
     * @param {Array} characters - 学生数组
     */
    renderTimelineEvents(items, characters) {
        const timelineEventsContainer = document.getElementById('timelineEvents');
        if (!timelineEventsContainer) return;
        
        // 过滤数据项：排除初始化、undefined项和无效对象
        const filteredItems = items.filter(item => {
            // 确保item是有效的对象
            if (!item || typeof item !== 'object') return false;
            // 排除初始化项
            if (item.action === '初始化') return false;
            // 确保所有必要的属性都存在
            return item.hasOwnProperty('time') && 
                   item.hasOwnProperty('cost') && 
                   item.hasOwnProperty('remainingCost') &&
                   item.hasOwnProperty('action');
        });
        
        // 按时间倒序排序（从大到小），与费用变化曲线保持一致
        const sortedItems = [...filteredItems].sort((a, b) => b.time - a.time);
        
        if (sortedItems.length === 0) {
            // 显示空状态
            timelineEventsContainer.innerHTML = `
                <div class="timeline-empty-state">
                    <i class="fas fa-clock"></i>
                    <h4 class="text-lg font-medium mb-2">暂无事件数据</h4>
                    <p class="text-gray-500">
                        请先添加数据项以查看时间轴
                    </p>
                </div>
            `;
            return;
        }
        
        // 渲染时间轴卡片
        const timelineCardsHTML = sortedItems.map((item, index) => {
            // 为所有属性添加默认值，防止访问不存在的属性
            const character = characters.find(c => c.id === item.characterId)?.name || '未知学生';
            const action = item.action || '未知动作';
            const time = typeof item.time === 'number' ? item.time : 0;
            const cost = typeof item.cost === 'number' ? item.cost : 0;
            const remainingCost = typeof item.remainingCost === 'number' ? item.remainingCost : 0;
            const costDeduction = typeof item.costDeduction === 'number' ? item.costDeduction : 0;
            const timeInterval = typeof item.timeInterval === 'number' ? item.timeInterval : 0;
            
            return `
                <div class="timeline-card">
                    <div class="timeline-card-header">
                        <div class="timeline-card-title">
                            <i class="fas fa-bolt text-primary"></i>
                            <span>${character} - ${action}</span>
                        </div>
                        <div class="timeline-card-meta">
                            <span class="cost-badge">${remainingCost.toFixed(2)}c</span>
                            <span class="sequence-badge">第 ${index + 1} 次</span>
                        </div>
                    </div>
                    
                    <div class="timeline-card-content">
                        <div class="timeline-card-detail">
                            <span class="timeline-card-detail-label">触发时间</span>
                            <span class="timeline-card-detail-value">${this.formatTime(time)}</span>
                        </div>
                        <div class="timeline-card-detail">
                            <span class="timeline-card-detail-label">技能费用</span>
                            <span class="timeline-card-detail-value">${cost.toFixed(2)}c</span>
                        </div>
                        <div class="timeline-card-detail">
                            <span class="timeline-card-detail-label">费用扣除</span>
                            <span class="timeline-card-detail-value">${costDeduction.toFixed(2)}c</span>
                        </div>
                        <div class="timeline-card-detail">
                            <span class="timeline-card-detail-label">时间间隔</span>
                            <span class="timeline-card-detail-value">${timeInterval.toFixed(2)}s</span>
                        </div>
                    </div>
                    
                    <div class="timeline-card-footer">
                        <div class="text-sm text-gray-500">
                            <i class="fas fa-clock mr-1"></i>
                            ${this.formatTime(time)}
                        </div>
                        <div class="text-sm text-gray-500">
                            <i class="fas fa-user mr-1"></i>
                            ${character}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        timelineEventsContainer.innerHTML = timelineCardsHTML;
    }
    
    /**
     * 格式化时间为00:00.000格式
     * @param {number} seconds - 秒数
     * @returns {string} 格式化后的时间字符串
     */
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        const intSeconds = Math.floor(remainingSeconds);
        const milliseconds = Math.floor((remainingSeconds - intSeconds) * 1000);
        
        return `${minutes.toString().padStart(2, '0')}:${intSeconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
    }
    
    /**
     * 初始化费用变化曲线
     * @param {Array} items - 数据项数组
     * @param {string} chartType - 图表类型，默认为line
     */
    initCostChart(items, chartType = 'line') {
        const ctx = document.getElementById('costChart');
        if (!ctx) return;
        
        // 显示加载动画
        const chartLoading = document.getElementById('chartLoading');
        if (chartLoading) {
            chartLoading.classList.remove('hidden');
        }
        
        // 销毁已存在的图表实例
        if (window.costChart && typeof window.costChart.destroy === 'function') {
            try {
                window.costChart.destroy();
            } catch (error) {
                console.error('销毁图表实例时出错:', error);
            }
        }
        
        // 清除window.costChart引用
        window.costChart = null;
        
        // 准备图表数据（prepareChartData已包含数据验证）
        const chartData = this.prepareChartData(items, chartType);
        
        // 使用全局Chart对象创建图表
        const chartConstructor = window.Chart.default || window.Chart;
        
        try {
            window.costChart = new chartConstructor(ctx, {
                type: chartType,
                data: chartData,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'top',
                            labels: {
                                usePointStyle: true,
                                padding: 20
                            }
                        },
                        tooltip: {
                            mode: 'index',
                            intersect: false,
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            titleColor: '#ffffff',
                            bodyColor: '#ffffff',
                            borderColor: '#3b82f6',
                            borderWidth: 1,
                            padding: 10,
                            cornerRadius: 6,
                            callbacks: {
                                title: function(context) {
                                    return `时间: ${context[0].label}`;
                                },
                                label: function(context) {
                                    return `${context.dataset.label}: ${context.parsed.y.toFixed(2)}c`;
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 10,
                            title: {
                                display: true,
                                text: '费用 (c)'
                            }
                        },
                        x: {
                            title: {
                                display: false
                            },
                            grid: {
                                display: true
                            }
                        }
                    },
                    animation: {
                        duration: 1500,
                        easing: 'easeInOutQuart'
                    }
                }
            });
        } catch (error) {
            console.error('创建图表时出错:', error);
        } finally {
            // 隐藏加载动画
            setTimeout(() => {
                if (chartLoading) {
                    chartLoading.classList.add('hidden');
                }
            }, 300);
        }
    }
    
    /**
     * 准备图表数据
     * @param {Array} items - 数据项数组
     * @param {string} chartType - 图表类型
     * @returns {Object} 图表数据对象
     */
    prepareChartData(items, chartType) {
        // 过滤有效数据项：确保item是对象且具有必要属性
        const validItems = items.filter(item => {
            if (!item || typeof item !== 'object') return false;
            return typeof item.time === 'number' && 
                   typeof item.cost === 'number' && 
                   typeof item.remainingCost === 'number';
        });
        
        // 如果没有有效数据，返回空数据结构
        if (validItems.length === 0) {
            return {
                labels: ['00:00.000'],
                datasets: [
                    {
                        label: '剩余费用 (c)',
                        data: [0],
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        borderWidth: 2,
                        fill: chartType === 'line'
                    },
                    {
                        label: '触发费用 (c)',
                        data: [0],
                        borderColor: '#ef4444',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        borderWidth: 2,
                        fill: chartType === 'line'
                    }
                ]
            };
        }
        
        // 确保items按时间倒序排序（从大到小）
        const sortedItems = [...validItems].sort((a, b) => b.time - a.time);
        
        // 提取时间点和对应费用，确保所有值都是数字
        const labels = sortedItems.map(item => this.formatTime(item.time));
        const remainingCostData = sortedItems.map(item => typeof item.remainingCost === 'number' ? item.remainingCost : 0);
        const triggerCostData = sortedItems.map(item => typeof item.cost === 'number' ? item.cost : 0);
        
        return {
            labels: labels,
            datasets: [
                {
                    label: '剩余费用 (c)',
                    data: remainingCostData,
                    borderColor: '#3b82f6',
                    backgroundColor: chartType === 'line' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.8)',
                    borderWidth: 2,
                    fill: chartType === 'line',
                    tension: 0.4
                },
                {
                    label: '触发费用 (c)',
                    data: triggerCostData,
                    borderColor: '#ef4444',
                    backgroundColor: chartType === 'line' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.8)',
                    borderWidth: 2,
                    fill: chartType === 'line',
                    tension: 0.4
                }
            ]
        };
    }
    
    /**
     * 更新费用图表
     */
    updateCostChart() {
        // 检查是否在时间轴视图中
        const timelineModal = document.getElementById('timelineModal');
        if (timelineModal && !timelineModal.classList.contains('hidden')) {
            // 如果时间轴模态框显示，更新费用变化曲线
            const items = this.dataManager.getDataItems();
            this.initCostChart(items, window.costChartType || 'line');
        }
    }
    
    /**
     * 渲染导入信息
     */
    renderImportInfo() {
        // 获取导出信息
        const exportInfo = this.dataManager.exportInfo;
        
        // 获取DOM元素
        const positionsInfoEl = document.getElementById('positionsInfo');
        const videoAxisBtnContainer = document.getElementById('videoAxisBtnContainer');
        
        if (!positionsInfoEl || !videoAxisBtnContainer) return;
        
        let infoHTML = '';
        
        // 检查是否有学生站位信息需要显示
        const hasPositions = exportInfo.positions.some(pos => pos);
        
        // 检查是否有初始技能信息需要显示
        const hasInitialSkills = exportInfo.initialSkills.some(skill => skill);
        
        // 渲染学生站位信息（仅显示名字，取消编号）
        if (hasPositions) {
            let positionsHTML = exportInfo.positions
                .filter(pos => pos) // 只保留有值的站位
                .map(pos => `<span class="font-medium">${pos}</span>`)
                .join(' ');
            
            infoHTML += `<div class="mb-1 ml-4"><span class="text-sm text-blue-700 bg-blue-50 px-2 py-1 rounded-md">站位: ${positionsHTML}</span></div>`;
        }
        
        // 渲染初始技能信息（仅显示名字，取消编号）
        if (hasInitialSkills) {
            let initialSkillsHTML = exportInfo.initialSkills
                .filter(skill => skill) // 只保留有值的技能
                .map(skill => `<span class="font-medium text-red-600">${skill}</span>`)
                .join(' ');
            
            infoHTML += `<div class="ml-4"><span class="text-sm text-red-700 bg-red-50 px-2 py-1 rounded-md">初始技能: ${initialSkillsHTML}</span></div>`;
        }
        
        // 更新信息显示
        if (infoHTML) {
            positionsInfoEl.innerHTML = infoHTML;
            positionsInfoEl.style.display = 'block';
        } else {
            // 没有信息需要显示，隐藏元素
            positionsInfoEl.innerHTML = '';
            positionsInfoEl.style.display = 'none';
        }
        
        // 渲染视频轴按钮
        if (exportInfo.videoAxisLink) {
            videoAxisBtnContainer.innerHTML = `
                <a href="${exportInfo.videoAxisLink}" target="_blank" rel="noopener noreferrer" class="btn btn-primary flex items-center gap-1 px-3 py-1 rounded hover:bg-opacity-80 transition-colors duration-200">
                    <i class="fas fa-play-circle"></i>
                    <span>视频轴</span>
                </a>
            `;
        } else {
            // 没有视频轴链接，清空容器
            videoAxisBtnContainer.innerHTML = '';
        }
    }
    
    /**
     * 初始化时间轴交互功能
     * @param {Array} items - 数据项数组
     * @param {Array} characters - 学生数组
     */
    initTimelineInteractions(items, characters) {
        // 图表类型切换功能
        const toggleChartTypeBtn = document.getElementById('toggleChartType');
        if (toggleChartTypeBtn) {
            let chartType = 'line';
            
            toggleChartTypeBtn.addEventListener('click', () => {
                // 切换图表类型
                chartType = chartType === 'line' ? 'bar' : 'line';
                window.costChartType = chartType;
                
                // 更新按钮文本
                toggleChartTypeBtn.innerHTML = `
                    <i class="fas fa-chart-${chartType === 'line' ? 'line' : 'bar'}"></i>
                    <span>切换到${chartType === 'line' ? '柱状图' : '折线图'}</span>
                `;
                
                // 获取最新的数据
                const latestItems = this.dataManager.getDataItems();
                
                // 重新初始化图表
                this.initCostChart(latestItems, chartType);
            });
        }
    }

    // 显示加载状态
    showLoading(message = '加载中...') {
        const loadingElement = document.createElement('div');
        loadingElement.className = 'loading-overlay';
        loadingElement.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner-border" role="status">
                    <span class="sr-only">${message}</span>
                </div>
                <p>${message}</p>
            </div>
        `;
        document.body.appendChild(loadingElement);
    }

    // 隐藏加载状态
    hideLoading() {
        const loadingElement = document.querySelector('.loading-overlay');
        if (loadingElement) {
            loadingElement.remove();
        }
    }

    // 高亮显示指定元素
    highlightElement(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.add('highlight');
            setTimeout(() => {
                element.classList.remove('highlight');
            }, 2000);
        }
    }

    // 滚动到指定元素
    scrollToElement(elementId, behavior = 'smooth') {
        const element = document.getElementById(elementId);
        if (element) {
            element.scrollIntoView({ behavior });
        }
    }
}

// 导出UIRenderer类作为默认导出
export default UIRenderer;
