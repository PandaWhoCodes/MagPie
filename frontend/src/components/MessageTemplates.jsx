import { useState, useEffect } from 'react';
import { messageTemplatesApi } from '../services/api';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';

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
      alert('Failed to load message templates');
    }
  };

  const handleCreate = async () => {
    if (!formData.template_name || !formData.template_text) {
      alert('Please fill in all fields');
      return;
    }

    try {
      await messageTemplatesApi.create(formData);
      setFormData({ template_name: '', template_text: '' });
      setIsCreating(false);
      loadTemplates();
    } catch (error) {
      console.error('Failed to create template:', error);
      alert('Failed to create template');
    }
  };

  const handleUpdate = async (id) => {
    if (!formData.template_name || !formData.template_text) {
      alert('Please fill in all fields');
      return;
    }

    try {
      await messageTemplatesApi.update(id, formData);
      setFormData({ template_name: '', template_text: '' });
      setEditingId(null);
      loadTemplates();
    } catch (error) {
      console.error('Failed to update template:', error);
      alert('Failed to update template');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this template?')) {
      return;
    }

    try {
      await messageTemplatesApi.delete(id);
      loadTemplates();
    } catch (error) {
      console.error('Failed to delete template:', error);
      alert('Failed to delete template');
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
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Message Templates</h2>
        {!isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus size={20} />
            New Template
          </button>
        )}
      </div>

      {/* Create Form */}
      {isCreating && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Create New Template</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Template Name</label>
              <input
                type="text"
                value={formData.template_name}
                onChange={(e) => setFormData({ ...formData, template_name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Welcome Message"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Template Text
                <span className="text-xs text-gray-500 ml-2">
                  (Use {`{{variable}}`} for placeholders)
                </span>
              </label>
              <textarea
                value={formData.template_text}
                onChange={(e) => setFormData({ ...formData, template_text: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={5}
                placeholder="Hello {{name}}! Welcome to our event 🎉"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCreate}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                <Save size={16} />
                Save
              </button>
              <button
                onClick={cancelEditing}
                className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
              >
                <X size={16} />
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Templates List */}
      <div className="space-y-4">
        {templates.length === 0 && !isCreating && (
          <p className="text-gray-500 text-center py-8">
            No templates yet. Create your first template to get started!
          </p>
        )}

        {templates.map((template) => (
          <div key={template.id} className="border rounded-lg p-4">
            {editingId === template.id ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Template Name</label>
                  <input
                    type="text"
                    value={formData.template_name}
                    onChange={(e) => setFormData({ ...formData, template_name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Template Text</label>
                  <textarea
                    value={formData.template_text}
                    onChange={(e) => setFormData({ ...formData, template_text: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={5}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpdate(template.id)}
                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  >
                    <Save size={16} />
                    Save
                  </button>
                  <button
                    onClick={cancelEditing}
                    className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                  >
                    <X size={16} />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800">{template.template_name}</h3>
                    {template.variables && template.variables.length > 0 && (
                      <div className="mt-1">
                        <span className="text-xs text-gray-500">Variables: </span>
                        {template.variables.map((variable, idx) => (
                          <span
                            key={idx}
                            className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-1"
                          >
                            {`{{${variable}}}`}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEditing(template)}
                      className="text-blue-600 hover:text-blue-800 p-1"
                      title="Edit"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(template.id)}
                      className="text-red-600 hover:text-red-800 p-1"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded border border-gray-200">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{template.template_text}</p>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MessageTemplates;
