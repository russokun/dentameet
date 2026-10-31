import {
	Toast,
	ToastClose,
	ToastDescription,
	ToastProvider,
	ToastTitle,
	ToastViewport,
} from '@/components/ui/toast';
import { useToast } from '@/components/ui/use-toast';
import SuccessCheck from '@/components/ui/SuccessCheck';
import { AlertCircle } from 'lucide-react';
import React from 'react';

export function Toaster() {
	const { toasts } = useToast();

	return (
		<ToastProvider swipeDirection="down" duration={4500}>
			{toasts.map(({ id, title, description, action, variant, ...props }) => {
				return (
					<Toast key={id} variant={variant} {...props}>
						{variant === 'success' && <SuccessCheck className="h-7 w-7 shrink-0" />}
						{variant === 'destructive' && <AlertCircle className="h-6 w-6 shrink-0 text-rose-100" aria-hidden="true" />}
						<div className="grid gap-0.5 pt-0.5">
							{title && <ToastTitle>{title}</ToastTitle>}
							{description && (
								<ToastDescription>{description}</ToastDescription>
							)}
						</div>
						{action}
						<ToastClose />
					</Toast>
				);
			})}
			<ToastViewport />
		</ToastProvider>
	);
}
