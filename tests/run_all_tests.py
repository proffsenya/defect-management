#!/usr/bin/env python3
"""
Скрипт для запуска всех автотестов с подробным выводом статуса
"""
import subprocess
import sys
import os
from pathlib import Path

def run_unit_tests():
    """Запуск unit тестов"""
    print("🔬 Запуск unit тестов...")
    print("-" * 30)
    
    try:
        result = subprocess.run([sys.executable, "tests/simple_test.py"], 
                              capture_output=False, text=True, cwd=Path(__file__).parent.parent)
        return result.returncode == 0
    except Exception as e:
        print(f"❌ Ошибка при запуске unit тестов: {e}")
        return False

def run_integration_tests():
    """Запуск интеграционных тестов"""
    print("🔗 Запуск интеграционных тестов...")
    print("-" * 30)
    
    try:
        result = subprocess.run([sys.executable, "tests/simple_integration_test.py"], 
                              capture_output=False, text=True, cwd=Path(__file__).parent.parent)
        return result.returncode == 0
    except Exception as e:
        print(f"❌ Ошибка при запуске интеграционных тестов: {e}")
        return False

def main():
    """Главная функция запуска всех тестов"""
    print("🚀 ЗАПУСК АВТОТЕСТОВ ДЛЯ ПРОЕКТА FLARE-LAB")
    print("=" * 60)
    print("📁 Проект: Система управления дефектами")
    print("📊 Всего тестов: 15 (10 unit + 5 интеграционных)")
    print("=" * 60)
    
    # Запускаем unit тесты
    unit_success = run_unit_tests()
    
    print("\n" + "=" * 60)
    
    # Запускаем интеграционные тесты
    integration_success = run_integration_tests()
    
    # Итоговый результат
    print("\n" + "=" * 60)
    print("📊 ИТОГОВЫЕ РЕЗУЛЬТАТЫ:")
    print(f"🔬 Unit тесты: {'✅ ПРОШЛИ' if unit_success else '❌ НЕ ПРОШЛИ'}")
    print(f"🔗 Интеграционные тесты: {'✅ ПРОШЛИ' if integration_success else '❌ НЕ ПРОШЛИ'}")
    
    if unit_success and integration_success:
        print("🎉 ВСЕ ТЕСТЫ ПРОШЛИ УСПЕШНО!")
        print("✅ Статус: ОК")
        return 0
    else:
        print("⚠️  НЕКОТОРЫЕ ТЕСТЫ НЕ ПРОШЛИ!")
        print("❌ Статус: НЕ ОК")
        return 1

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)
