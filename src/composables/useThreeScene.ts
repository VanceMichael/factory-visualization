import { ref, shallowRef, computed, onMounted, onUnmounted, type Ref, type ComputedRef } from 'vue'
import * as THREE from 'three'
import type { Equipment, SceneConfig, CameraView, ResourceDisposable } from '@/types'
import { DEFAULT_SCENE_CONFIG, DEFAULT_CAMERA_VIEWS } from '@/types'
import { useThreeCore, type ThreeCoreResult } from './useThreeCore'
import { useLights, type LightsResult } from './useLights'
import { useEquipmentState, type EquipmentStateResult } from './useEquipmentState'
import { useAnimationLoop, type AnimationLoopResult } from './useAnimationLoop'
import { createEquipmentFactory, type EquipmentFactoryResult } from '@/utils/equipmentFactory'

export interface ThreeSceneResult extends ResourceDisposable {
  scene: Ref<THREE.Scene | null>
  camera: Ref<THREE.PerspectiveCamera | null>
  renderer: Ref<THREE.WebGLRenderer | null>
  controls: ReturnType<typeof useThreeCore>['controls']
  equipmentList: Ref<Equipment[]>
  selectedEquipment: Ref<Equipment | null>
  currentView: Ref<string>
  isAnimating: Ref<boolean>
  sceneConfig: SceneConfig
  cameraViews: CameraView[]
  alarmEquipment: ComputedRef<Equipment[]>
  initScene: (container: HTMLElement) => void
  handleResize: () => void
  handleMouseClick: (event: MouseEvent) => void
  switchCameraView: (viewName: string) => void
  toggleAnimation: () => void
  updateAmbientLight: (intensity: number) => void
  updateDirectionalLight: (intensity: number) => void
  updateSceneConfig: (config: Partial<SceneConfig>) => void
}

export function useThreeScene(): ThreeSceneResult {
  const containerRef = shallowRef<HTMLElement | null>(null)
  const currentView = ref<string>('overview')

  const threeCore = useThreeCore(DEFAULT_SCENE_CONFIG)
  const lights = useLights()
  const equipmentState = useEquipmentState()
  
  const renderCallback = (): void => {
    if (threeCore.controls.value) {
      threeCore.controls.value.update()
    }
    if (threeCore.renderer.value && threeCore.scene.value && threeCore.camera.value) {
      threeCore.renderer.value.render(
        threeCore.scene.value, 
        threeCore.camera.value
      )
    }
  }

  const animationLoop = useAnimationLoop(
    renderCallback,
    equipmentState.equipmentList,
    equipmentState.updateEquipmentSensorData
  )

  const equipmentFactory = createEquipmentFactory()

  const raycaster = new THREE.Raycaster()
  const mouse = new THREE.Vector2()

  const addEquipmentToScene = (): void => {
    if (!threeCore.scene.value) return
    
    equipmentState.equipmentList.value.forEach(equipment => {
      const mesh = equipmentFactory.createEquipment(equipment)
      threeCore.scene.value!.add(mesh)
      equipment.mesh = mesh
    })
  }

  const initScene = (container: HTMLElement): void => {
    containerRef.value = container
    
    threeCore.initScene(container)
    
    if (threeCore.scene.value) {
      lights.createLights(threeCore.scene.value, {
        ambientLightIntensity: threeCore.sceneConfig.ambientLightIntensity,
        directionalLightIntensity: threeCore.sceneConfig.directionalLightIntensity
      })
      
      threeCore.scene.value.add(threeCore.createGround())
      
      if (threeCore.sceneConfig.showGrid) {
        threeCore.scene.value.add(threeCore.createGrid())
      }
      
      if (threeCore.sceneConfig.showAxes) {
        threeCore.scene.value.add(threeCore.createAxes())
      }
      
      addEquipmentToScene()
    }
    
    animationLoop.startAnimation()
  }

  const handleResize = (): void => {
    threeCore.handleResize()
  }

  const handleMouseClick = (event: MouseEvent): void => {
    if (!containerRef.value || !threeCore.camera.value || !threeCore.scene.value || !threeCore.renderer.value) return
    
    const rect = threeCore.renderer.value.domElement.getBoundingClientRect()
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
    
    raycaster.setFromCamera(mouse, threeCore.camera.value)
    
    const meshes: THREE.Object3D[] = []
    equipmentState.equipmentList.value.forEach(eq => {
      if (eq.mesh) {
        meshes.push(eq.mesh)
      }
    })
    
    const intersects = raycaster.intersectObjects(meshes, true)
    
    if (intersects.length > 0) {
      const foundEquipment = equipmentState.getEquipmentByMesh(intersects[0].object)
      equipmentState.selectEquipment(foundEquipment || null)
    } else {
      equipmentState.selectEquipment(null)
    }
  }

  const switchCameraView = (viewName: string): void => {
    const view = DEFAULT_CAMERA_VIEWS.find(v => v.name === viewName)
    if (!view) return
    
    currentView.value = viewName
    threeCore.switchCameraView(view)
  }

  const toggleAnimation = (): void => {
    animationLoop.toggleAnimation()
  }

  const updateAmbientLight = (intensity: number): void => {
    lights.updateAmbientLight(intensity)
  }

  const updateDirectionalLight = (intensity: number): void => {
    lights.updateDirectionalLight(intensity)
  }

  const updateSceneConfig = (config: Partial<SceneConfig>): void => {
    threeCore.updateSceneConfig(config)
  }

  const dispose = (): void => {
    animationLoop.dispose()
    lights.dispose()
    equipmentState.dispose()
    threeCore.dispose()
    containerRef.value = null
  }

  onMounted(() => {
    window.addEventListener('resize', handleResize)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
    dispose()
  })

  return {
    scene: threeCore.scene,
    camera: threeCore.camera,
    renderer: threeCore.renderer,
    controls: threeCore.controls,
    equipmentList: equipmentState.equipmentList,
    selectedEquipment: equipmentState.selectedEquipment,
    currentView,
    isAnimating: animationLoop.isAnimating,
    sceneConfig: threeCore.sceneConfig,
    cameraViews: DEFAULT_CAMERA_VIEWS,
    alarmEquipment: equipmentState.alarmEquipment,
    initScene,
    handleResize,
    handleMouseClick,
    switchCameraView,
    toggleAnimation,
    updateAmbientLight,
    updateDirectionalLight,
    updateSceneConfig,
    dispose
  }
}
