// 数据管理器模块
class DataManager {
    constructor() {
        this.characters = [];    // 角色列表
        this.rules = [];         // 关联规则列表
        this.dataItems = [];     // 数据项列表
        this.currentCost = 0;    // 当前费用
        this.totalCost = 10;     // 总费用上限
        this.nextId = 1;         // 用于生成唯一ID的计数器
        this.hideSpecialRows = false; // 是否隐藏特殊行
        this.continuousChargeData = null; // 持续回费设置
        
        // 分页相关状态
        this.currentPage = 1;    // 当前页码
        this.pageSize = 10;      // 每页显示行数
        
        // 预设角色数据
        this.presetCharacters = [
            {
                name: '阿露',
                costRecoveryRate: 2.5,
                skillCost: 10.0,
                costIncrease: 0.0,
                isChargePercentage: false
            },
            {
                name: '若藻',
                costRecoveryRate: 1.5,
                skillCost: 5.0,
                costIncrease: 0.0,
                isChargePercentage: false
            },
            {
                name: '遥香',
                costRecoveryRate: 1.2,
                skillCost: 4.0,
                costIncrease: 0.0,
                isChargePercentage: false
            },
            {
                name: '日奈',
                costRecoveryRate: 1.0,
                skillCost: 3.0,
                costIncrease: 0.0,
                isChargePercentage: false
            },
            {
                name: '静子',
                costRecoveryRate: 2.0,
                skillCost: 8.0,
                costIncrease: 0.0,
                isChargePercentage: false
            },
            {
                name: '真白',
                costRecoveryRate: 1.8,
                skillCost: 7.0,
                costIncrease: 0.0,
                isChargePercentage: false
            }
        ];
    }

    // 获取唯一ID
    getNextId() {
        return this.nextId++;
    }

    // 添加角色
    addCharacter(characterData) {
        // 检查角色名称是否重复
        const nameExists = this.characters.some(character => 
            character.name.toLowerCase() === characterData.name.toLowerCase()
        );
        if (nameExists) {
            throw new Error('角色名称已存在');
        }

        const newCharacter = {
            id: this.getNextId(),
            name: characterData.name || '新角色',
            costRecoveryRate: parseFloat(characterData.costRecoveryRate) || 0,
            skillCost: parseFloat(characterData.skillCost) || 0,
            costIncrease: parseFloat(characterData.costIncrease) || 0,
            isChargePercentage: characterData.isChargePercentage || false,
            createdAt: new Date().toISOString()
        };
        this.characters.push(newCharacter);
        return newCharacter;
    }

    // 更新角色
    updateCharacter(id, characterData) {
        const index = this.characters.findIndex(character => character.id === id);
        if (index !== -1) {
            // 检查角色名称是否重复（排除当前角色）
            if (characterData.name) {
                const nameExists = this.characters.some(character => 
                    character.id !== id && character.name.toLowerCase() === characterData.name.toLowerCase()
                );
                if (nameExists) {
                    throw new Error('角色名称已存在');
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

    // 删除角色
    deleteCharacter(id) {
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

    // 获取角色列表
    getCharacters() {
        return [...this.characters];
    }

    // 根据ID获取角色
    getCharacterById(id) {
        return this.characters.find(character => character.id === id) || null;
    }

    // 添加关联规则
    addRule(ruleData) {
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

    // 根据角色ID获取关联规则
    getRulesByCharacterId(characterId) {
        return this.rules.filter(rule => rule.characterId === characterId);
    }

    // 根据ID获取关联规则
    getRuleById(id) {
        return this.rules.find(rule => rule.id === id);
    }

    // 添加数据项
    addDataItem(itemData) {
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
            createdAt: new Date().toISOString()
        };
        
        this.dataItems.push(newItem);
        return newItem;
    }

    // 更新数据项
    updateDataItem(id, itemData) {
        const index = this.dataItems.findIndex(item => item.id === id);
        if (index !== -1) {
            this.dataItems[index] = {
                ...this.dataItems[index],
                ...itemData,
                updatedAt: new Date().toISOString()
            };
            return this.dataItems[index];
        }
        return null;
    }

    // 删除数据项
    deleteDataItem(id) {
        const index = this.dataItems.findIndex(item => item.id === id);
        if (index !== -1) {
            // 删除关联的规则
            this.rules = this.rules.filter(rule => rule.characterId !== id);
            return this.dataItems.splice(index, 1)[0];
        }
        return null;
    }

    // 批量删除数据项
    deleteDataItems(ids) {
        // 删除关联的规则
        this.rules = this.rules.filter(rule => !ids.includes(rule.characterId));
        // 删除数据项
        this.dataItems = this.dataItems.filter(item => !ids.includes(item.id));
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
        
        const startIndex = (this.currentPage - 1) * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        
        return items.slice(startIndex, endIndex);
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
        this.characters = [];
        this.rules = [];
        this.dataItems = [];
        this.currentCost = 0;
        this.nextId = 1;
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
                this.characters = parsedData.characters || [];
                this.rules = parsedData.rules || [];
                this.dataItems = parsedData.dataItems || [];
                this.currentCost = parsedData.currentCost || 0;
                this.totalCost = parsedData.totalCost || 10;
                this.nextId = parsedData.nextId || 1;
                this.initializationDuration = parsedData.initializationDuration || 0;
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
            exportedAt: new Date().toISOString(),
            version: '1.0.0'
        };
    }

    // 导入数据
    importData(data) {
        try {
            if (data.characters) this.characters = data.characters;
            if (data.rules) this.rules = data.rules;
            if (data.dataItems) this.dataItems = data.dataItems;
            if (data.currentCost) this.currentCost = data.currentCost;
            if (data.totalCost) this.totalCost = data.totalCost;
            if (data.nextId) this.nextId = data.nextId;
            if (data.initializationDuration !== undefined) this.initializationDuration = data.initializationDuration;
            return true;
        } catch (error) {
            console.error('导入数据失败:', error);
            return false;
        }
    }
    
    // 获取预设角色列表
    getPresetCharacters() {
        return [...this.presetCharacters];
    }
    
    // 检查角色是否已添加
    isCharacterAdded(characterName) {
        return this.characters.some(character => character.name === characterName);
    }
    
    // 清空所有角色
    clearAllCharacters() {
        this.characters = [];
        this.rules = [];
        this.nextId = 1;
    }

    // 清空数据项列表
    clearDataItems() {
        this.dataItems = [];
        this.currentCost = 0;
    }

    // 设置初始化时间（可选功能）
    setInitializationTime(duration) {
        this.initializationDuration = duration;
    }

    // 获取初始化时间
    getInitializationTime() {
        return this.initializationDuration || 0;
    }
}

// 导出DataManager类作为默认导出
export default DataManager;