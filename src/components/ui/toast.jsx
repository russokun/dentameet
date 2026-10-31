import { cn } from '@/lib/utils';
import * as ToastPrimitives from '@radix-ui/react-toast';
import { cva } from 'class-variance-authority';
import { X } from 'lucide-react';
import React from 'react';

const ToastProvider = ToastPrimitives.Provider;

// Abajo y al centro en móvil (sobre la barra de navegación), abajo a la derecha en escritorio
const ToastViewport = React.forwardRef(({ className, ...props }, ref) => (
	<ToastPrimitives.Viewport
		ref={ref}
		className={cn(
			'fixed z-[200] flex max-h-screen w-full flex-col gap-2 p-4 bottom-[calc(64px+env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 sm:max-w-[420px] lg:bottom-0 lg:left-auto lg:right-0 lg:translate-x-0',
			className,
		)}
		{...props}
	/>
));
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

const toastVariants = cva(
	'toast-motion group pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden rounded-3xl p-4 pr-12 text-white data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)]',
	{
		variants: {
			variant: {
				default: 'bg-slate-950',
				success: 'bg-slate-950',
				destructive: 'destructive bg-rose-700',
			},
		},
		defaultVariants: {
			variant: 'default',
		},
	},
);

const Toast = React.forwardRef(({ className, variant, ...props }, ref) => {
	return (
		<ToastPrimitives.Root
			ref={ref}
			className={cn(toastVariants({ variant }), className)}
			style={{ boxShadow: '0 18px 40px -16px rgb(2 6 23 / 0.6)' }}
			{...props}
		/>
	);
});
Toast.displayName = ToastPrimitives.Root.displayName;

const ToastAction = React.forwardRef(({ className, ...props }, ref) => (
	<ToastPrimitives.Action
		ref={ref}
		className={cn(
			'inline-flex min-h-[36px] shrink-0 items-center justify-center rounded-full bg-white/10 px-3 text-sm font-bold text-white transition-colors hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50',
			className,
		)}
		{...props}
	/>
));
ToastAction.displayName = ToastPrimitives.Action.displayName;

const ToastClose = React.forwardRef(({ className, ...props }, ref) => (
	<ToastPrimitives.Close
		ref={ref}
		aria-label="Cerrar aviso"
		className={cn(
			'absolute right-2 top-2 inline-flex h-9 w-9 items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50',
			className,
		)}
		{...props}
	>
		<X className="h-4 w-4" aria-hidden="true" />
	</ToastPrimitives.Close>
));
ToastClose.displayName = ToastPrimitives.Close.displayName;

const ToastTitle = React.forwardRef(({ className, ...props }, ref) => (
	<ToastPrimitives.Title
		ref={ref}
		className={cn('text-sm font-bold leading-snug', className)}
		{...props}
	/>
));
ToastTitle.displayName = ToastPrimitives.Title.displayName;

const ToastDescription = React.forwardRef(({ className, ...props }, ref) => (
	<ToastPrimitives.Description
		ref={ref}
		className={cn('text-sm leading-snug text-white/80', className)}
		{...props}
	/>
));
ToastDescription.displayName = ToastPrimitives.Description.displayName;

export {
	Toast,
	ToastAction,
	ToastClose,
	ToastDescription,
	ToastProvider,
	ToastTitle,
	ToastViewport,
};
