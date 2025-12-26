// 计算管理器模块
class Calculator {
    constructor(dataManager) {
        this.dataManager = dataManager;
        this.timeStep = 0.1;    // 时间步长（秒）
        this.ruleCounters = {}; // 规则计数器，用于跟踪减费效果的生效次数
    }

    // 计算总回费速度（考虑所有学生和持续回费功能）
    calculateTotalRecoveryRate(currentTime = 0, resetCounters = false) {
        // 如果需要重置规则计数器（例如在编辑表单计算时）
        if (resetCounters) {
            this.resetRuleCounters();
        }
        
        const characters = this.dataManager.getCharacters();
        let totalRecoveryRate = 0;
        
        // 为每个学生计算调整后的回费速度，然后相加得到总回费速度
        characters.forEach(char => {
            // 应用费用效果规则和学生回费属性
            // 持续回费已经在applyChargeIncreaseRules方法中处理
            const adjustedRecoveryRate = this.applyChargeIncreaseRules(char.id, char.costRecoveryRate, currentTime);
            totalRecoveryRate += adjustedRecoveryRate;
        });
        
        return totalRecoveryRate;
    }
    
    // 计算所有学生的总费用恢复
    calculateTotalCostRecovery(timeElapsed, currentTime = 0) {
        // 使用细粒度时间步长，每0.001秒计算一次（毫秒级精度）
        const timeStep = 0.001;
        let totalRecovery = 0;
        let remainingTime = timeElapsed;
        let currentSimulationTime = currentTime;
        
        // 细粒度计算，每0.001秒计算一次
        while (remainingTime > 0) {
            // 计算当前时间步长的实际时长（最后一步可能小于timeStep）
            const currentStepTime = Math.min(timeStep, remainingTime);
            
            // 获取当前时间点的回费速度
            const currentRecoveryRate = this.calculateTotalRecoveryRate(currentSimulationTime);
            
            // 计算当前时间步长内恢复的费用
            totalRecovery += currentRecoveryRate * currentStepTime;
            
            // 更新剩余时间和当前模拟时间
            remainingTime -= currentStepTime;
            currentSimulationTime -= currentStepTime;
        }
        
        return parseFloat(totalRecovery.toFixed(3));
    }

    // 计算技能使用费用
    calculateSkillCost(character, useCount = 1) {
        // 基础费用 + 每使用一次的额外费用 * 使用次数
        const cost = character.skillCost + (character.costIncrease * (useCount - 1));
        return parseFloat(cost.toFixed(2));
    }

    // 计算单个学生的费用恢复
    calculateCostRecovery(character, timeElapsed, currentTime = 0) {
        // 应用费用效果规则和学生回费属性
        const adjustedRecoveryRate = this.applyChargeIncreaseRules(character.id, character.costRecoveryRate, currentTime);
        const recovery = adjustedRecoveryRate * timeElapsed;
        return parseFloat(recovery.toFixed(2));
    }

    // 重置规则计数器
    resetRuleCounters() {
        this.ruleCounters = {};
    }
    
    // 应用关联规则费用变化
    applyRuleCostChanges(characterId, baseCost, itemId = null, costReductionRules = null, costChangeRules = null, useCount = 1, isPreAddValidation = false) {
        // 如果传入了预筛选的规则，则使用它们，否则获取所有规则
        const rules = this.dataManager.getRules();
        const reductionRules = costReductionRules || rules.filter(rule => rule.type === 'costReduction');
        const changeRules = costChangeRules || rules.filter(rule => rule.type === 'costChange');
        
        let finalCost = baseCost;
        let reductionValue = 0;
        let matchedRule = null;
        
        // 应用水白的第一次使用减费效果（基于特殊行）
        const character = this.dataManager.getCharacterById(characterId);
        const hasSuibai = this.dataManager.getCharacters().some(char => char.name === '水白');
        // 检查是否有水白的特殊行
        const hasSuibaiSpecialRow = this.dataManager.getAllDataItems().some(item => 
            item.action === '减费' && this.dataManager.getCharacterById(item.characterId)?.name === '水白'
        );
        if (hasSuibai && hasSuibaiSpecialRow && character && character.name !== '水白' && useCount === 1) {
            const suibaiReductionKey = `suibai_reduction_${characterId}`;
            if (!this.ruleCounters[suibaiReductionKey]) {
                reductionValue = 1; // 水白的减费值
            }
        }
        
        // 找到最后一个匹配的减费规则（后添加的规则优先级更高）
        for (let i = reductionRules.length - 1; i >= 0; i--) {
            const rule = reductionRules[i];
            // 减费效果：统一检查规则是否作用于当前学生
            const isRuleApplied = Array.isArray(rule.targetCharacterIds) && rule.targetCharacterIds.includes(characterId);
            if (isRuleApplied) {
                // 检查当前数据项是否在目标行之后（不包括当前目标行）
                // 如果是预添加验证，则不检查itemId条件，直接应用减费规则
                const isAfterTargetRow = isPreAddValidation || !rule.characterId || itemId > rule.characterId;
                if (isAfterTargetRow) {
                    matchedRule = rule;
                    break; // 找到最后一个匹配的规则，跳出循环
                }
            }
        }
        
        // 如果找到匹配的规则，应用该规则的减费值
        if (matchedRule) {
            // 检查规则计数器，确保生效次数未用完
            const ruleKey = `costReduction_${matchedRule.id}`;
            // 初始化计数器（如果不存在）
            if (!this.ruleCounters[ruleKey]) {
                this.ruleCounters[ruleKey] = 0;
            }
            
            // 如果生效次数未用完，应用减费
            if (this.ruleCounters[ruleKey] < matchedRule.effectCount) {
                reductionValue = matchedRule.reductionValue; // 应用最后一个匹配规则的减费值
                // 增加计数器
                this.ruleCounters[ruleKey]++;
            }
        }
        
        // 应用最终的减费值
        finalCost -= reductionValue;
        
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
    
    // 应用费用效果规则和学生回费属性到单个学生
    applyChargeIncreaseRules(characterId, recoveryRate, currentTime = 0) {
        const rules = this.dataManager.getRules();
        const character = this.dataManager.getCharacterById(characterId);
        
        // 1. 先获取全局回费增加属性（所有学生使用相同的回费增加百分比）
        // 查找设置了回费增加的学生（isChargePercentage为true的学生）
        const characters = this.dataManager.getCharacters();
        const chargeIncreaseCharacter = characters.find(char => char.isChargePercentage);
        let totalPercentageIncrease = chargeIncreaseCharacter && chargeIncreaseCharacter.costIncrease ? chargeIncreaseCharacter.costIncrease : 0;
        
        // 2. 收集所有适用的费用效果规则
        let fixedChargeModifications = 0;
        
        // 3. 处理费用效果规则
        // 首先筛选出所有匹配的费用效果规则
        const chargeIncreaseRules = rules.filter(rule => {
            return rule.type === 'chargeIncrease' && 
                   Array.isArray(rule.targetCharacterIds) && 
                   rule.targetCharacterIds.includes(characterId);
        });
        
        // 将currentTime转换为秒数（如果是字符串格式）
        let currentTimeInSeconds = currentTime;
        if (typeof currentTime === 'string') {
            const [currMinutes, currSeconds] = currentTime.split(':');
            currentTimeInSeconds = parseInt(currMinutes) * 60 + parseFloat(currSeconds);
        }
        
        // 筛选出时间范围内的规则
        const activeRules = chargeIncreaseRules.filter(rule => {
            return !currentTime || 
                   (currentTimeInSeconds >= rule.activationTime - rule.duration && 
                    currentTimeInSeconds < rule.activationTime);
        });
        
        // 按生效时间排序，最新的规则优先级更高
        activeRules.sort((a, b) => b.activationTime - a.activationTime);
        
        // 分类处理规则，同种规则只使用最新的一个
        // 定义：同种规则 = 相同效果类型 + 相同费用类型
        const ruleGroups = {
            'increase_percentage': null,  // 增加-百分比
            'increase_fixed': null,       // 增加-固定数值
            'decrease_percentage': null,  // 减少-百分比
            'decrease_fixed': null        // 减少-固定数值
        };
        
        // 遍历所有活动规则，按类型分组，只保留最新的规则
        activeRules.forEach(rule => {
            const key = `${rule.effectType}_${rule.chargeType}`;
            // 只保留最新的规则
            if (!ruleGroups[key]) {
                ruleGroups[key] = rule;
            }
        });
        
        // 应用规则效果
        for (const [key, rule] of Object.entries(ruleGroups)) {
            if (!rule) continue;
            
            if (rule.effectType === 'increase') {
                if (rule.chargeType === 'percentage') {
                    // 百分比增加 - 累加到总百分比中
                    totalPercentageIncrease += rule.chargeValue;
                } else {
                    // 固定数值增加 - 先累加
                    fixedChargeModifications += rule.chargeValue;
                }
            } else {
                if (rule.chargeType === 'percentage') {
                    // 百分比减少 - 从总百分比中减去
                    totalPercentageIncrease -= rule.chargeValue;
                } else {
                    // 固定数值减少 - 先累加
                    fixedChargeModifications -= rule.chargeValue;
                }
            }
        }
        
        // 4. 处理持续回费功能
        const continuousChargeSettings = this.dataManager.continuousChargeData;
        let continuousChargeIncrease = 0;
        
        // 遍历所有持续回费设置
        if (Array.isArray(continuousChargeSettings)) {
            // 筛选出当前学生的持续回费设置
            const characterContinuousCharges = continuousChargeSettings.filter(continuousChargeData => {
                const targetItem = this.dataManager.dataItems.find(item => item.id == continuousChargeData.targetRowId);
                return targetItem && targetItem.characterId == characterId;
            });
            
            // 按目标行时间降序排序（最新的效果优先）
            characterContinuousCharges.sort((a, b) => {
                const targetItemA = this.dataManager.dataItems.find(item => item.id == a.targetRowId);
                const targetItemB = this.dataManager.dataItems.find(item => item.id == b.targetRowId);
                return targetItemB.time - targetItemA.time;
            });
            
            // 查找第一个匹配时间范围的效果
            for (const continuousChargeData of characterContinuousCharges) {
                const { targetRowId, delayTime, duration, recoveryIncrease } = continuousChargeData;
                
                // 获取目标数据项
                const targetItem = this.dataManager.dataItems.find(item => item.id == targetRowId);
                if (targetItem) {
                    // 目标行时间已经是秒数（数字类型）
                    const targetTimeSeconds = targetItem.time;
                    
                    // 计算开始生效时间：目标行时间（秒） - 延迟时间
                    const startTime = targetTimeSeconds - delayTime;
                    // 计算结束生效时间：开始生效时间 - 持续时间
                    const endTime = startTime - duration;
                    
                    // 将currentTime转换为秒数（如果是字符串格式）
                    let currentTimeInSeconds = currentTime;
                    if (typeof currentTime === 'string') {
                        const [currMinutes, currSeconds] = currentTime.split(':');
                        currentTimeInSeconds = parseInt(currMinutes) * 60 + parseFloat(currSeconds);
                    }
                    
                    // 检查当前时间是否在生效范围内
                    // 注意：不包括startTime本身，避免影响目标行的费用计算
                    if (currentTimeInSeconds >= endTime && currentTimeInSeconds < startTime) {
                        // 当前学生是持续回费的目标学生，使用第一个匹配的效果（最新的）
                        continuousChargeIncrease = recoveryIncrease;
                        break; // 找到第一个匹配的效果，跳出循环
                    }
                }
            }
        }
        
        // 5. 计算总百分比增加系数
        const totalChargeIncrease = 1 + totalPercentageIncrease / 100;
        
        // 6. 应用总百分比增加到基础回费速度
        let finalRecoveryRate = recoveryRate * totalChargeIncrease;
        
        // 7. 应用固定数值修改和持续回费，受到总百分比增加影响
        finalRecoveryRate += (fixedChargeModifications + continuousChargeIncrease) * totalChargeIncrease;
        
        // 8. 确保回费速度不小于0
        finalRecoveryRate = Math.max(0, finalRecoveryRate);
        
        return finalRecoveryRate;
    }

    // 计算单个数据项的费用变化
    calculateItemCost(item, previousCost) {
        const character = this.dataManager.getCharacterById(item.characterId);
        if (!character) {
            // 找不到学生时，返回默认值
            return {
                remainingCost: parseFloat(previousCost.toFixed(3)),
                costDeduction: 0
            };
        }

        // 计算时间间隔
        const timeInterval = parseFloat(item.timeInterval) || 0;
        
        // 当前时间 = 数据项的时间
        const currentTime = parseFloat(item.time) || 0;
        
        // 计算费用恢复（使用所有学生的总回费速度）
        const recoveredCost = this.calculateTotalCostRecovery(timeInterval, currentTime);
        let newCost = previousCost + recoveredCost;
        
        // 确保费用不超过总费用上限
        const totalCost = this.dataManager.totalCost;
        newCost = Math.min(newCost, totalCost);
        
        // 计算并扣除费用（无论动作类型）
        let costDeduction = 0;
        // 对于没有costChange规则的数据项，使用学生的技能费用作为基础费用
        // 对于有costChange规则的数据项，会在applyRuleCostChanges中被覆盖
        const baseCost = character.skillCost;
        
        // 跟踪学生的技能使用次数
        const useCountKey = `useCount_${item.characterId}`;
        if (!this.ruleCounters[useCountKey]) {
            this.ruleCounters[useCountKey] = 0;
        }
        this.ruleCounters[useCountKey]++;
        const useCount = this.ruleCounters[useCountKey];
        
        // 传递使用次数给applyRuleCostChanges
        const finalCost = this.applyRuleCostChanges(item.characterId, baseCost, item.id, null, null, useCount);
        
        // 确保费用足够
        costDeduction = Math.min(newCost, finalCost);
        
        // 剩余费用 = 当前费用 - 费用扣除
        const remainingCost = parseFloat((newCost - costDeduction).toFixed(3));
        
        return {
            remainingCost: remainingCost,
            costDeduction: parseFloat(costDeduction.toFixed(3))
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
        this.dataManager.setCurrentCost(currentCost);
        
        // 不预计算学生回费速度，因为需要根据当前时间动态计算
        // 费用效果规则需要根据具体时间点进行判断，所以在每次需要时重新计算
        
        // 预筛选规则，提高循环效率

        const costReductionRules = rules.filter(rule => rule.type === 'costReduction');
        const costChangeRules = rules.filter(rule => rule.type === 'costChange');
        
        // 跟踪每个学生的技能使用次数
        const useCounts = {};
        
        // 重新计算每个数据项的费用和时间间隔
        items.forEach((item, index) => {
            const character = this.dataManager.getCharacterById(item.characterId);
            if (!character) return;
            
            // 检查是否为特殊行（动作为"回费"或"减费"）
            const isSpecialRow = item.action === '回费' || item.action === '减费';
            
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
                    const currentRecoveryRate = this.calculateTotalRecoveryRate(previousItem.time);
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
                        // 使用细粒度时间步长模拟，适应各种回费速度变化
                        const timeStep = 0.001; // 0.001秒为步长（毫秒级精度）
                        let elapsedTime = 0;
                        let recoveredCost = 0;
                        let currentSimulationTime = previousItem.time;
                        
                        // 模拟费用恢复过程，直到达到所需费用
                        while (recoveredCost < requiredCost) {
                            // 获取当前时间点的回费速度
                            const currentRecoveryRate = this.calculateTotalRecoveryRate(currentSimulationTime);
                            
                            // 计算当前时间步长内恢复的费用
                            const stepRecovery = currentRecoveryRate * timeStep;
                            
                            // 检查是否会超出所需费用
                            if (recoveredCost + stepRecovery >= requiredCost) {
                                // 计算刚好达到所需费用的时间
                                const exactTime = (requiredCost - recoveredCost) / currentRecoveryRate;
                                elapsedTime += exactTime;
                                recoveredCost = requiredCost;
                            } else {
                                // 累加恢复的费用和时间
                                recoveredCost += stepRecovery;
                                elapsedTime += timeStep;
                                // 更新模拟时间
                                currentSimulationTime -= timeStep;
                            }
                        }
                        
                        // 设置时间间隔，保留3位小数（毫秒级精度）
                        item.timeInterval = parseFloat(elapsedTime.toFixed(3));
                    }
                    
                    // 确保时间间隔不为负数
                    item.timeInterval = Math.max(0, item.timeInterval);
                    
                    // 当前时间 = 上一个数据项的时间 - 当前时间间隔
                    // 保留3位小数（毫秒级精度）
                    item.time = parseFloat((previousItem.time - item.timeInterval).toFixed(3));
                }
            }
            

            
            // 计算费用变化
            const timeInterval = parseFloat(item.timeInterval) || 0;
            
            // 计算并扣除费用（无论动作类型）
            let costDeduction = 0;
            
            // 对于特殊行，费用扣除为0，因为是被动技能
            if (isSpecialRow) {
                costDeduction = 0;
            } else {
                // 对于普通行，正常计算费用扣除
                // 对于没有costChange规则的数据项，使用学生的技能费用作为基础费用
                // 对于有costChange规则的数据项，会在applyRuleCostChanges中被覆盖
                const baseCost = character.skillCost;
                
                // 跟踪学生的技能使用次数
                if (!useCounts[item.characterId]) {
                    useCounts[item.characterId] = 0;
                }
                useCounts[item.characterId]++;
                const useCount = useCounts[item.characterId];
                
                // 传入预筛选的规则，避免在方法内部重复筛选，并传递使用次数
                const finalCost = this.applyRuleCostChanges(item.characterId, baseCost, item.id, costReductionRules, costChangeRules, useCount);
                
                // 使用触发费用作为可用费用
                costDeduction = Math.min(item.cost, finalCost);
            }
            
            // 简化的剩余费用公式：剩余费用 = 触发费用 - 费用扣除
            let remainingCost = parseFloat((item.cost - costDeduction).toFixed(2));
            
            // 确保费用不小于0
            remainingCost = Math.max(0, remainingCost);
            
            // 确保费用不超过总费用上限
            remainingCost = Math.min(remainingCost, totalCost);
            
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
        });
        
        // 更新数据管理器中的当前费用
        this.dataManager.setCurrentCost(currentCost);
        
        return items;
    }

    // 模拟费用随时间的变化
    simulateCostOverTime(duration, characters, initialCost = 0) {
        const results = [];
        let currentCost = initialCost;
        let currentTime = 0;
        
        // 使用毫秒级时间步长
        const timeStep = 0.001;
        
        while (currentTime <= duration) {
            // 计算所有学生的总费用恢复
            const recoveredCost = this.calculateTotalCostRecovery(timeStep, currentTime);
            
            // 更新当前费用
            currentCost += recoveredCost;
            currentCost = Math.min(currentCost, this.dataManager.totalCost);
            
            // 记录结果，使用3位小数精度
            results.push({
                time: parseFloat(currentTime.toFixed(3)),
                cost: parseFloat(currentCost.toFixed(3))
            });
            
            // 增加时间
            currentTime += timeStep;
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
        
        // 使用毫秒级时间步长
        const timeStep = 0.001;
        
        while (currentTime <= duration) {
            // 计算费用恢复，使用毫秒级时间步长
            const totalRecovery = this.calculateTotalCostRecovery(timeStep, currentTime);
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
                const finalCost = this.applyRuleCostChanges(skillInfo.characterId, skillCost, null, null, null, useCounts[skillInfo.characterId]);
                
                // 如果费用足够，释放技能
                if (currentCost >= finalCost) {
                    result.push({
                        time: parseFloat(currentTime.toFixed(3)), // 使用3位小数精度
                        characterId: skillInfo.characterId,
                        characterName: character.name,
                        action: '使用技能',
                        costBefore: parseFloat(currentCost.toFixed(3)), // 使用3位小数精度
                        costUsed: parseFloat(finalCost.toFixed(3)), // 使用3位小数精度
                        costAfter: parseFloat((currentCost - finalCost).toFixed(3)) // 使用3位小数精度
                    });
                    
                    currentCost -= finalCost;
                    break;
                }
            }
            
            // 增加时间，使用毫秒级时间步长
            currentTime += timeStep;
        }
        
        return result;
    }

    // 验证费用是否足够执行操作
    canPerformAction(character, action, currentCost) {
        if (action !== '技能') return true;
        
        // 预测下一次使用次数
        const useCountKey = `useCount_${character.id}`;
        const currentUseCount = this.ruleCounters[useCountKey] || 0;
        const nextUseCount = currentUseCount + 1;
        
        const skillCost = this.calculateSkillCost(character, nextUseCount);
        const finalCost = this.applyRuleCostChanges(character.id, skillCost, null, null, null, nextUseCount);
        
        return currentCost >= finalCost;
    }

    // 计算费用效率（每秒恢复的费用）
    calculateCostEfficiency(character) {
        // 应用费用效果规则和学生回费属性
        const adjustedRecoveryRate = this.applyChargeIncreaseRules(character.id, character.costRecoveryRate);
        return parseFloat(adjustedRecoveryRate.toFixed(2));
    }

    // 计算总费用效率（所有学生）
    calculateTotalCostEfficiency(characters) {
        // 计算每个学生的调整后回费速度，然后相加得到总回费速度
        let totalEfficiency = 0;
        characters.forEach(character => {
            // 应用费用效果规则和学生回费属性
            const adjustedRecoveryRate = this.applyChargeIncreaseRules(character.id, character.costRecoveryRate);
            totalEfficiency += adjustedRecoveryRate;
        });
        return parseFloat(totalEfficiency.toFixed(2));
    }
}

// 导出Calculator类作为默认导出
export default Calculator;