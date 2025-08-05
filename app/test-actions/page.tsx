'use client';

import { useState } from 'react';
import { Edit, Eye, Trash2, Star, Package, Download, Share, Settings } from 'lucide-react';
import ActionButton from '@/components/ui/ActionButton';
import ActionButtonGroup from '@/components/ui/ActionButtonGroup';
import TableRowActions from '@/components/ui/TableRowActions';

export default function TestActionsPage() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleAction = (action: string) => {
    setLoading(action);
    setTimeout(() => setLoading(null), 2000);
    console.log(`Action: ${action}`);
  };

  return (
    <div className="min-h-screen pt-20 md:pt-24 bg-black text-white p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        <div>
          <h1 className="text-3xl font-bold text-gold mb-2">Action Button Components Test</h1>
          <p className="text-gray-400">Testing improved dashboard action buttons with responsive design and accessibility</p>
        </div>

        {/* Individual Action Buttons */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gold">Individual Action Buttons</h2>
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Button Variants</h3>
            <div className="flex flex-wrap gap-4">
              <ActionButton variant="primary" icon={Star}>Primary</ActionButton>
              <ActionButton variant="secondary" icon={Edit}>Secondary</ActionButton>
              <ActionButton variant="danger" icon={Trash2}>Danger</ActionButton>
              <ActionButton variant="ghost" icon={Eye}>Ghost</ActionButton>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Button Sizes</h3>
            <div className="flex flex-wrap items-center gap-4">
              <ActionButton size="sm" icon={Edit}>Small</ActionButton>
              <ActionButton size="md" icon={Edit}>Medium</ActionButton>
              <ActionButton size="lg" icon={Edit}>Large</ActionButton>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Icon-Only Buttons</h3>
            <div className="flex flex-wrap gap-4">
              <ActionButton size="sm" icon={Eye} tooltip="View" />
              <ActionButton size="md" icon={Edit} tooltip="Edit" />
              <ActionButton size="lg" icon={Trash2} variant="danger" tooltip="Delete" />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Loading States</h3>
            <div className="flex flex-wrap gap-4">
              <ActionButton 
                icon={Download} 
                loading={loading === 'download'} 
                onClick={() => handleAction('download')}
              >
                Download
              </ActionButton>
              <ActionButton 
                icon={Share} 
                variant="secondary"
                loading={loading === 'share'} 
                onClick={() => handleAction('share')}
              >
                Share
              </ActionButton>
            </div>
          </div>
        </section>

        {/* Action Button Groups */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gold">Action Button Groups</h2>
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Group</h3>
            <ActionButtonGroup
              primaryActions={[
                { label: 'View', icon: Eye, onClick: () => handleAction('view') },
                { label: 'Edit', icon: Edit, onClick: () => handleAction('edit') }
              ]}
              secondaryActions={[
                { label: 'Download', icon: Download, onClick: () => handleAction('download') },
                { label: 'Share', icon: Share, onClick: () => handleAction('share') },
                { label: '', onClick: () => {}, separator: true },
                { label: 'Delete', icon: Trash2, onClick: () => handleAction('delete'), variant: 'danger' }
              ]}
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Mobile Responsive Group</h3>
            <ActionButtonGroup
              primaryActions={[
                { label: 'View', icon: Eye, onClick: () => handleAction('view') },
                { label: 'Edit', icon: Edit, onClick: () => handleAction('edit') },
                { label: 'Settings', icon: Settings, onClick: () => handleAction('settings') }
              ]}
              secondaryActions={[
                { label: 'Download', icon: Download, onClick: () => handleAction('download') },
                { label: 'Share', icon: Share, onClick: () => handleAction('share') },
                { label: '', onClick: () => {}, separator: true },
                { label: 'Delete', icon: Trash2, onClick: () => handleAction('delete'), variant: 'danger' }
              ]}
              mobileCollapse={true}
            />
          </div>
        </section>

        {/* Table Row Actions */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gold">Table Row Actions</h2>
          
          <div className="bg-charcoal rounded-lg border border-gold/20 overflow-hidden">
            <table className="w-full">
              <thead className="bg-black/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Product</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Price</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold/20">
                <tr className="hover:bg-gold/5">
                  <td className="px-6 py-4 text-sm font-medium text-white">Sample Product 1</td>
                  <td className="px-6 py-4 text-sm text-gray-300">$29.99</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/20 text-green-400 border border-green-500/20">
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <TableRowActions
                      viewHref="/product/sample-1"
                      editHref="/admin/products/1/edit"
                      onToggleFeatured={() => handleAction('toggle-featured')}
                      onToggleStatus={() => handleAction('toggle-status')}
                      onDelete={() => handleAction('delete')}
                      isFeatured={true}
                      isActive={true}
                      size="sm"
                    />
                  </td>
                </tr>
                <tr className="hover:bg-gold/5">
                  <td className="px-6 py-4 text-sm font-medium text-white">Sample Product 2</td>
                  <td className="px-6 py-4 text-sm text-gray-300">$49.99</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-900/20 text-gray-400 border border-gray-500/20">
                      Inactive
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <TableRowActions
                      viewHref="/product/sample-2"
                      editHref="/admin/products/2/edit"
                      onToggleFeatured={() => handleAction('toggle-featured')}
                      onToggleStatus={() => handleAction('toggle-status')}
                      onDelete={() => handleAction('delete')}
                      isFeatured={false}
                      isActive={false}
                      size="sm"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Mobile Testing Instructions */}
        <section className="bg-charcoal rounded-lg border border-gold/20 p-6">
          <h2 className="text-xl font-semibold text-gold mb-4">Mobile Testing Instructions</h2>
          <div className="space-y-2 text-gray-300">
            <p>• Resize your browser window to test responsive behavior</p>
            <p>• On mobile screens (&lt;640px), action groups will collapse to show fewer primary actions</p>
            <p>• Touch targets are automatically enlarged to 44px minimum on mobile devices</p>
            <p>• Test keyboard navigation using Tab and Enter keys</p>
            <p>• Hover states are optimized for both mouse and touch interactions</p>
          </div>
        </section>
      </div>
    </div>
  );
}
