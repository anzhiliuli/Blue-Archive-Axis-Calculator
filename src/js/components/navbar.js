// 导航栏组件 - 负责处理导航栏相关功能

class Navbar {
    constructor() {
        this.init();
    }

    /**
     * 初始化导航栏组件
     */
    init() {
        this.bindEvents();
        this.updateNavbarState();
    }

    /**
     * 绑定导航栏事件
     */
    bindEvents() {
        // 导航栏滚动效果
        window.addEventListener('scroll', () => {
            this.updateNavbarState();
        });

        // 文件菜单事件
        const fileMenuBtn = document.getElementById('fileMenuBtn');
        const fileMenu = document.getElementById('fileMenu');

        if (fileMenuBtn && fileMenu) {
            fileMenuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleMenu(fileMenu);
            });
        }

        // 编辑菜单事件
        const editMenuBtn = document.getElementById('editMenuBtn');
        const editMenu = document.getElementById('editMenu');

        if (editMenuBtn && editMenu) {
            editMenuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleMenu(editMenu);
            });
        }

        // 工具菜单事件
        const toolsMenuBtn = document.getElementById('toolsMenuBtn');
        const toolsMenu = document.getElementById('toolsMenu');

        if (toolsMenuBtn && toolsMenu) {
            toolsMenuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleMenu(toolsMenu);
            });
        }

        // 帮助菜单事件
        const helpMenuBtn = document.getElementById('helpMenuBtn');
        const helpMenu = document.getElementById('helpMenu');

        if (helpMenuBtn && helpMenu) {
            helpMenuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleMenu(helpMenu);
            });
        }

        // 点击页面其他地方关闭菜单
        document.addEventListener('click', () => {
            this.closeAllMenus();
        });

        // 菜单内部点击阻止冒泡并关闭菜单
        const menus = document.querySelectorAll('.menu-dropdown');
        menus.forEach(menu => {
            menu.addEventListener('click', (e) => {
                e.stopPropagation();
                // 当点击菜单项时关闭当前菜单
                if (e.target.closest('.menu-dropdown-item')) {
                    menu.classList.remove('show');
                }
            });
        });


    }

    /**
     * 更新导航栏状态（滚动效果）
     */
    updateNavbarState() {
        const header = document.querySelector('.app-header');
        if (header) {
            if (window.scrollY > 10) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }
    }

    /**
     * 切换菜单显示状态
     * @param {HTMLElement} menu - 菜单元素
     */
    toggleMenu(menu) {
        // 检查当前菜单是否已经显示
        const isVisible = menu.classList.contains('show');
        
        // 关闭所有菜单
        this.closeAllMenus();
        
        // 如果当前菜单之前是隐藏的，则显示它；如果之前是显示的，则保持关闭状态
        if (!isVisible) {
            menu.classList.add('show');
        }
    }

    /**
     * 关闭所有菜单
     */
    closeAllMenus() {
        const menus = document.querySelectorAll('.menu-dropdown');
        menus.forEach(menu => {
            menu.classList.remove('show');
        });
    }
}

export default Navbar;
