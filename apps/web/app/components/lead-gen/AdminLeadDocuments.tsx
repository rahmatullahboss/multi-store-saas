/**
 * Admin Lead Documents Component
 * Allows admins to view, upload, and delete documents for a student/lead
 */
import { useState } from 'react';
import { useFetcher, useRevalidator } from '@remix-run/react';
import { FileText, Trash2, Plus, Loader2, Paperclip, ExternalLink } from 'lucide-react';
import { LeadGenFileUpload } from './LeadGenFileUpload';

interface Document {
  id: number;
  fileUrl: string;
  fileName: string;
  documentType: string | null;
  createdAt: string | Date | null;
  fileType?: string;
}

interface AdminLeadDocumentsProps {
  documents: Document[];
  customerId?: number; // Needed for upload
  storeId?: number;
  readOnly?: boolean;
}

export function AdminLeadDocuments({ 
  documents, 
  customerId, 
  readOnly = false 
}: AdminLeadDocumentsProps) {
  const [isUploading, setIsUploading] = useState(false);
  const revalidator = useRevalidator();
  const deleteFetcher = useFetcher();

  const handleUploadSuccess = () => {
    setIsUploading(false);
    revalidator.revalidate();
  };

  const handleDelete = (documentId: number) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    
    deleteFetcher.submit(
      { documentId: documentId.toString() },
      { method: 'DELETE', action: '/api/admin/student-document' }
    );
  };

  const isDeleting = deleteFetcher.state === 'submitting';

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="bg-indigo-50/50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Paperclip className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-bold text-gray-900">Documents</h2>
          <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded-full font-medium">
            {documents.length}
          </span>
        </div>
        
        {!readOnly && customerId && (
          <button
            onClick={() => setIsUploading(!isUploading)}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1.5"
          >
            {isUploading ? (
              <>Cancel</>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Add Document
              </>
            )}
          </button>
        )}
      </div>

      <div className="p-6">
        {/* Upload Area */}
        {isUploading && customerId ? (
          <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-dashed border-gray-300">
             <div className="mb-3 flex justify-between items-center">
                <h3 className="text-sm font-medium text-gray-900">Upload New Document</h3>
             </div>
             <LeadGenFileUpload
               name="admin-upload"
               label="Select File (PDF or Image)"
               uploadEndpoint="/api/admin/student-document"
               extraFormData={{ customerId: customerId.toString(), documentType: 'admin-upload' }}
               onUploadSuccess={handleUploadSuccess}
               resetAfterUpload={true}
               primaryColor="#4F46E5"
             />
          </div>
        ) : null}

        {/* Document List */}
        {documents.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm bg-gray-50 rounded-lg border border-dashed border-gray-200">
            <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p>No documents found for this user.</p>
            {customerId && !readOnly && (
               <button 
                 onClick={() => setIsUploading(true)}
                 className="mt-2 text-indigo-600 hover:text-indigo-700 font-medium"
               >
                 Upload one now
               </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="group flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0 text-indigo-600">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate" title={doc.fileName}>
                      {doc.fileName}
                    </p>
                    <p className="text-xs text-gray-500 flex items-center gap-1.5">
                      <span className="capitalize">{doc.documentType?.replace('-', ' ') || 'Document'}</span>
                      <span className="w-1 h-1 rounded-full bg-gray-300" />
                      {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : 'Unknown date'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 flex-shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="View Document"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  
                  {!readOnly && (
                    <button
                      onClick={() => handleDelete(doc.id)}
                      disabled={isDeleting}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Document"
                    >
                      {isDeleting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
