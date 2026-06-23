'use client';

import type { ComponentProps, ReactNode } from 'react';

import { cva, type VariantProps } from 'class-variance-authority';

import {
  Dialog,
  DialogClose,
  DialogContent,
  type DialogContentProps,
  DialogDescription,
  type DialogDescriptionProps,
  DialogFooter,
  type DialogFooterProps,
  DialogHeader,
  type DialogHeaderProps,
  DialogOverlay,
  type DialogOverlayProps,
  DialogPortal,
  DialogTitle,
  type DialogTitleProps,
  DialogTrigger,
} from '@shared';
import { SvgIcon } from '@atoms';

import { cn } from '@utils';

const dialogOverlayVariants = cva('fixed inset-0 z-50', {
  variants: {
    variant: {
      default: 'bg-black/50',
      light: 'bg-white/60',
      dark: 'bg-black/70',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

const dialogContentVariants = cva(
  'fixed top-[50%] left-[50%] z-50 flex flex-col overflow-hidden w-auto min-w-[320px] translate-x-[-50%] translate-y-[-50%] h-full max-h-[80dvh]',
  {
    variants: {
      variant: {
        default: 'rounded-[8px]',
      },
      size: {
        default: 'p-10 w-full max-w-[1044px]',
      },
      background: {
        default: 'bg-white',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      background: 'default',
    },
  },
);

const dialogHeaderVariants = cva('flex flex-col gap-2', {
  variants: {
    align: {
      left: 'text-left',
      center: 'text-center',
    },
  },
  defaultVariants: {
    align: 'left',
  },
});

const dialogFooterVariants = cva('flex gap-2', {
  variants: {
    align: {
      end: 'flex-col-reverse sm:flex-row sm:justify-end',
      start: 'flex-col sm:flex-row sm:justify-start',
      between: 'flex-col-reverse sm:flex-row sm:justify-between',
    },
  },
  defaultVariants: {
    align: 'end',
  },
});

const dialogTitleVariants = cva('leading-none font-semibold', {
  variants: {
    size: {
      sm: 'text-base',
      default: 'text-lg',
      lg: 'text-xl',
    },
  },
  defaultVariants: {
    size: 'default',
  },
});

const dialogDescriptionVariants = cva('text-sm', {
  variants: {
    variant: {
      default: 'text-gray-30',
      muted: 'text-gray-20',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

const dialogCloseVariants = cva(
  'absolute bg-white rounded-full z-50 cursor-pointer transition-opacity focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'flex items-center justify-center opacity-70 hover:opacity-100',
        ghost: 'opacity-100 hover:bg-gray-100',
        muted: 'text-gray-30 hover:text-default',
      },
      position: {
        'top-right': 'top-5 right-5',
        'top-left': 'top-5 left-5',
        inside: 'top-5 right-5',
      },
      size: {
        default: "[&_svg:not([class*='size-'])]:size-4 p-2",
      },
    },
    defaultVariants: {
      variant: 'default',
      position: 'top-right',
      size: 'default',
    },
  },
);

type AtomDialogCloseButtonProps = ComponentProps<typeof DialogClose> &
  VariantProps<typeof dialogCloseVariants> & {
    label?: string;
    icon?: ReactNode;
    className?: string;
  };

const AtomDialogCloseButton = ({ className, variant, position, size, label = 'Close', icon, ...props }: AtomDialogCloseButtonProps) => {
  return (
    <DialogClose className={cn(dialogCloseVariants({ variant, position, size }), className)} {...props}>
      {icon ?? <SvgIcon name="close" />}
      <span className="sr-only">{label}</span>
    </DialogClose>
  );
};

type AtomDialogOverlayProps = DialogOverlayProps & VariantProps<typeof dialogOverlayVariants>;

const AtomDialogOverlay = ({ className, variant, ...props }: AtomDialogOverlayProps) => {
  return <DialogOverlay className={cn(dialogOverlayVariants({ variant }), className)} {...props} />;
};

type AtomDialogContentProps = DialogContentProps &
  VariantProps<typeof dialogContentVariants> & {
    showCloseButton?: boolean;
    closeButtonVariant?: VariantProps<typeof dialogCloseVariants>['variant'];
    closeButtonPosition?: VariantProps<typeof dialogCloseVariants>['position'];
    closeButtonSize?: VariantProps<typeof dialogCloseVariants>['size'];
    closeButtonClassName?: string;
    closeButtonLabel?: string;
    closeButtonIcon?: ReactNode;
    className?: string;
  };

const AtomDialogContent = ({
  className,
  children,
  variant,
  size,
  background,
  showCloseButton = true,
  closeButtonVariant,
  closeButtonPosition,
  closeButtonSize,
  closeButtonClassName,
  closeButtonLabel,
  closeButtonIcon,
  ...props
}: AtomDialogContentProps) => {
  return (
    <DialogPortal>
      <AtomDialogOverlay />
      <DialogContent className={cn(dialogContentVariants({ variant, size, background }), className)} {...props}>
        {children}
        {showCloseButton && (
          <AtomDialogCloseButton
            variant={closeButtonVariant}
            position={closeButtonPosition}
            size={closeButtonSize}
            className={closeButtonClassName}
            label={closeButtonLabel}
            icon={closeButtonIcon}
          />
        )}
      </DialogContent>
    </DialogPortal>
  );
};

type AtomDialogHeaderProps = DialogHeaderProps & VariantProps<typeof dialogHeaderVariants>;

const AtomDialogHeader = ({ className, align, ...props }: AtomDialogHeaderProps) => {
  return <DialogHeader className={cn(dialogHeaderVariants({ align }), className)} {...props} />;
};

type AtomDialogFooterProps = DialogFooterProps & VariantProps<typeof dialogFooterVariants>;

const AtomDialogFooter = ({ className, align, ...props }: AtomDialogFooterProps) => {
  return <DialogFooter className={cn(dialogFooterVariants({ align }), className)} {...props} />;
};

type AtomDialogTitleProps = DialogTitleProps &
  VariantProps<typeof dialogTitleVariants> & {
    visuallyHidden?: boolean;
  };

const AtomDialogTitle = ({ className, size, visuallyHidden, ...props }: AtomDialogTitleProps) => {
  return <DialogTitle className={cn(dialogTitleVariants({ size }), visuallyHidden && 'sr-only', className)} {...props} />;
};

type AtomDialogDescriptionProps = DialogDescriptionProps & VariantProps<typeof dialogDescriptionVariants>;

const AtomDialogDescription = ({ className, variant, ...props }: AtomDialogDescriptionProps) => {
  return <DialogDescription className={cn(dialogDescriptionVariants({ variant }), className)} {...props} />;
};

export {
  Dialog as AtomDialog,
  DialogTrigger as AtomDialogTrigger,
  DialogClose as AtomDialogClose,
  AtomDialogCloseButton,
  AtomDialogContent,
  AtomDialogHeader,
  AtomDialogFooter,
  AtomDialogTitle,
  AtomDialogDescription,
  dialogCloseVariants,
  dialogContentVariants,
  dialogOverlayVariants,
};
