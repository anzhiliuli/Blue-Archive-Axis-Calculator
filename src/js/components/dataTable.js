// 数据表格组件 - 负责显示和管理各种数据表格

class DataTable {
    constructor(tableId, columns, options = {}) {
        this.tableId = tableId;
        this.columns = columns;
        this.options = { ...this.defaultOptions, ...options };
        this.data = [];
        this.filteredData = [];
        
        this.init();
    }

    // 默认配置
    get defaultOptions() {
        return {
            showActions: true,
            showFilter: false,
            showPagination: false,
            sortable: true,
            searchable: true
        };
    }

    /**
     * 初始化表格组件
     */
    init() {
        this.tableElement = document.getElementById(this.tableId);
        if (!this.tableElement) {
            console.error(`表格元素 ${this.tableId} 不存在`);
            return;
        }

        this.setupTable();
        this.bindEvents();
    }

    /**
     * 设置表格结构
     */
    setupTable() {
        // 清空表格
        this.tableElement.innerHTML = '';

        // 创建表头
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');

        this.columns.forEach(column => {
            const th = document.createElement('th');
            th.innerHTML = column.title;
            th.dataset.field = column.field;
            
            if (column.sortable !== false) {
                th.classList.add('sortable');
                // 去掉排序图标
            }

            headerRow.appendChild(th);
        });

        // 添加操作列
        if (this.options.showActions) {
            const th = document.createElement('th');
            th.textContent = '操作';
            th.className = 'action-column';
            th.style.textAlign = 'center'; // 操作列表头居中
            headerRow.appendChild(th);
        }

        thead.appendChild(headerRow);
        this.tableElement.appendChild(thead);

        // 创建表体
        this.tbody = document.createElement('tbody');
        this.tableElement.appendChild(this.tbody);
    }

    /**
     * 绑定表格事件
     */
    bindEvents() {
        // 表头排序事件
        if (this.options.sortable) {
            this.tableElement.querySelectorAll('th.sortable').forEach(th => {
                th.addEventListener('click', () => {
                    this.sortBy(th.dataset.field);
                });
            });
        }
        
        // 右键菜单事件
        this.bindContextMenuEvents();
    }
    
    /**
     * 绑定右键菜单事件
     */
    bindContextMenuEvents() {
        // 获取右键菜单元素
        this.contextMenu = document.getElementById('tableContextMenu');
        if (!this.contextMenu) return;
        
        // 确保tbody元素存在
        if (!this.tbody) return;
        
        // 移除之前的事件监听器，避免重复绑定
        this.tbody.removeEventListener('contextmenu', this.handleContextMenu);
        
        // 保存上下文菜单事件处理函数
        this.handleContextMenu = (e) => {
            e.preventDefault();
            
            // 检查点击的是否是数据行
            const row = e.target.closest('.data-row');
            if (row) {
                const itemId = row.dataset.id;
                const item = this.data.find(d => d.id == itemId);
                if (item) {
                    // 显示右键菜单
                    this.showContextMenu(e.clientX, e.clientY, item, row);
                }
            }
        };
        
        // 为表格绑定右键点击事件
        this.tbody.addEventListener('contextmenu', this.handleContextMenu);
        
        // 点击页面其他地方关闭右键菜单
        if (!this.contextMenuClickHandler) {
            this.contextMenuClickHandler = (e) => {
                if (this.contextMenu && !this.contextMenu.contains(e.target) && !this.tbody.contains(e.target)) {
                    this.hideContextMenu();
                }
            };
            document.addEventListener('click', this.contextMenuClickHandler);
        }
        
        // 为菜单项绑定点击事件
        if (!this.menuItemClickHandler) {
            this.menuItemClickHandler = (e) => {
                const menuItem = e.target.closest('.context-menu-item');
                if (menuItem) {
                    const action = menuItem.dataset.action;
                    this.handleContextMenuAction(action);
                }
            };
            this.contextMenu.addEventListener('click', this.menuItemClickHandler);
        }
    }
    
    /**
     * 显示右键菜单
     */
    showContextMenu(x, y, item, row) {
        if (!this.contextMenu) return;
        
        // 保存当前选中的项
        this.selectedItem = item;
        this.selectedRow = row;
        
        // 设置菜单位置
        this.contextMenu.style.left = `${x}px`;
        this.contextMenu.style.top = `${y}px`;
        
        // 显示菜单
        this.contextMenu.classList.remove('hidden');
        
        // 根据行类型调整菜单项
        this.updateContextMenuItems();
    }
    
    /**
     * 隐藏右键菜单
     */
    hideContextMenu() {
        if (this.contextMenu) {
            this.contextMenu.classList.add('hidden');
            this.selectedItem = null;
            this.selectedRow = null;
        }
    }
    
    /**
     * 更新右键菜单项
     */
    updateContextMenuItems() {
        if (!this.contextMenu || !this.selectedItem) return;
        
        const editItem = this.contextMenu.querySelector('[data-action="edit"]');
        const deleteItem = this.contextMenu.querySelector('[data-action="delete"]');
        const viewAdditionalDataItem = this.contextMenu.querySelector('[data-action="viewAdditionalData"]');
        
        // 对于特殊行（回费或减费类型），只显示删除按钮，隐藏编辑按钮
        if (this.selectedItem.action === '回费' || this.selectedItem.action === '减费') {
            editItem.classList.add('hidden');
            deleteItem.classList.remove('hidden');
        } else if (this.selectedItem.action === '初始化') {
            // 初始化行不显示任何操作按钮
            editItem.classList.add('hidden');
            deleteItem.classList.add('hidden');
        } else {
            // 普通行显示所有按钮
            editItem.classList.remove('hidden');
            deleteItem.classList.remove('hidden');
        }
        
        // 只有当行有附加数据时，才显示"查看附加数据"菜单项
        if (viewAdditionalDataItem) {
            if (this.selectedItem.additionalData && (this.selectedItem.additionalData.note || this.selectedItem.additionalData.imageUrl)) {
                viewAdditionalDataItem.classList.remove('hidden');
            } else {
                viewAdditionalDataItem.classList.add('hidden');
            }
        }
    }
    
    /**
     * 处理右键菜单项点击
     */
    handleContextMenuAction(action) {
        if (!this.selectedItem) return;
        
        // 处理查看附加数据操作
        if (action === 'viewAdditionalData') {
            // 调用全局的viewAdditionalData方法
            if (window.appInstance) {
                window.appInstance.viewAdditionalData(this.selectedItem.id);
            }
        } else {
            // 查找对应的action配置
            const actionConfig = this.options.actions.find(a => {
                if (action === 'edit' && a.className?.includes('edit')) return true;
                if (action === 'delete' && a.className?.includes('delete')) return true;
                return false;
            });
            
            // 调用对应的回调函数
            if (actionConfig?.callback) {
                actionConfig.callback(this.selectedItem);
            }
        }
        
        // 关闭菜单
        this.hideContextMenu();
    }

    /**
     * 设置表格数据
     * @param {Array} data - 表格数据
     */
    setData(data) {
        this.data = data;
        this.filteredData = [...data];
        this.render();
    }

    /**
     * 渲染表格
     */
    render() {
        if (!this.tbody) return;

        // 清空表体
        this.tbody.innerHTML = '';

        if (this.filteredData.length === 0) {
            // 显示空数据提示
            const row = document.createElement('tr');
            const cell = document.createElement('td');
            cell.colSpan = this.options.showActions ? this.columns.length + 1 : this.columns.length;
            cell.textContent = '暂无数据';
            cell.className = 'text-center py-4 text-gray-500';
            row.appendChild(cell);
            this.tbody.appendChild(row);
            return;
        }

        // 渲染数据行
        this.filteredData.forEach((item, index) => {
            const row = document.createElement('tr');
            row.dataset.id = item.id;
            row.classList.add('data-row');
            
            // 为特殊行（回费或减费类型）应用特殊样式
            if (item.action === '回费' || item.action === '减费') {
                row.classList.add('bg-white', 'border-2', 'border-blue-400', 'font-medium', 'shadow-sm');
            }
            
            // 为已添加附加数据的行应用特殊样式
            if (item.additionalData && (item.additionalData.note || item.additionalData.imageUrl)) {
                row.classList.add('border-l-4', 'border-red-500');
                // 为角色名设置红色字体
                const character = window.appInstance?.dataManager.getCharacterById(item.characterId);
                if (character) {
                    // 标记为已添加附加数据的行
                    row.setAttribute('data-has-additional-data', 'true');
                }
            }

            // 渲染列数据
            this.columns.forEach(column => {
                const cell = document.createElement('td');
                
                if (column.field === 'characterId' || column.field === 'name') {
                    // 渲染角色名，带附加数据标记
                    if (column.render) {
                        // 使用自定义渲染函数
                        cell.innerHTML = column.render(item, index);
                    } else {
                        // 使用默认渲染
                        cell.textContent = item[column.field] || '';
                    }
                    
                    // 如果有附加数据，设置红色字体
                    if (item.additionalData && (item.additionalData.note || item.additionalData.imageUrl)) {
                        cell.style.color = '#dc2626'; // 红色
                    }
                } else if (column.render) {
                    // 使用自定义渲染函数
                    cell.innerHTML = column.render(item, index);
                } else {
                    // 使用默认渲染
                    cell.textContent = item[column.field] || '';
                }

                row.appendChild(cell);
            });

            // 渲染操作列
            if (this.options.showActions) {
                const actionCell = document.createElement('td');
                actionCell.className = 'action-cell';
                
                // 检查是否是初始化行，初始化行不显示操作按钮
                const isInitializationRow = item.action === '初始化';
                
                // 创建操作按钮（非初始化行才显示）
                if (this.options.actions && !isInitializationRow) {
                    // 设置操作单元格的样式
                    actionCell.className = 'action-cell flex gap-2 justify-center p-1';
                    
                    this.options.actions.forEach(action => {
                        const btn = document.createElement('button');
                        
                        // 设置现代化的按钮样式
                        btn.className = `p-2 rounded-full hover:bg-blue-100 text-blue-600 transition-colors duration-200 ${action.className || ''}`;
                        
                        // 对于特殊行（回费或减费类型），只显示删除按钮，隐藏编辑按钮
                        if ((item.action === '回费' || item.action === '减费') && action.className?.includes('edit')) {
                            return; // 跳过编辑按钮，forEach中用return代替continue
                        }
                        
                        // 根据按钮类型设置不同的颜色和背景
                        if (action.className?.includes('delete')) {
                            btn.className = `p-2 rounded-full bg-red-100 text-red-700 border border-red-300 hover:bg-red-200 transition-colors duration-200 ${action.className || ''}`;
                        } else if (action.className?.includes('edit')) {
                            btn.className = `p-2 rounded-full bg-blue-100 text-blue-700 border border-blue-300 hover:bg-blue-200 transition-colors duration-200 ${action.className || ''}`;
                        }
                        
                        // 只显示图标，不显示文字
                        btn.innerHTML = action.icon ? `<i class="fas ${action.icon} text-sm"></i>` : '';
                        btn.title = action.title || '';
                        
                        btn.addEventListener('click', (e) => {
                            e.stopPropagation();
                            action.callback(item, index);
                        });

                        actionCell.appendChild(btn);
                    });
                } else if (isInitializationRow) {
                    // 初始化行显示占位符
                    actionCell.textContent = '-';
                    actionCell.style.textAlign = 'center';
                }

                row.appendChild(actionCell);
            }

            // 添加行点击事件
            if (this.options.onRowClick) {
                row.addEventListener('click', () => {
                    this.options.onRowClick(item, index);
                });
            }

            this.tbody.appendChild(row);
        });
        
        // 执行渲染完成回调
        if (this.options.onRenderComplete && typeof this.options.onRenderComplete === 'function') {
            this.options.onRenderComplete();
        }
        
        // 重新绑定右键菜单事件（因为tbody和数据行已重新创建）
        this.bindContextMenuEvents();
    }

    /**
     * 根据字段排序
     * @param {string} field - 排序字段
     */
    sortBy(field) {
        const currentSort = this.tableElement.querySelector(`th[data-field="${field}"]`);
        if (!currentSort) return;
        
        const sortDirection = currentSort.classList.contains('sort-asc') ? 'desc' : 'asc';

        // 重置所有排序样式
        this.tableElement.querySelectorAll('th.sortable').forEach(th => {
            th.classList.remove('sort-asc', 'sort-desc');
        });

        // 更新当前排序字段的样式
        currentSort.classList.add(sortDirection === 'asc' ? 'sort-asc' : 'sort-desc');

        // 执行排序
        this.filteredData.sort((a, b) => {
            const aVal = a[field];
            const bVal = b[field];

            if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });

        this.render();
    }

    /**
     * 过滤表格数据
     * @param {Function} filterFn - 过滤函数
     */
    filter(filterFn) {
        if (typeof filterFn === 'function') {
            this.filteredData = this.data.filter(filterFn);
        } else {
            this.filteredData = [...this.data];
        }
        this.render();
    }

    /**
     * 搜索表格数据
     * @param {string} keyword - 搜索关键词
     */
    search(keyword) {
        if (!keyword.trim()) {
            this.filteredData = [...this.data];
            this.render();
            return;
        }

        const lowerKeyword = keyword.toLowerCase();
        this.filteredData = this.data.filter(item => {
            return this.columns.some(column => {
                const value = item[column.field];
                return String(value).toLowerCase().includes(lowerKeyword);
            });
        });

        this.render();
    }

    /**
     * 获取选中的行数据
     * @returns {Array} - 选中的行数据
     */
    getSelectedRows() {
        const selectedRows = [];
        this.tbody.querySelectorAll('tr.selected').forEach(row => {
            const id = row.dataset.id;
            const item = this.data.find(d => d.id === id);
            if (item) selectedRows.push(item);
        });
        return selectedRows;
    }

    /**
     * 刷新表格
     */
    refresh() {
        this.render();
    }
}

export default DataTable;
