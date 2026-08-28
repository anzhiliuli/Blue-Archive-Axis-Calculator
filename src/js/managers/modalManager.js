// 模态框管理器模块
class ModalManager {
    constructor() {
        this.toastIdCounter = 1;
        this.toasts = {};
        this.initEventListeners();
    }

    // 初始化事件监听器
    initEventListeners() {
        // 监听所有模态框的关闭按钮
        document.addEventListener('click', (e) => {
            // 检查点击目标是否是关闭按钮或其内部元素
            const closeBtn = e.target.closest('.close-modal-btn') || e.target.closest('.close-button');
            if (closeBtn) {
                // 点击关闭按钮
                const modal = closeBtn.closest('.modal-backdrop');
                if (modal) {
                    this.hideModal(modal.id);
                }
            } else if (e.target.classList.contains('modal-backdrop')) {
                // 只有当点击的元素就是modal-backdrop本身时，才关闭模态框
                this.hideModal(e.target.id);
            }
        });

        // 监听键盘事件，按ESC键关闭模态框（优先关闭最上层/最后打开的模态框）
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const activeModals = document.querySelectorAll('.modal-backdrop:not(.hidden)');
                if (activeModals.length > 0) {
                    const topModal = activeModals[activeModals.length - 1];
                    this.hideModal(topModal.id);
                }
            }
        });
    }

    // 显示模态框
    showModal(modalId, data = null) {
        const modal = document.getElementById(modalId);
        if (!modal) return false;

        // 移除隐藏类并显示模态框
        modal.classList.remove('hidden');
        modal.classList.add('show');
        modal.style.display = 'flex';
        
        // 阻止页面滚动
        document.body.style.overflow = 'hidden';
        
        // 设置焦点到模态框
        modal.setAttribute('aria-hidden', 'false');
        modal.focus();
        
        // 如果提供了数据，触发自定义事件传递数据
        if (data) {
            const event = new CustomEvent('modal-shown', { 
                detail: { 
                    modalId, 
                    data 
                } 
            });
            modal.dispatchEvent(event);
        }
        
        return true;
    }

    // 隐藏模态框
    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return false;

        // 添加隐藏类并隐藏模态框
        modal.classList.add('hidden');
        modal.classList.remove('show');
        modal.style.display = 'none';
        
        // 恢复页面滚动
        const activeModals = document.querySelectorAll('.modal-backdrop:not(.hidden)');
        if (activeModals.length === 0) {
            document.body.style.overflow = '';
        }
        
        // 更新属性
        modal.setAttribute('aria-hidden', 'true');
        
        return true;
    }
    
    // 隐藏所有打开的模态框
    hideAllModals() {
        const activeModals = document.querySelectorAll('.modal-backdrop');
        activeModals.forEach(modal => {
            modal.classList.add('hidden');
            modal.classList.remove('show');
            modal.style.display = 'none';
            modal.setAttribute('aria-hidden', 'true');
        });
        
        // 恢复页面滚动
        document.body.style.overflow = '';
    }

    // 显示确认对话框
    showConfirmModal(title, message, onConfirm, onCancel = null) {
        // 创建确认对话框元素（如果不存在）
        let confirmModal = document.getElementById('confirm-modal');
        if (!confirmModal) {
            confirmModal = this.createConfirmModal();
            document.body.appendChild(confirmModal);
        }

        // 设置标题和消息
        confirmModal.querySelector('.confirm-modal-title').textContent = title;
        confirmModal.querySelector('.confirm-modal-message').textContent = message;

        // 移除之前的事件监听器
        const confirmBtn = confirmModal.querySelector('.confirm-btn');
        const cancelBtn = confirmModal.querySelector('.cancel-btn');
        
        // 清除现有的事件监听器
        const newConfirmBtn = confirmBtn.cloneNode(true);
        const newCancelBtn = cancelBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
        cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);

        // 添加新的事件监听器
        newConfirmBtn.addEventListener('click', () => {
            this.hideModal('confirm-modal');
            if (typeof onConfirm === 'function') {
                onConfirm();
            }
        });

        newCancelBtn.addEventListener('click', () => {
            this.hideModal('confirm-modal');
            if (typeof onCancel === 'function') {
                onCancel();
            }
        });

        // 显示确认对话框
        this.showModal('confirm-modal');
        
        return true;
    }

    // 创建确认对话框元素
    createConfirmModal() {
        const modal = document.createElement('div');
        modal.id = 'confirm-modal';
        modal.className = 'modal-backdrop modal fade';
        modal.tabIndex = -1;
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-labelledby', 'confirm-modal-title');
        modal.setAttribute('aria-hidden', 'true');
        
        modal.innerHTML = `
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title confirm-modal-title" id="confirm-modal-title">确认操作</h5>
                        <button type="button" class="close close-modal-btn" aria-label="关闭">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <p class="confirm-modal-message">您确定要执行此操作吗？</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary cancel-btn close-modal-btn">取消</button>
                        <button type="button" class="btn btn-primary confirm-btn">确认</button>
                    </div>
                </div>
            </div>
        `;
        
        return modal;
    }

    // 显示提示消息（Toast）
    showToast(message, type = 'info', duration = 3000) {
        // 确保toast容器存在
        let toastContainer = document.getElementById('toast-container');
        if (!toastContainer) {
            toastContainer = this.createToastContainer();
            document.body.appendChild(toastContainer);
        }

        // 创建toast元素
        const toastId = `toast-${this.toastIdCounter++}`;
        const toast = this.createToast(toastId, message, type);
        toastContainer.appendChild(toast);
        
        // 保存toast引用
        this.toasts[toastId] = toast;

        // 显示toast
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);

        // 自动隐藏toast
        if (duration > 0) {
            setTimeout(() => {
                this.hideToast(toastId);
            }, duration);
        }

        return toastId;
    }

    // 隐藏提示消息
    hideToast(toastId) {
        const toast = this.toasts[toastId];
        if (!toast) return false;

        // 移除显示类
        toast.classList.remove('show');
        
        // 等待动画完成后移除元素
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
                delete this.toasts[toastId];
            }
            
            // 如果没有toast了，移除容器
            const toastContainer = document.getElementById('toast-container');
            if (toastContainer && toastContainer.children.length === 0) {
                toastContainer.remove();
            }
        }, 300);

        return true;
    }

    // 创建toast容器
    createToastContainer() {
        const container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container position-fixed top-0 end-0 p-3';
        container.setAttribute('aria-live', 'polite');
        container.setAttribute('aria-atomic', 'true');
        
        return container;
    }

    // 创建toast元素
    createToast(id, message, type) {
        const toast = document.createElement('div');
        toast.id = id;
        toast.className = `toast align-items-center text-white border-0 ${this.getToastTypeClass(type)}`;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');
        toast.setAttribute('aria-atomic', 'true');

        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body"></div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto close-toast-btn" data-toast-id="${id}" aria-label="关闭"></button>
            </div>
        `;

        // 消息可能包含学生名/文件名等来自用户或导入数据的文本，必须用textContent写入以防XSS
        toast.querySelector('.toast-body').textContent = message;

        // 添加关闭按钮事件监听器
        const closeBtn = toast.querySelector('.close-toast-btn');
        closeBtn.addEventListener('click', () => {
            this.hideToast(id);
        });

        return toast;
    }

    // 获取toast类型对应的CSS类
    getToastTypeClass(type) {
        switch (type.toLowerCase()) {
            case 'success':
                return 'bg-success';
            case 'error':
                return 'bg-danger';
            case 'warning':
                return 'bg-warning text-dark';
            case 'info':
            default:
                return 'bg-info';
        }
    }

    // 显示加载指示器
    showLoadingIndicator(message = '加载中...') {
        // 创建加载指示器元素（如果不存在）
        let loadingIndicator = document.getElementById('loading-indicator');
        if (!loadingIndicator) {
            loadingIndicator = this.createLoadingIndicator();
            document.body.appendChild(loadingIndicator);
        }

        // 设置消息
        loadingIndicator.querySelector('.loading-message').textContent = message;

        // 显示加载指示器
        loadingIndicator.classList.add('show');
        
        return true;
    }

    // 隐藏加载指示器
    // 注意：不移除DOM元素，避免"隐藏后300ms内再次显示"时被延迟移除任务误删（竞态）
    hideLoadingIndicator() {
        const loadingIndicator = document.getElementById('loading-indicator');
        if (loadingIndicator) {
            loadingIndicator.classList.remove('show');
            return true;
        }

        return false;
    }

    // 创建加载指示器元素
    createLoadingIndicator() {
        const indicator = document.createElement('div');
        indicator.id = 'loading-indicator';
        indicator.className = 'loading-indicator';
        
        indicator.innerHTML = `
            <div class="loading-backdrop"></div>
            <div class="loading-content">
                <div class="spinner-border text-primary" role="status">
                    <span class="sr-only">加载中...</span>
                </div>
                <p class="loading-message mt-3">加载中...</p>
            </div>
        `;
        
        return indicator;
    }
}

// 导出ModalManager类作为默认导出
export default ModalManager;
