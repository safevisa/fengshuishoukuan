// 修复会话管理和前端功能问题
// 这个文件包含修复代码，需要在应用中应用

// 1. 修复localStorage会话管理
function fixSessionManagement() {
    // 确保用户登录状态正确保存
    const saveUserSession = (user) => {
        try {
            localStorage.setItem('current_user', JSON.stringify(user));
            localStorage.setItem('current_user_email', user.email);
            localStorage.setItem('user_login_time', Date.now().toString());
            console.log('✅ 用户会话已保存');
        } catch (error) {
            console.error('❌ 保存用户会话失败:', error);
        }
    };

    // 检查用户登录状态
    const checkUserSession = () => {
        try {
            const user = localStorage.getItem('current_user');
            const email = localStorage.getItem('current_user_email');
            const loginTime = localStorage.getItem('user_login_time');
            
            if (user && email && loginTime) {
                const userData = JSON.parse(user);
                const timeDiff = Date.now() - parseInt(loginTime);
                const maxAge = 24 * 60 * 60 * 1000; // 24小时
                
                if (timeDiff < maxAge) {
                    return userData;
                } else {
                    // 会话过期，清除数据
                    clearUserSession();
                    return null;
                }
            }
            return null;
        } catch (error) {
            console.error('❌ 检查用户会话失败:', error);
            return null;
        }
    };

    // 清除用户会话
    const clearUserSession = () => {
        try {
            localStorage.removeItem('current_user');
            localStorage.removeItem('current_user_email');
            localStorage.removeItem('user_login_time');
            console.log('✅ 用户会话已清除');
        } catch (error) {
            console.error('❌ 清除用户会话失败:', error);
        }
    };

    return { saveUserSession, checkUserSession, clearUserSession };
}

// 2. 修复收款链接功能
function fixPaymentLinkFunctions() {
    // 复制链接功能
    const copyPaymentLink = async (linkId) => {
        try {
            const baseUrl = window.location.origin;
            const paymentUrl = `${baseUrl}/pay/${linkId}`;
            
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(paymentUrl);
                console.log('✅ 链接已复制到剪贴板');
                return true;
            } else {
                // 降级方案
                const textArea = document.createElement('textarea');
                textArea.value = paymentUrl;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                textArea.style.top = '-999999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                
                const successful = document.execCommand('copy');
                document.body.removeChild(textArea);
                
                if (successful) {
                    console.log('✅ 链接已复制到剪贴板');
                    return true;
                } else {
                    throw new Error('复制失败');
                }
            }
        } catch (error) {
            console.error('❌ 复制链接失败:', error);
            alert('复制失败，请手动复制链接');
            return false;
        }
    };

    // 查看链接详情
    const viewPaymentLink = (linkId) => {
        try {
            const baseUrl = window.location.origin;
            const paymentUrl = `${baseUrl}/pay/${linkId}`;
            window.open(paymentUrl, '_blank');
            console.log('✅ 已打开支付链接');
        } catch (error) {
            console.error('❌ 打开支付链接失败:', error);
        }
    };

    return { copyPaymentLink, viewPaymentLink };
}

// 3. 修复移动端兼容性
function fixMobileCompatibility() {
    // 修复输入框在移动端的问题
    const fixMobileInputs = () => {
        const inputs = document.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            // 确保输入框在移动端可以正常使用
            input.style.webkitAppearance = 'none';
            input.style.borderRadius = '4px';
            input.style.fontSize = '16px'; // 防止iOS缩放
            
            // 添加触摸事件支持
            input.addEventListener('touchstart', (e) => {
                e.target.focus();
            });
        });
    };

    // 修复按钮在移动端的问题
    const fixMobileButtons = () => {
        const buttons = document.querySelectorAll('button, .btn');
        buttons.forEach(button => {
            // 确保按钮在移动端可以正常点击
            button.style.minHeight = '44px'; // iOS推荐的最小触摸目标
            button.style.minWidth = '44px';
            
            // 添加触摸反馈
            button.addEventListener('touchstart', (e) => {
                e.target.style.opacity = '0.7';
            });
            
            button.addEventListener('touchend', (e) => {
                e.target.style.opacity = '1';
            });
        });
    };

    // 修复滚动问题
    const fixMobileScrolling = () => {
        // 防止iOS橡皮筋效果
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';
        
        // 允许在内容区域滚动
        const scrollableElements = document.querySelectorAll('.scrollable, main, .content');
        scrollableElements.forEach(el => {
            el.style.overflow = 'auto';
            el.style.webkitOverflowScrolling = 'touch';
        });
    };

    return { fixMobileInputs, fixMobileButtons, fixMobileScrolling };
}

// 4. 修复API调用问题
function fixAPICalls() {
    // 统一的API调用函数
    const apiCall = async (url, options = {}) => {
        try {
            const baseUrl = window.location.origin;
            const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;
            
            const defaultOptions = {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                credentials: 'same-origin'
            };
            
            const mergedOptions = { ...defaultOptions, ...options };
            
            const response = await fetch(fullUrl, mergedOptions);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return { success: true, data };
        } catch (error) {
            console.error('❌ API调用失败:', error);
            return { success: false, error: error.message };
        }
    };

    return { apiCall };
}

// 5. 初始化所有修复
function initializeFixes() {
    console.log('🔧 开始初始化修复...');
    
    // 修复会话管理
    const sessionManager = fixSessionManagement();
    window.sessionManager = sessionManager;
    
    // 修复收款链接功能
    const paymentLinkManager = fixPaymentLinkFunctions();
    window.paymentLinkManager = paymentLinkManager;
    
    // 修复移动端兼容性
    const mobileFixer = fixMobileCompatibility();
    mobileFixer.fixMobileInputs();
    mobileFixer.fixMobileButtons();
    mobileFixer.fixMobileScrolling();
    
    // 修复API调用
    const apiManager = fixAPICalls();
    window.apiManager = apiManager;
    
    console.log('✅ 所有修复已初始化');
}

// 6. 页面加载完成后执行修复
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeFixes);
} else {
    initializeFixes();
}

// 导出修复函数供其他模块使用
window.fengshuiFixes = {
    fixSessionManagement,
    fixPaymentLinkFunctions,
    fixMobileCompatibility,
    fixAPICalls,
    initializeFixes
};

