import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { messageTemplatesApi } from '../services/api';

// Icons (inline SVG)
const PlusIcon = ({ className = "h-4 w-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const EditIcon = ({ className = "h-4 w-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
  </svg>
);

const Trash2Icon = ({ className = "h-4 w-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const SaveIcon = ({ className = "h-4 w-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </svg>
);

const XIcon = ({ className = "h-4 w-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const MessageSquareIcon = ({ className = "h-5 w-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const MessageTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    template_name: '',
    template_text: '',
  });

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const response = await messageTemplatesApi.getAll();
      setTemplates(response.data);
    } catch (error) {
      console.error('Failed to load templates:', error);
      toast.error('Failed to load message templates');
    }
  };

  const handleCreate = async () => {
    if (!formData.template_name || !formData.template_text) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await messageTemplatesApi.create(formData);
      setFormData({ template_name: '', template_text: '' });
      setIsCreating(false);
      loadTemplates();
      toast.success('Template created successfully!');
    } catch (error) {
      console.error('Failed to create template:', error);
      toast.error('Failed to create template');
    }
  };

  const handleUpdate = async (id) => {
    if (!formData.template_name || !formData.template_text) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await messageTemplatesApi.update(id, formData);
      setFormData({ template_name: '', template_text: '' });
      setEditingId(null);
      loadTemplates();
      toast.success('Template updated successfully!');
    } catch (error) {
      console.error('Failed to update template:', error);
      toast.error('Failed to update template');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this template?')) {
      return;
    }

    try {
      await messageTemplatesApi.delete(id);
      loadTemplates();
      toast.success('Template deleted successfully!');
    } catch (error) {
      console.error('Failed to delete template:', error);
      toast.error('Failed to delete template');
    }
  };

  const startEditing = (template) => {
    setEditingId(template.id);
    setFormData({
      template_name: template.template_name,
      template_text: template.template_text,
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setIsCreating(false);
    setFormData({ template_name: '', template_text: '' });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                <MessageSquareIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle>Message Templates</CardTitle>
                <CardDescription>Create reusable message templates with variables</CardDescription>
              </div>
            </div>
            {!isCreating && (
              <Button onClick={() => setIsCreating(true)}>
                <PlusIcon className="h-4 w-4 mr-2" />
                New Template
              </Button>
            )}
          </div>
        </CardHeader>

        {/* Create Form */}
        {isCreating && (
          <CardContent>
            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="text-lg">Create New Template</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="template_name">Template Name</Label>
                  <Input
                    id="template_name"
                    value={formData.template_name}
                    onChange={(e) => setFormData({ ...formData, template_name: e.target.value })}
                    placeholder="e.g., Welcome Message"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="template_text">
                    Template Text
                    <span className="text-xs text-muted-foreground ml-2">
                      (Use {`{{variable}}`} for placeholders)
                    </span>
                  </Label>
                  <Textarea
                    id="template_text"
                    value={formData.template_text}
                    onChange={(e) => setFormData({ ...formData, template_text: e.target.value })}
                    rows={5}
                    placeholder="Hello {{name}}! Welcome to our event 🎉"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCreate}>
                    <SaveIcon className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button onClick={cancelEditing} variant="outline">
                    <XIcon className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </CardContent>
        )}
      </Card>

      {/* Templates List */}
      <div className="space-y-4">
        {templates.length === 0 && !isCreating && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MessageSquareIcon className="h-16 w-16 text-muted-foreground mb-4" />
              <CardTitle className="mb-2">No templates yet</CardTitle>
              <CardDescription className="mb-4">Create your first template to get started!</CardDescription>
              <Button onClick={() => setIsCreating(true)}>
                <PlusIcon className="h-4 w-4 mr-2" />
                Create Template
              </Button>
            </CardContent>
          </Card>
        )}

        {templates.map((template) => (
          <Card key={template.id}>
            {editingId === template.id ? (
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor={`edit_name_${template.id}`}>Template Name</Label>
                    <Input
                      id={`edit_name_${template.id}`}
                      value={formData.template_name}
                      onChange={(e) => setFormData({ ...formData, template_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`edit_text_${template.id}`}>Template Text</Label>
                    <Textarea
                      id={`edit_text_${template.id}`}
                      value={formData.template_text}
                      onChange={(e) => setFormData({ ...formData, template_text: e.target.value })}
                      rows={5}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => handleUpdate(template.id)}>
                      <SaveIcon className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                    <Button onClick={cancelEditing} variant="outline">
                      <XIcon className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            ) : (
              <>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle>{template.template_name}</CardTitle>
                      {template.variables && template.variables.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          <span className="text-xs text-muted-foreground mr-1">Variables:</span>
                          {template.variables.map((variable, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {`{{${variable}}}`}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => startEditing(template)}
                        title="Edit"
                      >
                        <EditIcon />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(template.id)}
                        title="Delete"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2Icon />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted p-3 rounded-lg border">
                    <p className="text-sm whitespace-pre-wrap">{template.template_text}</p>
                  </div>
                </CardContent>
              </>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MessageTemplates;
