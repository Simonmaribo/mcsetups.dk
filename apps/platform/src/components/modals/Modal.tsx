import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { NiceModalHandler } from '@ebay/nice-modal-react';
import { DialogDescription } from '@radix-ui/react-dialog';

export default function Modal({ 
    modal,
    title,
    description,
    children,
    removeOnClose = true,
    className,
    closeable  = true
}: { 
    modal: NiceModalHandler,
    title?: React.ReactNode,
    description?: React.ReactNode,
    children?: React.ReactNode,
    removeOnClose?: boolean,
    className?: string,
    closeable?: boolean
}) {



    return (
        <Dialog
            open={modal.visible}
            onOpenChange={(value) => {
                if(!value) {
                    if(!closeable) return;
                    modal.hide();
                    if(removeOnClose) {
                        modal.remove();
                    }
                }
            }}
        >
            <DialogContent className={className} closeButton={closeable}>
                { (title || description) && (
                    <DialogHeader>
                        { title && <DialogTitle>{title}</DialogTitle> }
                        { description && <DialogDescription>{description}</DialogDescription> }
                    </DialogHeader>
                )}
                {children}
            </DialogContent>
        </Dialog>
    );
}