'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { AtomDialog, AtomDialogContent, AtomDialogDescription, AtomDialogTitle, AtomInput, Box, Button, Flex, SvgIcon, Text } from '@atoms';
import { useShareDialog } from '@store';
import { cn } from '@utils';

const COPIED_RESET_DELAY_MS = 2000;

type copyStatusType = 'idle' | 'copied' | 'error';

const copyFromInput = (input: HTMLInputElement): boolean => {
  const previousActive = document.activeElement instanceof HTMLElement ? document.activeElement : null;

  input.focus({ preventScroll: true });
  input.select();
  input.setSelectionRange(0, input.value.length);

  let didCopy = false;

  try {
    didCopy = document.execCommand('copy');
  } catch {
    didCopy = false;
  }

  if (!didCopy && previousActive && previousActive !== input) {
    previousActive.focus({ preventScroll: true });
  }

  return didCopy;
};

const copyWithExecCommand = (text: string): boolean => {
  const textarea = document.createElement('textarea');

  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.top = '0';
  textarea.style.left = '0';
  textarea.style.opacity = '0';

  document.body.appendChild(textarea);
  textarea.focus({ preventScroll: true });
  textarea.select();
  textarea.setSelectionRange(0, textarea.value.length);

  let didCopy = false;

  try {
    didCopy = document.execCommand('copy');
  } catch {
    didCopy = false;
  }

  textarea.remove();

  return didCopy;
};

const copyToClipboard = async (text: string, input: HTMLInputElement | null): Promise<boolean> => {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // The Clipboard API rejects inside a cross-origin iframe that lacks `allow="clipboard-write"`,
      // so fall through to the selection-based copy that still works there.
    }
  }

  if (input && copyFromInput(input)) {
    return true;
  }

  return copyWithExecCommand(text);
};

const ModalShare = () => {
  const isOpen = useShareDialog((state) => state.isOpen);
  const setIsOpen = useShareDialog((state) => state.setIsOpen);
  const status = useShareDialog((state) => state.status);
  const shareUrl = useShareDialog((state) => state.shareUrl);

  const [copyStatus, setCopyStatus] = useState<copyStatusType>('idle');
  const copiedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(
    () => () => {
      if (copiedTimeoutRef.current) clearTimeout(copiedTimeoutRef.current);
    },
    [],
  );

  const handleOpenChange = useCallback(
    (nextIsOpen: boolean) => {
      if (!nextIsOpen) {
        if (copiedTimeoutRef.current) clearTimeout(copiedTimeoutRef.current);
        setCopyStatus('idle');
      }

      setIsOpen(nextIsOpen);
    },
    [setIsOpen],
  );

  const handleCopy = useCallback(async () => {
    if (!shareUrl) return;

    const didCopy = await copyToClipboard(shareUrl, inputRef.current);

    if (!didCopy) {
      inputRef.current?.select();
    }

    setCopyStatus(didCopy ? 'copied' : 'error');

    if (copiedTimeoutRef.current) clearTimeout(copiedTimeoutRef.current);
    copiedTimeoutRef.current = setTimeout(() => setCopyStatus('idle'), COPIED_RESET_DELAY_MS);
  }, [shareUrl]);

  const handleSelectAll = useCallback((event: React.FocusEvent<HTMLInputElement>) => {
    event.currentTarget.select();
  }, []);

  return (
    <AtomDialog open={isOpen} onOpenChange={handleOpenChange}>
      <AtomDialogContent
        aria-label="Condividi configurazione"
        className="h-auto w-full max-w-140 gap-0 overflow-visible max-sm:min-w-0 max-sm:max-w-[calc(100%-32px)] max-sm:p-5"
        closeButtonClassName="max-sm:top-4 max-sm:right-4"
      >
        <AtomDialogTitle className="pr-10 text-[24px] leading-[1.2] font-semibold max-sm:pr-8 max-sm:text-[20px]">
          Condividi la tua configurazione
        </AtomDialogTitle>
        <AtomDialogDescription className="mt-2 w-full text-gray-30">
          Chiunque abbia questo link potrà aprire e visualizzare la configurazione che hai creato.
        </AtomDialogDescription>

        <Box className="mt-3 w-full min-w-0">
          {status === 'pending' && (
            <Flex className="w-full items-center justify-start gap-3">
              <Box className="size-4 shrink-0 animate-spin rounded-full border-2 border-gray-30 border-t-transparent" aria-hidden />
              <Text>Creazione del link in corso…</Text>
            </Flex>
          )}

          {status === 'error' && <Text className="text-destructive">Non è stato possibile creare il link. Chiudi la finestra e riprova.</Text>}

          {status === 'ready' && shareUrl && (
            <Box className="w-full min-w-0">
              <Flex variant="share_dialog_row">
                <AtomInput
                  ref={inputRef}
                  variant="checkout"
                  className="box-border h-12 min-h-12 w-full min-w-0 flex-1 px-4 text-sm"
                  value={shareUrl}
                  readOnly
                  onFocus={handleSelectAll}
                  aria-label="Link di condivisione"
                />
                <Box className="relative shrink-0 sm:w-auto">
                  {copyStatus !== 'idle' && (
                    <Box
                      role="status"
                      aria-live="polite"
                      className={cn(
                        'pointer-events-none absolute bottom-[calc(100%+8px)] left-1/2 z-50 -translate-x-1/2',
                        'animate-in fade-in-0 zoom-in-95 duration-150',
                      )}
                    >
                      <Box
                        className={cn(
                          'relative rounded-md px-3 py-1.5 text-xs font-medium whitespace-nowrap text-white shadow-md',
                          copyStatus === 'copied' ? 'bg-black' : 'bg-error',
                        )}
                      >
                        {copyStatus === 'copied' ? 'Link copiato!' : 'Copia non riuscita, premi Ctrl+C'}
                        <Box
                          className={cn(
                            'absolute -bottom-1 left-1/2 size-2.5 -translate-x-1/2 -translate-y-px rotate-45 rounded-xs',
                            copyStatus === 'copied' ? 'bg-black' : 'bg-error',
                          )}
                        />
                      </Box>
                    </Box>
                  )}
                  <Button
                    type="button"
                    variant="primary"
                    onClick={handleCopy}
                    className="box-border h-12 min-h-12 w-full shrink-0 rounded-lg px-4 py-0 text-sm leading-4 sm:w-auto"
                  >
                    <SvgIcon name="share" />
                    {copyStatus === 'copied' ? 'Copiato' : 'Copia link'}
                  </Button>
                </Box>
              </Flex>
              <Text className="mt-2 text-xs text-gray-30">Salva il link e continua il tuo progetto quando vuoi!</Text>
            </Box>
          )}
        </Box>
      </AtomDialogContent>
    </AtomDialog>
  );
};

export { ModalShare };
