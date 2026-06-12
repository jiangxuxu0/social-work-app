'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Elder, ADLAssessment, ADL_QUESTIONS, ADL_SCORE_DESCRIPTIONS, ADL_GRADE_MAP } from '@/types'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Plus, BarChart3, X } from 'lucide-react'

export default function ADLPage() {
  const [elderly, setElderly] = useState<Elder[]>([])
  const [selectedElder, setSelectedElder] = useState<string>('')
  const [assessments, setAssessments] = useState<ADLAssessment[]>([])
  const [showModal, setShowModal] = useState(false)
  const [scores, setScores] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchElderly()
  }, [])

  useEffect(() => {
    if (selectedElder) {
      fetchAssessments()
    }
  }, [selectedElder])

  const fetchElderly = async () => {
    const supabase = createClient()
    const { data } = await supabase.from('elderly').select('*')
    setElderly(data || [])
    setLoading(false)
  }

  const fetchAssessments = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('assessments')
      .select('*')
      .eq('elder_id', selectedElder)
      .order('created_at', { ascending: false })
    if (error) {
      console.error('获取评估记录失败:', error)
    }
    setAssessments(data || [])
  }

  const calculateTotalScore = () => {
    return ADL_QUESTIONS.reduce((sum, q) => sum + (scores[q.id] || 1), 0)
  }

  const getGrade = (total: number) => {
    const thresholds = [10, 14, 19, 29, 40]
    for (let i = 0; i < thresholds.length; i++) {
      if (total <= thresholds[i]) {
        return ADL_GRADE_MAP[thresholds[i]]
      }
    }
    return ADL_GRADE_MAP[40]
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const assessmentData = ADL_QUESTIONS.reduce((acc, q) => {
      acc[q.id] = scores[q.id] || 1
      return acc
    }, {} as Record<string, number>)
    
    const total = Object.values(assessmentData).reduce((sum, val) => sum + val, 0)
    const gradeInfo = getGrade(total)
    
    const supabase = createClient()
    const { error } = await supabase.from('assessments').insert({
      elder_id: selectedElder,
      ...assessmentData,
      total_score: total,
      grade: gradeInfo.grade,
      created_at: new Date().toISOString(),
    })

    if (error) {
      console.error('保存评估失败:', error)
      alert('保存评估失败: ' + error.message)
      return
    }

    setShowModal(false)
    setScores({})
    fetchAssessments()
  }

  const totalScore = calculateTotalScore()
  const gradeInfo = getGrade(totalScore)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">ADL 日常生活能力评估</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            选择评估对象
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
                新建评估
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>ADL 评估 - {elderly.find(e => e.id === selectedElder)?.name}</CardTitle>
                <button
                  onClick={() => {
                    setShowModal(false)
                    setScores({})
                  }}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {ADL_QUESTIONS.map((question) => (
                    <div key={question.id} className="space-y-2">
                      <Label>{question.label}</Label>
                      <Select
                        value={scores[question.id] || 1}
                        onChange={(e) => setScores(prev => ({ ...prev, [question.id]: parseInt(e.target.value) }))}
                      >
                        {[1, 2, 3, 4].map((score) => (
                          <option key={score} value={score}>
                            {score}分 - {ADL_SCORE_DESCRIPTIONS[score]}
                          </option>
                        ))}
                      </Select>
                    </div>
                  ))}
                </div>

                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-lg font-medium">
                    <span>总分</span>
                    <span className="text-blue-600">{totalScore}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">评估等级</span>
                    <span className="font-medium">{gradeInfo.grade}</span>
                  </div>
                  <p className="text-sm text-gray-500">{gradeInfo.description}</p>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => {
                    setShowModal(false)
                    setScores({})
                  }}>
                    取消
                  </Button>
                  <Button type="submit">保存评估</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {selectedElder && (
        <Card>
          <CardHeader>
            <CardTitle>评估历史记录</CardTitle>
          </CardHeader>
          <CardContent>
            {assessments.length === 0 ? (
              <p className="text-gray-500 text-center py-4">暂无评估记录</p>
            ) : (
              <div className="space-y-3">
                {assessments.map((assessment) => (
                  <div key={assessment.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">评估日期: {assessment.created_at.split('T')[0]}</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        assessment.grade === '完全自理' ? 'bg-green-100 text-green-700' :
                        assessment.grade === '轻度依赖' ? 'bg-blue-100 text-blue-700' :
                        assessment.grade === '中度依赖' ? 'bg-yellow-100 text-yellow-700' :
                        assessment.grade === '重度依赖' ? 'bg-orange-100 text-orange-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {assessment.grade}
                      </span>
                    </div>
                    <div className="flex justify-end">
                      <span className="text-gray-600">总分: {assessment.total_score}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
