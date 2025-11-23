#!/usr/bin/env python3
"""
测试AI生成学习计划功能
"""

import requests
import json
import time
import sys
from typing import Dict, Any, Optional

def analyze_error_response(response: requests.Response) -> Dict[str, Any]:
    """分析错误响应的详细信息"""
    error_info = {
        "status_code": response.status_code,
        "headers": dict(response.headers),
        "url": response.url,
        "reason": response.reason,
    }
    
    try:
        error_info["response_data"] = response.json()
    except:
        try:
            error_info["response_text"] = response.text
        except:
            error_info["response_text"] = "无法读取响应内容"
    
    return error_info

def test_study_plan_generation():
    """测试AI生成学习计划API"""
    
    # API基础URL
    base_url = "http://localhost:8000"
    
    print("🔍 开始测试AI生成学习计划功能...")
    print("=" * 60)
    
    # 步骤1: 登录获取token
    print("\n📝 步骤1: 登录获取认证token")
    print("-" * 40)
    
    login_data = {
        "username": "qwer@qq.com",
        "password": "1qaz2wsx"
    }
    
    # 检查后端服务是否运行
    print("   🔍 检查后端服务状态...")
    try:
        health_response = requests.get(f"{base_url}/health", timeout=5)
        if health_response.status_code == 200:
            print("   ✅ 后端服务正在运行")
        else:
            print(f"   ⚠️  后端服务状态异常: {health_response.status_code}")
    except requests.exceptions.ConnectionError:
        print("   ❌ 无法连接到后端服务，请确保后端服务正在运行")
        print("   💡 提示: 运行 'cd backend-code && python main.py' 启动后端服务")
        return False
    except requests.exceptions.Timeout:
        print("   ❌ 后端服务响应超时")
        return False
    except Exception as e:
        print(f"   ❌ 检查后端服务时发生异常: {str(e)}")
        return False
    
    print(f"   📤 发送登录请求到: {base_url}/api/auth/login")
    print(f"   📦 登录数据: {json.dumps(login_data, indent=2)}")
    
    try:
        login_response = requests.post(
            f"{base_url}/api/auth/login",
            json=login_data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        print(f"   📊 登录状态码: {login_response.status_code}")
        print(f"   📋 响应头: {dict(login_response.headers)}")
        
        if login_response.status_code == 200:
            try:
                login_result = login_response.json()
                token = login_result.get("access_token")
                print(f"   ✅ 登录成功")
                print(f"   🔑 Token类型: {type(token)}")
                print(f"   🔑 Token长度: {len(token) if token else 0}")
                print(f"   🔑 Token预览: {token[:20]}..." if token else "   🔑 无Token")
                
                # 检查登录响应的其他字段
                print(f"   📋 完整登录响应: {json.dumps(login_result, indent=2)}")
                
            except json.JSONDecodeError as e:
                print(f"   ❌ 登录响应JSON解析失败: {str(e)}")
                print(f"   📄 原始响应: {login_response.text}")
                return False
        else:
            print(f"   ❌ 登录失败")
            error_info = analyze_error_response(login_response)
            print(f"   📄 错误详情: {json.dumps(error_info, indent=2, ensure_ascii=False)}")
            
            # 提供具体的错误建议
            if login_response.status_code == 401:
                print("   💡 可能原因: 用户名或密码错误")
            elif login_response.status_code == 404:
                print("   💡 可能原因: 登录API端点不存在")
            elif login_response.status_code == 500:
                print("   💡 可能原因: 服务器内部错误")
            
            return False
            
    except requests.exceptions.ConnectionError:
        print("   ❌ 无法连接到后端服务")
        print("   💡 请检查:")
        print("      1. 后端服务是否正在运行")
        print("      2. 端口8000是否被占用")
        print("      3. 防火墙设置是否正确")
        return False
    except requests.exceptions.Timeout:
        print("   ❌ 登录请求超时")
        print("   💡 可能原因: 网络延迟或服务器响应慢")
        return False
    except Exception as e:
        print(f"   ❌ 登录请求异常: {str(e)}")
        print(f"   🔍 异常类型: {type(e).__name__}")
        print(f"   🔍 异常详情: {str(e)}")
        return False
    
    # 步骤2: 测试AI生成学习计划
    print("\n📝 步骤2: 测试AI生成学习计划API")
    print("=" * 60)
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    # 首先检查用户的AI配置
    print("\n🔍 检查用户AI配置...")
    try:
        config_response = requests.get(
            f"{base_url}/api/settings/assistants",
            headers=headers,
            timeout=10
        )
        
        if config_response.status_code == 200:
            configs = config_response.json()
            print(f"   📊 用户AI配置数量: {len(configs)}")
            
            default_configs = [c for c in configs if c.get('is_default')]
            print(f"   🎯 默认配置数量: {len(default_configs)}")
            
            if default_configs:
                default_config = default_configs[0]
                print(f"   🤖 默认模型: {default_config.get('model', '未知')}")
                print(f"   📝 配置名称: {default_config.get('name', '未知')}")
            else:
                print("   ⚠️  警告: 没有默认AI配置")
                print("   💡 这可能导致AI生成失败")
        else:
            print(f"   ❌ 获取AI配置失败: {config_response.status_code}")
            
    except Exception as e:
        print(f"   ❌ 检查AI配置时发生异常: {str(e)}")
    
    # 测试数据
    test_prompts = [
        "请为我生成一个通用的学习计划，适合初学者入门",
        "我想学习Python编程，从零开始",
        "准备前端面试，需要复习React和JavaScript"
    ]
    
    success_count = 0
    total_tests = len(test_prompts)
    
    for i, prompt in enumerate(test_prompts, 1):
        print(f"\n🧪 测试 {i}/{total_tests}: {prompt}")
        print("-" * 50)
        
        request_data = {"prompt": prompt}
        
        print(f"   📤 请求URL: {base_url}/api/ai/generate-study-plan")
        print(f"   📦 请求数据: {json.dumps(request_data, indent=2)}")
        print(f"   🔐 认证头: Bearer {token[:20]}...")
        
        try:
            start_time = time.time()
            
            response = requests.post(
                f"{base_url}/api/ai/generate-study-plan",
                json=request_data,
                headers=headers,
                timeout=180  # 3分钟超时
            )
            
            end_time = time.time()
            duration = end_time - start_time
            
            print(f"   📊 响应状态码: {response.status_code}")
            print(f"   📋 响应头: {dict(response.headers)}")
            print(f"   ⏱️  响应时间: {duration:.2f}秒")
            
            if response.status_code == 200:
                try:
                    result = response.json()
                    print(f"   ✅ 生成成功")
                    print(f"   📋 响应数据类型: {type(result)}")
                    print(f"   📋 完整响应: {json.dumps(result, indent=2, ensure_ascii=False)}")
                    
                    # 验证必要字段
                    title = result.get('title')
                    priority = result.get('priority')
                    tasks = result.get('tasks', [])
                    
                    print(f"   📋 标题: {title or '无标题'}")
                    print(f"   🎯 优先级: {priority or '无优先级'}")
                    print(f"   📝 任务数量: {len(tasks)}")
                    
                    # 验证任务结构
                    if tasks:
                        print("   📋 任务列表:")
                        valid_tasks = 0
                        for j, task in enumerate(tasks[:5], 1):  # 只显示前5个任务
                            task_title = task.get('title')
                            task_duration = task.get('duration')
                            print(f"      {j}. {task_title or '无标题'} ({task_duration or '无时长'})")
                            
                            if task_title and task_duration:
                                valid_tasks += 1
                        
                        if len(tasks) > 5:
                            print(f"      ... 还有 {len(tasks) - 5} 个任务")
                        
                        print(f"   ✅ 有效任务数量: {valid_tasks}/{len(tasks)}")
                        
                        if valid_tasks == len(tasks):
                            print("   ✅ 所有任务结构完整")
                            success_count += 1
                        else:
                            print("   ⚠️  部分任务结构不完整")
                    else:
                        print("   ❌ 没有任务数据")
                    
                    # 验证JSON格式
                    try:
                        json_str = json.dumps(result, ensure_ascii=False)
                        print(f"   ✅ JSON格式验证通过 (长度: {len(json_str)})")
                    except Exception as e:
                        print(f"   ❌ JSON格式验证失败: {str(e)}")
                        
                except json.JSONDecodeError as e:
                    print(f"   ❌ 响应JSON解析失败: {str(e)}")
                    print(f"   📄 原始响应: {response.text}")
                    
            else:
                print(f"   ❌ 生成失败")
                error_info = analyze_error_response(response)
                print(f"   📄 错误详情: {json.dumps(error_info, indent=2, ensure_ascii=False)}")
                
                # 提供具体的错误建议
                if response.status_code == 401:
                    print("   💡 可能原因: 认证失败或token过期")
                elif response.status_code == 404:
                    print("   💡 可能原因: API端点不存在")
                elif response.status_code == 422:
                    print("   💡 可能原因: 请求参数验证失败")
                elif response.status_code == 500:
                    print("   💡 可能原因: 服务器内部错误")
                    print("   💡 建议检查后端日志获取详细错误信息")
                elif response.status_code == 503:
                    print("   💡 可能原因: AI服务不可用")
                    print("   💡 建议检查AI配置和网络连接")
                
        except requests.exceptions.Timeout:
            print(f"   ❌ 请求超时 (>180秒)")
            print("   💡 可能原因:")
            print("      1. AI模型响应时间过长")
            print("      2. 网络延迟")
            print("      3. 服务器负载过高")
        except requests.exceptions.ConnectionError:
            print("   ❌ 连接错误")
            print("   💡 可能原因: 网络连接中断或服务器宕机")
        except requests.exceptions.RequestException as e:
            print(f"   ❌ 请求异常: {str(e)}")
            print(f"   🔍 异常类型: {type(e).__name__}")
        except Exception as e:
            print(f"   ❌ 未知异常: {str(e)}")
            print(f"   🔍 异常类型: {type(e).__name__}")
            import traceback
            print(f"   🔍 堆栈跟踪: {traceback.format_exc()}")
    
    # 测试总结
    print("\n" + "=" * 60)
    print("📊 测试总结")
    print("=" * 60)
    print(f"   ✅ 成功测试: {success_count}/{total_tests}")
    print(f"   ❌ 失败测试: {total_tests - success_count}/{total_tests}")
    print(f"   📈 成功率: {(success_count/total_tests)*100:.1f}%")
    
    if success_count == total_tests:
        print("\n🎉 所有测试通过！AI生成学习计划功能正常工作")
        return True
    elif success_count > 0:
        print(f"\n⚠️  部分测试通过 ({success_count}/{total_tests})")
        print("   💡 建议检查失败的测试用例")
        return False
    else:
        print("\n❌ 所有测试失败")
        print("   💡 建议检查:")
        print("      1. 后端服务是否正常运行")
        print("      2. AI配置是否正确")
        print("      3. 网络连接是否正常")
        print("      4. 认证token是否有效")
        return False

if __name__ == "__main__":
    test_study_plan_generation()