// 数据管理器模块
class DataManager {
    constructor() {
        this.characters = [];    // 学生列表
        this.rules = [];         // 关联规则列表
        this.dataItems = [];     // 数据项列表
        this.currentCost = 0;    // 当前费用
        this.totalCost = 10;     // 总费用上限
        this.nextId = 1;         // 用于生成唯一ID的计数器
        this.hideSpecialRows = false; // 是否隐藏特殊行
        this.continuousChargeData = []; // 持续回费设置数组
        this.initializationDuration = 0; // 初始化持续时间
        this.showCompleteData = false; // 是否显示完整数据
        
        // 新增：导出信息字段
        this.exportInfo = {
            positions: ["", "", "", ""], // 学生站位（4个）
            initialSkills: ["", "", ""], // 初始技能（3个）
            videoAxisLink: "" // 视频轴链接
        };
        
        // 分页相关状态
        this.currentPage = 1;    // 当前页码
        this.pageSize = 10;      // 每页显示行数
        
        // 预设学生数据
        this.presetCharacters = [
            { name: '水白', costRecoveryRate: 0.07, skillCost: 3, costIncrease: 20.2, isChargePercentage: true },
            { name: '礼奈', costRecoveryRate: 0.07, skillCost: 6, costIncrease: 0, isChargePercentage: false },
            { name: '瞬', costRecoveryRate: 0.07, skillCost: 3, costIncrease: 0, isChargePercentage: false },
            { name: '妃咲', costRecoveryRate: 0.07, skillCost: 3, costIncrease: 20.2, isChargePercentage: true },
            { name: '未花', costRecoveryRate: 0.07, skillCost: 6, costIncrease: 0, isChargePercentage: false },
            { name: '若藻', costRecoveryRate: 0.07, skillCost: 4, costIncrease: 0, isChargePercentage: false },
            { name: '水星', costRecoveryRate: 0.07, skillCost: 5, costIncrease: 0, isChargePercentage: false },
            { name: '锅', costRecoveryRate: 0.07, skillCost: 2, costIncrease: 0, isChargePercentage: false },
            { name: '礼露', costRecoveryRate: 0.07, skillCost: 3, costIncrease: 0, isChargePercentage: false },
            { name: '圣娅', costRecoveryRate: 0.07, skillCost: 3, costIncrease: 0, isChargePercentage: false },
            { name: '圣娅（泳装）', costRecoveryRate: 0.07, skillCost: 3, costIncrease: 0, isChargePercentage: false },
            { name: '水花', costRecoveryRate: 0.07, skillCost: 2, costIncrease: 0, isChargePercentage: false }
        ];
        
        // 撤销/重做相关状态
        this.undoStack = [];     // 撤销栈
        this.redoStack = [];     // 重做栈
        this.maxHistorySize = 50; // 最大历史记录数量
    }

    // 获取唯一ID
    getNextId() {
        return this.nextId++;
    }

    // 添加学生
    addCharacter(characterData) {
        this.saveState();
        // 检查学生名称是否重复
        const nameExists = this.characters.some(character => 
            character.name.toLowerCase() === characterData.name.toLowerCase()
        );
        if (nameExists) {
            throw new Error('学生名称已存在');
        }

        const newCharacter = {
            id: this.getNextId(),
            name: characterData.name || '新学生',
            costRecoveryRate: parseFloat(characterData.costRecoveryRate) || 0,
            skillCost: parseFloat(characterData.skillCost) || 0,
            costIncrease: parseFloat(characterData.costIncrease) || 0,
            isChargePercentage: characterData.isChargePercentage || false,
            createdAt: new Date().toISOString()
        };
        this.characters.push(newCharacter);
        return newCharacter;
    }

    // 更新学生
    updateCharacter(id, characterData) {
        this.saveState();
        const index = this.characters.findIndex(character => character.id === id);
        if (index !== -1) {
            // 检查学生名称是否重复（排除当前学生）
            if (characterData.name) {
                const nameExists = this.characters.some(character => 
                    character.id !== id && character.name.toLowerCase() === characterData.name.toLowerCase()
                );
                if (nameExists) {
                    throw new Error('学生名称已存在');
                }
            }

            // 处理数据以确保isChargePercentage始终为布尔值
            const processedData = { ...characterData };
            if (processedData.hasOwnProperty('isChargePercentage')) {
                processedData.isChargePercentage = !!processedData.isChargePercentage;
            }
            this.characters[index] = {
                ...this.characters[index],
                ...processedData,
                updatedAt: new Date().toISOString()
            };
            return this.characters[index];
        }
        return null;
    }

    // 删除学生
    deleteCharacter(id) {
        this.saveState();
        const index = this.characters.findIndex(character => character.id === id);
        if (index !== -1) {
            // 移除相关规则
            this.rules = this.rules.filter(rule => rule.characterId !== id);
            
            // 移除相关数据项
            this.dataItems = this.dataItems.filter(item => item.characterId !== id);
            
            return this.characters.splice(index, 1)[0];
        }
        return null;
    }

    // 获取学生列表
    getCharacters() {
        return [...this.characters];
    }

    // 根据ID获取学生
    getCharacterById(id) {
        return this.characters.find(character => character.id === id) || null;
    }

    // 添加关联规则
    addRule(ruleData) {
        this.saveState();
        // 创建基础规则对象，某些规则类型可能不需要characterId
        const baseRule = {
            id: this.getNextId(),
            type: ruleData.type,
            createdAt: new Date().toISOString()
        };
        
        // 仅当有characterId且规则类型需要时才添加
        if (ruleData.characterId) {
            baseRule.characterId = ruleData.characterId;
        }
        
        let rule;
        switch (ruleData.type) {
            case 'costReduction':
                rule = {
                    ...baseRule,
                    // 统一使用targetCharacterIds数组
                    targetCharacterIds: ruleData.targetCharacterIds || [ruleData.targetCharacterId],
                    effectCount: ruleData.effectCount,
                    reductionValue: parseFloat(ruleData.reductionValue) || 0
                };
                break;


            case 'costChange':
                rule = {
                    ...baseRule,
                    changeValue: parseFloat(ruleData.changeValue) || 0
                };
                break;
            case 'chargeIncrease':
                rule = {
                    ...baseRule,
                    activationTime: parseFloat(ruleData.activationTime) || 0,
                    duration: parseFloat(ruleData.duration) || 0,
                    chargeType: ruleData.chargeType,
                    chargeValue: parseFloat(ruleData.chargeValue) || 0,
                    targetCharacterIds: ruleData.targetCharacterIds || [],
                    effectType: ruleData.effectType || 'increase'
                };
                break;
            default:
                rule = baseRule;
        }
        
        this.rules.push(rule);
        return rule;
    }

    // 更新关联规则
    updateRule(id, ruleData) {
        this.saveState();
        const index = this.rules.findIndex(rule => rule.id === id);
        if (index !== -1) {
            let updatedRule = {
                ...this.rules[index],
                updatedAt: new Date().toISOString()
            };
            
            // 根据规则类型更新不同的字段
            switch (ruleData.type) {
                case 'costReduction':
                    updatedRule = {
                        ...updatedRule,
                        // 统一使用targetCharacterIds数组
                        targetCharacterIds: ruleData.targetCharacterIds || [ruleData.targetCharacterId],
                        effectCount: ruleData.effectCount,
                        reductionValue: parseFloat(ruleData.reductionValue) || 0
                    };
                    break;


                case 'costChange':
                    updatedRule = {
                        ...updatedRule,
                        changeValue: parseFloat(ruleData.changeValue) || 0
                    };
                    break;
                case 'chargeIncrease':
                    updatedRule = {
                        ...updatedRule,
                        activationTime: parseFloat(ruleData.activationTime) || 0,
                        duration: parseFloat(ruleData.duration) || 0,
                        chargeType: ruleData.chargeType,
                        chargeValue: parseFloat(ruleData.chargeValue) || 0,
                        targetCharacterIds: ruleData.targetCharacterIds || [],
                        effectType: ruleData.effectType || 'increase'
                    };
                    break;
            }
            
            this.rules[index] = updatedRule;
            return updatedRule;
        }
        return null;
    }

    // 删除关联规则
    deleteRule(id) {
        this.saveState();
        const index = this.rules.findIndex(rule => rule.id === id);
        if (index !== -1) {
            return this.rules.splice(index, 1)[0];
        }
        return null;
    }

    // 获取关联规则列表
    getRules() {
        return [...this.rules];
    }

    // 根据学生ID获取关联规则
    getRulesByCharacterId(characterId) {
        return this.rules.filter(rule => rule.characterId === characterId);
    }

    // 根据ID获取关联规则
    getRuleById(id) {
        return this.rules.find(rule => rule.id === id);
    }

    // 添加数据项
    addDataItem(itemData) {
        this.saveState();
        const lastItem = this.dataItems[this.dataItems.length - 1];
        const defaultTime = lastItem ? this.getTimeFromItem(lastItem) + 1 : 0;
        
        const newItem = {
            id: this.getNextId(),
            characterId: itemData.characterId,
            cost: parseFloat(itemData.cost) || 0,
            action: itemData.action || '技能',
            time: itemData.time || defaultTime,
            timeInterval: itemData.timeInterval || (lastItem ? this.getTimeFromItem(itemData) - this.getTimeFromItem(lastItem) : 0),
            costDeduction: 0,
            remainingCost: 0,
            createdAt: new Date().toISOString(),
            // 新增：附加数据字段
            additionalData: {
                note: '', // 备注
                imageUrl: '' // 图片URL
            }
        };
        
        this.dataItems.push(newItem);
        return newItem;
    }

    // 更新数据项
    updateDataItem(id, itemData) {
        this.saveState();
        const index = this.dataItems.findIndex(item => item.id === id);
        if (index !== -1) {
            // 确保additionalData字段存在
            if (!this.dataItems[index].additionalData) {
                this.dataItems[index].additionalData = {
                    note: '',
                    imageUrl: ''
                };
            }
            
            this.dataItems[index] = {
                ...this.dataItems[index],
                ...itemData,
                updatedAt: new Date().toISOString()
            };
            return this.dataItems[index];
        }
        return null;
    }
    
    // 更新数据项的附加数据
    updateAdditionalData(id, additionalData) {
        this.saveState();
        const index = this.dataItems.findIndex(item => item.id === id);
        if (index !== -1) {
            // 确保additionalData字段存在
            if (!this.dataItems[index].additionalData) {
                this.dataItems[index].additionalData = {
                    note: '',
                    imageUrl: ''
                };
            }
            
            // 更新附加数据
            this.dataItems[index].additionalData = {
                ...this.dataItems[index].additionalData,
                ...additionalData
            };
            
            this.dataItems[index].updatedAt = new Date().toISOString();
            return this.dataItems[index];
        }
        return null;
    }

    // 删除数据项
    deleteDataItem(id) {
        this.saveState();
        const index = this.dataItems.findIndex(item => item.id === id);
        if (index !== -1) {
            // 获取要删除的数据项
            const deletedItem = this.dataItems[index];
            // 删除关联的规则
            this.rules = this.rules.filter(rule => rule.characterId !== id);
            // 删除数据项
            this.dataItems.splice(index, 1);
            // 如果删除的是特殊行，清除相关效果
            if (deletedItem.action === '回费' || deletedItem.action === '减费') {
                // 重置规则计数器
                // 这将确保水白的减费效果和瞬的回费效果重新计算
            }
            return deletedItem;
        }
        return null;
    }

    // 批量删除数据项
    deleteDataItems(ids) {
        this.saveState();
        // 获取要删除的数据项
        const deletedItems = this.dataItems.filter(item => ids.includes(item.id));
        // 删除关联的规则
        this.rules = this.rules.filter(rule => !ids.includes(rule.characterId));
        // 删除数据项
        this.dataItems = this.dataItems.filter(item => !ids.includes(item.id));
        // 如果删除了特殊行，清除相关效果
        const hasSpecialRow = deletedItems.some(item => item.action === '回费' || item.action === '减费');
        if (hasSpecialRow) {
            // 重置规则计数器
            // 这将确保水白的减费效果和瞬的回费效果重新计算
        }
    }

    // 获取过滤后的数据项列表（用于UI显示）
    getDataItems() {
        let items = [...this.dataItems];
        
        // 如果需要隐藏特殊行，过滤掉action为"回费"或"减费"的数据项
        if (this.hideSpecialRows) {
            items = items.filter(item => item.action !== '回费' && item.action !== '减费');
        }
        
        return items;
    }
    
    // 获取所有数据项（用于计算，不考虑隐藏状态）
    getAllDataItems() {
        return [...this.dataItems];
    }
    
    // 设置是否隐藏特殊行
    setHideSpecialRows(hide) {
        this.hideSpecialRows = hide;
    }
    
    // 获取是否隐藏特殊行
    getHideSpecialRows() {
        return this.hideSpecialRows;
    }
    
    // 设置是否显示完整数据
    setShowCompleteData(show) {
        this.showCompleteData = show;
    }
    
    // 获取是否显示完整数据
    getShowCompleteData() {
        return this.showCompleteData;
    }
    
    // 分页相关方法
    // 获取当前页码
    getCurrentPage() {
        return this.currentPage;
    }
    
    // 设置当前页码
    setCurrentPage(page) {
        this.currentPage = Math.max(1, page);
    }
    
    // 获取每页显示行数
    getPageSize() {
        return this.pageSize;
    }
    
    // 设置每页显示行数
    setPageSize(size) {
        this.pageSize = size;
        this.currentPage = 1; // 重置到第一页
    }
    
    // 获取总页数
    getTotalPages() {
        let items = this.dataItems;
        if (this.hideSpecialRows) {
            items = items.filter(item => item.action !== '回费' && item.action !== '减费');
        }
        return Math.ceil(items.length / this.pageSize);
    }
    
    // 获取分页后的数据项列表（用于UI显示）
    getPaginatedDataItems() {
        let items = this.getDataItems(); // 已考虑隐藏特殊行
        
        if (this.showCompleteData) {
            // 如果显示完整数据，返回所有数据项
            return items;
        } else {
            // 否则返回分页后的数据项
            const startIndex = (this.currentPage - 1) * this.pageSize;
            const endIndex = startIndex + this.pageSize;
            
            return items.slice(startIndex, endIndex);
        }
    }

    // 根据ID获取数据项
    getDataItemById(id) {
        return this.dataItems.find(item => item.id === id) || null;
    }

    // 从数据项中获取时间
    getTimeFromItem(item) {
        return parseFloat(item.time) || 0;
    }

    // 获取最后一个数据项的时间
    getLastItemTime() {
        if (this.dataItems.length === 0) return 0;
        const lastItem = this.dataItems[this.dataItems.length - 1];
        return this.getTimeFromItem(lastItem);
    }

    // 清空所有数据
    clearAllData() {
        this.saveState();
        this.characters = [];
        this.rules = [];
        this.dataItems = [];
        this.currentCost = 0;
        this.nextId = 1;
        this.hideSpecialRows = false;
        this.continuousChargeData = [];
        this.initializationDuration = 0;
        this.currentPage = 1;
        this.pageSize = 10;
    }

    // 保存数据到本地存储
    saveToLocalStorage() {
        try {
            const data = {
                characters: this.characters,
                rules: this.rules,
                dataItems: this.dataItems,
                currentCost: this.currentCost,
                totalCost: this.totalCost,
                nextId: this.nextId,
                initializationDuration: this.initializationDuration,
                hideSpecialRows: this.hideSpecialRows,
                continuousChargeData: this.continuousChargeData,
                currentPage: this.currentPage,
                pageSize: this.pageSize,
                savedAt: new Date().toISOString()
            };
            localStorage.setItem('blueArchiveCalculatorData', JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('保存数据失败:', error);
            return false;
        }
    }

    // 从本地存储加载数据
    loadFromLocalStorage() {
        try {
            const data = localStorage.getItem('blueArchiveCalculatorData');
            if (data) {
                this.saveState();
                const parsedData = JSON.parse(data);
                this.characters = parsedData.characters || [];
                this.rules = parsedData.rules || [];
                this.dataItems = parsedData.dataItems || [];
                this.currentCost = parsedData.currentCost || 0;
                this.totalCost = parsedData.totalCost || 10;
                this.nextId = parsedData.nextId || 1;
                this.initializationDuration = parsedData.initializationDuration || 0;
                this.hideSpecialRows = parsedData.hideSpecialRows || false;
                this.continuousChargeData = parsedData.continuousChargeData || [];
                this.currentPage = parsedData.currentPage || 1;
                this.pageSize = parsedData.pageSize || 10;
                return true;
            }
            return false;
        } catch (error) {
            console.error('加载数据失败:', error);
            return false;
        }
    }

    // 导出数据为JSON
    exportData() {
        return {
            characters: this.characters,
            rules: this.rules,
            dataItems: this.dataItems,
            currentCost: this.currentCost,
            totalCost: this.totalCost,
            nextId: this.nextId,
            initializationDuration: this.initializationDuration,
            hideSpecialRows: this.hideSpecialRows,
            continuousChargeData: this.continuousChargeData,
            currentPage: this.currentPage,
            pageSize: this.pageSize,
            exportInfo: this.exportInfo, // 新增：导出信息
            exportedAt: new Date().toISOString(),
            version: '1.0.0'
        };
    }

    // 导入数据
    importData(data) {
        try {
            this.saveState();
            if (data.characters) this.characters = data.characters;
            if (data.rules) this.rules = data.rules;
            if (data.dataItems) this.dataItems = data.dataItems;
            if (data.currentCost) this.currentCost = data.currentCost;
            if (data.totalCost) this.totalCost = data.totalCost;
            if (data.nextId) this.nextId = data.nextId;
            if (data.initializationDuration !== undefined) this.initializationDuration = data.initializationDuration;
            if (data.hideSpecialRows !== undefined) this.hideSpecialRows = data.hideSpecialRows;
            if (data.continuousChargeData !== undefined) this.continuousChargeData = Array.isArray(data.continuousChargeData) ? data.continuousChargeData : [];
            if (data.currentPage !== undefined) this.currentPage = data.currentPage;
            if (data.pageSize !== undefined) this.pageSize = data.pageSize;
            if (data.exportInfo !== undefined) {
                // 检查exportInfo是否有效（至少有一个字段有值）
                const hasValidInfo = 
                    (data.exportInfo.positions && data.exportInfo.positions.some(pos => pos)) ||
                    (data.exportInfo.initialSkills && data.exportInfo.initialSkills.some(skill => skill)) ||
                    data.exportInfo.videoAxisLink;
                
                if (hasValidInfo) {
                    // 有有效信息时，使用导入的数据
                    this.exportInfo = {
                        positions: data.exportInfo.positions || ["", "", "", ""],
                        initialSkills: data.exportInfo.initialSkills || ["", "", ""],
                        videoAxisLink: data.exportInfo.videoAxisLink || ""
                    };
                } else {
                    // 即使有exportInfo，但没有有效信息，也清空现有的信息
                    this.exportInfo = {
                        positions: ["", "", "", ""],
                        initialSkills: ["", "", ""],
                        videoAxisLink: ""
                    };
                }
            } else {
                // 如果导入的数据没有exportInfo，清空现有的信息
                this.exportInfo = {
                    positions: ["", "", "", ""],
                    initialSkills: ["", "", ""],
                    videoAxisLink: ""
                };
            }
            return true;
        } catch (error) {
            console.error('导入数据失败:', error);
            return false;
        }
    }
    
    // 获取预设学生列表
    getPresetCharacters() {
        return [...this.presetCharacters];
    }
    
    // 检查学生是否已添加
    isCharacterAdded(characterName) {
        return this.characters.some(character => character.name === characterName);
    }
    
    // 清空所有学生
    clearAllCharacters() {
        this.saveState();
        this.characters = [];
        this.rules = [];
        this.nextId = 1;
    }

    // 清空数据项列表
    clearDataItems() {
        this.saveState();
        this.dataItems = [];
        this.currentCost = 0;
    }

    // 设置初始化时间（可选功能）
    setInitializationTime(duration) {
        this.saveState();
        this.initializationDuration = duration;
    }

    // 获取初始化时间
    getInitializationTime() {
        return this.initializationDuration || 0;
    }
    
    // 添加持续回费数据
    setContinuousChargeData(data) {
        this.saveState();
        // 确保continuousChargeData是数组
        if (!Array.isArray(this.continuousChargeData)) {
            this.continuousChargeData = [];
        }
        // 添加新的持续回费设置到数组中
        this.continuousChargeData.push(data);
    }
    
    // 清空持续回费数据
    clearContinuousChargeData() {
        this.saveState();
        this.continuousChargeData = [];
    }
    
    // 设置当前费用
    setCurrentCost(cost) {
        this.currentCost = cost;
    }
    
    // 添加数据项到末尾
    pushDataItem(item) {
        this.dataItems.push(item);
    }
    
    // 保存当前状态到撤销栈
    saveState() {
        // 创建当前状态的深拷贝，包含所有数据属性
        const state = {
            characters: JSON.parse(JSON.stringify(this.characters)),
            rules: JSON.parse(JSON.stringify(this.rules)),
            dataItems: JSON.parse(JSON.stringify(this.dataItems)),
            currentCost: this.currentCost,
            totalCost: this.totalCost,
            nextId: this.nextId,
            hideSpecialRows: this.hideSpecialRows,
            continuousChargeData: JSON.parse(JSON.stringify(this.continuousChargeData)),
            initializationDuration: this.initializationDuration,
            currentPage: this.currentPage,
            pageSize: this.pageSize
        };
        
        // 将状态保存到撤销栈
        this.undoStack.push(state);
        
        // 限制历史记录数量
        if (this.undoStack.length > this.maxHistorySize) {
            this.undoStack.shift();
        }
        
        // 清空重做栈
        this.redoStack = [];
        
        // 触发状态变化事件，用于更新UI
        this.dispatchStateChangeEvent();
    }
    
    // 撤销操作
    undo() {
        if (this.undoStack.length === 0) {
            return false;
        }
        
        // 将当前状态保存到重做栈
        const currentState = {
            characters: JSON.parse(JSON.stringify(this.characters)),
            rules: JSON.parse(JSON.stringify(this.rules)),
            dataItems: JSON.parse(JSON.stringify(this.dataItems)),
            currentCost: this.currentCost,
            totalCost: this.totalCost,
            nextId: this.nextId,
            hideSpecialRows: this.hideSpecialRows,
            continuousChargeData: JSON.parse(JSON.stringify(this.continuousChargeData)),
            initializationDuration: this.initializationDuration,
            currentPage: this.currentPage,
            pageSize: this.pageSize
        };
        this.redoStack.push(currentState);
        
        // 从撤销栈恢复上一个状态
        const previousState = this.undoStack.pop();
        this.restoreState(previousState);
        
        // 触发状态变化事件
        this.dispatchStateChangeEvent();
        
        return true;
    }
    
    // 重做操作
    redo() {
        if (this.redoStack.length === 0) {
            return false;
        }
        
        // 将当前状态保存到撤销栈
        const currentState = {
            characters: JSON.parse(JSON.stringify(this.characters)),
            rules: JSON.parse(JSON.stringify(this.rules)),
            dataItems: JSON.parse(JSON.stringify(this.dataItems)),
            currentCost: this.currentCost,
            totalCost: this.totalCost,
            nextId: this.nextId,
            hideSpecialRows: this.hideSpecialRows,
            continuousChargeData: JSON.parse(JSON.stringify(this.continuousChargeData)),
            initializationDuration: this.initializationDuration,
            currentPage: this.currentPage,
            pageSize: this.pageSize
        };
        this.undoStack.push(currentState);
        
        // 从重做栈恢复下一个状态
        const nextState = this.redoStack.pop();
        this.restoreState(nextState);
        
        // 触发状态变化事件
        this.dispatchStateChangeEvent();
        
        return true;
    }
    
    // 恢复指定状态
    restoreState(state) {
        this.characters = state.characters;
        this.rules = state.rules;
        this.dataItems = state.dataItems;
        this.currentCost = state.currentCost;
        this.totalCost = state.totalCost;
        this.nextId = state.nextId;
        this.hideSpecialRows = state.hideSpecialRows;
        this.continuousChargeData = state.continuousChargeData;
        this.initializationDuration = state.initializationDuration;
        this.currentPage = state.currentPage;
        this.pageSize = state.pageSize;
    }
    
    // 检查是否可以撤销
    canUndo() {
        return this.undoStack.length > 0;
    }
    
    // 检查是否可以重做
    canRedo() {
        return this.redoStack.length > 0;
    }
    
    // 触发状态变化事件
    dispatchStateChangeEvent() {
        const event = new CustomEvent('stateChanged', {
            detail: {
                canUndo: this.canUndo(),
                canRedo: this.canRedo()
            }
        });
        document.dispatchEvent(event);
    }
}

// 导出DataManager类作为默认导出
export default DataManager;