// 计算管理器模块
class Calculator {
    constructor(dataManager) {
        this.dataManager = dataManager;
        this.timeStep = 0.1;    // 时间步长（秒）
        this.ruleCounters = {}; // 规则计数器，用于跟踪减费效果的生效次数
    }

    // 计算所有角色的总费用恢复
    calculateTotalCostRecovery(timeElapsed) {
        const characters = this.dataManager.getCharacters();
        let totalRecoveryRate = 0;
        
        // 为每个角色计算调整后的回费速度，然后相加得到总回费速度
        characters.forEach(char => {
            // 应用费用效果规则和角色回费属性
            const adjustedRecoveryRate = this.applyChargeIncreaseRules(char.id, char.costRecoveryRate);
            totalRecoveryRate += adjustedRecoveryRate;
        });
        
        // 计算总恢复费用
        const recovery = totalRecoveryRate * timeElapsed;
        return parseFloat(recovery.toFixed(2));
    }

    // 计算技能使用费用
    calculateSkillCost(character, useCount = 1) {
        // 基础费用 + 每使用一次的额外费用 * 使用次数
        const cost = character.skillCost + (character.costIncrease * (useCount - 1));
        return parseFloat(cost.toFixed(2));
    }

    // 计算单个角色的费用恢复
    calculateCostRecovery(character, timeElapsed) {
        // 应用费用效果规则和角色回费属性
        const adjustedRecoveryRate = this.applyChargeIncreaseRules(character.id, character.costRecoveryRate);
        const recovery = adjustedRecoveryRate * timeElapsed;
        return parseFloat(recovery.toFixed(2));
    }

    // 重置规则计数器
    resetRuleCounters() {
        this.ruleCounters = {};
    }
    
    // 应用关联规则费用变化
    applyRuleCostChanges(characterId, baseCost, itemId = null, costReductionRules = null, costChangeRules = null) {
        // 如果传入了预筛选的规则，则使用它们，否则获取所有规则
        const rules = this.dataManager.getRules();
        const reductionRules = costReductionRules || rules.filter(rule => rule.type === 'costReduction');
        const changeRules = costChangeRules || rules.filter(rule => rule.type === 'costChange');
        
        let finalCost = baseCost;
        
        // 先应用所有减费规则
        reductionRules.forEach(rule => {
            // 减费效果：统一检查规则是否作用于当前角色
            const isRuleApplied = Array.isArray(rule.targetCharacterIds) && rule.targetCharacterIds.includes(characterId);
            if (isRuleApplied) {
                // 检查规则计数器，确保生效次数未用完
                const ruleKey = `costReduction_${rule.id}`;
                // 初始化计数器（如果不存在）
                if (!this.ruleCounters[ruleKey]) {
                    this.ruleCounters[ruleKey] = 0;
                }
                
                // 检查当前数据项是否在目标行之后（不包括当前目标行）
            // 只有当当前itemId大于规则的characterId（目标行ID）时，才应用减费效果
            const isAfterTargetRow = !rule.characterId || itemId > rule.characterId;
            
            // 如果生效次数未用完且在目标行之后，应用减费
            if (this.ruleCounters[ruleKey] < rule.effectCount && isAfterTargetRow) {
                    finalCost -= rule.reductionValue;
                    // 增加计数器
                    this.ruleCounters[ruleKey]++;
                }
            }
        });
        
        // 然后应用费用更改规则（如果有）
        changeRules.forEach(rule => {
            // 更改扣除：如果规则的目标行是当前数据项，直接使用规则的changeValue作为最终费用
            if (itemId && rule.characterId === itemId) {
                finalCost = rule.changeValue;
            }
        });
        
        // 确保费用不小于0
        finalCost = Math.max(0, finalCost);
        
        return parseFloat(finalCost.toFixed(2));
    }
    
    // 应用费用效果规则和角色回费属性到单个角色
    applyChargeIncreaseRules(characterId, recoveryRate, currentTime = 0) {
        const rules = this.dataManager.getRules();
        const character = this.dataManager.getCharacterById(characterId);
        let finalRecoveryRate = recoveryRate;
        
        // 1. 应用所有相关的费用效果规则到单个角色
        rules.forEach(rule => {
            // 统一使用targetCharacterIds数组检查规则是否作用于当前角色
            // 确保targetCharacterIds是数组且包含当前角色ID
            const isRuleApplied = Array.isArray(rule.targetCharacterIds) && rule.targetCharacterIds.includes(characterId);
            
            if (isRuleApplied) {
                // 处理不同类型的规则
                switch (rule.type) {
                    case 'chargeIncrease':
                        // 费用效果规则：检查当前时间是否在规则的生效范围内
                        // 结束时间 = 生效时间 - 持续时间，规则在 [activationTime - duration, activationTime] 内生效
                        const isTimeValid = !currentTime || 
                                          (currentTime >= rule.activationTime - rule.duration && 
                                           currentTime <= rule.activationTime);
                        
                        if (isTimeValid) {
                            // 费用效果规则
                            if (rule.effectType === 'increase') {
                                if (rule.chargeType === 'percentage') {
                                    // 百分比增加
                                    finalRecoveryRate *= (1 + rule.chargeValue / 100);
                                } else {
                                    // 固定数值增加
                                    finalRecoveryRate += rule.chargeValue;
                                }
                            } else {
                                if (rule.chargeType === 'percentage') {
                                    // 百分比减少
                                    finalRecoveryRate *= (1 - rule.chargeValue / 100);
                                } else {
                                    // 固定数值减少
                                    finalRecoveryRate -= rule.chargeValue;
                                }
                            }
                        }
                        break;
                    // 持续回费规则不在此处处理，在recalculateAllItems中按时间应用
                    // 其他规则类型不影响回费速度
                }
            }
        });
        
        // 2. 应用全局回费增加属性（所有角色使用相同的回费增加百分比）
        // 查找设置了回费增加的角色（isChargePercentage为true的角色）
        const characters = this.dataManager.getCharacters();
        const chargeIncreaseCharacter = characters.find(char => char.isChargePercentage);
        
        // 如果找到设置了回费增加的角色，应用其百分比到所有角色
        if (chargeIncreaseCharacter && chargeIncreaseCharacter.costIncrease) {
            finalRecoveryRate *= (1 + chargeIncreaseCharacter.costIncrease / 100);
        }
        
        // 确保回费速度不小于0
        finalRecoveryRate = Math.max(0, finalRecoveryRate);
        
        return finalRecoveryRate;
    }

    // 计算单个数据项的费用变化
    calculateItemCost(item, previousCost) {
        const character = this.dataManager.getCharacterById(item.characterId);
        if (!character) {
            // 找不到角色时，返回默认值
            return {
                remainingCost: parseFloat(previousCost.toFixed(2)),
                costDeduction: 0
            };
        }

        // 计算时间间隔
        const timeInterval = parseFloat(item.timeInterval) || 0;
        
        // 计算费用恢复（使用所有角色的总回费速度）
        const recoveredCost = this.calculateTotalCostRecovery(timeInterval);
        let newCost = previousCost + recoveredCost;
        
        // 确保费用不超过总费用上限
        const totalCost = this.dataManager.totalCost;
        newCost = Math.min(newCost, totalCost);
        
        // 计算并扣除费用（无论动作类型）
        let costDeduction = 0;
        // 对于没有costChange规则的数据项，使用角色的技能费用作为基础费用
        // 对于有costChange规则的数据项，会在applyRuleCostChanges中被覆盖
        const baseCost = character.skillCost;
        const finalCost = this.applyRuleCostChanges(item.characterId, baseCost, item.id);
        
        // 确保费用足够
        costDeduction = Math.min(newCost, finalCost);
        
        // 剩余费用 = 当前费用 - 费用扣除
        const remainingCost = parseFloat((newCost - costDeduction).toFixed(2));
        
        return {
            remainingCost: remainingCost,
            costDeduction: parseFloat(costDeduction.toFixed(2))
        };
    }

    // 重新计算所有数据项 - 性能优化版本
    recalculateAllItems() {
        const items = this.dataManager.getAllDataItems();
        const rules = this.dataManager.getRules();
        const characters = this.dataManager.getCharacters();
        const totalCost = this.dataManager.totalCost;
        
        // 重置规则计数器，确保每次重新计算都从初始状态开始
        this.resetRuleCounters();
        
        // 获取初始化时间（如果有的话）
        const initializationTime = this.dataManager.getInitializationTime();
        
        // 移除初始费用设定，费用从0开始
        let currentCost = 0;
        
        // 更新数据管理器中的当前费用为0
        this.dataManager.currentCost = currentCost;
        
        // 不预计算角色回费速度，因为需要根据当前时间动态计算
        // 费用效果规则需要根据具体时间点进行判断，所以在每次需要时重新计算
        
        // 预筛选规则，提高循环效率

        const continuousChargeRules = rules.filter(rule => rule.type === 'continuousCharge');
        const costReductionRules = rules.filter(rule => rule.type === 'costReduction');
        const costChangeRules = rules.filter(rule => rule.type === 'costChange');
        
        // 重新计算每个数据项的费用和时间间隔
        items.forEach((item, index) => {
            const character = this.dataManager.getCharacterById(item.characterId);
            if (!character) return;
            
            // 检查是否为特殊行（动作为"回费"）
            const isSpecialRow = item.action === '回费';
            
            if (index === 0) {
                // 第一个数据项
                // 初始化时间间隔为0
                item.timeInterval = 0;
                // 初始化时间为初始化时间
                item.time = initializationTime;
            } else {
                const previousItem = items[index - 1];
                
                if (isSpecialRow) {
                    // 对于特殊行，时间间隔正常计算（当前时间 - 上一个时间）
                    item.timeInterval = previousItem.time - item.time;
                    // 确保时间间隔不为负数
                    item.timeInterval = Math.max(0, item.timeInterval);
                    
                    // 根据时间反计算触发费用
                    // 计算从上个数据项到当前数据项的费用恢复（动态计算回费速度）
                    const currentRecoveryRate = characters.reduce((sum, char) => {
                        const adjustedRate = this.applyChargeIncreaseRules(char.id, char.costRecoveryRate, previousItem.time);
                        return sum + adjustedRate;
                    }, 0);
                    const recoveredCost = currentRecoveryRate * item.timeInterval;
                    // 触发费用 = 上个数据项的剩余费用 + 恢复的费用
                    item.cost = parseFloat((previousItem.remainingCost + recoveredCost).toFixed(2));
                    // 确保费用不超过总费用上限
                    item.cost = Math.min(item.cost, totalCost);
                } else {
                    // 对于普通行，根据费用计算时间间隔
                    // 计算从上个数据项的剩余费用到当前数据项的触发费用需要多少时间
                    // 所需费用 = 当前触发费用 - 上个数据项的剩余费用
                    const requiredCost = item.cost - previousItem.remainingCost;
                    
                    // 如果所需费用 <= 0，时间间隔为0
                    if (requiredCost <= 0) {
                        item.timeInterval = 0;
                    } else {
                        // 动态计算总回费速度
                        const currentRecoveryRate = characters.reduce((sum, char) => {
                            const adjustedRate = this.applyChargeIncreaseRules(char.id, char.costRecoveryRate, previousItem.time);
                            return sum + adjustedRate;
                        }, 0);
                        item.timeInterval = requiredCost / currentRecoveryRate;
                    }
                    
                    // 确保时间间隔不为负数
                    item.timeInterval = Math.max(0, item.timeInterval);
                    
                    // 当前时间 = 上一个数据项的时间 - 当前时间间隔
                    item.time = previousItem.time - item.timeInterval;
                }
            }
            

            
            // 计算费用变化
            const timeInterval = parseFloat(item.timeInterval) || 0;
            
            // 动态计算总回费速度，考虑当前时间点的费用效果规则
            const currentRecoveryRate = characters.reduce((sum, char) => {
                // 使用当前数据项的时间作为基准
                const adjustedRate = this.applyChargeIncreaseRules(char.id, char.costRecoveryRate, item.time);
                return sum + adjustedRate;
            }, 0);
            const recoveredCost = currentRecoveryRate * timeInterval;
            let newCost = currentCost + recoveredCost;
            
            // 确保费用不超过总费用上限
            newCost = Math.min(newCost, totalCost);
            
            // 计算并扣除费用（无论动作类型）
            let costDeduction = 0;
            
            // 对于特殊行，费用扣除为0，因为是被动技能
            if (isSpecialRow) {
                costDeduction = 0;
            } else {
                // 对于普通行，正常计算费用扣除
                // 对于没有costChange规则的数据项，使用角色的技能费用作为基础费用
                // 对于有costChange规则的数据项，会在applyRuleCostChanges中被覆盖
                const baseCost = character.skillCost;
                // 传入预筛选的规则，避免在方法内部重复筛选
                const finalCost = this.applyRuleCostChanges(item.characterId, baseCost, item.id, costReductionRules, costChangeRules);
                
                // 确保费用足够
                costDeduction = Math.min(newCost, finalCost);
            }
            
            // 剩余费用 = 当前费用 - 费用扣除
            let remainingCost = parseFloat((newCost - costDeduction).toFixed(2));
            
            // 检查是否为瞬卡片的特殊行，如果是，剩余费用加上3.8c
            if (isSpecialRow && character.name === '瞬') {
                remainingCost += 3.8;
                // 确保费用不超过总费用上限
                remainingCost = Math.min(remainingCost, totalCost);
                remainingCost = parseFloat(remainingCost.toFixed(2));
            }
            
            // 直接更新数据项属性
            item.costDeduction = parseFloat(costDeduction.toFixed(2));
            item.remainingCost = remainingCost;
            
            // 更新当前费用
            currentCost = remainingCost;
            
            // 应用持续回费规则
            continuousChargeRules.forEach(rule => {
                // 统一检查规则是否作用于当前角色
                const isRuleApplied = Array.isArray(rule.targetCharacterIds) && rule.targetCharacterIds.includes(character.id);
                if (isRuleApplied) {
                    // 持续回费：在当前数据项之后应用持续回费
                    const recoveredCost = rule.recoveryRate * rule.shakeTime;
                    currentCost += recoveredCost;
                    // 确保费用不超过总费用上限
                    currentCost = Math.min(currentCost, totalCost);
                }
            });
        });
        
        // 更新数据管理器中的当前费用
        this.dataManager.currentCost = currentCost;
        
        return items;
    }

    // 模拟费用随时间的变化
    simulateCostOverTime(duration, characters, initialCost = 0) {
        const results = [];
        let currentCost = initialCost;
        let currentTime = 0;
        
        while (currentTime <= duration) {
            // 计算所有角色的总费用恢复
            const recoveredCost = this.calculateTotalCostRecovery(this.timeStep);
            
            // 更新当前费用
            currentCost += recoveredCost;
            currentCost = Math.min(currentCost, this.dataManager.totalCost);
            
            // 记录结果
            results.push({
                time: parseFloat(currentTime.toFixed(2)),
                cost: parseFloat(currentCost.toFixed(2))
            });
            
            // 增加时间
            currentTime += this.timeStep;
        }
        
        return results;
    }

    // 计算最优技能释放顺序
    calculateOptimalSkillOrder(characters, duration) {
        // 简单的贪心算法：优先释放费用最低的技能
        const skillCosts = characters.map(character => ({
            characterId: character.id,
            cost: character.skillCost
        }));
        
        // 按费用从低到高排序
        skillCosts.sort((a, b) => a.cost - b.cost);
        
        // 模拟技能释放
        const result = [];
        let currentCost = 0;
        let currentTime = 0;
        let useCounts = {};
        
        while (currentTime <= duration) {
            // 计算费用恢复
            const totalRecovery = this.calculateTotalCostRecovery(this.timeStep);
            currentCost += totalRecovery;
            currentCost = Math.min(currentCost, this.dataManager.totalCost);
            
            // 尝试释放技能
            for (const skillInfo of skillCosts) {
                const character = characters.find(c => c.id === skillInfo.characterId);
                if (!character) continue;
                
                // 计算当前使用次数
                useCounts[skillInfo.characterId] = (useCounts[skillInfo.characterId] || 0) + 1;
                
                // 计算技能费用
                const skillCost = this.calculateSkillCost(character, useCounts[skillInfo.characterId]);
                const finalCost = this.applyRuleCostChanges(skillInfo.characterId, skillCost);
                
                // 如果费用足够，释放技能
                if (currentCost >= finalCost) {
                    result.push({
                        time: parseFloat(currentTime.toFixed(2)),
                        characterId: skillInfo.characterId,
                        characterName: character.name,
                        action: '使用技能',
                        costBefore: parseFloat(currentCost.toFixed(2)),
                        costUsed: parseFloat(finalCost.toFixed(2)),
                        costAfter: parseFloat((currentCost - finalCost).toFixed(2))
                    });
                    
                    currentCost -= finalCost;
                    break;
                }
            }
            
            currentTime += this.timeStep;
        }
        
        return result;
    }

    // 验证费用是否足够执行操作
    canPerformAction(character, action, currentCost) {
        if (action !== '技能') return true;
        
        const skillCost = this.calculateSkillCost(character);
        const finalCost = this.applyRuleCostChanges(character.id, skillCost);
        
        return currentCost >= finalCost;
    }

    // 计算费用效率（每秒恢复的费用）
    calculateCostEfficiency(character) {
        // 应用费用效果规则和角色回费属性
        const adjustedRecoveryRate = this.applyChargeIncreaseRules(character.id, character.costRecoveryRate);
        return parseFloat(adjustedRecoveryRate.toFixed(2));
    }

    // 计算总费用效率（所有角色）
    calculateTotalCostEfficiency(characters) {
        // 计算每个角色的调整后回费速度，然后相加得到总回费速度
        let totalEfficiency = 0;
        characters.forEach(character => {
            // 应用费用效果规则和角色回费属性
            const adjustedRecoveryRate = this.applyChargeIncreaseRules(character.id, character.costRecoveryRate);
            totalEfficiency += adjustedRecoveryRate;
        });
        return parseFloat(totalEfficiency.toFixed(2));
    }
}

// 导出Calculator类作为默认导出
export default Calculator;