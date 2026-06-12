'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Elder, HEALTH_STATUS_MAP } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Edit2, Trash2, Search, X } from 'lucide-react'

export default function ElderlyPage() {
  const [elderly, setElderly] = useState<Elder[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingElder, setEditingElder] = useState<Elder | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    admission_date: '',
    health_status: 'good' as 'excellent' | 'good' | 'fair' | 'poor',
    social_worker_id: '',
  })

  useEffect(() => {
    fetchElderly()
  }, [])

  const fetchElderly = async () => {
    setLoading(true)
    const supabase = createClient()
    const { data } = await supabase.from('elderly').select('*').order('created_at', { ascending: false })
    setElderly(data || [])
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    
    if (editingElder) {
      await supabase.from('elderly').update({
        ...formData,
        age: parseInt(formData.age),
        updated_at: new Date().toISOString(),
      }).eq('id', editingElder.id)
    } else {
      await supabase.from('elderly').insert({
        ...formData,
        age: parseInt(formData.age),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
    }
    
    setShowModal(false)
    setEditingElder(null)
    setFormData({
      name: '',
      age: '',
      admission_date: '',
      health_status: 'good',
      social_worker_id: '',
    })
    fetchElderly()
  }

  const handleDelete = async (id: string) => {
    if (confirm('确定要删除这条记录吗？')) {
      const supabase = createClient()
      await supabase.from('elderly').delete().eq('id', id)
      fetchElderly()
    }
  }

  const handleEdit = (elder: Elder) => {
    setEditingElder(elder)
    setFormData({
      name: elder.name,
      age: elder.age.toString(),
      admission_date: elder.admission_date.split('T')[0],
      health_status: elder.health_status,
      social_worker_id: elder.social_worker_id,
    })
    setShowModal(true)
  }

  const filteredElderly = elderly.filter(e =>
    e.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">老人档案管理</h2>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          添加老人
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="搜索老人姓名..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full text-center py-8">加载中...</div>
        ) : filteredElderly.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">暂无数据</div>
        ) : (
          filteredElderly.map((elder) => (
            <Card key={elder.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{elder.name}</CardTitle>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(elder)}
                      className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(elder.id)}
                      className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">年龄</span>
                  <span>{elder.age} 岁</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">入住日期</span>
                  <span>{elder.admission_date.split('T')[0]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">健康状况</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    elder.health_status === 'excellent' ? 'bg-green-100 text-green-700' :
                    elder.health_status === 'good' ? 'bg-blue-100 text-blue-700' :
                    elder.health_status === 'fair' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {HEALTH_STATUS_MAP[elder.health_status]}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">负责社工</span>
                  <span>{elder.social_worker_id || '-'}</span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{editingElder ? '编辑老人信息' : '添加老人'}</CardTitle>
                <button
                  onClick={() => {
                    setShowModal(false)
                    setEditingElder(null)
                  }}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">姓名 *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age">年龄 *</Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admission_date">入住日期 *</Label>
                  <Input
                    id="admission_date"
                    type="date"
                    value={formData.admission_date}
                    onChange={(e) => setFormData({ ...formData, admission_date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="health_status">健康状况 *</Label>
                  <Select
                    id="health_status"
                    value={formData.health_status}
                    onChange={(e) => setFormData({ ...formData, health_status: e.target.value as any })}
                  >
                    <option value="excellent">优秀</option>
                    <option value="good">良好</option>
                    <option value="fair">一般</option>
                    <option value="poor">较差</option>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="social_worker_id">负责社工</Label>
                  <Input
                    id="social_worker_id"
                    value={formData.social_worker_id}
                    onChange={(e) => setFormData({ ...formData, social_worker_id: e.target.value })}
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setShowModal(false)}>
                    取消
                  </Button>
                  <Button type="submit">
                    {editingElder ? '保存修改' : '添加'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
