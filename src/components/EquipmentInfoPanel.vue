<template>
  <Transition name="slide">
    <div v-if="equipment" class="equipment-panel">
      <div class="panel-header">
        <h3>{{ equipment.name }}</h3>
        <span 
          class="status-badge" 
          :class="equipment.status"
        >
          {{ statusText }}
        </span>
        <button class="close-btn" @click="$emit('close')">×</button>
      </div>
      
      <div class="panel-body">
        <div class="info-section">
          <h4>基本信息</h4>
          <div class="info-grid">
            <div class="info-item">
              <label>设备ID</label>
              <span>{{ equipment.id }}</span>
            </div>
            <div class="info-item">
              <label>设备类型</label>
              <span>{{ typeText }}</span>
            </div>
            <div class="info-item">
              <label>上次维护</label>
              <span>{{ equipment.lastMaintenance }}</span>
            </div>
            <div class="info-item" v-if="equipment.isAlarming">
              <label class="alarm-label">报警状态</label>
              <span class="alarm-text">异常</span>
            </div>
          </div>
        </div>
        
        <div class="info-section">
          <h4>设备描述</h4>
          <p class="description">{{ equipment.description }}</p>
        </div>
        
        <div class="info-section">
          <h4>传感器数据</h4>
          <div class="sensor-grid">
            <div class="sensor-item" :class="getSensorClass('temperature')">
              <div class="sensor-icon">🌡️</div>
              <div class="sensor-info">
                <label>温度</label>
                <span class="sensor-value">{{ sensorData.temperature.toFixed(1) }}°C</span>
              </div>
              <div class="sensor-bar">
                <div 
                  class="sensor-fill" 
                  :style="{ width: getSensorPercentage('temperature') + '%', backgroundColor: getSensorColor('temperature') }"
                ></div>
              </div>
            </div>
            
            <div class="sensor-item" :class="getSensorClass('pressure')">
              <div class="sensor-icon">📊</div>
              <div class="sensor-info">
                <label>压力</label>
                <span class="sensor-value">{{ sensorData.pressure.toFixed(2) }} MPa</span>
              </div>
              <div class="sensor-bar">
                <div 
                  class="sensor-fill" 
                  :style="{ width: getSensorPercentage('pressure') + '%', backgroundColor: getSensorColor('pressure') }"
                ></div>
              </div>
            </div>
            
            <div class="sensor-item" :class="getSensorClass('flowRate')">
              <div class="sensor-icon">💧</div>
              <div class="sensor-info">
                <label>流量</label>
                <span class="sensor-value">{{ sensorData.flowRate.toFixed(1) }} m³/h</span>
              </div>
              <div class="sensor-bar">
                <div 
                  class="sensor-fill" 
                  :style="{ width: getSensorPercentage('flowRate') + '%', backgroundColor: getSensorColor('flowRate') }"
                ></div>
              </div>
            </div>
            
            <div class="sensor-item" :class="getSensorClass('level')">
              <div class="sensor-icon">📏</div>
              <div class="sensor-info">
                <label>液位</label>
                <span class="sensor-value">{{ sensorData.level.toFixed(1) }} %</span>
              </div>
              <div class="sensor-bar">
                <div 
                  class="sensor-fill" 
                  :style="{ width: sensorData.level + '%', backgroundColor: getSensorColor('level') }"
                ></div>
              </div>
            </div>
            
            <div class="sensor-item" :class="getSensorClass('vibration')">
              <div class="sensor-icon">📳</div>
              <div class="sensor-info">
                <label>振动</label>
                <span class="sensor-value">{{ sensorData.vibration.toFixed(1) }} mm/s</span>
              </div>
              <div class="sensor-bar">
                <div 
                  class="sensor-fill" 
                  :style="{ width: getSensorPercentage('vibration') + '%', backgroundColor: getSensorColor('vibration') }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Equipment, EquipmentStatus, EquipmentType } from '@/types'

const props = defineProps<{
  equipment: Equipment | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const sensorData = computed(() => props.equipment?.sensorData || {
  temperature: 0,
  pressure: 0,
  flowRate: 0,
  level: 0,
  vibration: 0
})

const statusText = computed(() => {
  const statusMap: Record<EquipmentStatus, string> = {
    running: '运行中',
    stopped: '已停机',
    fault: '故障'
  }
  return props.equipment ? statusMap[props.equipment.status] : ''
})

const typeText = computed(() => {
  const typeMap: Record<EquipmentType, string> = {
    workshop: '生产车间',
    pipe: '输送管道',
    tank: '储罐',
    chimney: '烟囱',
    valve: '阀门',
    pump: '泵'
  }
  return props.equipment ? typeMap[props.equipment.type] : ''
})

const getSensorPercentage = (key: keyof typeof sensorData.value): number => {
  const ranges: Record<string, { min: number; max: number }> = {
    temperature: { min: 20, max: 120 },
    pressure: { min: 0, max: 2.5 },
    flowRate: { min: 0, max: 100 },
    level: { min: 0, max: 100 },
    vibration: { min: 0, max: 15 }
  }
  
  const range = ranges[key]
  const value = sensorData.value[key]
  return Math.min(100, Math.max(0, ((value - range.min) / (range.max - range.min)) * 100))
}

const getSensorColor = (key: string): string => {
  const percentages = getSensorPercentage(key)
  
  if (percentages > 80) {
    return '#ff4444'
  } else if (percentages > 60) {
    return '#ffa500'
  }
  return '#00ff88'
}

const getSensorClass = (key: string): string => {
  const percentages = getSensorPercentage(key)
  
  if (percentages > 80) {
    return 'warning'
  } else if (percentages > 60) {
    return 'caution'
  }
  return ''
}
</script>

<style scoped>
.equipment-panel {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 360px;
  max-height: calc(100vh - 40px);
  background: rgba(26, 26, 46, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 1000;
  backdrop-filter: blur(10px);
}

.panel-header {
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
}

.panel-header h3 {
  margin: 0;
  font-size: 16px;
  color: #fff;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.running {
  background: rgba(0, 255, 136, 0.2);
  color: #00ff88;
  border: 1px solid rgba(0, 255, 136, 0.3);
}

.status-badge.stopped {
  background: rgba(136, 136, 136, 0.2);
  color: #888888;
  border: 1px solid rgba(136, 136, 136, 0.3);
}

.status-badge.fault {
  background: rgba(255, 68, 68, 0.2);
  color: #ff4444;
  border: 1px solid rgba(255, 68, 68, 0.3);
  animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.close-btn {
  width: 28px;
  height: 28px;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border-radius: 50%;
  cursor: pointer;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.close-btn:hover {
  background: rgba(255, 68, 68, 0.3);
}

.panel-body {
  padding: 16px 20px;
  overflow-y: auto;
  flex: 1;
}

.info-section {
  margin-bottom: 20px;
}

.info-section:last-child {
  margin-bottom: 0;
}

.info-section h4 {
  margin: 0 0 12px 0;
  font-size: 13px;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-item label {
  font-size: 11px;
  color: #666;
  text-transform: uppercase;
}

.info-item span {
  font-size: 13px;
  color: #fff;
}

.alarm-label {
  color: #ff4444 !important;
}

.alarm-text {
  color: #ff4444 !important;
  font-weight: 600;
  animation: pulse 1s ease-in-out infinite;
}

.description {
  margin: 0;
  font-size: 13px;
  color: #ccc;
  line-height: 1.6;
}

.sensor-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.sensor-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.sensor-item.warning {
  background: rgba(255, 68, 68, 0.1);
  border-color: rgba(255, 68, 68, 0.2);
}

.sensor-item.caution {
  background: rgba(255, 165, 0, 0.1);
  border-color: rgba(255, 165, 0, 0.2);
}

.sensor-icon {
  font-size: 20px;
}

.sensor-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.sensor-info label {
  font-size: 11px;
  color: #666;
}

.sensor-value {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
}

.sensor-bar {
  width: 80px;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.sensor-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s, background-color 0.3s;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>
