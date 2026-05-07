<template>
  <div class="control-panel">
    <div class="control-section">
      <h3>视角切换</h3>
      <div class="view-buttons">
        <button 
          v-for="view in cameraViews" 
          :key="view.name"
          :class="['view-btn', { active: currentView === view.name }]"
          @click="switchView(view.name)"
        >
          {{ getViewLabel(view.name) }}
        </button>
      </div>
    </div>
    
    <div class="control-section">
      <h3>设备状态</h3>
      <div class="status-summary">
        <div class="status-item running">
          <span class="status-indicator"></span>
          <span class="status-label">运行中</span>
          <span class="status-count">{{ runningCount }}</span>
        </div>
        <div class="status-item stopped">
          <span class="status-indicator"></span>
          <span class="status-label">已停机</span>
          <span class="status-count">{{ stoppedCount }}</span>
        </div>
        <div class="status-item fault" :class="{ blinking: alarmCount > 0 }">
          <span class="status-indicator"></span>
          <span class="status-label">故障</span>
          <span class="status-count">{{ alarmCount }}</span>
        </div>
      </div>
    </div>
    
    <div class="control-section" v-if="alarmEquipment.length > 0">
      <h3 class="alarm-title">
        <span class="alarm-icon">⚠️</span>
        报警设备
      </h3>
      <div class="alarm-list">
        <div 
          v-for="eq in alarmEquipment" 
          :key="eq.id"
          class="alarm-item"
          @click="$emit('selectEquipment', eq)"
        >
          <span class="alarm-name">{{ eq.name }}</span>
          <span class="alarm-status">异常</span>
        </div>
      </div>
    </div>
    
    <div class="control-section">
      <h3>动画控制</h3>
      <div class="animation-controls">
        <button 
          :class="['anim-btn', { active: isAnimating }]"
          @click="$emit('toggleAnimation')"
        >
          {{ isAnimating ? '暂停动画' : '继续动画' }}
        </button>
      </div>
    </div>
    
    <div class="control-section">
      <h3>图例说明</h3>
      <div class="legend-grid">
        <div class="legend-item">
          <div class="legend-icon workshop"></div>
          <span>生产车间</span>
        </div>
        <div class="legend-item">
          <div class="legend-icon tank"></div>
          <span>储罐</span>
        </div>
        <div class="legend-item">
          <div class="legend-icon chimney"></div>
          <span>烟囱</span>
        </div>
        <div class="legend-item">
          <div class="legend-icon pipe"></div>
          <span>管道</span>
        </div>
        <div class="legend-item">
          <div class="legend-icon valve"></div>
          <span>阀门</span>
        </div>
        <div class="legend-item">
          <div class="legend-icon pump"></div>
          <span>泵</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { CameraView, Equipment } from '@/types'

const props = defineProps<{
  cameraViews: CameraView[]
  currentView: string
  isAnimating: boolean
  equipmentList: Equipment[]
  alarmEquipment: Equipment[]
}>()

const emit = defineEmits<{
  (e: 'switchView', viewName: string): void
  (e: 'toggleAnimation'): void
  (e: 'selectEquipment', equipment: Equipment): void
}>()

const runningCount = computed(() => 
  props.equipmentList.filter(eq => eq.status === 'running').length
)

const stoppedCount = computed(() => 
  props.equipmentList.filter(eq => eq.status === 'stopped').length
)

const alarmCount = computed(() => 
  props.equipmentList.filter(eq => eq.status === 'fault').length
)

const getViewLabel = (name: string): string => {
  const labels: Record<string, string> = {
    overview: '全景',
    top: '俯视',
    side: '侧视',
    front: '正视'
  }
  return labels[name] || name
}

const switchView = (name: string) => {
  emit('switchView', name)
}
</script>

<style scoped>
.control-panel {
  position: fixed;
  top: 20px;
  left: 20px;
  width: 280px;
  background: rgba(26, 26, 46, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  z-index: 1000;
  backdrop-filter: blur(10px);
}

.control-section {
  margin-bottom: 20px;
}

.control-section:last-child {
  margin-bottom: 0;
}

.control-section h3 {
  margin: 0 0 12px 0;
  font-size: 13px;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.view-buttons {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.view-btn {
  padding: 8px 4px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  color: #ccc;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}

.view-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
}

.view-btn.active {
  background: rgba(0, 255, 136, 0.2);
  border-color: rgba(0, 255, 136, 0.3);
  color: #00ff88;
}

.status-summary {
  display: flex;
  gap: 12px;
}

.status-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 8px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.status-item.running {
  border-color: rgba(0, 255, 136, 0.2);
}

.status-item.running .status-indicator {
  background: #00ff88;
}

.status-item.stopped .status-indicator {
  background: #888888;
}

.status-item.fault {
  border-color: rgba(255, 68, 68, 0.2);
}

.status-item.fault .status-indicator {
  background: #ff4444;
}

.status-item.blinking .status-indicator {
  animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.status-label {
  font-size: 11px;
  color: #888;
}

.status-count {
  font-size: 18px;
  font-weight: 600;
  color: #fff;
}

.alarm-title {
  color: #ff4444 !important;
  display: flex;
  align-items: center;
  gap: 6px;
}

.alarm-icon {
  animation: pulse 1s ease-in-out infinite;
}

.alarm-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.alarm-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background: rgba(255, 68, 68, 0.1);
  border: 1px solid rgba(255, 68, 68, 0.2);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.alarm-item:hover {
  background: rgba(255, 68, 68, 0.2);
}

.alarm-name {
  font-size: 12px;
  color: #fff;
}

.alarm-status {
  font-size: 11px;
  color: #ff4444;
  font-weight: 600;
}

.animation-controls {
  display: flex;
  gap: 8px;
}

.anim-btn {
  flex: 1;
  padding: 10px 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  color: #ccc;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
}

.anim-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.anim-btn.active {
  background: rgba(0, 255, 136, 0.2);
  border-color: rgba(0, 255, 136, 0.3);
  color: #00ff88;
}

.legend-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.legend-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 6px;
}

.legend-icon {
  width: 20px;
  height: 20px;
  border-radius: 4px;
}

.legend-icon.workshop {
  background: linear-gradient(135deg, #4a5568, #2d3748);
}

.legend-icon.tank {
  background: linear-gradient(135deg, #718096, #4a5568);
  border-radius: 50%;
}

.legend-icon.chimney {
  background: linear-gradient(135deg, #8b4513, #a0522d);
  border-radius: 2px;
}

.legend-icon.pipe {
  background: linear-gradient(90deg, #5a6a7a, #4a5568);
  height: 8px;
  margin: 6px 0;
}

.legend-icon.valve {
  background: linear-gradient(135deg, #4a5568, #2d3748);
  border-radius: 50%;
}

.legend-icon.pump {
  background: linear-gradient(135deg, #4a5568, #718096);
}

.legend-item span {
  font-size: 11px;
  color: #888;
}
</style>
