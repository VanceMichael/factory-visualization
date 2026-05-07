import { Equipment, SensorData } from '@/types'
import * as THREE from 'three'

const generateSensorData = (status: 'running' | 'stopped' | 'fault'): SensorData => {
  if (status === 'stopped') {
    return {
      temperature: 25,
      pressure: 0,
      flowRate: 0,
      level: 50,
      vibration: 0
    }
  }
  
  const baseTemp = status === 'fault' ? 95 : 65
  const basePressure = status === 'fault' ? 1.8 : 1.2
  const baseVibration = status === 'fault' ? 12 : 3
  
  return {
    temperature: baseTemp + Math.random() * 10,
    pressure: basePressure + Math.random() * 0.2,
    flowRate: status === 'fault' ? 20 + Math.random() * 10 : 80 + Math.random() * 20,
    level: 40 + Math.random() * 40,
    vibration: baseVibration + Math.random() * 2
  }
}

export const factoryEquipment: Equipment[] = [
  {
    id: 'workshop-1',
    name: '主生产车间 A',
    type: 'workshop',
    status: 'running',
    position: new THREE.Vector3(-8, 0, -8),
    sensorData: generateSensorData('running'),
    description: '主要生产装置，包含反应釜和精馏塔',
    lastMaintenance: '2026-03-15',
    isAlarming: false
  },
  {
    id: 'workshop-2',
    name: '辅助生产车间 B',
    type: 'workshop',
    status: 'running',
    position: new THREE.Vector3(-8, 0, 8),
    sensorData: generateSensorData('running'),
    description: '辅助生产装置，原料预处理',
    lastMaintenance: '2026-04-01',
    isAlarming: false
  },
  {
    id: 'workshop-3',
    name: '备用车间 C',
    type: 'workshop',
    status: 'stopped',
    position: new THREE.Vector3(8, 0, -8),
    sensorData: generateSensorData('stopped'),
    description: '备用生产装置，待维护',
    lastMaintenance: '2026-02-20',
    isAlarming: false
  },
  {
    id: 'tank-1',
    name: '原料储罐 #1',
    type: 'tank',
    status: 'running',
    position: new THREE.Vector3(12, 0, 0),
    sensorData: generateSensorData('running'),
    description: '立式圆柱形原料储罐，容量500立方米',
    lastMaintenance: '2026-03-20',
    isAlarming: false
  },
  {
    id: 'tank-2',
    name: '产品储罐 #2',
    type: 'tank',
    status: 'running',
    position: new THREE.Vector3(15, 0, 5),
    sensorData: generateSensorData('running'),
    description: '卧式产品储罐，容量300立方米',
    lastMaintenance: '2026-03-25',
    isAlarming: false
  },
  {
    id: 'tank-3',
    name: '废液储罐 #3',
    type: 'tank',
    status: 'fault',
    position: new THREE.Vector3(15, 0, -5),
    sensorData: generateSensorData('fault'),
    description: '废液处理储罐，检测到异常振动',
    lastMaintenance: '2026-02-10',
    isAlarming: true
  },
  {
    id: 'chimney-1',
    name: '排气烟囱 #1',
    type: 'chimney',
    status: 'running',
    position: new THREE.Vector3(-12, 0, 0),
    sensorData: generateSensorData('running'),
    description: '主排气烟囱，配备废气处理系统',
    lastMaintenance: '2026-04-05',
    isAlarming: false
  },
  {
    id: 'chimney-2',
    name: '备用烟囱 #2',
    type: 'chimney',
    status: 'stopped',
    position: new THREE.Vector3(-15, 0, 5),
    sensorData: generateSensorData('stopped'),
    description: '备用排气烟囱',
    lastMaintenance: '2026-01-15',
    isAlarming: false
  },
  {
    id: 'pipe-1',
    name: '主输送管道 A',
    type: 'pipe',
    status: 'running',
    position: new THREE.Vector3(-3, 0, 0),
    rotation: new THREE.Euler(0, Math.PI / 2, 0),
    sensorData: generateSensorData('running'),
    description: '连接原料储罐与生产车间的主管道',
    lastMaintenance: '2026-03-10',
    isAlarming: false,
    animationOffset: 0
  },
  {
    id: 'pipe-2',
    name: '分支管道 B',
    type: 'pipe',
    status: 'running',
    position: new THREE.Vector3(3, 0, 0),
    sensorData: generateSensorData('running'),
    description: '产品输送分支管道',
    lastMaintenance: '2026-03-12',
    isAlarming: false,
    animationOffset: 0.5
  },
  {
    id: 'valve-1',
    name: '控制阀 V-101',
    type: 'valve',
    status: 'running',
    position: new THREE.Vector3(0, 0, 0),
    sensorData: generateSensorData('running'),
    description: '主管道流量控制阀',
    lastMaintenance: '2026-04-10',
    isAlarming: false
  },
  {
    id: 'valve-2',
    name: '紧急切断阀 V-102',
    type: 'valve',
    status: 'stopped',
    position: new THREE.Vector3(5, 0, 3),
    sensorData: generateSensorData('stopped'),
    description: '紧急安全切断阀',
    lastMaintenance: '2026-03-05',
    isAlarming: false
  },
  {
    id: 'pump-1',
    name: '进料泵 P-101',
    type: 'pump',
    status: 'running',
    position: new THREE.Vector3(5, 0, -5),
    sensorData: generateSensorData('running'),
    description: '原料进料离心泵',
    lastMaintenance: '2026-03-28',
    isAlarming: false
  },
  {
    id: 'pump-2',
    name: '循环泵 P-102',
    type: 'pump',
    status: 'fault',
    position: new THREE.Vector3(5, 0, 5),
    sensorData: generateSensorData('fault'),
    description: '冷却循环泵，温度异常过高',
    lastMaintenance: '2026-02-01',
    isAlarming: true
  }
]

export const updateEquipmentSensorData = (equipment: Equipment): Equipment => {
  const newSensorData = generateSensorData(equipment.status)
  return {
    ...equipment,
    sensorData: newSensorData
  }
}
