'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Elder, ServiceRecord } from '@/types'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Plus, Calendar, Bell, X, FileText, Clock } from 'lucide-react'
import { format, isFuture } from 'date-fns'
import { zhCN } from 'date-fns/locale'

export default function TimelinePage() {
  const [elderly, setElderly] = useState<Elder[]>([])
  const [selectedElder, setSelectedElder] = useState<string>('')
  const [records, setRecords] = useState<ServiceRecord[]>([])
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    visit_time: '',
    content: '',
    next_visit_reminder: '',
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchElderly()
  }, [])

  useEffect(() => {
    if (selectedElder) {
      fetchRecords()
    }
  }, [selectedElder])

  const fetchElderly = async () => {
    const supabase = createClient()
    const { data } = await supabase.from('elderly').select('*')
    setElderly(data || [])
    setLoading(false)
  }

  const fetchRecords = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('service_records')
      .select('*')
      .eq('elder_id', selectedElder)
      .order('visit_time', { ascending: false })
    if (error) {
      console.error('获取服务记录失败:', error)
    }
    setRecords(data || [])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    const { error } = await supabase.from('service_records').insert({
      elder_id: selectedElder,
      social_worker_id: '当前用户',
      visit_time: new Date(formData.visit_time).toISOString(),
      content: formData.content,
      next_visit_reminder: formData.next_visit_reminder ? new Date(formData.next_visit_reminder).toISOString() : null,
      created_at: new Date().toISOString(),
    })

    if (error) {
      console.error('保存服务记录失败:', error)
      alert('保存服务记录失败: ' + error.message)
      return
    }

    setShowModal(false)
    setFormData({
      visit_time: '',
      content: '',
      next_visit_reminder: '',
    })
    fetchRecords()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">服务记录时间轴</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            选择服务对象
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Select
              value={selectedElder}
              onChange={(e) => setSelectedElder(e.target.value)}
              className="w-64"
            >
              <option value="">请选择老人</option>
              {elderly.map((elder) => (
                <option key={elder.id} value={elder.id}>
                  {elder.name} ({elder.age}岁)
                </option>
              ))}
            </Select>
            {selectedElder && (
              <Button onClick={() => setShowModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                添加服务记录
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>添加服务记录</CardTitle>
                <button
                  onClick={() => {
                    setShowModal(false)
                    setFormData({ visit_time: '', content: '', next_visit_reminder: '' })
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
                  <Label htmlFor="visit_time">服务时间 *</Label>
                  <Input
                    id="visit_time"
                    type="datetime-local"
                    value={formData.visit_time}
                    onChange={(e) => setFormData({ ...formData, visit_time: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">服务内容 *</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="请记录本次服务的内容..."
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="next_visit_reminder">下次服务提醒</Label>
                  <Input
                    id="next_visit_reminder"
                    type="date"
                    value={formData.next_visit_reminder}
                    onChange={(e) => setFormData({ ...formData, next_visit_reminder: e.target.value })}
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setShowModal(false)}>
                    取消
                  </Button>
                  <Button type="submit">保存记录</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {selectedElder && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              服务时间轴
            </CardTitle>
          </CardHeader>
          <CardContent>
            {records.length === 0 ? (
              <p className="text-gray-500 text-center py-8">暂无服务记录</p>
            ) : (
              <div className="relative">
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                <div className="space-y-4">
                  {records.map((record) => (
                    <div key={record.id} className="relative pl-16">
                      <div className={`absolute left-4 top-1 w-5 h-5 rounded-full border-4 flex items-center justify-center ${
                        isFuture(new Date(record.visit_time)) 
                          ? 'border-blue-200 bg-blue-500' 
                          : 'border-green-200 bg-green-500'
                      }`}>
                        <FileText className="w-3 h-3 text-white" />
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <span className="font-medium">
                            {format(new Date(record.visit_time), 'yyyy年MM月dd日 HH:mm', { locale: zhCN })}
                          </span>
                          {record.next_visit_reminder && isFuture(new Date(record.next_visit_reminder)) && (
                            <span className="flex items-center text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">
                              <Bell className="w-3 h-3 mr-1" />
                              下次提醒: {format(new Date(record.next_visit_reminder), 'MM月dd日', { locale: zhCN })}
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed">{record.content}</p>
                        <p className="text-xs text-gray-400 mt-2">服务社工: {record.social_worker_id}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
