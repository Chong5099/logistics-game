// 游戏状态
let gameState = {
    money: 100000,
    trucks: 1,
    totalOrders: 0,
    level: 1,
    todayIncome: 0,
    totalProfit: 0,
    activeOrders: []
};

// 订单模板
const orderTemplates = [
    { name: "📱 电子产品配送", reward: 800, difficulty: "简单", time: "2小时" },
    { name: "📚 书籍配送", reward: 500, difficulty: "简单", time: "1小时" },
    { name: "🍎 生鲜配送", reward: 1200, difficulty: "中等", time: "3小时" },
    { name: "🪑 家具配送", reward: 2000, difficulty: "困难", time: "5小时" },
    { name: "🏭 大宗货物", reward: 3500, difficulty: "挑战", time: "8小时" },
    { name: "💊 医疗物资", reward: 1500, difficulty: "紧急", time: "2小时" }
];

// 初始化游戏
function initGame() {
    updateUI();
    generateOrders();
    // 每30秒自动生成新订单
    setInterval(generateOrders, 30000);
}

// 购买卡车
function buyTruck(price) {
    if (gameState.money >= price) {
        gameState.money -= price;
        gameState.trucks++;
        updateUI();
        showMessage(`成功购买卡车！现在共有 ${gameState.trucks} 辆卡车`, "success");
        
        // 检查等级升级
        checkLevelUp();
    } else {
        showMessage("资金不足，无法购买卡车！", "error");
    }
}

// 接受订单
function acceptOrder(orderIndex, order) {
    if (gameState.activeOrders.length >= gameState.trucks) {
        showMessage(`卡车数量不足！当前只有 ${gameState.trucks} 辆卡车可用`, "error");
        return;
    }
    
    // 添加到活跃订单
    const newOrder = {
        ...order,
        id: Date.now(),
        startTime: new Date()
    };
    
    gameState.activeOrders.push(newOrder);
    gameState.totalOrders++;
    
    // 模拟配送时间
    setTimeout(() => completeOrder(newOrder.id), getDeliveryTime(order.time));
    
    updateUI();
    showMessage(`已接受订单：${order.name}，预计${order.time}完成`, "success");
    
    // 移除订单列表中的这个订单
    const ordersList = document.getElementById('ordersList');
    const orderCards = ordersList.getElementsByClassName('order-card');
    if (orderCards[orderIndex]) {
        orderCards[orderIndex].remove();
    }
}

// 完成订单
function completeOrder(orderId) {
    const orderIndex = gameState.activeOrders.findIndex(o => o.id === orderId);
    if (orderIndex !== -1) {
        const completedOrder = gameState.activeOrders[orderIndex];
        const reward = completedOrder.reward;
        
        gameState.money += reward;
        gameState.todayIncome += reward;
        gameState.totalProfit += reward;
        
        gameState.activeOrders.splice(orderIndex, 1);
        
        updateUI();
        showMessage(`✅ 完成订单！获得 ¥${reward}`, "success");
        
        // 检查等级升级
        checkLevelUp();
    }
}

// 获取配送时间（毫秒）
function getDeliveryTime(timeStr) {
    const times = {
        "1小时": 3000,
        "2小时": 6000,
        "3小时": 9000,
        "5小时": 15000,
        "8小时": 24000
    };
    return times[timeStr] || 6000;
}

// 生成新订单
function generateOrders() {
    const ordersList = document.getElementById('ordersList');
    ordersList.innerHTML = '';
    
    // 根据等级生成不同数量的订单
    const orderCount = Math.min(3 + Math.floor(gameState.level / 2), 6);
    const availableOrders = [...orderTemplates];
    
    for (let i = 0; i < orderCount; i++) {
        if (availableOrders.length === 0) break;
        
        const randomIndex = Math.floor(Math.random() * availableOrders.length);
        const order = availableOrders[randomIndex];
        availableOrders.splice(randomIndex, 1);
        
        // 根据等级调整奖励
        let adjustedReward = order.reward;
        if (gameState.level >= 3) {
            adjustedReward = Math.floor(order.reward * 1.5);
        } else if (gameState.level >= 5) {
            adjustedReward = Math.floor(order.reward * 2);
        }
        
        const orderWithReward = { ...order, reward: adjustedReward };
        
        const orderCard = document.createElement('div');
        orderCard.className = 'order-card';
        orderCard.innerHTML = `
            <h3>${orderWithReward.name}</h3>
            <p>💰 奖励: ¥${orderWithReward.reward}</p>
            <p>⭐ 难度: ${orderWithReward.difficulty}</p>
            <p>⏰ 时间: ${orderWithReward.time}</p>
            <button onclick="acceptOrder(${i}, ${JSON.stringify(orderWithReward).replace(/"/g, '&quot;')})">接受订单</button>
        `;
        
        ordersList.appendChild(orderCard);
    }
    
    updateActiveOrdersCount();
}

// 检查等级升级
function checkLevelUp() {
    const newLevel = Math.floor(gameState.totalProfit / 20000) + 1;
    if (newLevel > gameState.level) {
        gameState.level = newLevel;
        showMessage(`🎉 恭喜！公司升级到 ${gameState.level} 级！解锁更多订单！`, "success");
        updateUI();
    }
}

// 更新活跃订单计数
function updateActiveOrdersCount() {
    document.getElementById('activeOrders').textContent = gameState.activeOrders.length;
}

// 更新UI显示
function updateUI() {
    document.getElementById('money').textContent = Math.floor(gameState.money);
    document.getElementById('truckCount').textContent = gameState.trucks;
    document.getElementById('level').textContent = gameState.level;
    document.getElementById('totalOrders').textContent = gameState.totalOrders;
    document.getElementById('todayIncome').textContent = gameState.todayIncome;
    document.getElementById('totalProfit').textContent = gameState.totalProfit;
    updateActiveOrdersCount();
}

// 显示消息提示
function showMessage(msg, type) {
    // 创建消息提示元素
    const messageDiv = document.createElement('div');
    messageDiv.textContent = msg;
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#28a745' : '#dc3545'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 1000;
        animation: slideIn 0.5s ease;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    `;
    
    document.body.appendChild(messageDiv);
    
    // 3秒后自动消失
    setTimeout(() => {
        messageDiv.style.animation = 'slideOut 0.5s ease';
        setTimeout(() => {
            document.body.removeChild(messageDiv);
        }, 500);
    }, 3000);
}

// 添加动画样式
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// 页面加载完成后启动游戏
window.onload = initGame;