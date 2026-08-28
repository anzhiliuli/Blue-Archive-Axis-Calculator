// 数据管理器模块
class DataManager {
    constructor() {
        this.characters = [];    // 学生列表
        this.rules = [];         // 关联规则列表
        this.dataItems = [];     // 数据项列表
        this.currentCost = 0;    // 当前费用
        this.totalCost = 10;     // 总费用上限
        // 三类实体各自独立的ID计数器，避免跨实体ID冲突
        this.nextCharacterId = 1; // 学生ID计数器
        this.nextRuleId = 1;      // 规则ID计数器
        this.nextDataItemId = 1;  // 数据项ID计数器
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

    // 获取各类实体的唯一ID（各自独立计数）
    getNextCharacterId() {
        return this.nextCharacterId++;
    }

    getNextRuleId() {
        return this.nextRuleId++;
    }

    getNextDataItemId() {
        return this.nextDataItemId++;
    }

    // 根据现有数据推导各计数器下限，防止加载/导入后产生重复ID
    recalcIdCounters() {
        const maxNumericId = (arr) => arr.reduce((max, item) => {
            const id = parseInt(item && item.id);
            return Number.isFinite(id) && id > max ? id : max;
        }, 0);
        this.nextCharacterId = Math.max(this.nextCharacterId, maxNumericId(this.characters) + 1);
        this.nextRuleId = Math.max(this.nextRuleId, maxNumericId(this.rules) + 1);
        this.nextDataItemId = Math.max(this.nextDataItemId, maxNumericId(this.dataItems) + 1);
    }

    // 添加学生
    addCharacter(characterData) {
        // 先校验，校验通过后才保存撤销快照，避免失败操作污染撤销栈
        const nameExists = this.characters.some(character =>
            character.name.toLowerCase() === characterData.name.toLowerCase()
        );
        if (nameExists) {
            throw new Error('学生名称已存在');
        }
        this.saveState();

        const newCharacter = {
            id: this.getNextCharacterId(),
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
        const index = this.characters.findIndex(character => character.id === id);
        if (index !== -1) {
            // 先校验，校验通过后才保存撤销快照，避免失败操作污染撤销栈
            if (characterData.name) {
                const nameExists = this.characters.some(character =>
                    character.id !== id && character.name.toLowerCase() === characterData.name.toLowerCase()
                );
                if (nameExists) {
                    throw new Error('学生名称已存在');
                }
            }
            this.saveState();

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
            // 仅移除目标学生包含该角色的规则
            // 注意：rule.characterId 存储的是数据行ID（另一套ID空间），不能与学生ID比较
            this.rules = this.rules.filter(rule =>
                !(Array.isArray(rule.targetCharacterIds) && rule.targetCharacterIds.includes(id))
            );

            // 移除相关数据项（item.characterId 为学生ID，同一ID空间，可安全比较）
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
        // 注意：characterId 此处存储的是所挂数据行的ID
        const baseRule = {
            id: this.getNextRuleId(),
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
            id: this.getNextDataItemId(),
            characterId: itemData.characterId,
            cost: parseFloat(itemData.cost) || 0,
            action: itemData.action || '技能',
            time: itemData.time !== undefined && itemData.time !== null ? itemData.time : defaultTime,
            timeInterval: itemData.timeInterval !== undefined && itemData.timeInterval !== null
                ? itemData.timeInterval
                : (lastItem ? this.getTimeFromItem(itemData) - this.getTimeFromItem(lastItem) : 0),
            costDeduction: 0,
            remainingCost: 0,
            createdAt: new Date().toISOString(),
            // 新增：附加数据字段
            additionalData: {
                note: '', // 备注
                imageUrl: '' // 图片URL
            }
        };
        
        // 按时间排序插入到正确位置，而不是直接追加到最后
        const insertIndex = this.findInsertIndex(newItem);
        this.dataItems.splice(insertIndex, 0, newItem);
        return newItem;
    }

    // 计算数据项按时间降序排列时的插入位置（初始化行始终固定在首位）
    findInsertIndex(newItem) {
        const items = this.dataItems;
        // 初始化行始终占据首位，从第二行开始寻找插入点
        const start = (items.length > 0 && items[0].action === '初始化') ? 1 : 0;
        const newTime = this.getTimeFromItem(newItem);
        for (let i = start; i < items.length; i++) {
            if (this.getTimeFromItem(items[i]) < newTime) {
                return i;
            }
        }
        return items.length;
    }

    // 按时间降序重排所有数据项（初始化行始终固定在首位）
    sortDataItemsByTime() {
        if (this.dataItems.length <= 1) return;
        const compare = (a, b) => this.getTimeFromItem(b) - this.getTimeFromItem(a);
        if (this.dataItems[0].action === '初始化') {
            const rest = this.dataItems.slice(1).sort(compare);
            this.dataItems = [this.dataItems[0], ...rest];
        } else {
            this.dataItems = [...this.dataItems].sort(compare);
        }
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
            // 时间被修改后重新排序，保持表格按时间排列
            if (itemData.time !== undefined && itemData.time !== null) {
                this.sortDataItemsByTime();
            }
            return this.dataItems.find(item => item.id === id);
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
            // 删除挂在该行上的规则（rule.characterId 为数据行ID，同一ID空间）
            this.rules = this.rules.filter(rule => rule.characterId !== id);
            // 删除数据项
            this.dataItems.splice(index, 1);
            return deletedItem;
        }
        return null;
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

    // 保存数据到本地存储
    saveToLocalStorage() {
        try {
            const data = {
                characters: this.characters,
                rules: this.rules,
                dataItems: this.dataItems,
                currentCost: this.currentCost,
                totalCost: this.totalCost,
                nextCharacterId: this.nextCharacterId,
                nextRuleId: this.nextRuleId,
                nextDataItemId: this.nextDataItemId,
                initializationDuration: this.initializationDuration,
                hideSpecialRows: this.hideSpecialRows,
                showCompleteData: this.showCompleteData,
                continuousChargeData: this.continuousChargeData,
                currentPage: this.currentPage,
                pageSize: this.pageSize,
                exportInfo: this.exportInfo,
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
                const parsedData = JSON.parse(data);
                if (!parsedData || typeof parsedData !== 'object') {
                    return false;
                }
                this.characters = Array.isArray(parsedData.characters) ? parsedData.characters : [];
                this.rules = Array.isArray(parsedData.rules) ? parsedData.rules : [];
                this.dataItems = Array.isArray(parsedData.dataItems) ? parsedData.dataItems : [];
                this.currentCost = Number(parsedData.currentCost) || 0;
                this.totalCost = Number(parsedData.totalCost) || 10;
                this.initializationDuration = Number(parsedData.initializationDuration) || 0;
                this.hideSpecialRows = !!parsedData.hideSpecialRows;
                this.showCompleteData = !!parsedData.showCompleteData;
                this.continuousChargeData = Array.isArray(parsedData.continuousChargeData) ? parsedData.continuousChargeData : [];
                this.currentPage = Number(parsedData.currentPage) || 1;
                this.pageSize = Number(parsedData.pageSize) || 10;
                if (parsedData.exportInfo && typeof parsedData.exportInfo === 'object') {
                    this.exportInfo = {
                        positions: Array.isArray(parsedData.exportInfo.positions) ? parsedData.exportInfo.positions : ["", "", "", ""],
                        initialSkills: Array.isArray(parsedData.exportInfo.initialSkills) ? parsedData.exportInfo.initialSkills : ["", "", ""],
                        videoAxisLink: parsedData.exportInfo.videoAxisLink || ""
                    };
                }
                // 根据现有数据推导ID计数器，兼容旧版单一 nextId 的存档
                const legacyNextId = Number(parsedData.nextId) || 1;
                this.nextCharacterId = Math.max(1, legacyNextId);
                this.nextRuleId = Math.max(1, legacyNextId);
                this.nextDataItemId = Math.max(1, legacyNextId);
                this.nextCharacterId = Number(parsedData.nextCharacterId) || this.nextCharacterId;
                this.nextRuleId = Number(parsedData.nextRuleId) || this.nextRuleId;
                this.nextDataItemId = Number(parsedData.nextDataItemId) || this.nextDataItemId;
                this.recalcIdCounters();
                // 加载完成的状态作为撤销基线，清空历史栈
                this.undoStack = [];
                this.redoStack = [];
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
            nextCharacterId: this.nextCharacterId,
            nextRuleId: this.nextRuleId,
            nextDataItemId: this.nextDataItemId,
            initializationDuration: this.initializationDuration,
            hideSpecialRows: this.hideSpecialRows,
            showCompleteData: this.showCompleteData,
            continuousChargeData: this.continuousChargeData,
            currentPage: this.currentPage,
            pageSize: this.pageSize,
            exportInfo: this.exportInfo, // 新增：导出信息
            exportedAt: new Date().toISOString(),
            version: '1.1.0',
            fileName: `碧蓝档案轴-数据-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}` // 添加默认文件名
        };
    }

    // 导入数据
    importData(data) {
        try {
            if (!data || typeof data !== 'object') {
                throw new Error('导入的数据格式无效');
            }
            // 基础结构与类型校验，防止非法数据破坏运行时状态
            if (data.characters !== undefined && !Array.isArray(data.characters)) {
                throw new Error('学生列表格式无效');
            }
            if (data.rules !== undefined && !Array.isArray(data.rules)) {
                throw new Error('规则列表格式无效');
            }
            if (data.dataItems !== undefined && !Array.isArray(data.dataItems)) {
                throw new Error('数据项列表格式无效');
            }
            this.saveState();
            if (Array.isArray(data.characters)) this.characters = data.characters;
            if (Array.isArray(data.rules)) this.rules = data.rules;
            if (Array.isArray(data.dataItems)) this.dataItems = data.dataItems;
            if (data.currentCost != null) this.currentCost = Number(data.currentCost) || 0;
            if (data.totalCost != null) this.totalCost = Number(data.totalCost) || 10;
            if (data.initializationDuration != null) this.initializationDuration = Number(data.initializationDuration) || 0;
            if (data.hideSpecialRows != null) this.hideSpecialRows = !!data.hideSpecialRows;
            if (data.showCompleteData != null) this.showCompleteData = !!data.showCompleteData;
            if (data.continuousChargeData !== undefined) this.continuousChargeData = Array.isArray(data.continuousChargeData) ? data.continuousChargeData : [];
            if (data.currentPage != null) this.currentPage = Number(data.currentPage) || 1;
            if (data.pageSize != null) this.pageSize = Number(data.pageSize) || 10;
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
            // 导入数据自带ID，重新推导各计数器避免后续生成重复ID
            this.recalcIdCounters();
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
        // 仅重置学生ID计数器，规则/数据项计数器保持连续
        this.nextCharacterId = 1;
    }

    // 清空数据项列表
    clearDataItems() {
        this.saveState();
        this.dataItems = [];
        this.currentCost = 0;
    }

    /**
     * 重置并初始化数据（初始化流程专用）
     * 将清空数据项/规则/持续回费/导出信息、设置初始化时间并生成默认初始化行
     * 合并为一次原子操作：仅创建一次撤销快照，避免中间态进入撤销栈
     * @param {number} initialTimeSeconds - 初始化时间（秒）
     */
    resetForInitialization(initialTimeSeconds) {
        this.saveState();
        
        this.dataItems = [];
        this.rules = [];
        this.currentCost = 0;
        this.continuousChargeData = [];
        this.exportInfo = {
            positions: ["", "", "", ""],
            initialSkills: ["", "", ""],
            videoAxisLink: ""
        };
        this.initializationDuration = initialTimeSeconds;
        
        // 生成初始化默认行（使用统一ID计数器，避免字符串ID混入数值ID体系）
        const characters = this.getCharacters();
        this.dataItems.push({
            id: this.getNextDataItemId(),
            characterId: characters.length > 0 ? characters[0].id : 0,
            cost: 0,
            action: '初始化',
            time: initialTimeSeconds,
            timeInterval: 0,
            costDeduction: 0,
            remainingCost: 0
        });
    }

    /**
     * 设置导出信息（站位/初始技能/视频轴链接）
     * @param {{positions: string[], initialSkills: string[], videoAxisLink: string}} info
     */
    setExportInfo(info) {
        this.exportInfo = {
            positions: Array.isArray(info.positions) ? info.positions : ["", "", "", ""],
            initialSkills: Array.isArray(info.initialSkills) ? info.initialSkills : ["", "", ""],
            videoAxisLink: info.videoAxisLink || ""
        };
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

    // 删除单条持续回费设置
    deleteContinuousCharge(index) {
        this.saveState();
        if (Array.isArray(this.continuousChargeData) && index >= 0 && index < this.continuousChargeData.length) {
            return this.continuousChargeData.splice(index, 1)[0];
        }
        return null;
    }
    
    // 设置当前费用
    setCurrentCost(cost) {
        this.currentCost = cost;
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
            nextCharacterId: this.nextCharacterId,
            nextRuleId: this.nextRuleId,
            nextDataItemId: this.nextDataItemId,
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
            nextCharacterId: this.nextCharacterId,
            nextRuleId: this.nextRuleId,
            nextDataItemId: this.nextDataItemId,
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
            nextCharacterId: this.nextCharacterId,
            nextRuleId: this.nextRuleId,
            nextDataItemId: this.nextDataItemId,
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
        this.nextCharacterId = state.nextCharacterId;
        this.nextRuleId = state.nextRuleId;
        this.nextDataItemId = state.nextDataItemId;
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