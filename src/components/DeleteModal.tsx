import { AlertTriangle, Loader2 } from 'lucide-react';

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
  conditionName?: string;
}

export default function DeleteModal({ isOpen, onClose, onConfirm, isDeleting, conditionName }: DeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#111118] border border-white/10 rounded-2xl max-w-sm w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-rose-500/15 border border-rose-500/20 text-rose-400 mb-4 mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <h3 className="text-lg font-bold text-center text-slate-100 mb-2">Delete Analysis Record?</h3>
        
        <p className="text-xs text-center text-white/60 mb-6 leading-relaxed">
          Are you sure you want to delete your scan for <strong className="text-rose-450">{conditionName || 'this condition'}</strong>? 
          This action will permanently erase this diagnostic report from your file history and cannot be undone.
        </p>

        <div className="flex gap-3 justify-end">
          <button
            type="button"
            disabled={isDeleting}
            onClick={onClose}
            className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/25 text-white/80 font-bold py-2.5 px-4 rounded-xl text-xs transition duration-150 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isDeleting}
            onClick={onConfirm}
            className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition duration-150 flex items-center justify-center gap-1 disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete Record'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
