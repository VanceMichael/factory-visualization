<template>
  <div class="factory-visualization">
    <div 
      ref="containerRef" 
      class="scene-container"
      @click="handleSceneClick"
    ></div>
    
    <ControlPanel
      :cameraViews="cameraViews"
      :currentView="currentView"
      :isAnimating="isAnimating"
      :equipmentList="equipmentList"
      :alarmEquipment="alarmEquipment"
      @switchView="handleSwitchView"
      @toggleAnimation="handleToggleAnimation"
      @selectEquipment="handleSelectEquipment"
    />
    
    <EquipmentInfoPanel
      v-if="selectedEquipment"
      :equipment="selectedEquipment"
      @close="handleClosePanel"
    />
    
    <div class="scene-hint">
      <p>鼠标拖拽旋转 | 滚轮缩放 | 点击设备查看详情</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch, shallowRef } from 'vue'
import * as THREE from 'three'
import * as dat from 'dat.gui'
import { useThreeScene } from '@/composables/useThreeScene'
import ControlPanel from './ControlPanel.vue'
import EquipmentInfoPanel from './EquipmentInfoPanel.vue'
import type { Equipment } from '@/types'

const containerRef = shallowRef<HTMLElement | null>(null)

const {
  cameraViews,
  currentView,
  isAnimating,
  equipmentList,
  selectedEquipment,
  alarmEquipment,
  sceneConfig,
  switchCameraView,
  toggleAnimation,
  handleMouseClick,
  scene,
  camera,
  renderer,
  controls,
  initScene,
  updateAmbientLight,
  updateDirectionalLight,
  updateSceneConfig
} = useThreeScene()

const guiInstance = ref<dat.GUI | null>(null)

const handleSceneClick = (event: MouseEvent): void => {
  handleMouseClick(event)
}

const handleSwitchView = (viewName: string): void => {
  switchCameraView(viewName)
}

const handleToggleAnimation = (): void => {
  toggleAnimation()
}

const handleSelectEquipment = (equipment: Equipment): void => {
  selectedEquipment.value = equipment
}

const handleClosePanel = (): void => {
  selectedEquipment.value = null
}

const initGUI = (): void => {
  if (guiInstance.value) {
    guiInstance.value.destroy()
  }
  
  guiInstance.value = new dat.GUI({ 
    title: '场景设置',
    width: 280
  })
  
  guiInstance.value.domElement.style.position = 'fixed'
  guiInstance.value.domElement.style.top = '20px'
  guiInstance.value.domElement.style.right = '400px'
  guiInstance.value.domElement.style.zIndex = '999'
  
  const viewFolder = guiInstance.value.addFolder('视角设置')
  viewFolder.add(
    { view: currentView.value }, 
    'view', 
    ['overview', 'top', 'side', 'front']
  ).name('当前视角').onChange((value: string) => {
    switchCameraView(value)
  })
  
  watch(currentView, (newValue) => {
    const viewControl = viewFolder.__controllers.find(c => c.property === 'view')
    if (viewControl) {
      viewControl.setValue(newValue)
    }
  })
  
  const displayFolder = guiInstance.value.addFolder('显示设置')
  displayFolder.addColor(sceneConfig, 'backgroundColor')
    .name('背景颜色')
    .onChange((color: number | string) => {
      if (scene.value) {
        const colorValue = typeof color === 'number' ? color : parseInt(color.replace('#', ''), 16)
        updateSceneConfig({ backgroundColor: colorValue })
      }
    })
  
  displayFolder.add(sceneConfig, 'ambientLightIntensity', 0, 1, 0.1)
    .name('环境光强度')
    .onChange((value: number) => {
      updateAmbientLight(value)
    })
  
  displayFolder.add(sceneConfig, 'directionalLightIntensity', 0, 2, 0.1)
    .name('主光源强度')
    .onChange((value: number) => {
      updateDirectionalLight(value)
    })
  
  displayFolder.add(sceneConfig, 'showGrid')
    .name('显示网格')
    .onChange((value: boolean) => {
      if (scene.value) {
        const grid = scene.value.children.find(
          (child: THREE.Object3D) => child instanceof THREE.GridHelper
        )
        if (grid) {
          grid.visible = value
        }
      }
    })
  
  displayFolder.add(sceneConfig, 'showAxes')
    .name('显示坐标轴')
    .onChange((value: boolean) => {
      if (scene.value) {
        const axes = scene.value.children.find(
          (child: THREE.Object3D) => child instanceof THREE.AxesHelper
        )
        if (axes) {
          axes.visible = value
        } else if (value) {
          const newAxes = new THREE.AxesHelper(10)
          scene.value.add(newAxes)
        }
      }
    })
  
  const animationFolder = guiInstance.value.addFolder('动画控制')
  const animationProxy = { playing: isAnimating.value }
  let isUpdatingFromInternal = false
  
  const updateAnimationFromGUI = (value: boolean): void => {
    if (isUpdatingFromInternal) {
      return
    }
    if (isAnimating.value !== value) {
      isAnimating.value = value
    }
  }
  
  animationFolder.add(
    animationProxy, 
    'playing'
  ).name('播放动画').onChange(updateAnimationFromGUI)
  
  watch(isAnimating, (newValue) => {
    const playControl = animationFolder.__controllers.find(c => c.property === 'playing')
    if (playControl && animationProxy.playing !== newValue) {
      isUpdatingFromInternal = true
      animationProxy.playing = newValue
      playControl.setValue(newValue)
      isUpdatingFromInternal = false
    }
  })
  
  const cameraFolder = guiInstance.value.addFolder('相机控制')
  cameraFolder.add(
    { freeMode: true }, 
    'freeMode'
  ).name('自由漫游模式')
  .onChange((value: boolean) => {
    if (controls.value) {
      controls.value.enabled = value
    }
  })
  
  if (camera.value) {
    const camPos = {
      x: camera.value.position.x,
      y: camera.value.position.y,
      z: camera.value.position.z
    }
    
    const updateCamera = (): void => {
      if (camera.value) {
        camPos.x = camera.value.position.x
        camPos.y = camera.value.position.y
        camPos.z = camera.value.position.z
      }
    }
    
    cameraFolder.add(camPos, 'x', -50, 50, 1)
      .name('相机 X')
      .listen()
      .onChange((value: number) => {
        if (camera.value) {
          camera.value.position.x = value
        }
      })
    
    cameraFolder.add(camPos, 'y', 0, 80, 1)
      .name('相机 Y')
      .listen()
      .onChange((value: number) => {
        if (camera.value) {
          camera.value.position.y = value
        }
      })
    
    cameraFolder.add(camPos, 'z', -50, 50, 1)
      .name('相机 Z')
      .listen()
      .onChange((value: number) => {
        if (camera.value) {
          camera.value.position.z = value
        }
      })
  }
  
  viewFolder.open()
  displayFolder.open()
  animationFolder.open()
}

onMounted(() => {
  const checkContainerReady = setInterval(() => {
    if (containerRef.value) {
      clearInterval(checkContainerReady)
      initScene(containerRef.value)
      
      setTimeout(() => {
        if (scene.value && camera.value) {
          initGUI()
        }
      }, 100)
    }
  }, 100)
})

onUnmounted(() => {
  if (guiInstance.value) {
    guiInstance.value.destroy()
    guiInstance.value = null
  }
})
</script>

<style scoped>
.factory-visualization {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  position: relative;
  background: #1a1a2e;
}

.scene-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.scene-hint {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(26, 26, 46, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 8px 20px;
  z-index: 1000;
  backdrop-filter: blur(10px);
}

.scene-hint p {
  margin: 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}
</style>
