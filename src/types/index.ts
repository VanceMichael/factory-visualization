import * as THREE from 'three'

export type EquipmentStatus = 'running' | 'stopped' | 'fault'

export type EquipmentType = 
  | 'workshop'
  | 'pipe'
  | 'tank'
  | 'chimney'
  | 'valve'
  | 'pump'

export interface SensorData {
  temperature: number
  pressure: number
  flowRate: number
  level: number
  vibration: number
}

export interface Equipment {
  id: string
  name: string
  type: EquipmentType
  status: EquipmentStatus
  position: THREE.Vector3
  rotation?: THREE.Euler
  scale?: THREE.Vector3
  sensorData: SensorData
  description: string
  lastMaintenance: string
  isAlarming: boolean
  mesh?: THREE.Object3D
  originalMaterial?: THREE.Material | THREE.Material[]
  animationOffset?: number
}

export interface CameraView {
  name: string
  position: THREE.Vector3
  target: THREE.Vector3
}

export interface SceneConfig {
  backgroundColor: number
  ambientLightIntensity: number
  directionalLightIntensity: number
  showGrid: boolean
  showAxes: boolean
}

export interface ThreeCoreState {
  scene: THREE.Scene | null
  camera: THREE.PerspectiveCamera | null
  renderer: THREE.WebGLRenderer | null
  container: HTMLElement | null
}

export interface LightsState {
  ambientLight: THREE.AmbientLight | null
  directionalLight: THREE.DirectionalLight | null
  hemisphereLight: THREE.HemisphereLight | null
}

export interface AnimationState {
  isAnimating: boolean
  clock: THREE.Clock | null
  lastUpdateTime: number
  animationId: number | null
}

export interface EquipmentCreator {
  (equipment: Equipment, statusColors: Record<EquipmentStatus, number>): THREE.Object3D
}

export interface ResourceDisposable {
  dispose: () => void
}

export const STATUS_COLORS: Record<EquipmentStatus, number> = {
  running: 0x00ff88,
  stopped: 0x888888,
  fault: 0xff4444
}

export const ALARM_COLOR = 0xff0000

export const DEFAULT_SCENE_CONFIG: SceneConfig = {
  backgroundColor: 0x1a1a2e,
  ambientLightIntensity: 0.4,
  directionalLightIntensity: 0.8,
  showGrid: true,
  showAxes: false
}

export const DEFAULT_CAMERA_VIEWS: CameraView[] = [
  {
    name: 'overview',
    position: new THREE.Vector3(30, 30, 30),
    target: new THREE.Vector3(0, 0, 0)
  },
  {
    name: 'top',
    position: new THREE.Vector3(0, 40, 0.01),
    target: new THREE.Vector3(0, 0, 0)
  },
  {
    name: 'side',
    position: new THREE.Vector3(35, 5, 0),
    target: new THREE.Vector3(0, 5, 0)
  },
  {
    name: 'front',
    position: new THREE.Vector3(0, 10, 35),
    target: new THREE.Vector3(0, 5, 0)
  }
]
