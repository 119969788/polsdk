// 测试脚本：检查 SDK API
// 使用方法: node test-sdk-api.js

import('@catalyst-team/poly-sdk').then(async (module) => {
  console.log('=== SDK 模块检查 ===');
  
  // 获取 SDK 类
  const SDK = module.default || module.PolySDK || module.PolymarketSDK || module;
  console.log('SDK 类型:', typeof SDK);
  console.log('SDK 构造函数名:', SDK?.name || 'Unknown');
  
  // 创建 SDK 实例
  if (!process.env.PRIVATE_KEY) {
    console.error('错误: 请设置 PRIVATE_KEY 环境变量');
    process.exit(1);
  }
  
  const sdk = new SDK({ privateKey: process.env.PRIVATE_KEY });
  console.log('\n=== SDK 实例检查 ===');
  console.log('SDK 对象键:', Object.keys(sdk));
  
  // 检查 smartMoney
  if (sdk.smartMoney) {
    console.log('\n=== smartMoney 服务检查 ===');
    console.log('smartMoney 对象键:', Object.keys(sdk.smartMoney));
    
    // 检查每个方法
    Object.keys(sdk.smartMoney).forEach(key => {
      const value = sdk.smartMoney[key];
      console.log(`  - ${key}: ${typeof value}`);
      if (typeof value === 'function') {
        try {
          console.log(`    参数数量: ${value.length}`);
        } catch (e) {
          // 忽略
        }
      }
    });
    
    // 尝试调用 autoCopyTrading（如果存在）
    if (typeof sdk.smartMoney.autoCopyTrading === 'function') {
      console.log('\n=== 测试 autoCopyTrading ===');
      try {
        // 不实际调用，只检查
        console.log('方法存在，准备测试调用...');
        console.log('注意: 这只是一个结构检查，不会真正启动跟单');
      } catch (error) {
        console.error('错误:', error);
      }
    } else {
      console.log('\n⚠️  autoCopyTrading 方法不存在');
      console.log('可用的方法:', Object.keys(sdk.smartMoney));
    }
  } else {
    console.log('\n❌ smartMoney 服务不存在');
  }
  
  // 检查是否有 initialize 方法
  if (typeof sdk.initialize === 'function') {
    console.log('\n=== SDK 初始化 ===');
    try {
      await sdk.initialize();
      console.log('✅ SDK 初始化成功');
    } catch (error) {
      console.error('❌ SDK 初始化失败:', error);
    }
  }
  
  console.log('\n=== 测试完成 ===');
  process.exit(0);
}).catch(error => {
  console.error('导入 SDK 失败:', error);
  process.exit(1);
});
