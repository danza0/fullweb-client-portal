'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDate } from '@/lib/utils'
import type { TutorialArticle } from '@/types'

const emptyForm = {
  title: '',
  slug: '',
  content: '',
  order: '0',
  published: true,
}

export default function TutorialsPage() {
  const [tutorials, setTutorials] = useState<TutorialArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTutorial, setEditingTutorial] = useState<TutorialArticle | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const fetchTutorials = useCallback(async () => {
    try {
      const res = await fetch('/api/tutorials')
      setTutorials(await res.json())
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchTutorials() }, [fetchTutorials])

  const openCreate = () => {
    setEditingTutorial(null)
    setForm(emptyForm)
    setError('')
    setDialogOpen(true)
  }

  const openEdit = (tutorial: TutorialArticle) => {
    setEditingTutorial(tutorial)
    setForm({
      title: tutorial.title,
      slug: tutorial.slug,
      content: tutorial.content,
      order: String(tutorial.order),
      published: tutorial.published,
    })
    setError('')
    setDialogOpen(true)
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    try {
      const url = editingTutorial ? `/api/tutorials/${editingTutorial.id}` : '/api/tutorials'
      const method = editingTutorial ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, order: parseInt(form.order) }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Failed to save')
        return
      }
      await fetchTutorials()
      setDialogOpen(false)
    } catch {
      setError('Failed to save tutorial')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this tutorial?')) return
    try {
      await fetch(`/api/tutorials/${id}`, { method: 'DELETE' })
      setTutorials((prev) => prev.filter((t) => t.id !== id))
    } catch {
      // silent
    }
  }

  const autoSlug = (title: string) =>
    title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

  return (
    <div>
      <PageHeader
        title="Tutorials"
        description="Knowledge base articles for clients"
        action={
          <Button onClick={openCreate} size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            New Article
          </Button>
        }
      />

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-lg" />
          ))}
        </div>
      ) : tutorials.length === 0 ? (
        <div className="text-center py-16 text-white/30">
          <p className="text-sm">No tutorials yet</p>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
          {tutorials.map((tutorial, index) => (
            <motion.div
              key={tutorial.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className="flex items-center justify-between p-4 rounded-lg border border-white/[0.07] bg-white/[0.02]"
            >
              <div>
                <div className="flex items-center gap-3">
                  <p className="text-sm font-medium text-white">{tutorial.title}</p>
                  <Badge variant={tutorial.published ? 'default' : 'secondary'} className="text-[10px]">
                    {tutorial.published ? 'Published' : 'Draft'}
                  </Badge>
                </div>
                <p className="text-xs text-white/40 mt-0.5">
                  /{tutorial.slug} · Created {formatDate(tutorial.createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(tutorial)}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-red-400" onClick={() => handleDelete(tutorial.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingTutorial ? 'Edit Tutorial' : 'New Tutorial'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Title *</Label>
              <Input
                value={form.title}
                onChange={(e) => {
                  const title = e.target.value
                  setForm({ ...form, title, slug: editingTutorial ? form.slug : autoSlug(title) })
                }}
                placeholder="How to update your website"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Slug *</Label>
                <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="how-to-update-website" />
              </div>
              <div className="space-y-1.5">
                <Label>Order</Label>
                <Input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Content *</Label>
              <Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={10} placeholder="Write your tutorial content here..." />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="published"
                checked={form.published}
                onChange={(e) => setForm({ ...form, published: e.target.checked })}
                className="rounded border-white/20"
              />
              <Label htmlFor="published">Published</Label>
            </div>
            {error && <p className="text-xs text-red-400">{error}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
