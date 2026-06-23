interface logoUploadPropsType {
  canUpload: boolean;
  loading: boolean;
  error: string | null;
  onOpenFilePicker: () => void;
  onFileSelected: (file: File) => void | Promise<void>;
}

export type { logoUploadPropsType };
